import {
  postAnonymousUser,
  sendEvent,
  getAnonymousId,
  getUserId,
  isaAccessibe,
  setAttributes,
  getUser,
  findByMobile,
  findByEmail,
  isIdentified,
  initializeProjectId,
  getABType,
  getFirstEvent,
  getLastEvent,
  addWebPushToken,
  getRecs
} from "./apiClient";

const axios = require('axios');



await checkAnonymousCookie();
await checkABCookie();
await initializeProjectId();
await triggerServerSideEvent();

const sessionCount = handlenovinSessionCount();
const pageViewCount = handlenovinPageViewCount();


const widgetoScript = document.createElement('script');
widgetoScript.src = 'https://api.popups.fafait.net/popup.js';
document.body.appendChild(widgetoScript);


async function triggerServerSideEvent() {
  try {
    const baseURL = window.location.origin;
    const fullPathURL = window.location.href;
    const ajaxURL = `${baseURL}/wp-admin/admin-ajax.php?action=track_page_view_event`;
    // console.log('fullPathURL: ', fullPathURL);
    // Send the AJAX request with fullPathURL included in the data payload
    const res = await axios.post(ajaxURL, { fullPathURL });

    // console.log('Event tracked:', res);
  } catch (err) {
    console.log('Error in event tracked:', err.message);
  }
}


// Dynamically load Firebase scripts
const loadFirebaseScripts = () => {
  return new Promise((resolve, reject) => {
    const firebaseAppScript = document.createElement('script');
    firebaseAppScript.src = 'https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js';
    firebaseAppScript.async = true;
    firebaseAppScript.onload = resolve;
    firebaseAppScript.onerror = reject;
    document.head.appendChild(firebaseAppScript);
  }).then(() => {
    return new Promise((resolve, reject) => {
      const firebaseMessagingScript = document.createElement('script');
      firebaseMessagingScript.src = 'https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js';
      firebaseMessagingScript.async = true;
      firebaseMessagingScript.onload = resolve;
      firebaseMessagingScript.onerror = reject;
      document.head.appendChild(firebaseMessagingScript);
    });
  });
};

// Initialize Firebase after scripts are loaded
const initializeFirebase = () => {
  firebase.initializeApp({
    apiKey: "AIzaSyC-OiM2fQkAOBIAVPt9N0VV-Jjor9pKAnI",
    authDomain: "novinmarketing-4a99a.firebaseapp.com",
    projectId: "novinmarketing-4a99a",
    storageBucket: "novinmarketing-4a99a.appspot.com",
    messagingSenderId: "1037825539844",
    appId: "1:1037825539844:web:7b6691760ec561cc71da51"
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/novinWebPushServiceWorker.js')
      .then((registration) => {
        console.log('Service worker registered:', registration);
        // Wait until the service worker is ready
        return navigator.serviceWorker.ready;
      })
      .then((registration) => {
        console.log('Service worker is active:', registration);
        // Get the messaging object
        const messaging = firebase.messaging();
        // Request permission for push notifications
        return Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            console.log("Notification permission granted.");
            // Get the token
            return messaging.getToken({ serviceWorkerRegistration: registration });
          } else {
            console.log("Notification permission denied.");
            throw new Error("Notification permission denied.");
          }
        });
      })
      .then((token) => {
        if (token) {
          novin.user.addWebPushToken({
            "webPushToken": token
          });
          console.log("Token:", token);
        } else {
          console.log("No token received.");
        }
      })
      .catch((error) => {
        // console.error('Error getting token:', error);
        novin.user.setAttributes({
          "optInWebPush": {
            "value": false
          }
        });
      });
  } else {
    console.log('Service workers are not supported in this browser.');
  }
};

function hasCookie(key) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(key + '=')) {
      return true;
    }
  }
  return false;
}


function getCookieValue(key) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(key + '=')) {
      return cookie.substring(key.length + 1);
    }
  }
}

