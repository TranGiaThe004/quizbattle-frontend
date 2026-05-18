// lib/fetchApi.ts

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let accessToken = localStorage.getItem("access_token");

  // [ĐÃ SỬA TẠI ĐÂY]: Ép kiểu Record<string, string> để TypeScript 100% không báo lỗi
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  // 1. GỌI API LẦN ĐẦU
  let response = await fetch(url, { ...options, headers });

  // 2. NẾU TOKEN HẾT HẠN (LỖI 401)
  if (response.status === 401) {
    console.log("🔄 Access Token hết hạn, đang tự động làm mới...");
    const refreshToken = localStorage.getItem("refresh_token");

    if (!refreshToken) {
      // Không có Refresh Token -> Đuổi về trang Đăng nhập
      forceLogout();
      return response;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

      // Đổi API URL này thành đúng đường dẫn API refresh token của team bạn nhé
      const refreshResponse = await fetch(`${apiUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Chú ý: Backend yêu cầu refresh_token gửi qua Body hay Header thì tùy chỉnh chỗ này
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();

        // 3. LƯU TOKEN MỚI VÀO LOCALSTORAGE
        localStorage.setItem("access_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("refresh_token", data.refresh_token); // Lưu đè nếu có refresh_token mới
        }

        console.log("✅ Làm mới Token thành công! Đang gọi lại API...");

        // 4. GỌI LẠI CÁI API BAN NÃY BỊ XỊT VỚI TOKEN MỚI
        headers["Authorization"] = `Bearer ${data.access_token}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh Token cũng hết hạn nốt -> Đuổi về trang đăng nhập
        forceLogout();
      }
    } catch (error) {
      forceLogout();
    }
  }

  return response;
}

// Hàm dọn dẹp và đá văng về trang Login
function forceLogout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  window.location.href = "/login";
}