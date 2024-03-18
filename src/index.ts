import { registerEvent } from "./events";
import storage from "./storage";
import { generateId } from "./utils";

console.log("CDP script loaded :)");

const userId = storage.getItem("user_id");
if (!userId) storage.setItem("user_id", generateId(20));

registerEvent({
  userId: storage.getItem("user_id") as string,
  name: "page_view",
  properties: { pageUrl: window.location.href },
});
