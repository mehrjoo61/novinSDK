const axios = require('axios');


function getCookieValue(key) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.startsWith(key + '=')) {
      return cookie.substring(key.length + 1);
    }
  }
}

// const localTest = true;
apiClient = axios.create({
  //baseURL: 'http://localhost:3000/api', // Your API base URL   
  baseURL: 'https://cdp.novin.marketing/api',
  timeout: 5000, // Request timeout in milliseconds (optional)
});

let projectId;
let body;
let novinAB;
async function initializeProjectId() {
  novinAB = getCookieValue("novin-AB");
  projectId = getCookieValue('novinProjectId');
  body = {
    "projectId": projectId,
    "novinAB": {
      "value": novinAB
    }
  };
}


async function postAnonymousUser() {
  try {
    const response = await apiClient.post('/users/anonymousUser', {
      "projectId": getCookieValue('novinProjectId')});
    return response.data;
  } catch (error) {
    await axios.post('https://cdp.novin.marketing/api/events/log', { "SDK Error Log: ": "Error postAnonymousUser:" + error.message });
    throw error;
  }
}


async function getUser() {
  try {
    const anonymous_id_cookie = "novinAnonymousId";
    //const response = await apiClient.post('/users/getUser/6638e243e8a67bf19a6239e1', body);
    const response = await apiClient.post('/users/getUser/' + getCookieValue(anonymous_id_cookie), body);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}


async function getUserId() {
  try {
    const response = await getUser();
    return response.userId !== undefined ? response.userId : null;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function isIdentified() {
  try {
    const response = await getUser();
    return response.userId == null ? false : true;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

function getAnonymousId() {
  const anonymous_id_cookie = "novinAnonymousId";
  return getCookieValue(anonymous_id_cookie);
}

function getABType() {
  const novinAB = "novin-AB";
  return getCookieValue(novinAB);
}

async function isaAccessibe() {
  try {
    const response = await getUser();
    if (response.email || response.mobile)
      return true;
    else
      return false;

  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function setAttributes(sendBody) {
  try {
    const anonymous_id_cookie = "novinAnonymousId";
    if (!sendBody.userId) {
      sendBody.anonymousId = getCookieValue(anonymous_id_cookie);
    }

    if (!sendBody.projectId) {
      sendBody.projectId = projectId;
    }

    const response = await apiClient.post('/users/anonymousUser', sendBody);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function addWebPushToken(sendBody) {
  try {
    const anonymous_id_cookie = "novinAnonymousId";
    if (!sendBody.userId) {
      sendBody.anonymousId = getCookieValue(anonymous_id_cookie);
    }

    if (!sendBody.projectId) {
      sendBody.projectId = projectId;
    }
    // console.log(userBody);
    const response = await apiClient.post('/users/addWebPushToken', sendBody);
    return response.data;
  } catch (error) {
    await axios.post('https://cdp.novin.marketing/api/events/log', { "SDK Error Log: ": "Error addWebPushToken:" + error.message });
    throw error;
  }
}

async function sendEvent(sendBody) {
  try {

    const anonymous_id_cookie = "novinAnonymousId";
    sendBody.anonymousId = getCookieValue(anonymous_id_cookie);
    if (!sendBody.projectId) {
      sendBody.projectId = projectId;
    }
    // console.log("sendBody: ", sendBody);
    // if(!sendBody.origin){
    //   sendBody.origin = window.location.hostname;
    // }
    const response = await apiClient.post('/events/send', sendBody);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}



async function getFirstEvent(sendBody) {
  try {

    const anonymous_id_cookie = "novinAnonymousId";
    if (!sendBody.userId) {
      sendBody.userId = getCookieValue(anonymous_id_cookie);
    }
    if (!sendBody.projectId) {
      sendBody.projectId = projectId;
    }
    const response = await apiClient.post('/events/getFirstEvent', sendBody);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function getLastEvent(sendBody) {
  try {

    const anonymous_id_cookie = "novinAnonymousId";
    if (!sendBody.userId) {
      sendBody.userId = getCookieValue(anonymous_id_cookie);
    }
    if (!sendBody.projectId) {
      sendBody.projectId = projectId;
    }
    const response = await apiClient.post('/events/getLastEvent', sendBody);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function findByMobile(mobile) {
  try {
    //console.log(body);
    const response = await apiClient.post('/users/findUserByMobile/' + mobile, body);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function findByEmail(email) {
  try {
    const response = await apiClient.post('/users/findUserByEmail/' + email, body);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
} 

async function getRecs() {
  try {
    body.productsNum = 20;
    body.anonymousId = getCookieValue("novinAnonymousId");
    const response = await apiClient.post('/users/getUserRecsFrontEnd', body);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}


module.exports = {
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
};
