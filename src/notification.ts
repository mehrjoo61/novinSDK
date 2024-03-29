function showNotification(title: string, options?: NotificationOptions) {
  Notification.requestPermission().then(() => {
    if (Notification.permission === "granted") new Notification(title, options);
  });
}

const notification = { showNotification };

export default notification;
