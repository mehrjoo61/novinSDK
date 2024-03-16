import apiClient from "./apiClient";

interface Event {
  userId: string;
  name: string;
  properties?: { [key: string]: any };
}

export const registerEvent = (event: Event) => {
  try {
    apiClient.post("/events", event);
  } catch (error) {}
};
