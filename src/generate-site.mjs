import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site, routes } from "./config.mjs";
import { machines, pipes, bitGroups, pumpRows, pumpCommon } from "./data/catalog.mjs";
import { tr } from "./content/tr.mjs";
import { en } from "./content/en.mjs";
import { ar } from "./content/ar.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const locales = { tr, en, ar };
const pageKeys = [
  "home",
  "about",
  "services",
  "water",
  "geothermal",
  "geotechnical",
  "mineral",
  "equipment",
  "rigs",
  "pipes",
  "bits",
  "references",
  "contact",
];

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function originUrl(path) {
  return `${site.origin}${path}`;
}

function fileFor(path) {
  if (path === "/") return join(dist, "index.html");
  return join(dist, path.replace(/^\//, ""), "index.html");
}

function mailto(copy) {
  return `mailto:${site.email}?subject=${encodeURIComponent(copy.mail.subject)}&body=${encodeURIComponent(copy.mail.body)}`;
}

function whatsapp(copy) {
  return `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(copy.wa)}`;
}

function hreflangLinks(pageKey) {
  return [
    `<link rel="alternate" hreflang="tr-TR" href="${esc(originUrl(routes.tr[pageKey]))}" />`,
    `<link rel="alternate" hreflang="en" href="${esc(originUrl(routes.en[pageKey]))}" />`,
    `<link rel="alternate" hreflang="ar" href="${esc(originUrl(routes.ar[pageKey]))}" />`,
    `<link rel="alternate" hreflang="x-default" href="${esc(originUrl(routes.en[pageKey]))}" />`,
  ].join("\n  ");
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function organizationLd() {
  return {
    "@type": "Organization",
    "@id": `${site.origin}/#organization`,
    name: site.name,
    url: site.origin,
    email: site.email,
    telephone: site.telHref.replace("tel:", ""),
    logo: `${site.origin}/assets/logo.svg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.locality,
      addressRegion: site.address.region,
      addressCountry: site.address.country,
    },
  };
}

function breadcrumbsLd(items) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: originUrl(item.path),
    })),
  };
}

function navLinks(lang, current) {
  const r = routes[lang];
  const copy = locales[lang];
  return [
    ["about", r.about, copy.nav.about],
    ["services", r.services, copy.nav.services],
    ["equipment", r.equipment, copy.nav.equipment],
    ["references", r.references, copy.nav.references],
    ["contact", r.contact, copy.nav.contact],
  ]
    .map(([key, href, label]) => {
      const currentAttr = current === key ? ' aria-current="page"' : "";
      return `<a href="${href}"${currentAttr}>${esc(label)}</a>`;
    })
    .join("");
}

function langSwitch(pageKey, lang) {
  return ["tr", "en", "ar"]
    .map((code) => {
      const current = code === lang ? ' aria-current="page"' : "";
      const label = code === "ar" ? "AR" : code.toUpperCase();
      return `<a href="${routes[code][pageKey]}" hreflang="${code === "tr" ? "tr-TR" : code}"${current}>${label}</a>`;
    })
    .join("");
}

function crumbsHtml(lang, items) {
  const home = `<a href="${routes[lang].home}">${esc(locales[lang].crumbs.home)}</a>`;
  const rest = items
    .map((item, index) => {
      const last = index === items.length - 1;
      return last ? `<span>${esc(item.name)}</span>` : `<a href="${item.path}">${esc(item.name)}</a>`;
    })
    .join(" / ");
  return `<nav class="breadcrumbs" aria-label="Breadcrumb">${home}${items.length ? " / " : ""}${rest}</nav>`;
}

function section(index, title, inner) {
  return `<div class="section">
    <p class="section-index">${esc(index)}</p>
    <div>
      <h2>${esc(title)}</h2>
      ${inner}
    </div>
  </div>`;
}

function machineCard(machine, copy, lang) {
  const carrier = machine.carrier === "trailer" ? copy.common.trailer : copy.common.truck;
  if (machine.special) {
    const facts = machine.facts[lang] || machine.facts.tr;
    return `<article class="card">
      <p class="kicker">${esc(carrier)} · ${esc(machine.depth)}</p>
      <h3>${esc(machine.depth)}</h3>
      <ul>${facts.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
    </article>`;
  }
  const mud =
    machine.mud === true ? copy.common.mudYes : machine.mud === "optional" ? copy.common.mudOpt : "";
  return `<article class="card">
    <p class="kicker">${esc(carrier)}</p>
    <h3>${esc(machine.depth)}</h3>
    <dl class="spec">
      <div><dt>${esc(copy.common.hp)}</dt><dd>${esc(machine.hp)}</dd></div>
      ${machine.mast ? `<div><dt>${esc(copy.common.mast)}</dt><dd>${esc(machine.mast)}</dd></div>` : ""}
      <div><dt>${esc(copy.common.draw)}</dt><dd>${esc(machine.drawworks)}</dd></div>
    </dl>
    <p>${esc(mud)}</p>
    <p>${esc(copy.common.systems)}</p>
  </article>`;
}

function layout({ lang, pageKey, title, description, extraHead = "", schema = [], main }) {
  const copy = locales[lang];
  const path = routes[lang][pageKey];
  const canonical = originUrl(path);
  const navCurrent = ["about", "services", "equipment", "references", "contact"].includes(pageKey)
    ? pageKey
    : ["water", "geothermal", "geotechnical", "mineral"].includes(pageKey)
      ? "services"
      : ["rigs", "pipes", "bits"].includes(pageKey)
        ? "equipment"
        : "";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      organizationLd(),
      {
        "@type": "WebSite",
        "@id": `${site.origin}/#website`,
        name: site.name,
        url: site.origin,
        inLanguage: ["tr", "en", "ar"],
        publisher: { "@id": `${site.origin}/#organization` },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${site.origin}/#local`,
        name: site.name,
        url: site.origin,
        email: site.email,
        telephone: site.telHref.replace("tel:", ""),
        address: organizationLd().address,
        parentOrganization: { "@id": `${site.origin}/#organization` },
      },
      ...schema,
    ],
  };

  return `<!DOCTYPE html>
<html lang="${copy.meta.lang}" dir="${copy.meta.dir}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <link rel="canonical" href="${esc(canonical)}" />
  ${hreflangLinks(pageKey)}
  <meta property="og:type" content="website" />
  <meta property="og:locale" content="${copy.meta.ogLocale}" />
  <meta property="og:site_name" content="${esc(site.name)}" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:url" content="${esc(canonical)}" />
  <meta property="og:image" content="${esc(originUrl("/assets/logo.svg"))}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(originUrl("/assets/logo.svg"))}" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/site.css" />
  ${extraHead}
  ${jsonLd(graph)}
</head>
<body>
  <a class="skip" href="#main">${esc(copy.skip)}</a>
  <header class="site-header">
    <div class="wrap">
      <div class="header-row">
        <a class="brand" href="${routes[lang].home}">
          <img class="mark" src="/assets/logo.svg" width="42" height="42" alt="${esc(site.name)}" />
          <span class="wordmark">${esc(site.name)}<small>${esc(copy.brandSub)}</small></span>
        </a>
        <div class="header-actions">
          <nav class="lang" aria-label="Language">${langSwitch(pageKey, lang)}</nav>
          <a class="btn btn-wa header-cta" href="${whatsapp(copy)}">${esc(copy.cta.whatsapp)}</a>
          <button class="menu-btn" id="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-panel" aria-label="Menu">☰</button>
        </div>
      </div>
      <div class="nav-row">
        <nav class="primary">${navLinks(lang, navCurrent)}</nav>
      </div>
      <div class="mobile-panel" id="mobile-panel">
        ${navLinks(lang, navCurrent)}
        <a href="${whatsapp(copy)}">${esc(copy.cta.whatsapp)}</a>
      </div>
    </div>
  </header>
  <main id="main">${main}</main>
  <section class="close-cta">
    <div class="wrap">
      <h2>${esc(copy.cta.quote)}</h2>
      <p>${esc(site.address.display)}</p>
      <div class="cta-row">
        <a class="btn btn-wa" href="${whatsapp(copy)}">${esc(copy.cta.whatsapp)} ${esc(site.phone)}</a>
        <a class="btn btn-ghost" href="${mailto(copy)}">${esc(site.email)}</a>
      </div>
    </div>
  </section>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div>
        <strong>${esc(site.name)}</strong>
        <p>${esc(copy.pages.home.lead)}</p>
      </div>
      <div>
        <h2>${esc(copy.footer.nap)}</h2>
        <p>${esc(site.address.display)}</p>
        <p><a href="${whatsapp(copy)}">${esc(copy.cta.whatsapp)} ${esc(site.phone)}</a><br /><a href="mailto:${site.email}">${esc(site.email)}</a></p>
      </div>
      <div>
        <h2>${esc(copy.nav.services)}</h2>
        <p><a href="${routes[lang].water}">${esc(copy.services.find((item) => item.key === "water").h)}</a><br />
        <a href="${routes[lang].geothermal}">${esc(copy.services.find((item) => item.key === "gt").h)}</a><br />
        <a href="${routes[lang].rigs}">${esc(copy.nav.equipment)}</a></p>
      </div>
      <div>
        <h2>${esc(copy.footer.explore)}</h2>
        <p><a href="${routes[lang].about}">${esc(copy.nav.about)}</a><br />
        <a href="${routes[lang].references}">${esc(copy.nav.references)}</a><br />
        <a href="${routes[lang].contact}">${esc(copy.nav.contact)}</a></p>
      </div>
    </div>
    <div class="wrap legal">${esc(copy.footer.legal)}</div>
  </footer>
  <a class="wa-float" href="${whatsapp(copy)}" aria-label="${esc(copy.cta.whatsapp)} ${esc(site.phone)}">
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true"><path fill="currentColor" d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-2.79 4.23c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81s.78 2.11.89 2.25c.11.15 1.51 2.42 3.73 3.3 1.85.73 2.22.59 2.62.55.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.15-.42-.27-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.15.21-.56.71-.69.86-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.21-.01-.33.1-.44.1-.1.22-.26.33-.39.11-.13.15-.21.22-.36.07-.14.04-.27-.02-.38-.06-.11-.49-1.17-.67-1.6-.17-.42-.35-.36-.49-.37z"/></svg>
  </a>
  <script src="/assets/site.js"></script>
</body>
</html>
`;
}

function pageHome(lang) {
  const copy = locales[lang];
  const p = copy.pages.home;
  const serviceCards = copy.services
    .map(
      (item) => `<article class="card">
      <h3>${esc(item.h)}</h3>
      <p>${esc(item.p)}</p>
      <a class="more" href="${routes[lang][item.href]}">${esc(copy.cta.more)}</a>
    </article>`
    )
    .join("");
  const why = p.why.map((item) => `<article class="card"><h3>${esc(item.h)}</h3><p>${esc(item.p)}</p></article>`).join("");
  const refs = copy.refs.map((item) => `<article class="ref-item"><p>${esc(item)}</p></article>`).join("");
  const faq = copy.faq
    .map((item) => `<details><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`)
    .join("");
  const metrics = p.metrics
    .map((item) => `<div class="metric"><div class="num">${esc(item.n)}</div><span>${esc(item.l)}</span></div>`)
    .join("");

  const main = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div>
        <p class="kicker">${esc(p.kicker)}</p>
        <h1>${esc(p.h1)}</h1>
        <p class="lead">${esc(p.lead)}</p>
        <p>${esc(p.proof)}</p>
        <div class="cta-row">
          <a class="btn btn-signal" href="${mailto(copy)}">${esc(copy.cta.quote)}</a>
          <a class="btn btn-ghost" href="${routes[lang].rigs}">${esc(copy.cta.rigs)}</a>
        </div>
      </div>
      <aside class="stat-card">
        <div class="num">250–3000 m</div>
        <p>${esc(p.proof)}</p>
      </aside>
    </div>
  </section>
  <section class="band"><div class="wrap metrics">${metrics}</div></section>
  <section class="block"><div class="wrap">${section("02", p.servicesTitle, `<p>${esc(p.servicesLead)}</p><div class="cards services">${serviceCards}</div>`)}</div></section>
  <section class="block"><div class="wrap">${section("03", p.equipTitle, `<div class="cards four">${machines.filter((m) => !m.special).slice(0, 4).map((m) => machineCard(m, copy, lang)).join("")}</div><p><a class="more" href="${routes[lang].rigs}">${esc(copy.cta.more)}</a></p>`)}</div></section>
  <section class="block"><div class="wrap">${section("04", p.whyTitle, `<div class="cards three">${why}</div>`)}</div></section>
  <section class="block"><div class="wrap">${section("05", p.refTitle, `<p>${esc(p.refLead)}</p><div class="list-cards">${refs}</div>`)}</div></section>
  <section class="block"><div class="wrap">${section("06", p.faqTitle, `<div class="faq">${faq}</div>`)}</div></section>`;

  return layout({
    lang,
    pageKey: "home",
    title: p.title,
    description: p.description,
    schema: [
      {
        "@type": "FAQPage",
        mainEntity: copy.faq.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      },
    ],
    main,
  });
}

function simplePage(lang, pageKey, extras = "") {
  const copy = locales[lang];
  const p = copy.pages[pageKey];
  const trail = extras;
  const main = `<section class="page-hero"><div class="wrap">
    ${crumbsHtml(lang, [{ name: p.h1, path: routes[lang][pageKey] }])}
    <p class="kicker">${esc(p.kicker)}</p>
    <h1>${esc(p.h1)}</h1>
    <p class="lead">${esc(p.lead)}</p>
    ${p.body ? p.body.map((para) => `<p>${esc(para)}</p>`).join("") : ""}
    ${p.proof ? `<p class="note">${esc(p.proof)}</p>` : ""}
    ${p.need ? `<p>${esc(p.need)}</p>` : ""}
    <div class="cta-row">
      <a class="btn btn-signal" href="${mailto(copy)}">${esc(copy.cta.quote)}</a>
      <a class="btn btn-ghost" href="${routes[lang].contact}">${esc(copy.nav.contact)}</a>
    </div>
  </div></section>${trail}`;
  return { p, main };
}

function pageAbout(lang) {
  const { p, main } = simplePage(lang, "about");
  return layout({ lang, pageKey: "about", title: p.title, description: p.description, main });
}

function pageServices(lang) {
  const copy = locales[lang];
  const cards = copy.services
    .map(
      (item) => `<article class="card"><h3>${esc(item.h)}</h3><p>${esc(item.p)}</p><a class="more" href="${routes[lang][item.href]}">${esc(copy.cta.more)}</a></article>`
    )
    .join("");
  const { p, main } = simplePage(
    lang,
    "services",
    `<section class="block"><div class="wrap"><div class="cards services">${cards}</div></div></section>`
  );
  return layout({
    lang,
    pageKey: "services",
    title: p.title,
    description: p.description,
    schema: [{ "@type": "Service", name: p.h1, provider: { "@id": `${site.origin}/#organization` }, areaServed: "TR" }],
    main,
  });
}

