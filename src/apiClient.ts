import axios from "axios";

const projectId = "65f5e6d61f66367b48fe99eb";

const apiClient = axios.create({
  baseURL: `${process.env.API_URL}/projects/${projectId}`,
});

export default apiClient;
