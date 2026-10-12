import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site, routes } from "./config.mjs";
import { machines, pipes, bitGroups, pumpRows, pumpCommon } from "./data/catalog.mjs";
import { productList } from "./data/products.mjs";
import { guideList } from "./data/guides.mjs";
import { generateLlmsTxt, generateLlmsFullTxt } from "./generate-llms.mjs";
import { generateAdminDashboardHtml } from "./admin-dashboard.mjs";
import { INDEXNOW_KEY } from "./indexnow.mjs";
import { tr } from "./content/tr.mjs";
import { en } from "./content/en.mjs";
import { ar } from "./content/ar.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const locales = { tr, en, ar };

export const productRouteMap = {
  "trailer-1500-3000": "productTrailer3000",
  "special-2500": "productSpecial2500",
  "truck-1000-1200": "productTruck1200",
  "trailer-1000-1200": "productTrailer1200",
  "truck-800": "productTruck800",
  "trailer-800": "productTrailer800",
  "truck-300-500": "productTruck500",
  "trailer-400-600": "productTrailer600",
  "drill-pipes": "productPipes",
  "drill-bits": "productBits",
  "mud-pumps": "productPumps",
};

export const guideRouteMap = {
  "how-to-choose-water-well-drilling-rig": "guideWaterWell",
  "iadc-roller-cone-drill-bit-classification": "guideBits",
  "international-drilling-rig-rfq-checklist": "guideRfq",
};

