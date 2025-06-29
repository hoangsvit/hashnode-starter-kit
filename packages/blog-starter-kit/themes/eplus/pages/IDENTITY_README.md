# Trang xác thực danh tính (Identity Page)

Trang xác thực danh tính được tạo để xử lý việc xác thực danh tính người dùng thông qua GUID từ email hoặc liên kết xác thực.

## URL Format

```
/identity?guid=<identity_guid>&next=<redirect_url>
```

### Ví dụ URL thực tế
```
https://eplus.dev/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748&next=https://eplus.dev/cloud-logging-on-kubernetes-engine-gsp483
```

## Các tính năng chính

### 1. Xác thực GUID danh tính

- Nhận GUID từ URL query parameter
- Validate format GUID (UUID v4)
- Gửi GUID đến API endpoint để xác thực
- Xử lý phản hồi từ server

### 2. Quản lý cookies bảo mật

- Tự động nhận và lưu cookies từ response headers
- Ba loại cookies được set:
  - `auth-token`: Token xác thực (expires in 1 hour)
  - `refresh-token`: Token làm mới (expires in 7 days)
  - `identity-token`: Token danh tính (expires in 1 day)
- Cookies được set với options bảo mật:
  - `HttpOnly`: Không thể truy cập từ JavaScript
  - `Secure`: Chỉ gửi qua HTTPS
  - `SameSite=Strict`: Bảo vệ khỏi CSRF attacks

### 3. Điều hướng thông minh

- Sử dụng parameter `next` để điều hướng sau khi xác thực thành công
- Fallback về trang chủ nếu không có `next` parameter
- Delay 2 giây để người dùng có thể thấy thông báo thành công

### 4. Xử lý cookies từ request headers

- Đọc và parse cookies từ request headers
- Hỗ trợ các cookies:
  - `jwt`: JWT token từ hệ thống existing
  - `cdnonwld`: Content delivery network flag
  - `__amplitudeDeviceID`: Analytics device tracking
- Validate JWT token và extract user information
- Kết hợp thông tin từ JWT với identity verification

## API Endpoint

### GET /api/identity?guid=<identity_guid>

#### Request URL
```
GET /api/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748
```

#### Request Headers

Cookies được gửi trong request headers:

```http
Cookie: cdnonwld=1; jwt=eyJhbGciOiJIUzI1NiJ9.eyJ0eXAiOiJKV1QiLCJkYXRhIjp7Imlzc3VlZEF0IjoxNzQ1MzA0OTQ3OTgxLCJ1c2VySWQiOiI1ZjgwMmRmOWJiYWJmMTBlYzg0ZDlmZTgifSwiaWF0IjoxNzQ1MzA0OTQ3LCJleHAiOjMyODQ5MzA0OTQ3fQ.6YiRLi74ooDWSQlr84_k0HgVJnmZHKaeFI6do1LcwYs; __amplitudeDeviceID=99c5cebd-c7a1-4be6-bd61-62660d7903fb
```

JWT Token payload example:
```json
{
  "typ": "JWT",
  "data": {
    "issuedAt": 1745304947981,
    "userId": "5f802df9bbabf10ec84d9fe8"
  },
  "iat": 1745304947,
  "exp": 3284930494
}
```

#### Response (Success)
```typescript
{
  "success": true,
  "message": "Identity verification successful",
  "user": {
    "id": "user_eplus_123",
    "email": "user@eplus.dev",
    "name": "Eplus Verified User",
    "isVerified": true,
    "role": "verified_user"
  }
}
```

#### Response (Error)
```typescript
{
  "success": false,
  "message": "Invalid GUID format" | "Identity GUID expired or invalid" | "Identity verification pending"
}
```

## Trạng thái UI

### 1. Loading State
- Hiển thị spinner loading
- Thông báo "Đang xác thực danh tính..."

### 2. Success State
- Hiển thị icon check mark (✅)
- Thông báo "Xác thực danh tính thành công!"
- Thông báo "Danh tính của bạn đã được xác nhận. Bạn sẽ được chuyển hướng trong giây lát..."
- Tự động redirect sau 2 giây

### 3. Error State
- Hiển thị icon error (❌)
- Thông báo "Xác thực danh tính thất bại"
- Hiển thị thông báo lỗi chi tiết
- Nút "Thử lại" để thực hiện xác thực lại

### 4. No GUID State
- Thông báo "⚠️ Không tìm thấy GUID xác thực danh tính"
- Hướng dẫn "Vui lòng kiểm tra lại link xác thực danh tính từ email."

## GUID Validation

API endpoint thực hiện validation GUID theo format UUID:
- Pattern: `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`
- Case insensitive
- Reject các GUID đặc biệt:
  - `00000000-0000-0000-0000-000000000000` (expired/invalid)
  - `11111111-1111-1111-1111-111111111111` (pending verification)

## Mock Data

Trong môi trường development, API sử dụng mock data:

### GUID đặc biệt được hỗ trợ:
- `8684d122-e8df-4ca6-af80-ea35bcf2a748`: User Eplus verified
- Bất kỳ GUID hợp lệ nào khác: User default verified

## Customization

### Thay đổi thời gian redirect
```typescript
setTimeout(() => {
  const redirectUrl = (next as string) || '/';
  router.push(redirectUrl);
}, 5000); // 5 giây thay vì 2 giây
```

### Thay đổi logic xác thực
Chỉnh sửa function `verifyIdentityGuid` trong `/api/identity.ts`:
- Connect to database
- Implement real GUID verification
- Add additional identity checks
- Handle different user roles

### Styling
Page sử dụng Tailwind CSS và có thể customize:
- Dark mode support
- Responsive design
- Publication branding (logo, colors)
- Animation và transitions

## Security Notes

- GUID không được expose trong client-side logs
- All cookies are HTTP-only và secure
- API endpoint có rate limiting (khuyến nghị implement)
- GUID có thể được set expiration time
- Identity verification status được track
