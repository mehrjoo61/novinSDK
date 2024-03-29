import { io } from "socket.io-client";
import cookieStorage from "./cookieStorage";
import { registerEvent } from "./events";
import { generateId } from "./utils";

declare global {
  interface Window {
    cdpProjectId?: string;
  }
}

// function showNotification(title: string, options?: NotificationOptions) {
//   Notification.requestPermission().then(() => {
//     if (Notification.permission === "granted") new Notification(title, options);
//   });
// }

if (window.cdpProjectId) {
  const key = "cdp_user_id";

  const userId = cookieStorage.getCookieValue(key);
  const oneYearInMilliseconds = 31_536_000_000;
  const nextYear = new Date(Date.now() + oneYearInMilliseconds);
  if (!userId)
    document.cookie = `${key}=${generateId(20)}; expires=${nextYear}; path=/`;

  registerEvent({
    userId: cookieStorage.getCookieValue(key) as string,
    name: "page_view",
    properties: { pageUrl: window.location.href },
  });

  io(process.env.API_URL!, {
    query: {
      projectId: window.cdpProjectId,
      userId: cookieStorage.getCookieValue(key),
    },
  });
}
