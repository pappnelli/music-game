"use client";

import { persistor, store } from "@/lib/store";
import { ReactNode } from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/lib/integration/react";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return <Provider store={store}><PersistGate loading={null} persistor={persistor}>{children}</PersistGate></Provider>;
}
