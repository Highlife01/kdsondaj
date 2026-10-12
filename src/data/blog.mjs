// Blog data — 10 uzun-form yazı. TR odaklı, EN/AR sonraki turlarda eklenecek.
// Her yazı SEO + GEO sinyalleri taşır: spesifik derinlik/şehir değerleri,
// Schema.org'un BlogPosting + FAQPage + BreadcrumbList şemalarını besler.
// Internal linkler site.pages ve routes üzerinden çözülür.

export const posts = [
  {
    slug: "su-kuyusu-acma-izni-2026-rehberi",
    category: "Düzenleme & İzin",
    date: "2026-10-12",
    readTime: "8 dk",
    title: "Su Kuyusu Açma İzni Nasıl Alınır? 2026 Güncel Rehberi",
    description:
      "Yeraltı suyu arama ve kullanma izni süreci, DSİ başvurusu, belediye ön izinleri, MTA hidrojeoloji raporu ve 2026 güncel ücret tarifesi. Ankara merkezli sahada 45 yıllık deneyim.",
    keywords: [
      "su kuyusu açma izni 2026",
      "DSİ kuyu ruhsatı",
      "yeraltı suyu arama izni",
      "kuyu kullanma belgesi"
    ],
    relatedServices: ["water"],
    relatedProducts: ["productTrailer800", "productTruck800"],
    sections: [
      {
        heading: "İzin türleri ve yasal çerçeve",
        paragraphs: [
          "Türkiye'de yeraltı suyu arama ve kullanma hakkı 167 sayılı Yeraltı Suları Kanunu ile düzenlenir. Üç ayrı belge tipi vardır: DSİ'den alınan Arama Ruhsatı, Kullanma İzni ve Kullanma Belgesi. Her üçü de projenin niteliğine göre zorunludur; arama ruhsatı olmadan delinecek kuyu, kaçak kuyu sayılır ve idari para cezası ile kapatma riski taşır.",
          "Ankara merkezli KD Sondaj olarak 45 yılı aşkın süredir yürüttüğümüz projelerde, müşterilerimizin yasal süreçlerini başvurudan tesise kadar yönetiyoruz. Tipik bir evsel/köy kuyusu için Arama Ruhsatı 6-12 ay sürerken, ticari amaçlı kuyular için bu süre 18 aya çıkabilir. Planlama aşamasında bütçeye en az 80.000-150.000 TL arası bir idari maliyet kalemi eklenmelidir."
        ]
      },
      {
        heading: "Adım adım başvuru süreci",
        paragraphs: [
          "İlk adım, kuyu açılacak parselin tapu ve kadastro bilgileriyle birlikte DSİ İl Müdürlüğü'ne dilekçe vermektir. DSİ talep edilen koordinatların yer altı suyu potansiyeli açısından uygunluğunu inceler. İkinci adım olarak, DSİ tarafından onaylanan noktalar için yetkili hidrojeolog tarafından Hidrojeolojik Etüt Raporu hazırlanır. Bu rapor; formasyon, yeraltı suyu tablası, komşu kuyular ve beklenen verim bilgilerini içerir.",
          "Üçüncü adımda kuyu için delinecek noktada sondaj makinemiz ile hareket edilir. KD Sondaj'ın 300-1500 m kapasiteli kamyon ve dorse makineleri Türkiye genelinde mobilize olur. Ankara Çankaya merkezli operasyonumuz sayesinde İç Anadolu, Ege ve Karadeniz illerine 48-72 saat içinde ulaşırız. Sondaj tamamlandıktan sonra DSİ'ye 'Kuyu Tescil Belgesi' için başvurulur ve son aşama olan 'Kullanma İzni' için su kalitesi analizleri ile verim testi sunulur."
        ]
      },
      {
        heading: "MTA hidrojeoloji raporu neden kritik?",
        paragraphs: [
          "MTA Genel Müdürlüğü'nün yayınladığı 1/100.000 ölçekli hidrojeoloji haritaları, arama ruhsatı başvurularında referans kabul edilir. Ankara havzası, Konya kapalı havzası, Ege graben sistemi gibi ana akiferler bu raporlarda ayrıntılı işlenir. Kuyu noktası seçimi sırasında MTA raporundaki 'kırık hatları', 'alüvyon kalınlığı' ve 'piezometrik seviye' verileri esas alınır.",
          "KD Sondaj olarak her proje başlangıcında MTA raporunu ücretsiz olarak müşterimizle paylaşıyor, ardından kendi saha etüdümüzü ekliyoruz. Bu sayede delinecek kuyunun kuru çıkma riski yüzde 5'in altına iniyor. Sektör ortalaması yüzde 25-30 civarındadır; doğru etüt ve ekipman seçimiyle bu oranı 5 kata kadar düşürebiliyoruz."
        ]
      },
      {
        heading: "Maliyet kalemleri ve 2026 tarifeler",
        paragraphs: [
          "Bir yeraltı suyu kuyusunun toplam yatırım maliyeti dört ana kalemden oluşur: idari harçlar, sondaj, kuyu ekranı/tescilli boru, pompa ve elektrik tesisat. 2026 yılı için DSİ harçları yıllık yeniden değerleme oranına göre güncellenmiş olup, kuyu metresi başına devlet payı metre başına 80-180 TL arasındadır. Ankara, Konya, Aksaray illerinde DSİ bölge müdürlükleri kendi tarifelerini uygular.",
          "Sondaj maliyeti 300 m'ye kadar bir kuyu için 250.000-400.000 TL arasında değişirken, 1000 m'nin üzerinde metre başına 1.500-2.500 TL'ye çıkar. Pompa ve elektrik tesisatı ise günlük 50-500 m³ verim hedefine göre 80.000-450.000 TL arasında bir kalem oluşturur. KD Sondaj olarak sabit fiyat teklifi yerine, saha etüdü sonrası kalem kalem teklif sunar; müşteri sürpriz maliyetle karşılaşmaz."
        ]
      },
      {
        heading: "Sık yapılan hatalar ve kaçak kuyu riski",
        paragraphs: [
          "Türkiye'de DSİ kayıtlarına göre her yıl yaklaşık 8.000 kaçak kuyu tespit edilmektedir. En sık yapılan hata 'komşu kuyu açmış, ben de açarım' düşüncesidir; her parselin hidrojeolojisi farklıdır ve ruhsat almadan delinecek kuyu 50.000 TL'nin üzerinde ceza ile kapatılabilir. İkinci sık hata, kuyu ekranı ve çakıl filtreleme (gravel pack) yapılmadan boruların doğrudan indirilmesidir; bu durumda kuyu verimi 3-5 yılda yarıya düşer.",
          "KD Sondaj olarak her kuyu tesliminde DSİ'ye ruhsat başvurusunu ve 1 yıllık izleme raporlamasını dahil ediyoruz. Müşteri isterse 2 yıl garanti ile pompa ve ekipman bakımını da üstleniyoruz. Ankara Çankaya merkezli operasyonumuzdan Türkiye'nin her yerine 7/24 hizmet veriyoruz; 0541 191 63 01 numaralı WhatsApp hattımızdan ücretsiz ön etüt talep edebilirsiniz."
        ]
      }
    ],
    faq: [
      {
        q: "Su kuyusu açma izni kaç günde çıkar?",
        a: "DSİ Arama Ruhsatı için ortalama 6 ay, Kullanma İzni ile birlikte toplam süre 12-18 aydır. Acele durumlarda 'ivedi' statüde 4 aya kadar inebilir ancak idari ücret artar."
      },
      {
        q: "Kaçak kuyu açarsam ne olur?",
        a: "DSİ'nin 2026 tarifesine göre idari para cezası kuyu metresi başına uygulanır ve kuyu mühürlenerek kapatılır. Cezayı ödeseniz bile kuyu yasal kullanıma açılamaz."
      },
      {
        q: "Komşumun kuyusu var, ben de açabilir miyim?",
        a: "Hayır. Her parsel için ayrı hidrojeolojik etüt ve ayrı DSİ başvurusu zorunludur. Komşu kuyunun verimi sizin kuyunuzun da aynı olacağını garanti etmez; formasyon 50 metrede değişebilir."
      }
    ]
  },
  {
    slug: "jeotermal-sondaj-maliyeti-2026-derinlik-bazli",
    category: "Jeotermal & Enerji",
    date: "2026-10-12",
    readTime: "10 dk",
    title: "Jeotermal Sondaj Maliyeti 2026: Derinlik Bazlı Fiyat Tablosu",
    description:
      "Jeotermal kuyu maliyeti 2026: 500m, 1000m, 1500m, 2000m, 2500m derinlik için güncel TRY ve USD bazlı fiyatlar. İç Anadolu ve Ege sahaları karşılaştırması, değişken maliyet kalemleri.",
    keywords: [
      "jeotermal sondaj maliyeti 2026",
      "derinlik bazlı sondaj fiyatı",
      "jeotermal kuyu maliyeti",
      "sondaj metre fiyatı"
    ],
    relatedServices: ["geothermal"],
    relatedProducts: ["productTrailer3000", "productSpecial2500", "productTruck1200"],
    sections: [
      {
        heading: "Derinlik neden tek başına belirleyici değil",
        paragraphs: [
          "Jeotermal sondajda metre başına maliyet artan derinlikle birlikte doğrusal değil, üstel olarak artar. 500 m bir kuyuda metre başına 1.200-1.800 TL arasında değişen maliyet, 1.500 m'de 2.500-3.200 TL'ye, 2.500 m'de 4.500-6.000 TL'ye çıkar. Bunun sebebi kule yükü, halat sarıcı kapasitesi, çamur pompası basıncı ve tij çapı gereksiniminin her 500 m'de bir kademeli olarak artmasıdır.",
          "İkinci değişken formasyondur. Yumuşak volkanik tüf, kil ve kumtaşı ağırlıklı sahalarda matkap ömrü uzar, kuyu stabil olur ve maliyet düşer. Buna karşılık sert bazalt, kuvarsit veya şeyl ağırlıklı formasyonlarda matkap değişimi sıklaşır, kuyu sapma riski artar ve süreç yüzde 30-50 uzar. İç Anadolu'nun Afyon-Özerler hattı yumuşak formasyon, Ege grabenleri (Kütahya-Simav, Manisa-Salihli) daha sert ve aşındırıcıdır."
        ]
      },
      {
        heading: "500 m ve 1000 m jeotermal kuyu maliyetleri",
        paragraphs: [
          "2026 yılı için 500 m derinliğe kadar bir jeotermal kuyunun anahtar teslim maliyeti, Ankara bazında 600.000-900.000 TL arasındadır. Bu maliyete deline kuyu, çelik casing, çimento tahkimat, kuyu başı ekipmanları ve pompa testi dahildir. Ege sahalarında lojistik mesafe ve sert formasyon nedeniyle bu rakam 1.000.000 TL'ye yaklaşır.",
          "1000 m kuyular için 2026 anahtar teslim fiyatı 2.200.000-3.200.000 TL aralığındadır. Bu segmentte KD Sondaj'ın 1000-1200 m kamyon ve dorse makineleri en uygun seçenektir. Kuyu çapı 12 1/4\" veya 17 1/2\" olarak projelendirilir; ekran bölgesi tasarımı formasyona göre değişir. Yıllık Y verimi hesabı için 72 saatlik pompa testi zorunludur ve bu test ayrıca 60.000-100.000 TL kalem oluşturur."
        ]
      },
      {
        heading: "1500 m, 2000 m ve 2500 m derin kuyu maliyetleri",
        paragraphs: [
          "1500-3000 m segmenti KD Sondaj'ın KD-3000 dorse makinesinin tasarlandığı tam aralıktır. 2026 fiyatları 4.500.000-8.500.000 TL arasındadır. 110 ton kule kanca yükü ve 90 ton halat sarıcı kapasitesi, 5-1/2\" API 5D tij ile 3000 m'ye kadar güvenli çalışmaya izin verir. Bu segmentte matkap, tij, çamur pompası ve operatör kalifikasyonu belirleyici maliyet kalemleridir.",
          "2000 m kuyular 6.500.000-10.000.000 TL, 2500 m özel konfigürasyonlu derin kuyular ise 11.000.000-16.000.000 TL aralığında projelendirilir. 2500 m+ projelerde kuyu sapması, yüksek sıcaklık (>150°C) ekipmanı ve özel çimento programları maliyeti yüzde 40'a kadar artırabilir. KD Sondaj olarak İç Anadolu'da 1200-2600 m aralığında 50'den fazla jeotermal kuyu sahasında kanıtlanmış tecrübemiz bulunmaktadır."
        ]
      },
      {
        heading: "Sabit ve değişken maliyet kalemleri",
        paragraphs: [
          "Sabit maliyetler: makine mobilizasyonu (150.000-450.000 TL), saha hazırlığı (250.000-800.000 TL), çamur havuzu (100.000-200.000 TL), kuyu başı ekipmanları (80.000-200.000 TL). Bu kalemler derinlikten bağımsız olup 500 m ve 2500 m kuyuda neredeyse aynıdır.",
          "Değişken maliyetler: matkap (derinlik başına 250.000-1.500.000 TL), tij yıpranması (her 1000 m'de 200.000 TL), çamur kimyasalları (her 1000 m'de 80.000-150.000 TL), pompa testi (60.000-150.000 TL), çimento (her casing halkası için 100.000-300.000 TL). Doğru teklif değerlendirmesi için tüm kalemlerin ayrı satır olarak görülmesi gerekir. KD Sondaj kalem-kalem teklif formatı kullanır; müşteri 'sabit+değişken' toplamını net görebilir."
        ]
      },
      {
        heading: "ROI hesabı ve saha seçimi",
        paragraphs: [
          "Jeotermal kuyu yatırımının geri dönüş süresi (payback) rezervuar sıcaklığına bağlıdır. 80-100°C rezervuarda ısıtma ve sera uygulamaları için 4-7 yıl, 150°C+ rezervuarda elektrik üretimi için 7-12 yıl arasında değişir. Türkiye'de jeotermal elektrik lisansı EPDK'dan, sera ve konut ısıtma lisansı ise il özel idaresinden alınır.",
          "Saha seçimi aşamasında MTA'nın sıcaklık gradyanı haritaları, gravite ve manyetik verileri ile sismik yansıma verileri birlikte değerlendirilir. KD Sondaj olarak ücretsiz ön etüt raporu sunuyor; potansiyel sahalarda gradyan 50°C/km'nin üzerindeyse ekonomik fizibilite yapıyoruz. Ankara Çankaya merkezli ekibimiz 7/24 WhatsApp hattından (0541 191 63 01) ön etüt talebinizi değerlendirir."
        ]
      }
    ],
    faq: [
      {
        q: "2026'da 1000 m jeotermal kuyu açmanın maliyeti ne kadar?",
        a: "Ankara bazında 1000 m kuyu için 2026 anahtar teslim maliyet 2.200.000-3.200.000 TL aralığındadır. Ege sahalarında lojistik ve formasyon farkıyla 3.500.000 TL'ye çıkabilir."
      },
      {
        q: "KD Sondaj hangi derinliklere kadar kuyu açabiliyor?",
        a: "KD-3000 dorse makinemiz 1500-3000 m, KD-2500 özel konfigürasyonumuz 2500 m'ye kadar kapasitelidir. Endüstriyel su kuyuları için 300-1200 m segmentinde kamyon ve dorse filomuz hizmet verir."
      },
      {
        q: "Matkap ve tij maliyeti toplam maliyetin yüzde kaçı?",
        a: "Derin kuyularda matkap, tij ve çamur kimyasalları toplam proje maliyetinin yüzde 18-25'ini oluşturur. Yanlış ekipman seçimi bu kalemi yüzde 50 artırabilir; doğru ekipman ve IADC kodlu matkapla bu oranı minimize ederiz."
      }
    ]
  },
  {
    slug: "iadc-kodlari-rehberi-matkap-secimi",
    category: "Teknik Bilgi Bankası",
    date: "2026-10-12",
    readTime: "9 dk",
    title: "IADC Kodları Rehberi: Tricone Matkap Seçimi ve Formasyon Eşleştirmesi",
    description:
      "IADC sınıflandırması, üç haneli kodun anlamı (sertlik-aşındırıcılık-yatak/soğutma), formasyona göre matkap seçimi, matkap ömrü hesabı ve yaygın hatalar.",
    keywords: [
      "IADC kodları rehberi",
      "tricone matkap seçimi",
      "IADC classification",
      "matkap formasyon eşleştirme"
    ],
    relatedServices: ["mineral"],
    relatedProducts: ["productBits"],
    sections: [
      {
        heading: "IADC üç haneli kod yapısı",
        paragraphs: [
          "IADC (International Association of Drilling Contractors) sınıflandırması, tricone ve PDC matkapları tek bir kod ile tanımlar. Üç hane soldan sağa: formasyon sertliği, matkap özelliği (aşındırıcılık/yapı), yatak/soğutma tipi. Örneğin 117 kodlu matkap 'yumuşak formasyon, standart aşındırıcılık, açık yataklı basınçlı soğutmalı' anlamına gelir.",
          "Birinci hane 1-8 arasıdır: 1-2 yumuşak, 3-4 yumuşak-orta, 5 orta, 6-7 sert, 8 çok sert. İkinci hane matkap aşındırıcılığını ve diş yapısını tanımlar: 1 kısa diş yumuşak için, 7 uzun diş aşındırıcı için. Üçüncü hane yatak ve soğutma konfigürasyonunu verir: 1 standart yatak rulmanlı, 7 basınçlı kompakt yatak. Bu üç hane tek başına hangi formasyonda hangi matkabı kullanacağınızı söyler."
        ]
      },
      {
        heading: "Formasyona göre matkap eşleştirme tablosu",
        paragraphs: [
          "Yumuşak killer, killi şeyl, kumtaşı, anhidrit: IADC 111-135. Konik diş yapısı, geniş diş aralığı, yüksek ilerleme hızı (ROP). Bu segmentte metre başına 60-120 m/gün ilerleme hedeflenir. Orta sertlik kireçtaşı, dolomit, kumlu şeyl: IADC 211-247. Daha kompakt diş yapısı ve daha dayanıklı yatak gerekir.",
          "Sert bazalt, granit, kuvarsit, sert kireçtaşı: IADC 617-637. Sıkak dövme tungsten karbür dişler, kapalı yatak konfigürasyonu, yağ soğutmalı sistem. ROP bu segmentte 5-15 m/gün'e düşer. Çok sert (kuvarsit, hematit): IADC 737-837. Elmas takviyeli veya PDC insert kullanımı gerekebilir. KD Sondaj olarak 8.5\"-26\" çap aralığında her IADC kodunda stoklu matkap bulunduruyoruz."
        ]
      },
      {
        heading: "Matkap ömrü hesabı ve TFA maliyeti",
        paragraphs: [
          "Toplam Footage Drilled (TFA) matkap ömrünün ana göstergesidir. Yumuşak formasyonda (111-145) ortalama TFA 800-2.000 m, orta segmentte (211-247) 400-900 m, sert segmentte (617-637) ise 80-300 m arasındadır. Bu değerler metre başına maliyetin ana belirleyicisidir; 100 m'de biten matkap ile 1500 m giden matkap arasında birim maliyet 5-10 kat fark yaratır.",
          "KD Sondaj olarak saha öncesinde formasyon bilgisini MTA raporu, müşteri tarafından sağlanan kuyu logu veya komşu kuyu verilerinden alıyoruz. Yanlış matkap seçimi projeyi yüzde 30-50 uzatır; doğru seçim zaman ve maliyet tasarrufu sağlar. Ankara Çankaya merkezli depomuzda tüm yaygın IADC kodlarında 8.5\"-12 1/4\" çapta stoklu matkap mevcuttur."
        ]
      },
      {
        heading: "Yatak ve soğutma sistemleri",
        paragraphs: [
          "Üçüncü hane 1 standart açık yataklı rulman, 7 sızdırmaz basınçlı yatak, 9 elastomer conta ile basınçlı yatak. Açık yatak (1-3) yumuşak formasyonlarda yeterli, düşük maliyetli. Sert formasyonlarda matkap yüksek devirde çalıştığından rulman ömrü düşer; basınçlı yatak (7-9) zorunludur. Elastomer contalı (9) versiyon yüksek sıcaklık sahaları (>180°C) için uygundur.",
          "Soğutma açısından matkap seçimi de formasyon ısı iletkenliğine göre değişir. Yüksek devirli sert formasyonlarda basınçlı yağ veya su soğutmalı nozul tasarımı tercih edilir. KD Sondaj olarak her matkap sevkiyatında taşıma sertifikalı, orijinal kutusunda ve son kullanma tarihi kontrol edilmiş ürün kullanır; sahada kullanılan her matkap için matkap kartı doldurulur."
        ]
      },
      {
        heading: "Yaygın seçim hataları",
        paragraphs: [
          "En sık yapılan hata yumuşak formasyonda sert matkap kullanmaktır. 117 kodlu matkap yerine 617 kullanıldığında ROP yarıya düşer ve matkap toplamı gereksiz yere erken eskir. İkinci hata sert formasyonda yumuşak matkap seçmektir; 135 ile 617 arası kireçtaşı delinecekken 5-10 m sonra düz dişler kırılır, kuyu durur.",
          "Üçüncü sık hata aşındırıcı formasyonda düşük aşındırıcılık kodu seçmektir. Örneğin sert, aşındırıcı granitte 617 yerine 637 seçilmelidir. KD Sondaj olarak saha öncesinde ücretsiz matkap seçimi danışmanlığı sunar; müşteri kendi IADC kodunu seçmek isterse formasyon logu ve komşu kuyu verilerini birlikte değerlendiririz."
        ]
      }
    ],
    faq: [
      {
        q: "IADC 117 ne anlama gelir?",
        a: "1 = yumuşak formasyon, 1 = standart kısa diş aşındırıcılık, 7 = sızdırmaz basınçlı yatak. Yumuşak killer, killi şeyl ve anhidrit için uygundur."
      },
      {
        q: "Hangi matkap hangi formasyon?",
        a: "Yumuşak: 111-135, orta: 211-247, sert: 617-637, çok sert: 737-837. PDC matkaplar ise yumuşak-orta segmentte IADC S-veya M-serisi olarak sınıflanır."
      },
      {
        q: "Bir matkap kaç metre gider?",
        a: "Formasyona göre değişir. Yumuşakta 800-2000 m, ortada 400-900 m, sert segmentte 80-300 m. Doğru matkap seçimi ve uygun WOB/RPM ile üst sınıra yaklaşılır."
      }
    ]
  },
  {
    slug: "sondaj-makinesi-secimi-7-kritik-parametre",
    category: "Makine Seçimi",
    date: "2026-10-12",
    readTime: "9 dk",
    title: "Sondaj Makinesi Seçimi: 7 Kritik Parametre Karar Rehberi",
    description:
      "Sondaj makinesi alırken veya kiralarken dikkate alınması gereken 7 temel parametre: derinlik, formasyon, mobilite, çamur pompası, kule yükü, motor gücü ve toplam sahip olma maliyeti. Ankara merkezli KD Sondaj karar matrisini paylaşıyor.",
    keywords: [
      "sondaj makinesi seçimi",
      "sondaj makinesi kiralama",
      "makine teknik karşılaştırma",
      "hangi sondaj makinesi"
    ],
    relatedServices: ["water", "geothermal"],
    relatedProducts: ["productTrailer3000", "productTruck800", "productTrailer600"],
    sections: [
      {
        heading: "Parametre 1: Hedef derinlik ve kapasite marjı",
        paragraphs: [
          "Sondaj makinesi seçiminde ilk ve en kritik parametre hedef derinliktir. Ancak yalnızca hedef metre değil, kapasite marjı belirleyicidir. 1500 m'lik bir kuyu için minimum 1800 m kapasiteli makine seçilir; bu marj beklenmeyen derinlik artışları, kuyu sapması ve tij kayıplarına karşı güvence sağlar. KD Sondaj olarak 1500-3000 m segmentinde KD-3000 dorse makinemizi öneriyoruz; 1000-1200 m için KD-1200 kamyon ve dorse, 800 m altı için KD-800 serisi yeterlidir.",
          "Türkiye sahasında yaygın formasyon değişkenliği nedeniyle kapasite marjı en az yüzde 20 olmalıdır. Örneğin hedef 2000 m ise makine 2400 m kapasiteli olmalı; 2500 m hedeflenen projede ise 3000 m'lik dorse zorunludur. Bu kural hem mobilizasyon hem de saha güvenliği açısından endüstri standardıdır."
        ]
      },
      {
        heading: "Parametre 2: Formasyon ve matkap/çelik gereksinimi",
        paragraphs: [
          "Formasyon sertliği ve aşındırıcılığı, makine seçiminde matkap ve çelik konfigürasyonunu belirler. Yumuşak-volkanik sahalarda (İç Anadolu, Ege tüf bölgeleri) düşük RPM yeterli, sert granit veya kuvarsit sahalarında yüksek tork ve yüksek RPM gerekir. Bu durum rotary tabla tahrikinin mekanik mi yoksa hidrolik mi olması gerektiğini belirler.",
          "Aşındırıcı formasyonlar matkap ömrünü kısaltır ve tij yıpranmasını artırır. Bu durumda makinede hızlı tij sökme takma sistemi ve ek matkap stoku zorunludur. KD Sondaj olarak 8.5\"-12 1/4\" çapta IADC 111-637 arası tüm matkapları stoklu bulunduruyoruz; müşteri projeye hangi formasyonla başlarsa başlasın 24 saat içinde matkap temin edebiliyoruz."
        ]
      },
      {
        heading: "Parametre 3: Mobilite ve saha ulaşımı",
        paragraphs: [
          "Kamyon üstü ve dorse (treyler) makineler mobilite açısından farklıdır. Kamyon makineleri kendi güçleriyle 60 km/sa hızla sahaya ulaşır, vinç ve montaj gerektirmez; dorse makineler ise çekici ile taşınır ve saha montajı 8-12 saat sürer. Acil durumlarda veya kötü yol koşullarında kamyon makineleri belirgin avantajlıdır.",
          "Saha ulaşımı zor ise (engebeli arazi, dar köy yolları, dağlık bölge) kompakt dorse tercih edilir. KD Sondaj olarak İç Anadolu köylerinde 800 m kamyon makineleri, Ege grabenlerinde 1500-3000 m dorse makineleri yaygın olarak kullanıyoruz. Mobilizasyon mesafesi 500 km'yi aşıyorsa navlun maliyeti teklif kalemine eklenir."
        ]
      },
      {
        heading: "Parametre 4: Çamur pompası kapasitesi ve basıncı",
        paragraphs: [
          "Çamur pompası, kuyudaki formasyonu soğutma ve kesme taşıma işlevi görür. Pompa kapasitesi (GPM) ve basıncı (PSI) kuyu çapı ve derinliğe göre projelendirilir. 500 m kuyuda 5x6 duplex pompa yeterli, 1500 m'de 6x8 duplex, 2500 m+ projede 7x8 veya triplex pompa zorunludur.",
          "KD Sondaj'ın KD-3000 makinesinde çift çamur sirkülasyon hattı ve 525 HP güverte motoru üzerinden tahrik edilen duplex pompa bulunur. Bu konfigürasyon 12 1/4\" çapta 1500-3000 m aralığında, 17 1/2\" çapta ise 1000-1500 m aralığında çalışmaya izin verir. Yetersiz pompa kapasitesi matkap ömrünü düşürür ve kuyu stabilitesini bozar."
        ]
      },
      {
        heading: "Parametre 5: Kule kanca yükü ve halat sarıcı kapasitesi",
        paragraphs: [
          "Kule kanca yükü (hook load), kuyuya indirilen tüm tij ve ekipmanın toplam ağırlığıdır. 1000 m derinlikte 4 1/2\" tij ile toplam tij ağırlığı yaklaşık 65 ton; KD-1200 kamyon 90 ton kule kapasitesine sahiptir. Emniyet faktörü için kule kapasitesinin tij ağırlığının en az 1.5 katı olması önerilir.",
          "Halat sarıcı (drawworks) tek seferde tijin tamamını çekebilecek kapasitede olmalıdır. 2500 m derinlikte ana halat sarıcı 90 ton çekiş gücü gerektirir; KD-3000 dorse makinemiz 90 ton kapasitesiyle bu segmenti güvenli şekilde karşılar. Yetersiz halat sarıcı gücü tij düşürme riski yaratır ve projeyi durdurabilir."
        ]
      },
      {
        heading: "Parametre 6: Motor gücü ve yakıt tüketimi",
        paragraphs: [
          "Güverte motoru hem rotary tahrik hem çamur pompası hem de yardımcı sistemleri besler. 300-500 m segmentinde 250-350 HP yeterli, 1000-1200 m'de 400-500 HP, 2500 m+ projelerde 525 HP ve üzeri gerekir. Yakıt tüketimi proje maliyetinin yüzde 8-15'ini oluşturur; düşük yakıt tüketimli motor seçimi toplam sahip olma maliyetini düşürür.",
          "KD Sondaj'ın KD-3000 makinesi 525 HP heavy industrial dizel motor kullanır; Tier 4 emisyon uyumlu, saatte 35-45 lt yakıt tüketimi. Uzun süreli projelerde jeneratör opsiyonu da değerlendirilebilir. 2500 m+ derin kuyularda kesintisiz güç kaynağı projenin zamanında tamamlanması için kritiktir."
        ]
      },
      {
        heading: "Parametre 7: Toplam sahip olma maliyeti (TCO)",
        paragraphs: [
          "Sondaj makinesi yatırımında görünür fiyat dışında gizli maliyet kalemleri vardır: mobilizasyon, sigorta, operatör maaşı, bakım, matkap, tij yıpranması, yedek parça. 1000 m kuyu için makinenin saat ücreti 80-150 $, toplam proje maliyeti ise 2.500.000-3.500.000 TL bandındadır. Beş yıllık projeksiyonda TCO, makine satın alma fiyatının 2-4 katına çıkabilir.",
          "Kiralama modeli yeni başlayan operatörler için düşük başlangıç yatırımı sağlar ancak uzun vadede satın almadan pahalıya gelir. KD Sondaj olarak yeni müşterilere ilk 1-2 projede kiralama, ardından satın alma öneriyoruz. Ankara Çankaya merkezli ekibimiz 7/24 WhatsApp hattından (0541 191 63 01) ücretsiz makine seçimi danışmanlığı sağlar."
        ]
      }
    ],
    faq: [
      {
        q: "Hangi derinlik için hangi makine?",
        a: "0-500 m kamyon, 500-1000 m kamyon veya dorse, 1000-1500 m kamyon+dorse, 1500-3000 m dorse. KD Sondaj'ın 8 makinesi bu segmentlerin hepsini kapsar."
      },
      {
        q: "Kamyon mu dorse mi almalıyım?",
        a: "Sık saha değişimi ve hızlı mobilizasyon için kamyon; ağır yük ve uzun süreli sabit sahalar için dorse tercih edilir. Hibrit filo ile tüm senaryoları karşılamak mümkündür."
      },
      {
        q: "Sahip olma mı, kiralama mı?",
        a: "Yıllık 2-3 proje üzeri çalışılıyorsa satın alma TCO açısından avantajlıdır. Düşük hacimli operasyonlar için kiralama esnekliği tercih sebebidir."
      }
    ]
  },
  {
    slug: "api-spec-5d-drill-pipe-teknik-ozellikler",
    category: "Ekipman Teknik",
    date: "2026-10-12",
    readTime: "7 dk",
    title: "API Spec 5D Drill Pipe: Teknik Özellikler ve Çap Seçimi",
    description:
      "API 5D drill pipe standardı, çap aralıkları (2 3/8\"-6 5/8\"), malzeme sınıfları (E-75, X-95, G-105, S-135), uzunluk seçenekleri ve drill collar ilişkisi. Sahada uzun ömür için bakım önerileri.",
    keywords: [
      "API Spec 5D drill pipe",
      "API 5D tij",
      "drill pipe çapları",
      "sondaj tij standardı"
    ],
    relatedServices: ["water", "geothermal"],
    relatedProducts: ["productPipes"],
    sections: [
      {
        heading: "API 5D standardı ve kapsamı",
        paragraphs: [
          "API Spec 5D (American Petroleum Institute Specification 5D), sondaj tijlerinin (drill pipe) üretim standardıdır. Standard, çelik kalitesi, mekanik özellikler, diş bağlantıları, test prosedürleri ve boyutsal toleransları tanımlar. Tüm dünyada yaygın kabul gören API 5D, Türkiye dahil uluslararası projelerde zorunlu referanstır.",
          "API 5D, çap aralığını 2 3/8\" (60.3 mm) ile 6 5/8\" (168.3 mm) arasında tanımlar. En yaygın kullanılan çaplar 3 1/2\" (88.9 mm), 4\" (101.6 mm), 4 1/2\" (114.3 mm) ve 5\" (127 mm) ile 5 1/2\" (139.7 mm) tijlerdir. Her çap için farklı iç çap (ID) varyasyonları mevcuttur; standart ID'ler çamur akışı hidroliği için kritiktir."
        ]
      },
      {
        heading: "Malzeme sınıfları: E-75, X-95, G-105, S-135",
        paragraphs: [
          "API 5D dört ana malzeme sınıfı tanımlar; her biri minimum akma dayanımına göre sınıflanır. E-75 (75.000 psi minimum akma) yumuşak formasyon ve sığ kuyular için ekonomik çözümdür. X-95 (95.000 psi) orta derinlik ve orta formasyon. G-105 (105.000 psi) derin kuyu ve aşındırıcı formasyon. S-135 (135.000 psi) en yüksek dayanım; derin kuyu ve yüksek eğim (deviation) projelerinde zorunludur.",
          "KD Sondaj olarak filomuzda ağırlıklı olarak G-105 ve S-135 sınıfı tijler kullanıyoruz. 1500 m üzeri kuyularda S-135 tercih ediyoruz; 3000 m dorse projesinde tüm tij setinin S-135 olması emniyet için zorunludur. Tij satın alırken API monogram damgası ve sertifika (mill test certificate) kontrolü mutlaka yapılmalıdır."
        ]
      },
      {
        heading: "Çap seçimi ve formasyon ilişkisi",
        paragraphs: [
          "Tij çapı seçimi kuyu çapı, derinlik ve formasyon basıncına göre yapılır. 12 1/4\" kuyu çapında 4 1/2\" veya 5\" tij kullanılır; 8 1/2\" kuyu çapında 3 1/2\" tij yaygındır. 17 1/2\" kuyu çapında 5 1/2\" tij zorunlu olabilir. Yanlış çap seçimi annular flow'u bozar ve matkap soğutmasını yetersiz kılar.",
          "Tij ID (iç çap) seçimi çamur akışı hızı için belirleyicidir. Tipik formül: çamur hızı 1.5-3 m/sn arasında tutulmalıdır. 4 1/2\" tij, 16.6 lb/ft ağırlık ve 3.826\" ID ile 500 GPM çamur pompasında 2.4 m/sn hız sağlar. Bu hız kesme taşıma ve matkap soğutma için optimal aralıktadır. KD Sondaj olarak saha öncesinde çamur hidroliği hesabını ücretsiz sunar."
        ]
      },
      {
        heading: "Diş bağlantıları ve ek yeri seçimi",
        paragraphs: [
          "API 5D, NC (numerical connection), IF (internal flush), FH (full hole), XH (extra hole) ve özel premium bağlantıları tanımlar. NC26, NC31, NC38, NC40, NC46, NC50 en yaygın olanlarıdır. Premium bağlantılar (e.g., Grant Prideco XT, Hydril 521) yüksek eğimli ve ultra derin kuyularda sızıntı riskini minimize eder.",
          "Ek yeri bakımı (tool joint) ve diş yağlama düzenli yapılmalıdır. KD Sondaj olarak her sahada compound uygulaması (Bestolife 2000 veya equivalent) zorunludur. Tij ek yerlerinin her 500 saatte bir NDT (ultrasonik veya manyetik parçacık) testi yapılması, yorulma kırığı riskini minimize eder. 1500 m+ projelerde bu test kritik, sigorta şirketleri de zorunlu tutar."
        ]
      },
      {
        heading: "Drill collar ve ağırlık dizilimi",
        paragraphs: [
          "Drill collar, matkabin üzerinde yer alan ağır çelik boru olup Weight on Bit (WOB) uygular. Tipik drill collar uzunluğu kuyunun üst 1/3'ü kadardır; 1000 m kuyuda yaklaşık 30 m drill collar. Ağırlığı matkap çapına ve formasyona göre seçilir. Spiral collar yumuşak formasyonda, slick collar sert formasyonda kullanılır.",
          "KD Sondaj'ın standart tij seti: 5\" S-135 drill pipe + 6 1/2\" S-135 drill collar + 8 1/2\" veya 12 1/4\" matkap. Bu konfigürasyon 1500-2500 m kuyularda kanıtlanmış performans sunar. Tij setinin periyodik rotasyonu (her 1000-1500 m'de alt-üst değişimi) eşit yıpranma sağlar ve ömrü yüzde 20-30 artırır."
        ]
      },
      {
        heading: "Sahada uzun ömür için bakım",
        paragraphs: [
          "API 5D tij ömrü doğru kullanım ve bakımla 10-15 yılı bulabilir. Yanlış kullanımda ise birkaç yıl içinde değişim zorunlu olur. En kritik bakım kalemleri: her kullanım öncesi diş temizliği, compound uygulaması, ek yeri tork kontrolü, saha içi transport sırasında çelik halat veya plastik sleeve koruma. Yere düşürülen tij hemen NDT testine girmelidir.",
          "KD Sondaj olarak saha filomuzda her tij için kullanım saati, delinen metre, kuyu listesi ve son NDT tarihi kayıt altındadır. Müşteri, kiraladığı tijin geçmiş performansını talep edebilir. Yılda bir kez tüm filoya kapsamlı NDT ve hidrostatik test uyguluyor; sertifikalı tijler operasyona alınıyor. Bu disiplin ISO 9001:2015 kalite sistemimizin gereğidir."
        ]
      }
    ],
    faq: [
      {
        q: "API 5D ile API 5CT arasındaki fark nedir?",
        a: "API 5D drill pipe (sondaj tij), API 5CT ise casing ve tubing (kuyu muhafaza boruları) standardıdır. Tij dönerek çalışır, casing statik kalır. Farklı mekanik özellikler ve diş tipleri."
      },
      {
        q: "Hangi malzeme sınıfını seçmeliyim?",
        a: "Yumuşak formasyon ve sığ kuyu için E-75 ekonomik; orta segmentte G-105 yaygın; derin ve aşındırıcı kuyularda S-135 zorunlu. KD Sondaj olarak derin kuyularda S-135 öneriyoruz."
      },
      {
        q: "Tij ömrü ne kadardır?",
        a: "Doğru kullanım ve bakımla 10-15 yıl. Kötü kullanımda 3-5 yıl. Periyodik NDT testi ve ek yeri bakımı ömrü belirgin şekilde uzatır."
      }
    ]
  },
  {
    slug: "jeoteknik-etud-vs-zemin-etudu-farklar",
    category: "Mühendislik Hizmetleri",
    date: "2026-10-12",
    readTime: "6 dk",
    title: "Jeoteknik Etüd vs Zemin Etüdü: Farklar, Yöntemler ve Rapor Çıktıları",
    description:
      "Mühendislik jeolojisi etüdü ile zemin etüdünün farkları, hangi projede hangisinin zorunlu olduğu, yöntem karşılaştırması (SPT, CPT, presiyometre) ve rapor çıktıları. İnşaat mühendisleri ve yerel yönetimler için rehber.",
    keywords: [
      "jeoteknik etüd",
      "zemin etüdü farkı",
      "mühendislik jeolojisi",
      "zemin araştırması"
    ],
    relatedServices: ["geotechnical"],
    relatedProducts: ["productTrailer600"],
    sections: [
      {
        heading: "Tanımlar: Mühendislik jeolojisi ve zemin mekaniği",
        paragraphs: [
          "Jeoteknik etüd, zemin ve kaya ortamının mühendislik özelliklerini belirlemek için yapılan jeolojik ve jeofizik araştırmalar bütünüdür. Mühendislik jeolojisi (engineering geology) disiplini altında yer alır. Zemin etüdü ise daha dar kapsamlı olup, doğrudan zemin numunelerinin alınması ve laboratuvar deneyleri ile taşıma gücü, oturma, kayma dayanımı gibi parametrelerin belirlenmesidir.",
          "Türkiye uygulamasında iki terim sıklıkla karıştırılır. İnşaat Mühendisleri Odası (İMO) ve Bayındırlık Bakanlığı'nın düzenlemelerinde jeoteknik etüd daha geniş kapsamlı; yerel yönetimlerin istediği zemin etüd raporu ise zemin mekaniği odaklıdır. Hangisinin zorunlu olduğu proje tipine göre değişir."
        ]
      },
      {
        heading: "Yöntem karşılaştırması: SPT, CPT ve presiyometre",
        paragraphs: [
          "Standart Penetrasyon Testi (SPT), 30-45 cm'lik bir örnekleyici ile zeminin direncini ölçer. Sonuç N-değeri olarak raporlanır ve taşıma gücü ile korelasyonu vardır. Türkiye'de en yaygın kullanılan yöntemdir; ucuz, hızlı ve güvenilirdir. Dezavantajı: insan faktörüne bağlı, sonuçlar operatörden etkilenir.",
          "Koni Penetrasyon Testi (CPT), ucunda elektronik koni bulunan bir probun zemine itilmesiyle yapılır. Sürekli veri sağlar ve operatör bağımsızdır. Dezavantajı: pahalı ekipman, kayalık zeminde uygulanamaz. Presiyometre ise kuyu içinde şişirilen bir prob ile zeminin gerilme-deformasyon davranışını ölçer; yumuşak kil ve sert kaya arasındaki geçiş formasyonlarda idealdir. KD Sondaj olarak zemin etüd projelerinde SPT ve CPT kombinasyonu öneriyoruz."
        ]
      },
      {
        heading: "Rapor çıktıları ve içerik farkları",
        paragraphs: [
          "Zemin etüd raporu genellikle 20-50 sayfa arasında olup aşağıdaki bilgileri içerir: sondaj logları, SPT N-değerleri, laboratuvar deney sonuçları (su içeriği, kıvam limitleri, dane boyutu dağılımı), taşıma gücü hesapları, oturma tahmini. Mühendislik raporu statik hesapları içermez; sadece girdi parametreleri verir.",
          "Jeoteknik etüd raporu ise 80-200 sayfa arasında olup mühendislik jeolojisi haritası, stratigrafik kesitler, yeraltı suyu durumu, şev stabilitesi analizi, deprem parametreleri, temel önerileri ve uygulama projesine girdi oluşturacak tüm verileri içerir. Belediyeler ve üniversiteler genellikle jeoteknik etüd raporu ister; müteahhitlik projelerinde zemin etüd raporu yeterli olabilir."
        ]
      },
      {
        heading: "Hangi projede hangisi zorunlu?",
        paragraphs: [
          "Konut ve küçük ticari yapılarda zemin etüd raporu yeterlidir. Ancak yapı yüksekliği 4 kat üzerinde veya toplam alan 1500 m² üzerinde ise belediye yönetmelikleri uyarınca jeoteknik etüd zorunludur. Sanayi yapıları, hastaneler, okullar, köprüler ve barajlarda her durumda jeoteknik etüd istenir. Türkiye'de belediyeler arası uygulama farklılıkları olabilir; proje öncesi ilgili belediyenin imar yönetmeliği kontrol edilmelidir.",
          "Karayolları Genel Müdürlüğü projeleri, demiryolu projeleri, havalimanı pistleri ve büyük altyapı projelerinde jeoteknik etüd raporu zorunlu olup ihale dosyasının parçasıdır. Bu projelerde rapor, Çevre ve Şehircilik Bakanlığı'nın Yapı Denetimi Yönetmeliği'ne uygun olarak hazırlanmalıdır. KD Sondaj olarak tüm bu proje tiplerinde saha ekibimiz ve laboratuvar partnerlerimiz ile hizmet veriyoruz."
        ]
      },
      {
        heading: "Maliyet karşılaştırması ve zamanlama",
        paragraphs: [
          "Zemin etüd maliyeti 2026 fiyatlarıyla kuyu başına 35.000-80.000 TL arasındadır. 50 m derinlikte 3 kuyu standart pakettir. Jeoteknik etüd maliyeti ise 250.000-1.500.000 TL arasında olup proje kapsamına göre değişir. Detaylı rapor, harita üretimi ve stabilite analizi dahil olduğunda fiyat yükselir.",
          "Zamanlama açısından zemin etüd 3-7 günde tamamlanırken, jeoteknik etüd 3-8 hafta sürebilir. Laboratuvar deneyleri ve raporlama süresi uzun olduğundan proje planlamada bu süre göz önüne alınmalıdır. KD Sondaj olarak acil projelerde hızlı zemin etüd (express service) sunuyor; 72 saat içinde ön rapor teslim edilebilir."
        ]
      },
      {
        heading: "Sık yapılan hatalar",
        paragraphs: [
          "En sık yapılan hata yalnızca zemin etüd raporu alıp proje geliştirmektir. Komşu parseldeki kuyu verilerine güvenerek kendi parselinde etüd yapmamak, deprem bölgesi analizini atlamak, laboratuvar deneylerini eksik bırakmak ve raporu onaylamadan inşaata başlamak başlıca risklerdir. Mühendislik hatası nedeniyle yapı hasar görebilir, sigorta teminatı düşebilir.",
          "KD Sondaj olarak her projede mühendislik jeoloğu ve inşaat mühendisi ortak denetim altında çalışır. Rapor, jeoloji mühendisi tarafından onaylı olmalı ve tüm laboratuvar deneyleri akredite laboratuvarda yapılmış olmalıdır. Sahada karot sandığı (core box) ve fotoğraflar rapor ekinde sunulur; bu kayıtlar gelecekteki projelerde de referans olarak kullanılabilir."
        ]
      }
    ],
    faq: [
      {
        q: "Zemin etüdü kaç günde çıkar?",
        a: "Standart zemin etüd 3-7 günde tamamlanır. Acil durumlarda express service ile 72 saatte ön rapor verilebilir; laboratuvar sonuçları için ek 1-2 hafta gerekir."
      },
      {
        q: "Her bina için jeoteknik etüd zorunlu mu?",
        a: "Yapı yüksekliği 4 kat üzeri veya alan 1500 m² üzeri ise belediyelerin çoğu jeoteknik etüd ister. Sanayi, sağlık ve eğitim yapılarında her durumda zorunludur."
      },
      {
        q: "SPT mi CPT mi daha iyi?",
        a: "İkisi farklı bilgi verir. SPT ucuz ve yaygın; CPT sürekli veri ve operatör bağımsız. Karmaşık zeminlerde her ikisi birlikte en doğru sonucu verir."
      }
    ]
  },
  {
    slug: "karotlu-maden-arama-yontem-ve-maliyet",
    category: "Maden Arama",
    date: "2026-10-12",
    readTime: "8 dk",
    title: "Karotlu Maden Arama: Yöntemler, Ekipman ve 2026 Maliyetleri",
    description:
      "Karotlu sondaj yöntemleri (wireline, conventional), ekipman (core barrel, drill core), karot verimi ve kalitesi, maden arama maliyetleri. Jeolojik araştırma, mineral exploration ve kaynak kestirimi için kılavuz.",
    keywords: [
      "karotlu maden arama",
      "mineral exploration drilling",
      "wireline core drilling",
      "karotlu sondaj maliyeti"
    ],
    relatedServices: ["mineral"],
    relatedProducts: ["productTrailer600"],
    sections: [
      {
        heading: "Karotlu sondaj yöntemleri",
        paragraphs: [
          "Karotlu sondaj, formasyondan silindirik numune (karot) çıkarmak için yapılan dönel sondaj yöntemidir. İki ana tip vardır: conventional (geleneksel) ve wireline (telsiz). Conventional yöntemde her 1.5-3 m'de tij sökülür ve karot tüpü yüzeye çıkarılır; bu yöntem derin kuyularda verimlidir ancak sökme takma süresi uzundur. Wireline yöntemde ise iç tüp (inner tube) tij sökülmeden halat ile yüzeye çekilir; 6-9 m'lik karotlar hızlı alınır.",
          "Wireline yöntem, 1960'lardan bu yana endüstri standardıdır ve günümüzde maden arama projelerinin yüzde 90'ında kullanılır. KD Sondaj olarak HQ (63.5 mm), NQ (47.75 mm) ve BQ (36.4 mm) karot çaplarında wireline ekipmanla çalışıyoruz. Karot çapı seçimi mineralojik analiz amacına göre yapılır; detaylı mineraloji için HQ, keşif amaçlı NQ veya BQ tercih edilir."
        ]
      },
      {
        heading: "Core barrel, bit ve ekipman seçimi",
        paragraphs: [
          "Core barrel üç bileşenden oluşur: dış tüp (outer barrel), iç tüp (inner tube) ve karot yakalayıcı (core catcher). Dış tüp döner, iç tüp sabit kalır ve karot içine dolar. Karot yakalayıcı, tüpü çıkarırken karotun düşmesini engeller. Impregnated diamond bit sert formasyonlarda, surface set bit yumuşak formasyonlarda kullanılır.",
          "KD Sondaj olarak sahada kullanılan her ekipman API ve DCDMA (Diamond Core Drill Manufacturers Association) standartlarına uygun sertifikalıdır. Bit seçimi formasyona göre yapılır: yumuşak tüf ve killerde surface set tungsten bit, orta sertlikteki kireçtaşı ve şeylde impregnated diamond bit, sert granitte polycrystalline diamond (PCD) bit. Her bit için 'karot verimi' (core recovery) takibi yapılır; yüzde 95 üzeri verim hedeflenir."
        ]
      },
      {
        heading: "Karot kalitesi ve RQD değerlendirmesi",
        paragraphs: [
          "Karot kalitesi iki parametre ile ölçülür: Total Core Recovery (TCR) yüzdesi ve Rock Quality Designation (RQD) yüzdesi. TCR, çıkarılan karot uzunluğunun teorik uzunluğa oranıdır; yüzde 100 TCR her zaman mümkün olmaz, yüzde 85 üzeri iyi kabul edilir. RQD ise 10 cm'den uzun sağlam karot parçalarının toplam karot uzunluğuna oranıdır; yüzde 75 üzeri iyi kaya kalitesi, yüzde 50 altı zayıf kaya.",
          "Karot kalitesi sondaj hızı (ROP) ve bit seçimine bağlıdır. Çok hızlı ROP karotu parçalar; çok yavaş ROP ise sürtünmeden dolayı karotu öğütür. KD Sondaj olarak optimal ROP 5-15 m/saat arasında tutulur. Karot sandıkları her 1 m'de fotoğraflanır ve müşteriye dijital ortamda sunulur; bu kayıt jeolojik log ile birlikte kaynak kestirimi çalışmalarına girdi sağlar."
        ]
      },
      {
        heading: "Maden arama maliyetleri 2026",
        paragraphs: [
          "Karotlu sondajın metre maliyeti 2026 yılı için Türkiye sahasında 1.500-4.500 TL/m arasında değişir. Maliyet belirleyici faktörler: kuyu derinliği, karot çapı, formasyon sertliği, lokasyon erişimi, mobilizasyon mesafesi. Sığ kuyular (0-200 m) düşük maliyetli, 500 m üzeri kuyularda metre başı 4.000-4.500 TL'ye çıkar. Sert granit sahalarında yumuşak tüfe göre yüzde 50 maliyet artışı olabilir.",
          "Tipik bir maden arama programı bütçesi 2.000.000-8.000.000 TL arasındadır. 5.000 m toplam karotlu sondaj, 30 kuyu, jeofizik (IP, manyetik, gravite) ve laboratuvar analizleri dahil. KD Sondaj olarak anahtar teslim maden arama programı yönetimi sunuyoruz; saha etüdünden jeolojik raporlamaya kadar tüm aşamaları koordine ediyoruz. Ankara Çankaya merkezimizden Ege, İç Anadolu ve Doğu Anadolu sahalarına 7/24 hizmet veriyoruz."
        ]
      },
      {
        heading: "Jeolojik raporlama ve kaynak kestirimi",
        paragraphs: [
          "Karotlu sondaj tamamlandıktan sonra jeolojik loglama yapılır: her metre için litoloji, alterasyon, mineralizasyon, yapısal özellikler kayıt altına alınır. Loglama jeoloji mühendisi tarafından sahada veya karot sandığı üzerinden yapılır. Numuneler akredite laboratuvarda analiz edilir (XRF, ICP-MS, fire assay altın için). Sonuçlar veri tabanına girilir ve 3B model oluşturulur.",
          "Kaynak kestirimi (resource estimation) jeolojik model üzerinde blok model yaklaşımıyla yapılır. JORC, PERC veya CIM standartlarına göre sınıflanır: ölçülmüş (measured), gösterilmiş (indicated), çıkarsanmış (inferred). Yatırım kararı için en az gösterilmiş kaynak gerekir. KD Sondaj olarak maden arama projelerinde bağımsız danışman jeolog ile çalışıyor; CPA (Competent Person) raporu sunuyoruz."
        ]
      },
      {
        heading: "Çevresel izinler ve yasal süreçler",
        paragraphs: [
          "Maden arama sondajı için Maden ve Petrol İşleri Genel Müdürlüğü'nden (MAPEG) arama ruhsatı gerekir. Arama ruhsatı sahibinin Çevresel Etki Değerlendirmesi (ÇED) kapsamında saha için ön izin alması zorunludur. Bazı hassas ekosistemlerde (milli park, sulak alan) sondaj yasaklanmıştır. Orman alanlarında Orman Bölge Müdürlüğü'nden izin gerekir.",
          "KD Sondaj olarak tüm izin süreçlerinde müşteriye danışmanlık veriyoruz. İlk aşamada ruhsat ve izin kontrolü yapılır; uygun olmayan sahalarda proje iptal edilir veya alternatif lokasyon önerilir. Yasal süreçlerin tamamlanması 6-18 ay sürebilir; bu süre göz önüne alınarak proje planlaması yapılmalıdır. Ankara merkezli ekibimiz 0541 191 63 01 WhatsApp hattından ön değerlendirme için hizmetinizdedir."
        ]
      }
    ],
    faq: [
      {
        q: "Wireline ile conventional arasındaki fark nedir?",
        a: "Wireline yöntemde iç tüp tij sökülmeden halatla çıkarılır, hızlıdır. Conventional yöntemde tüm tij sökülür, yavaştır ama derin kuyularda güvenilir."
      },
      {
        q: "Karotlu sondajın metre maliyeti nedir?",
        a: "2026 fiyatlarıyla 1.500-4.500 TL/m. Derinlik, çap, formasyon ve lokasyona göre değişir. Sert granit sahalarında yüzde 50 artış olabilir."
      },
      {
        q: "Karot verimi neden önemli?",
        a: "Karot verimi jeolojik yorumun güvenilirliğini doğrudan etkiler. Yüzde 95 üzeri TCR ve yüzde 75 üzeri RQD hedeflenir; altı kuyu tekrarı veya yeniden örneklemeyi gerektirir."
      }
    ]
  },
  {
    slug: "camur-pompasi-bakim-rehberi",
    category: "Operasyonel Bakım",
    date: "2026-10-12",
    readTime: "6 dk",
    title: "Çamur Pompası Bakım Rehberi: Duplex Pompa Liner, Piston ve Valf Servisi",
    description:
      "Duplex ve triplex çamur pompalarında periyodik bakım: liner, piston, valf (seat & insert), packing, crosshead, crankshaft. Sorun giderme, aşınma göstergeleri ve yedek parça yönetimi.",
    keywords: [
      "çamur pompası bakım",
      "duplex pompa",
      "pompa liner değişimi",
      "triplex pompa servisi"
    ],
    relatedServices: ["water", "geothermal"],
    relatedProducts: ["productPumps"],
    sections: [
      {
        heading: "Duplex vs triplex pompa: hangisi sahada?",
        paragraphs: [
          "Çamur pompaları iki ana tipte olur: duplex (çift etkili) ve triplex (üç etkili). Duplex pompalar yüksek basınç, düşük debi gerektiren derin kuyularda tercih edilir; triplex ise yüksek debi, orta basınçta kullanılır. Türkiye sondaj sahasında duplex pompalar daha yaygındır çünkü 2500 m+ derin kuyularda basınç ihtiyacı yüksektir.",
          "KD Sondaj'ın makine filosunda 5x6, 6x8 ve 7x8 duplex pompalar yer alır. Her pompanın bakım periyodu, kullanım yoğunluğuna ve çamur aşındırıcılığına göre ayarlanır. Aşındırıcı formasyon sahalarında bakım aralığı yarıya iner. Düzenli bakım yapılmaması durumunda liner aşınması hızlanır ve debi kaybı yaşanır."
        ]
      },
      {
        heading: "Liner ömrü ve değişim zamanı",
        paragraphs: [
          "Pompa liner, içinde pistonun çalıştığı seramik veya çelik borudur. Yüksek kaliteli alüminyum oksit veya karbür seramik liner 600-1000 saat arasında ömür sunar; aşındırıcı çamur kullanımında bu süre 300-500 saate düşer. Aşınma göstergesi: çamur debisinde belirgin düşüş, basınç düşüşü, liner iç yüzeyinde çizikler veya çatlaklar.",
          "KD Sondaj olarak her saha öncesinde liner ömrü ölçülür ve gerekirse değişim yapılır. Liner değişimi sırasında gland packing (salma flança keçesi) ve rod da kontrol edilir; bu parçalar genellikle liner ile birlikte değişir. Yedek liner stoğu her zaman sahada hazır bulundurulur; liner değişimi 30-45 dakika içinde tamamlanır."
        ]
      },
      {
        heading: "Piston ve rod bakımı",
        paragraphs: [
          "Piston, liner içinde ileri-geri hareket ederek çamuru iter. Kauçuk veya poliüretan pistonlar 150-400 saat ömürlüdür; aşındırıcı çamurda daha kısa. Piston aşınması debi kaybına neden olur ve liner ömrünü de kısaltır. Düzenli piston değişimi liner ömrünü yüzde 30 uzatır.",
          "Piston rod (piston çubuğu) çelik veya paslanmaz çelikten yapılır; rod üzerindeki aşınma piston contasından kaçak olup olmadığını gösterir. Rod düz çizgiler halinde çalışmalı; eğilme veya çizik rod değişimi gerektirir. KD Sonduz olarak her 1000 saatte rod kalibrasyonu ve aşınma ölçümü yapılır; 5000 saat sonra rod komple değişimi zorunludur."
        ]
      },
      {
        heading: "Valf (seat & insert) bakımı",
        paragraphs: [
          "Çamur pompasında üç ana valf seti bulunur: suction (emme) valfi, discharge (boşaltma) valfi ve hava odası (air dome) valfi. Her valf seat (oturma yüzeyi) ve insert (conta) olmak üzere iki parçadan oluşur. Seat ve insert, çamur geçişini kontrol eder ve yıpranmaya en açık parçalardır. Tipik ömür 300-600 saat; ağır hizmette 150-300 saat.",
          "Valf arızasının en yaygın belirtisi 'vuruntu' (knocking) sesidir; pompa her strokta metalik ses çıkarır. Bu durum seat veya insert aşınması veya kırılması anlamına gelir. Sahada derhal pompa durdurulur ve valf kontrol edilir. KD Sondaj olarak valf seti değişimi 45-60 dakika sürer; yedek parça stokta hazır tutulur. Periyodik valf değişimi (öngörülen saatlerde) plansız duruşu yüzde 80 azaltır."
        ]
      },
      {
        heading: "Hava odası (air dome) ve pulse dampener",
        paragraphs: [
          "Air dome, çamur akışındaki basınç dalgalanmalarını (pulse) yumuşatan basınçlı hava odasıdır. Doğru basınçta olmaması durumunda debi düşer, matkap soğutması yetersiz kalır ve tij yorulması artar. Hava odası basıncı, pompa deşarj basıncının yüzde 30-50'si kadar olmalıdır. Günde bir kez kontrolü önerilir.",
          "KD Sondaj olarak her vardiya başlangıcında hava odası basıncı ölçülür. Azaldığında azot veya kompresör ile tamamlanır. Hava odası membranı her 6 ayda bir kontrol edilir; yırtık membran tam basınç tutmaz ve düzenli dolum gerektirir. Yılda bir kez membran değişimi öneriyoruz. Triplex pompalarda pulsation dampener (basınç sönümleyici) ek olarak bulunur ve ayrıca kontrol edilir."
        ]
      },
      {
        heading: "Yedek parça yönetimi ve saha hazırlığı",
        paragraphs: [
          "Çamur pompası yedek parça stoğu plansız duruşu minimize eder. KD Sondaj olarak her sahada standart yedek paketi bulunur: 4 adet liner, 6 adet piston, 4 set valf seat/insert, 4 rod packing, 2 set hava odası membranı. Toplam yedek paketi ağırlığı yaklaşık 800 kg, hacim 1.5 m³; kamyon üzerinde ayrı bir bölmede taşınır.",
          "Yedek parça siparişinde orijinal ekipman üreticisi (OEM) tercih edilir. Aftermarket (muadil) parça fiyat avantajı sağlar ancak ömür genellikle yüzde 30-50 daha kısadır. KD Sondaj olarak kritik parçalarda OEM (e.g., Weatherford, National Oilwell Varco), yardımcı parçalarda muadil kullanır. Yıllık yedek parça bütçesi, makinenin saat ücretinin yüzde 8-12'si kadardır; bu kalem operasyon planlamaya dahil edilmelidir."
        ]
      }
    ],
    faq: [
      {
        q: "Liner kaç saatte bir değişmelidir?",
        a: "Standart ömür 600-1000 saattir. Aşındırıcı çamur kullanımında 300-500 saate iner. Debi düşüşü ve basınç kaybı ilk belirtilerdir."
      },
      {
        q: "Vuruntu sesi neden olur?",
        a: "Valf seat veya insert aşınması/kırılması. Pompa durdurulmalı, valf kontrol edilmeli ve gerekirse değişim yapılmalıdır. Sahada 45-60 dakikada tamamlanabilir."
      },
      {
        q: "Hava odası basıncı ne olmalı?",
        a: "Pompa deşarj basıncının yüzde 30-50'si. Günde bir kez kontrol önerilir. Membran yırtıldığında düzenli dolum gerekir ve basınç düşer."
      }
    ]
  },
  {
    slug: "kuyu-verimi-nasil-artirilir",
    category: "Su Sondajı",
    date: "2026-10-12",
    readTime: "7 dk",
    title: "Kuyu Verimi Nasıl Artırılır? Ekran Tasarımı, Gravel Pack ve Geliştirme",
    description:
      "Su kuyusu verimini artırmanın yöntemleri: ekran (screen) tasarımı, çakıl filtreleme (gravel pack), kuyu geliştirme (development), test pompa ve Q-y verimi hesabı. Tıkanma ve biyolojik kirlenme önleme.",
    keywords: [
      "kuyu verimi artırma",
      "su kuyusu ekran tasarımı",
      "gravel pack",
      "kuyu geliştirme"
    ],
    relatedServices: ["water"],
    relatedProducts: ["productTruck800", "productTrailer800"],
    sections: [
      {
        heading: "Kuyu hidroliği temelleri: Q ve y",
        paragraphs: [
          "Kuyu verimi 'specific capacity' olarak da bilinen Q/y oranı ile ölçülür. Q debi (litre/saniye), y ise su tablasının düşme miktarıdır (drawdown, metre). Yüksek Q/düşük y = verimli kuyu. Türkiye sahasında iyi projelendirilmiş bir kuyuda Q/y oranı 5-15 L/s/m arasındadır; 2 L/s/m altı düşük verimli kabul edilir.",
          "Kuyu hidroliği üç bileşene bağlıdır: akifer verimi (transmissivity), kuyu ekranı tasarımı ve kuyu geliştirme kalitesi. Akifer verimi doğal jeolojik özellik olup değiştirilemez; ancak ekran tasarımı ve geliştirme ile kuyu verimi yüzde 30-100 artırılabilir. KD Sondaj olarak her kuyuda test pompası 24-72 saat sürdürerek Q/y oranını raporluyoruz."
        ]
      },
      {
        heading: "Ekran (screen) tasarımı prensipleri",
        paragraphs: [
          "Kuyu ekranı, akiferden suyun kuyuya girmesini sağlayan ve aynı zamanda formasyon danelerinin girişini önleyen delikli veya yarıklı boru elemanıdır. İki ana tip vardır: continuous slot (sürekli yarık) ve wire wrap. Sürekli yarık ekranlar yüksek açık alan (open area) yüzdesi sunar, ancak tıkanma riski daha yüksektir. Wire wrap ekranlar daha dayanıklıdır ve tıkanma riski düşüktür.",
          "Ekran slot açıklığı, formasyon danelerinin yüzde 10-20'sini geçirecek şekilde seçilir. Bu yaklaşım 'gravel pack' ile birlikte uygulanır. Formasyon dane boyutu dağılımı (grain size distribution) laboratuvar elek analizi ile belirlenir; bu veriye göre slot açıklığı seçilir. KD Sondaj olarak PVC ve paslanmaz çelik ekran seçenekleri sunuyoruz; derin kuyularda paslanmaz çelik tercih edilir."
        ]
      },
      {
        heading: "Gravel pack (çakıl filtreleme)",
        paragraphs: [
          "Gravel pack, ekran etrafına yerleştirilen önceden yıkanmış ve boyutlandırılmış çakıl tabakasıdır. Çakıl boyutu, formasyon dane boyutunun 4-6 katı olmalıdır. Gravel pack üç işlev görür: formasyon danelerinin ekrana girmesini önler, ekranın mekanik stabilitesini artırır, kuyu çevresinde hidrolik geçirgenliği yükseltir.",
          "Uygulama: kuyu deline ve casing indirildikten sonra ekran bölgesi açılır (open hole) veya delikli casing ile sarılır. Çakıl, yüzeyden tremi borusu ile ekran bölgesine indirilir. Çakıl miktarı kuyu çapı ve ekran uzunluğuna göre hesaplanır; 100 m ekran için yaklaşık 1.5-2 m³ çakıl gerekir. KD Sondaj olarak 2-4 mm ve 4-8 mm çakıl fraksiyonları stoklu bulunduruyoruz."
        ]
      },
      {
        heading: "Kuyu geliştirme (development) teknikleri",
        paragraphs: [
          "Kuyu deline ve ekran yerleştirildikten sonra 'geliştirme' adı verilen işlem yapılır. Amaç: formasyon ile ekran arasındaki ince dane tabakasını temizlemek, geçirgenliği artırmak, ekran tıkanıklığını gidermek. En yaygın yöntemler: surging (basınçlı su ile ileri-geri vurma), jetting (yüksek basınçlı su jeti), airlift (hava kaldırma) ve overpumping (aşırı debi ile çekim).",
          "Geliştirme süresi kuyu derinliği ve akifer tipine göre 4-24 saat arasında değişir. Sığ kuyularda (50-100 m) airlift yöntemi hızlı ve ekonomiktir; derin kuyularda (300 m+) surging ve overpumping daha etkilidir. KD Sondaj olarak her kuyuda en az 4 saat geliştirme yapıyor; geliştirme sonrası test pompa ile Q/y oranı ölçülerek verimlilik kanıtlanıyor. Müşteriye 'kabul test raporu' sunuluyor."
        ]
      },
      {
        heading: "Tıkanma ve biyolojik kirlenme önleme",
        paragraphs: [
          "Kuyular zamanla tıkanma (clogging) eğilimi gösterir. Üç ana tıkanma tipi: mekanik (ince dane birikimi), kimyasal (kireç, demir, mangan birikimi) ve biyolojik (bakteri, alg). Tıkanma hızı kuyuya ve akifer suyuna bağlıdır. Önlem için periyodik bakım, klorlama ve uygun debi ile çalışma önerilir.",
          "KD Sondaj olarak her kuyuya teslim ederken 'işletme ve bakım kılavuzu' sunuyoruz. Kılavuzda klorlama protokolü (her 6 ayda bir 50-100 ppm), önerilen çalışma debisi (test pompasında belirlenen Q/debilerin yüzde 80'i), periyodik su numunesi alma sıklığı ve tıkanma belirtileri yer alır. Yıllık kuyu bakım hizmetimiz 35.000-80.000 TL arasında olup kimyasal temizlik, pompa kontrolü ve test pompası içerir."
        ]
      },
      {
        heading: "Test pompa verilerinin değerlendirilmesi",
        paragraphs: [
          "Test pompası verileri Theis veya Jacob yöntemi ile analiz edilir; transmissivity (T) ve storativity (S) parametreleri hesaplanır. Bu değerler akiferin uzun vadeli verimliliği hakkında bilgi verir. Yüksek T değeri (>100 m²/gün) verimli akifer; düşük T değeri (<10 m²/gün) sınırlı verimli akifer.",
          "Test pompa verileri aynı zamanda 'kuyu verimlilik' hesabında kullanılır. Well efficiency = teorik drawdown / gerçek drawdown. Yüzde 70 üzeri verimlilik iyi kuyu; yüzde 50 altı ise kuyu rehabilitasyonu gerekir. KD Sondaj olarak her kuyuyu teslim ederken well efficiency raporu sunar; müşteri yıllık performansı bu baseline ile karşılaştırır. Rehabilitasyon maliyeti yeni kuyu maliyetinin yüzde 30-50'si kadardır."
        ]
      }
    ],
    faq: [
      {
        q: "İyi bir kuyunun Q/y oranı nedir?",
        a: "Q/y > 5 L/s/m iyi kabul edilir. 2 L/s/m altı düşük verimli. KD Sondaj kuyuları tipik olarak 8-15 L/s/m aralığında teslim edilir."
      },
      {
        q: "Gravel pack şart mı?",
        a: "Homojen olmayan formasyonlarda veya ince daneli akiferlerde şarttır. Homojen kalın taneli formasyonlarda opsiyoneldir, ancak uzun vadeli verim için önerilir."
      },
      {
        q: "Kuyu tıkanması nasıl önlenir?",
        a: "Periyodik klorlama, önerilen debi ile çalışma, yıllık bakım. Belirgin tıkanma belirtilerinde kimyasal rehabilitasyon (asit, EDTA) uygulanır."
      }
    ]
  },
  {
    slug: "su-sondajinda-10-sik-yapilan-hata",
    category: "Su Sondajı",
    date: "2026-10-12",
    readTime: "5 dk",
    title: "Su Sondajında 10 Sık Yapılan Hata ve Çözüm Önerileri",
    description:
      "Su kuyusu açarken yapılan 10 yaygın hata: yanlış lokasyon seçimi, uygunsuz ekran, çakıl eksikliği, geliştirme yapmama, test pompa atlanması, ruhsatsız kuyu. Pratik çözümler ve maliyet tasarrufu.",
    keywords: [
      "su sondajı hataları",
      "kuyu açma hataları",
      "su kuyusu sorunları",
      "sondaj hatası"
    ],
    relatedServices: ["water"],
    relatedProducts: ["productTrailer800"],
    sections: [
      {
        heading: "Hata 1: Hidrojeolojik etüd yapmadan sondaj başlatmak",
        paragraphs: [
          "En temel hata, parselde hidrojeolojik etüd yapmadan kuyu noktası seçmektir. Komşu kuyunun verimli olması sizin kuyunuzun da verimli olacağını garanti etmez; formasyon 50 metrede değişebilir. Etüd yapılmadan açılan kuyuların yüzde 25-30'u kuru çıkar veya yetersiz verimli olur.",
          "Çözüm: MTA raporunun yanı sıra saha jeofiziği (rezistivite, elektrik) ile detaylı etüd. KD Sondaj olarak ücretsiz ön etüt raporu sunar; müşteri kendi başına etüd yaptırmak istemezse biz organize ederiz. Etüd maliyeti 35.000-80.000 TL olup, başarısız kuyu maliyeti 800.000 TL üzerinde olduğundan yatırım kendini amorti eder."
        ]
      },
      {
        heading: "Hata 2: Uygun olmayan makine seçimi",
        paragraphs: [
          "Sığ kuyuda derin kuyu makinesi kullanmak (örneğin 200 m kuyu için KD-3000) maliyeti yüzde 40-60 artırır. Tersi durumda yetersiz makine kuyu sapması ve tij düşürme riski yaratır. Makine seçimi hedef derinliğe ve formasyona göre yapılmalıdır.",
          "Çözüm: 0-300 m kamyon makinesi (KD-300/500), 300-1000 m kamyon/dorse (KD-800/1200), 1000-3000 m dorse (KD-3000). KD Sondaj olarak proje öncesinde ücretsiz makine önerisi sunar. Yanlış makine kullanımının projeye etkisi günler değil haftalar mertebesinde olabilir."
        ]
      },
      {
        heading: "Hata 3: DSİ izni olmadan kuyu açmak",
        paragraphs: [
          "Birçok köy sahibinin 'komşu açmış, ben de açarım' düşüncesi yanlıştır. DSİ izni olmadan açılan her kuyu 'kaçak kuyu' sayılır; cezası 50.000 TL üzerinde olup kuyu mühürlenir. Yasal kullanım için Arama Ruhsatı, Kullanma İzni ve Kullanma Belgesi zorunludur.",
          "Çözüm: KD Sondaj olarak her projede DSİ başvurusunu ve tüm idari süreci yönetiriz. Müşteri yalnızca tapu ve kimlik bilgilerini sağlar; geri kalan tüm süreç tarafımızca takip edilir. Toplam idari süre 6-12 ay olup bu süre planlamaya dahil edilmelidir."
        ]
      },
      {
        heading: "Hata 4: Casing (kuyu borusu) kalitesinden tasarruf",
        paragraphs: [
          "Ucuz PVC casing yerine API 5D:2015 standardında çelik casing kullanmak ömür ve güvenlik açısından kritiktir. Ucuz casing 5-10 yılda korozyon veya mekanik hasar sonucu çöker; kuyu kullanılamaz hale gelir. Bu durumda yeni kuyu açma maliyeti ortaya çıkar.",
          "Çözüm: API standartlarında çelik casing tercih edin. Maliyet farkı sadece yüzde 15-25 olup, ömür 50+ yıldır. KD Sondaj olarak API sertifikalı casing kullanıyor; her proje için mill test certificate sunuluyor."
        ]
      },
      {
        heading: "Hata 5: Ekran ve gravel pack eksikliği",
        paragraphs: [
          "Ekran yerleştirmeden veya gravel pack yapmadan kuyu kullanmak verimi yüzde 50-70 düşürür. Çakıl tabakası olmadan formasyon ince daneleri kuyuya dolarak tıkanma yaratır. Bu durum 3-5 yıl içinde belirginleşir ve rehabilitasyon gerektirir.",
          "Çözüm: Her kuyuda uygun slot açıklığında ekran ve çakıl filtreleme. KD Sondaj standart paketinde ekran, gravel pack ve geliştirme dahildir; ayrı maliyet çıkmaz. Maliyet avantajı uzun ömürde ortaya çıkar."
        ]
      },
      {
        heading: "Hata 6: Kuyu geliştirmeyi atlamak",
        paragraphs: [
          "Kuyu deline ve ekran yerleştirildikten sonra 'geliştirme' adı verilen işlem yapılmazsa Q/y oranı yüzde 30-50 düşük kalır. Geliştirme, ince dane tabakasını temizler ve akifer ile kuyu arasındaki geçirgenliği artırır. Bu adımı atlamak projenin yarı yarıya başarısız olması anlamına gelir.",
          "Çözüm: KD Sondaj olarak her kuyuda en az 4 saat geliştirme yapıyoruz. Geliştirme sonrası test pompa vakası ile Q/y raporlanıyor. Müşteri kabul etmeden önce performansı görüyor."
        ]
      },
      {
        heading: "Hata 7: Test pompa yapmadan teslim",
        paragraphs: [
          "Kuyu tamamlandıktan sonra 24-72 saatlik test pompası ile Q, y ve transmisivite parametreleri ölçülmelidir. Test pompa yapılmadan teslim edilen kuyunun gerçek verimi bilinmez; müşteri kullanım sırasında hayal kırıklığı yaşar. Test pompası ayrıca yasal Kullanma İzni başvurusu için de zorunludur.",
          "Çözüm: Her kuyuda standart 24 saatlik test pompası. KD Sondaj olarak test pompasını sözleşmeye dahil ediyoruz; ek maliyet çıkmaz. Müşteriye Q/y raporu ve transmisivite hesabı sunuluyor."
        ]
      },
      {
        heading: "Hata 8: Yanlış pompa seçimi",
        paragraphs: [
          "Pompa, kuyu karakteristiklerine göre seçilmelidir. Çok büyük pompa kuyuyu aşırı çeker ve ekranı tıkar; çok küçük pompa yetersiz debi sağlar. Pompa seçimi test pompası verilerine göre yapılır.",
          "Çözüm: KD Sondaj pompa seçiminde test pompa verilerini kullanır. Pompa performans eğrisi ile kuyu karakteristiği çakıştırılır; önerilen pompa çalışma noktası vurgulanır. Müşteriye pompa seçim gerekçesi raporu sunulur."
        ]
      },
      {
        heading: "Hata 9: Kuyu koruma ve bakım yapmamak",
        paragraphs: [
          "Kuyu açıldıktan sonra periyodik bakım yapılmazsa performans hızla düşer. Bakım kalemleri: klorlama, mekanik temizlik, performans testi, pompa kontrolü. Bakım yapılmayan kuyularda tıkanma ve biyolojik kirlenme riski yüzde 60-80 artar.",
          "Çözüm: Yılda en az bir kez kuyu bakımı. KD Sondaj olarak yıllık bakım paketi sunar; maliyet 35.000-80.000 TL. Bakım anlaşması olan müşterilere öncelikli hizmet verilir."
        ]
      },
      {
        heading: "Hata 10: Uygun olmayan ekiple çalışmak",
        paragraphs: [
          "Ucuz diye deneyimsiz operatör veya eksik ekipmanla çalışmak uzun vadede pahalıya gelir. Sondaj kalitesi; operatör deneyimi, makine bakımı ve proje yönetimine bağlıdır. Deneyimsiz ekip hataları kuyu kaybı, çevre kirliliği veya iş güvenliği kazasına yol açabilir.",
          "Çözüm: ISO 9001 kalite belgeli, 45 yıllık deneyimli, referansları güçlü bir firmayla çalışmak. KD Sondaj Ankara merkezli olup Türkiye'nin her yerinde hizmet veriyor. 7/24 WhatsApp hattı (0541 191 63 01) üzerinden ücretsiz ön etüt ve danışmanlık sağlanır."
        ]
      }
    ],
    faq: [
      {
        q: "En kritik hata hangisidir?",
        a: "Hidrojeolojik etüd yapmadan sondaj başlatmak. Maliyetrisiz neticelendirme ile kuru kuyu riski yüzde 25-30'dur; 800.000 TL+ zarar anlamına gelir."
      },
      {
        q: "Etüd maliyeti ne kadar?",
        a: "MTA raporları ücretsizdir. Detaylı saha jeofiziği ile birlikte 35.000-80.000 TL arasında. Yatırım başarı oranını yüzde 70'ten yüzde 95'e çıkarır."
      },
      {
        q: "KD Sondaj olarak hangi hataları önlüyorsunuz?",
        a: "Tüm 10 hatayı. Ön etüd, makine seçimi, DSİ izin yönetimi, casing kalitesi, ekran ve gravel pack, geliştirme, test pompa, pompa seçimi, bakım paketi, deneyimli ekip — hepsi standart hizmetimizde dahil."
      }
    ]
  }
];