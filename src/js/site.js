/**
 * KD SONDAJ — Modern Interactive Client Script
 * Handles mobile drawer, rig catalog filtering, dynamic calculator & scroll interactions
 */

(function () {
  "use strict";

  // 1. Mobile Menu Drawer Navigation
  var menuBtn = document.getElementById("menu-toggle");
  var mobilePanel = document.getElementById("mobile-panel");

  if (menuBtn && mobilePanel) {
    menuBtn.addEventListener("click", function () {
      var isOpen = mobilePanel.classList.toggle("is-open");
      menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
      menuBtn.innerHTML = isOpen ? "✕" : "☰";
    });

    mobilePanel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        mobilePanel.classList.remove("is-open");
        menuBtn.setAttribute("aria-expanded", "false");
        menuBtn.innerHTML = "☰";
      });
    });
  }

  // 2. Heavy Rig Catalog Carrier Filter (All / Trailer / Truck)
  var filterButtons = document.querySelectorAll(".filter-btn");
  var rigCards = document.querySelectorAll(".rig-card");

  if (filterButtons.length && rigCards.length) {
    filterButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        var filter = btn.getAttribute("data-filter");
        rigCards.forEach(function (card) {
          var carrier = card.getAttribute("data-carrier");
          if (filter === "all" || carrier === filter) {
            card.style.display = "flex";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  }

  // 3. Interactive Subterranean Quote & Rig Selector Calculator
  var calcWidget = document.getElementById("rig-calculator");
  if (calcWidget) {
    var lang = calcWidget.getAttribute("data-lang") || "tr";
    var currentType = "water";
    var currentDepth = "800";

    var typeButtons = calcWidget.querySelectorAll("#calc-types .calc-pill");
    var depthButtons = calcWidget.querySelectorAll("#calc-depths .calc-pill");
    var rigNameEl = document.getElementById("calc-rig-name");
    var rigDescEl = document.getElementById("calc-rig-desc");
    var waBtnEl = document.getElementById("calc-wa-btn");

    var calcData = {
      tr: {
        types: {
          water: "Su Sondajı",
          geothermal: "Jeotermal Sondaj",
          mineral: "Karotlu Maden",
          geotechnical: "Zemin & Geoteknik"
        },
        rigs: {
          "300": {
            name: "KD-300 / KD-500 Kamyon Üstü Hidrolik Kule",
            desc: "250–500 m sığ su kuyuları ve geoteknik araştırmalar için hızlı intikal eden kamyon üstü ünite."
          },
          "800": {
            name: "KD-800 / KD-1000 Kamyon Üstü Kule",
            desc: "500–1000 m orta-derin su kuyuları ve belediye işleri için yüksek torklu, çift çamur pompalı sistem."
          },
          "1500": {
            name: "KD-1500 Ağır Dorse Kule",
            desc: "1000–1800 m derin DSİ içme suyu ve derin maden karotlama için 40–55 ton kule kapasiteli ağır dorse sınıfı."
          },
          "3000": {
            name: "KD-3000 Ultra Derin Jeotermal & Rezervuar Kulesi",
            desc: "1800–3000 m yüksek entalpili jeotermal rezervuar ve derin enerji kuyuları için 70–80 ton kule ve 800+ HP güç ünitesi."
          }
        },
        msgTemplate: function (type, depth, rig) {
          return "Merhaba, KD Sondaj web sitesinden " + type + " (" + depth + " m) projemiz için " + rig + " hakkında teknik bilgi ve fiyat teklifi almak istiyoruz.";
        }
      },
      en: {
        types: {
          water: "Water Well Drilling",
          geothermal: "Geothermal Drilling",
          mineral: "Mineral Core Drilling",
          geotechnical: "Geotechnical Survey"
        },
        rigs: {
          "300": {
            name: "KD-300 / KD-500 Truck-Mounted Hydraulic Rig",
            desc: "Rapid deployment truck unit ideal for 250–500 m shallow water aquifers and site geotechnical logging."
          },
          "800": {
            name: "KD-800 / KD-1000 Heavy Truck Rig",
            desc: "High-torque truck platform with duplex mud circulation, engineered for 500–1000 m municipal & agricultural wells."
          },
          "1500": {
            name: "KD-1500 Heavy Trailer-Mounted Rig",
            desc: "Heavy trailer class with 40–55 ton mast capacity for 1000–1800 m deep aquifer and mineral exploration."
          },
          "3000": {
            name: "KD-3000 Ultra-Deep Geothermal Trailer Rig",
            desc: "Flagship 70–80 ton mast and 800+ HP deck engines for 1800–3000 m deep high-enthalpy geothermal reservoirs."
          }
        },
        msgTemplate: function (type, depth, rig) {
          return "Hello, I would like to request technical specifications and a quotation from KD Sondaj for our " + type + " (" + depth + " m) project with " + rig + ".";
        }
      },
      ar: {
        types: {
          water: "حفر آبار المياه",
          geothermal: "حفر الطاقة الحرارية الأرضية",
          mineral: "استكشاف المعادن بالقلب الصخري",
          geotechnical: "فحص التربة والجيوتقنية"
        },
        rigs: {
          "300": {
            name: "حفارة هيدروليكية مثبتة على شاحنة KD-300 / KD-500",
            desc: "وحدة شاحنة سريعة الحركة مخصصة لآبار المياه السطحية والأبحاث الجيوتقنية بعمق 250–500 متر."
          },
          "800": {
            name: "حفارة شاحنة ثقيلة KD-800 / KD-1000",
            desc: "منصة شاحنة بعزم دوران فائق ونظام مضخة طين مزدوج لمشاريع الآبار البلدية بعمق 500–1000 متر."
          },
          "1500": {
            name: "حفارة مقطورة ثقيلة KD-1500",
            desc: "فئة مقطورة ثقيلة بقدرة برج 40–55 طن لمشاريع مياه الشرب العميقة واستكشاف المعادن بعمق 1000–1800 متر."
          },
          "3000": {
            name: "حفارة مقطورة عملاقة KD-3000 للطاقة الحرارية",
            desc: "برج سعة 70–80 طن ومحركات 800+ حصان لآبار الطاقة الحرارية والطبقات العميقة حتى 3000 متر."
          }
        },
        msgTemplate: function (type, depth, rig) {
          return "مرحباً، أود الحصول على المواصفات الفنية وعرض سعر من شركة KD Sondaj لمشروعنا " + type + " (عمق " + depth + " متر) باستخدام " + rig + ".";
        }
      }
    };

    function updateCalculator() {
      var dict = calcData[lang] || calcData.tr;
      var rigInfo = dict.rigs[currentDepth] || dict.rigs["800"];
      var typeName = dict.types[currentType] || dict.types.water;

      if (rigNameEl) rigNameEl.textContent = rigInfo.name;
      if (rigDescEl) rigDescEl.textContent = rigInfo.desc;

      if (waBtnEl) {
        var msg = dict.msgTemplate(typeName, currentDepth, rigInfo.name);
        waBtnEl.href = "https://wa.me/905411916301?text=" + encodeURIComponent(msg);
      }
    }

    typeButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        typeButtons.forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        currentType = btn.getAttribute("data-type");
        updateCalculator();
      });
    });

    depthButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        depthButtons.forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
        currentDepth = btn.getAttribute("data-depth");
        updateCalculator();
      });
    });

    updateCalculator();
  }

  // 4. Back to Top Button
  var backToTopBtn = document.getElementById("back-to-top");
  if (backToTopBtn) {
    backToTopBtn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // 5. Sticky Header Border Shade on Scroll
  var siteHeader = document.querySelector(".site-header");
  if (siteHeader) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 20) {
        siteHeader.style.background = "rgba(7, 9, 13, 0.94)";
        siteHeader.style.borderColor = "rgba(255, 255, 255, 0.14)";
      } else {
        siteHeader.style.background = "var(--bg-glass)";
        siteHeader.style.borderColor = "var(--border)";
      }
    }, { passive: true });
  }

  // 6. Interactive Contact & Quotation Form Handler (WhatsApp 05411916301 & Email)
  var contactFormEl = document.getElementById("kd-contact-form");
  if (contactFormEl) {
    var waSubmitBtn = document.getElementById("cf-submit-wa");
    var mailSubmitBtn = document.getElementById("cf-submit-mail");
    var successBanner = document.getElementById("form-success-banner");

    function getFormData() {
      var name = (document.getElementById("cf-name") || {}).value || "";
      var phone = (document.getElementById("cf-phone") || {}).value || "";
      var email = (document.getElementById("cf-email") || {}).value || "";
      var location = (document.getElementById("cf-location") || {}).value || "";
      var service = (document.getElementById("cf-service") || {}).value || "";
      var depth = (document.getElementById("cf-depth") || {}).value || "";
      var notes = (document.getElementById("cf-notes") || {}).value || "";

      return {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        location: location.trim(),
        service: service,
        depth: depth,
        notes: notes.trim()
      };
    }

    function validateRequired(data) {
      if (!data.name) {
        alert("Lütfen ad ve soyadınızı belirtiniz.");
        var nameInput = document.getElementById("cf-name");
        if (nameInput) nameInput.focus();
        return false;
      }
      if (!data.phone) {
        alert("Lütfen telefon numaranızı belirtiniz.");
        var phoneInput = document.getElementById("cf-phone");
        if (phoneInput) phoneInput.focus();
        return false;
      }
      return true;
    }

    function recordInquiryToCloud(data, channel) {
      var newInq = {
        id: "inq_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
        name: data.name,
        phone: data.phone,
        email: data.email || "",
        location: data.location || "",
        service: data.service || "Su Sondajı",
        depth: data.depth || "",
        notes: data.notes || "",
        channel: channel || "Web Form",
        date: new Date().toISOString(),
        status: "new"
      };

      fetch("https://api.restful-api.dev/objects/ff808181a09d98f701a12aecdae83c87")
        .then(function (r) { return r.json(); })
        .then(function (res) {
          var inquiries = (res && res.data && Array.isArray(res.data.inquiries)) ? res.data.inquiries : [];
          inquiries.unshift(newInq);
          if (inquiries.length > 200) inquiries = inquiries.slice(0, 200);
          return fetch("https://api.restful-api.dev/objects/ff808181a09d98f701a12aecdae83c87", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: "KD Sondaj Inbox",
              data: { inquiries: inquiries }
            })
          });
        })
        .catch(function (err) {
          console.warn("Inquiry cloud dispatch:", err);
        });
    }

    if (waSubmitBtn) {
      waSubmitBtn.addEventListener("click", function () {
        var data = getFormData();
        if (!validateRequired(data)) return;

        recordInquiryToCloud(data, "WhatsApp Form");

        var message = 
          "*KD SONDAJ — Proje Teklif Talebi*\n" +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "👤 *Ad Soyad:* " + data.name + "\n" +
          "📞 *Telefon:* " + data.phone + "\n" +
          (data.email ? "✉️ *E-posta:* " + data.email + "\n" : "") +
          (data.location ? "📍 *Lokasyon:* " + data.location + "\n" : "") +
          "⚙️ *Hizmet:* " + data.service + "\n" +
          "📏 *Hedef Derinlik:* " + data.depth + "\n" +
          (data.notes ? "📝 *Proje Notu:* " + data.notes + "\n" : "") +
          "━━━━━━━━━━━━━━━━━━━━\n" +
          "_Web sitesi teklif formu üzerinden gönderildi._";

        if (successBanner) {
          successBanner.style.display = "block";
          successBanner.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        var waUrl = "https://wa.me/905411916301?text=" + encodeURIComponent(message);
        window.open(waUrl, "_blank");
      });
    }

    if (mailSubmitBtn) {
      mailSubmitBtn.addEventListener("click", function () {
        var data = getFormData();
        if (!validateRequired(data)) return;

        recordInquiryToCloud(data, "E-Posta Form");

        var subject = "Teklif Talebi: " + data.service + " (" + data.depth + ") — " + data.name;
        var body = 
          "KD SONDAJ MÜHENDİSLİK HATTINA,\n\n" +
          "Ad Soyad: " + data.name + "\n" +
          "Telefon: " + data.phone + "\n" +
          "E-posta: " + (data.email || "Belirtilmedi") + "\n" +
          "Lokasyon / Şehir: " + (data.location || "Belirtilmedi") + "\n" +
          "Hizmet Türü: " + data.service + "\n" +
          "Hedef Derinlik: " + data.depth + "\n\n" +
          "Proje Açıklaması / Formasyon Notları:\n" + (data.notes || "Not eklenmedi") + "\n\n" +
          "İyi çalışmalar.";

        if (successBanner) {
          successBanner.style.display = "block";
          successBanner.scrollIntoView({ behavior: "smooth", block: "center" });
        }

        var mailUrl = "mailto:info@kdsondaj.com?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
        window.location.href = mailUrl;
      });
    }
  }

  // 7. Scroll Reveal Observer & Dynamic Metric Counters
  function animateNumber(el, target, prefix, suffix, duration) {
    var startVal = 0;
    var startTime = null;
    var dur = duration || 1400;

    function frame(now) {
      if (!startTime) startTime = now;
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / dur, 1);
      var ease = 1 - Math.pow(1 - progress, 4);
      var current = Math.floor(ease * target);
      el.textContent = (prefix || "") + current + (suffix || "");
      if (progress < 1) {
        window.requestAnimationFrame(frame);
      } else {
        el.textContent = (prefix || "") + target + (suffix || "");
      }
    }
    window.requestAnimationFrame(frame);
  }

  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");

          var counters = entry.target.querySelectorAll ? entry.target.querySelectorAll("[data-counter]") : [];
          if (entry.target.hasAttribute && entry.target.hasAttribute("data-counter")) {
            counters = [entry.target];
          }
          counters.forEach(function (cnt) {
            if (!cnt.dataset.animated) {
              cnt.dataset.animated = "true";
              var target = parseInt(cnt.getAttribute("data-counter"), 10);
              var prefix = cnt.getAttribute("data-prefix") || "";
              var suffix = cnt.getAttribute("data-suffix") || "";
              animateNumber(cnt, target, prefix, suffix, 1600);
            }
          });

          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    document.querySelectorAll(".reveal-on-scroll").forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  // 8. Progressive Web App (PWA) ServiceWorker Registration
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js").then(function (reg) {
        console.log("KD SONDAJ PWA ServiceWorker Active:", reg.scope);
      }).catch(function (err) {
        console.warn("PWA ServiceWorker registration error:", err);
      });
    });
  }
})();

