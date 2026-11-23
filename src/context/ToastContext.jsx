import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
const ToastContext = createContext(void 0);
const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const showToast = useCallback((message, type = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  }, [removeToast]);
  return <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => {
    let bgColor = "bg-slate-900 border-slate-700 text-slate-100";
    let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;
    if (toast.type === "success") {
      bgColor = "bg-slate-900 border-emerald-500/50 text-slate-100";
      icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
    } else if (toast.type === "error") {
      bgColor = "bg-slate-900 border-rose-500/50 text-slate-100";
      icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
    } else if (toast.type === "warning") {
      bgColor = "bg-slate-900 border-amber-500/50 text-slate-100";
      icon = <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    }
    return <div
      key={toast.id}
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all duration-200 animate-in slide-in-from-bottom-5 ${bgColor}`}
    >
              {icon}
              <p className="text-sm font-medium flex-1 pt-0.5 leading-snug">{toast.message}</p>
              <button
      type="button"
      onClick={() => removeToast(toast.id)}
      className="text-slate-400 hover:text-slate-200 transition-colors p-1"
      aria-label="Close notification"
    >
                <X className="w-4 h-4" />
              </button>
            </div>;
  })}
      </div>
    </ToastContext.Provider>;
};
const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
export {
  ToastProvider,
  useToast
};
