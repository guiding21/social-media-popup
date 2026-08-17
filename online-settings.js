(function () {
  const KEY = "socialPopupSettingsV2";

  function scriptDefaults() {
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
    const defaults = scriptDefaults();
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      return saved && typeof saved === "object" ? {...defaults, ...saved} : defaults;
    } catch (_) { return defaults; }
  }

  function fill(form, values) {
    Object.keys(values).forEach(k => {
      const el = form?.elements?.namedItem(k);
      if (!el) return;
      if (el.type === "checkbox") el.checked = !!values[k];
      else el.value = values[k];
    });
  }

  function read(form) {
    const out = {...load()};
    Object.keys(out).forEach(k => {
      const el = form?.elements?.namedItem(k);
      if (!el) return;
      if (el.type === "checkbox") out[k] = el.checked;
      else out[k] = ["scale","speed","duration","offsetX","offsetY"].includes(k)
        ? Number(el.value) : el.value;
    });
    return out;
  }

  window.SocialPopupSettings = {load, scriptDefaults};

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("settingsForm");
    const panel = document.getElementById("settingsPanel");
    const openBtn = document.getElementById("settingsOpen");
    const closeBtn = document.getElementById("settingsClose");
    const resetBtn = document.getElementById("settingsReset");
    const status = document.getElementById("settingsStatus");

    fill(form, load());

    openBtn?.addEventListener("click", () => {
      fill(form, load());
      panel?.classList.add("show");
    });

    closeBtn?.addEventListener("click", () => panel?.classList.remove("show"));
    panel?.addEventListener("click", e => {
      if (e.target === panel) panel.classList.remove("show");
    });

    form?.addEventListener("submit", e => {
      e.preventDefault();
      localStorage.setItem(KEY, JSON.stringify(read(form)));
      status.textContent = "Kaydedildi ✓";
      setTimeout(() => location.reload(), 250);
    });

    resetBtn?.addEventListener("click", () => {
      localStorage.removeItem(KEY);
      status.textContent = "Varsayılanlara döndü ✓";
      setTimeout(() => location.reload(), 250);
    });
  });
})();
