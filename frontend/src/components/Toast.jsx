export default function Toast({ type = 'info', message, onClose }) {
  if (!message) return null;
  return (
    <div className={`toast toast-${type}`}>
      <span>{message}</span>
      {onClose && (
        <button className="toast-close" onClick={onClose} aria-label="Close">
          &times;
        </button>
      )}
    </div>
  );
}