const basePageKeys = [
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

const productPageKeys = Object.values(productRouteMap);
const guidePageKeys = ["guideHub", ...Object.values(guideRouteMap)];
const allPageKeys = [...basePageKeys, ...productPageKeys, ...guidePageKeys];


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
  const isGuideActive = ["guides", "guideHub", "guideWaterWell", "guideBits", "guideRfq"].includes(current);

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

    <a class="nav-link" href="${r.guideHub}"${isGuideActive ? ' aria-current="page"' : ''}>${esc(copy.nav.guides || (isTr ? "Teknik Rehber" : isAr ? "الأدلة الهندسية" : "Engineering Guides"))}</a>
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
    <a href="${r.guideHub}" style="font-weight:700;color:var(--cyan);">${esc(copy.nav.guides || (isTr ? "Teknik Mühendislik Rehberi" : isAr ? "الأدلة الهندسية" : "Engineering Guides"))}</a>
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
        <div class="calc-result-desc" id="calc-rig-desc">800 m Ağır Hizmet Sınıfı: Kamyon üstü intikal, 361 HP güverte motoru, çift çamur sirkülasyonu.</div>
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
      : ["rigs", "pipes", "bits", ...productPageKeys].includes(pageKey)
        ? "equipment"
        : guidePageKeys.includes(pageKey)
          ? "guides"
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
  <meta name="theme-color" content="#EA580C" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="KD SONDAJ" />
  <link rel="apple-touch-icon" href="/assets/apple-touch-icon.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/assets/apple-touch-icon.png" />
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
        <a class="brand" href="${routes[lang].home}" aria-label="${esc(site.name)}">
          <span class="brand-badge">KD</span>
          <div class="brand-text">
            <span class="brand-title">KD<span class="brand-accent">SONDAJ</span></span>
            <span class="brand-sub">${esc(copy.brandSub)}</span>
          </div>
        </a>
        <nav class="nav-center">${navLinks(lang, navCurrent)}</nav>
        <div class="header-actions">
          <nav class="lang-switcher" aria-label="Language">${langSwitch(pageKey, lang)}</nav>
          <a class="header-cta-quote" href="${routes[lang].contact}">
            <span>📋</span>
            <span>${lang === "tr" ? "Teklif İste" : lang === "ar" ? "طلب تسعير" : "Request Quote"}</span>
          </a>
          <a class="header-cta-wa" href="${whatsapp(copy)}" target="_blank" rel="noopener">
            <span class="pulse-dot-green"></span>
            <span>0541 191 63 01</span>
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
        <a class="brand" href="${routes[lang].home}" style="margin-bottom:1rem;" aria-label="${esc(site.name)}">
          <span class="brand-badge">KD</span>
          <div class="brand-text">
            <span class="brand-title">KD<span class="brand-accent">SONDAJ</span></span>
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
  <aside aria-label="WhatsApp Export Desk" class="wa-export-float">
    <div class="wa-export-tooltip">
      <div class="wa-pulse-container">
        <span class="wa-pulse-ping"></span>
        <span class="wa-pulse-dot"></span>
      </div>
      <div class="wa-tooltip-text">
        <span class="wa-tooltip-title">${lang === "tr" ? "WhatsApp İhracat & Teklif Masası" : lang === "ar" ? "مكتب تصدير الحفارات واتساب" : "WhatsApp Drilling Export Desk"}</span>
        <span class="wa-tooltip-status">+90 541 191 63 01 • ${lang === "tr" ? "Çevrimiçi" : lang === "ar" ? "متصل الآن" : "Online"}</span>
      </div>
    </div>
    <a href="${whatsapp(copy)}" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp: 0541 191 63 01" class="wa-export-btn">
      <svg viewBox="0 0 24 24"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-2.79 4.23c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81s.78 2.11.89 2.25c.11.15 1.51 2.42 3.73 3.3 1.85.73 2.22.59 2.62.55.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.15-.42-.27-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.15.21-.56.71-.69.86-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.21-.01-.33.1-.44.1-.1.22-.26.33-.39.11-.13.15-.21.22-.36.07-.14.04-.27-.02-.38-.06-.11-.49-1.17-.67-1.6-.17-.42-.35-.36-.49-.37z"/></svg>
    </a>
  </aside>
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

  const heroSlides = isTr ? [
    {
      img: "/assets/hero-field-rig.jpg",
      chip: "45 YILLIK ÜRETİM & SAHA TECRÜBESİ · 3000M KAPASİTE",
      title: "3000 Metre Derin Jeotermal ve Su Sondaj Kuleleri",
      lead: "Ağır dorse ve kamyon üstü hidrolik kuleler, yüksek torklu rotari tablaları ve kesintisiz kuyu açma gücü.",
      badges: ["3000 m Kuyu Derinliği", "110 Ton Kule Kapasitesi", "ISO & API Standartları"],
      tabLabel: "3000M AMİRAL GEMİSİ KULE"
    },
    {
      img: "/assets/trailer-rig.jpg",
      chip: "AĞIR DORSE SERİSİ · 1500–3000 METRE",
      title: "Derin Akiferler ve Rezervuarlar İçin Ağır Dorse Kuleler",
      lead: "Çift MAN 422 motor tahrikli, 5x510 ağır vinçli ve 7.5\" x 10\" çift pistonlu çamur pompası ile donatılmış amiral gemisi kuleler.",
      badges: ["Çift Bağımsız MAN Dizel", "5×510 Ağır Vinç", "70 RPM Rotari Tabla"],
      tabLabel: "1500–3000M AĞIR DORSE"
    },
    {
      img: "/assets/truck-rig.jpg",
      chip: "KAMYON ÜSTÜ HİDROLİK SERİ · 300–1200 METRE",
      title: "Hızlı İntikal Eden Kamyon Üstü Hidrolik Sondaj Kuleleri",
      lead: "6x4 ve 8x4 ağır şasiler üzerine kurulu, 4 hidrolik ayak krikolu, kompakt ve zorlu arazi koşullarında üstün manevra kabiliyeti.",
      badges: ["6x4 & 8x4 Ağır Şasi", "4 Hidrolik Dengeleme Ayağı", "14.50 m Kule Boyu"],
      tabLabel: "300–1200M KAMYON ÜSTÜ"
    },
    {
      img: "/assets/geothermal-rig.jpg",
      chip: "JEOTERMAL & ÖZEL PROJELER · 2500 METRE",
      title: "Yüksek Sıcaklık ve Basınç Dayanımlı Jeotermal Sistemler",
      lead: "Kuyu kontrol ekipmanları, blowout preventer (BOP) uyumlu kule yapısı ve yüksek debili sirkülasyon hatları ile maksimum saha emniyeti.",
      badges: ["Yüksek Sıcaklık Donanımı", "BOP Kuyu Kontrolü", "Özel Kule İmalatı"],
      tabLabel: "JEOTERMAL & ÖZEL KULELER"
    },
    {
      img: "/assets/drill-pipes.jpg",
      chip: "API SPEC 5D SONDAJ TİJLERİ & EKİPMANLAR",
      title: "Ağır Hizmet Sondaj Boruları ve Kuyu İçi Ekipmanları",
      lead: "E, X, G, S çelik kalitelerinde API Spec 5D / Spec 7-1 sertifikalı tijler, IADC tricone matkaplar ve Duplex çamur pompaları.",
      badges: ["API Spec 5D & 7-1", "Duplex 6\" Çamur Pompası", "IADC Tricone Matkaplar"],
      tabLabel: "API TİJ, POMPA & EKİPMAN"
    }
  ] : isAr ? [
    {
      img: "/assets/hero-field-rig.jpg",
      chip: "٤٥ عاماً من الخبرة الصناعية والميدانية · قدرة حفر ٣٠٠٠ متر",
      title: "حفارات آبار مياه عميقة وطاقة حرارية حتى ٣٠٠٠ متر",
      lead: "حفارات مقطورة وشاحنة هيدروليكية ثقيلة، طاولات حفر دوارة عالية العزم وقدرة حفر مستمرة وموثوقة.",
      badges: ["عمق حفر يصل ٣٠٠٠ متر", "برج حفر قدرة ١١٠ طن", "معايير الجودة العالمية ISO و API"],
      tabLabel: "حفارة القمة ٣٠٠٠ متر"
    },
    {
      img: "/assets/trailer-rig.jpg",
      chip: "سلسلة الحفارات المقطورة الثقيلة · ١٥٠٠ - ٣٠٠٠ متر",
      title: "حفارات مقطورة عملاقة للطبقات العميقة ومشاريع الطاقة",
      lead: "محركا ديزل MAN 422، ونش سحب ثقيل 5×510 ومضخة طين دوبلكس ثنائية الأسطوانات لمشاريع الآبار الكبرى.",
      badges: ["محركا ديزل مزدوجان", "ونش سحب فائق التحمل", "طاولة دوارة 70 دورة/دقيقة"],
      tabLabel: "مقطورة ثقيلة ١٥٠٠-٣٠٠٠م"
    },
    {
      img: "/assets/truck-rig.jpg",
      chip: "حفارات شاحنة هيدروليكية · ٣٠٠ - ١٢٠٠ متر",
      title: "حفارات شاحنة هيدروليكية سريعة الانتشار وعالية العزم",
      lead: "مثبتة على شاحنات 6x4 و 8x4 مع 4 ركائز هيدروليكية لتسوية البرج ومناورة عالية في التضاريس الوعرة.",
      badges: ["شاسيه شاحنة 6x4 و 8x4", "٤ ركائز هيدروليكية", "برج حفر بارتفاع ١٤.٥ م"],
      tabLabel: "حفارات شاحنة ٣٠٠-١٢٠٠م"
    },
    {
      img: "/assets/geothermal-rig.jpg",
      chip: "حفارات الطاقة الحرارية والمشاريع الخاصة · ٢٥٠٠ متر",
      title: "أنظمة حفر آبار الطاقة الحرارية عالية الحرارة والضغط",
      lead: "متوافقة مع موانع الانفجار BOP ومجهزة بخطوط دوران عالية التدفق لأقصى درجات الأمان الميداني.",
      badges: ["مقاومة درجات الحرارة العالية", "تحكم بأمان الآبار BOP", "تصنيع هندسي مخصص"],
      tabLabel: "طاقة حرارية ومشاريع خاصة"
    },
    {
      img: "/assets/drill-pipes.jpg",
      chip: "أنابيب حفر ومعدات الآبار بمواصفات معهد البترول الأمريكي",
      title: "أنابيب حفر API ورؤوس حفر مخروطية ومضخات طين دوبلكس",
      lead: "أنابيب حفر من فولاذ E, X, G, S عالية المتانة، رؤوس حفر IADC ومضخات طين مزدوجة المفعول.",
      badges: ["معايير API Spec 5D & 7-1", "مضخة طين دوبلكس 6 إنش", "رؤوس حفر تريكون IADC"],
      tabLabel: "أنابيب API ومضخات ومعدات"
    }
  ] : [
    {
      img: "/assets/hero-field-rig.jpg",
      chip: "45 YEARS DRILLING & MANUFACTURING LEGACY · 3000M RATING",
      title: "Engineered Deep Geothermal & Water Well Drilling Rigs up to 3000m",
      lead: "Heavy trailer-mounted and truck hydraulic drilling rigs engineered with high-torque rotary tables and continuous borehole endurance.",
      badges: ["3000m Depth Rating", "110-Ton Mast Capacity", "ISO & API Quality Standard"],
      tabLabel: "3000M FLAGSHIP RIG"
    },
    {
      img: "/assets/trailer-rig.jpg",
      chip: "HEAVY TRAILER RIG SERIES · 1500–3000 METERS",
      title: "Heavy-Duty Trailer Drilling Rigs for Deep Reservoirs & Aquifers",
      lead: "Powered by dual MAN 422 diesel engines, 5x510 heavy drawworks, and 7.5\" x 10\" duplex double-acting mud pump.",
      badges: ["Dual Independent Diesel Engines", "5×510 Heavy Drawworks", "70 RPM Rotary Table"],
      tabLabel: "1500–3000M HEAVY TRAILER"
    },
    {
      img: "/assets/truck-rig.jpg",
      chip: "TRUCK-MOUNTED HYDRAULIC SERIES · 300–1200 METERS",
      title: "Rapid-Mobilization Heavy Truck Drilling Rigs for Tough Terrains",
      lead: "Built on 6x4 and 8x4 heavy commercial chassis with 4 hydraulic leveling jacks, compact footprint and agile field navigation.",
      badges: ["6x4 & 8x4 Heavy Chassis", "4 Hydraulic Leveling Jacks", "14.50m Mast Height"],
      tabLabel: "300–1200M TRUCK MOUNTED"
    },
    {
      img: "/assets/geothermal-rig.jpg",
      chip: "GEOTHERMAL & SPECIAL PROJECTS · 2500 METERS",
      title: "High-Temperature & High-Pressure Geothermal Exploration Rigs",
      lead: "Equipped for well control equipment, BOP compatibility, and high-volume mud circulation lines for maximum field safety.",
      badges: ["High-Temp Resistant", "BOP Well Control Ready", "Custom Engineered Mast"],
      tabLabel: "GEOTHERMAL & SPECIAL RIGS"
    },
    {
      img: "/assets/drill-pipes.jpg",
      chip: "API SPEC 5D DRILL PIPES & DOWNHOLE TOOLS",
      title: "Heavy-Duty Drill Pipes, Mud Pumps & Downhole Tooling",
      lead: "API Spec 5D / Spec 7-1 certified drill pipes in steel grades E, X, G, S, IADC tricone bits, and Duplex reciprocating mud pumps.",
      badges: ["API Spec 5D & 7-1 Certified", "Duplex 6\" Mud Pumps", "IADC Tricone Rock Bits"],
      tabLabel: "API PIPES, PUMPS & TOOLS"
    }
  ];

  const modernProducts = [
    {
      slug: "trailer-1500-3000",
      routeKey: "productTrailer3000",
      img: "/assets/trailer-rig.jpg",
      cat: "trailer",
      topBadge: isTr ? "🚜 Dorse Kule" : isAr ? "🚜 حفارة مقطورة" : "🚜 Trailer Rig",
      bottomBadge: isTr ? "1500–3000 m · 110T Kule" : isAr ? "١٥٠٠–٣٠٠٠ م · برج ١١٠ طن" : "1500–3000m · 110T Mast",
      title: isTr ? "1500–3000m Dorse Sondaj Kulesi" : isAr ? "حفارة مقطورة ١٥٠٠ - ٣٠٠٠ متر" : "1500–3000m Trailer Drilling Rig",
      desc: isTr ? "Çift MAN 422 motor, 5x510 vinç, derin jeotermal ve akifer kuyu açma kulesi." : isAr ? "محركا ديزل مزدوجان MAN 422، ونش 5x510 لحفر الآبار العميقة والطاقة الحرارية." : "Dual MAN 422 engines, 5x510 drawworks for deep geothermal and water aquifers.",
      moq: isTr ? "KAPASİTE: 3000 M" : isAr ? "القدرة: ٣٠٠٠ م" : "CAPACITY: 3000M"
    },
    {
      slug: "special-2500",
      routeKey: "productSpecial2500",
      img: "/assets/geothermal-rig.jpg",
      cat: "trailer",
      topBadge: isTr ? "🌋 Jeotermal" : isAr ? "🌋 طاقة حرارية" : "🌋 Geothermal",
      bottomBadge: isTr ? "2500 m · Özel İmalat" : isAr ? "٢٥٠٠ م · تصنيع خاص" : "2500m · Custom Build",
      title: isTr ? "2500m Özel Derin Kuyu Kulesi" : isAr ? "حفارة آبار عميقة ٢٥٠٠ متر خاصة" : "2500m Deep Geothermal Rig",
      desc: isTr ? "Jeotermal rezervuar ve yüksek basınçlı derin formasyonlar için özel imalat kule." : isAr ? "حفارة مخصصة لطبقات الأرض الحرارية والضغوط العالية." : "Custom-engineered rig for geothermal reservoirs and high-pressure deep horizons.",
      moq: isTr ? "KAPASİTE: 2500 M" : isAr ? "القدرة: ٢٥٠٠ م" : "CAPACITY: 2500M"
    },
    {
      slug: "trailer-1000-1200",
      routeKey: "productTrailer1200",
      img: "/assets/trailer-rig.jpg",
      cat: "trailer",
      topBadge: isTr ? "🚜 Dorse Kule" : isAr ? "🚜 حفارة مقطورة" : "🚜 Trailer Rig",
      bottomBadge: isTr ? "1000–1200 m · 90T Kule" : isAr ? "١٠٠٠–١٢٠٠ م · برج ٩٠ طن" : "1000–1200m · 90T Mast",
      title: isTr ? "1000–1200m Dorse Sondaj Kulesi" : isAr ? "حفارة مقطورة ١٠٠٠ - ١٢٠٠ متر" : "1000–1200m Trailer Drilling Rig",
      desc: isTr ? "DSİ, belediye ve sulama kooperatifleri için yüksek torklu derin kuyu kulesi." : isAr ? "حفارة مقطورة مثالية لمشاريع مياه الشرب البلدية والزراعية الكبرى." : "High-torque deep well rig for municipal water and agricultural cooperatives.",
      moq: isTr ? "KAPASİTE: 1200 M" : isAr ? "القدرة: ١٢٠٠ م" : "CAPACITY: 1200M"
    },
    {
      slug: "truck-1000-1200",
      routeKey: "productTruck1200",
      img: "/assets/truck-rig.jpg",
      cat: "truck",
      topBadge: isTr ? "🚚 Kamyon Kule" : isAr ? "🚚 حفارة شاحنة" : "🚚 Truck Rig",
      bottomBadge: isTr ? "1000–1200 m · 8x4 Şasi" : isAr ? "١٠٠٠–١٢٠٠ م · شاسيه 8x4" : "1000–1200m · 8x4 Chassis",
      title: isTr ? "1000–1200m Kamyon Üstü Kule" : isAr ? "حفارة شاحنة ١٠٠٠ - ١٢٠٠ متر" : "1000–1200m Truck Mounted Rig",
      desc: isTr ? "8x4 kamyon şasisi üzerinde yüksek manevra ve intikal kabiliyetine sahip hidrolik kule." : isAr ? "حفارة هيدروليكية مدمجة على شاحنة 8x4 بحركة سريعة وعزم دوران قوي." : "Heavy hydraulic rig on 8x4 chassis delivering rapid mobilization and high torque.",
      moq: isTr ? "KAPASİTE: 1200 M" : isAr ? "القدرة: ١٢٠٠ م" : "CAPACITY: 1200M"
    },
    {
      slug: "truck-800",
      routeKey: "productTruck800",
      img: "/assets/truck-rig.jpg",
      cat: "truck",
      topBadge: isTr ? "🚚 Kamyon Kule" : isAr ? "🚚 حفارة شاحنة" : "🚚 Truck Rig",
      bottomBadge: isTr ? "800 m · 6x4 Şasi" : isAr ? "٨٠٠ م · شاسيه 6x4" : "800m · 6x4 Chassis",
      title: isTr ? "800m Kamyon Üstü Hidrolik Kule" : isAr ? "حفارة شاحنة ٨٠٠ متر هيدروليكية" : "800m Truck Mounted Rig",
      desc: isTr ? "Orta ve derin su kuyuları için optimum yakıt sarfiyatı ve hızlı kuyu tamamlama." : isAr ? "كفاءة وقود مثالية وسرعة إنجاز عالية لآبار المياه المتوسطة والعميقة." : "Optimal fuel economy and fast well completion for mid to deep water aquifers.",
      moq: isTr ? "KAPASİTE: 800 M" : isAr ? "القدرة: ٨٠٠ م" : "CAPACITY: 800M"
    },
    {
      slug: "drill-pipes",
      routeKey: "productPipes",
      img: "/assets/drill-pipes.jpg",
      cat: "equipment",
      topBadge: isTr ? "🔩 Tij &amp; Boru" : isAr ? "🔩 أنابيب حفر" : "🔩 Drill Pipes",
      bottomBadge: isTr ? "2 3/8\" – 5 1/2\" · API Spec 5D" : isAr ? "٢ ٣/٨ إلى ٥ ١/٢ إنش · معايير API" : "2 3/8\" – 5 1/2\" · API Spec 5D",
      title: isTr ? "API Spec 5D Sondaj Tijleri" : isAr ? "أنابيب حفر معتمدة API Spec 5D" : "API Spec 5D Drill Pipes",
      desc: isTr ? "E, X, G, S kalite dikişsiz çelik gövde ve sürtünme kaynaklı sert dolgulu takım contaları." : isAr ? "أنابيب فولاذية غير ملحومة من درجات E, X, G, S مع وصلات ملحومة بالاحتكاك." : "Seamless drill pipes in steel grades E, X, G, S with hardbanded friction-welded tool joints.",
      moq: isTr ? "STANDART: API 5D" : isAr ? "المعيار: API 5D" : "STANDARD: API 5D"
    },
    {
      slug: "mud-pumps",
      routeKey: "productPumps",
      img: "/assets/mud-pump.jpg",
      cat: "equipment",
      topBadge: isTr ? "⚙️ Çamur Pompası" : isAr ? "⚙️ مضخة طين" : "⚙️ Mud Pump",
      bottomBadge: isTr ? "21–62 Bar · 895 PSI" : isAr ? "٢١-٦٢ بار · ٨٩٥ PSI" : "21–62 Bar · 895 PSI",
      title: isTr ? "Duplex 6\" Çift Piston Çamur Pompası" : isAr ? "مضخة طين دوبلكس ثنائية الأسطوانة 6 إنش" : "Duplex 6\" Reciprocating Mud Pump",
      desc: isTr ? "Çift etkili pistonlu resiprokal çamur pompası, zorlu sirkülasyon koşullarına dayanıklı." : isAr ? "مضخة طين ترددية مزدوجة المفعول تتحمل أقسى ظروف تدوير سائل الحفر." : "Heavy-duty double-acting reciprocating mud pump built for demanding drilling fluids.",
      moq: isTr ? "BASINÇ: 62 BAR" : isAr ? "الضغط: ٦٢ بار" : "PRESSURE: 62 BAR"
    },
    {
      slug: "drill-bits",
      routeKey: "productBits",
      img: "/assets/tricone-bits.jpg",
      cat: "equipment",
      topBadge: isTr ? "💎 Sondaj Matkabı" : isAr ? "💎 رؤوس حفر" : "💎 Drill Bits",
      bottomBadge: isTr ? "IADC 111–637 · TCI / Freze" : isAr ? "IADC 111–637 · كربيد وفولاذ" : "IADC 111–637 · TCI / Steel Tooth",
      title: isTr ? "IADC Tricone Döner Konili Matkaplar" : isAr ? "رؤوس حفر مخروطية دوارة IADC Tricone" : "IADC Tricone Roller Cone Bits",
      desc: isTr ? "Yumuşak alüvyondan en sert kuvarsit ve bazalt formasyonlarına kadar yüksek penetrasyon hızı." : isAr ? "سرعة اختراق فائقة من طبقات الطمي الرخوة حتى أصلب صخور البازلت والكوارتز." : "High penetration rate engineered from soft alluvium to ultra-hard basalt and quartzite formations.",
      moq: isTr ? "IADC SERTİFİKALI" : isAr ? "معتمد IADC" : "IADC CERTIFIED"
    }
  ];

  const b2bCards = isTr ? [
    { num: "1", title: "Şartnameye Uygun İmalat", desc: "Kuyu hedef derinliği, kule kaldırma tonajı, vinç tambur kapasitesi ve hidrolik güç üniteleri tam proje teknik şartnamenize göre üretilir." },
    { num: "2", title: "İhracat & Global Lojistik", desc: "Orta Doğu, Kuzey Afrika, Türki Cumhuriyetler ve Balkanlar'a anahtar teslim gümrükleme, konteyner & lowbed lojistiği ve tam ihracat dokümantasyonu." },
    { num: "3", title: "45 Yıllık Saha & İmalat Mirası", desc: "1980'den bu yana Türkiye'nin ve bölgenin en zorlu jeolojik formasyonlarında test edilmiş, yüzlerce kule imal etmiş sağlam mühendislik mirası." },
    { num: "4", title: "Hızlı Teklif & 7/24 Teknik Servis", desc: "Kapsamlı teknik şartname ve fiyat teklifleri 24 saat içinde yanıtlanır; saha kurulumu, operatör eğitimi ve garantili yedek parça temini sağlanır." }
  ] : isAr ? [
    { num: "1", title: "تصنيع وفق الشروط والمواصفات", desc: "يتم تصنيع البرج وقدرة السحب ومحركات الديزل وأنظمة الهيدروليك بدقة تامة حسب العمق المطلوب والشروط الفنية لمشروعك." },
    { num: "2", title: "شحن وتصدير دولي معتمد", desc: "تجهيز الشحن والشاحنات المنخفضة Lowbed وحاويات التصدير للشرق الأوسط وشمال أفريقيا ودول البلقان مع كافة الوثائق الجمركية." },
    { num: "3", title: "٤٥ عاماً من الخبرة الصناعية", desc: "منذ عام ١٩٨٠ في قلب قطاع الحفر؛ مئات الحفارات العاملة في أعتى التضاريس الجيولوجية الصعبة والمشاريع الكبرى." },
    { num: "4", title: "تسعير سريع ودعم فني متواصل", desc: "تسعير وعروض مواصفات فنية خلال ٢٤ ساعة مع تدريب مشغلي الحفارات ميدانياً وضمان قطع الغيار الأصلية." }
  ] : [
    { num: "1", title: "Specification-Driven Production", desc: "Mast tonnage, drawworks spooling, engine horsepower and hydraulic units built strictly to your project depth and formation specs." },
    { num: "2", title: "Global Export & Heavy Logistics", desc: "Turnkey container and lowbed export logistics to Middle East, North Africa, Central Asia and Europe with full export documentation." },
    { num: "3", title: "45-Year Manufacturing Legacy", desc: "Since 1980, hundreds of drilling rigs manufactured and field-proven across the most demanding hydrogeological formations." },
    { num: "4", title: "Responsive Quoting & Field Support", desc: "Detailed technical datasheets and quotations delivered within 24 hours; on-site commissioning and guaranteed spare parts support." }
  ];

  const sectors = isTr ? [
    { icon: "🌋", title: "Jeotermal Enerji Santralleri (JES)", desc: "Yüksek sıcaklık ve entalpiye sahip derin jeotermal rezervuarlar için BOP kuyu kontrol uyumlu ağır dorse kuleler." },
    { icon: "💧", title: "DSİ & Belediye Şehir Suyu", desc: "1000–2000m derinlikte kesintisiz içme ve kullanma suyu temini sağlayan yüksek debili derin kuyu sondajları." },
    { icon: "🌾", title: "Tarımsal Sulama Kooperatifleri", desc: "Geniş çaplı akifer açma, yüksek debili dalgıç pompa borulaması ve optimum yakıt verimliliği sağlayan kamyon kuleler." },
    { icon: "⛏️", title: "Karotlu Maden & Cevher Arama", desc: "Tel hatlı (wireline) elmaslı karotiyer sistemleri ile yüksek karot yüzdesi sağlayan hassas maden arama kuleleri." },
    { icon: "🏗️", title: "Jeoteknik & Zemin İyileştirme", desc: "Baraj, otoyol, tünel ve temel enjeksiyon & fore kazık sondajları için yüksek torklu hidrolik delme üniteleri." },
    { icon: "🏭", title: "Endüstriyel Tesis & Fabrika Suyu", desc: "Kesintisiz üretim proses suyu ihtiyacı olan fabrikalar ve sanayi bölgeleri için garantili endüstriyel su kuyuları." }
  ] : isAr ? [
    { icon: "🌋", title: "محطات الطاقة الحرارية الأرضية", desc: "حفارات مقطورة ثقيلة متوافقة مع موانع الانفجار BOP لآبار الطاقة الحرارية ذات درجات الحرارة والضغوط العالية." },
    { icon: "💧", title: "مشاريع مياه الشرب البلدية", desc: "حفر آبار مياه عميقة من ١٠٠٠ إلى ٢٠٠٠ متر لتأمين مياه الشرب للمدن والمؤسسات المائية الحكومية." },
    { icon: "🌾", title: "مشاريع الري والزراعة الكبرى", desc: "حفر آبار مياه زراعية بأقطار واسعة وتجهيز المضخات الغاطسة بكفاءة تشغيل واستهلاك وقود اقتصادي." },
    { icon: "⛏️", title: "استكشاف المعادن بالعينات اللبية", desc: "أنظمة حفر سلكية Wireline ذات رؤوس ألماسية لاستخراج عينات الصخور بدقة ونسبة استرداد عالية." },
    { icon: "🏗️", title: "أعمال الجيوتقنية وتحسين التربة", desc: "حفر السدود والأنفاق وحقن الأساسات والخوازيق بوحدات هيدروليكية عالية العزم." },
    { icon: "🏭", title: "تأمين مياه المصانع والمنشآت", desc: "حفر آبار مياه صناعية مستمرة لتأمين خطوط الإنتاج والمنشآت الصناعية الكبرى." }
  ] : [
    { icon: "🌋", title: "Geothermal Power Plants", desc: "BOP-compatible heavy trailer rigs engineered for high-enthalpy and high-temperature deep geothermal reservoirs." },
    { icon: "💧", title: "Municipal Water Supply", desc: "Deep water well drilling from 1000m to 2000m ensuring uninterrupted public drinking water supplies." },
    { icon: "🌾", title: "Agricultural Irrigation", desc: "Large-diameter borehole drilling, high-flow submersible pumping, and fuel-efficient truck-mounted rigs." },
    { icon: "⛏️", title: "Mineral Exploration & Coring", desc: "Wireline diamond coring systems delivering high core recovery rates for mineral discovery and reservoir logging." },
    { icon: "🏗️", title: "Geotechnical & Soil Stabilization", desc: "High-torque hydraulic drilling units for dams, tunnels, foundation grouting, and micropile installations." },
    { icon: "🏭", title: "Industrial Plant Water Supply", desc: "Guaranteed industrial water well engineering for factories and industrial zones requiring continuous process water." }
  ];

  const main = `
  <!-- Asiaplast-Inspired Multi-Slide Interactive Hero Carousel -->
  <section class="hero-carousel-section" id="hero-carousel">
    <div class="hero-slides-wrapper">
      ${heroSlides.map((s, idx) => `
        <div class="hero-slide ${idx === 0 ? "active" : ""}" data-slide-index="${idx}" aria-hidden="${idx === 0 ? "false" : "true"}">
          <img class="hero-slide-bg" src="${s.img}" alt="${esc(s.title)}" ${idx === 0 ? 'fetchpriority="high" loading="eager"' : 'loading="lazy"'} />
          <div class="hero-gradient-overlay"></div>
          <div class="hero-grid-pattern"></div>
          
          <div class="hero-content-wrap">
            <div class="hero-text-col">
              <div class="hero-chip">
                <span class="pulse-dot"></span>
                <span>${s.chip}</span>
              </div>
              <h1 class="hero-title">${esc(s.title)}</h1>
              <p class="hero-lead">${esc(s.lead)}</p>
              
              <div class="hero-badges">
                ${s.badges.map((b) => `
                  <span class="hero-badge-pill">
                    <span class="check-icon">✓</span>
                    <span>${b}</span>
                  </span>
                `).join("")}
              </div>
              
              <div class="hero-cta-group">
                <a class="btn-primary-gradient" href="${routes[lang].contact}">
                  <span>📋</span>
                  <span>${isTr ? "Teklif İste" : isAr ? "طلب تسعير" : "Request a Quote"}</span>
                </a>
                <a class="btn-white-pill" href="${whatsapp(copy)}" target="_blank" rel="noopener">
                  <span class="pulse-dot-green"></span>
                  <span>WhatsApp: 0541 191 63 01</span>
                </a>
                <a class="btn-link-pill" href="${routes[lang].rigs}">
                  <span>${isTr ? "Modelleri İncele" : isAr ? "استكشف الموديلات" : "Explore Rigs"}</span>
                  <span class="arrow-sym">→</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      `).join("")}

      <div class="hero-arrows-row">
        <button id="hero-prev" class="hero-arrow-btn" type="button" aria-label="Previous Slide">‹</button>
        <button id="hero-next" class="hero-arrow-btn" type="button" aria-label="Next Slide">›</button>
      </div>
    </div>

    <!-- Asiaplast Signature Bottom Interactive Tabs Bar -->
    <div class="hero-bottom-tabs-bar">
      <div class="wrap">
        <div class="hero-tabs-grid">
          ${heroSlides.map((s, idx) => `
            <button type="button" class="hero-tab-btn ${idx === 0 ? "active" : ""}" data-target-slide="${idx}">
              <div class="hero-tab-header">
                <span class="hero-tab-num">0${idx + 1}</span>
                ${idx === 0 ? '<span class="hero-tab-live">LIVE</span>' : ""}
              </div>
              <p class="hero-tab-label">${esc(s.tabLabel)}</p>
              ${idx === 0 ? '<div class="hero-tab-progress-bar"></div>' : ""}
            </button>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Infinite Marquee Ticker Strip -->
    <div class="hero-marquee-strip" aria-hidden="true">
      <div class="hero-marquee-track">
        <span><span>•</span> 3000M JEOTERMAL SONDAJ KULELERİ</span>
        <span><span>•</span> KAMYON ÜSTÜ HİDROLİK KULELER</span>
        <span><span>•</span> API SPEC 5D SONDAJ TİJLERİ</span>
        <span><span>•</span> DUPLEX ÇİFT PİSTON ÇAMUR POMPALARI</span>
        <span><span>•</span> IADC TRICONE DÖNER KONİLİ MATKAPLAR</span>
        <span><span>•</span> 45+ YILLIK İMALAT TECRÜBESİ</span>
        <span><span>•</span> B2B GLOBAL İHRACAT &amp; LOJİSTİK</span>
        <span><span>•</span> DSİ &amp; BELEDİYE DERİN SU KUYULARI</span>
        <span><span>•</span> 3000M JEOTERMAL SONDAJ KULELERİ</span>
        <span><span>•</span> KAMYON ÜSTÜ HİDROLİK KULELER</span>
        <span><span>•</span> API SPEC 5D SONDAJ TİJLERİ</span>
        <span><span>•</span> DUPLEX ÇİFT PİSTON ÇAMUR POMPALARI</span>
        <span><span>•</span> IADC TRICONE DÖNER KONİLİ MATKAPLAR</span>
        <span><span>•</span> 45+ YILLIK İMALAT TECRÜBESİ</span>
        <span><span>•</span> B2B GLOBAL İHRACAT &amp; LOJİSTİK</span>
        <span><span>•</span> DSİ &amp; BELEDİYE DERİN SU KUYULARI</span>
      </div>
    </div>
  </section>

  <!-- Modern Product Range Catalog (Asiaplast Style Cards) -->
  <section class="section-block bg-slate-subtle" id="catalog">
    <div class="wrap">
      <div class="section-header-modern">
        <span class="chip-badge">${isTr ? "Katalog" : isAr ? "الكتالوج" : "Catalog"}</span>
        <h2 class="h2-modern">${isTr ? "Ürün ve Makine Yelpazesi" : isAr ? "سلسلة الحفارات والمعدات" : "Product &amp; Rig Range"}</h2>
        <p class="lead-sub">${isTr ? "Uluslararası standartlarda imal edilen dorse ve kamyon üstü sondaj kuleleri, tijler ve kuyu içi ekipmanları." : isAr ? "حفارات مقطورة وشاحنة وأنابيب ومعدات آبار مصنعة بأعلى المعايير العالمية." : "Manufactured to high engineering specifications for global drilling contractors and public tenders."}</p>
      </div>

      <div class="catalog-filter-bar">
        <button type="button" class="filter-btn active" data-filter="all">${isTr ? "Tüm Modeller" : isAr ? "جميع الموديلات" : "All Models"}</button>
        <button type="button" class="filter-btn" data-filter="trailer">${isTr ? "Dorse Kuleler" : isAr ? "حفارات مقطورة" : "Trailer Rigs"}</button>
        <button type="button" class="filter-btn" data-filter="truck">${isTr ? "Kamyon Üstü" : isAr ? "حفارات شاحنة" : "Truck Rigs"}</button>
        <button type="button" class="filter-btn" data-filter="equipment">${isTr ? "Ekipman &amp; Pompalar" : isAr ? "المضخات والمعدات" : "Equipment &amp; Pumps"}</button>
      </div>

      <div class="product-grid-modern">
        ${modernProducts.map((item) => `
          <article class="modern-prod-card" data-category="${item.cat}">
            <div>
              <div class="prod-card-media">
                <img class="prod-card-img" src="${item.img}" alt="${esc(item.title)}" loading="lazy" />
                <div class="prod-card-gradient"></div>
                <span class="prod-badge-top">${item.topBadge}</span>
                <span class="prod-badge-bottom">${item.bottomBadge}</span>
              </div>
              <div class="prod-card-body">
                <h3 class="prod-card-title">
                  <a href="${routes[lang][item.routeKey]}">${esc(item.title)}</a>
                </h3>
                <p class="prod-card-desc">${esc(item.desc)}</p>
              </div>
            </div>
            <div class="prod-card-footer">
              <span class="prod-moq-label">${item.moq}</span>
              <a class="prod-card-action" href="${routes[lang][item.routeKey]}">
                <span>${isTr ? "Teknik Şartname" : isAr ? "المواصفات الفنية" : "Technical Specs"}</span>
                <span class="arrow-sym">→</span>
              </a>
            </div>
          </article>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- B2B Excellence Matrix (Asiaplast 4-Column Numbered Cards) -->
  <section class="section-block border-y" id="b2b-excellence">
    <div class="wrap">
      <div class="section-header-center">
        <span class="chip-badge">${isTr ? "B2B Güvencesi" : isAr ? "المعايير الموثوقة" : "B2B Excellence"}</span>
        <h2 class="h2-modern">${isTr ? "Sondaj Ekipleri Neden KD SONDAJ'ı Tercih Ediyor?" : isAr ? "لماذا يختار المقاولون والشركات KD SONDAJ؟" : "Why Drilling Contractors Choose KD SONDAJ"}</h2>
        <p class="lead-sub">${isTr ? "Tasarım ve çelik imalatından anahtar teslim gümrükleme ve saha devreye almaya kadar tek sorumlu üretici ortak." : isAr ? "شريك تصنيع هندسي متكامل ومسؤول من التصميم والتصنيع حتى الشحن والتشغيل الميداني." : "A single, accountable manufacturing partner from structural engineering to container export and on-site commissioning."}</p>
      </div>

      <div class="b2b-grid">
        ${b2bCards.map((c) => `
          <div class="b2b-card">
            <span class="b2b-num-badge">${c.num}</span>
            <h3 class="b2b-card-title">${esc(c.title)}</h3>
            <p class="b2b-card-desc">${esc(c.desc)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- Industries & Sectors We Serve (Asiaplast 6-Card Clean Grid) -->
  <section class="section-block bg-slate-subtle" id="sectors">
    <div class="wrap">
      <div class="section-header-center">
        <span class="chip-badge">${isTr ? "Sektörler" : isAr ? "القطاعات" : "Sectors"}</span>
        <h2 class="h2-modern">${isTr ? "Hizmet Verdiğimiz Başlıca Sektörler" : isAr ? "القطاعات والصناعات التي نخدمها" : "Key Industries We Serve"}</h2>
        <p class="lead-sub">${isTr ? "Farklı kuyu derinliği ve jeolojik formasyon gereksinimlerine özel mühendislik çözümleri." : isAr ? "حلول هندسية مخصصة لأعماق الآبار المختلفة وظروف التكوينات الجيولوجية المتنوعة." : "Engineered drilling systems customized for complex formations and geological requirements."}</p>
      </div>

      <div class="sectors-grid">
        ${sectors.map((s) => `
          <div class="sector-card">
            <span class="sector-card-icon">${s.icon}</span>
            <h3 class="sector-card-title">${esc(s.title)}</h3>
            <p class="sector-card-desc">${esc(s.desc)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- Interactive Subterranean Quote & Rig Selector Calculator -->
  <section class="section-block" id="calculator">
    <div class="wrap">
      ${quoteCalculator(lang)}
    </div>
  </section>

  <!-- Asiaplast-Style Modern FAQ Accordion -->
  <section class="section-block border-y" id="faq">
    <div class="wrap">
      <div class="faq-modern-grid">
        <div>
          <span class="chip-badge">${isTr ? "Sıkça Sorulanlar" : isAr ? "الأسئلة الشائعة" : "FAQ"}</span>
          <h2 class="h2-modern">${isTr ? "Merak Edilen Sorular ve Cevaplar" : isAr ? "الأسئلة الشائعة حول الحفارات والتصدير" : "Frequently Asked Questions"}</h2>
          <p class="lead-sub" style="margin-bottom:1.5rem;">${isTr ? "İmalat süreleri, kule teslimat şartları, gümrükleme ve teknik servis hakkında en çok sorulan konular." : isAr ? "كل ما تود معرفته عن مدد التصنيع، الشحن الدولي، شروط التسليم والضمان الميداني." : "Everything you need to know about lead times, international delivery terms, shipping and spare parts guarantee."}</p>
          <a class="btn-primary-gradient" href="${routes[lang].contact}">
            <span>📋</span>
            <span>${isTr ? "Özel Teklif İste" : isAr ? "طلب عرض خاص" : "Get Custom Quote"}</span>
          </a>
        </div>

        <div class="faq-modern-list">
          ${copy.faq.map((item) => `
            <details class="faq-modern-item">
              <summary class="faq-modern-summary">
                <span>${esc(item.q)}</span>
                <span class="faq-modern-arrow">▸</span>
              </summary>
              <div class="faq-modern-content">
                <p>${esc(item.a)}</p>
              </div>
            </details>
          `).join("")}
        </div>
      </div>
    </div>
  </section>

  <!-- Asiaplast-Style Ready for Bulk Quotation CTA Banner -->
  <section class="bulk-quote-section" id="bulk-quote">
    <div class="wrap bulk-quote-wrap">
      <span class="chip-badge">${isTr ? "Küresel İhracat Masası" : isAr ? "مكتب التصدير الدولي" : "Global Export Desk"}</span>
      <h2 class="bulk-quote-title">${isTr ? "Sondaj Kulenizi veya Ekipmanınızı Birlikte Projelendirelim" : isAr ? "هل أنت جاهز لتسعير حفارتك أو تجهيز مشروعك؟" : "Ready for a Complete Rig &amp; Equipment Quotation?"}</h2>
      <p class="bulk-quote-lead">${isTr ? "Hedef kuyu derinliği, arazi yapısı ve lokasyon bilgilerinizi iletin — 24 saat içinde detaylı teknik veri föyü ve şartname teklifinizi sunalım." : isAr ? "أرسل عمق البئر المستهدف وطبيعة الأرض والبلد المستلم — وسنوافيك بعرض فني ومالي مفصل خلال ٢٤ ساعة." : "Send your target well depth, geology, and destination country — receive a comprehensive technical proposal within 24 hours."}</p>
      
      <div class="bulk-quote-ctas">
        <a class="btn-primary-gradient" href="${routes[lang].contact}">
          <span>📋</span>
          <span>${isTr ? "Teklif Formunu Doldur" : isAr ? "نموذج طلب التسعير" : "Request a Quote"}</span>
        </a>
        <a class="btn-white-pill" href="${whatsapp(copy)}" target="_blank" rel="noopener">
          <span class="pulse-dot-green"></span>
          <span>WhatsApp: 0541 191 63 01</span>
        </a>
        <a class="btn-link-pill" href="${routes[lang].rigs}">
          <span>${isTr ? "Kule Kataloğu" : isAr ? "كتالوج الحفارات" : "Browse Rig Catalog"}</span>
          <span class="arrow-sym">→</span>
        </a>
      </div>
    </div>
  </section>
  `;

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
          <img class="showcase-img" src="/assets/hero-field-rig.jpg" alt="KD Sondaj Derin Sondaj Kulesi Sahada" />
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
        <img class="showcase-img" src="/assets/tricone-bits.jpg" alt="KD Sondaj Tricone Matkaplar IADC Standartları" />
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
          <caption>Duplex 6" Çamur Pompası Teknik Telemetri Tablosu</caption>
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
        <img class="showcase-img" src="/assets/truck-rig.jpg" alt="KD Sondaj Kamyon Üstü Sondaj Makinesi" />
        <div class="showcase-content">
          <span class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span> KD-TRUCK SERİSİ // HİDROLİK KULE SİSTEMİ</span>
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
          <caption>API Standart Sondaj Tiji Ölçü ve Kalite Tablosu</caption>
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
        <img class="showcase-img" src="/assets/tricone-bits.jpg" alt="KD Sondaj Tricone Matkap Serisi IADC" />
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

function renderProductPage(lang, product) {
  const copy = locales[lang];
  const p = product[lang] || product.tr;
  const isTr = lang === "tr";
  const isAr = lang === "ar";
  const productRouteKey = productRouteMap[product.id];
  const path = routes[lang][productRouteKey];

  const specsRows = product.specsTable.map((s) => `
    <tr>
      <td>${esc(s[lang] || s.tr || s.param)}</td>
      <td>${esc(s.val)}</td>
    </tr>
  `).join("");

  const appItems = p.applications.map((app) => `
    <li style="margin-bottom:0.6rem;display:flex;align-items:flex-start;gap:0.6rem;">
      <span style="color:var(--signal);font-weight:700;">✓</span>
      <span>${esc(app)}</span>
    </li>
  `).join("");

  const geoFaq = p.geoAnswers.map((item) => `
    <div class="geo-qa-item">
      <strong>Q: ${esc(item.q)}</strong>
      <p>A: ${esc(item.a)}</p>
    </div>
  `).join("");

  const main = `
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(lang, [
        { name: copy.nav.equipment, path: routes[lang].equipment },
        { name: isTr ? "Sondaj Makineleri" : isAr ? "حفارات الحفر" : "Drilling Rigs", path: routes[lang].rigs },
        { name: p.name, path: path }
      ])}
      <div class="telemetry-pill shimmer-badge">
        <span class="beacon-dot"></span>
        <span>${esc(product.depthStr)} // ${esc(product.hp || "HEAVY DUTY")}</span>
      </div>
      <h1>${esc(p.h1)}</h1>
      <p class="lead">${esc(p.tagline)}</p>
    </div>
  </section>

  <section class="block" style="padding-top:1.5rem;">
    <div class="wrap">
      <div class="product-detail-layout">
        <!-- Main Technical Presentation -->
        <div>
          <div class="product-gallery-card reveal-on-scroll">
            <img src="${product.image || "/assets/trailer-rig.jpg"}" alt="${esc(p.name)}" />
          </div>

          <div class="panel reveal-on-scroll" style="background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-md);padding:1.75rem;margin-bottom:2rem;">
            <h2 style="font-size:1.35rem;margin-bottom:0.75rem;">${isTr ? "Mühendislik İncelemesi & Tasarım Amacı" : isAr ? "نظرة عامة على التصميم الهندسي" : "Engineering Overview & Purpose"}</h2>
            <p style="font-size:1.02rem;line-height:1.75;color:var(--text-soft);margin-bottom:1.25rem;">${esc(p.summary)}</p>
            
            <h3 style="font-size:1.1rem;margin-top:1.5rem;margin-bottom:0.75rem;">${isTr ? "Saha Uygulama Alanları" : isAr ? "مجالات التطبيق الميداني" : "Field Applications"}</h3>
            <ul style="list-style:none;padding:0;margin:0 0 1.5rem;">
              ${appItems}
            </ul>

            <div style="background:var(--bg-subtle);border-left:4px solid var(--signal);padding:1rem 1.25rem;border-radius:var(--radius-xs);">
              <strong style="color:var(--text-main);display:block;margin-bottom:0.35rem;">${isTr ? "Formasyon ve Kayaç Uyumluluğu" : isAr ? "التوافق مع الطبقات الجيولوجية" : "Geological Stratum Compatibility"}:</strong>
              <p style="margin:0;font-size:0.92rem;color:var(--text-soft);">${esc(p.formations)}</p>
            </div>
          </div>

          <div class="reveal-on-scroll">
            <h2 style="font-size:1.35rem;margin-bottom:0.75rem;">${isTr ? "Detaylı Teknik Spesifikasyon Tablosu" : isAr ? "جدول المواصفات الفنية التفصيلية" : "Technical Specifications Table"}</h2>
            <div class="table-wrap">
              <table class="product-specs-table">
                <thead>
                  <tr>
                    <th>${isTr ? "Mühendislik Parametresi" : isAr ? "المعيار الهندسي" : "Engineering Parameter"}</th>
                    <th>${isTr ? "Sertifikalı Değer / Kapasite" : isAr ? "القيمة المعتمدة / السعة" : "Certified Rating / Metric"}</th>
                  </tr>
                </thead>
                <tbody>
                  ${specsRows}
                </tbody>
              </table>
            </div>
          </div>

          <!-- GEO Q&A Section -->
          <div class="geo-qa-box reveal-on-scroll">
            <h3>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              ${isTr ? "Sık Sorulan Mühendislik Soruları & Cevapları" : isAr ? "الأسئلة الهندسية الشائعة وإجاباتها" : "Engineering Q&A Direct Answers"}
            </h3>
            ${geoFaq}
          </div>
        </div>

        <!-- Sticky RFQ & Commercial Inquire Sidebar -->
        <aside class="reveal-on-scroll">
          <div class="rfq-sticky-card">
            <span class="telemetry-pill shimmer-badge" style="margin-bottom:1rem;"><span class="beacon-dot"></span> B2B DOĞRUDAN FABRİKA</span>
            <h3 style="font-size:1.35rem;margin-bottom:0.5rem;">${esc(p.name)}</h3>
            <div class="rfq-price-tag">${isTr ? "Proje Bazlı Özel Fiyat Teklifi" : isAr ? "عرض سعر مخصص حسب المواصفات" : "Custom B2B Quotation"}</div>
            <p style="font-size:0.88rem;color:var(--text-soft);margin-bottom:1.25rem;">
              ${isTr ? "Kuyu derinliği, şasi tercihi (MAN / Mercedes / Dorse), çamur pompası ve tij çaplarına göre doğrudan mühendislik teklifi alın." : isAr ? "احصل على عرض سعر مباشر من المصنع حسب متطلبات العمق والشاسيه ومضخة الطين." : "Direct factory quote tailored to your borehole depth, chassis brand, mud hydraulics, and drill string."}
            </p>

            <ul class="rfq-feature-list">
              <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${isTr ? "CE & ISO 9001:2015 İmalat Güvencesi" : isAr ? "شهادات الجودة الأوروبية CE و ISO" : "CE & ISO 9001:2015 Certified Manufacturing"}</li>
              <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${isTr ? "Uluslararası Liman Teslimi (FOB Mersin / CIF)" : isAr ? "تسليم الموانئ الخليجية (FOB / CIF)" : "Worldwide Port Delivery (FOB Mersin / CIF Jebel Ali / Jeddah)"}</li>
              <li><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> ${isTr ? "1 Yıl Fabrika Garantisi & Süpervizör Eğitimi" : isAr ? "ضمان مصنعي وتدريب ميداني للمشغلين" : "1-Year Factory Warranty & On-site Field Commissioning"}</li>
            </ul>

            <div style="display:flex;flex-direction:column;gap:0.75rem;margin-top:1.5rem;">
              <a class="btn btn-wa" href="https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(isTr ? `Merhaba, ${p.name} makinesi için teknik şartname ve fiyat teklifi talep ediyorum.` : isAr ? `مرحباً، أطلب عرض سعر ومواصفات لحفارة ${p.name}.` : `Hello, I request technical specs and quotation for ${p.name}.`)}" target="_blank" rel="noopener" style="width:100%;justify-content:center;">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
                WhatsApp: 0541 191 63 01
              </a>
              <a class="btn btn-signal" href="${routes[lang].contact}" style="width:100%;justify-content:center;">
                📝 ${isTr ? "Resmi Teklif Formu Doldur" : isAr ? "نموذج طلب عرض السعر" : "Submit Official RFQ Form"}
              </a>
              <a class="btn btn-secondary" href="tel:+905411916301" style="width:100%;justify-content:center;">
                📞 +90 541 191 63 01
              </a>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </section>`;

  // B2B Google 2026 Developer Product Schema (Zero deceptive Merchant Center errors)
  const productSchema = {
    "@type": "Product",
    "@id": `${originUrl(path)}#product`,
    name: p.name,
    description: p.seoDesc,
    image: originUrl(product.image || "/assets/trailer-rig.jpg"),
    category: "Industrial Drilling Machinery",
    brand: {
      "@type": "Brand",
      name: site.name
    },
    manufacturer: {
      "@id": `${site.origin}/#organization`
    },
    additionalProperty: product.specsTable.map((s) => ({
      "@type": "PropertyValue",
      name: s[lang] || s.param,
      value: s.val
    })),
    offers: {
      "@type": "Offer",
      url: originUrl(path),
      priceCurrency: "USD",
      price: "0",
      priceSpecification: {
        "@type": "PriceSpecification",
        description: "B2B Custom Quotation based on project depth and delivery port terms"
      },
      availability: "https://schema.org/PreOrder",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@id": `${site.origin}/#organization`
      }
    }
  };

  const faqSchema = {
    "@type": "FAQPage",
    mainEntity: p.geoAnswers.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a
      }
    }))
  };

  return layout({
    lang,
    pageKey: productRouteKey,
    title: p.seoTitle,
    description: p.seoDesc,
    schema: [
      breadcrumbsLd([
        { name: copy.nav.equipment, path: routes[lang].equipment },
        { name: isTr ? "Sondaj Makineleri" : isAr ? "حفارات الحفر" : "Drilling Rigs", path: routes[lang].rigs },
        { name: p.name, path: path }
      ]),
      productSchema,
      faqSchema
    ],
    main
  });
}

function renderGuidePage(lang, guide) {
  const copy = locales[lang];
  const g = guide[lang] || guide.tr;
  const isTr = lang === "tr";
  const isAr = lang === "ar";
  const guideRouteKey = guideRouteMap[guide.id];
  const path = routes[lang][guideRouteKey];

  const sectionsHtml = g.content.map((sec) => `
    <h2>${esc(sec.h2)}</h2>
    <p>${esc(sec.p)}</p>
  `).join("");

  const main = `
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(lang, [
        { name: isTr ? "Mühendislik Rehberi" : isAr ? "الأدلة الهندسية" : "Engineering Guides", path: routes[lang].guideHub },
        { name: g.title, path: path }
      ])}
      <div class="telemetry-pill shimmer-badge">
        <span class="beacon-dot"></span>
        <span>${esc(guide.category)} // ${esc(guide.readingTime)}</span>
      </div>
      <h1>${esc(g.title)}</h1>
      <p class="lead">${esc(g.summary)}</p>
    </div>
  </section>

  <article class="block" style="padding-top:1rem;">
    <div class="wrap guide-article-wrap">
      <div class="guide-meta-bar">
        <span>👨‍🔧 <strong>KD SONDAJ Engineering Group</strong></span>
        <span>📅 2026 Edition</span>
        <span>⏱️ ${esc(guide.readingTime)}</span>
        <span>🏷️ ${esc(guide.category)}</span>
      </div>

      <div class="guide-prose reveal-on-scroll">
        ${sectionsHtml}

        <blockquote>
          ${isTr 
            ? "Mühendislik Tavsiyesi: Projenize en uygun kule tonajı ve tork konfigürasyonunu kuyu jeolojinize göre belirlemek için KD SONDAJ teknik ekibi ile iletişime geçebilirsiniz."
            : isAr 
            ? "توصية هندسية: لتحديد حمولة البرج وعزم الدوران الأمثل لطبقات أرض مشروعك، تواصل مباشرة مع الفريق الهندسي في KD SONDAJ."
            : "Engineering Notice: For tailored hook-load ratings, torque calculation, and mud hydraulic modeling matched to your strata, contact KD SONDAJ engineering."}
        </blockquote>
      </div>

      <div class="showcase-banner reveal-on-scroll" style="margin-top:3rem;">
        <img class="showcase-img" src="/assets/hero-field-rig.jpg" alt="KD SONDAJ" />
        <div class="showcase-content">
          <span class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span> TEKNİK DANIŞMANLIK &amp; TEKLİF</span>
          <h3>${isTr ? "Projeniz İçin Doğru Kuleyi Birlikte Belirleyelim" : isAr ? "دعنا نحدد الحفارة المناسبة لمشروعك" : "Consult Our Drilling Engineers"}</h3>
          <p>${isTr ? "Uzman mühendislerimiz kuyu derinliği ve arazi parametrelerinizi değerlendirerek en ekonomik ve dayanıklı makineyi önerir." : isAr ? "يقوم مهندسونا بدراسة عمق البئر والتكوين الصخري لاقتراح الحفارة الأكثر كفاءة." : "Our engineers analyze borehole depth and rock formation to recommend the most cost-effective rig package."}</p>
          <div class="cta-row" style="margin-top:1rem;">
            <a class="btn btn-wa" href="https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(isTr ? `Merhaba, ${g.title} rehberiniz hakkında teknik danışmanlık almak istiyorum.` : isAr ? `مرحباً، أود استشارة هندسية بناءً على دليل ${g.title}.` : `Hello, I would like to consult on ${g.title}.`)}" target="_blank" rel="noopener">
              WhatsApp: 0541 191 63 01
            </a>
            <a class="btn btn-signal" href="${routes[lang].contact}">
              ${isTr ? "Teklif Formu" : isAr ? "طلب تسعير" : "Request RFQ"}
            </a>
          </div>
        </div>
      </div>
    </div>
  </article>`;

  const articleSchema = {
    "@type": "TechArticle",
    "@id": `${originUrl(path)}#article`,
    headline: g.title,
    description: g.seoDesc,
    author: {
      "@type": "Organization",
      name: "KD SONDAJ Senior Engineering Team",
      url: site.origin
    },
    publisher: {
      "@id": `${site.origin}/#organization`
    },
    datePublished: "2026-01-15T08:00:00+03:00",
    dateModified: "2026-10-11T12:00:00+03:00",
    inLanguage: lang
  };

  return layout({
    lang,
    pageKey: guideRouteKey,
    title: g.seoTitle,
    description: g.seoDesc,
    schema: [
      breadcrumbsLd([
        { name: isTr ? "Mühendislik Rehberi" : isAr ? "الأدلة الهندسية" : "Engineering Guides", path: routes[lang].guideHub },
        { name: g.title, path: path }
      ]),
      articleSchema
    ],
    main
  });
}

function renderGuideHub(lang) {
  const copy = locales[lang];
  const isTr = lang === "tr";
  const isAr = lang === "ar";
  const path = routes[lang].guideHub;

  const title = isTr ? "Teknik Mühendislik ve Sondaj Rehberi" : isAr ? "الأدلة الهندسية والتقنية للحفر" : "Technical Drilling Engineering Guides";
  const desc = isTr
    ? "Su kuyusu açma, IADC matkap sınıflandırması, kule kanca yükü hesaplama ve uluslararası sondaj makinesi alım şartnameleri üzerine teknik kaynaklar."
    : isAr
    ? "أدلة هندسية حول حفر آبار المياه، وتصنيف رؤوس الحفر IADC، وحسابات حمولة الأبراج، ودفاتر شروط توريد الحفارات."
    : "Comprehensive engineering publications on water well rig selection, IADC roller cone bit classification, and international machinery procurement specifications.";

  const guideCards = guideList.map((g) => {
    const gl = g[lang] || g.tr;
    const rKey = guideRouteMap[g.id];
    return `
      <article class="guide-card reveal-on-scroll">
        <div>
          <span class="telemetry-pill shimmer-badge" style="margin-bottom:0.75rem;"><span class="beacon-dot"></span> ${esc(g.category)}</span>
          <h2 style="font-size:1.3rem;margin-bottom:0.6rem;line-height:1.4;">
            <a href="${routes[lang][rKey]}" style="color:var(--text-main);text-decoration:none;">${esc(gl.title)}</a>
          </h2>
          <p style="font-size:0.92rem;color:var(--text-soft);margin-bottom:1.25rem;">${esc(gl.summary)}</p>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;border-top:1px solid var(--border);padding-top:1rem;margin-top:1rem;">
          <span style="font-size:0.82rem;color:var(--text-muted);">${esc(g.readingTime)}</span>
          <a class="more" href="${routes[lang][rKey]}">${isTr ? "Rehberi Oku" : isAr ? "اقرأ الدليل" : "Read Full Guide"} →</a>
        </div>
      </article>
    `;
  }).join("");

  const main = `
  <section class="page-hero">
    <div class="wrap">
      ${crumbsHtml(lang, [{ name: title, path: path }])}
      <div class="telemetry-pill shimmer-badge">
        <span class="beacon-dot"></span>
        <span>TOPICAL AUTHORITY // GOOGLE 2026 E-E-A-T</span>
      </div>
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(desc)}</p>
    </div>
  </section>

  <section class="block" style="padding-top:1.5rem;">
    <div class="wrap">
      <div class="cards three">
        ${guideCards}
      </div>
    </div>
  </section>`;

  return layout({
    lang,
    pageKey: "guideHub",
    title: isTr ? "Sondaj Makineleri & Kuyu Mühendisliği Rehberi | KD SONDAJ" : isAr ? "دليل هندسة الحفارات وآبار المياه | KD SONDAJ" : "Drilling Rig Engineering Guides & Knowledge Base | KD SONDAJ",
    description: desc,
    schema: [
      breadcrumbsLd([{ name: title, path: path }]),
      {
        "@type": "CollectionPage",
        name: title,
        description: desc,
        url: originUrl(path)
      }
    ],
    main
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
  <link rel="manifest" href="/site.webmanifest" />
  <meta name="theme-color" content="#EA580C" />
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
    allPageKeys.map((key) => {
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
    allPageKeys.map((key) => ({
      path: routes[lang][key],
      file: routes[lang][key] === "/" ? "index.html" : `${routes[lang][key].replace(/^\//, "")}index.html`,
      lang,
      page: key,
    }))
  );
  list.push({ path: "/admin/", file: "admin/index.html", indexable: false });
  list.push({ path: "/404.html", file: "404.html", indexable: false });
  return JSON.stringify({ routes: list }, null, 2);
}

if (existsSync(dist)) rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });
mkdirSync(join(dist, "assets"), { recursive: true });
cpSync(join(root, "src/styles/site.css"), join(dist, "assets/site.css"));
cpSync(join(root, "src/js/site.js"), join(dist, "assets/site.js"));
cpSync(join(root, "src/assets"), join(dist, "assets"), { recursive: true });
cpSync(join(root, "src/sw.js"), join(dist, "sw.js"));

for (const lang of ["tr", "en", "ar"]) {
  // Base Pages (13)
  for (const key of basePageKeys) {
    write(fileFor(routes[lang][key]), renderers[key](lang));
  }

  // 11 Product Deep Pages
  for (const product of productList) {
    const rKey = productRouteMap[product.id];
    write(fileFor(routes[lang][rKey]), renderProductPage(lang, product));
  }

  // Guide Hub (1)
  write(fileFor(routes[lang].guideHub), renderGuideHub(lang));

  // 3 Topical Authority Guides
  for (const guide of guideList) {
    const rKey = guideRouteMap[guide.id];
    write(fileFor(routes[lang][rKey]), renderGuidePage(lang, guide));
  }
}

// Admin / Command Center
write(join(dist, "admin/index.html"), generateAdminDashboardHtml());

// 404 & Sitemap
write(join(dist, "404.html"), page404());
write(join(dist, "sitemap.xml"), buildSitemap());

// robots.txt with explicit OAI-SearchBot and other crawler permissions
write(
  join(dist, "robots.txt"),
  `User-agent: OAI-SearchBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Googlebot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Bingbot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: Applebot
Allow: /
Disallow: /admin/
Disallow: /api/

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/

Sitemap: ${site.origin}/sitemap.xml
`
);

// IndexNow verification key file at domain root
write(join(dist, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);

// LLMs.txt for Generative Engine Optimization (GEO)
write(join(dist, "llms.txt"), generateLlmsTxt());
write(join(dist, "llms-full.txt"), generateLlmsFullTxt());

// Build routes list
write(join(dist, "manus-routes.json"), buildRoutes());

// Progressive Web App Manifest
write(
  join(dist, "site.webmanifest"),
  JSON.stringify(
    {
      name: "KD SONDAJ — Sondaj Makineleri & Ekipman",
      short_name: "KD SONDAJ",
      description: "KD SONDAJ 1500–3000m Dorse ve Kamyon Üstü Sondaj Makineleri, Ekipman ve Uluslararası Mühendislik",
      start_url: "/",
      scope: "/",
      display: "standalone",
      background_color: "#FFFFFF",
      theme_color: "#EA580C",
      orientation: "portrait-primary",
      lang: "tr",
      categories: ["business", "productivity", "utilities"],
      icons: [
        {
          src: "/assets/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/assets/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any"
        },
        {
          src: "/assets/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable"
        },
        {
          src: "/assets/favicon.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any"
        },
        {
          src: "/assets/logo.svg",
          sizes: "any",
          type: "image/svg+xml",
          purpose: "any"
        }
      ],
      shortcuts: [
        {
          name: "Teklif İste",
          short_name: "Teklif",
          description: "Mühendislik teklif formu",
          url: "/iletisim/",
          icons: [{ src: "/assets/favicon.svg", sizes: "any" }]
        },
        {
          name: "Sondaj Makineleri",
          short_name: "Kuleler",
          description: "300–3000m Kule Kataloğu",
          url: "/ekipman/sondaj-makineleri/",
          icons: [{ src: "/assets/favicon.svg", sizes: "any" }]
        },
        {
          name: "WhatsApp Destek",
          short_name: "WhatsApp",
          description: "0541 191 63 01",
          url: "https://wa.me/905411916301",
          icons: [{ src: "/assets/favicon.svg", sizes: "any" }]
        }
      ]
    },
    null,
    2
  )
);
// Progressive Web App Service Worker
if (existsSync(join(root, "src", "sw.js"))) {
  write(join(dist, "sw.js"), readFileSync(join(root, "src", "sw.js"), "utf8"));
}

console.log(`Built KD SONDAJ static site into dist/ (Total ${allPageKeys.length * 3} localized pages + admin + PWA + GEO)`);

