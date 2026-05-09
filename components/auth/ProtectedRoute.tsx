"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios"; // Import file axios "thần thánh" vừa tạo

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Gửi "vòng tay" lên server để máy quét kiểm tra.
        // ĐIỂM ĂN TIỀN: Nếu token hết hạn, Axios Interceptor sẽ TỰ ĐỘNG xin token mới
        // mà hàm này không hề hay biết. Nó chỉ biết kết quả cuối cùng là Thành công!
        const response = await api.get("/api/v1/auth/me");

        if (response.data.success) {
          // Server xác nhận token xịn
          setIsLoading(false);
        }
      } catch (error) {
        // Chỉ lọt vào catch này khi cả Access Token VÀ Refresh Token đều thất bại
        // Dọn dẹp "balo" vì chứa đồ giả/hết hạn
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      }
    };

    verifyToken();
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">
            Đang xác thực tài khoản...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}