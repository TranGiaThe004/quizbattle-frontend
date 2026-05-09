import ProtectedRoute from "@/components/auth/ProtectedRoute";
import LogoutButton from "@/components/auth/LogoutButton";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center border-b pb-4 mb-4">
            <h1 className="text-3xl font-bold text-indigo-600">
              Trạm vũ trụ QuizBattle
            </h1>
            <LogoutButton />
          </div>

          <p className="text-gray-700 text-lg">
            Chào mừng bạn đã vượt qua được anh bảo vệ! Chỉ những người có Access
            Token hợp lệ mới có thể đọc được dòng chữ bí mật này.
          </p>
        </div>
      </main>
    </ProtectedRoute>
  );
}