async function checkAnonymousCookie() {
  const anonymous_id_cookie = "novinAnonymousId";
  if (!hasCookie(anonymous_id_cookie) || !getCookieValue(anonymous_id_cookie)) {
    try {
      const anonymousUser = await postAnonymousUser();
      const value = anonymousUser._id;
      const oneYearInMilliseconds = 31536000000; // One year in milliseconds
      const nextYear = new Date(Date.now() + oneYearInMilliseconds);
      document.cookie = `${anonymous_id_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`;
      // console.log("Cookie novinAnonymousId: " + getCookieValue(anonymous_id_cookie) + " added.");
    } catch (error) {
      await axios.post('https://cdp.novin.marketing/api/events/log', { "SDK Error Log: ": "Error while getting anonymous user from server:" + error });
    }

  } else {
    console.log("anonymous_id_cookie Cookie already exists.");
  }
}

function generateRandom() {
  // Generate a random number between 0 and 1
  const randomNumber = Math.random();

  // Decide whether to output "A" or "B" based on the random number
  if (randomNumber < 0.5) {
    return "A";
  } else {
    return "B";
  }
}



async function hasWebPush() {
  let user = await novin.user.getUser();
  if (user.webPushTokens && user.webPushTokens.length > 0 && Notification.permission == "granted") {
    return true;
  }
  else {
    return false;
  }
}

async function checkABCookie() {
  const novin_AB_cookie = "novin-AB";
  if (!hasCookie(novin_AB_cookie) || !getCookieValue(novin_AB_cookie)) {
    try {

      const oneYearInMilliseconds = 31536000000; // One year in milliseconds
      const nextYear = new Date(Date.now() + oneYearInMilliseconds);
      document.cookie = `${novin_AB_cookie}=${generateRandom()}; expires=${nextYear.toUTCString()}; path=/`;
    } catch (error) {
      console.error('Error: ', error);
    }
  } else {
    //console.log("novin_AB_cookie already exists.");
  }
}

async function sendPageViewEvent() {
  try {
    const anonymous_id_cookie = "novinAnonymousId";
    var properties = {
      "fullUrl": window.location.href,
      "protocol": window.location.protocol,
      "hostName": window.location.hostname,
      "pathName": window.location.pathname,
      "search": window.location.search,
      "hash": window.location.hash
    };
    const body = {
      "anonymousId": getCookieValue(anonymous_id_cookie),
      "name": "pageView",
      "properties": properties
    };
    const res = await sendEvent(body);
    //console.log("res status: ", res);
    if (res == "no user with this userId") {  // حالتی که از دیتابیس، کاربر پاک شده و نیست
      //const prevAnonymousId = body.userId;
      const anonymousUser = await postAnonymousUser();
      //console.log("anonymousUser: ", anonymousUser._id);
      body.userId = anonymousUser._id;
      //body.anonymousId = prevAnonymousId;
      const value = anonymousUser._id;
      const oneYearInMilliseconds = 31536000000; // One year in milliseconds
      const nextYear = new Date(Date.now() + oneYearInMilliseconds);
      document.cookie = `${anonymous_id_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`;
      await sendEvent(body);

    }

  } catch (error) {
    console.error('Error while posting first visit event:', error);
  }

}

async function checkFirstVisitcookie() {
  const novin_first_visit_cookie = "novin_first_visit";
  const anonymous_id_cookie = "novinAnonymousId";
  var properties = {
    "Operating System": navigator.platform,
    "Device": navigator.userAgent,
    "Browser": `${navigator.appName} (${navigator.appVersion})`,
  };
  // Geolocation information
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        properties.Geolocation = `Latitude: ${latitude}, Longitude: ${longitude}`;
      },
      error => {
        console.error('Error getting geolocation:', error);
      }
    );
  } else {
    //console.log('Geolocation', 'Geolocation not supported');
  }

  if (!hasCookie(novin_first_visit_cookie) || !getCookieValue(novin_first_visit_cookie)) {
    try {
      const body = {
        "userId": getCookieValue(anonymous_id_cookie),
        "name": "first_visit",
        "properties": properties
      };
      await sendEvent(body);
      const value = "true";
      const oneYearInMilliseconds = 31536000000; // One year in milliseconds
      const nextYear = new Date(Date.now() + oneYearInMilliseconds);
      document.cookie = `${novin_first_visit_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`;
    } catch (error) {
      console.error('Error while posting first visit event:', error);
    }
  } else {
    //console.log("novin_first_visit_cookie Cookie already exists.");
  }
}

