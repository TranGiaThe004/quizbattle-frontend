"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Quiz {
  id: number;
  title: string;
  description: string;
  is_public: boolean;
}

export default function LibraryPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/quizzes/public-quizzes`
    )
      .then((res) => res.json())
      .then((data) => setQuizzes(data))
      .catch((err) => console.error("Error fetching quizzes:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-4xl font-bold mb-6">
        Public Quiz Library
      </h1>

      {quizzes.length === 0 ? (
        <div className="text-center text-gray-400 py-20">
          Chưa có quiz nào được công khai
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white border border-gray-200 rounded-2xl p-5
                         shadow-sm hover:shadow-lg transition"
            >
              <h2 className="text-xl font-bold line-clamp-2">{quiz.title}</h2>
              <p className="mt-2 text-gray-500 text-sm line-clamp-3">
                {quiz.description || "Không có mô tả"}
              </p>
              <button
                onClick={() => router.push(`/rooms/create?quizId=${quiz.id}`)}
                className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700
                           text-white py-2 rounded-xl font-semibold
                           transition text-sm"
              >
                Play Quiz
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}