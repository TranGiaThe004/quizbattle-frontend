// app/(main)/quizzes/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link"; // ĐÃ THÊM LẠI LINK
import { useRouter } from "next/navigation"; // ĐÃ THÊM LẠI ROUTER
import ConfirmModal from "@/components/ui/ConfirmModal"; // NẾU BẠN MUỐN DÙNG LẠI MODAL XÓA CỦA BẠN (Tùy chọn)

export default function QuizzesPage() {
  const router = useRouter();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  // Các state cho việc Xóa Quiz (để giữ lại chức năng của Leader ở Sprint 2)
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const fetchQuizzes = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
       router.push("/login");
       return;
    }

    try {
      // ĐÃ SỬA URL ĐỘNG TỪ BIẾN MÔI TRƯỜNG
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetch(`${apiUrl}/api/v1/quizzes`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Lỗi kết nối Server: ${response.status}`);
      }

      const data = await response.json();

      if (data && Array.isArray(data.data)) {
        setQuizzes(data.data);
      } else if (Array.isArray(data)) {
        setQuizzes(data);
      } else {
        console.warn("Dữ liệu API không đúng định dạng:", data);
      }
    } catch (err: any) {
      console.error("Lỗi khi tải Quiz:", err);
      setError(err.message || "Không thể kết nối đến máy chủ.");
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  // HÀM XÓA QUIZ CỦA LEADER SPRINT 2
  const handleDelete = async () => {
      if (!quizToDelete) return;
      setIsDeleting(true);
      try {
          const token = localStorage.getItem('access_token');
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const res = await fetch(`${apiUrl}/api/v1/quizzes/${quizToDelete}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
              setQuizzes(quizzes.filter(q => q.id !== quizToDelete));
              setQuizToDelete(null);
          } else {
              alert("Lỗi: Bạn không có quyền xóa bộ Quiz này!");
          }
      } catch(err) {
         alert("Lỗi khi kết nối Server.");
      } finally {
          setIsDeleting(false);
      }
  };

  return (
    <div className="p-10 max-w-4xl mx-auto pt-24">
      {/* ĐÃ THÊM LẠI KHU VỰC HEADER CÓ NÚT TẠO QUIZ */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b-2">
        <h1 className="text-3xl font-bold font-headline">Danh sách Quiz</h1>
        <button 
           onClick={() => router.push('/quizzes/create')} 
           className="bg-black text-white px-5 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all shadow-md flex gap-2 items-center"
        >
           + Tạo Quiz mới
        </button>
      </div>

      {error && (
         <div className="bg-red-100 text-red-600 p-4 rounded-lg font-bold mb-6 text-center">
            {error}
         </div>
      )}

      <div className="grid gap-5">
        {quizzes?.map((quiz: any) => (
          <div
            key={quiz.id}
            className="border p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow flex justify-between items-center"
          >
            {/* THẺ LINK ĐỂ BẤM CHUYỂN SANG TRANG CHI TIẾT */}
            <Link href={`/quizzes/${quiz.id}`} className="flex-1 cursor-pointer">
               <h2 className="text-xl font-bold text-primary hover:underline">{quiz.title}</h2>
               <p className="text-on-surface-variant mt-2 line-clamp-2">
                 {quiz.description || "Không có mô tả"}
               </p>
            </Link>
            
            {/* NÚT GỌI MODAL XÓA */}
            <div className="flex gap-2 ml-4 shrink-0">
                <button 
                  onClick={(e) => {
                     e.preventDefault(); // Ngăn sự kiện click Link
                     setQuizToDelete(quiz.id);
                  }} 
                  className="bg-red-50 text-red-500 font-bold px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Xóa
                </button>
            </div>
          </div>
        ))}

        {(!quizzes || quizzes.length === 0) && !error && (
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed">
            <p className="text-gray-500 font-bold text-lg">Hiện tại bạn chưa tạo Quiz nào.</p>
            <button 
              onClick={() => router.push('/quizzes/create')}
              className="mt-4 text-blue-600 font-bold hover:underline"
            >
              Bấm vào đây để tạo bộ câu hỏi đầu tiên!
            </button>
          </div>
        )}
      </div>

      {/* NHÚNG MODAL CỦA LEADER NẾU CÓ */}
      {/* Nếu components/ui/ConfirmModal.tsx của bạn chưa lỗi thì cứ giữ nguyên.
         Nếu báo lỗi do thiếu thư viện/file thì bạn có thể thay thế bằng hàm `window.confirm` tiêu chuẩn của JS
      */}
      <ConfirmModal 
          isOpen={quizToDelete !== null} 
          title="Xóa bộ Quiz?" 
          message="Bạn có chắc chắn muốn xóa toàn bộ câu hỏi trong Quiz này?"
          onConfirm={handleDelete} 
          onCancel={() => setQuizToDelete(null)} 
          isLoading={isDeleting}
      />
    </div>
  );
}