// Cookie utility functions
function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function eraseCookie(name) {
  document.cookie = name + '=; Max-Age=-99999999; path=/';
}
function handlenovinSessionCount() {
  var novinSession = sessionStorage.getItem('novinSession');
  let sessionCount = parseInt(getCookie('novinSessionCount')) ? parseInt(getCookie('novinSessionCount')) : 0;
  if (novinSession != 'true') {
    sessionCount += 1;
    setCookie('novinSessionCount', sessionCount, 365);
  }
  sessionStorage.setItem('novinSession', 'true');
  return sessionCount;
}

// Function to handle page view count
function handlenovinPageViewCount() {
  const pc = parseInt(getCookie('novinPageCount')) ? parseInt(getCookie('novinPageCount')) : 0;
  let pageCount = pc + 1;
  setCookie('novinPageCount', pageCount, 365);
  return pageCount;
}



global.novin = {
  // init: async function (project) {  // init function is called from the sdk
  //   await checkABCookie();
  //   // initializeProjectId(project.novinProjectId);
  //   initializeProjectId(novinProjectId);
  //   await checkAnonymousCookie();
  //   //await sendPageViewEvent();
  //   //await checkFirstVisitcookie();

  // },
  callFirebase: function () {
    loadFirebaseScripts().then(initializeFirebase).catch((error) => {
      console.error('Error loading Firebase scripts:', error);
    });
  },
  getVersion: function () {
    return "1.2.2";
  },
  user: {
    getUser: async function () {
      const res = await getUser();
      return res;
    },
    getUserId: async function () {
      return await getUserId();
    },
    getAnonymousId: function () {
      return getAnonymousId();
    },
    getABType: function () {
      return getABType();
    },
    isaAccessibe: async function () {
      return await isaAccessibe();
    },
    setAttributes: async function (body) {
      return await setAttributes(body);
    },
    addWebPushToken: async function (body) {
      return await addWebPushToken(body);
    },
    findByMobile: async function (mobile) {
      return await findByMobile(mobile);
    },
    findByEmail: async function (email) {
      return await findByEmail(email);
    },
    isIdentified: async function () {
      return await isIdentified();
    },
    hasWebPush: async function () {
      return await hasWebPush();
    },
    getRecs: async function () {
      return await getRecs();
    }
  },
  event: {
    send: async function (body) {
      return await sendEvent(body);
    },
    getFirstEvent: async function (body) {
      return await getFirstEvent(body);
    },
    getLastEvent: async function (body) {
      return await getLastEvent(body);
    }
  },
  funcs: {
    persianToEnglish: function (number) {
      return number.replace(/[\u0660-\u0669]/g, function (c) {
        return c.charCodeAt(0) - 0x0660;
      }).replace(/[\u06f0-\u06f9]/g, function (c) {
        return c.charCodeAt(0) - 0x06f0;
      });
    },
    validateEmail: function (email) {
      // Regular expression for validating email addresses
      var regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(email);
    },
    validateMobile: function (mobileNumber) {
      // Define the regex pattern for the required format
      var pattern = /^09\d{9}$/;

      // Test the mobile number against the pattern
      if (pattern.test(mobileNumber)) {
        return true;
      } else {
        return false;
      }
    },
    validURL: function (str) {
      var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
      return !!pattern.test(str);
    },
    setCookie: function (name, value, days) {
      return setCookie(name, value, days);
    },
    getCookie: function (name) {
      return getCookie(name);
    },
    eraseCookie: function (name) {
      return eraseCookie(name);
    },
    sessionCount: function () {
      return sessionCount;
    },
    pageViewCount: function () {
      return pageViewCount;
    }
  },

};

module.exports = getCookieValue;




