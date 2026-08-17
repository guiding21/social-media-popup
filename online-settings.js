(function () {
  const KEY = "socialPopupSettingsV2";

  function getDefaults() {
    const s = window.SocialPopupEngine?.settings || {};
    const social = s.social || {};
    const popup = s.popup || {};
    return {
      instagram: social.instagramUsername || "",
      youtube: social.youtubeUsername || "",
      twitch: social.twitchUsername || "",
      kick: social.kickUsername || "",
      tiktok: social.tiktokUsername || "",
      x: social.twitterUsername || "",
      enableInstagram: Number(popup.enableInstagram) === 1,
      enableYoutube: Number(popup.enableYoutube) === 1,
      enableTwitch: Number(popup.enableTwitch) === 1,
      enableKick: Number(popup.enableKick) === 1,
      enableTiktok: Number(popup.enableTiktok) === 1,
      enableTwitter: Number(popup.enableTwitter) === 1,
      scale: 1,
      speed: Number(popup.aTime) || 3,
      duration: Number(popup.aTime) || 3,
      offsetX: 0,
      offsetY: 0,
      customCSS: ""
    };
  }

  function load() {
    const defaults = getDefaults();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      return saved && typeof saved === "object" ? {...defaults, ...saved} : defaults;
    } catch (_) {
      return defaults;
    }
  }

  function fill(form, values) {
    if (!form) return;
    Object.keys(values).forEach(k => {
      const el = form.elements.namedItem(k);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!values[k];
      else el.value = values[k];
    });
  }

  function read(form) {
    const current = load();
    const out = {...current};
    Object.keys(out).forEach(k => {
      const el = form.elements.namedItem(k);
      if (!el) return;
      if (el.type === "checkbox") out[k] = el.checked;
      else out[k] = ["scale","speed","duration","offsetX","offsetY"].includes(k)
        ? Number(el.value) : el.value;
    });
    return out;
  }

  function apply(values) {
    localStorage.setItem(KEY, JSON.stringify(values));
    if (window.SocialPopupEngine) {
      window.SocialPopupEngine.applySavedSettings();
      window.SocialPopupEngine.restart();
    }
  }

  window.SocialPopupSettings = {load, getDefaults, apply};

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settingsForm");
    const panel = document.getElementById("settingsPanel");
    const openBtn = document.getElementById("settingsOpen");
    const closeBtn = document.getElementById("settingsClose");
    const resetBtn = document.getElementById("settingsReset");
    const status = document.getElementById("settingsStatus");

    const hasSaved = !!localStorage.getItem(KEY);
    fill(form, load());
    if (!hasSaved) setTimeout(() => panel.classList.add("show"), 150);

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        fill(form, load());
        panel.classList.add("show");
      });
    }

    if (closeBtn) closeBtn.addEventListener("click", () => panel.classList.remove("show"));
    if (panel) panel.addEventListener("click", e => {
      if (e.target === panel) panel.classList.remove("show");
    });

    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const values = read(form);
      apply(values);
      status.textContent = "Kaydedildi ✓";
      setTimeout(() => status.textContent = "", 1800);
    });

    if (resetBtn) resetBtn.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      const defaults = getDefaults();
      fill(form, defaults);
      if (window.SocialPopupEngine) {
        window.SocialPopupEngine.applySavedSettings();
        window.SocialPopupEngine.restart();
      }
      status.textContent = "GitHub'daki varsayılanlara döndü ✓";
      setTimeout(() => status.textContent = "", 2200);
    });
  });
})();
