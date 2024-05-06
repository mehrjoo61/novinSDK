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


apiClient = axios.create({
  //baseURL: 'http://localhost:3000/api', // Your API base URL   
  baseURL: 'https://cdp.novin.marketing/api',
  timeout: 5000, // Request timeout in milliseconds (optional)
});

let projectId;
let body;
function initializeProjectId(novinProjectId){
  projectId = novinProjectId;
  body = {"projectId": projectId,"origin": window.location.hostname};
}


async function postAnonymousUser() {
  try {
    console.log("projectId: ",projectId);
    const response = await apiClient.post('/users/anonymousUser', body);
    return response.data;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}



async function getUser() {
  try {
    const anonymous_id_cookie = "novin_anonymous_id";
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
    return response.data.userId? response.data.userId: null;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

async function isIdentified() {
  try {
    const response =await getUser();
    return response.userId == null? false: true;
  } catch (error) {
    console.error('Error:', error.message);
    throw error;
  }
}

function getAnonymousId() {
  const anonymous_id_cookie = "novin_anonymous_id"; 
  return getCookieValue(anonymous_id_cookie);
}

async function isaAccessibe() {
    try {
      const response =await getUser();
      if(response.email || response.mobile)
        return true;
      else
        return false;

    } catch (error) {
      console.error('Error:', error.message);
      throw error;
    }
  }

  async function setAttributes(userBody) {
    try {
      const anonymous_id_cookie = "novin_anonymous_id";
      if(!userBody.anonymousId)
        userBody.anonymousId = getCookieValue(anonymous_id_cookie);
      if(!userBody.projectId){
        userBody.projectId = projectId;
      }
      if(!userBody.origin){
        userBody.origin = window.location.hostname;
      }
      const response = await apiClient.post('/users/anonymousUser', userBody);
      return response.data;
      } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
  }

  async function sendEvent(sendBody) {
    try {

      const anonymous_id_cookie = "novin_anonymous_id";
      if(!sendBody.userId){
        sendBody.userId = getCookieValue(anonymous_id_cookie);
      }
      if(!sendBody.projectId){
        sendBody.projectId = projectId;
      }
      if(!sendBody.origin){
        sendBody.origin = window.location.hostname;
      }
      const response = await apiClient.post('/events/send', sendBody);
      return response.data;
      } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
  }


  async function findByMobile(mobile) {
    try {
      //console.log(body);
      const response = await apiClient.post('/users/findUserByMobile/'+mobile, body);
      return response.data;
      } catch (error) {
        console.error('Error:', error.message);
        throw error;
    }
  }

  async function findByEmail(email) {
    try {
      const response = await apiClient.post('/users/findUserByEmail/'+email, body);
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
  initializeProjectId
};
