(function () {
  const KEY = "socialPopupSettingsV2";

  // These are only fallback values. The real defaults are read from script.js,
  // so changing script.js on GitHub updates the popup for users who haven't
  // saved personal settings.
  function getScriptDefaults() {
    const s = window.settings || {};
    const social = s.social || {};
    const popup = s.popup || {};

    return {
      instagram: social.instagramUsername || "",
      youtube: social.youtubeUsername || "",
      twitch: social.twitchUsername || "",
      kick: social.kickUsername || "",
      tiktok: social.tiktokUsername || "",
      x: social.twitterUsername || "",
      scale: 1,
      speed: Number(popup.aTime) || 3,
      duration: Number(popup.aTime) || 3,
      offsetX: 0,
      offsetY: 0,
      customCSS: ""
    };
  }

  function load() {
    const defaults = getScriptDefaults();
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

    // Apply saved/personal social names over the defaults from script.js.
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

    // Keep the original popup timing working, while allowing the online panel
    // to override it for this browser/device.
    if (window.settings && window.settings.popup) {
      if (Number.isFinite(Number(s.duration))) {
        window.settings.popup.aTime = Number(s.duration);
      }
    }

    window.SOCIAL_POPUP_SETTINGS = s;
    document.dispatchEvent(new CustomEvent("socialPopupSettingsChanged", {detail: s}));
  }

  function save(s) {
    localStorage.setItem(KEY, JSON.stringify(s));
    apply(s);
  }

  function reset() {
    // Removing the personal override is intentional: the next load uses the
    // current values from script.js, including any new GitHub changes.
    localStorage.removeItem(KEY);
    const defaults = getScriptDefaults();
    apply(defaults);
    return defaults;
  }

  window.SocialPopupSettings = {
    load,
    save,
    reset,
    getScriptDefaults,
    apply
  };

  document.addEventListener("DOMContentLoaded", () => {
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
          ? Number(el.value)
          : el.value;
      });
      return out;
    }

    fill(s);

    openBtn?.addEventListener("click", () => {
      const current = load();
      fill(current);
      panel?.classList.add("show");
    });

    closeBtn?.addEventListener("click", () => panel?.classList.remove("show"));
    panel?.addEventListener("click", e => {
      if (e.target === panel) panel.classList.remove("show");
    });

    form?.addEventListener("submit", e => {
      e.preventDefault();
      const next = read();
      save(next);
      status.textContent = "Kaydedildi ✓";
      setTimeout(() => status.textContent = "", 1800);
    });

    resetBtn?.addEventListener("click", () => {
      const defaults = reset();
      fill(defaults);
      status.textContent = "GitHub'daki script.js ayarlarına döndü ✓";
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
