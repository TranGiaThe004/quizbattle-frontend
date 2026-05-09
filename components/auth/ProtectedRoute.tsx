"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
    } else {
      setIsAuthenticated(true);
      setIsChecking(false);
    }
  }, [router]);

  // Hiển thị màn hình chờ trong tích tắc lúc anh bảo vệ đang lục balo
  if (isChecking || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold text-gray-600">
          Đang kiểm tra quyền truy cập...
        </p>
      </div>
    );
  }

  // Cho phép render nội dung trang web thực sự
  return <>{children}</>;
}
