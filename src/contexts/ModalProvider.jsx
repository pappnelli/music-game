import { useEffect, useState } from "react";
import { ModalContext } from "./ModalContext";

export function ModalProvider({ children }) {
  const [modalContent, setModalContent] = useState(null);

  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  useEffect(() => {
    if (modalContent) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => (document.body.style.overflow = "");
  }, [modalContent]);

  return (
    <ModalContext.Provider value={{ openModal, closeModal }}>
      {children} {modalContent}
    </ModalContext.Provider>
  );
}
