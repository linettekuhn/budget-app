import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import AppModal from "../ui/modal/modal";

// stores the open and close functions as values available to all children of context
type ModalContextType = {
  openModal: (content: ReactNode) => void;
  closeModal: () => void;
};
const ModalContext = createContext<ModalContextType | null>(null);

// component to give access to children so they can open/close modal
export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [showModal, setShowModal] = useState(false);
  const [content, setContent] = useState<ReactNode>(null);

  const openModal = useCallback((content: ReactNode) => {
    setContent(content);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setContent(null);
    setShowModal(false);
  }, []);

  const contextValue = useMemo(
    () => ({ openModal, closeModal }),
    [openModal, closeModal]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      <AppModal onClose={closeModal} visible={showModal}>
        {content}
      </AppModal>
    </ModalContext.Provider>
  );
};

// returns open/close modal functions if called within context provider
export const useContextModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    console.log("no context");
    throw new Error("useModal must be used within ModalProvider");
  }
  return context;
};
