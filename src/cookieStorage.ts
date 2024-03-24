const cookieStorage = {
  getCookieValue(targetKey: string) {
    const pairs = document.cookie.split(";");
    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i].trim();
      const indexOfEqualSign = pair.indexOf("=");
      const key = pair.slice(0, indexOfEqualSign);
      const value = pair.slice(indexOfEqualSign + 1);
      if (key === targetKey) return value;
    }
    return null;
  },
};

export default cookieStorage;
