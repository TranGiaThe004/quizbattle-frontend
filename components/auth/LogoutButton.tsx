"use client";
import { useRouter } from "next/navigation";
import { fetchWithAuth } from "@/lib/fetchApi";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    if (refreshToken) {
      try {
        await fetchWithAuth(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/logout`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refresh_token: refreshToken }),
          },
        );
      } catch (error) {
        console.error("Lỗi khi kết nối tới server lúc đăng xuất:", error);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg shadow-md transition-colors duration-200"
    >
      Đăng xuất
    </button>
  );
}
