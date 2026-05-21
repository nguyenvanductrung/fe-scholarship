# Cardano Scholarship DApp - Frontend

Đây là giao diện người dùng (Frontend DApp) được xây dựng bằng **Next.js** (App Router), cho phép người dùng tương tác trực tiếp với Smart Contract học bổng Cardano.

## 🚀 Tính năng nổi bật
- **Kết nối ví Cardano**: Tích hợp Lucid / Cardano-multiplatform-lib hoặc thư viện ví cip-30 để kết nối ví trình duyệt (Nami, Lace, Eternl, Vespr, v.v.).
- **Giao diện Admin**: Cấp học bổng mới, duyệt danh sách học bổng đã đủ điều kiện GPA.
- **Giao diện Sinh viên**: Xem trạng thái học bổng của mình và thực hiện rút học bổng (Claim) bằng chữ ký cá nhân trực tiếp trên trình duyệt.

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### 1. Cài đặt các phần phụ thuộc
Di chuyển vào thư mục frontend và cài đặt node packages:

```bash
cd frontend
npm install
```

### 2. Cấu hình biến môi trường
Tạo file `.env.local` trong thư mục `/frontend` với nội dung mẫu như sau:

```env
# URL trỏ tới API Backend FastAPI
NEXT_PUBLIC_API_URL=http://localhost:8000/api

# Mạng lưới Cardano đang chạy (preview hoặc preprod)
NEXT_PUBLIC_NETWORK=preview

# Địa chỉ ví Admin (Dùng để xác thực quyền quản trị trên UI)
NEXT_PUBLIC_ADMIN_ADDRESS=addr_test1qrkv7h0zup0kl60uqlqh2gx7p59aan6865cc9xquefsf272736ynmuwqju56ws8m5cz3h3gj6aq9z0uyqjd56s5zeynqxfwyzf
```

### 3. Chạy ứng dụng ở chế độ Development
Khởi động development server cục bộ:

```bash
npm run dev
```

Mở trình duyệt truy cập: [http://localhost:3000](http://localhost:3000)

### 4. Build sản phẩm production
Để tối ưu hoá và build ứng dụng cho môi trường production:
```bash
npm run build
npm run start
```

---

## 💡 Lưu ý khi test kết nối ví
1. Đảm bảo ví trình duyệt của bạn (Nami, Lace, v.v.) đang được chuyển sang mạng **Preview** (phải trùng khớp với cấu hình `NEXT_PUBLIC_NETWORK`).
2. Ví test phải có một lượng **tADA** nhất định để làm phí mạng lưới khi tương tác hoặc ký giao dịch. Xin tADA miễn phí tại [Cardano Faucet](https://docs.cardano.org/cardano-testnets/tools/faucet/).
