(function () {
  var k = "oorgos-theme";
  var p = "system";
  try {
    var c = document.cookie.match(/(?:^|; )oorgos-theme=([^;]*)/);
    if (c) p = decodeURIComponent(c[1]);
    else {
      var s = localStorage.getItem(k);
      if (s) p = s;
    }
  } catch (e) {}
  if (p !== "light" && p !== "dark" && p !== "system") p = "system";
  var r =
    p === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : p;
  var el = document.documentElement;
  el.setAttribute("data-theme", r);
  el.setAttribute("data-theme-pref", p);
})();
