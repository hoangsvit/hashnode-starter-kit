# API Identity - Thay đổi từ POST sang GET

## ✅ **Đã cập nhật thành công**

### 1. **API Endpoint (identity.ts)**
- ✅ Thay đổi method từ `POST` sang `GET`
- ✅ Lấy GUID từ `req.query` thay vì `req.body`
- ✅ Validation GUID từ query parameter
- ✅ Cookies vẫn được đọc từ request headers
- ✅ JWT validation vẫn hoạt động bình thường

### 2. **Client-side (identity.tsx)**
- ✅ Cập nhật fetch request thành GET method
- ✅ GUID được gửi qua URL query parameter
- ✅ Remove request body (không cần thiết cho GET)
- ✅ Giữ nguyên credentials: 'include' cho cookies

### 3. **Test Script (test-identity-api.js)**
- ✅ Cập nhật để sử dụng GET request
- ✅ GUID được encode trong URL
- ✅ Cookies vẫn được gửi trong headers

## **API Usage**

### Trước (POST):
```javascript
fetch('/api/identity', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ guid: '...' }),
  credentials: 'include'
})
```

### Sau (GET):
```javascript
fetch(`/api/identity?guid=${encodeURIComponent(guid)}`, {
  method: 'GET',
  credentials: 'include'
})
```

## **URL Examples**

### Development:
```
GET http://localhost:3000/api/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748
```

### Production:
```
GET https://eplus.dev/api/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748
```

## **Request Headers**
```http
GET /api/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748
Cookie: cdnonwld=1; jwt=eyJhbGciOiJIUzI1NiJ9...; __amplitudeDeviceID=99c5cebd-c7a1-4be6-bd61-62660d7903fb
```

## **Benefits của GET Method**

1. **Semantic Correctness**: GET cho read operations
2. **Caching**: Browser và CDN có thể cache response
3. **URL Shareable**: Link có thể share được
4. **Simpler**: Không cần request body
5. **RESTful**: Theo chuẩn REST API

## **Security Notes**

- ✅ GUID trong URL query - OK cho temporary verification tokens
- ✅ Sensitive data (JWT) vẫn ở trong HTTP-only cookies
- ✅ HTTPS required để bảo vệ GUID trong transit
- ✅ Server logs cần được configured để không log sensitive URLs

## **Testing**

Có thể test bằng cách:

1. **Browser**:
   ```
   https://eplus.dev/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748&next=https://eplus.dev/dashboard
   ```

2. **cURL**:
   ```bash
   curl -X GET \
     "http://localhost:3000/api/identity?guid=8684d122-e8df-4ca6-af80-ea35bcf2a748" \
     -H "Cookie: cdnonwld=1; jwt=eyJhbGciOiJIUzI1NiJ9..."
   ```

3. **Test Script**:
   ```bash
   node test-identity-api.js
   ```

Tất cả functionality vẫn giữ nguyên, chỉ thay đổi HTTP method và cách truyền GUID!
