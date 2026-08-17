var settings = {
  social: {
    instagramUsername: "basarerenkaratas",
    twitterUsername: "basarernkaratas",
    youtubeUsername: "GuidingVL",
    kickUsername: "Guiding",
    tiktokUsername: "basarerenkaratas",
    twitchUsername: "xx"
  },
  popup: {
    enableTwitter: 1,
    enableInstagram: 1,
    enableYoutube: 1,
    enableKick: 1,
    enableTwitch: 0,
    enableTiktok: 1,
    aTime: 3,
    pauseTime: 0
  }
};

var popupTimer = null, popupList = [], popupIndex = 0;

function applySettingsObject(saved) {
  if (!saved || typeof saved !== "object") return;
  var names = {
    instagram: "instagramUsername", youtube: "youtubeUsername",
    twitch: "twitchUsername", kick: "kickUsername",
    tiktok: "tiktokUsername", x: "twitterUsername"
  };
  Object.keys(names).forEach(function(k) {
    if (typeof saved[k] !== "undefined") settings.social[names[k]] = saved[k];
  });
  ["enableInstagram","enableYoutube","enableTwitch","enableKick","enableTiktok","enableTwitter"]
    .forEach(function(k) {
      if (typeof saved[k] !== "undefined") settings.popup[k] = saved[k] ? 1 : 0;
    });
  if (typeof saved.duration !== "undefined" && !isNaN(Number(saved.duration))) {
    settings.popup.aTime = Number(saved.duration);
  }
}

function stopPopupLoop() {
  if (popupTimer) clearTimeout(popupTimer);
  popupTimer = null;
  $(".popup").removeClass("show-popup animate-popup").addClass("no-popup");
}

function preparePopupList() {
  popupList = [];
  $(".popup").each(function() {
    var boxName = $(this).data("box");
    var span = $(this).find("span[data-name]");
    var socialName = span.length ? settings.social[span.data("name")] : "";
    span.text(socialName || "");
    if (settings.popup[boxName] == 1 && socialName) {
      $(this).removeClass("no-popup").addClass("animate-popup");
      popupList.push(this);
    } else {
      $(this).removeClass("animate-popup show-popup").addClass("no-popup");
    }
  });
}

function startPopupLoop() {
  stopPopupLoop();
  preparePopupList();
  popupIndex = 0;
  if (!popupList.length) return;
  function next() {
    $(".popup").removeClass("show-popup");
    var current = $(popupList[popupIndex]).addClass("show-popup");
    popupTimer = setTimeout(function() {
      current.removeClass("show-popup");
      popupIndex = (popupIndex + 1) % popupList.length;
      popupTimer = setTimeout(next, Math.max(0, Number(settings.popup.pauseTime) || 0) * 1000);
    }, Math.max(0.2, Number(settings.popup.aTime) || 3) * 1000);
  }
  next();
}

window.SocialPopupEngine = {
  settings: settings,
  apply: function(s) { applySettingsObject(s); startPopupLoop(); },
  start: startPopupLoop,
  restart: startPopupLoop
};

$(function() {
  if (window.SocialPopupOnline && window.SocialPopupOnline.loadForCurrentUser) {
    window.SocialPopupOnline.loadForCurrentUser().finally(function() {
      startPopupLoop();
    });
  } else {
    startPopupLoop();
  }
});
