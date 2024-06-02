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
  addWebPushToken
} from "./apiClient";

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
      //console.log("anonymousId: ", value);
      const oneYearInMilliseconds = 31536000000; // One year in milliseconds
      const nextYear = new Date(Date.now() + oneYearInMilliseconds);
      //console.log(`${anonymous_id_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`);
      document.cookie = `${anonymous_id_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`;
      //console.log("Cookie novinAnonymousId: " + getCookieValue(anonymous_id_cookie) + " added.");
    } catch (error) {
      console.error('Error while getting anonymous user from server:', error);
    }
  } else {
    //console.log("anonymous_id_cookie Cookie already exists.");
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
      "protocol":window.location.protocol,
      "hostName": window.location.hostname,
      "pathName": window.location.pathname,
      "search": window.location.search,
      "hash": window.location.hash 
    };
    const body = {
      "userId": getCookieValue(anonymous_id_cookie),
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


global.novin = {
  init: async function (project) {  // init function is called from the sdk
    await checkABCookie();
    initializeProjectId(project.novinProjectId);
    await checkAnonymousCookie();
    await sendPageViewEvent();
    //await checkFirstVisitcookie();

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
    validateMobile: function (mobile) {
      var regex = new RegExp("^(\\+98|0)?9\\d{9}$");
      return regex.test(mobile);
    }
  },

};

module.exports = getCookieValue;




