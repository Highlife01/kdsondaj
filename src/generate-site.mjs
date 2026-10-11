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

function getServiceIcon(key) {
  switch (key) {
    case "water":
    case "find":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
    case "gt":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
    case "oil":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 22 5-18h2l5 18"/><path d="M7 16h10"/><path d="M8.5 11h7"/><circle cx="12" cy="2" r="1"/></svg>`;
    case "mineral":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12l4 6-10 12L2 9z"/><path d="M11 3 8 9l4 12 4-12-3-6"/><path d="M2 9h20"/></svg>`;
    case "soil":
    case "geo":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>`;
    case "obs":
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m12 12 4-4"/><circle cx="12" cy="12" r="3"/></svg>`;
    default:
      return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
  }
}

function navLinks(lang, current) {
  const r = routes[lang];
  const copy = locales[lang];
  const isTr = lang === "tr";
  const isAr = lang === "ar";

  const isServicesActive = ["services", "water", "geothermal", "geotechnical", "mineral"].includes(current);
  const isEquipActive = ["equipment", "rigs", "pipes", "bits"].includes(current);

  return `
    <a class="nav-link" href="${r.home}"${current === "home" ? ' aria-current="page"' : ''}>${esc(copy.crumbs.home)}</a>
    <a class="nav-link" href="${r.about}"${current === "about" ? ' aria-current="page"' : ''}>${esc(copy.nav.about)}</a>
    
    <div class="nav-dropdown">
      <a class="nav-link nav-dropdown-trigger" href="${r.services}"${isServicesActive ? ' aria-current="page"' : ''}>
        ${esc(copy.nav.services)}
      </a>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-item" href="${r.water}">
          <span>${isTr ? "Su Sondajı" : isAr ? "حفر آبار المياه" : "Water Well Drilling"}</span>
          <small>250–1600m</small>
        </a>
        <a class="nav-dropdown-item" href="${r.geothermal}">
          <span>${isTr ? "Jeotermal Sondaj" : isAr ? "حفر الطاقة الحرارية" : "Geothermal Drilling"}</span>
          <small>1200–3000m</small>
        </a>
        <a class="nav-dropdown-item" href="${r.geotechnical}">
          <span>${isTr ? "Zemin & Geoteknik" : isAr ? "الجيوتقنية وفحص التربة" : "Geotechnical Survey"}</span>
          <small>300–600m</small>
        </a>
        <a class="nav-dropdown-item" href="${r.mineral}">
          <span>${isTr ? "Karotlu Maden Arama" : isAr ? "استكشاف المعادن" : "Mineral Core"}</span>
          <small>Karotlu</small>
        </a>
      </div>
    </div>

    <div class="nav-dropdown">
      <a class="nav-link nav-dropdown-trigger" href="${r.equipment}"${isEquipActive ? ' aria-current="page"' : ''}>
        ${esc(copy.nav.equipment)}
      </a>
      <div class="nav-dropdown-menu">
        <a class="nav-dropdown-item" href="${r.rigs}">
          <span>${isTr ? "Sondaj Makineleri" : isAr ? "حفارات ومعدات الحفر" : "Drilling Rigs"}</span>
          <small>300–3000m</small>
        </a>
        <a class="nav-dropdown-item" href="${r.pipes}">
          <span>${isTr ? "Sondaj Tijleri" : isAr ? "أنابيب الحفر (Tij)" : "Drill Pipes"}</span>
          <small>2 3/8" – 5 1/2"</small>
        </a>
        <a class="nav-dropdown-item" href="${r.bits}">
          <span>${isTr ? "Sondaj Matkapları" : isAr ? "رؤوس الحفر IADC" : "Drill Bits"}</span>
          <small>IADC 111–637</small>
        </a>
      </div>
    </div>

    <a class="nav-link" href="${r.references}"${current === "references" ? ' aria-current="page"' : ''}>${esc(copy.nav.references)}</a>
    <a class="nav-link" href="${r.contact}"${current === "contact" ? ' aria-current="page"' : ''}>${esc(copy.nav.contact)}</a>
  `;
}

function mobileNavLinks(lang, current) {
  const r = routes[lang];
  const copy = locales[lang];
  const isTr = lang === "tr";
  const isAr = lang === "ar";

  return `
    <a href="${r.home}">${esc(copy.crumbs.home)}</a>
    <a href="${r.about}">${esc(copy.nav.about)}</a>
    <a href="${r.services}" style="font-weight:700;color:var(--signal);">${esc(copy.nav.services)}</a>
    <div class="mobile-nav-subgroup">
      <a href="${r.water}">↳ ${isTr ? "Su Sondajı (250–1600m)" : isAr ? "حفر آبار المياه" : "Water Well Drilling"}</a>
      <a href="${r.geothermal}">↳ ${isTr ? "Jeotermal Sondaj (1200–3000m)" : isAr ? "حفر الطاقة الحرارية" : "Geothermal Drilling"}</a>
      <a href="${r.geotechnical}">↳ ${isTr ? "Zemin Etüdü & Jeoteknik" : isAr ? "الجيوتقنية والتربة" : "Geotechnical Survey"}</a>
      <a href="${r.mineral}">↳ ${isTr ? "Karotlu Maden Arama" : isAr ? "استكشاف المعادن" : "Mineral Core Drilling"}</a>
    </div>
    <a href="${r.equipment}" style="font-weight:700;color:var(--signal);">${esc(copy.nav.equipment)}</a>
    <div class="mobile-nav-subgroup">
      <a href="${r.rigs}">↳ ${isTr ? "Sondaj Makineleri (300–3000m)" : isAr ? "حفارات الحفر" : "Drilling Rigs"}</a>
      <a href="${r.pipes}">↳ ${isTr ? "Sondaj Tijleri (Borular)" : isAr ? "أنابيب الحفر" : "Drill Pipes"}</a>
      <a href="${r.bits}">↳ ${isTr ? "Sondaj Matkapları (IADC)" : isAr ? "رؤوس الحفر" : "Drill Bits"}</a>
    </div>
    <a href="${r.references}">${esc(copy.nav.references)}</a>
    <a href="${r.contact}" style="font-weight:700;color:var(--signal);">${esc(copy.nav.contact)} & Teklif Formu</a>
  `;
}

