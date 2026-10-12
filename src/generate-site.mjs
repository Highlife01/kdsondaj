import { mkdirSync, writeFileSync, cpSync, rmSync, existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { site, routes } from "./config.mjs";
import { machines, pipes, bitGroups, pumpRows, pumpCommon } from "./data/catalog.mjs";
import { productList } from "./data/products.mjs";
import { guideList } from "./data/guides.mjs";
import { posts as blogPosts } from "./data/blog.mjs";
import { generateLlmsTxt, generateLlmsFullTxt } from "./generate-llms.mjs";
import { generateAdminDashboardHtml } from "./admin-dashboard.mjs";
import { INDEXNOW_KEY } from "./indexnow.mjs";
import { tr } from "./content/tr.mjs";
import { en } from "./content/en.mjs";
import { ar } from "./content/ar.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const locales = { tr, en, ar };
const productMap = new Map(productList.map((p) => [p.id, p]));

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
    `<link rel="alternate" hreflang="tr" href="${esc(originUrl(routes.tr[pageKey]))}" />`,
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
    <a class="nav-link" href="${blogHubPath(lang)}"${current === "blog" ? ' aria-current="page"' : ''}>${isTr ? "Blog" : isAr ? "المدونة" : "Blog"}</a>
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
    <a href="${blogHubPath(lang)}" style="font-weight:700;color:var(--ink);">${isTr ? "Blog" : isAr ? "المدونة" : "Blog"}</a>
    <a href="${r.references}">${esc(copy.nav.references)}</a>
    <a href="${r.contact}" style="font-weight:700;color:var(--signal);">${esc(copy.nav.contact)} & Teklif Formu</a>
  `;
}

function langSwitch(pageKey, lang) {
  return ["tr", "en", "ar"]
    .map((code) => {
      const current = code === lang ? ' aria-current="page"' : "";
      const label = code === "ar" ? "AR" : code.toUpperCase();
      return `<a class="lang-btn" href="${routes[code][pageKey]}" hreflang="${code === "tr" ? "tr" : code}"${current}>${label}</a>`;
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

function getHeroSlides(lang) {
  const isTr = lang === "tr";
  const isAr = lang === "ar";

  return [
    {
      img: "/assets/rig-3000m-heavy.jpg",
      badge: isTr ? "AĞIR HİZMET DERİN KUYU SONDAJ KULESİ" : isAr ? "حفارات مقطورة عملاقة للآبار العميقة" : "HEAVY-DUTY DEEP BOREHOLE RIG",
      title: isTr ? "3000 Metre Derin Kuyu Sondaj Kulesi" : isAr ? "حفارة مقطورة عملاقة بعمق 3000 متر" : "3000m Heavy-Duty Deep Drilling Rig",
      lead: isTr ? "Yüksek entalpi jeotermal sahalar, derin akiferler ve maden arama projeleri için 120 ton kule yükü ve ağır hizmet rotari tork gücü." : isAr ? "طاقة برج 120 طن وعزم دوران فائق لمشاريع الطاقة الحرارية الأرضية وآبار المياه العميقة." : "120-ton mast hook load and rotary torque engineered for deep geothermal and water aquifers.",
      checks: [isTr ? "120 Ton Kule Yükü" : "120 Ton Mast Hook-Load", isTr ? "6\" Dubleks Çamur Pompası" : "6\" Duplex Mud Pump", isTr ? "4-Aks Ağır Dorse Platformu" : "4-Axle Heavy Trailer"],
      waMsg: isTr ? "Merhaba, KD Sondaj 3000 Metre Derin Kuyu Sondaj Kulesi hakkında teknik şartname ve fiyat teklifi almak istiyorum." : isAr ? "مرحباً، أود الحصول على المواصفات الفنية وعرض سعر لحفارة 3000 متر المقطورة من KD Sondaj." : "Hello, I would like to request technical specifications and a quotation for the KD Sondaj 3000m Trailer Rig.",
      tabTitle: isTr ? "3000M AĞIR DORSE KULESİ" : isAr ? "حفارة 3000م مقطورة" : "3000M HEAVY TRAILER RIG"
    },
    {
      img: "/assets/rig-1200m-1.jpg",
      badge: isTr ? "KAMYON ÜSTÜ HİDROLİK SONDAJ SİSTEMİ" : isAr ? "حفارة شاحنة هيدروليكية سريعة الحركة" : "TRUCK-MOUNTED HYDRAULIC RIG",
      title: isTr ? "1000–1200m Kamyon Üstü Sondaj Makinesi" : isAr ? "حفارة شاحنة سعة 1000–1200 متر" : "1000–1200m Truck-Mounted Drilling Rig",
      lead: isTr ? "Zorlu arazi koşullarında hızlı intikal kabiliyeti, 90 ton kule mukavemeti ve 422 HP güverte motoru ile yüksek hızlı delme performansı." : isAr ? "محرك 422 حصان وبرج 90 طن لحركة سريعة وأداء حفر فائق في التضارis الصعبة." : "Fast mobilization, 90-ton mast rating, and 422 HP industrial power unit for tough terrains.",
      checks: [isTr ? "90 Ton Kule Yükü" : "90 Ton Mast Rating", isTr ? "422 HP Güç Ünitesi" : "422 HP Power Unit", isTr ? "Hızlı Karayolu İntikali" : "Fast Highway Mobilization"],
      waMsg: isTr ? "Merhaba, KD Sondaj 1000–1200m Kamyon Üstü Sondaj Makinesi hakkında detaylı bilgi ve teklif almak istiyorum." : isAr ? "مرحباً، أود الاستفسار عن حفارة 1000–1200م المثبتة على شاحنة والحصول على عرض سعر." : "Hello, I would like to request specifications and a quote for the 1000–1200m Truck Rig.",
      tabTitle: isTr ? "1000–1200M KAMYON ÜSTÜ" : isAr ? "حفارة 1200م شاحنة" : "1000–1200M TRUCK RIG"
    },
    {
      img: "/assets/rig-1500m-mast.jpg",
      badge: isTr ? "1500–3000M DORSE TİPİ DERİN KUYU KULESİ" : isAr ? "حفارة مقطورة 1500–3000 متر" : "1500–3000M TRAILER DRILLING RIG",
      title: isTr ? "1500–3000 Metre Dorse Tipi Kule" : isAr ? "حفارة مقطورة سعة 1500–3000 متر" : "1500–3000m Trailer-Mounted Mast",
      lead: isTr ? "110 ton kule kanca kapasitesi, 90 tonluk halat sarıcı ve çift devirli rotary tablası ile büyük ölçekli derin kuyu imalatı." : isAr ? "سعة كابل 90 طن وبرج 110 طن لمشاريع الآبار الكبرى والمياه البلدية." : "110-ton mast, 90-ton drawworks, and heavy rotary table for deep borehole development.",
      checks: [isTr ? "110 Ton Kanca Yükü" : "110 Ton Mast Load", isTr ? "90 Ton Halat Sarıcı" : "90 Ton Drawworks", isTr ? "Ağır Lowbed Dorse" : "Heavy Lowbed Trailer"],
      waMsg: isTr ? "Merhaba, KD Sondaj 1500–3000m Dorse Kulesi hakkında teknik föy ve teklif talep ediyorum." : isAr ? "مرحباً، أود الحصول على تفاصيل وعرض سعر لحفارة 1500–3000 متر المقطورة." : "Hello, I would like to request technical details and a quote for the 1500–3000m Trailer Rig.",
      tabTitle: isTr ? "1500–3000M DERİN DORSE" : isAr ? "حفارة 1500–3000م مقطورة" : "1500–3000M TRAILER RIG"
    },
    {
      img: "/assets/hero-field-rig.jpg",
      badge: isTr ? "45 YILLIK ÜRETİM & SAHA TECRÜBESİ" : isAr ? "45 عاماً من الخبرة التصنيعية والميدانية" : "45 YEARS MANUFACTURING & FIELD EXPERTISE",
      title: isTr ? "45 Yıllık Tecrübe, 250–3000m Kapasite" : isAr ? "خبرة 45 عاماً وسعة حفر 250–3000 متر" : "45 Years Legacy, 250–3000m Capacity",
      lead: isTr ? "Su sondajı, jeotermal enerji kuyuları, karotlu maden arama ve zemin etüdünde Türkiye ve çevre coğrafyada kanıtlanmış yerli mühendislik." : isAr ? "حلول شاملة لحفر الآبار المائية، الطاقة الحرارية واستكشاف المعادن بأعلى معايير الهندسة." : "Complete turnkey solutions for water wells, geothermal reservoirs, mineral exploration, and geotechnical surveys.",
      checks: [isTr ? "250–3000m Derinlik" : "250–3000m Depth Range", isTr ? "DSİ ve Belediye Onaylı" : "Public & Municipal Approved", isTr ? "Yerli Mühendislik Güvencesi" : "Proven Local Engineering"],
      waMsg: isTr ? "Merhaba, KD Sondaj saha hizmetleri ve kuyu projelendirme hakkında bilgi ve teklif almak istiyorum." : isAr ? "مرحباً، أود الاستفسار عن خدمات حفر آبار المياه والطاقة الحرارية من KD Sondaj." : "Hello, I would like to inquire about KD Sondaj water and geothermal turnkey drilling services.",
      tabTitle: isTr ? "JEOTERMAL & SU SONDAJI" : isAr ? "حفر المياه والطاقة الحرارية" : "GEOTHERMAL & WATER WELLS"
    },
    {
      img: "/assets/tricone-bits.jpg",
      badge: isTr ? "API SPEC 5D TİJ & IADC TRICONE MATKAPLAR" : isAr ? "أنابيب الحفر ورؤوس IADC" : "API SPEC 5D PIPES & IADC BITS",
      title: isTr ? "Ağır Hizmet Sondaj Donanımı & Takımları" : isAr ? "معدات ومواسير الحفر عالية المتانة" : "Heavy-Duty Drilling String & Tooling",
      lead: isTr ? "Formasyon sertliğine uygun IADC 111–637 dişli ve elmas silindir matkaplar, API Spec 5D sertifikalı tijler ve 6\" yüksek basınçlı dubleks pompalar." : isAr ? "رؤوس حفر ثلاثية المخاريط IADC وأنابيب حفر API Spec 5D ومضخات طين عالية الضغط." : "Formation-tailored IADC 111–637 tricone bits, API Spec 5D drill pipes, and 6\" duplex mud pumps.",
      checks: [isTr ? "API Spec 5D Tijler" : "API Spec 5D Drill Pipes", isTr ? "IADC 111–637 Matkap" : "IADC 111–637 Tricone Bits", isTr ? "6\" Dubleks Çamur Pompası" : "6\" Duplex Mud Pump"],
      waMsg: isTr ? "Merhaba, KD Sondaj API 5D tijler, IADC matkaplar ve çamur pompaları hakkında fiyat listesi talep ediyorum." : isAr ? "مرحباً، أود الحصول على قائمة أسعار مواسير الحفر API 5D ورؤوس IADC ومضخات الطين." : "Hello, I would like to request pricing for API 5D drill pipes, IADC tricone bits, and mud pumps.",
      tabTitle: isTr ? "TİJ, MATKAP & POMPALAR" : isAr ? "المواسير والرؤوس والمضخات" : "PIPES, BITS & PUMPS"
    }
  ];
}

function getSectors(lang) {
  if (lang === "tr") {
    return [
      { icon: "🏛️", title: "DSİ & Belediye İçme Suyu Ağları", desc: "Şehir şebekeleri ve kamu idareleri için 500–1600m derin kuyu sondajları, yüksek debili içme suyu temini." },
      { icon: "♨️", title: "Jeotermal Enerji & Isıtma Tesisleri", desc: "Yüksek entalpili jeotermal rezervuarlar, termal turizm ve sera ısıtması için 1500–3000m derin enerji kuyuları." },
      { icon: "🌾", title: "Tarımsal Sulama Kooperatifleri", desc: "Geniş tarım arazileri, ovalar ve sulama birlikleri için derin akifer sondajı ve çelik filtre borulama." },
      { icon: "⛏️", title: "Karotlu Maden & Cevher Arama", desc: "Metalik madenler, endüstriyel hammaddeler ve kömür yatakları için yüksek verimli wireline karot numuneleri." },
      { icon: "🏗️", title: "Jeoteknik Zemin & Altyapı", desc: "Barajlar, otoyollar, köprüler ve yüksek yapılar için zemin etüdü, jet grout ve fore kazık uygulamaları." },
      { icon: "🌍", title: "Küresel İhracat & Kuyu Başı Teslim", desc: "40+ ülkeye konteyner ve lowbed tır bazlı lojistik, kuyu başında devreye alma ve operatör eğitimi." }
    ];
  }
  if (lang === "ar") {
    return [
      { icon: "🏛️", title: "آبار مياه الشرب والبلديات", desc: "حفر آبار المياه بعمق 500–1600 متر لشبكات مياه الشرب والمؤسسات الحكومية والبلديات." },
      { icon: "♨️", title: "الطاقة الحرارية الأرضية", desc: "حفر آبار الطاقة الحرارية والتدفئة المركزية والمنتجعات بعمق 1500–3000 متر بأعلى درجات الأمان." },
      { icon: "🌾", title: "الري والجمعيات الزراعية", desc: "آبار المياه الجوفية ذات التدفق العالي للمزارع والمشاريع الزراعية الكبرى مع أنابيب التغليف." },
      { icon: "⛏️", title: "استكشاف المعادن بالقلب الصخري", desc: "حفر استكشافي واستخراج عينات الصخور السلكية (Wireline) لمناجم المعادن والخامات." },
      { icon: "🏗️", title: "فحص التربة والأعمال الجيوتقنية", desc: "فحص طبقات الأرض، الخوازيق وحقن السدود والأساسات للمشاريع الإنشائية الضخمة." },
      { icon: "🌍", title: "التصدير والتشغيل الميداني", desc: "تصدير الحفارات والمواسير إلى أكثر من 40 دولة مع تدريب المشغلين والتشغيل في موقع البئر." }
    ];
  }
  return [
    { icon: "🏛️", title: "Municipal & Public Water Networks", desc: "500–1600m deep aquifer drilling for municipal potable water networks and government water projects." },
    { icon: "♨️", title: "Geothermal Energy & District Heating", desc: "1500–3000m deep geothermal power plant boreholes, thermal wellness, and district heating wells." },
    { icon: "🌾", title: "Agricultural Irrigation Projects", desc: "High-discharge deep boreholes and screen casing installation for agricultural estates and cooperatives." },
    { icon: "⛏️", title: "Mineral Core Drilling", desc: "High-recovery wireline diamond coring (HQ/NQ/BQ) for metallic ore bodies and mineral deposits." },
    { icon: "🏗️", title: "Geotechnical & Deep Foundation", desc: "Soil investigation, jet grouting, micropiling, and dam grouting curtain boreholes." },
    { icon: "🌍", title: "Global Export & Commissioning", desc: "Complete rig packages, API drill strings, and containerized logistics with field commissioning in 40+ countries." }
  ];
}

function getMarqueeItems(lang) {
  if (lang === "tr") {
    return [
      "45 YILLIK ÜRETİM TECRÜBESİ",
      "250–3000 METRE SONDAJ KAPASİTESİ",
      "ANKARA MERKEZ & KONYA FABRİKA",
      "DSİ VE BELEDİYE SU KUYULARI",
      "JEOTERMAL VE SICAK SU SONDAJI",
      "KAROTLU MADEN ARAMA",
      "6\" DUBLEKS ÇAMUR POMPASI",
      "API SPEC 5D TİJ",
      "IADC TRICONE MATKAP",
      "ULUSLARARASI İHRACAT"
    ];
  }
  if (lang === "ar") {
    return [
      "خبرة تصنيعية وهندسية 45 عاماً",
      "سعة حفر من 250 إلى 3000 متر",
      "صناعة تركية في أنقرة",
      "آبار مياه الشرب والري والبلديات",
      "حفر آبار الطاقة الحرارية الأرضية",
      "استكشاف المعادن بالقلب الصخري",
      "مضخات طين مزدوجة 6 بوصة",
      "أنابيب حفر API SPEC 5D",
      "رؤوس حفر ثلاثية المخاريط IADC",
      "تصدير عالمي إلى مختلف الدول"
    ];
  }
  return [
    "45 YEARS MANUFACTURING LEGACY",
    "250–3000 METERS DRILLING DEPTH",
    "ANKARA FACTORY PRODUCTION",
    "MUNICIPAL & DEEP WATER WELLS",
    "HIGH-ENTHALPY GEOTHERMAL DRILLING",
    "MINERAL CORE EXPLORATION",
    "6\" DUPLEX MUD PUMP",
    "API SPEC 5D DRILL PIPES",
    "IADC TRICONE DRILL BITS",
    "GLOBAL EXPORT READY"
  ];
}

function productCardAsiaplast(p, copy, lang) {
  const isTr = lang === "tr";
  const isAr = lang === "ar";
  const localized = p[lang] || p.tr;
  const routeKey = productRouteMap[p.id];
  const url = routeKey && routes[lang][routeKey] ? routes[lang][routeKey] : routes[lang].equipment;

  let categoryBadge = isTr ? "🚜 Dorse Kulesi" : isAr ? "🚜 حفارة مقطورة" : "🚜 Trailer Rig";
  if (p.carrier === "truck") {
    categoryBadge = isTr ? "🚚 Kamyon Üstü" : isAr ? "🚚 حفارة شاحنة" : "🚚 Truck Rig";
  } else if (p.id === "drill-pipes") {
    categoryBadge = isTr ? "⚙️ API 5D Tij" : isAr ? "⚙️ أنابيب الحفر" : "⚙️ Drill Pipes";
  } else if (p.id === "drill-bits") {
    categoryBadge = isTr ? "⭐ IADC Matkap" : isAr ? "⭐ رؤوس الحفر" : "⭐ Drill Bits";
  } else if (p.id === "mud-pumps") {
    categoryBadge = isTr ? "💧 Çamur Pompası" : isAr ? "💧 مضخة طين" : "💧 Mud Pump";
  }

  let specBadge = p.depthStr || "";
  if (p.mast) specBadge += ` · ${p.mast} ${isTr ? "Kule" : isAr ? "برج" : "Mast"}`;
  else if (p.hp) specBadge += ` · ${p.hp}`;

  const ctaLabel = isTr ? "Teknik Detay & Teklif" : isAr ? "المواصفات والتسعير" : "Specs & Quote";

  return `
    <a href="${url}" class="asiaplast-card reveal-on-scroll" data-carrier="${p.carrier}">
      <div>
        <div class="asiaplast-card-media">
          <img src="${p.image}" alt="${esc(localized.name)}" loading="lazy" />
          <div class="media-dark-tint"></div>
          <span class="badge-top-left">${categoryBadge}</span>
          ${specBadge ? `<span class="badge-bottom-left">${esc(specBadge)}</span>` : ""}
        </div>
        <div class="asiaplast-card-body">
          <h3 class="asiaplast-card-title">${esc(localized.name)}</h3>
          <p class="asiaplast-card-desc">${esc(localized.summary || localized.tagline)}</p>
        </div>
      </div>
      <div class="asiaplast-card-footer">
        <span>${ctaLabel}</span>
        <span class="arrow">→</span>
      </div>
    </a>
  `;
}

function machineCard(machine, copy, lang) {
  const isTr = lang === "tr";
  const isAr = lang === "ar";
  const carrier = machine.carrier === "trailer" ? copy.common.trailer : copy.common.truck;
  const carrierClass = machine.carrier;
  const inquiryText = lang === "tr"
    ? `Merhaba, KD Sondaj ${machine.depth} (${carrier}) makineniz hakkında teknik detay ve teklif almak istiyorum.`
    : lang === "ar"
    ? `مرحباً، أود الاستفسار والحصول على عرض سعر لحفارة KD Sondaj سعة ${machine.depth} (${carrier}).`
    : `Hello, I would like to request a quote and technical specifications for the KD Sondaj ${machine.depth} (${carrier}) rig.`;
  const waUrl = `https://wa.me/${site.whatsappE164}?text=${encodeURIComponent(inquiryText)}`;
  const btnLabel = lang === "tr" ? "Teklif İste" : lang === "ar" ? "طلب تسعير" : "Request Quote";
  const productRouteKey = productRouteMap[machine.id];
  const productUrl = productRouteKey && routes[lang][productRouteKey] ? routes[lang][productRouteKey] : null;
  const product = productMap.get(machine.id);
  const cardImg = product?.image;

  if (machine.special) {
    const facts = machine.facts[lang] || machine.facts.tr;
    return `<article class="rig-card reveal-on-scroll" data-carrier="${carrierClass}">
      ${cardImg ? `
        <a href="${productUrl || '#'}" class="rig-card-media" aria-label="${esc(machine.depth)} ${esc(carrier)}">
          <img src="${cardImg}" alt="KD Sondaj ${esc(machine.depth)} ${esc(carrier)}" loading="lazy" />
          ${productUrl ? `<span class="rig-media-zoom">${isTr ? "Detayları İncele →" : isAr ? "عرض التفاصيل →" : "View Details →"}</span>` : ""}
        </a>
      ` : ""}
      <div class="rig-header">
        <div class="rig-depth-badge">${esc(machine.depth)}</div>
        <span class="carrier-tag ${carrierClass}">${esc(carrier)}</span>
      </div>
      <div class="rig-features">
        <ul style="margin:0;padding-inline-start:1.1rem;color:var(--text-soft);">${facts.map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
      </div>
      <div class="rig-card-actions">
        ${productUrl ? `
          <a class="rig-detail-btn" href="${productUrl}">
            <span>${isTr ? "Teknik Sayfa" : isAr ? "المواصفات" : "Specs"}</span>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
          </a>
        ` : ""}
        <a class="rig-inquire-btn" href="${waUrl}" target="_blank" rel="noopener">
          <span>${esc(btnLabel)}</span>
          <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
        </a>
      </div>
    </article>`;
  }

  const mud = machine.mud === true ? copy.common.mudYes : machine.mud === "optional" ? copy.common.mudOpt : "";
  return `<article class="rig-card reveal-on-scroll" data-carrier="${carrierClass}">
    ${cardImg ? `
      <a href="${productUrl || '#'}" class="rig-card-media" aria-label="${esc(machine.depth)} ${esc(carrier)}">
        <img src="${cardImg}" alt="KD Sondaj ${esc(machine.depth)} ${esc(carrier)}" loading="lazy" />
        ${productUrl ? `<span class="rig-media-zoom">${isTr ? "Detayları İncele →" : isAr ? "عرض التفاصيل →" : "View Details →"}</span>` : ""}
      </a>
    ` : ""}
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
    <div class="rig-card-actions">
      ${productUrl ? `
        <a class="rig-detail-btn" href="${productUrl}">
          <span>${isTr ? "Teknik Sayfa" : isAr ? "المواصفات" : "Specs"}</span>
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </a>
      ` : ""}
      <a class="rig-inquire-btn" href="${waUrl}" target="_blank" rel="noopener">
        <span>${esc(btnLabel)}</span>
        <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
      </a>
    </div>
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

function layout({ lang, pageKey, title, description, extraHead = "", schema = [], main, ogImage }) {
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
  <meta property="og:image" content="${esc(originUrl(ogImage || "/assets/hero-field-rig.jpg"))}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${esc(title)}" />
  <meta name="twitter:description" content="${esc(description)}" />
  <meta name="twitter:image" content="${esc(originUrl(ogImage || "/assets/hero-field-rig.jpg"))}" />
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
        <a class="brand" href="${routes[lang].home}">
          <div class="brand-badge-sq">KD</div>
          <div class="brand-text-col">
            <span class="brand-name">KD<span class="text-signal">SONDAJ</span></span>
            <span class="brand-tagline">${esc(copy.brandSub)}</span>
          </div>
        </a>
        <nav class="nav-center">${navLinks(lang, navCurrent)}</nav>
        <div class="header-actions">
          <nav class="lang-switcher" aria-label="Language">${langSwitch(pageKey, lang)}</nav>
          <a class="btn-nav-wa header-cta" href="${whatsapp(copy)}" target="_blank" rel="noopener">
            <span class="pulse-beacon" style="width:7px;height:7px;background:#22C55E;box-shadow:0 0 0 0 rgba(34,197,94,0.6);"></span>
            <span>0541 191 63 01</span>
          </a>
          <a class="btn-nav-quote header-cta" href="${routes[lang].contact}">
            <span>📋</span>
            <span>${lang === "tr" ? "Teklif Al" : lang === "ar" ? "طلب تسعير" : "Request Quote"}</span>
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
  <aside class="wa-floating-desk" aria-label="WhatsApp Destek">
    <div class="wa-desk-tooltip">
      <span class="pulse-beacon" style="background:#22C55E;box-shadow:0 0 0 0 rgba(34,197,94,0.6);width:7px;height:7px;"></span>
      <div style="display:flex;flex-direction:column;line-height:1.2;">
        <span style="font-size:0.75rem;font-weight:800;color:#0F172A;">WhatsApp Danışma Hattı</span>
        <span style="font-size:0.68rem;color:#16A34A;font-weight:700;font-family:var(--font-mono);">0541 191 63 01 • Çevrimiçi</span>
      </div>
    </div>
    <a class="wa-desk-btn" href="${whatsapp(copy)}" target="_blank" rel="noopener" aria-label="WhatsApp: 0541 191 63 01">
      <span class="wa-desk-ping"></span>
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24m-2.79 4.23c-.14 0-.37.05-.57.27-.2.21-.76.74-.76 1.81s.78 2.11.89 2.25c.11.15 1.51 2.42 3.73 3.3 1.85.73 2.22.59 2.62.55.4-.04 1.29-.53 1.47-1.04.18-.51.18-.95.13-1.04-.05-.1-.2-.15-.42-.27-.22-.11-1.29-.64-1.49-.71-.2-.07-.35-.11-.49.11-.15.21-.56.71-.69.86-.13.14-.26.16-.48.05-.22-.11-.93-.34-1.77-1.09-.65-.58-1.09-1.3-1.22-1.52-.13-.21-.01-.33.1-.44.1-.1.22-.26.33-.39.11-.13.15-.21.22-.36.07-.14.04-.27-.02-.38-.06-.11-.49-1.17-.67-1.6-.17-.42-.35-.36-.49-.37z"/></svg>
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

  const heroSlides = getHeroSlides(lang);
  const marqueeItems = getMarqueeItems(lang);

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
  <!-- ASIAPLAST-STYLE DYNAMIC HERO CAROUSEL -->
  <section class="hero-carousel-section select-none">
    <div class="hero-slider-container">
      ${heroSlides.map((slide, idx) => `
        <div class="hero-slide-item ${idx === 0 ? "is-active" : ""}" data-slide-index="${idx}" aria-hidden="${idx === 0 ? "false" : "true"}">
          <img class="hero-slide-img" src="${slide.img}" alt="${esc(slide.title)}" loading="${idx === 0 ? "eager" : "lazy"}" ${idx === 0 ? 'fetchpriority="high"' : ''} />
          <div class="hero-gradient-overlay"></div>
        </div>
      `).join("")}
    </div>

    <div class="hero-grid-pattern"></div>

    <div class="container-x hero-content-wrap">
      <div class="hero-slides-content">
        ${heroSlides.map((slide, idx) => `
          <div class="hero-slide-text-item ${idx === 0 ? "is-active" : ""}" data-text-index="${idx}">
            <div class="hero-badge-pill">
              <span class="pulse-beacon"></span>
              <span>${esc(slide.badge)}</span>
            </div>
            <h1 class="hero-h1">${esc(slide.title)}</h1>
            <p class="hero-lead">${esc(slide.lead)}</p>
            <div class="hero-check-chips">
              ${slide.checks.map((c) => `
                <div class="check-chip">
                  <span class="check-chip-icon">✓</span>
                  <span>${esc(c)}</span>
                </div>
              `).join("")}
            </div>
            <div class="hero-cta-group">
              <a class="btn-hero-primary" href="${routes[lang].contact}">
                <span>📦</span>
                <span>${isTr ? "Teklif Al &amp; Şartname Gönder" : isAr ? "طلب تسعير وإرسال المواصفات" : "Request a Quote &amp; RFQ"}</span>
              </a>
              <a class="btn-hero-wa" href="https://wa.me/905411916301?text=${encodeURIComponent(slide.waMsg)}" target="_blank" rel="noopener">
                <span class="pulse-beacon" style="background:#22C55E;box-shadow:0 0 0 0 rgba(34,197,94,0.6);"></span>
                <span>WhatsApp: 0541 191 63 01</span>
              </a>
              <a class="btn-hero-outline" href="${routes[lang].rigs}">
                <span>${isTr ? "Makineleri İncele →" : isAr ? "استكشاف الحفارات ←" : "Explore Rigs →"}</span>
              </a>
            </div>
          </div>
        `).join("")}
      </div>

      <div class="hero-nav-arrow-wrap">
        <button class="hero-nav-arrow" id="heroPrevBtn" aria-label="Previous Slide">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <button class="hero-nav-arrow" id="heroNextBtn" aria-label="Next Slide">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>

    <!-- Bottom 5-Slide Preview Cards (Asiaplast Signature) -->
    <div class="hero-tabs-bar">
      <div class="container-x">
        <div class="hero-tabs-grid">
          ${heroSlides.map((slide, idx) => `
            <button type="button" class="hero-tab-card ${idx === 0 ? "is-active" : ""}" data-slide-index="${idx}" aria-selected="${idx === 0 ? "true" : "false"}">
              <div class="hero-tab-meta">
                <span class="hero-tab-num">0${idx + 1}</span>
                <span class="hero-tab-live-badge">LIVE</span>
              </div>
              <div class="hero-tab-title">${esc(slide.tabTitle)}</div>
              <div class="hero-tab-progress"></div>
            </button>
          `).join("")}
        </div>
      </div>
    </div>

    <!-- Running Infinite Marquee -->
    <div class="marquee-band" aria-hidden="true">
      <div class="marquee-track">
        ${marqueeItems.map((item) => `
          <div class="marquee-item">
            <span class="marquee-dot">•</span>
            <span>${esc(item)}</span>
          </div>
        `).join("")}
        ${marqueeItems.map((item) => `
          <div class="marquee-item">
            <span class="marquee-dot">•</span>
            <span>${esc(item)}</span>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- ASIAPLAST PRODUCT CATALOG CARDS SECTION -->
  <section class="section-padding bg-slate-light" id="catalog">
    <div class="container-x">
      <div class="max-w-2xl">
        <span class="chip">${isTr ? "Katalog &amp; Ekipman" : isAr ? "الكتالوج والمعدات" : "Catalog &amp; Equipment"}</span>
        <h2 class="h2-title">${esc(p.equipTitle)}</h2>
        <p style="color:#64748B;font-size:1.05rem;line-height:1.6;margin-top:0.5rem;">
          ${isTr ? "300 metreden 3000 metreye kadar dorse ve kamyon üstü sondaj makineleri, API Spec 5D tijler ve IADC silindir matkaplar." : isAr ? "حفارات مقطورة وشاحنات ومواسير ورؤوس حفر من 300 إلى 3000 متر." : "Drilling rigs from 300m to 3000m, API Spec 5D drill pipes, and IADC tricone bits."}
        </p>
      </div>

      <!-- Carrier Filter Tabs -->
      <div class="filter-bar" style="margin-top:1.75rem;">
        <button type="button" class="filter-btn active" data-filter="all">${isTr ? "Tüm Donanımlar" : isAr ? "جميع المعدات" : "All Equipment"}</button>
        <button type="button" class="filter-btn" data-filter="trailer">${isTr ? "Dorse Kuleler" : isAr ? "حفارات مقطورة" : "Trailer Rigs"}</button>
        <button type="button" class="filter-btn" data-filter="truck">${isTr ? "Kamyon Üstü" : isAr ? "حفارات شاحنة" : "Truck Rigs"}</button>
      </div>

      <!-- Asiaplast 16/10 Cards Grid -->
      <div class="asiaplast-card-grid">
        ${productList.map((prod) => productCardAsiaplast(prod, copy, lang)).join("")}
      </div>

      <div style="margin-top:2.5rem;text-align:center;">
        <a class="btn-hero-outline" href="${routes[lang].rigs}">
          <span>${isTr ? "Tüm Sondaj Makinelerini Karşılaştır (11 Model) →" : isAr ? "مقارنة جميع طرازات الحفارات (11 طراز) ←" : "Compare All 11 Drilling Rig Models →"}</span>
        </a>
      </div>

      <!-- Interactive Rig Selector Calculator -->
      ${quoteCalculator(lang)}
    </div>
  </section>

  <!-- B2B EXCELLENCE 4-CARD GRID (ASIAPLAST STYLE) -->
  <section class="section-padding" style="background:#FFFFFF;border-top:1px solid rgba(226,232,240,0.85);border-bottom:1px solid rgba(226,232,240,0.85);">
    <div class="container-x">
      <div style="text-align:center;max-w-2xl;margin:0 auto;">
        <span class="chip" style="margin:0 auto 0.5rem auto;">${isTr ? "B2B Mühendislik" : isAr ? "التميز الهندسي" : "B2B Engineering"}</span>
        <h2 class="h2-title">${esc(p.whyTitle)}</h2>
        <p style="color:#64748B;font-size:1.05rem;max-width:650px;margin:0 auto;">
          ${isTr ? "Kule imalatından kuyu sahasına kadar tek elden sorumlu ve garantili mühendislik ortağı." : isAr ? "شريك هندسي موثوق من مرحلة التصنيع حتى التشغيل في موقع البئر." : "Accountable engineering partner from rig manufacturing to field commissioning."}
        </p>
      </div>

      <div class="excellence-grid">
        <div class="excellence-card reveal-on-scroll">
          <div class="num-badge-sq">1</div>
          <h3 class="excellence-title">${isTr ? "Şartnameye Dayalı Yerli İmalat" : isAr ? "تصنيع محلي وفق المواصفات" : "Specification-Driven Manufacturing"}</h3>
          <p class="excellence-text">${isTr ? "Kule yükü, tambur tonajı, halat sarıcı ve çamur pompası saha zemin formasyonunuza özel mühendislikle üretilir." : isAr ? "يتم تصنيع البرج والونش ومضخة الطين وفقاً لطبقات الأرض وظروف مشروعك." : "Mast rating, drawworks, and mud pump circulation configured to your formation geology."}</p>
        </div>

        <div class="excellence-card reveal-on-scroll delay-1">
          <div class="num-badge-sq">2</div>
          <h3 class="excellence-title">${isTr ? "250–3000 m Kanıtlanmış Mukavemet" : isAr ? "قدرة حفر مثبتة من 250 إلى 3000م" : "Proven 250–3000m Depth Rigidity"}</h3>
          <p class="excellence-text">${isTr ? "DSİ içme suyu, maden karotlama ve derin jeotermal sahalarında 45 yıldır sahada kanıtlanmış kule mukavemeti." : isAr ? "قوة ومتانة مثبتة ميدانياً في آبار مياه الشرب والتعدين والطاقة الحرارية على مدى 45 عاماً." : "Battle-tested mast stability and high rotary torque proven across municipal, mining and geothermal wells."}</p>
        </div>

        <div class="excellence-card reveal-on-scroll delay-2">
          <div class="num-badge-sq">3</div>
          <h3 class="excellence-title">${isTr ? "Eksiksiz Tij, Matkap &amp; Pompa Donanımı" : isAr ? "توريد شامل للمواسير ورؤوس الحفر والمضخات" : "Complete Drill String &amp; Tooling"}</h3>
          <p class="excellence-text">${isTr ? "API Spec 5D sertifikalı tijler, IADC 111–637 tricone matkaplar ve 6\" dubleks çamur pompası doğrudan tedarik edilir." : isAr ? "مواسير حفر API Spec 5D ورؤوس حفر IADC 111–637 ومضخات طين مزدوجة جاهزة للتسليم." : "Certified API Spec 5D drill pipes, IADC roller cone bits, and 6\" duplex mud pumps readily available."}</p>
        </div>

        <div class="excellence-card reveal-on-scroll delay-3">
          <div class="num-badge-sq">4</div>
          <h3 class="excellence-title">${isTr ? "Hızlı Mühendislik &amp; Teklif Yanıtı" : isAr ? "استجابة سريعة للعروض الفنية" : "Responsive Engineering &amp; Fast Quoting"}</h3>
          <p class="excellence-text">${isTr ? "Teknik şartnameniz doğrultusunda 24 saat içerisinde detaylı teknik veri föyü ve bütçe teklifi sunulur." : isAr ? "عروض أسعار تفصيلية وجداول مواصفات فنية متكاملة خلال يوم عمل واحد." : "Comprehensive technical datasheets, packing details, and commercial quotations returned within one business day."}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- SERVICES SECTION (ASIAPLAST STYLE) -->
  <section class="section-padding bg-slate-light" id="services">
    <div class="container-x">
      <div class="max-w-2xl">
        <span class="chip">${isTr ? "Saha Hizmetleri" : isAr ? "خدمات الحفر" : "Drilling Services"}</span>
        <h2 class="h2-title">${esc(p.servicesTitle)}</h2>
        <p style="color:#64748B;font-size:1.05rem;line-height:1.6;margin-top:0.5rem;">${esc(p.servicesLead)}</p>
      </div>

      <div class="services-asiaplast-grid">
        ${copy.services.map((s) => `
          <div class="service-asiaplast-card reveal-on-scroll">
            <div>
              <div class="service-icon-sq">${getServiceIcon(s.key)}</div>
              <span class="service-depth-tag">${s.key === "water" ? "250–1600 m" : s.key === "gt" ? "1200–3000 m" : s.key === "geotech" ? "300–600 m" : "Karotlu / Wireline"}</span>
              <h3 class="excellence-title" style="font-size:1.15rem;">${esc(s.h)}</h3>
              <p class="excellence-text" style="font-size:0.85rem;">${esc(s.p)}</p>
            </div>
            <div style="margin-top:1.5rem;padding-top:1rem;border-top:1px solid #F1F5F9;">
              <a href="${routes[lang][s.href]}" style="font-size:0.82rem;font-weight:800;color:#EA580C;text-decoration:none;display:inline-flex;align-items:center;gap:0.35rem;">
                <span>${esc(copy.cta.more)}</span>
                <span>→</span>
              </a>
            </div>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- GEOLOGICAL FORMATIONS & TELEMETRY HORIZON -->
  <section class="section-padding" style="background:#FFFFFF;border-top:1px solid rgba(226,232,240,0.85);">
    <div class="container-x">
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(320px, 1fr));gap:2.5rem;align-items:center;">
        <div>
          <span class="chip">${isTr ? "Jeolojik Formasyon" : isAr ? "الطبقات الجيولوجية" : "Geological Stratigraphy"}</span>
          <h2 class="h2-title" style="font-size:2.2rem;">${isTr ? "Derinliğe Göre Doğru Makine ve Tij Seçimi" : isAr ? "اختيار الحفارة والمواسير المناسبة وفق العمق" : "Optimized Rig Selection per Depth &amp; Geology"}</h2>
          <p style="color:#64748B;font-size:0.95rem;line-height:1.65;margin:1rem 0 1.5rem 0;">
            ${isTr ? "Sığ alüvyon akiferlerinden 3000 metre derin jeotermal rezervuarlara kadar her katmanda farklı kule kanca yükü, tork ve çamur debisi gereklidir. KD Sondaj, şartnamenize en uygun makineyi belirler." : isAr ? "من طبقات المياه السطحية حتى آبار الطاقة الحرارية بعمق 3000 متر، نحدد المعدات المثالية لكل تكوين جيولوجي." : "From shallow alluvial aquifers to 3000m deep geothermal reservoirs, rig hook load and rotary torque must match formation geology."}
          </p>
          <div style="display:flex;flex-wrap:wrap;gap:1.25rem;">
            <div class="stat-chip" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:1rem 1.5rem;">
              <div class="val" data-counter="3000" data-suffix=" m" style="font-family:var(--font-mono);font-size:1.85rem;font-weight:900;color:#EA580C;">3000 m</div>
              <div class="lbl" style="font-size:0.78rem;font-weight:700;color:#64748B;">${isTr ? "Maksimum Kuyu Derinliği" : isAr ? "أقصى عمق للبئر" : "Max Borehole Depth"}</div>
            </div>
            <div class="stat-chip" style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:1rem 1.5rem;">
              <div class="val" data-counter="45" data-suffix="${isTr ? "+ Yıl" : isAr ? "+ عام" : "+ Years"}" style="font-family:var(--font-mono);font-size:1.85rem;font-weight:900;color:#0284C7;">45+ Yıl</div>
              <div class="lbl" style="font-size:0.78rem;font-weight:700;color:#64748B;">${isTr ? "Saha &amp; Üretim Tecrübesi" : isAr ? "خبرة تصنيع وميدان" : "Engineering Legacy"}</div>
            </div>
          </div>
        </div>

        <div style="background:#0F172A;border-radius:24px;padding:2rem;color:#F8FAFC;box-shadow:0 12px 30px rgba(15,23,42,0.15);">
          <div style="display:flex;justify-content:space-between;align-items:center;font-family:var(--font-mono);font-size:0.75rem;margin-bottom:1.5rem;color:#94A3B8;border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:0.75rem;">
            <span>TELEMETRY // STRATA HORIZON</span>
            <span style="color:#22C55E;font-weight:800;">● 3000M AKTİF</span>
          </div>
          <div class="depth-strata-list">
            ${strataLabels.map((s, idx) => `
              <div class="strata-item ${idx === 3 ? "active" : ""}" style="display:flex;align-items:center;gap:1rem;padding:0.75rem 0;border-bottom:1px solid rgba(255,255,255,0.06);">
                <div class="strata-node" style="width:10px;height:10px;border-radius:50%;background:${idx === 3 ? '#EA580C' : '#38BDF8'};box-shadow:0 0 8px ${idx === 3 ? '#EA580C' : '#38BDF8'};flex-shrink:0;"></div>
                <div class="strata-depth" style="font-family:var(--font-mono);font-weight:700;color:#F8FAFC;min-width:110px;">${esc(s.depth)}</div>
                <div class="strata-label" style="font-size:0.85rem;color:#94A3B8;">${esc(s.label)}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- SECTORS / INDUSTRIES WE SERVE (ASIAPLAST STYLE) -->
  <section class="sectors-section" id="sectors">
    <div class="container-x">
      <div style="text-align:center;max-w-2xl;margin:0 auto;">
        <span class="chip" style="margin:0 auto 0.5rem auto;">${isTr ? "Sektörler &amp; Projeler" : isAr ? "القطاعات والمشاريع" : "Sectors &amp; Industries"}</span>
        <h2 class="h2-title">${isTr ? "Hizmet Verdiğimiz Başlıca Sektörler" : isAr ? "القطاعات الرئيسية التي نخدمها" : "Key Industries We Serve"}</h2>
        <p style="color:#64748B;font-size:1.05rem;max-width:650px;margin:0 auto;">
          ${isTr ? "Kamu idarelerinden enerji santrallerine ve maden sahalarına kadar ağır hizmet mühendisliği çözümleri." : isAr ? "حلول هندسية متكاملة لقطاعات البلديات والطاقة والتعدين والزراعة." : "Heavy-duty engineering solutions for public water authorities, geothermal operators, and mining exploration."}
        </p>
      </div>

      <div class="sectors-grid">
        ${getSectors(lang).map((sec) => `
          <div class="sector-card reveal-on-scroll">
            <div class="sector-icon">${sec.icon}</div>
            <h3 class="sector-title">${esc(sec.title)}</h3>
            <p class="sector-desc">${esc(sec.desc)}</p>
          </div>
        `).join("")}
      </div>
    </div>
  </section>

  <!-- REFERENCES SECTION -->
  <section class="section-padding bg-slate-light" id="references">
    <div class="container-x">
      <div class="max-w-2xl">
        <span class="chip">${isTr ? "Saha Referansları" : isAr ? "المشاريع المنفذة" : "Field References"}</span>
        <h2 class="h2-title">${esc(p.refTitle)}</h2>
        <p style="color:#64748B;font-size:1.05rem;line-height:1.6;margin-top:0.5rem;">${esc(p.refLead)}</p>
      </div>
      <div class="list-cards" style="margin-top:2rem;">
        ${refs}
      </div>
    </div>
  </section>

  <!-- FAQ SECTION -->
  <section class="section-padding" style="background:#FFFFFF;border-top:1px solid rgba(226,232,240,0.85);" id="faq">
    <div class="container-x">
      <div style="text-align:center;max-w-2xl;margin:0 auto 2.5rem auto;">
        <span class="chip" style="margin:0 auto 0.5rem auto;">${isTr ? "Sık Sorulan Sorular" : isAr ? "الأسئلة الشائعة" : "FAQ"}</span>
        <h2 class="h2-title">${esc(p.faqTitle)}</h2>
      </div>
      <div class="faq" style="max-width:860px;margin:0 auto;">
        ${faq}
      </div>
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

  const galleryItems = product.gallery && product.gallery.length > 0
    ? product.gallery
    : [{ src: product.image || "/assets/trailer-rig.jpg", captionTr: p.name, captionEn: p.name, captionAr: p.name, label: isTr ? "Ana Görünüm" : isAr ? "المظهر الرئيسي" : "Main View" }];

  const initialImg = galleryItems[0];
  const initialCaption = isTr ? (initialImg.captionTr || initialImg.label) : isAr ? (initialImg.captionAr || initialImg.label) : (initialImg.captionEn || initialImg.label);

  const galleryHtml = `
          <div class="product-gallery-card reveal-on-scroll">
            <div class="gallery-main-view">
              <img id="mainGalleryImg" src="${initialImg.src}" alt="${esc(initialCaption || p.name)}" fetchpriority="high" />
              <div class="gallery-active-badge">
                <span class="beacon-dot"></span>
                <span id="galleryBadge">${esc(initialCaption || p.name)}</span>
              </div>
            </div>
            ${galleryItems.length > 1 ? `
              <div class="gallery-thumbs-row" role="tablist" aria-label="${isTr ? "Makine Fotoğrafları" : isAr ? "صور الحفارة" : "Rig Photos"}">
                ${galleryItems.map((item, idx) => {
                  const itemCaption = isTr ? (item.captionTr || item.label) : isAr ? (item.captionAr || item.label) : (item.captionEn || item.label);
                  return `
                    <button type="button" class="gallery-thumb-btn ${idx === 0 ? "is-active" : ""}" 
                            data-src="${esc(item.src)}" 
                            data-caption="${esc(itemCaption)}" 
                            data-alt="${esc(itemCaption)}"
                            aria-label="${esc(itemCaption)}">
                      <img src="${esc(item.src)}" alt="${esc(item.label || itemCaption)}" loading="lazy" />
                      <span class="gallery-thumb-label">${esc(item.label || (idx + 1))}</span>
                    </button>
                  `;
                }).join("")}
              </div>
            ` : ""}
          </div>`;

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
          ${galleryHtml}

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
      priceSpecification: {
        "@type": "PriceSpecification",
        priceCurrency: "USD",
        description: "B2B Custom Quotation based on project depth and delivery port terms",
        valueAddedTaxIncluded: false
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
    ogImage: product.image,
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

const blogLabels = {
  tr: { hubTitle: "KD Sondaj Blog", hubLead: "Sondaj, jeotermal, su kuyusu ve mühendislik uygulamalarına dair sahada kanıtlanmış teknik rehberler.", readMore: "Devamını Oku", related: "İlgili İçerik", backToBlog: "Blog'a Dön", categoryLabel: "Kategori" },
  en: { hubTitle: "KD Sondaj Blog", hubLead: "Field-tested technical guides on drilling, geothermal, water wells and engineering practice.", readMore: "Read More", related: "Related Content", backToBlog: "Back to Blog", categoryLabel: "Category" },
  ar: { hubTitle: "مدوّنة كد سونداج", hubLead: "أدلة تقنية مجرّبة ميدانياً عن الحفر والطاقة الحرارية الأرضية وآبار المياه.", readMore: "اقرأ المزيد", related: "محتوى ذو صلة", backToBlog: "العودة إلى المدونة", categoryLabel: "الفئة" }
};

function blogPath(lang, slug) {
  const base = { tr: "/blog/", en: "/en/blog/", ar: "/ar/blog/" };
  return base[lang] + slug + "/";
}

function blogHubPath(lang) {
  return { tr: "/blog/", en: "/en/blog/", ar: "/ar/blog/" }[lang];
}

function blogSchema(post, lang, url) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": url + "#blogposting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        inLanguage: lang,
        keywords: post.keywords.join(", "),
        articleSection: post.category,
        wordCount: post.sections.reduce((acc, s) => acc + s.paragraphs.join(" ").split(/\s+/).length, 0),
        author: { "@type": "Organization", name: "KD SONDAJ", url: site.origin },
        publisher: { "@id": site.origin + "#organization" },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: site.origin + "/assets/hero-field-rig.jpg"
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: lang === "tr" ? "Anasayfa" : lang === "ar" ? "الرئيسية" : "Home", item: site.origin + (lang === "tr" ? "/" : `/${lang}/`) },
          { "@type": "ListItem", position: 2, name: blogLabels[lang].hubTitle, item: site.origin + blogHubPath(lang) },
          { "@type": "ListItem", position: 3, name: post.title, item: url }
        ]
      },
      {
        "@type": "FAQPage",
        mainEntity: post.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a }
        }))
      }
    ]
  };
}

