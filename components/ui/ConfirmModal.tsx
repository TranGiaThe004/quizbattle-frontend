// quizbattle-frontend/components/ui/ConfirmModal.tsx
"use client";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, isLoading }: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel} 
            disabled={isLoading}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
          >
            Hủy
          </button>
          <button 
            onClick={onConfirm} 
            disabled={isLoading}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:bg-red-400"
          >
            {isLoading ? "Đang xóa..." : "Xác nhận Xóa"}
          </button>
        </div>
      </div>
    </div>
  );
}