function langSwitch(pageKey, lang) {
  return ["tr", "en", "ar"]
    .map((code) => {
      const current = code === lang ? ' aria-current="page"' : "";
      const label = code === "ar" ? "AR" : code.toUpperCase();
      return `<a class="lang-btn" href="${routes[code][pageKey]}" hreflang="${code === "tr" ? "tr-TR" : code}"${current}>${label}</a>`;
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
  return `<div class="section reveal-on-scroll">
    <div class="section-sidebar">
      <div class="section-index-badge">NO. ${esc(index)}</div>
      <div class="section-kicker">KD SONDAJ</div>
    </div>
    <div>
      <div class="section-head">
        <h2>${esc(title)}</h2>
      </div>
      ${inner}
    </div>
  </div>`;
}

function machineCard(machine, copy, lang) {
  const carrier = machine.carrier === "trailer" ? copy.common.trailer : copy.common.truck;
  const carrierClass = machine.carrier;
  const inquiryText = lang === "tr"
    ? `Merhaba, KD Sondaj ${machine.depth} (${carrier}) makineniz hakkında teknik detay ve teklif almak istiyorum.`
    : lang === "ar"
    ? `مرحباً، أود الاستفسار والحصول على عرض سعر لحفارة KD Sondaj سعة ${machine.depth} (${carrier}).`
    : `Hello, I would like to request a quote and technical specifications for the KD Sondaj ${machine.depth} (${carrier}) rig.`;
  const waUrl = `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(inquiryText)}`;
  const btnLabel = lang === "tr" ? "Teklif İste" : lang === "ar" ? "طلب تسعير" : "Request Quote";

  if (machine.special) {
    const facts = machine.facts[lang] || machine.facts.tr;
    return `<article class="rig-card reveal-on-scroll" data-carrier="${carrierClass}">
      <div class="rig-header">
        <div class="rig-depth-badge">${esc(machine.depth)}</div>
        <span class="carrier-tag ${carrierClass}">${esc(carrier)}</span>
      </div>
      <div class="rig-features">
        <ul style="margin:0;padding-inline-start:1.1rem;color:var(--text-soft);">${facts.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </div>
      <a class="rig-inquire-btn" href="${waUrl}" target="_blank" rel="noopener">
        <span>${esc(btnLabel)} (0541 191 63 01)</span>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
      </a>
    </article>`;
  }

  const mud = machine.mud === true ? copy.common.mudYes : machine.mud === "optional" ? copy.common.mudOpt : "";
  return `<article class="rig-card reveal-on-scroll" data-carrier="${carrierClass}">
    <div class="rig-header">
      <div class="rig-depth-badge">${esc(machine.depth)}</div>
      <span class="carrier-tag ${carrierClass}">${esc(carrier)}</span>
    </div>
    <div class="spec-grid">
      <div class="spec-item">
        <dt>${esc(copy.common.hp)}</dt>
        <dd>${esc(machine.hp)}</dd>
      </div>
      ${machine.mast ? `<div class="spec-item"><dt>${esc(copy.common.mast)}</dt><dd>${esc(machine.mast)}</dd></div>` : ""}
      <div class="spec-item">
        <dt>${esc(copy.common.draw)}</dt>
        <dd>${esc(machine.drawworks)}</dd>
      </div>
    </div>
    <div class="rig-features">
      ${mud ? `<p style="color:var(--cyan);font-weight:700;">✓ ${esc(mud)}</p>` : ""}
      <p style="color:var(--text-muted);font-size:0.84rem;">${esc(copy.common.systems)}</p>
    </div>
    <a class="rig-inquire-btn" href="${waUrl}" target="_blank" rel="noopener">
      <span>${esc(btnLabel)} (0541 191 63 01)</span>
      <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
    </a>
  </article>`;
}

function quoteCalculator(lang) {
  const isTr = lang === "tr";
  const isAr = lang === "ar";

  const title = isTr ? "Hızlı Kuyu & Makine Hesaplayıcı" : isAr ? "حاسبة عمق البئر والحفارة المناسبة" : "Fast Rig & Depth Selector";
  const desc = isTr
    ? "Projenizin hedef derinliğini ve hizmet türünü seçin; formasyonunuza en uygun kule sınıfını anında görüntüleyin ve 1 tıkla WhatsApp teklifi oluşturun."
    : isAr
    ? "حدد نوع الخدمة والعمق المستهدف لمشروعك؛ تعرف على فئة الحفارة الأنسب لطبقات الأرض لديك وأنشئ رسالة تسعير واتساب بنقرة واحدة."
    : "Select your service type and target depth to instantly match the ideal rig class for your geological stratum and generate a 1-click WhatsApp quote.";

  const typeLabel = isTr ? "Hizmet Türü" : isAr ? "نوع الخدمة" : "Service Type";
  const depthLabel = isTr ? "Hedef Derinlik" : isAr ? "العمق المستهدف" : "Target Depth";

  const types = isTr ? [
    { id: "water", name: "Su Sondajı" },
    { id: "geothermal", name: "Jeotermal Sondaj" },
    { id: "mineral", name: "Karotlu Maden" },
    { id: "geotechnical", name: "Zemin & Geoteknik" }
  ] : isAr ? [
    { id: "water", name: "حفر آبار المياه" },
    { id: "geothermal", name: "حفر الطاقة الحرارية" },
    { id: "mineral", name: "استكشاف المعادن" },
    { id: "geotechnical", name: "فحص التربة والجيوتقنية" }
  ] : [
    { id: "water", name: "Water Well" },
    { id: "geothermal", name: "Geothermal" },
    { id: "mineral", name: "Mineral Core" },
    { id: "geotechnical", name: "Geotechnical" }
  ];

  const depths = [
    { val: "300", label: "250 – 500 m" },
    { val: "800", label: "500 – 1000 m" },
    { val: "1500", label: "1000 – 2000 m" },
    { val: "3000", label: "2000 – 3000 m" }
  ];

  const recLabel = isTr ? "Önerilen Makine Sınıfı" : isAr ? "فئة الحفارة الموصى بها" : "Recommended Rig Class";
  const btnLabel = isTr ? "WhatsApp ile Teklif İste (0541 191 63 01)" : isAr ? "طلب تسعير عبر واتساب (0541 191 63 01)" : "Request Quote on WhatsApp (0541 191 63 01)";

  return `
  <div class="calc-widget reveal-on-scroll" id="rig-calculator" data-lang="${lang}">
    <div class="calc-grid">
      <div class="calc-options">
        <div>
          <h3 style="margin-bottom:0.4rem;">${esc(title)}</h3>
          <p style="margin-bottom:1.25rem;font-size:0.92rem;">${esc(desc)}</p>
        </div>
        <div>
          <span class="calc-label">${esc(typeLabel)}</span>
          <div class="calc-pills" id="calc-types">
            ${types.map((t, idx) => `<button type="button" class="calc-pill ${idx === 0 ? "selected" : ""}" data-type="${t.id}">${esc(t.name)}</button>`).join("")}
          </div>
        </div>
        <div>
          <span class="calc-label">${esc(depthLabel)}</span>
          <div class="calc-pills" id="calc-depths">
            ${depths.map((d, idx) => `<button type="button" class="calc-pill ${idx === 1 ? "selected" : ""}" data-depth="${d.val}">${esc(d.label)}</button>`).join("")}
          </div>
        </div>
      </div>
      <div class="calc-result-box">
        <span class="calc-result-rec">${esc(recLabel)}</span>
        <div class="calc-result-rig" id="calc-rig-name">KD-800 Kamyon Üstü Hidrolik Kule</div>
        <div class="calc-result-desc" id="calc-rig-desc">Broşür 800 m sınıfı: Kamyon üstü intikal, 361 HP güverte motoru, çift çamur sirkülasyonu.</div>
        <a class="btn btn-wa" id="calc-wa-btn" href="https://wa.me/${site.whatsappE164}?text=Merhaba%2C%20KD%20Sondaj'dan%20Su%20Sondaji%20(500-1000m)%20icin%20teklif%20almak%20istiyorum." target="_blank" rel="noopener" style="width:100%;justify-content:center;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
          ${esc(btnLabel)}
        </a>
      </div>
    </div>
  </div>`;
}

function contactForm(lang) {
  const isTr = lang === "tr";
  const isAr = lang === "ar";

  const t = isTr ? {
    title: "Projeniz İçin Teklif Alın",
    subtitle: "Hedef derinlik, lokasyon ve hizmet detaylarınızı iletin; uzman mühendislik ekibimiz aynı gün içinde teknik değerlendirme ve teklif hazırlasın.",
    nameLabel: "Ad Soyad *",
    namePlaceholder: "Adınız ve Soyadınız",
    phoneLabel: "Telefon Numarası *",
    phonePlaceholder: "0541 191 63 01",
    emailLabel: "E-Posta Adresi",
    emailPlaceholder: "ornek@sirket.com",
    serviceLabel: "Sondaj & Hizmet Türü *",
    services: [
      "Su Sondajı (İçme & Tarım)",
      "Jeotermal Sondaj (Derin Kuyu)",
      "Zemin Etüdü & Jeoteknik Sondaj",
      "Karotlu Maden Arama",
      "Sondaj Kulesi & Ekipman Kiralama/Satış",
      "Kuyu İnkişafı & Pompa Testi"
    ],
    depthLabel: "Tahmini Hedef Derinlik (Metre)",
    depths: [
      "100 – 300 Metre",
      "300 – 600 Metre",
      "600 – 1000 Metre",
      "1000 – 2000 Metre",
      "2000 – 3000 Metre"
    ],
    locationLabel: "Proje Lokasyonu / Şehir",
    locationPlaceholder: "Örn: Ankara, İzmir, Şanlıurfa...",
    notesLabel: "Proje Notları & Formasyon Bilgisi",
    notesPlaceholder: "Arazi yapısı, kuyu çapı, aciliyet veya özel teknik gereksinimler...",
    btnWa: "WhatsApp ile Gönder (0541 191 63 01)",
    btnMail: "E-Posta ile Gönder",
    successMsg: "✓ Form hazırlandı! Bilgileriniz WhatsApp / E-posta üzerinden doğrudan mühendislik hattımıza yönlendiriliyor."
  } : isAr ? {
    title: "احصل على عرض سعر لمشروعك",
    subtitle: "أرسل عمق البئر المستهدف والموقع ونوع الخدمة؛ سيقوم فريقنا الهندسي بدراسة المشروع وتقديم عرض فني في نفس اليوم.",
    nameLabel: "الاسم الكامل *",
    namePlaceholder: "اسمك الكريم",
    phoneLabel: "رقم الهاتف *",
    phonePlaceholder: "0541 191 63 01",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "example@company.com",
    serviceLabel: "نوع خدمة الحفر *",
    services: [
      "حفر آبار المياه (للشرب والزراعة)",
      "حفر الطاقة الحرارية الأرضية (الآبار العميقة)",
      "فحص التربة والجيوتقنية",
      "استكشاف المعادن بالقلب الصخري",
      "تأجير/بيع أبراج ومعدات الحفر",
      "تطوير الآبار واختبار المضخات"
    ],
    depthLabel: "العمق التقديري المستهدف (متر)",
    depths: [
      "100 – 300 متر",
      "300 – 600 متر",
      "600 – 1000 متر",
      "1000 – 2000 متر",
      "2000 – 3000 متر"
    ],
    locationLabel: "موقع المشروع / المدينة",
    locationPlaceholder: "مثال: أنقرة، إزمير، إقليم...",
    notesLabel: "ملاحظات المشروع وطبيعة الطبقات الأرضية",
    notesPlaceholder: "طبيعة التكوين الصخري، قطر البئر، أي متطلبات فنية خاصة...",
    btnWa: "إرسال عبر واتساب (0541 191 63 01)",
    btnMail: "إرسال عبر البريد الإلكتروني",
    successMsg: "✓ تم تجهيز الطلب! يتم توجيه بياناتك عبر الواتساب أو البريد إلى مهندسينا فوراً."
  } : {
    title: "Request a Drilling Project Quotation",
    subtitle: "Submit your target depth, location, and service requirements; our engineering team will evaluate and provide a technical quote within the day.",
    nameLabel: "Full Name *",
    namePlaceholder: "Your Full Name",
    phoneLabel: "Phone Number *",
    phonePlaceholder: "+90 541 191 63 01",
    emailLabel: "Email Address",
    emailPlaceholder: "sample@company.com",
    serviceLabel: "Drilling Service Type *",
    services: [
      "Water Well Drilling (Potable & Agricultural)",
      "Geothermal Deep Well Drilling",
      "Geotechnical Soil Testing & Core Drilling",
      "Mineral Exploration Core Drilling",
      "Drilling Rig & Equipment Rental/Sales",
      "Well Development & Pumping Tests"
    ],
    depthLabel: "Estimated Target Depth (Meters)",
    depths: [
      "100 – 300 Meters",
      "300 – 600 Meters",
      "600 – 1000 Meters",
      "1000 – 2000 Meters",
      "2000 – 3000 Meters"
    ],
    locationLabel: "Project Location / Region",
    locationPlaceholder: "e.g. Ankara, Izmir, Sanliurfa...",
    notesLabel: "Project Details & Geological Notes",
    notesPlaceholder: "Rock formation details, casing diameter, urgency or special technical specs...",
    btnWa: "Send via WhatsApp (0541 191 63 01)",
    btnMail: "Send via Email",
    successMsg: "✓ Quotation request compiled! Redirecting your project details to our technical team."
  };

  return `
  <div class="contact-form-card reveal-on-scroll" id="contact-form-wrapper">
    <h3 style="font-size:1.6rem;margin-bottom:0.5rem;">${esc(t.title)}</h3>
    <p style="margin-bottom:1.75rem;font-size:0.95rem;color:var(--text-soft);">${esc(t.subtitle)}</p>
    
    <div class="form-success-banner" id="form-success-banner">
      ${esc(t.successMsg)}
    </div>

    <form id="kd-contact-form" onsubmit="return false;" data-lang="${lang}">
      <div class="form-grid-two">
        <div class="form-group">
          <label class="form-label" for="cf-name">${esc(t.nameLabel)}</label>
          <input class="form-input" id="cf-name" name="name" type="text" required placeholder="${esc(t.namePlaceholder)}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="cf-phone">${esc(t.phoneLabel)}</label>
          <input class="form-input" id="cf-phone" name="phone" type="tel" required placeholder="${esc(t.phonePlaceholder)}" />
        </div>
      </div>

      <div class="form-grid-two">
        <div class="form-group">
          <label class="form-label" for="cf-email">${esc(t.emailLabel)}</label>
          <input class="form-input" id="cf-email" name="email" type="email" placeholder="${esc(t.emailPlaceholder)}" />
        </div>
        <div class="form-group">
          <label class="form-label" for="cf-location">${esc(t.locationLabel)}</label>
          <input class="form-input" id="cf-location" name="location" type="text" placeholder="${esc(t.locationPlaceholder)}" />
        </div>
      </div>

      <div class="form-grid-two">
        <div class="form-group">
          <label class="form-label" for="cf-service">${esc(t.serviceLabel)}</label>
          <select class="form-select" id="cf-service" name="service">
            ${t.services.map((s) => `<option value="${esc(s)}">${esc(s)}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label" for="cf-depth">${esc(t.depthLabel)}</label>
          <select class="form-select" id="cf-depth" name="depth">
            ${t.depths.map((d) => `<option value="${esc(d)}">${esc(d)}</option>`).join("")}
          </select>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label" for="cf-notes">${esc(t.notesLabel)}</label>
        <textarea class="form-textarea" id="cf-notes" name="notes" placeholder="${esc(t.notesPlaceholder)}"></textarea>
      </div>

      <div class="form-actions-row">
        <button type="button" class="btn btn-wa" id="cf-submit-wa" style="flex:1;">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-2.79 4.23c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81s.78 2.11.89 2.25c.11.15 1.51 2.42 3.73 3.3 1.85.73 2.22.59 2.62.55.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.15-.42-.27-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.15.21-.56.71-.69.86-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.21-.01-.33.1-.44.1-.1.22-.26.33-.39.11-.13.15-.21.22-.36.07-.14.04-.27-.02-.38-.06-.11-.49-1.17-.67-1.6-.17-.42-.35-.36-.49-.37z"/></svg>
          ${esc(t.btnWa)}
        </button>
        <button type="button" class="btn btn-ghost" id="cf-submit-mail">
          ✉️ ${esc(t.btnMail)}
        </button>
      </div>
    </form>
  </div>`;
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
  <meta property="og:image" content="${esc(originUrl("/assets/hero-field-rig.jpg"))}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(originUrl("/assets/hero-field-rig.jpg"))}" />
  <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
  <link rel="manifest" href="/site.webmanifest" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Sans+Arabic:wght@400;500;600;700&display=swap" rel="stylesheet" />
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
          <div class="brand-icon">
            <img src="/assets/logo.svg" width="34" height="34" alt="${esc(site.name)}" />
          </div>
          <div class="brand-text">
            <span class="brand-title">${esc(site.name)}</span>
            <span class="brand-sub">${esc(copy.brandSub)}</span>
          </div>
        </a>
        <nav class="nav-center">${navLinks(lang, navCurrent)}</nav>
        <div class="header-actions">
          <nav class="lang-switcher" aria-label="Language">${langSwitch(pageKey, lang)}</nav>
          <a class="btn btn-wa header-cta" href="${whatsapp(copy)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
            0541 191 63 01
          </a>
          <button class="menu-btn" id="menu-toggle" type="button" aria-expanded="false" aria-controls="mobile-panel" aria-label="Menu">☰</button>
        </div>
      </div>
    </div>
    <div class="mobile-panel" id="mobile-panel">
      <div class="wrap">
        <nav class="mobile-panel-nav">${mobileNavLinks(lang, navCurrent)}</nav>
        <div class="mobile-panel-cta">
          <a class="btn btn-wa" href="${whatsapp(copy)}" target="_blank" rel="noopener" style="width:100%;margin-top:1rem;">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
            WhatsApp: 0541 191 63 01
          </a>
        </div>
      </div>
    </div>
  </header>
  <main id="main">${main}</main>
  <section class="close-cta">
    <div class="wrap">
      <div class="close-cta-content">
        <h2>${esc(copy.cta.quote)}</h2>
        <p>${esc(site.address.display)}</p>
        <div class="cta-row">
          <a class="btn btn-wa" href="${whatsapp(copy)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
            WhatsApp: 0541 191 63 01
          </a>
          <a class="btn btn-signal" href="${routes[lang].contact}">
            📝 İletişim & Teklif Formu
          </a>
          <a class="btn btn-ghost" href="${mailto(copy)}">${esc(site.email)}</a>
        </div>
      </div>
    </div>
  </section>
  <footer class="site-footer">
    <div class="wrap footer-grid">
      <div class="footer-col">
        <a class="brand" href="${routes[lang].home}" style="margin-bottom:1rem;">
          <div class="brand-icon">
            <img src="/assets/logo.svg" width="34" height="34" alt="${esc(site.name)}" />
          </div>
          <div class="brand-text">
            <span class="brand-title">${esc(site.name)}</span>
            <span class="brand-sub">${esc(copy.brandSub)}</span>
          </div>
        </a>
        <p>${esc(copy.pages.home.lead)}</p>
      </div>
      <div class="footer-col">
        <h2>${esc(copy.footer.nap)}</h2>
        <p>${esc(site.address.display)}</p>
        <p><a href="${whatsapp(copy)}" target="_blank" rel="noopener" style="color:var(--signal);font-weight:700;">WhatsApp: 0541 191 63 01</a><br /><a href="mailto:${site.email}">${esc(site.email)}</a></p>
      </div>
      <div class="footer-col">
        <h2>${esc(copy.nav.services)}</h2>
        <p><a href="${routes[lang].water}">${esc(copy.services.find((item) => item.key === "water").h)}</a><br />
        <a href="${routes[lang].geothermal}">${esc(copy.services.find((item) => item.key === "gt").h)}</a><br />
        <a href="${routes[lang].geotechnical}">Zemin & Geoteknik</a><br />
        <a href="${routes[lang].mineral}">Karotlu Maden Arama</a></p>
      </div>
      <div class="footer-col">
        <h2>${esc(copy.footer.explore)}</h2>
        <p><a href="${routes[lang].about}">${esc(copy.nav.about)}</a><br />
        <a href="${routes[lang].rigs}">Sondaj Makineleri</a><br />
        <a href="${routes[lang].references}">${esc(copy.nav.references)}</a><br />
        <a href="${routes[lang].contact}">İletişim & Teklif Formu</a></p>
      </div>
    </div>
    <div class="wrap legal">
      <div>${esc(copy.footer.legal)}</div>
      <button class="back-to-top" id="back-to-top" type="button" aria-label="Yukarı Çık">↑ Back to Top</button>
    </div>
  </footer>
  <a class="wa-float" href="${whatsapp(copy)}" target="_blank" rel="noopener" aria-label="WhatsApp: 0541 191 63 01">
    <svg viewBox="0 0 24 24" width="30" height="30" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-2.79 4.23c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81s.78 2.11.89 2.25c.11.15 1.51 2.42 3.73 3.3 1.85.73 2.22.59 2.62.55.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.15-.42-.27-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.15.21-.56.71-.69.86-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.21-.01-.33.1-.44.1-.1.22-.26.33-.39.11-.13.15-.21.22-.36.07-.14.04-.27-.02-.38-.06-.11-.49-1.17-.67-1.6-.17-.42-.35-.36-.49-.37z"/></svg>
  </a>
  <script src="/assets/site.js"></script>
</body>
</html>
`;
}

function pageHome(lang) {
  const copy = locales[lang];
  const p = copy.pages.home;
  const isTr = lang === "tr";
  const isAr = lang === "ar";

  const serviceCards = copy.services
    .map(
      (item) => `<article class="card reveal-on-scroll">
      <div class="card-icon">${getServiceIcon(item.key)}</div>
      <h3>${esc(item.h)}</h3>
      <p>${esc(item.p)}</p>
      <a class="more" href="${routes[lang][item.href]}">${esc(copy.cta.more)} →</a>
    </article>`
    )
    .join("");

  const why = p.why.map((item, idx) => `
    <article class="card reveal-on-scroll">
      <div class="card-icon">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <h3>${esc(item.h)}</h3>
      <p>${esc(item.p)}</p>
    </article>
  `).join("");

  const refs = copy.refs.map((item) => `
    <article class="ref-item reveal-on-scroll">
      <span class="ref-badge">VERIFIED</span>
      <p>${esc(item)}</p>
    </article>
  `).join("");

  const faq = copy.faq
    .map((item) => `<details class="reveal-on-scroll"><summary>${esc(item.q)}</summary><p>${esc(item.a)}</p></details>`)
    .join("");

  const strataLabels = isTr ? [
    { depth: "0 – 250 m", label: "Yüzey & Sığ Su Akiferi" },
    { depth: "300 – 800 m", label: "Kamyon Üstü Hidrolik Kuleler" },
    { depth: "1000 – 1600 m", label: "DSİ & Belediye Derin Kuyular" },
    { depth: "2000 – 3000 m", label: "Yüksek Entalpi Jeotermal Dorse" }
  ] : isAr ? [
    { depth: "0 – 250 م", label: "الطبقة السطحية ومياه الآبار العذبة" },
    { depth: "300 – 800 م", label: "حفارات هيدروليكية مثبتة على شاحنات" },
    { depth: "1000 – 1600 م", label: "مشاريع مياه الشرب البلدية والعميقة" },
    { depth: "2000 – 3000 م", label: "حفارات مقطورة عملاقة للطاقة الحرارية" }
  ] : [
    { depth: "0 – 250 m", label: "Surface & Shallow Aquifers" },
    { depth: "300 – 800 m", label: "Truck-Mounted Hydraulic Systems" },
    { depth: "1000 – 1600 m", label: "Deep Municipal & Public Wells" },
    { depth: "2000 – 3000 m", label: "Heavy Trailer Geothermal Reservoirs" }
  ];

  const main = `
  <section class="hero">
    <div class="wrap hero-grid">
      <div class="reveal-on-scroll">
        <div class="telemetry-pill shimmer-badge">
          <span class="beacon-dot"></span>
          <span>45 YILLIK ÜRETİM &amp; SAHA TECRÜBESİ</span>
          <span class="pill-tag">3000M KAPASİTE</span>
        </div>
        <h1>${esc(p.h1).replace("250–3000", '<span class="highlight-orange">250–3000</span>')}</h1>
        <p class="lead">${esc(p.lead)}</p>
        <p class="hero-proof-text">${esc(p.proof)}</p>
        <div class="cta-row">
          <a class="btn btn-wa" href="${whatsapp(copy)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
            0541 191 63 01
          </a>
          <a class="btn btn-signal" href="${routes[lang].contact}">
            📝 Teklif Formu
          </a>
          <a class="btn btn-ghost" href="${routes[lang].rigs}">
            ${esc(copy.cta.rigs)} →
          </a>
        </div>
      </div>
      
      <div class="hero-visual-container reveal-on-scroll">
        <div class="hero-img-card">
          <img src="/assets/hero-field-rig.jpg" alt="KD Sondaj Saha Kulesi ve Derin Kuyu Çalışması (Broşür Sayfa 22)" width="800" height="450" fetchpriority="high" />
        </div>
        <aside class="hero-depth-card">
          <div class="card-header-telemetry">
            <span>TELEMETRY // STRATA HORIZON (BROŞÜR VERİSİ)</span>
            <span class="status-online">3000M AKTİF</span>
          </div>
          <div class="depth-meter-track">
            <div class="depth-meter-fill"></div>
          </div>
          <div class="depth-strata-list">
            ${strataLabels.map((s, idx) => `
              <div class="strata-item ${idx === 3 ? "active" : ""}">
                <div class="strata-node"></div>
                <div class="strata-depth">${esc(s.depth)}</div>
                <div class="strata-label">${esc(s.label)}</div>
              </div>
            `).join("")}
          </div>
          <div class="hero-card-stats">
            <div class="stat-chip">
              <div class="val">3000 m</div>
              <div class="lbl">${isTr ? "Maksimum Kuyu Derinliği" : isAr ? "العمق الأقصى للبئر" : "Maximum Well Depth"}</div>
            </div>
            <div class="stat-chip">
              <div class="val">45+ Yıl</div>
              <div class="lbl">${isTr ? "Saha & Üretim Tecrübesi" : isAr ? "خبرة هندسية وتصنيعية" : "Field & Manufacturing Legacy"}</div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>

  <section class="metrics-band">
    <div class="wrap metrics-grid">
      <div class="metric-item reveal-on-scroll">
        <div class="metric-icon-box">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M5 15l7 7 7-7"/></svg>
        </div>
        <div class="metric-content">
          <div class="num">250–3000 m</div>
          <span>${esc(p.metrics[0].l)}</span>
        </div>
      </div>
      <div class="metric-item reveal-on-scroll delay-1">
        <div class="metric-icon-box">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
        </div>
        <div class="metric-content">
          <div class="num">300–3000 m</div>
          <span>${esc(p.metrics[1].l)}</span>
        </div>
      </div>
      <div class="metric-item reveal-on-scroll delay-2">
        <div class="metric-icon-box">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="metric-content">
          <div class="num">45+ Yıl</div>
          <span>${esc(p.metrics[2].l)}</span>
        </div>
      </div>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      ${section("01", p.servicesTitle, `
        <p>${esc(p.servicesLead)}</p>
        <div class="cards services">${serviceCards}</div>
        
        <div class="showcase-banner reveal-on-scroll" style="margin-top:2.5rem;">
          <img class="showcase-img" src="/assets/truck-rig.jpg" alt="KD Sondaj Kamyon Üstü Hidrolik Kule (Broşür Sayfa 6-7)" loading="lazy" />
          <div class="showcase-content">
            <span class="telemetry-pill" style="margin-bottom:0.75rem;"><span class="beacon-dot"></span> BROŞÜR KAMYON ÜSTÜ KULELER (300–1200 M)</span>
            <h3>${esc(copy.pages.rigs.h1)}</h3>
            <p>${isTr ? "Broşür kayıtlı 300m, 400m, 500m, 600m, 800m, 1000m ve 1200m kamyon üstü hidrolik sondaj kuleleri ile hızlı intikal ve yüksek tork." : isAr ? "حفارات شاحنة هيدروليكية من 300 إلى 1200 متر مصممة للحركة السريعة والعمل الشاق." : "Heavy truck-mounted drilling rigs 300m to 1200m for rapid deployment and high torque."}</p>
            <div><a class="btn btn-signal" href="${routes[lang].rigs}">${esc(copy.cta.more)} →</a></div>
          </div>
        </div>
      `)}
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      ${section("02", p.equipTitle, `
        <div class="filter-bar">
          <button type="button" class="filter-btn active" data-filter="all">${isTr ? "Tüm Kuleler" : isAr ? "جميع الحفارات" : "All Rigs"}</button>
          <button type="button" class="filter-btn" data-filter="trailer">${isTr ? "Dorse Kuleler (Ağır Tip)" : isAr ? "حفارات مقطورة" : "Trailer Rigs"}</button>
          <button type="button" class="filter-btn" data-filter="truck">${isTr ? "Kamyon Üstü (Hızlı İntikal)" : isAr ? "حفارات شاحنة" : "Truck Rigs"}</button>
        </div>
        <div class="cards four">
          ${machines.slice(0, 4).map((m) => machineCard(m, copy, lang)).join("")}
        </div>
        <p style="margin-top:1.75rem;"><a class="btn btn-ghost" href="${routes[lang].rigs}">${esc(copy.cta.more)} (Tüm 11 Model) →</a></p>
        
        <div class="showcase-banner reveal-on-scroll" style="margin-top:2.5rem;">
          <img class="showcase-img" src="/assets/trailer-rig.jpg" alt="KD Sondaj Ağır Dorse Kule 1500–3000 Metre (Broşür Sayfa 4 & 8)" loading="lazy" />
          <div class="showcase-content">
            <span class="telemetry-pill" style="margin-bottom:0.75rem;"><span class="beacon-dot"></span> 1500–3000M AĞIR DORSE SINIFI</span>
            <h3>1500 – 3000 Metre Dorse Sondaj Kulesi</h3>
            <p>${isTr ? "Broşürde yer alan 110 ton kule ve 90 ton halat sarıcı kapasiteli ağır dorse sınıfı derin su ve jeotermal sondaj kulemiz." : isAr ? "حفارة مقطورة ثقيلة بقدرة برج 110 طن وقدرة سحب 90 طن لآبار المياه العميقة والطاقة الحرارية." : "Heavy trailer-mounted drilling rig with 110-ton mast capacity and 90-ton drawworks for deep geothermal & water wells."}</p>
            <div><a class="btn btn-signal" href="${routes[lang].rigs}">${esc(copy.cta.more)} →</a></div>
          </div>
        </div>

        ${quoteCalculator(lang)}
      `)}
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      ${section("03", p.whyTitle, `<div class="cards three">${why}</div>`)}
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      ${section("04", p.refTitle, `
        <p>${esc(p.refLead)}</p>
        <div class="list-cards">${refs}</div>
      `)}
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      ${section("05", p.faqTitle, `<div class="faq">${faq}</div>`)}
    </div>
  </section>`;

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
  const main = `
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(lang, [{ name: p.h1, path: routes[lang][pageKey] }])}
      <div class="telemetry-pill shimmer-badge">
        <span class="beacon-dot"></span>
        <span>${esc(p.kicker)}</span>
      </div>
      <h1>${esc(p.h1)}</h1>
      <p class="lead">${esc(p.lead)}</p>
      ${p.body ? p.body.map((para) => `<p style="font-size:1.05rem;max-width:70ch;">${esc(para)}</p>`).join("") : ""}
      ${p.proof ? `<div class="note">⚡ ${esc(p.proof)}</div>` : ""}
      ${p.need ? `<p style="color:var(--text-soft);">${esc(p.need)}</p>` : ""}
      <div class="cta-row" style="margin-top:2rem;">
        <a class="btn btn-wa" href="${whatsapp(copy)}" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
          0541 191 63 01
        </a>
        <a class="btn btn-signal" href="${routes[lang].contact}">
          📝 Teklif Formu
        </a>
        <a class="btn btn-ghost" href="${routes[lang].contact}">${esc(copy.nav.contact)} →</a>
      </div>
    </div>
  </section>${trail}`;
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
      (item) => `
      <article class="card reveal-on-scroll">
        <div class="card-icon">${getServiceIcon(item.key)}</div>
        <h3>${esc(item.h)}</h3>
        <p>${esc(item.p)}</p>
        <a class="more" href="${routes[lang][item.href]}">${esc(copy.cta.more)} →</a>
      </article>`
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
  let extraBanner = "";
  if (pageKey === "geothermal" || pageKey === "water") {
    extraBanner = `
    <section class="block" style="padding-top:0;">
      <div class="wrap">
        <div class="showcase-banner reveal-on-scroll">
          <img class="showcase-img" src="/assets/hero-field-rig.jpg" alt="KD Sondaj Derin Sondaj Kulesi Sahada (Broşür Sayfa 22)" />
          <div class="showcase-content">
            <span class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span> 250–3000 METRE SAHA OPERASYONU</span>
            <h3>${esc(copy.pages[pageKey].h1)}</h3>
            <p>${esc(copy.pages[pageKey].lead)}</p>
          </div>
        </div>
      </div>
    </section>`;
  }
  const { p, main } = simplePage(lang, pageKey, extraBanner);
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
  const extra = `
  <section class="block">
    <div class="wrap">
      <div class="cards three">
        <article class="card reveal-on-scroll">
          <div class="card-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg></div>
          <h3>${esc(copy.pages.rigs.h1)}</h3>
          <p>${esc(copy.pages.rigs.lead)}</p>
          <a class="more" href="${routes[lang].rigs}">${esc(copy.cta.more)} →</a>
        </article>
        <article class="card reveal-on-scroll delay-1">
          <div class="card-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16v16H4z"/><path d="M4 12h16"/><path d="M12 4v16"/></svg></div>
          <h3>${esc(copy.pages.pipes.h1)}</h3>
          <p>${esc(copy.pages.pipes.lead)}</p>
          <a class="more" href="${routes[lang].pipes}">${esc(copy.cta.more)} →</a>
        </article>
        <article class="card reveal-on-scroll delay-2">
          <div class="card-icon"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></div>
          <h3>${esc(copy.pages.bits.h1)}</h3>
          <p>${esc(copy.pages.bits.lead)}</p>
          <a class="more" href="${routes[lang].bits}">${esc(copy.cta.more)} →</a>
        </article>
      </div>

      <div class="showcase-banner reveal-on-scroll" style="margin-top:2.5rem;">
        <img class="showcase-img" src="/assets/tricone-bits.jpg" alt="KD Sondaj Tricone Matkaplar IADC Standartları (Broşür Sayfa 17-19)" />
        <div class="showcase-content">
          <span class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span> IADC 111–637 STANDARTLARI</span>
          <h3>${esc(copy.pages.bits.h1)}</h3>
          <p>${esc(copy.pages.bits.lead)}</p>
          <div><a class="btn btn-signal" href="${routes[lang].bits}">${esc(copy.cta.more)} →</a></div>
        </div>
      </div>

      <h3 style="margin-top:3rem;margin-bottom:1rem;">Duplex 6" Çamur Pompası</h3>
      <div class="table-wrap reveal-on-scroll">
        <table>
          <caption>Duplex 6" Mud Pump Telemetry (Broşür Sayfa 20)</caption>
          <thead><tr><th>Liner</th><th>Flow (lt/dak)</th><th>bar / psi</th></tr></thead>
          <tbody>${pumpRows.map((row) => `<tr><td>${esc(row.liner)}</td><td>${esc(row.flow)}</td><td>${esc(row.pressure)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
      <p style="color:var(--text-muted);font-size:0.9rem;">${esc(pumpCommon.stroke)} · ${esc(pumpCommon.weight)} · ${esc(pumpCommon.suction)} / ${esc(pumpCommon.discharge)}</p>
      
      ${quoteCalculator(lang)}
    </div>
  </section>`;
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
  const isTr = lang === "tr";
  const isAr = lang === "ar";
  const extra = `
  <section class="block">
    <div class="wrap">
      <div class="filter-bar">
        <button type="button" class="filter-btn active" data-filter="all">${isTr ? "Tüm Kuleler (11)" : isAr ? "جميع الحفارات (11)" : "All Rigs (11)"}</button>
        <button type="button" class="filter-btn" data-filter="trailer">${isTr ? "Dorse Kuleler (Ağır Tip)" : isAr ? "حفارات مقطورة" : "Trailer Rigs"}</button>
        <button type="button" class="filter-btn" data-filter="truck">${isTr ? "Kamyon Üstü (Hızlı İntikal)" : isAr ? "حفارات شاحنة" : "Truck Rigs"}</button>
      </div>

      <div class="showcase-banner reveal-on-scroll" style="margin-bottom:2rem;">
        <img class="showcase-img" src="/assets/truck-rig.jpg" alt="KD Sondaj Kamyon Üstü Sondaj Makinesi (Broşür)" />
        <div class="showcase-content">
          <span class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span> BROŞÜR SAYFA 6-7 ORİJİNAL MODELİ</span>
          <h3>Kamyon Üstü Hidrolik Kule Serisi</h3>
          <p>300m, 400m, 500m, 600m, 800m, 1000m ve 1200m kapasiteli kuleler.</p>
        </div>
      </div>

      <div class="cards four">
        ${machines.map((item) => machineCard(item, copy, lang)).join("")}
      </div>
      <p style="margin-top:2rem;color:var(--text-muted);">${esc(copy.common.standards)}</p>
    </div>
  </section>`;
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
  const extra = `
  <section class="block">
    <div class="wrap">
      <div class="table-wrap reveal-on-scroll">
        <table>
          <caption>Sondaj Tiji Ölçü ve Kalite Tablosu (Broşür Sayfa 16)</caption>
          <thead><tr><th>in</th><th>mm (OD)</th><th>m (Boy)</th><th>Grade (Kalite)</th><th>in (Et)</th><th>mm (Et)</th></tr></thead>
          <tbody>${pipes.map((row) => `<tr><td>${esc(row.inch)}</td><td>${esc(row.od)}</td><td>${esc(row.length)}</td><td>${esc(row.grade)}</td><td>${esc(row.wallIn)}</td><td>${esc(row.wallMm)}</td></tr>`).join("")}</tbody>
        </table>
      </div>
    </div>
  </section>`;
  const { p, main } = simplePage(lang, "pipes", extra);
  return layout({ lang, pageKey: "pipes", title: p.title, description: p.description, schema: [{ "@type": "ProductGroup", name: p.h1, brand: site.name }], main });
}

function pageBits(lang) {
  const copy = locales[lang];
  const cards = bitGroups
    .map(
      (item) => `<article class="card reveal-on-scroll">
        <span class="telemetry-pill shimmer-badge" style="margin-bottom:0.75rem;"><span class="beacon-dot"></span> ${esc(item.codes)}</span>
        <h3>${esc(item.formation[lang])}</h3>
        <p>${esc(item.text[lang])}</p>
      </article>`
    )
    .join("");

  const extra = `
  <section class="block">
    <div class="wrap">
      <div class="showcase-banner reveal-on-scroll" style="margin-bottom:2.5rem;">
        <img class="showcase-img" src="/assets/tricone-bits.jpg" alt="KD Sondaj Tricone Matkap Serisi IADC (Broşür Sayfa 17-19)" />
        <div class="showcase-content">
          <span class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span> IADC 111 – 637 CODE MAPPING</span>
          <h3>${esc(copy.pages.bits.h1)}</h3>
          <p>${esc(copy.pages.bits.lead)}</p>
        </div>
      </div>
      <div class="cards services">${cards}</div>
    </div>
  </section>`;
  const { p, main } = simplePage(lang, "bits", extra);
  return layout({ lang, pageKey: "bits", title: p.title, description: p.description, schema: [{ "@type": "ProductGroup", name: p.h1, brand: site.name }], main });
}

function pageReferences(lang) {
  const copy = locales[lang];
  const extra = `
  <section class="block">
    <div class="wrap">
      <div class="list-cards">
        ${copy.refs.map((item) => `
          <article class="ref-item reveal-on-scroll">
            <span class="ref-badge">VERIFIED</span>
            <p>${esc(item)}</p>
          </article>
        `).join("")}
      </div>
    </div>
  </section>`;
  const { p, main } = simplePage(lang, "references", extra);
  return layout({ lang, pageKey: "references", title: p.title, description: p.description, main });
}

function pageContact(lang) {
  const copy = locales[lang];
  const p = copy.pages.contact;

  const main = `
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(lang, [{ name: p.h1, path: routes[lang].contact }])}
      <div class="telemetry-pill shimmer-badge">
        <span class="beacon-dot"></span>
        <span>0541 191 63 01 // DOĞRUDAN MÜHENDİSLİK &amp; TEKLİF HATTI</span>
      </div>
      <h1>${esc(p.h1)}</h1>
      <p class="lead">${esc(p.lead)}</p>
    </div>
  </section>

  <section class="block">
    <div class="wrap">
      <div class="contact-section-grid">
        <div>
          ${contactForm(lang)}
        </div>

        <div class="contact-info-panel">
          <div class="contact-card-highlight reveal-on-scroll">
            <span class="section-index-badge">HIZLI İLETİŞİM</span>
            <h3 style="margin-top:0.75rem;margin-bottom:0.4rem;">WhatsApp Destek &amp; Teklif Hattı</h3>
            <p style="font-size:0.95rem;margin-bottom:1.25rem;">Hemen mesaj gönderin, hedef derinlik ve kuyu parametrelerinizi doğrudan mühendislik ekibimizle görüşün.</p>
            <a class="btn btn-wa" href="${whatsapp(copy)}" target="_blank" rel="noopener" style="width:100%;">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-2.79 4.23c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81s.78 2.11.89 2.25c.11.15 1.51 2.42 3.73 3.3 1.85.73 2.22.59 2.62.55.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.15-.42-.27-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.15.21-.56.71-.69.86-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.21-.01-.33.1-.44.1-.1.22-.26.33-.39.11-.13.15-.21.22-.36.07-.14.04-.27-.02-.38-.06-.11-.49-1.17-.67-1.6-.17-.42-.35-.36-.49-.37z"/></svg>
              0541 191 63 01
            </a>
          </div>

          <article class="card reveal-on-scroll">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <h3>Telefon &amp; Çağrı</h3>
            <p style="margin-bottom:0.6rem;"><a href="tel:+905411916301" style="font-weight:700;color:var(--signal);font-size:1.15rem;">+90 541 191 63 01</a></p>
            <p style="font-size:0.86rem;color:var(--text-muted);margin:0;">Haftanın 6 günü 08:30 – 19:00 arası kesintisiz teknik destek.</p>
          </article>

          <article class="card reveal-on-scroll">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            </div>
            <h3>E-Posta &amp; İhale Şartnameleri</h3>
            <p style="margin-bottom:0.6rem;"><a href="mailto:${site.email}" style="font-weight:700;color:var(--signal);font-size:1.05rem;">${site.email}</a></p>
            <p style="font-size:0.86rem;color:var(--text-muted);margin:0;">Teknik şartnameler, jeolojik raporlar ve ihale teklif dosyaları için yazabilirsiniz.</p>
          </article>

          <article class="card reveal-on-scroll">
            <div class="card-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <h3>Merkez Ofis</h3>
            <p style="margin-bottom:0.75rem;color:var(--text-main);font-weight:600;">${esc(site.address.display)}</p>
            <a class="btn btn-ghost" href="${site.mapSearch}" target="_blank" rel="noopener" style="font-size:0.85rem;width:100%;">
              📍 Haritada Yol Tarifi Al
            </a>
          </article>
        </div>
      </div>
    </div>
  </section>`;

  return layout({
    lang,
    pageKey: "contact",
    title: p.title,
    description: p.description,
    schema: [
      breadcrumbsLd([{ name: copy.nav.contact, path: routes[lang].contact }]),
      {
        "@type": "ContactPage",
        name: p.title,
        url: originUrl(routes[lang].contact),
        mainEntity: {
          "@type": "LocalBusiness",
          name: site.name,
          telephone: "+90 541 191 63 01",
          email: site.email,
        }
      }
    ],
    main,
  });
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
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600&family=Outfit:wght@700;800&family=Plus+Jakarta+Sans:wght@400;600&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/assets/site.css" />
</head>
<body>
  <main class="not-found wrap">
    <div class="num">404</div>
    <h1>${esc(copy.h1)}</h1>
    <p style="font-size:1.15rem;max-width:44ch;">${esc(copy.lead)}</p>
    <div class="cta-row" style="margin-top:2rem;">
      <a class="btn btn-signal" href="/">Türkçe Ana Sayfa</a>
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
cpSync(join(root, "src/assets"), join(dist, "assets"), { recursive: true });

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
      background_color: "#FFFFFF",
      theme_color: "#EA580C",
      lang: "tr",
      icons: [{ src: "/assets/favicon.svg", type: "image/svg+xml", sizes: "any" }],
    },
    null,
    2
  )
);

console.log("Built KD SONDAJ static site into dist/");
