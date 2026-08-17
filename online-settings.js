
(function () {
  const KEY = "socialPopupSettingsV1";

  const defaults = {
    instagram: "",
    youtube: "",
    twitch: "",
    kick: "",
    tiktok: "",
    x: "",
    scale: 1,
    speed: 1,
    duration: 5,
    offsetX: 0,
    offsetY: 0,
    customCSS: ""
  };

  function load() {
    try { return {...defaults, ...(JSON.parse(localStorage.getItem(KEY) || "{}"))}; }
    catch (_) { return {...defaults}; }
  }
  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    apply(s);
  }

  function apply(s) {
    const r = document.documentElement;
    r.style.setProperty("--sp-scale", s.scale);
    r.style.setProperty("--sp-speed", s.speed + "s");
    r.style.setProperty("--sp-offset-x", s.offsetX + "px");
    r.style.setProperty("--sp-offset-y", s.offsetY + "px");
    let tag = document.getElementById("sp-custom-css");
    if (!tag) {
      tag = document.createElement("style");
      tag.id = "sp-custom-css";
      document.head.appendChild(tag);
    }
    tag.textContent = s.customCSS || "";
    window.SOCIAL_POPUP_SETTINGS = s;
    document.dispatchEvent(new CustomEvent("socialPopupSettingsChanged", {detail:s}));
  }

  window.SocialPopupSettings = {load, save, defaults, apply};

  document.addEventListener("DOMContentLoaded", () => {
    const s = load();
    apply(s);

    const panel = document.getElementById("settingsPanel");
    const openBtn = document.getElementById("settingsOpen");
    const closeBtn = document.getElementById("settingsClose");
    const form = document.getElementById("settingsForm");
    const resetBtn = document.getElementById("settingsReset");
    const status = document.getElementById("settingsStatus");

    function fill() {
      Object.keys(s).forEach(k => {
        const el = form?.elements?.namedItem(k);
        if (el) el.value = s[k];
      });
    }
    function read() {
      const out = {...defaults};
      Object.keys(out).forEach(k => {
        const el = form?.elements?.namedItem(k);
        if (!el) return;
        out[k] = ["scale","speed","duration","offsetX","offsetY"].includes(k) ? Number(el.value) : el.value;
      });
      return out;
    }
    fill();

    openBtn?.addEventListener("click", () => panel?.classList.add("show"));
    closeBtn?.addEventListener("click", () => panel?.classList.remove("show"));
    panel?.addEventListener("click", e => { if (e.target === panel) panel.classList.remove("show"); });

    form?.addEventListener("submit", e => {
      e.preventDefault();
      Object.assign(s, read());
      save(s);
      status.textContent = "Kaydedildi ✓";
      setTimeout(() => status.textContent = "", 1800);
    });

    resetBtn?.addEventListener("click", () => {
      Object.assign(s, {...defaults});
      fill();
      save(s);
      status.textContent = "Varsayılanlara döndü";
      setTimeout(() => status.textContent = "", 1800);
    });

    // Keyboard shortcut: Ctrl+Shift+S
    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        panel?.classList.toggle("show");
      }
    });
  });
})();