function serviceFocus(lang, pageKey) {
  const copy = locales[lang];
  const { p, main } = simplePage(lang, pageKey);
  return layout({
    lang,
    pageKey,
    title: p.title,
    description: p.description,
    schema: [
      breadcrumbsLd([
        { name: copy.nav.services, path: routes[lang].services },
        { name: p.h1, path: routes[lang][pageKey] },
      ]),
      { "@type": "Service", name: p.h1, description: p.description, provider: { "@id": `${site.origin}/#organization` } },
    ],
    main,
  });
}

function pageEquipment(lang) {
  const copy = locales[lang];
  const extra = `<section class="block"><div class="wrap"><div class="cards three">
    <article class="card"><h3>${esc(copy.pages.rigs.h1)}</h3><p>${esc(copy.pages.rigs.lead)}</p><a class="more" href="${routes[lang].rigs}">${esc(copy.cta.more)}</a></article>
    <article class="card"><h3>${esc(copy.pages.pipes.h1)}</h3><p>${esc(copy.pages.pipes.lead)}</p><a class="more" href="${routes[lang].pipes}">${esc(copy.cta.more)}</a></article>
    <article class="card"><h3>${esc(copy.pages.bits.h1)}</h3><p>${esc(copy.pages.bits.lead)}</p><a class="more" href="${routes[lang].bits}">${esc(copy.cta.more)}</a></article>
  </div>
  <div class="table-wrap" style="margin-top:1.5rem">
    <table>
      <caption class="kicker">Duplex 6"</caption>
      <thead><tr><th>Liner</th><th>Flow</th><th>bar / psi</th></tr></thead>
      <tbody>${pumpRows.map((row) => `<tr><td>${esc(row.liner)}</td><td>${esc(row.flow)}</td><td>${esc(row.pressure)}</td></tr>`).join("")}</tbody>
    </table>
  </div>
  <p>${esc(pumpCommon.stroke)} · ${esc(pumpCommon.weight)} · ${esc(pumpCommon.suction)} / ${esc(pumpCommon.discharge)}</p>
  </div></section>`;
  const { p, main } = simplePage(lang, "equipment", extra);
  return layout({
    lang,
    pageKey: "equipment",
    title: p.title,
    description: p.description,
    schema: [{ "@type": "ProductGroup", name: p.h1, brand: site.name }],
    main,
  });
}