function blogHubSchema(lang, url) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": url + "#blog",
    name: blogLabels[lang].hubTitle,
    description: blogLabels[lang].hubLead,
    url,
    inLanguage: lang,
    publisher: { "@id": site.origin + "#organization" },
    blogPost: blogPosts.slice(0, 10).map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: site.origin + blogPath(lang, p.slug),
      datePublished: p.date
    }))
  };
}

function renderBlogHub(lang) {
  const label = blogLabels[lang];
  const url = site.origin + blogHubPath(lang);
  const cardHtml = blogPosts
    .map((p) => `
      <article class="blog-card">
        <a href="${blogPath(lang, p.slug)}" class="blog-card-link">
          <div class="blog-card-meta">
            <span class="blog-category">${esc(p.category)}</span>
            <span class="blog-read">${esc(p.readTime)}</span>
          </div>
          <h3>${esc(p.title)}</h3>
          <p>${esc(p.description)}</p>
          <span class="blog-cta">${esc(label.readMore)} →</span>
        </a>
      </article>`)
    .join("");

  const inner = `
    <section class="page-hero">
      <div class="wrap">
        ${crumbsHtml(lang, [{ name: label.hubTitle, path: blogHubPath(lang) }])}
        <div class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span><span>${esc(label.categoryLabel)}: Blog</span></div>
        <h1>${esc(label.hubTitle)}</h1>
        <p class="lead">${esc(label.hubLead)}</p>
      </div>
    </section>
    <section class="blog-grid-section">
      <div class="wrap">
        <div class="blog-grid">${cardHtml}</div>
      </div>
    </section>`;

  return layout({
    lang,
    pageKey: "home",
    title: `${label.hubTitle} | KD SONDAJ`,
    description: label.hubLead,
    extraHead: `\n  <link rel="canonical" href="${url}" />\n  ${hreflangLinks("home").replace(/href="[^"]*"/g, (m) => {
      const map = { tr: blogHubPath("tr"), en: blogHubPath("en"), ar: blogHubPath("ar") };
      return m.replace(routes.tr.home, map.tr).replace(routes.en.home, map.en).replace(routes.ar.home, map.ar);
    })}`,
    schema: [blogHubSchema(lang, url)],
    main: inner
  });
}

