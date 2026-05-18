// "use client";

// import {
//   Search,
//   Plus,
//   Play,
//   Edit3,
//   SlidersHorizontal,
//   LayoutGrid,
//   Library,
//   TrendingUp,
//   HelpCircle,
//   BookOpen,
//   Trash2, // Đã thêm icon Trash2
// } from "lucide-react";
// import { motion } from "framer-motion";
// import { useState, useEffect } from "react";
// import { useRouter } from "next/navigation";
// import { fetchWithAuth } from "@/lib/fetchApi"; // Đảm bảo đường dẫn này đúng với dự án của bạn

// // Cập nhật Type để hứng dữ liệu thật từ Backend
// interface Quiz {
//   id: number;
//   title: string;
//   description: string;
//   // Các thông số giả lập nếu backend chưa trả về
//   question_count?: number;
// }

// interface QuizCardProps {
//   quiz: Quiz;
//   categoryColor: string;
//   onPlay: (quizId: number, e: React.MouseEvent) => void;
//   onEdit: (quizId: number, e: React.MouseEvent) => void;
//   onDelete: (quizId: number, e: React.MouseEvent) => void; // Thêm prop xóa
// }

// const QuizCard = ({
//   quiz,
//   categoryColor,
//   onPlay,
//   onEdit,
//   onDelete,
// }: QuizCardProps) => (
//   <motion.div
//     initial={{ opacity: 0, y: 20 }}
//     animate={{ opacity: 1, y: 0 }}
//     whileHover={{ y: -4 }}
//     className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-200 overflow-hidden flex flex-col group relative"
//   >
//     {/* Nút XÓA (Trash) đặt ở góc phải, chỉ hiện khi hover hoặc trên mobile */}
//     <button
//       onClick={(e) => onDelete(quiz.id, e)}
//       className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
//       title="Xóa Quiz này"
//     >
//       <Trash2 className="w-4 h-4" />
//     </button>

//     <div
//       className="h-32 w-full relative flex items-center justify-center overflow-hidden"
//       style={{
//         background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor}88)`,
//       }}
//     >
//       <BookOpen className="w-12 h-12 text-white/50 group-hover:scale-110 transition-transform duration-500" />
//       <div className="absolute top-3 left-3 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-sm bg-black/20">
//         Quiz
//       </div>
//     </div>

//     <div className="p-5 flex flex-col flex-grow gap-3">
//       <h3
//         className="font-display font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-8"
//         title={quiz.title}
//       >
//         {quiz.title}
//       </h3>
//       <p className="text-sm text-slate-500 line-clamp-2">
//         {quiz.description || "Không có mô tả"}
//       </p>

//       <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mt-1">
//         <span className="flex items-center gap-1">
//           <HelpCircle className="w-4 h-4" /> {quiz.question_count || 0} Qs
//         </span>
//         <span className="flex items-center gap-1">
//           <Play className="w-4 h-4 fill-current" /> 0 Plays
//         </span>
//       </div>

//       <div className="mt-auto pt-4 flex gap-3">
//         {/* Nút Play -> Gọi API tạo phòng */}
//         <button
//           onClick={(e) => onPlay(quiz.id, e)}
//           className="flex-grow bg-indigo-600 text-white font-bold py-2 rounded-xl shadow-[0px_4px_0px_0px_#3730a3] hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2"
//         >
//           <Play className="w-4 h-4 fill-current" /> Play
//         </button>

//         {/* Nút Edit -> Chuyển sang trang sửa */}
//         <button
//           onClick={(e) => onEdit(quiz.id, e)}
//           className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl border-2 border-slate-200 transition-colors flex justify-center items-center"
//           title="Chỉnh sửa Quiz"
//         >
//           <Edit3 className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   </motion.div>
// );

// export default function QuizzesPage() {
//   const router = useRouter();
//   const [activeTab, setActiveTab] = useState("my-quizzes");

//   // State quản lý dữ liệu thật
//   const [quizzes, setQuizzes] = useState<Quiz[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isCreatingRoom, setIsCreatingRoom] = useState(false);

//   // Danh sách màu ngẫu nhiên cho Card
//   const colors = ["#4f46e5", "#ea580c", "#16a34a", "#db2777", "#0284c7"];

