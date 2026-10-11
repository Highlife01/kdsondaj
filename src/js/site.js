(function () {
  "use strict";

  var btn = document.getElementById("menu-toggle");
  var panel = document.getElementById("mobile-panel");
  if (!btn || !panel) return;

  btn.addEventListener("click", function () {
    var open = panel.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  panel.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      panel.classList.remove("is-open");
      btn.setAttribute("aria-expanded", "false");
    });
  });
})();
