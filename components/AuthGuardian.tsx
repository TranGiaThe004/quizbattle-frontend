"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

// --- DANH SÁCH TRẮNG: Các trang mở cửa tự do ---
const PUBLIC_ROUTES = [
  "/", // Trang chủ
  "/login", // Đăng nhập
  "/register", // Đăng ký
];

// Hàm giải mã JWT siêu nhẹ bằng Javascript thuần
const isTokenAboutToExpire = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    return expirationTime - currentTime < 60 * 1000;
  } catch (e) {
    return true;
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
      // Xác định xem trang hiện tại có phải là trang Public không
      // Dùng startsWith cho phép các route con như /rooms/join cũng được tính là Public
      const isPublicPage =
        PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/rooms/join");

      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (!accessToken || !refreshToken) {
        // Nếu không có token mà đòi vào trang Private -> Đuổi ra Login
        if (!isPublicPage) {
          router.push("/login");
        }
        return; // Đang ở trang Public thì cứ return để cho xem bình thường
      }

      // LỚP BẢO VỆ: Kiểm tra hạn sử dụng khi có token
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
            // Token rác/hết hạn -> Dọn dẹp sạch sẽ
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("display_name");

            // [ĐÃ FIX]: CHỈ ĐUỔI RA LOGIN NẾU ĐANG LÉN VÀO TRANG PRIVATE
            if (!isPublicPage) {
              router.push("/login");
            }
          }
        } catch (error) {
          console.error("Lỗi khi refresh token ở Guardian:", error);
        }
      }
    };

    checkAndRefreshToken();
  }, [pathname, router]);

  return <>{children}</>;
}
