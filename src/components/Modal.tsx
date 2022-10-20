import ReactDOM from "react-dom";

interface IProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
}

const Modal = ({ children, isOpen, onClose }: IProps) => {
  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div
      id="confirm-container"
      onClick={onClose}
      className="absolute top-0 left-0 flex h-full w-full place-content-center bg-transparent bg-slate-300"
    >
      <div className="h-fill w-fill place-self-center rounded-lg bg-white p-4 shadow-lg">
        {children}
        <br />
        <button onClick={onClose}>Exit</button>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
