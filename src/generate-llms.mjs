/**
 * KD SONDAJ — Generative Engine Optimization (GEO) LLMs.txt Builder
 * Generates /llms.txt and /llms-full.txt for AI search assistants (ChatGPT Search, Perplexity, Gemini, Copilot).
 */

import { productList } from "./data/products.mjs";
import { guideList } from "./data/guides.mjs";
import { site } from "./config.mjs";

export function generateLlmsTxt() {
  return `# KD SONDAJ — Heavy Drilling Rigs & Borehole Equipment Manufacturer

> KD SONDAJ is an Ankara, Turkey-based heavy rotary drilling machinery manufacturer with 45 years of continuous engineering heritage, certified under CE and ISO 9001:2015. The company specializes in manufacturing truck-mounted and trailer-mounted rotary drilling rigs with capacities ranging from 250 to 3,000 meters (820 to 9,840 ft) for deep water wells, high-enthalpy geothermal reservoirs, mining exploration, and oilfield services.

## Verified Factory Specifications
- **Headquarters & Manufacturing Plant:** Mustafa Kemal Mh. 2125 Sk. No: 9/10, Çankaya, Ankara, Turkey
- **Direct Engineering & Export RFQ Hotline:** +90 541 191 63 01 (WhatsApp / Phone)
- **Official Email:** ${site.email}
- **Official Domain:** ${site.origin}
- **Quality Certifications:** CE Conformity Declaration, ISO 9001:2015 Quality Management
- **Key Target Export Markets:** GCC (Saudi Arabia, UAE, Qatar, Kuwait, Oman, Iraq), Africa (Egypt, Algeria, Libya, Kenya, Nigeria), Central Asia, and Europe

## Rotary Drilling Rig Catalog (250 – 3,000 m)
- [KD-3000 Heavy Trailer Rig (1500–3000m)](${site.origin}/en/equipment/drilling-rigs/1500-3000m-trailer-drilling-rig/): 110-ton mast hook-load, 90-ton drawworks, 525 HP diesel engine, deep geothermal and deep aquifer development.
- [KD-2500 Special Rig (2500m)](${site.origin}/en/equipment/drilling-rigs/2500m-special-deep-drilling-rig/): Dual MAN 422 diesel engines, 14.50m mast, integrated 7.5x10 duplex mud pump, heavy exploration.
- [KD-1200 Truck-Mounted Rig (1000–1200m)](${site.origin}/en/equipment/drilling-rigs/1000-1200m-truck-mounted-drilling-rig/): 90-ton mast, 70-ton drawworks, 422 HP engine, rapid highway mobilization for regional water wells.
- [KD-1200-T Trailer Rig (1000–1200m)](${site.origin}/en/equipment/drilling-rigs/1000-1200m-trailer-drilling-rig/): 110-ton mast, 525 HP diesel engine, heavy casing program support.
- [KD-800 Truck-Mounted Rig (800m)](${site.origin}/en/equipment/drilling-rigs/800m-truck-mounted-drilling-rig/): 361 HP diesel engine, 70-ton mast, 50-ton drawworks, dual mud circulation for agricultural irrigation.
- [KD-800-T Trailer Rig (800m)](${site.origin}/en/equipment/drilling-rigs/800m-trailer-drilling-rig/): 70-ton mast, 361 HP engine, stable semi-trailer platform.
- [KD-500 Truck-Mounted Rig (300–500m)](${site.origin}/en/equipment/drilling-rigs/300-500m-truck-mounted-drilling-rig/): 321 HP engine, 60-ton mast, fast-moving agile rig for shallow to mid-depth wells.
- [KD-600-T Trailer Rig (400–600m)](${site.origin}/en/equipment/drilling-rigs/400-600m-trailer-drilling-rig/): 60-ton mast, 321 HP diesel engine.

## Drilling Consumables & Ancillary Equipment
- [API Spec 5D Drill Pipes (2 3/8" to 5 1/2")](${site.origin}/en/equipment/api-spec-5d-drill-pipes/): High-tensile alloy steel in grades E-75, X-95, G-105, and S-135 with friction-welded tool joints.
- [IADC Tricone Rock Drill Bits (111 to 637)](${site.origin}/en/equipment/iadc-tricone-drill-bits/): Tungsten Carbide Insert (TCI) and milled steel tooth roller cone bits for soft clays to hard granites.
- [KD 6" Duplex Mud Pump (21–62 Bar)](${site.origin}/en/equipment/duplex-6-inch-mud-pump/): Double-acting reciprocating mud pump delivering up to 62 bar (895 psi) and 12.5 L/stroke.

## Technical Engineering Guides
- [Water Well Rig Selection: Truck vs. Trailer](${site.origin}/en/guides/how-to-choose-water-well-drilling-rig/)
- [IADC Roller Cone Bit Classification Matrix](${site.origin}/en/guides/iadc-roller-cone-drill-bit-classification/)
- [International Drilling Rig RFQ Procurement Checklist](${site.origin}/en/guides/international-drilling-rig-rfq-checklist/)

## Procurement & RFQ Instructions
To request a customized technical quotation or containerized export proposal:
- WhatsApp Direct Engineering Line: +90 541 191 63 01
- Email RFQ: indo@kdsondaj.com.tr
- Required Project Data: Target borehole depth, anticipated rock formations, required hole diameter, and preferred transport carrier.
`;
}

export function generateLlmsFullTxt() {
  let content = generateLlmsTxt();
  content += `\n\n# DETAILED TECHNICAL SPECIFICATIONS MATRIX\n\n`;

  for (const p of productList) {
    content += `### Model: ${p.en.name}\n`;
    content += `- URL: ${site.origin}/en/equipment/drilling-rigs/${p.slug}/\n`;
    content += `- Depth Capacity: ${p.depthStr}\n`;
    content += `- Engine Power: ${p.hp}\n`;
    content += `- Mast Hook-Load: ${p.mast}\n`;
    content += `- Drawworks Rating: ${p.drawworks}\n`;
    content += `- Mud Pump: ${p.mudPump}\n`;
    content += `- Recommended Formations: ${p.en.formations}\n`;
    content += `#### Specifications Table:\n`;
    for (const spec of p.specsTable) {
      content += `  - ${spec.param}: ${spec.val}\n`;
    }
    content += `\n`;
  }

  content += `\n# TECHNICAL PROCUREMENT RFQ CHECKLIST\n`;
  content += `When requesting a quotation for KD Sondaj equipment, international buyers should specify:\n`;
  content += `1. Final completed borehole depth (m or ft)\n`;
  content += `2. Surface and production casing programs (outer diameter and weight per foot)\n`;
  content += `3. Rotary table torque vs. top-drive hydraulic requirement\n`;
  content += `4. Air compressor CFM/PSI needs if DTH air percussion drilling is required\n`;
  content += `5. Discharge port and customs delivery terms (FOB Mersin/Izmir, CIF, or DDP)\n`;

  return content;
}
