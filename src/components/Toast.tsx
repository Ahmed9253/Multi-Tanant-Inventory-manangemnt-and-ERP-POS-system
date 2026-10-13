import type { Toast } from "../types";

type Props = {
  toasts: Toast[];
  onDismiss: (id: number) => void;
};

const icons: Record<Toast["kind"], string> = {
  success: "✓",
  error: "✕",
  info: "ℹ",
};

export function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.kind}`}
          onClick={() => onDismiss(toast.id)}
          role="alert"
        >
          <span className="toast-icon">{icons[toast.kind]}</span>
          <span className="toast-text">{toast.text}</span>
        </div>
      ))}
    </div>
  );
}
