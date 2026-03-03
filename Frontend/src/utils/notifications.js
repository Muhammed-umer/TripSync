// src/utils/notifications.js
export const requestNotificationPermission = () => {
  if ("Notification" in window) {
    Notification.requestPermission();
  }
};

export const showNotification = (title, body, icon = "/logo192.png") => {
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body,
      icon,
      silent: false,
    });
  }
};