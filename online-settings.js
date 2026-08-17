(function () {
  const KEY = "socialPopupSettingsV3";

  function getScriptDefaults() {
    const s = window.settings || {};
    const popup = s.popup || {};
    return {
      instagram: "",
      youtube: "",
      twitch: "",
      kick: "",
      tiktok: "",
      x: "",
      scale: 1,
      speed: Number(popup.aTime) || 3,
      duration: Number(popup.aTime) || 3,
      offsetX: 0,
      offsetY: 0,
      customCSS: ""
    };
  }

  function hasSavedSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      return !!(saved && typeof saved === "object" && saved._configured === true);
    } catch (_) {
      return false;
    }
  }

  function load() {
    const defaults = getScriptDefaults();
    if (!hasSavedSettings()) return {...defaults};
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!saved || typeof saved !== "object") return {...defaults};
      return {...defaults, ...saved};
    } catch (_) {
      return {...defaults};
    }
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

    const nameMap = {
      instagram: "instagramUsername",
      youtube: "youtubeUsername",
      twitch: "twitchUsername",
      kick: "kickUsername",
      tiktok: "tiktokUsername",
      x: "twitterUsername"
    };

    Object.keys(nameMap).forEach(key => {
      const dataName = nameMap[key];
      document.querySelectorAll('[data-name="' + dataName + '"]').forEach(el => {
        el.textContent = s[key] || "";
      });
    });

    if (window.settings && window.settings.popup && Number.isFinite(Number(s.duration))) {
      window.settings.popup.aTime = Number(s.duration);
    }

    window.SOCIAL_POPUP_SETTINGS = s;
    document.dispatchEvent(new CustomEvent("socialPopupSettingsChanged", {detail: s}));
  }

  function save(s) {
    s._configured = true;
    localStorage.setItem(KEY, JSON.stringify(s));
    apply(s);
  }

  function reset() {
    localStorage.removeItem(KEY);
    const defaults = getScriptDefaults();
    apply(defaults);
    return defaults;
  }

  window.SocialPopupSettings = {load, save, reset, getScriptDefaults, apply, hasSavedSettings};

  document.addEventListener("DOMContentLoaded", () => {
    const configured = hasSavedSettings();
    const s = load();
    apply(s);

    const panel = document.getElementById("settingsPanel");
    const openBtn = document.getElementById("settingsOpen");
    const closeBtn = document.getElementById("settingsClose");
    const form = document.getElementById("settingsForm");
    const resetBtn = document.getElementById("settingsReset");
    const status = document.getElementById("settingsStatus");

    function fill(values) {
      Object.keys(values).forEach(k => {
        const el = form?.elements?.namedItem(k);
        if (el) el.value = values[k];
      });
    }

    function read() {
      const current = load();
      const out = {...current};
      Object.keys(out).forEach(k => {
        const el = form?.elements?.namedItem(k);
        if (!el) return;
        out[k] = ["scale", "speed", "duration", "offsetX", "offsetY"].includes(k)
          ? Number(el.value) : el.value;
      });
      return out;
    }

    fill(s);

    if (!configured) {
      setTimeout(() => {
        panel?.classList.add("show");
        status.textContent = "İlk kullanım: kendi sosyal medya hesaplarını gir.";
      }, 150);
    }

    openBtn?.addEventListener("click", () => {
      fill(load());
      panel?.classList.add("show");
    });

    closeBtn?.addEventListener("click", () => panel?.classList.remove("show"));
    panel?.addEventListener("click", e => {
      if (e.target === panel) panel.classList.remove("show");
    });

    form?.addEventListener("submit", e => {
      e.preventDefault();
      save(read());
      status.textContent = "Kaydedildi ✓";
      setTimeout(() => {
        status.textContent = "";
        panel?.classList.remove("show");
      }, 1000);
    });

    resetBtn?.addEventListener("click", () => {
      fill(reset());
      status.textContent = "Ayarlar sıfırlandı. Kendi hesaplarını gir.";
      setTimeout(() => status.textContent = "", 2200);
    });

    document.addEventListener("keydown", e => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "s") {
        e.preventDefault();
        panel?.classList.toggle("show");
      }
    });
  });
})();
