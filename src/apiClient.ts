import axios from "axios";

// @ts-ignore
const projectId = window.cdpProjectId;

const apiClient = axios.create({
  baseURL: `${process.env.API_URL}/projects/${projectId}`,
});

export default apiClient;