//   useEffect(() => {
//     fetchQuizzes();
//   }, []);

//   const fetchQuizzes = async () => {
//     setIsLoading(true);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

//       // Gọi API lấy danh sách Quiz
//       const response = await fetchWithAuth(`${apiUrl}/api/v1/quizzes`);

//       if (response.ok) {
//         const data = await response.json();
//         const quizList = data.data || data;
//         setQuizzes(quizList);
//       }
//     } catch (error) {
//       console.error("Lỗi khi tải danh sách Quiz:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // --- LOGIC XÓA QUIZ ---
//   const handleDeleteQuiz = async (quizId: number, e: React.MouseEvent) => {
//     e.stopPropagation(); // Ngăn click nhầm vào các nút khác

//     // Thêm hộp thoại xác nhận tránh xóa nhầm
//     const isConfirmed = window.confirm(
//       "Bạn có chắc chắn muốn xóa bài Quiz này không? Hành động này không thể hoàn tác.",
//     );
//     if (!isConfirmed) return;

//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

//       // GỌI API XÓA (Giả định Backend của bạn có method DELETE /api/v1/quizzes/{id})
//       const response = await fetchWithAuth(
//         `${apiUrl}/api/v1/quizzes/${quizId}`,
//         {
//           method: "DELETE",
//         },
//       );

//       if (response.ok) {
//         // Nếu xóa thành công trên server, cập nhật lại giao diện (Xóa khỏi mảng state)
//         setQuizzes((prevQuizzes) =>
//           prevQuizzes.filter((quiz) => quiz.id !== quizId),
//         );
//       } else {
//         const err = await response.json();
//         alert(`Không thể xóa Quiz: ${err.detail || "Lỗi server"}`);
//       }
//     } catch (error) {
//       alert("Lỗi kết nối khi cố gắng xóa Quiz!");
//     }
//   };

//   const handlePlayQuiz = async (quizId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (isCreatingRoom) return;

//     setIsCreatingRoom(true);
//     try {
//       const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

//       const response = await fetchWithAuth(`${apiUrl}/api/v1/rooms`, {
//         method: "POST",
//         body: JSON.stringify({ quiz_id: quizId }),
//       });

//       if (response.ok) {
//         const data = await response.json();
//         const roomCode = data.data?.room_code || data.room_code;
//         router.push(`/rooms/${roomCode}/lobby`);
//       } else {
//         alert("Lỗi: Không thể tạo phòng chơi!");
//       }
//     } catch (error) {
//       alert("Lỗi kết nối đến máy chủ!");
//     } finally {
//       setIsCreatingRoom(false);
//     }
//   };

//   const handleEditQuiz = (quizId: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     router.push(`/quizzes/${quizId}`);
//   };

//   return (
//     <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pt-24 pb-12">
//       <main className="max-w-[1280px] mx-auto w-full px-5 flex flex-col lg:flex-row gap-8">
//         {/* Cột Trái: Danh sách Library */}
//         <div className="flex-grow flex flex-col gap-8">
//           <div className="flex flex-col gap-6">
//             <h1 className="font-display text-4xl font-black text-indigo-900">
//               Quiz Library
//             </h1>
//             <div className="flex flex-col sm:flex-row gap-4">
//               <div className="flex-grow relative group">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
//                 <input
//                   type="text"
//                   placeholder="Tìm kiếm quizzes, danh mục..."
//                   className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 font-medium border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
//                 />
//               </div>
//               <button className="bg-white text-slate-700 font-bold px-6 py-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
//                 <SlidersHorizontal className="w-5 h-5" />
//                 Filters
//               </button>
//             </div>
//           </div>

//           <div className="flex border-b-2 border-slate-200 overflow-x-auto hide-scrollbar">
//             {["My Quizzes", "Public Library"].map((tab) => {
//               const id = tab.toLowerCase().replace(" ", "-");
//               const isActive = activeTab === id;
//               return (
//                 <button
//                   key={id}
//                   onClick={() => setActiveTab(id)}
//                   className={`px-8 py-4 font-bold whitespace-nowrap transition-all border-b-4 ${
//                     isActive
//                       ? "text-indigo-600 border-yellow-400"
//                       : "text-slate-500 border-transparent hover:text-indigo-600"
//                   }`}
//                 >
//                   {tab}
//                 </button>
//               );
//             })}
//           </div>