function renderBlogPost(lang, post) {
  const label = blogLabels[lang];
  const url = site.origin + blogPath(lang, post.slug);
  const sectionsHtml = post.sections
    .map((s, i) => `
      <section class="blog-section">
        <div class="wrap">
          <div class="telemetry-pill"><span class="num-pill">${String(i + 1).padStart(2, "0")}</span><span>${esc(s.heading)}</span></div>
          ${s.paragraphs.map((p) => `<p class="blog-paragraph">${esc(p)}</p>`).join("")}
        </div>
      </section>`)
    .join("");

  const faqHtml = `
    <section class="blog-faq-section">
      <div class="wrap">
        <h2>${lang === "tr" ? "Sık Sorulan Sorular" : lang === "ar" ? "الأسئلة الشائعة" : "Frequently Asked Questions"}</h2>
        <div class="faq">
          ${post.faq.map((f) => `<details class="faq-item"><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("")}
        </div>
      </div>
    </section>`;

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3).map((p) => `
    <a class="blog-related-card" href="${blogPath(lang, p.slug)}">
      <div class="blog-card-meta">
        <span class="blog-category">${esc(p.category)}</span>
        <span class="blog-read">${esc(p.readTime)}</span>
      </div>
      <h4>${esc(p.title)}</h4>
    </a>`).join("");

  const cta = `
    <section class="blog-cta-section">
      <div class="wrap">
        <div class="cta-row">
          <a class="btn btn-wa" href="${whatsapp(tr)}" target="_blank" rel="noopener">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.44-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.44 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23-1.48 0-2.93-.39-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24"/></svg>
            0541 191 63 01
          </a>
          <a class="btn btn-signal" href="${blogHubPath(lang)}">${esc(label.backToBlog)}</a>
        </div>
      </div>
    </section>`;

  const inner = `
    <article class="blog-post-article">
      <header class="page-hero">
        <div class="wrap">
          ${crumbsHtml(lang, [
            { name: blogLabels[lang].hubTitle, path: blogHubPath(lang) },
            { name: post.title, path: blogPath(lang, post.slug) }
          ])}
          <div class="telemetry-pill shimmer-badge"><span class="beacon-dot"></span><span>${esc(post.category)}</span></div>
          <h1>${esc(post.title)}</h1>
          <p class="lead">${esc(post.description)}</p>
          <div class="blog-meta-row">
            <span>${esc(post.date)}</span><span>·</span><span>${esc(post.readTime)}</span><span>·</span><span>KD SONDAJ</span>
          </div>
        </div>
      </header>
      ${sectionsHtml}
      ${faqHtml}
      <section class="blog-related">
        <div class="wrap">
          <h3>${esc(label.related)}</h3>
          <div class="blog-related-grid">${related}</div>
        </div>
      </section>
      ${cta}
    </article>`;

  const extraHead = `
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="${esc(post.title)}" />
  <meta property="og:description" content="${esc(post.description)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${site.origin}/assets/hero-field-rig.jpg" />
  <meta property="article:published_time" content="${post.date}" />
  <meta property="article:section" content="${esc(post.category)}" />
  <meta property="article:author" content="KD SONDAJ" />
  ${post.keywords.map((k) => `<meta property="article:tag" content="${esc(k)}" />`).join("\n  ")}
  ${hreflangLinks("home").replace(/href="[^"]*"/g, (m) => {
    const map = { tr: blogPath("tr", post.slug), en: blogPath("en", post.slug), ar: blogPath("ar", post.slug) };
    return m.replace(routes.tr.home, map.tr).replace(routes.en.home, map.en).replace(routes.ar.home, map.ar);
  })}`;

  return layout({
    lang,
    pageKey: "home",
    title: `${post.title} | KD SONDAJ`,
    description: post.description,
    extraHead,
    schema: [blogSchema(post, lang, url)],
    main: inner
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

function priorityFor(key, lang) {
  if (key === "home") return 1.0;
  if (["services", "equipment", "guides" in routes[lang] ? "guides" : "guideHub", "references", "contact", "about"].includes(key)) return 0.8;
  if (key.startsWith("guide") || key === "guideHub") return 0.7;
  if (key.startsWith("product")) return 0.7;
  if (["water", "geothermal", "geotechnical", "mineral"].includes(key)) return 0.7;
  if (key === "pipes" || key === "bits" || key === "rigs") return 0.7;
  return 0.5;
}

function buildSitemap() {
  const today = new Date().toISOString().slice(0, 10);
  const pageUrls = ["tr", "en", "ar"].flatMap((lang) =>
    allPageKeys.map((key) => {
      const loc = originUrl(routes[lang][key]);
      return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priorityFor(key, lang).toFixed(1)}</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="${originUrl(routes.tr[key])}" />
    <xhtml:link rel="alternate" hreflang="en" href="${originUrl(routes.en[key])}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${originUrl(routes.ar[key])}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${originUrl(routes.en[key])}" />
  </url>`;
    })
  );
  const blogUrls = ["tr", "en", "ar"].flatMap((lang) => {
    const hubUrl = `  <url>
    <loc>${originUrl(blogHubPath(lang))}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="${originUrl(blogHubPath("tr"))}" />
    <xhtml:link rel="alternate" hreflang="en" href="${originUrl(blogHubPath("en"))}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${originUrl(blogHubPath("ar"))}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${originUrl(blogHubPath("en"))}" />
  </url>`;
    const postUrls = blogPosts.map((p) => `  <url>
    <loc>${originUrl(blogPath(lang, p.slug))}</loc>
    <lastmod>${p.date}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="${originUrl(blogPath("tr", p.slug))}" />
    <xhtml:link rel="alternate" hreflang="en" href="${originUrl(blogPath("en", p.slug))}" />
    <xhtml:link rel="alternate" hreflang="ar" href="${originUrl(blogPath("ar", p.slug))}" />
    <xhtml:link rel="alternate" hreflang="x-default" href="${originUrl(blogPath("en", p.slug))}" />
  </url>`);
    return [hubUrl, ...postUrls];
  });
  const urls = [...pageUrls, ...blogUrls];
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

  // Blog Hub
  write(fileFor(blogHubPath(lang)), renderBlogHub(lang));

  // Blog Posts (TR content for now; EN/AR fallback uses same TR body)
  for (const post of blogPosts) {
    write(fileFor(blogPath(lang, post.slug)), renderBlogPost(lang, post));
  }
}

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

// Admin Command Center & Portal
write(join(dist, "admin/index.html"), generateAdminDashboardHtml());

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

