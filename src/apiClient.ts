import axios from "axios";

const projectId = window.cdpProjectId;

const apiClient = axios.create({
  baseURL: `${process.env.API_URL}/projects/${projectId}`,
});

export default apiClient;