function pageRigs(lang) {
  const copy = locales[lang];
  const extra = `<section class="block"><div class="wrap"><div class="cards four">${machines.map((item) => machineCard(item, copy, lang)).join("")}</div><p>${esc(copy.common.standards)}</p></div></section>`;
  const { p, main } = simplePage(lang, "rigs", extra);
  return layout({
    lang,
    pageKey: "rigs",
    title: p.title,
    description: p.description,
    schema: [
      breadcrumbsLd([
        { name: copy.nav.equipment, path: routes[lang].equipment },
        { name: p.h1, path: routes[lang].rigs },
      ]),
      { "@type": "ProductGroup", name: p.h1, brand: site.name },
    ],
    main,
  });
}

function pagePipes(lang) {
  const copy = locales[lang];
  const extra = `<section class="block"><div class="wrap"><div class="table-wrap"><table>
    <thead><tr><th>in</th><th>mm</th><th>m</th><th>Grade</th><th>in wall</th><th>mm wall</th></tr></thead>
    <tbody>${pipes.map((row) => `<tr><td>${esc(row.inch)}</td><td>${esc(row.od)}</td><td>${esc(row.length)}</td><td>${esc(row.grade)}</td><td>${esc(row.wallIn)}</td><td>${esc(row.wallMm)}</td></tr>`).join("")}</tbody>
  </table></div></div></section>`;
  const { p, main } = simplePage(lang, "pipes", extra);
  return layout({ lang, pageKey: "pipes", title: p.title, description: p.description, schema: [{ "@type": "ProductGroup", name: p.h1, brand: site.name }], main });
}

