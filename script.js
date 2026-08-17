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

var popupTimer = null;
var popupList = [];
var popupIndex = 0;

function applySavedSettings() {
  try {
    var saved = JSON.parse(localStorage.getItem("socialPopupSettingsV2") || "null");
    if (!saved || typeof saved !== "object") return;

    var names = {
      instagram: "instagramUsername",
      youtube: "youtubeUsername",
      twitch: "twitchUsername",
      kick: "kickUsername",
      tiktok: "tiktokUsername",
      x: "twitterUsername"
    };

    Object.keys(names).forEach(function (key) {
      if (typeof saved[key] !== "undefined") {
        settings.social[names[key]] = saved[key];
      }
    });

    var enabled = [
      "enableInstagram",
      "enableYoutube",
      "enableTwitch",
      "enableKick",
      "enableTiktok",
      "enableTwitter"
    ];

    enabled.forEach(function (key) {
      if (typeof saved[key] !== "undefined") {
        settings.popup[key] = saved[key] ? 1 : 0;
      }
    });

    if (typeof saved.duration !== "undefined" && !isNaN(Number(saved.duration))) {
      settings.popup.aTime = Number(saved.duration);
    }
  } catch (e) {}
}

function stopPopupLoop() {
  if (popupTimer) {
    clearTimeout(popupTimer);
    popupTimer = null;
  }
  $(".popup").removeClass("show-popup animate-popup").addClass("no-popup");
}

function preparePopupList() {
  popupList = [];

  $(".popup").each(function () {
    var boxName = $(this).data("box");
    var enabled = settings.popup[boxName];

    var socialName = settings.social[$(this).find("span[data-name]").data("name")];
    $(this).find("span[data-name]").text(socialName || "");

    if (enabled == 1 && socialName) {
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

  function showNext() {
    $(".popup").removeClass("show-popup");
    var current = $(popupList[popupIndex]);
    current.removeClass("no-popup").addClass("show-popup");

    var duration = Math.max(0.2, Number(settings.popup.aTime) || 3) * 1000;

    popupTimer = setTimeout(function () {
      current.removeClass("show-popup");
      popupIndex = (popupIndex + 1) % popupList.length;

      var pause = Math.max(0, Number(settings.popup.pauseTime) || 0) * 1000;
      popupTimer = setTimeout(showNext, pause);
    }, duration);
  }

  showNext();
}

window.SocialPopupEngine = {
  settings: settings,
  applySavedSettings: applySavedSettings,
  start: startPopupLoop,
  restart: startPopupLoop,
  stop: stopPopupLoop
};

// The settings panel loads after this file and starts the popup once its
// per-device settings are available.
applySavedSettings();

$(function () {
  if (window.SocialPopupEngine) {
    window.SocialPopupEngine.start();
  }
});
