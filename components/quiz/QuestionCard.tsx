"use client";
import { useState } from "react";
import { Timer, ListFilter, Edit2, Trash2, CheckCircle2 } from "lucide-react";
import ConfirmModal from "@/components/ui/ConfirmModal";
import EditQuestionModal from "./EditQuestionModal"; // IMPORT MODAL SỬA CÂU HỎI
import { fetchWithAuth } from "@/lib/fetchApi";

interface QuestionOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}
interface Question {
  id: number;
  question_text: string;
  question_type: string;
  time_limit_seconds: number;
  options: QuestionOption[];
}
interface QuestionCardProps {
  question: Question;
  index: number;
  onDeleteSuccess?: () => void;
}

export default function QuestionCard({
  question,
  index,
  onDeleteSuccess,
}: QuestionCardProps) {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/v1/questions/${question.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        setIsDeleteOpen(false);
        if (onDeleteSuccess) onDeleteSuccess();
      } else {
        alert("Lỗi: Không có quyền xóa!");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="bg-white p-6 rounded-xl border-2 border-outline-variant flex gap-6 items-start hover:border-primary transition-all question-card-shadow mb-4">
        <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center shrink-0 font-headline text-2xl font-bold">
          {index + 1}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-headline text-lg text-on-surface">
              {question.question_text}
            </h3>
            <div className="flex gap-2">
              {/* NÚT EDIT */}
              <button
                onClick={() => setIsEditOpen(true)}
                className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-lg"
              >
                <Edit2 size={18} />
              </button>
              {/* NÚT DELETE */}
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="p-2 text-on-surface-variant hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>

          <div className="flex gap-4 mb-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Timer size={14} /> {question.time_limit_seconds}s
            </span>
            <span className="flex items-center gap-1">
              <ListFilter size={14} /> {question.question_type}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {question.options.map((option) => (
              <div
                key={option.id}
                className={`px-4 py-3 rounded-lg border flex items-center gap-2 transition-all ${option.is_correct ? "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim" : "bg-surface-container border-outline-variant text-on-surface-variant"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${option.is_correct ? "bg-tertiary" : "bg-red-400"}`}
                />
                <span className={option.is_correct ? "font-bold" : ""}>
                  {option.option_text}
                </span>
                {option.is_correct && (
                  <CheckCircle2 size={14} className="ml-auto text-tertiary" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NHÚNG 2 CÁI MODAL VÀO COMPONENT */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        title="Xóa câu hỏi?"
        message="Bạn có chắc chắn muốn xóa câu hỏi này?"
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteOpen(false)}
        isLoading={isDeleting}
      />
      <EditQuestionModal
        questionId={question.id}
        initialText={question.question_text}
        initialTime={question.time_limit_seconds}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSuccess={() => onDeleteSuccess && onDeleteSuccess()}
      />
    </>
  );
}