//           {/* Grid Quizzes (DỮ LIỆU THẬT) */}
//           {isLoading ? (
//             <div className="flex justify-center py-20">
//               <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
//               {quizzes.map((quiz, index) => (
//                 <QuizCard
//                   key={quiz.id}
//                   quiz={quiz}
//                   categoryColor={colors[index % colors.length]}
//                   onPlay={handlePlayQuiz}
//                   onEdit={handleEditQuiz}
//                   onDelete={handleDeleteQuiz} // Truyền hàm xóa xuống Card
//                 />
//               ))}

//               {/* Thẻ Tạo Mới */}
//               <motion.button
//                 onClick={() => router.push("/quizzes/create")}
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//                 className="bg-indigo-50/50 rounded-2xl border-4 border-dashed border-indigo-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 flex flex-col items-center justify-center p-8 gap-4 min-h-[300px] group cursor-pointer"
//               >
//                 <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
//                   <Plus className="w-10 h-10" />
//                 </div>
//                 <span className="font-display font-black text-xl text-indigo-900 group-hover:text-indigo-600 transition-colors">
//                   Create New Quiz
//                 </span>
//               </motion.button>
//             </div>
//           )}
//         </div>

//         {/* Cột Phải: Quick Stats & Trending */}
//         <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
//           <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6">
//             <h2 className="font-display font-black text-xl text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center gap-2">
//               <LayoutGrid className="w-6 h-6 text-indigo-600" /> Quick Stats
//             </h2>
//             <div className="flex flex-col gap-5">
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-500 flex items-center gap-2 font-bold">
//                   <Library className="w-5 h-5 text-indigo-600" /> Total Quizzes
//                 </span>
//                 <span className="font-black text-xl text-slate-800">
//                   {quizzes.length}
//                 </span>
//               </div>
//               <div className="flex justify-between items-center">
//                 <span className="text-slate-500 flex items-center gap-2 font-bold">
//                   <TrendingUp className="w-5 h-5 text-yellow-500" /> Total Plays
//                 </span>
//                 <span className="font-black text-xl text-slate-800">0</span>
//               </div>
//             </div>
//           </section>

//           <section className="bg-indigo-600 text-white rounded-3xl border-2 border-indigo-400 shadow-lg p-6 overflow-hidden relative">
//             <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/30 rounded-full blur-2xl"></div>
//             <div className="relative z-10">
//               <h2 className="font-display font-black text-2xl mb-2 text-yellow-400">
//                 Trending Now
//               </h2>
//               <p className="text-sm mb-6 text-indigo-100 font-medium">
//                 Thử ngay bộ câu hỏi hot nhất cộng đồng.
//               </p>
//               <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
//                 <h3 className="font-black text-slate-900 line-clamp-1">
//                   FastAPI Masterclass
//                 </h3>
//                 <p className="text-xs font-bold text-slate-500">By ThiDev</p>
//                 <button className="mt-2 bg-yellow-400 text-yellow-950 font-black py-2.5 rounded-xl shadow-[0px_4px_0px_0px_#b45309] hover:bg-yellow-500 active:translate-y-1 active:shadow-none transition-all text-sm">
//                   Play Now
//                 </button>
//               </div>
//             </div>
//           </section>
//         </aside>
//       </main>
//     </div>
//   );
// }



// app/(main)/quizzes/page.tsx
"use client";

