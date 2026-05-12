import { Timer, ListFilter, Edit2, Trash2, CheckCircle2 } from "lucide-react";

// Định nghĩa lại kiểu dữ liệu khớp với API Backend
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
}

export default function QuestionCard({ question, index }: QuestionCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border-2 border-outline-variant flex gap-6 items-start hover:border-primary transition-all question-card-shadow mb-4">
      <div className="bg-primary text-white w-12 h-12 rounded-lg flex items-center justify-center shrink-0 font-headline text-2xl font-bold">
        {index + 1}
      </div>

      <div className="flex-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-headline text-lg text-on-surface">
            {question.question_text} {/* Đổi thành question_text */}
          </h3>
          <div className="flex gap-2">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors hover:bg-surface-container rounded-lg">
              <Edit2 size={18} />
            </button>
            <button className="p-2 text-on-surface-variant hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          <span className="flex items-center gap-1 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
            <Timer size={14} /> {question.time_limit_seconds}s{" "}
            {/* Đổi thành time_limit_seconds */}
          </span>
          <span className="flex items-center gap-1 text-on-surface-variant text-xs font-bold uppercase tracking-wider">
            <ListFilter size={14} /> {question.question_type}{" "}
            {/* Đổi thành question_type */}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {question.options.map((option) => (
            <div
              key={option.id}
              className={`px-4 py-3 rounded-lg border flex items-center gap-2 transition-all ${
                option.is_correct // Đổi thành is_correct
                  ? "bg-tertiary-fixed text-on-tertiary-fixed border-tertiary-fixed-dim"
                  : "bg-surface-container border-outline-variant text-on-surface-variant"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  option.is_correct ? "bg-tertiary" : "bg-red-400"
                }`}
              />
              <span className={option.is_correct ? "font-bold" : ""}>
                {option.option_text} {option.is_correct && "(Correct)"}{" "}
                {/* Đổi thành option_text */}
              </span>
              {option.is_correct && (
                <CheckCircle2 size={14} className="ml-auto text-tertiary" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
