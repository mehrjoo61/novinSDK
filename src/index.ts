import cookieStorage from "./cookieStorage";
import { registerEvent } from "./events";
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
  if (!userId)
    document.cookie = `${key}=${generateId(20)}; expires=${new Date(
      Date.now() + oneYearInMilliseconds
    )}; path=/`;

  registerEvent({
    userId: cookieStorage.getCookieValue(key) as string,
    name: "page_view",
    properties: { pageUrl: window.location.href },
  });
}
