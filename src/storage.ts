const prefix = "widgeto-cdp-sdk.";

const storage = {
  setItem(key: string, value: string) {
    return localStorage.setItem(prefix + key, value);
  },

  getItem(key: string) {
    return localStorage.getItem(prefix + key);
  },
};

export default storage;
