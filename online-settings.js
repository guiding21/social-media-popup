const SUPABASE_URL = "https://jbhqhyhphyriwfsacefr.supabase.co";
const SUPABASE_KEY = "sb_publishable_X4bCqg7lk6mYkjvSRhMPjA_7lKWagE6";
const SETTINGS_KEY = "socialPopupOnlineSettingsV1";

function normalizeUserCode(value) {
  return (value || "").trim().toLowerCase().replace(/[^a-z0-9_\-]/g, "").slice(0, 40);
}
function getUserCode() {
  const fromUrl = normalizeUserCode(new URLSearchParams(location.search).get("u"));
  return fromUrl || normalizeUserCode(localStorage.getItem("socialPopupSelectedUser"));
}
function setUserCode(value) {
  const u = normalizeUserCode(value);
  if (u) localStorage.setItem("socialPopupSelectedUser", u);
  return u;
}


let supabaseClient = null;

function getSupabaseClient() {
  if (!supabaseClient) {
    if (!window.supabase || !window.supabase.createClient) {
      throw new Error("Supabase istemcisi yüklenemedi.");
    }
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

async function loadOnlineSettings() {
  const u = getUserCode();
  if (!u) return null;

  const { data, error } = await getSupabaseClient()
    .from("social_popup_settings")
    .select("settings")
    .eq("username", u)
    .maybeSingle();

  if (error) throw error;
  return data ? data.settings : null;
}

async function saveOnlineSettings(username, token, settings) {
  const { data, error } = await getSupabaseClient()
    .rpc("save_social_popup_settings", {
      p_username: username,
      p_token: token,
      p_settings: settings
    });

  if (error) throw error;
  return data;
}

async function ensureProfile() {
  const u = getUserCode();
  if (!u) return null;

  const key = SETTINGS_KEY + ":" + u;
  let token = localStorage.getItem(key);

  if (!token) {
    token = crypto.randomUUID() + crypto.randomUUID();
    localStorage.setItem(key, token);
  }

  return token;
}

window.SocialPopupOnline = {
  getUserCode,
  setUserCode,
  loadForCurrentUser: async function () {
    const s = await loadOnlineSettings();
    if (s && window.SocialPopupEngine) {
      window.SocialPopupEngine.apply(s);
    }
    return s;
  },
  save: saveOnlineSettings,
  ensureProfile
};

document.addEventListener("DOMContentLoaded", async () => {
  const KEY = "socialPopupOnlineSettingsV1";
  const form = document.getElementById("settingsForm");
  const status = document.getElementById("settingsStatus");
  const reset = document.getElementById("settingsReset");
  const userInput = document.getElementById("popupUsername");
  const linkBox = document.getElementById("popupUserLink");

  function defaults() {
    const s = window.SocialPopupEngine.settings;
    return {
      instagram:s.social.instagramUsername||"",
      youtube:s.social.youtubeUsername||"",
      twitch:s.social.twitchUsername||"",
      kick:s.social.kickUsername||"",
      tiktok:s.social.tiktokUsername||"",
      x:s.social.twitterUsername||"",
      enableInstagram:Number(s.popup.enableInstagram)===1,
      enableYoutube:Number(s.popup.enableYoutube)===1,
      enableTwitch:Number(s.popup.enableTwitch)===1,
      enableKick:Number(s.popup.enableKick)===1,
      enableTiktok:Number(s.popup.enableTiktok)===1,
      enableTwitter:Number(s.popup.enableTwitter)===1,
      scale:1, speed:Number(s.popup.aTime)||3, duration:Number(s.popup.aTime)||3,
      offsetX:0, offsetY:0, customCSS:""
    };
  }

  function fill(v) {
    Object.keys(v).forEach(k => {
      const e = form?.elements.namedItem(k);
      if (!e) return;
      e.type === "checkbox" ? e.checked = !!v[k] : e.value = v[k] ?? "";
    });
  }

  function read() {
    const d=defaults(), o={...d};
    Object.keys(o).forEach(k => {
      const e=form?.elements.namedItem(k);
      if(!e) return;
      o[k] = e.type === "checkbox" ? e.checked :
        (["scale","speed","duration","offsetX","offsetY"].includes(k) ? Number(e.value) : e.value);
    });
    return o;
  }

  function showLink(u) {
    if (!linkBox || !u) return;
    const base = location.href.replace(/settings\.html(\?.*)?$/, "");
    linkBox.innerHTML =
      "Yayın linkin: <code>" + base + "?u=" + encodeURIComponent(u) + "</code>";
  }

  function showError(err, prefix) {
    console.error(prefix, err);
    const msg = err?.message || String(err);
    status.textContent = prefix + ": " + msg;
  }

  const currentUser = SocialPopupOnline.getUserCode();
  if (userInput) userInput.value = currentUser || "";

  let remote = null;
  if (currentUser) {
    try {
      remote = await SocialPopupOnline.loadForCurrentUser();
    } catch (e) {
      showError(e, "Online ayarlar okunamadı");
    }
  }

  fill(remote || defaults());
  showLink(currentUser);

  form?.addEventListener("submit", async e => {
    e.preventDefault();

    const chosen = SocialPopupOnline.setUserCode(userInput?.value || "");

    if (!chosen) {
      status.textContent = "Önce bir kullanıcı adı/kod seç.";
      userInput?.focus();
      return;
    }

    if (!/^[a-z0-9_-]{1,40}$/.test(chosen)) {
      status.textContent = "Kullanıcı kodu sadece harf, rakam, _ ve - içerebilir.";
      return;
    }

    const tokenKey = KEY + ":" + chosen;
    let token = localStorage.getItem(tokenKey);

    if (!token) {
      token = crypto.randomUUID() + crypto.randomUUID();
      localStorage.setItem(tokenKey, token);
    }

    try {
      status.textContent = "Online kaydediliyor...";
      const values = read();

      await SocialPopupOnline.save(chosen, token, values);

      if (window.SocialPopupEngine) {
        window.SocialPopupEngine.apply(values);
      }

      showLink(chosen);
      status.textContent = "Online kaydedildi ✓";
    } catch (err) {
      showError(err, "Kayıt hatası");
    }
  });

  reset?.addEventListener("click", () => {
    fill(defaults());
    status.textContent = "Varsayılanlara döndü. Kaydet'e bas.";
  });
});
