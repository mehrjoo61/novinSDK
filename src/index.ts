import { io } from "socket.io-client";
import "url-change-event";
import cookieStorage from "./cookieStorage";
import { registerEvent } from "./events";
import notification from "./notification";
import { generateId } from "./utils";

declare global {
  interface Window {
    cdpProjectId?: string;
  }
}

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

  const socket = io(process.env.API_URL!, {
    query: {
      projectId: window.cdpProjectId,
      userId: cookieStorage.getCookieValue(key),
      currentPage: window.location.href,
    },
  });

  socket.on("notify", (data) => {
    notification.showNotification(data.title, { body: data.body });
  });

  window.addEventListener("urlchangeevent", async (e) => {
    console.log(e.newURL?.href);
    socket.emit("navigate", { url: e.newURL?.href });
  });
}
