import { useState } from "react";
import { SettingsContext } from "./SettingsContext";

export function SettingsProvider({ children }) {
  const [savedSettings, setSavedSettings] = useState(() => {
    const stored = localStorage.getItem("settingsState");
    return stored ? JSON.parse(stored) : null;
  });

  const [draftSettings, setDraftSettings] = useState(() => {
    const stored = localStorage.getItem("settingsState");
    return stored ? JSON.parse(stored) : null;
  });

  const loadSettings = (settings) => {
    setSavedSettings(settings);
    setDraftSettings(settings);
    localStorage.setItem("settingsState", JSON.stringify(settings));
  };

  const updateDraft = (patch) => {
    setDraftSettings((prev) => ({ ...prev, ...patch }));
  };

  const saveChanges = () => {
    setSavedSettings(draftSettings);
    localStorage.setItem("settingsState", JSON.stringify(draftSettings));
  };

  const discardChanges = () => {
    setDraftSettings(savedSettings);
  };

  const isDirty = savedSettings && draftSettings ? JSON.stringify(savedSettings) !== JSON.stringify(draftSettings) : false;

  return (
    <SettingsContext.Provider
      value={{
        savedSettings,
        draftSettings,
        loadSettings,
        updateDraft,
        saveChanges,
        discardChanges,
        isDirty,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
