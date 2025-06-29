# Trang xác thực (Verify Page)

Trang xác thực được tạo để xử lý việc xác thực tài khoản người dùng thông qua token từ email.

## Các tính năng chính

### 1. Nhận và xử lý token xác thực
- Nhận token từ URL query parameter
- Gửi token đến API endpoint để xác thực
- Xử lý phản hồi từ server

### 2. Quản lý cookies
- Tự động nhận và lưu cookies từ response headers
- Sử dụng `credentials: 'include'` để đảm bảo cookies được gửi/nhận
- Cookies được set với các options bảo mật:
  - `HttpOnly`: Không thể truy cập từ JavaScript
  - `Secure`: Chỉ gửi qua HTTPS
  - `SameSite=Strict`: Bảo vệ khỏi CSRF attacks

### 3. Điều hướng thông minh
- Sử dụng parameter `next` để điều hướng sau khi xác thực thành công
- Fallback về trang chủ nếu không có `next` parameter
- Delay 2 giây để người dùng có thể thấy thông báo thành công

## Cách sử dụng

### URL format
```
/verify?token=<verification_token>&next=<redirect_url>
```

### Ví dụ URLs
```
/verify?token=abc123&next=/dashboard
/verify?token=abc123&next=/profile
/verify?token=abc123  // sẽ redirect về /
```

## API Endpoint

### POST /api/verify
```typescript
// Request body
{
  "token": "verification_token_here"
}

// Response (success)
{
  "success": true,
  "message": "Verification successful",
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "User Name"
  }
}

// Response (error)
{
  "success": false,
  "message": "Token expired or invalid"
}
```

### Set-Cookie Headers
API sẽ trả về các cookies sau khi xác thực thành công:
- `auth-token`: Token xác thực (expires in 1 hour)
- `refresh-token`: Token làm mới (expires in 7 days)

## Trạng thái UI

### 1. Loading State
- Hiển thị spinner loading
- Thông báo "Đang xác thực..."

### 2. Success State
- Hiển thị icon check mark
- Thông báo "Xác thực thành công!"
- Tự động redirect sau 2 giây

### 3. Error State
- Hiển thị icon error
- Thông báo lỗi chi tiết
- Nút "Thử lại" để thực hiện xác thực lại

### 4. No Token State
- Thông báo không tìm thấy token
- Hướng dẫn kiểm tra lại link từ email

## Customization

### Thay đổi thời gian redirect
```typescript
// Trong handleVerification function
setTimeout(() => {
  const redirectUrl = (next as string) || '/';
  router.push(redirectUrl);
}, 5000); // 5 giây thay vì 2 giây
```

### Thay đổi logic xác thực
Chỉnh sửa file `/api/verify.ts`:
- Implement JWT verification
- Connect to database
- Add additional security checks

### Styling
Page sử dụng Tailwind CSS và có thể customize thông qua:
- Dark mode support
- Responsive design
- Publication branding (logo, colors)
