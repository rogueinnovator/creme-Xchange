"use client";
import React, { useEffect, useState } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
    message: string;
    type?: ToastType;
    duration?: number;
    onClose?: () => void;
}

const Toast: React.FC<ToastProps> = ({
    message,
    type = 'info',
    duration = 3000,
    onClose,
}) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onClose?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    if (!isVisible) return null;

    const typeStyles = {
        success: 'bg-emerald-50 border-emerald-500 text-emerald-700',
        error: 'bg-rose-50 border-rose-500 text-rose-700',
        warning: 'bg-amber-50 border-amber-500 text-amber-700',
        info: 'bg-blue-50 border-blue-500 text-blue-700',
    };

    const iconMap = {
        success: (
            <svg
                className="w-5 h-5 text-emerald-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                />
            </svg>
        ),
        error: (
            <svg
                className="w-5 h-5 text-rose-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                />
            </svg>
        ),
        warning: (
            <svg
                className="w-5 h-5 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
            </svg>
        ),
        info: (
            <svg
                className="w-5 h-5 text-blue-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`flex items-center p-4 rounded-lg border-l-4 shadow-lg ${typeStyles[type]} animate-fade-in-up`}
            >
                <div className="mr-3">{iconMap[type]}</div>
                <div className="text-sm font-medium">{message}</div>
                <button
                    onClick={() => setIsVisible(false)}
                    className="ml-4 text-gray-400 hover:text-gray-500"
                >
                    <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
};

// Toast Provider and Hook
interface ToastProviderProps {
    children: React.ReactNode;
}

type ToastOptions = Omit<ToastProps, 'message'>;

const ToastContext = React.createContext<{
    showToast: (message: string, options?: ToastOptions) => void;
}>({
    showToast: () => { },
});

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
    const [toasts, setToasts] = useState<ToastProps[]>([]);

    const showToast = (message: string, options?: ToastOptions) => {
        const newToast = { message, ...options };
        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast !== newToast));
        }, options?.duration || 3000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2">
                {toasts.map((toast, index) => (
                    <Toast
                        key={index}
                        message={toast.message}
                        type={toast.type}
                        duration={toast.duration}
                        onClose={() =>
                            setToasts((prev) => prev.filter((t) => t !== toast))
                        }
                    />
                ))}
            </div>
        </ToastContext.Provider>
    );
};
export const useToast = () => React.useContext(ToastContext);