function pageBits(lang) {
  const copy = locales[lang];
  const cards = bitGroups
    .map(
      (item) => `<article class="card"><p class="kicker">${esc(item.codes)}</p><h3>${esc(item.formation[lang])}</h3><p>${esc(item.text[lang])}</p></article>`
    )
    .join("");
  const extra = `<section class="block"><div class="wrap"><div class="cards services">${cards}</div></div></section>`;
  const { p, main } = simplePage(lang, "bits", extra);
  return layout({ lang, pageKey: "bits", title: p.title, description: p.description, schema: [{ "@type": "ProductGroup", name: p.h1, brand: site.name }], main });
}

function pageReferences(lang) {
  const copy = locales[lang];
  const extra = `<section class="block"><div class="wrap"><div class="list-cards">${copy.refs.map((item) => `<article class="ref-item"><p>${esc(item)}</p></article>`).join("")}</div></div></section>`;
  const { p, main } = simplePage(lang, "references", extra);
  return layout({ lang, pageKey: "references", title: p.title, description: p.description, main });
}

function pageContact(lang) {
  const copy = locales[lang];
  const extra = `<section class="block"><div class="wrap"><div class="cards three">
    <article class="card"><h3>${esc(copy.cta.whatsapp)}</h3><p><a href="${whatsapp(copy)}">${esc(site.phone)}</a></p></article>
    <article class="card"><h3>${esc(copy.cta.email)}</h3><p><a href="${mailto(copy)}">${esc(site.email)}</a></p></article>
  </div>
  <p><a href="${site.mapSearch}">${esc(site.address.display)}</a></p>
  </div></section>`;
  const { p, main } = simplePage(lang, "contact", extra);
  return layout({ lang, pageKey: "contact", title: p.title, description: p.description, main });
}

