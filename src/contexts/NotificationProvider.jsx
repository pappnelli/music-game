import { useState, useCallback } from "react";
import { NotificationContext } from "./NotificationContext";
import Notification from "../ui/Notification";

const DISPLAY_TIME = 5000;
const FADE_DURATION = 200;

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  const notify = useCallback((type, message) => {
    const id = crypto.randomUUID();

    setNotifications((prev) => [...prev, { id, type, message, fade: false }]);

    setTimeout(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, fade: true } : n)));
    }, DISPLAY_TIME - FADE_DURATION);

    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, DISPLAY_TIME);
  }, []);

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}

      <div className="notification-container">
        {notifications.map((n) => (
          <Notification
            key={n.id}
            type={n.type}
            fade={n.fade}
            onClose={() => {
              setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, fade: true } : x)));

              setTimeout(() => {
                setNotifications((prev) => prev.filter((x) => x.id !== n.id));
              }, FADE_DURATION);
            }}
          >
            {n.message}
          </Notification>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}
