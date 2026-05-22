import { useContext } from "react";
import { NotificationContext } from "./NotificationContext";

export function useNotify() {
  return useContext(NotificationContext).notify;
}
