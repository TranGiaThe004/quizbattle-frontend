"use client";

import { useEffect, useState } from "react";

export default function QuizzesPage() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem("access_token");

      try {
        const response = await fetch("http://127.0.0.1:8000/api/v1/quizzes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        // [FIX LỖI TẠI ĐÂY]
        // Kiểm tra xem data có phải là cục object bọc mảng ở trong hay không
        // Thường fastapi sẽ trả về nằm trong key 'data' hoặc 'items'
        if (data && Array.isArray(data.data)) {
          setQuizzes(data.data);
        } else if (Array.isArray(data)) {
          // Nếu backend trả thẳng mảng thì gán luôn
          setQuizzes(data);
        } else {
          console.warn("Dữ liệu API không đúng định dạng mong muốn:", data);
          // Có thể data.quizzes hoặc key nào đó khác tuỳ cấu trúc backend của bạn
        }
      } catch (error) {
        console.error("Lỗi khi tải Quiz:", error);
      }
    };

    fetchQuizzes();
  }, []);

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-5">Danh sách Quiz</h1>

      <div className="grid gap-5">
        {/* [FIX LỖI TẠI ĐÂY] Thêm dấu ?. để an toàn nếu quizzes vô tình bị null/undefined */}
        {quizzes?.map((quiz: any) => (
          <div
            key={quiz.id}
            className="border p-5 rounded shadow-sm hover:shadow-md transition-shadow"
          >
            <h2 className="text-xl font-bold text-primary">{quiz.title}</h2>
            <p className="text-on-surface-variant mt-2">
              {quiz.description || "Không có mô tả"}
            </p>
          </div>
        ))}

        {/* Xử lý trường hợp không có quiz nào */}
        {(!quizzes || quizzes.length === 0) && (
          <p className="text-gray-500 italic">
            Hiện tại bạn chưa tạo Quiz nào.
          </p>
        )}
      </div>
    </div>
  );
}