function page404() {
  const copy = tr.pages.notFound;
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(copy.title)}</title>
  <meta name="description" content="${esc(copy.description)}" />
  <meta name="robots" content="noindex" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body>
  <main class="not-found wrap">
    <p class="kicker">404</p>
    <h1>${esc(copy.h1)}</h1>
    <p>${esc(copy.lead)}</p>
    <div class="cta-row">
      <a class="btn btn-signal" href="/">Türkçe</a>
      <a class="btn btn-ghost" href="/en/">English</a>
      <a class="btn btn-ghost" href="/ar/">العربية</a>
    </div>
  </main>
</body>
</html>`;
}

const renderers = {
  home: pageHome,
  about: pageAbout,
  services: pageServices,
  water: (lang) => serviceFocus(lang, "water"),
  geothermal: (lang) => serviceFocus(lang, "geothermal"),
  geotechnical: (lang) => serviceFocus(lang, "geotechnical"),
  mineral: (lang) => serviceFocus(lang, "mineral"),
  equipment: pageEquipment,
  rigs: pageRigs,
  pipes: pagePipes,
  bits: pageBits,
  references: pageReferences,
  contact: pageContact,
};

function write(path, contents) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function buildSitemap() {
  const urls = ["tr", "en", "ar"].flatMap((lang) =>
    pageKeys.map((key) => {
      const loc = originUrl(routes[lang][key]);
      return `  <url>
    <loc>${loc}</loc>
    <changefreq>weekly</changefreq>
    <xhtml:link rel="alternate" hreflang="tr-TR" href="${originUrl(routes.tr[key])}" />
    <xhtml:link rel="alternate" hreflang="en" href="${originUrl(routes.en[key])}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${originUrl(routes.ar[key])}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${originUrl(routes.en[key])}" />
  </url>`;
    })
  );
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join("\n")}
</urlset>
`;
}

