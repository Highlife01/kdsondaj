/**
 * KD SONDAJ — Modern Interactive Client Script
 * Handles mobile drawer, rig catalog filtering, dynamic calculator & scroll interactions
 */

(function () {
  "use strict";

  // Dynamic Media & Hero Overrides from Dashboard
  (function applyMediaOverrides() {
    try {
      var saved = localStorage.getItem("kd_site_media");
      if (!saved) return;
      var mediaList = JSON.parse(saved);
      if (!Array.isArray(mediaList)) return;

      // 1. Hero slides overrides
      var heroOverrides = mediaList.filter(function (m) { return m.isHero; });
      heroOverrides.sort(function (a, b) { return (a.slideIndex || 0) - (b.slideIndex || 0); });

      if (heroOverrides.length) {
        var heroImgs = document.querySelectorAll(".hero-slide-item .hero-slide-img");
        var heroTitles = document.querySelectorAll(".hero-slide-text-item .hero-h1");
        var heroBadges = document.querySelectorAll(".hero-slide-text-item .hero-badge-pill span:last-child");
        var heroLeads = document.querySelectorAll(".hero-slide-text-item .hero-lead");
        var heroTabTitles = document.querySelectorAll(".hero-tab-card .hero-tab-title");

        heroOverrides.forEach(function (item, idx) {
          if (heroImgs[idx] && item.src) {
            heroImgs[idx].src = item.src;
            if (item.altTr) heroImgs[idx].alt = item.altTr;
            if (heroImgs[idx].closest(".hero-slide-item")) {
              heroImgs[idx].closest(".hero-slide-item").style.display = "";
            }
          }
          if (heroTitles[idx] && item.titleTr) {
            heroTitles[idx].textContent = item.titleTr;
            if (heroTitles[idx].closest(".hero-slide-text-item")) {
              heroTitles[idx].closest(".hero-slide-text-item").style.display = "";
            }
          }
          if (heroBadges[idx] && item.badgeTr) heroBadges[idx].textContent = item.badgeTr;
          if (heroLeads[idx] && item.leadTr) heroLeads[idx].textContent = item.leadTr;
          if (heroTabTitles[idx] && (item.tabTitleTr || item.titleTr)) {
            heroTabTitles[idx].textContent = item.tabTitleTr || item.titleTr;
            if (heroTabTitles[idx].closest(".hero-tab-card")) {
              heroTabTitles[idx].closest(".hero-tab-card").style.display = "";
            }
          }
        });

        // Hide excess slides if user configured fewer than default
        for (var i = heroOverrides.length; i < heroImgs.length; i++) {
          if (heroImgs[i] && heroImgs[i].closest(".hero-slide-item")) {
            heroImgs[i].closest(".hero-slide-item").style.display = "none";
          }
          if (heroTitles[i] && heroTitles[i].closest(".hero-slide-text-item")) {
            heroTitles[i].closest(".hero-slide-text-item").style.display = "none";
          }
          if (heroTabTitles[i] && heroTabTitles[i].closest(".hero-tab-card")) {
            heroTabTitles[i].closest(".hero-tab-card").style.display = "none";
          }
        }
      }

      // 2. Product and section image overrides
      mediaList.forEach(function (item) {
        if (!item.src) return;
        var elements = [];

        if (item.targetElement) {
          try {
            var found = document.querySelectorAll(item.targetElement);
            found.forEach(function (el) { elements.push(el); });
          } catch (e) {}
        }
        if (item.id) {
          try {
            var byId = document.querySelectorAll('[data-product-id="' + item.id + '"], [data-machine-id="' + item.id + '"], [data-media-id="' + item.id + '"]');
            byId.forEach(function (el) {
              if (elements.indexOf(el) === -1) elements.push(el);
            });
          } catch (e) {}
        }

        elements.forEach(function (el) {
          if (el.tagName === "IMG") {
            el.src = item.src;
            if (item.altTr) el.alt = item.altTr;
          } else {
            var imgChild = el.querySelector("img");
            if (imgChild) {
              imgChild.src = item.src;
              if (item.altTr) imgChild.alt = item.altTr;
            }
          }
        });
      });
    } catch (e) {
      console.warn("Media overrides error:", e);
    }
  })();

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

  // 2. Heavy Rig & Modern Product Catalog Filter (All / Trailer / Truck / Equipment)
  var filterButtons = document.querySelectorAll(".filter-btn");
  var rigCards = document.querySelectorAll(".rig-card, .modern-prod-card");

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

  // 2.1 Hero Carousel Interactive Logic (Asiaplast Flagship Style)
  var heroSection = document.getElementById("hero-carousel");
  if (heroSection) {
    var slides = heroSection.querySelectorAll(".hero-slide");
    var tabBtns = heroSection.querySelectorAll(".hero-tab-btn");
    var prevBtn = document.getElementById("hero-prev");
    var nextBtn = document.getElementById("hero-next");
    var currentSlide = 0;
    var slideCount = slides.length;
    var carouselTimer = null;

    function goToSlide(index) {
      if (index < 0) index = slideCount - 1;
      if (index >= slideCount) index = 0;
      currentSlide = index;

      slides.forEach(function (slide, i) {
        if (i === currentSlide) {
          slide.classList.add("active");
          slide.setAttribute("aria-hidden", "false");
        } else {
          slide.classList.remove("active");
          slide.setAttribute("aria-hidden", "true");
        }
      });

      tabBtns.forEach(function (btn, i) {
        var existingBar = btn.querySelector(".hero-tab-progress-bar");
        if (existingBar) existingBar.remove();

        var existingLive = btn.querySelector(".hero-tab-live");
        if (existingLive) existingLive.remove();

        if (i === currentSlide) {
          btn.classList.add("active");
          var headerEl = btn.querySelector(".hero-tab-header");
          if (headerEl) {
            var liveBadge = document.createElement("span");
            liveBadge.className = "hero-tab-live";
            liveBadge.textContent = "LIVE";
            headerEl.appendChild(liveBadge);
          }
          var bar = document.createElement("div");
          bar.className = "hero-tab-progress-bar";
          btn.appendChild(bar);
        } else {
          btn.classList.remove("active");
        }
      });

      resetCarouselTimer();
    }

    function resetCarouselTimer() {
      if (carouselTimer) clearInterval(carouselTimer);
      carouselTimer = setInterval(function () {
        goToSlide(currentSlide + 1);
      }, 6000);
    }

    tabBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var targetIndex = parseInt(btn.getAttribute("data-target-slide"), 10);
        goToSlide(targetIndex);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(currentSlide - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(currentSlide + 1);
      });
    }

    resetCarouselTimer();
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
        siteHeader.style.background = "rgba(255, 255, 255, 0.96)";
        siteHeader.style.borderColor = "rgba(226, 232, 240, 0.95)";
        siteHeader.style.boxShadow = "0 4px 20px -2px rgba(15, 23, 42, 0.08)";
      } else {
        siteHeader.style.background = "rgba(255, 255, 255, 0.92)";
        siteHeader.style.borderColor = "rgba(226, 232, 240, 0.85)";
        siteHeader.style.boxShadow = "0 1px 3px 0 rgba(0, 0, 0, 0.03)";
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

        var mailUrl = "mailto:indo@kdsondaj.com.tr?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
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

  // 8. Interactive Product Photo Gallery Switcher
  var galleryThumbs = document.querySelectorAll(".gallery-thumb-btn");
  var mainImg = document.getElementById("mainGalleryImg");
  var mainBadge = document.getElementById("galleryBadge");

  if (galleryThumbs.length && mainImg) {
    galleryThumbs.forEach(function (thumb) {
      thumb.addEventListener("click", function () {
        var src = thumb.getAttribute("data-src");
        var alt = thumb.getAttribute("data-alt");
        var caption = thumb.getAttribute("data-caption");

        galleryThumbs.forEach(function (t) { t.classList.remove("is-active"); });
        thumb.classList.add("is-active");

        mainImg.style.opacity = "0.35";
        mainImg.style.transform = "scale(0.98)";
        setTimeout(function () {
          mainImg.src = src;
          if (alt) mainImg.alt = alt;
          if (mainBadge && caption) mainBadge.textContent = caption;
          mainImg.style.opacity = "1";
          mainImg.style.transform = "scale(1)";
        }, 140);
      });
    });
  }

  // 10. Asiaplast-Style Dynamic Hero Carousel Controller
  (function initHeroCarousel() {
    var slides = document.querySelectorAll(".hero-slide-item");
    var textSlides = document.querySelectorAll(".hero-slide-text-item");
    var tabs = document.querySelectorAll(".hero-tab-card");
    var prevBtn = document.getElementById("heroPrevBtn");
    var nextBtn = document.getElementById("heroNextBtn");
    if (!slides.length || !tabs.length) return;

    var currentIndex = 0;
    var timer = null;
    var intervalTime = 6500;

    function showSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach(function (slide, i) {
        if (i === currentIndex) {
          slide.classList.add("is-active");
          slide.setAttribute("aria-hidden", "false");
        } else {
          slide.classList.remove("is-active");
          slide.setAttribute("aria-hidden", "true");
        }
      });

      if (textSlides.length) {
        textSlides.forEach(function (ts, i) {
          if (i === currentIndex) {
            ts.classList.add("is-active");
          } else {
            ts.classList.remove("is-active");
          }
        });
      }

      tabs.forEach(function (tab, i) {
        if (i === currentIndex) {
          tab.classList.add("is-active");
          tab.setAttribute("aria-selected", "true");
        } else {
          tab.classList.remove("is-active");
          tab.setAttribute("aria-selected", "false");
        }
      });
    }

    function nextSlide() {
      showSlide(currentIndex + 1);
    }

    function prevSlide() {
      showSlide(currentIndex - 1);
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(nextSlide, intervalTime);
    }

    function stopTimer() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var idx = parseInt(tab.getAttribute("data-slide-index"), 10);
        showSlide(idx);
        startTimer();
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prevSlide();
        startTimer();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        nextSlide();
        startTimer();
      });
    }

    var heroSection = document.querySelector(".hero-carousel-section");
    if (heroSection) {
      heroSection.addEventListener("mouseenter", stopTimer);
      heroSection.addEventListener("mouseleave", startTimer);

      var touchStartX = 0;
      var touchEndX = 0;
      heroSection.addEventListener("touchstart", function (e) {
        if (e.changedTouches && e.changedTouches[0]) {
          touchStartX = e.changedTouches[0].screenX;
        }
      }, { passive: true });

      heroSection.addEventListener("touchend", function (e) {
        if (e.changedTouches && e.changedTouches[0]) {
          touchEndX = e.changedTouches[0].screenX;
          var diff = touchStartX - touchEndX;
          if (Math.abs(diff) > 45) {
            if (diff > 0) nextSlide();
            else prevSlide();
            startTimer();
          }
        }
      }, { passive: true });
    }

    startTimer();
  })();
})();


