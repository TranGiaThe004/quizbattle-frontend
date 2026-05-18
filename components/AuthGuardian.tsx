"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// Hàm giải mã JWT siêu nhẹ bằng Javascript thuần
const isTokenAboutToExpire = (token: string) => {
  try {
    // Tách lấy phần payload của JWT (nằm giữa 2 dấu chấm)
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000; // Đổi thời gian hết hạn sang mili-giây
    const currentTime = Date.now();

    // Nếu token sẽ hết hạn trong vòng 1 PHÚT tới (hoặc đã hết hạn) -> Trả về true để xin mới
    return expirationTime - currentTime < 60 * 1000;
  } catch (e) {
    return true; // Nếu lỗi giải mã thì coi như hỏng, bắt xin mới luôn
  }
};

export default function AuthGuardian({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAndRefreshToken = async () => {
      // 1. Bỏ qua không kiểm tra nếu đang ở trang Login hoặc Register
      if (pathname.startsWith("/login") || pathname.startsWith("/register"))
        return;

      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken || !refreshToken) {
        // Nếu không có token mà đòi vào các trang bảo mật (như dashboard, quizzes) -> Đuổi ra
        if (pathname !== "/") {
          // Giả sử trang chủ "/" cho phép khách xem
          router.push("/login");
        }
        return;
      }

      // 2. LỚP BẢO VỆ: Kiểm tra hạn sử dụng ngay lúc người dùng vừa bấm chuyển trang
      if (isTokenAboutToExpire(accessToken)) {
        console.log("🛡️ Guardian: Token sắp/đã hết hạn. Đang xin cấp lại...");
        try {
          const apiUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
          const response = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem("access_token", data.access_token);
            if (data.refresh_token) {
              localStorage.setItem("refresh_token", data.refresh_token);
            }
            console.log("✅ Guardian: Làm mới Token thành công!");
          } else {
            // Refresh Token cũng đã hết hạn (quá 7 ngày chẳng hạn) -> Đăng xuất
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            router.push("/login");
          }
        } catch (error) {
          console.error("Lỗi khi refresh token ở Guardian:", error);
        }
      }
    };

    checkAndRefreshToken();
  }, [pathname, router]); // Hook này chỉ kích hoạt khi "pathname" (URL) thay đổi

  return <>{children}</>;
}