function buildRoutes() {
  const list = ["tr", "en", "ar"].flatMap((lang) =>
    pageKeys.map((key) => ({
      path: routes[lang][key],
      file: routes[lang][key] === "/" ? "index.html" : `${routes[lang][key].replace(/^\//, "")}index.html`,
      lang,
      page: key,
    }))
  );
  list.push({ path: "/404.html", file: "404.html", indexable: false });
  return JSON.stringify({ routes: list }, null, 2);
}

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
mkdirSync(join(dist, "assets"), { recursive: true });
cpSync(join(root, "src/styles/site.css"), join(dist, "assets/site.css"));
cpSync(join(root, "src/js/site.js"), join(dist, "assets/site.js"));
cpSync(join(root, "src/assets/logo.svg"), join(dist, "assets/logo.svg"));
cpSync(join(root, "src/assets/favicon.svg"), join(dist, "assets/favicon.svg"));

for (const lang of ["tr", "en", "ar"]) {
  for (const key of pageKeys) {
    write(fileFor(routes[lang][key]), renderers[key](lang));
  }
}

write(join(dist, "404.html"), page404());
write(join(dist, "sitemap.xml"), buildSitemap());
write(
  join(dist, "robots.txt"),
  `User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: ${site.origin}/sitemap.xml\n`
);
write(join(dist, "manus-routes.json"), buildRoutes());
write(
  join(dist, "site.webmanifest"),
  JSON.stringify(
    {
      name: "KD SONDAJ",
      short_name: "KD SONDAJ",
      start_url: "/",
      display: "browser",
      background_color: "#F2F0EA",
      theme_color: "#F26A2E",
      lang: "tr",
      icons: [{ src: "/assets/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    },
    null,
    2
  )
);

console.log("Built KD SONDAJ static site into dist/");
