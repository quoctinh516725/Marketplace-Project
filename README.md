# 🛒 E-Commerce Multi-Vendor Marketplace Backend

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)
![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?&style=for-the-badge&logo=redis&logoColor=white)
![ElasticSearch](https://img.shields.io/badge/-ElasticSearch-005571?style=for-the-badge&logo=elasticsearch)

Một hệ thống Backend mạnh mẽ, có khả năng mở rộng cao dành cho mô hình E-commerce Multi-vendor (như Shopee, Lazada). Dự án được xây dựng với kiến trúc nguyên khối được module hóa (Modular Monolith) kết hợp xử lý bất đồng bộ (Background processing) bằng Message Queue và Caching đa tầng.

---

## Tính Năng Nổi Bật (Key Features)

- **Mô Hình Đa Gian Hàng (Multi-Vendor):**
  - Hỗ trợ nhiều người bán (Seller/Shop) trên cùng một nền tảng.
  - Tự động tách đơn hàng tổng (Master Order) thành các đơn hàng con (Sub Order) cho từng gian hàng.
  - Phân bổ linh hoạt mã giảm giá (Platform Voucher & Shop Voucher) và tự động tính toán tỷ lệ hoa hồng (Commission Rate).
- **Tìm Kiếm Sản Phẩm Tốc Độ Cao (Elasticsearch):**
  - Đồng bộ dữ liệu truy vấn từ cơ sở dữ liệu gốc sang **Elasticsearch**.
  - Xử lý mượt mà Full-text search (Tìm kiếm Full-text), Filtering (Lọc) nhiều tiêu chí và Pagination.
- **Giỏ Hàng Tối Ưu (Redis-Powered Cart):**
  - Quản lý giỏ hàng hoàn toàn thông qua bộ nhớ RAM (Redis Hash) giúp tăng tốc độ thao tác (Thêm/Sửa/Xóa).
  - Tự động gộp giỏ hàng (Cart Merge) từ định danh Khách (Guest) sang tài khoản Người dùng (User) khi đăng nhập.
  - Đồng bộ dữ liệu ngầm định kỳ (Background Syncing) từ Redis trực tiếp xuống Database qua **BullMQ**, giảm áp lực Write lên CSDL gốc.
- **Thanh Toán & Vận Chuyển An Toàn:**
  - Tích hợp cổng thanh toán **VNPay** với thuật toán HMAC SHA-512 và IPN Webhook an toàn.
  - Kết nối thời gian thực tới API **Giao Hàng Nhanh (GHN)** để tính chính xác phí vận chuyển từng gian hàng dựa theo khoảng cách địa lý và cân nặng sản phẩm.
- **Bảo Vệ Tính Toàn Vẹn Của Giao Dịch (Concurrency & Safety):**
  - Triển khai **Idempotency Keys** thông qua Redis để ngăn ngừa trùng lặp thao tác lên đơn (Double-click/Network retries).
  - Sử dụng Transaction Database (Lock Stock) để tránh nghẽn/tính sai tồn kho (Over-selling) trong suốt quá trình người dùng check-out và thanh toán.
  - Tự động Hủy đơn và Mở khóa tồn kho (Auto-release/Cancel Order) nhờ Delay Queues (BullMQ) nếu giao dịch hết hạn (Timeout).
- **Phân Quyền Chi Tiết (RBAC):** Caching phân quyền phân lớp linh hoạt giữa `Role Permissions` (Kế thừa từ nhóm) và `User Permissions` (Gán riêng).

---

## Chi Tiết Các Chức Năng (Detailed Functionalities)

### 1. Phân Hệ Xác Thực & Phân Quyền (Auth & RBAC)
- Đăng nhập/Đăng ký cơ bản (Email, Username & Password).
- Đăng nhập/Đăng ký nhanh qua **Google OAuth2**.
- Phát hành **Access Token** & **Refresh Token** (JWT). Hỗ trợ Revoke token và Blacklist token bằng Redis khi đăng xuất.
- Hệ thống Role-Based Access Control nâng cao (RBAC): Quản lý Roles, Permissions. Gán quyền cứng cho Role hoặc gán quyền linh hoạt (Custom) cho từng User.
- Caching toàn bộ thông tin Session, Quyền hạn lên Redis. Tự động Invalidate (xóa cache định kỳ hoặc đột xuất) khi User bị vô hiệu hóa hoặc bị đổi quyền.

### 2. Quản Trị Người Dùng (User Management)
- Quản lý hồ sơ cá nhân (Profile): Cập nhật thông tin, Upload ảnh đại diện (Cloudinary).
- Quản lý sổ địa chỉ (Address book): Thêm, Sửa, Xóa, Đặt địa chỉ làm mặc định.
- Quản lý của Admin: Xem danh sách User, tìm kiếm, khóa/mở khóa tài khoản, hoặc xóa mềm (Soft-delete).

### 3. Phân Hệ Người Bán & Cửa Hàng (Shop/Seller)
- Đăng ký trở thành Người Bán (Seller). 
- Hệ thống Admin thẩm định duyệt (Approve) cho Shop. Các Trạng thái Shop quản trị bao gồm `PENDING_APPROVE`, `ACTIVE`, v.v...
- Quản lý cấu hình cửa hàng: Tên miền hiển thị, Logo, Mô tả, Khai báo Vùng/Miền phát hàng, Cấu hình Tỷ lệ hoa hồng (Commission Rate) trích xuất cho hệ thống.
- Cung cấp Dashboard cơ bản cho Shop thống kê số lượng sản phẩm, doanh số review.

### 4. Quản Lý Sản Phẩm (Product Catalog)
- Quản lý Cây danh mục (Category) N cấp, Thương hiệu (Brand), và Nhãn/Thẻ (Tags). Tự động chặn xóa danh mục nếu đang có sản phẩm.
- **Kiến trúc Biến Thể Đa Dạng (Variations):** Hỗ trợ Sản Phẩm có rất nhiều cụm biến thể động (Chẳng hạn: Màu cam/Đen - Size M/XL). 
- Hệ thống tự sinh và quản lý cấu trúc SKU độc nhất. Mỗi Biến Thể SKU quản lý độc lập Giá tiền (Price), Tồn kho (Stock), Hình ảnh riêng và Khối lượng nặng (Weight).
- Index toàn vẹn dữ liệu Sản phẩm lên Search Engine **ElasticSearch**. Hỗ trợ truy vấn mở rộng theo nhiều Filter (Dải giá, Danh mục cha/con, Lượng Rating, Độ hot bán ra).
- REST API CRUD sản phẩm từ phía Seller. Upload list hình ảnh đồng bộ qua hệ thống Stream của Multer & Cloudinary. Xóa mềm/hủy kích hoạt sản phẩm.
- Đánh giá (Review / Rating) sản phẩm có logic thắt chặt - chỉ hỗ trợ cho Order item đã xác nhận hoàn thành mua hàng thành công.

### 5. Quản Lý Giỏ Hàng (Cart Module)
- Hoạt động 100% trên RAM thông qua Pipeline cấu trúc Redis Hash hạn chế Disk I/O, cho tốc độ thao tác (thêm/sửa số lượng) siêu tốc.
- Hỗ trợ lưu giữ giỏ hàng khách Vãng Lai (Guest Cart dựa trên Token Browser) và đồng bộ (Merge / Sync) giỏ vãng lai này vào tài khoản thực ngay khi đăng nhập.
- Kiểm tra tính lệ của sản phẩm (Trạng thái ẩn/xóa) và Ràng buộc số lượng kho (Max Stock validation) khi nạp vào xe hàng.
- Logic đồng bộ rảnh tay (Background Sync): Mọi Request thay đổi trên Redis sẽ nạp Action `syncCart` cho Queue (BullMQ) để Worker tự động xử lý lưu lại vào CSDL gốc sau 5s nhàn rỗi.

### 6. Khuyến Mãi & Mã Giảm Giá (Voucher System)
- Quản lý **Platform Voucher** (Mã giảm giá toàn hệ thống - áp dụng tổng hóa đơn).
- Quản lý **Shop Voucher** (Mã giảm nội bộ của gian hàng hỗ trợ - cấp độc lập).
- Bộ Rule Ràng buộc cực sâu: Check Số lượng cấp phát tối đa, Giới hạn quy đổi lần / 1 User, Check hạn Start/End Date, Loại (Discount %), hoặc Cố định (Fixed Value), Mức chặn trần (Max Discount Amount), Khóa số tiền Order tối thiểu.
- Trigger Locking Voucher thông qua Database Transaction để không vượt giới hạn xài cùng lúc.

### 7. Lên Đơn & Checkout (Orders Split)
- Tính phí vận chuyển (Shipping Rate Calculator) Real-time qua API của Giao Hàng Nhanh (GHN) cho mỗi shop khác nhau, căn bản trên `weight` đóng gói và địa lí (Province/Ward).
- Logic tách Đơn khổng lồ: 
  - Khởi tạo `Master Order` (hóa đơn thanh toán gom tổng trải nghiệm).
  - Tách nó thành các `Sub Orders` (Hóa đơn kho vận giao dịch cho mỗi Shop nhỏ). Tính toán và chia nhỏ mã giảm Platform (Platform Discount Share Allocation) dựa theo tỷ lệ % mà Sub Order đóng góp trên đơn Tổng.
- Tính tự động phần chia hoa hồng `Commission Amount` - số tiền sàn giữ lại. `Real Amount` - số tiền thật Seller nhận về.
- Ràng Buộc Atomic Transaction Inventory Locking (Khóa tồn kho chớp nhoáng theo DB Transaction) trong quá trình tạo đơn, chống Over-selling (1 áo 2 khách mua đồng thời).
- Tránh trùng yêu cầu với Middleware **Idempotency Keys** độc lập.

### 8. Thanh Toán Thông Minh (Payments Gateways)
- Hỗ trợ COD Cơ bản và **VNPay Tích hợp Webhook**.
- Đảm bảo Security IPN qua `HmacSHA512` Verify Hash. Bắt các event Thanh toán Thành công / Thất bại.
- Nhả event Payment Timeout - kết hợp BullMQ Delay Task 15 phút. Nếu Frontend mở VNPay ra không quét mã hoặc bỏ ngang thì Backend sẽ chủ động tự Reject Payment, tự Reject Order và Release (bơm trả lại) Tồn kho nguyên bản.

### 9. Giao Tiếp Real-time & Cảnh Báo (Notifications/Chat)
- Socket.io cho Nhắn tin trực tiếp giữa khách hàng (User) và chủ shop (Seller) theo mẫu Conversation -> Message (Loại bỏ F5 làm mới ChatBox).
- Notifications Sub-system: Tự động nhả thông báo Notification khi Thay đổi trạng thái Sub-Order (Bạn có Đơn Mới, Đã giao thành công, Cập nhật chuẩn bị hàng), Bắn báo Hủy Đơn...

### 10. Luân Chuyển Hủy & Hoàn Đơn / Hoàn Tiền (Refunds/Revert Cancellations)
- Khách có Quyền Hủy Đơn tức khắc (Auto-Cancel) với các đơn `PENDING_PAYMENT` (VD như COD chưa duyệt). Trả Kho lập tức (Release Stock).
- Flow Phức tạp: Khách làm đơn Yêu cầu Hủy/Hoàn Tiền (Request Refund) nộp về Shop nếu tiền đã thanh toán (Paid VNPay)... chờ Shop/Admin nhấp duyệt Approval (Approve) hoặc Từ chối (Reject). Có luân chuyển Update lại Payment Allocations và xử lý Background Task (Refund qua queue).


---

## Công Nghệ Sử Dụng (Tech Stack)

### 1. Kiến trúc Core
- **Node.js & Express.js:** Framework linh hoạt chạy trên runtime V8.
- **TypeScript:** Ràng buộc kiểu dữ liệu tĩnh mạnh mẽ, tăng cường an toàn cho dự án lớn.
- **SQL Server & Prisma ORM:** Quản trị dữ liệu quan hệ, Migration mượt mà.

### 2. Microservices Components (Thành phần hệ thống phân tán)
- **Redis (ioredis):** Chịu trách nhiệm Caching (Tối ưu truy vấn DB), Quản lý Giỏ hàng và Cơ chế Rate Limit.
- **BullMQ:** Message Queue hỗ trợ Event-Driven Architecture xử lý Background Jobs như: Gửi Email, Dọn dẹp tài nguyên (Cleanup Worker), Đồng bộ (Sync) Giỏ hàng, Đóng vòng đời (Expire) Đơn hàng / Thanh toán.
- **Elasticsearch:** Công cụ Search Engine dùng riêng cho việc Lọc / Tìm kiếm sản phẩm.

### 3. Third-party & DevOps tools
- **Socket.io:** WebSockets cho thông báo theo thời gian thực (Real-time notifications).
- **VNPay API:** Xử lý luồng thanh toán (Payment Gateway).
- **GHN API:** Tích hợp tính phí giao vận và Tracking.
- **Cloudinary / Multer:** Quản lý tệp/phương tiện (Upload Image & Avatar).
- **Google OAuth2 & JWT:** Xác thực Identity (Bảo mật qua refresh token cookies).
- **Nodemailer:** Dispatch gửi Mail từ hệ thống.
- **Swagger:** Khởi tạo API Documents minh bạch cho Client.
- **Docker & Docker Compose:** Container hóa Redis, MSSQL, ElasticSearch nhằm thiết lập môi trường (Enviroment) dễ dàng.

---

## Cấu Trúc Thư Mục Hệ Thống (Directory Layout)

```text
Backend/
├── prisma/               # Chứa file cấu hình Database và Seeders
├── src/                  
│   ├── cache/            # Cấu trúc hệ thống Caching (Tags, Key Generators)
│   ├── config/           # Setup kết nối Third-party (ES, Redis, Prisma, Cloudinary)
│   ├── constants/        # Các Enum, App Default Settings
│   ├── controllers/      # Điểm ra/vào Request & Response logic API
│   ├── dtos/             # Data Transfer Objects (Request/Response validators & Formatter)
│   ├── error/            # AppError classes cho cấu hình Custom Global Error handling
│   ├── middlewares/      # Authentication, Validation, Idempotent, Rate Limiter
│   ├── queues/           # Định nghĩa BullMQ cho các Background Jobs
│   ├── repositories/     # Database logic / Data Access Layer (Truy vấn DB)
│   ├── routes/           # Định tuyến (Routing Maps)
│   ├── services/         # Core Business Logic (Nghiệp vụ cốt lõi)
│   ├── socket/           # Realtime Sockets setup
│   ├── utils/            # Helper functions (Hash, JWT, Utils helpers)
│   ├── workers/          # Background worker instances để Start tác vụ chạy ngầm
│   ├── app.ts            # Export Core của Express.App
│   └── server.ts         # Điểm chốt khởi động của Service (Listen HTTP)
├── Dockerfile            # Cấu trúc Image cho việc release version
├── docker-compose.yml    # Build full stack infra dependencies
└── package.json          # Node.js dependencies & scripts
```

---

## Hướng Dẫn Cài Đặt và Khởi Chạy (Getting Started)

### 1. Yêu cầu (Prerequisites)
- [Node.js](https://nodejs.org/) (Version >= 20.x.x)
- Docker Desktop (Dùng chạy CSDL và các engine ngầm).

### 2. Thiết lập dự án

**Bước 1:** Clone dự án và cài đặt dependencies.
```bash
git clone https://github.com/your-username/ecommerce-marketplace-backend.git
cd ecommerce-marketplace-backend
npm install
```

**Bước 2:** Cài đặt Biến Môi Trường (Environment Variables).
Tạo một tệp `.env` dựa theo mẫu `.env.example`:
```bash
cp .env.example .env
```
*(Hãy điền đủ thông số liên quan đến Database, Cổng VNPay, Token GHN của gian hàng môi trường Dev, JWT Secrets).*

**Bước 3:** Chạy hệ thống các Services ngầm thông qua Docker Compose.
```bash
docker-compose -f docker-compose.dev.yml up -d
```
*(Lệnh này sẽ khởi động MS SQL Server, Redis, Elasticsearch v8 theo thiết lập).*

**Bước 4:** Áp dụng DB Schemas với Prisma & Khởi tạo dữ liệu.
```bash
npx prisma generate
npx prisma db push
# Chạy seeds để tạo dummy data (Users, Roles, Products)
npm run seed:data  
# Đồng bộ Products lên Elasticsearch
npm run sync:products:es
```

### 3. Chạy môi trường phát triển (Development Setup)

Hệ thống Core API và các Background Task Worker riêng biệt. Để khởi chạy đầy đủ, bạn cần chạy Command trên nhiều Terminal cá biệt:

- Chạy Main API Server:
  ```bash
  npm run dev
  ```

- Chạy các Background Workers (Mở các tab terminal mới):
  ```bash
  npm run start:cart-worker     # Xử lý đồng bộ giỏ hàng
  npm run start:order-worker    # Xử lý luồng hủy đơn
  npm run start:payment-worker  # Xử lý luồng timeout thanh toán
  npm run start:email-worker    # Xử lý bắn email
  npm run start:cleanup-worker  # Dọn dẹp token cũ/data thừa
  ```

---

## Tài Liệu API (API Specification)

Dự án cung cấp bộ tài liệu RESTful API được thiết kế đẹp mắt bằng **Swagger UI**.
Sau khi Start thành công Main Server, hãy truy cập đường dẫn: 
`http://localhost:<PORT>/api-docs` (ví dụ `http://localhost:5000/api-docs`)

Tại đây, bạn sẽ dễ dàng thực hiện Testing các endpoint, thấy được luồng dữ liệu truyền vào/truyền ra (DTOs Schema), và flow Error Codes.

---

## 🛡 License

Dự án được mã nguồn mở dựa trên [ISC License](LICENSE).
