"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
        // Gửi "vòng tay" lên server để máy quét kiểm tra
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/me`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.ok) {
          // Server xác nhận token xịn
          setIsLoading(false);
        } else {
          // Token giả hoặc hết hạn (401)
          throw new Error("Token không hợp lệ");
        }
      } catch (error) {
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
