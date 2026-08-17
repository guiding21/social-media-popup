var settings = {

  // Simply change the name in quotes with your name
  social: {
    
  
  
    // Instagram Name
    instagramUsername: "basarerenkaratas",

    // Twitter Name
    twitterUsername: "basarernkaratas",
    
    // Youtube Name
    youtubeUsername: "GuidingVL",

    // Kick Name
    kickUsername: "Guiding",

    // Tiktok Name
    tiktokUsername: "basarernkaratas",

    // Twitch Name
    twitchUsername: "xx",
      
  },

  // Gaming Popup Options
  popup: {
    
    // This is where you enable or disable networks
    // 1 means enabled, 0 means disabled
    
    // Enable Twitter
    enableTwitter: 1,
    
    // Enable Instagram
    enableInstagram: 1,
    
    // Enable YouTube
    enableYoutube: 1,
    
    // Enable Kick
    enableKick: 1,
    
    // Enable Twitch
    enableTwitch: 0,
      
    // Enable Tiktok
    enableTiktok: 0,
    
    //
    // Times to update
    //
    
    // Time each network animation takes in seconds
    aTime: 3,
    
    // The delay for the animation cycle to restart in seconds
    pauseTime: 0
  }
};

// You're all done
//
//
//
//
//
//
//
//
// No need to go any further!

// Apply per-device online settings before the popup list is created.
(function () {
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
      "enableInstagram", "enableYoutube", "enableTwitch",
      "enableKick", "enableTiktok", "enableTwitter"
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
})();

// Load Social Network Names
$( ".popup .right span" ).each(function() {
    var socialName = settings.social[$(this).data('name')];
    $(this).append( socialName );
});

// Load Social Popup
$(".popup").each(function() {
  var supporterEnable = settings.popup[$(this).data('box')],
    boxName = $(this).data('box');

  if (supporterEnable == 1) {
    $('input[name=' + boxName + ']').prop('checked', true);
    $(this).addClass("animate-popup");
  } else if (supporterEnable === 0) {
    $('input[name=' + boxName + ']').prop('checked', false);
    $(this).addClass("no-popup");
  } else {
    $(this).addClass("no-popup");;
  }
});

// Animate Popup

var popups = $('.animate-popup');
var i = 0;
var pT = settings.popup.pauseTime * 1000;

function animatePopup() {
  if (i >= popups.length) {
    i = 0;
  }
  popups.eq(i).addClass("show-popup")
    .delay(settings.popup.aTime * 1000)
    .queue(function() {
      $(this).removeClass("show-popup");
      $(this).dequeue();
      if (i == popups.length) {
        setTimeout(animatePopup, pT);
      } else {
        animatePopup();
      }
    });
  i++;
}
animatePopup();
