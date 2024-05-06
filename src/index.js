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
  initializeProjectId
} from "./apiClient";


// importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
// importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

// firebase.initializeApp({
//   apiKey: "AIzaSyC-OiM2fQkAOBIAVPt9N0VV-Jjor9pKAnI",
//   authDomain: "novinmarketing-4a99a.firebaseapp.com",
//   projectId: "novinmarketing-4a99a",
//   storageBucket: "novinmarketing-4a99a.appspot.com",
//   messagingSenderId: "1037825539844",
//   appId: "1:1037825539844:web:7b6691760ec561cc71da51",
//   measurementId: "G-LBGEBGS73Y"
// });

// const messaging = firebase.messaging();

// messaging.onBackgroundMessage(function(payload) {
//   console.log('[firebase-messaging-sw.js] Received background message ', payload);

//   // Customize notification using payload data
//   const notificationTitle = payload.data.title || 'Background Message Title';
//   const notificationOptions = {
//     body: payload.data.body || 'Background Message body.',
//     icon: payload.data.icon || '/firebase-logo.png'
//   };

//   self.registration.showNotification(notificationTitle, notificationOptions);
// });

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

async function checkAnonymousCookie(){
  const anonymous_id_cookie = "novin_anonymous_id";
  if (!hasCookie(anonymous_id_cookie) || !getCookieValue(anonymous_id_cookie)) {
    try {
      const anonymousUser = await postAnonymousUser();
      const value = anonymousUser._id;
      console.log("anonymousId: ",value);
      const oneYearInMilliseconds = 31536000000; // One year in milliseconds
      const nextYear = new Date(Date.now() + oneYearInMilliseconds);
      console.log(`${anonymous_id_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`);
      document.cookie = `${anonymous_id_cookie}=${value}; expires=${nextYear.toUTCString()}; path=/`;
      console.log("Cookie novin_anonymous_id: "+getCookieValue(anonymous_id_cookie)+" added.");
    } catch (error) {
      console.error('Error while getting anonymous user from server:', error);
    }
  } else {
    console.log("anonymous_id_cookie Cookie already exists.");
  }
  
}

async function checkFirstVisitcookie(){
  const novin_first_visit_cookie = "novin_first_visit";
  const anonymous_id_cookie = "novin_anonymous_id";
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
        properties.Geolocation= `Latitude: ${latitude}, Longitude: ${longitude}`;
        },
        error => {
          console.error('Error getting geolocation:', error);
        }
      );
    } else {
      console.log('Geolocation', 'Geolocation not supported');
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
    console.log("novin_first_visit_cookie Cookie already exists.");
  }
}



global.novin = {
  init: async function(project) {
    initializeProjectId(project.novinProjectId);
    await checkAnonymousCookie();
    await checkFirstVisitcookie();
  },
  getVersion: function() { 
    return "1.2.2";
  },
  user: {
      getUser: async function() {        
          return await getUser(); 
      },
      getUserId: async function() {         
           return await getUserId(); 
      },
      getAnonymousId: function() {
        return getAnonymousId();
      },
      isaAccessibe: async function() {
        return await isaAccessibe();
      },
      setAttributes: async function(body) {
        return await setAttributes(body);
      },
      findByMobile: async function(mobile) {
        return await findByMobile(mobile);
      },
      findByEmail: async function(email) {
        return await findByEmail(email);
      },
      isIdentified: async function() {
        return await isIdentified();
      },
  },
  event: {
    send: async function(body) {         
         return await sendEvent(body); 
    }
  },
  funcs: {
    persianToEnglish: function(number) {         
         return number.replace(/[\u0660-\u0669]/g, function (c) {
          return c.charCodeAt(0) - 0x0660;
      }).replace(/[\u06f0-\u06f9]/g, function (c) {
         return c.charCodeAt(0) - 0x06f0;
     }); 
    },
    validateEmail: function(email){
      // Regular expression for validating email addresses
      var regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(email);
    },
    validateMobile: function(mobile){
      var regex = new RegExp("^(\\+98|0)?9\\d{9}$");
      return regex.test(mobile);
    }
  },
  // webPush: {
  //   get: function() {         
  //     Notification.requestPermission().then((permission) => {
  //       if (permission === "granted") {
  //         console.log("Notification permission granted.");
  //         // Get the token
  //         messaging.getToken().then((token) => {
  //         if (token) {
  //           console.log("Token:", token);
  //         } else {
  //           console.log("No token received.");
  //         }
  //         }).catch((error) => {
  //         console.error("Error getting token:", error);
  //         });
  //       } else {
  //         console.log("Notification permission denied.");
  //       }
  //       }).catch((error) => {
  //       console.error("Unable to request permission for notifications:", error);
  //       }); 
  //   }
  // }
};

module.exports = getCookieValue;




