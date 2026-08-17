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
    tiktokUsername: "basarerenkaratas",

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
    enableTiktok: 1,
    
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