import {
  Search, Plus, Play, Edit3, SlidersHorizontal,
  LayoutGrid, Library, TrendingUp, HelpCircle, BookOpen, Trash2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchApi";

interface Quiz {
  id: number;
  title: string;
  description: string;
  question_count?: number;
}

interface QuizCardProps {
  quiz: Quiz;
  categoryColor: string;
  isPublicTab: boolean; // Phân biệt Tab để ẩn/hiện nút Sửa, Xóa
  onPlay: (quizId: number, e: React.MouseEvent) => void;
  onEdit: (quizId: number, e: React.MouseEvent) => void;
  onDelete: (quizId: number, e: React.MouseEvent) => void;
}

const QuizCard = ({ quiz, categoryColor, isPublicTab, onPlay, onEdit, onDelete }: QuizCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -4 }}
    className="bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-400 transition-all duration-200 overflow-hidden flex flex-col group relative"
  >
    {/* Chỉ hiện nút Xóa nếu ĐANG Ở TAB MY QUIZZES */}
    {!isPublicTab && (
      <button
        onClick={(e) => onDelete(quiz.id, e)}
        className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 border border-slate-200 shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-200"
        title="Xóa Quiz này"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    )}

    <div className="h-32 w-full relative flex items-center justify-center overflow-hidden" style={{ background: `linear-gradient(135deg, ${categoryColor}dd, ${categoryColor}88)` }}>
      <BookOpen className="w-12 h-12 text-white/50 group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute top-3 left-3 text-white font-bold text-xs px-3 py-1 rounded-full shadow-md backdrop-blur-sm bg-black/20">
        Quiz
      </div>
    </div>

    <div className="p-5 flex flex-col flex-grow gap-3">
      <h3 className="font-display font-black text-xl text-slate-800 group-hover:text-indigo-600 transition-colors line-clamp-1 pr-8" title={quiz.title}>
        {quiz.title}
      </h3>
      <p className="text-sm text-slate-500 line-clamp-2">{quiz.description || "Không có mô tả"}</p>

      <div className="flex items-center gap-4 text-slate-500 text-sm font-medium mt-1">
        <span className="flex items-center gap-1"><HelpCircle className="w-4 h-4" /> {quiz.question_count || 0} Qs</span>
        <span className="flex items-center gap-1"><Play className="w-4 h-4 fill-current" /> 0 Plays</span>
      </div>

      <div className="mt-auto pt-4 flex gap-3">
        <button onClick={(e) => onPlay(quiz.id, e)} className="flex-grow bg-indigo-600 text-white font-bold py-2 rounded-xl shadow-[0px_4px_0px_0px_#3730a3] hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none transition-all flex justify-center items-center gap-2">
          <Play className="w-4 h-4 fill-current" /> Play
        </button>

        {/* Chỉ hiện nút Edit nếu ĐANG Ở TAB MY QUIZZES */}
        {!isPublicTab && (
          <button onClick={(e) => onEdit(quiz.id, e)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2 rounded-xl border-2 border-slate-200 transition-colors flex justify-center items-center" title="Chỉnh sửa Quiz">
            <Edit3 className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  </motion.div>
);

export default function QuizzesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("my-quizzes");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);

  const colors = ["#4f46e5", "#ea580c", "#16a34a", "#db2777", "#0284c7"];

  // Gọi API mỗi khi chuyển Tab
  useEffect(() => {
    fetchQuizzes(activeTab);
  }, [activeTab]);

  const fetchQuizzes = async (tabId: string) => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      
      // [THÊM MỚI - MEMBER B]: Logic phân nhánh API theo Tab
      const endpoint = tabId === "public-library" ? "/api/v1/quizzes/public" : "/api/v1/quizzes";
      const response = await fetchWithAuth(`${apiUrl}${endpoint}`);

      if (response.ok) {
        const data = await response.json();
        setQuizzes(data.data || data);
      } else {
        setQuizzes([]);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách Quiz:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const isConfirmed = window.confirm("Bạn có chắc chắn muốn xóa bài Quiz này không? Hành động này không thể hoàn tác.");
    if (!isConfirmed) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetchWithAuth(`${apiUrl}/api/v1/quizzes/${quizId}`, { method: "DELETE" });

      if (response.ok) {
        setQuizzes((prev) => prev.filter((quiz) => quiz.id !== quizId));
      } else {
        const err = await response.json();
        alert(`Không thể xóa Quiz: ${err.detail || "Lỗi server"}`);
      }
    } catch (error) {
      alert("Lỗi kết nối khi cố gắng xóa Quiz!");
    }
  };

  const handlePlayQuiz = async (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCreatingRoom) return;

    setIsCreatingRoom(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
      const response = await fetchWithAuth(`${apiUrl}/api/v1/rooms`, {
        method: "POST",
        body: JSON.stringify({ quiz_id: quizId }),
      });

      if (response.ok) {
        const data = await response.json();
        const roomCode = data.data?.room_code || data.room_code;
        router.push(`/rooms/${roomCode}/lobby`);
      } else {
        alert("Lỗi: Không thể tạo phòng chơi!");
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ!");
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleEditQuiz = (quizId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/quizzes/${quizId}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col pt-24 pb-12">
      <main className="max-w-[1280px] mx-auto w-full px-5 flex flex-col lg:flex-row gap-8">
        <div className="flex-grow flex flex-col gap-8">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-4xl font-black text-indigo-900">Quiz Library</h1>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-grow relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
                <input type="text" placeholder="Tìm kiếm quizzes, danh mục..." className="w-full bg-white rounded-2xl py-4 pl-12 pr-4 font-medium border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm" />
              </div>
              <button className="bg-white text-slate-700 font-bold px-6 py-4 rounded-2xl border-2 border-slate-200 hover:border-indigo-400 hover:text-indigo-600 flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
                <SlidersHorizontal className="w-5 h-5" /> Filters
              </button>
            </div>
          </div>

          <div className="flex border-b-2 border-slate-200 overflow-x-auto hide-scrollbar">
            {["My Quizzes", "Public Library"].map((tab) => {
              const id = tab.toLowerCase().replace(" ", "-");
              return (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`px-8 py-4 font-bold whitespace-nowrap transition-all border-b-4 ${activeTab === id ? "text-indigo-600 border-yellow-400" : "text-slate-500 border-transparent hover:text-indigo-600"}`}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {quizzes.map((quiz, index) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  categoryColor={colors[index % colors.length]}
                  isPublicTab={activeTab === "public-library"}
                  onPlay={handlePlayQuiz}
                  onEdit={handleEditQuiz}
                  onDelete={handleDeleteQuiz}
                />
              ))}

              {/* CHỈ Hiện nút Tạo mới ở Tab My Quizzes */}
              {activeTab === "my-quizzes" && (
                <motion.button
                  onClick={() => router.push("/quizzes/create")}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-indigo-50/50 rounded-2xl border-4 border-dashed border-indigo-200 shadow-sm hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200 flex flex-col items-center justify-center p-8 gap-4 min-h-[300px] group cursor-pointer"
                >
                  <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform group-hover:bg-indigo-600 group-hover:text-white shadow-sm">
                    <Plus className="w-10 h-10" />
                  </div>
                  <span className="font-display font-black text-xl text-indigo-900 group-hover:text-indigo-600 transition-colors">
                    Create New Quiz
                  </span>
                </motion.button>
              )}
            </div>
          )}
        </div>

        <aside className="w-full lg:w-80 flex-shrink-0 flex flex-col gap-6">
          <section className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6">
            <h2 className="font-display font-black text-xl text-slate-800 mb-6 border-b-2 border-slate-100 pb-4 flex items-center gap-2">
              <LayoutGrid className="w-6 h-6 text-indigo-600" /> Quick Stats
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-2 font-bold"><Library className="w-5 h-5 text-indigo-600" /> Total Quizzes</span>
                <span className="font-black text-xl text-slate-800">{quizzes.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 flex items-center gap-2 font-bold"><TrendingUp className="w-5 h-5 text-yellow-500" /> Total Plays</span>
                <span className="font-black text-xl text-slate-800">0</span>
              </div>
            </div>
          </section>

          <section className="bg-indigo-600 text-white rounded-3xl border-2 border-indigo-400 shadow-lg p-6 overflow-hidden relative">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-400/30 rounded-full blur-2xl"></div>
            <div className="relative z-10">
              <h2 className="font-display font-black text-2xl mb-2 text-yellow-400">Trending Now</h2>
              <p className="text-sm mb-6 text-indigo-100 font-medium">Thử ngay bộ câu hỏi hot nhất cộng đồng.</p>
              <div className="bg-white rounded-2xl p-4 flex flex-col gap-2 shadow-inner">
                <h3 className="font-black text-slate-900 line-clamp-1">FastAPI Masterclass</h3>
                <p className="text-xs font-bold text-slate-500">By ThiDev</p>
                <button className="mt-2 bg-yellow-400 text-yellow-950 font-black py-2.5 rounded-xl shadow-[0px_4px_0px_0px_#b45309] hover:bg-yellow-500 active:translate-y-1 active:shadow-none transition-all text-sm">
                  Play Now
                </button>
              </div>
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}