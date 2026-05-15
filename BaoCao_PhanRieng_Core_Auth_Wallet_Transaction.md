# BÁO CÁO CHI TIẾT PHẦN RIÊNG CÁ NHÂN

## Phạm vi phần việc

Phần việc cá nhân tập trung vào `core module` của hệ thống quản lý tài chính cá nhân, gồm các thành phần:

- Xác thực người dùng (`Auth`)
- Quản lý ví (`Wallet`)
- Quản lý giao dịch (`Transaction`)
- Quản lý danh mục (`Category`)

Đây là phần lõi vì toàn bộ nghiệp vụ tài chính phía sau đều phụ thuộc vào việc người dùng được xác thực, có ví để quản lý dòng tiền và có giao dịch để phát sinh dữ liệu thực tế.

---

## 1. Thu thập yêu cầu

### 1.1 Mô tả nghiệp vụ đăng ký/đăng nhập

Hệ thống cần cho phép người dùng mới đăng ký tài khoản và người dùng cũ đăng nhập để truy cập dữ liệu cá nhân. Khi đăng nhập thành công, hệ thống tạo phiên làm việc cho người dùng và cho phép truy cập các chức năng bên trong như ví, giao dịch và báo cáo.

Trong dự án này:

- Việc xác thực được tích hợp thông qua `Clerk`
- Form đăng nhập dùng `React Hook Form`
- Dữ liệu đầu vào được kiểm tra bằng `Zod`
- Middleware được dùng để bảo vệ route riêng tư

Yêu cầu chính:

- Email phải đúng định dạng
- Mật khẩu phải đạt độ dài tối thiểu
- Người dùng chưa đăng nhập không được truy cập các trang nghiệp vụ chính

### 1.2 Mô tả nghiệp vụ quản lý ví

Hệ thống cần cho phép mỗi người dùng tạo và quản lý nhiều ví. Mỗi ví đại diện cho một nơi chứa tiền như:

- Tiền mặt
- Tài khoản ngân hàng
- Ví điện tử
- Thẻ tín dụng

Yêu cầu nghiệp vụ:

- Người dùng có thể tạo ví mới
- Người dùng có thể chỉnh sửa thông tin ví
- Người dùng có thể xóa ví
- Hệ thống phải tính được số dư ví dựa trên giao dịch

Thông tin của ví gồm:

- Tên ví
- Loại ví
- Tiền tệ
- Icon đại diện

### 1.3 Mô tả nghiệp vụ quản lý giao dịch

Hệ thống cần cho phép người dùng ghi nhận các giao dịch tài chính cá nhân. Đây là nghiệp vụ trung tâm của toàn bộ hệ thống.

Yêu cầu nghiệp vụ:

- Người dùng tạo giao dịch thu
- Người dùng tạo giao dịch chi
- Người dùng sửa giao dịch
- Người dùng xóa giao dịch
- Người dùng xem lịch sử giao dịch theo khoảng ngày

Thông tin giao dịch gồm:

- Số tiền
- Ngày giao dịch
- Mô tả
- Loại giao dịch: `income` hoặc `expense`
- Danh mục
- Ví

Ngoài việc lưu transaction, hệ thống còn phải:

- Kiểm tra ví có thuộc người dùng không
- Kiểm tra danh mục đã tồn tại chưa
- Tạo danh mục mới nếu cần
- Cập nhật dữ liệu tổng hợp theo ngày/tháng/năm

### 1.4 Mô tả nghiệp vụ danh mục

Danh mục là thành phần hỗ trợ quản lý giao dịch. Nó giúp người dùng biết giao dịch thuộc nhóm nào, từ đó phục vụ cho thống kê và báo cáo.

Yêu cầu nghiệp vụ:

- Có danh mục cho giao dịch thu
- Có danh mục cho giao dịch chi
- Người dùng có thể tự tạo danh mục
- Người dùng có thể xóa danh mục

---

## 2. UC Specification

## 2.1 UC-Login

### Tên use case

- `UC-Login`

### Actor chính

- Người dùng

### Mục tiêu

- Đăng nhập vào hệ thống để sử dụng các chức năng cá nhân

### Tiền điều kiện

- Người dùng đã có tài khoản

### Hậu điều kiện

- Session được tạo
- Người dùng truy cập được hệ thống

### Luồng chính

1. Người dùng mở form đăng nhập.
2. Nhập email và mật khẩu.
3. Hệ thống validate dữ liệu đầu vào.
4. Hệ thống gửi thông tin xác thực sang Clerk.
5. Clerk kiểm tra tài khoản.
6. Nếu xác thực thành công, hệ thống active session.
7. Hệ thống điều hướng người dùng vào trang chính.

### Luồng ngoại lệ

- Email không hợp lệ
- Mật khẩu quá ngắn
- Thông tin đăng nhập sai

---

## 2.2 UC-ManageWallet

### Tên use case

- `UC-ManageWallet`

### Actor chính

- Người dùng đã đăng nhập

### Mục tiêu

- Quản lý các ví cá nhân

### Tiền điều kiện

- Người dùng đã đăng nhập

### Hậu điều kiện

- Ví được tạo, sửa hoặc xóa thành công

### Luồng chính

1. Người dùng mở trang Wallets.
2. Chọn tạo ví mới hoặc chỉnh sửa ví hiện có.
3. Nhập tên ví, loại ví, tiền tệ và icon.
4. Hệ thống validate dữ liệu.
5. Hệ thống lưu thông tin ví vào database.
6. Danh sách ví được cập nhật.

### Luồng ngoại lệ

- Thiếu tên ví
- Loại ví không hợp lệ
- Ví không tồn tại khi chỉnh sửa/xóa

---

## 2.3 UC-ManageTransaction

### Tên use case

- `UC-ManageTransaction`

### Actor chính

- Người dùng đã đăng nhập

### Mục tiêu

- Quản lý giao dịch thu chi cá nhân

### Tiền điều kiện

- Người dùng đã đăng nhập
- Có ít nhất một ví

### Hậu điều kiện

- Giao dịch được tạo, sửa hoặc xóa
- Dữ liệu tổng hợp được cập nhật

### Luồng chính khi tạo giao dịch

1. Người dùng mở form tạo giao dịch.
2. Chọn loại giao dịch.
3. Nhập số tiền, ngày, mô tả, danh mục, ví.
4. Hệ thống validate dữ liệu đầu vào.
5. Hệ thống kiểm tra ví có thuộc người dùng không.
6. Hệ thống kiểm tra danh mục:
   - Nếu có thì dùng lại
   - Nếu chưa có thì tạo mới
7. Hệ thống lưu giao dịch.
8. Hệ thống cập nhật lịch sử tổng hợp tháng và năm.
9. Trả kết quả thành công.

### Luồng chính khi sửa giao dịch

1. Người dùng chọn giao dịch cần sửa.
2. Hệ thống lấy dữ liệu cũ.
3. Người dùng cập nhật thông tin mới.
4. Hệ thống validate dữ liệu.
5. Hệ thống cập nhật transaction.
6. Hệ thống cập nhật lại dữ liệu tổng hợp.

### Luồng chính khi xóa giao dịch

1. Người dùng chọn giao dịch cần xóa.
2. Hệ thống kiểm tra giao dịch tồn tại.
3. Hệ thống xóa transaction.
4. Hệ thống trừ lại dữ liệu tổng hợp tháng và năm.

### Luồng ngoại lệ

- Wallet không tồn tại
- Giao dịch không tồn tại
- Dữ liệu không hợp lệ

---

## 3. Entity core

## 3.1 User

### Vai trò

- Là chủ sở hữu dữ liệu
- Là actor chính của hệ thống
- Sở hữu wallet, transaction và category

### Đặc điểm triển khai

- Trong dự án, xác thực user do `Clerk` quản lý
- Dữ liệu nội bộ tham chiếu user bằng `userId`

## 3.2 Wallet

### Thuộc tính

- `id`
- `userId`
- `name`
- `type`
- `currency`
- `icon`
- `createdAt`

### Vai trò

- Là nơi chứa dòng tiền
- Là nơi gắn giao dịch
- Là cơ sở để tính số dư

## 3.3 Transaction

### Thuộc tính

- `id`
- `createdAt`
- `updateAt`
- `amount`
- `description`
- `date`
- `userId`
- `type`
- `category`
- `categoryIcon`
- `walletId`

### Vai trò

- Là bản ghi một sự kiện tài chính
- Là thực thể trung tâm của hệ thống
- Là nguồn dữ liệu cho thống kê và lịch sử

## 3.4 Category

### Thuộc tính

- `name`
- `userId`
- `icon`
- `type`
- `createdAt`

### Vai trò

- Phân loại giao dịch
- Hỗ trợ báo cáo theo nhóm thu chi

---

## 4. Relationship

## 4.1 User - Wallet

- Một user có nhiều wallet
- Một wallet chỉ thuộc một user

Quan hệ:

- `1 - n`

## 4.2 Wallet - Transaction

- Một wallet có nhiều transaction
- Một transaction bắt buộc thuộc một wallet

Quan hệ:

- `1 - n`

## 4.3 Transaction - Category

- Một category có thể phân loại nhiều transaction
- Một transaction gắn với một category

Quan hệ:

- `1 - n`

Lưu ý triển khai:

- Ở mức code, transaction lưu `category` và `categoryIcon` dạng text
- Nhưng ở mức phân tích, đây vẫn là quan hệ giữa đối tượng `Transaction` và `Category`

---

## 5. Analysis Class

## 5.1 Class User

### Trách nhiệm

- Đăng nhập vào hệ thống
- Sở hữu ví
- Sở hữu giao dịch
- Quản lý dữ liệu cá nhân

## 5.2 Class Wallet

### Thuộc tính

- `id`
- `name`
- `type`
- `currency`
- `icon`

### Phương thức

- `createWallet()`
- `updateWallet()`
- `deleteWallet()`
- `getWalletBalance()`

## 5.3 Class Transaction

### Thuộc tính

- `id`
- `amount`
- `date`
- `description`
- `type`
- `category`
- `walletId`

### Phương thức

- `createTransaction()`
- `updateTransaction()`
- `deleteTransaction()`
- `getTransactionsHistory()`

## 5.4 Class Category

### Thuộc tính

- `name`
- `type`
- `icon`

### Phương thức

- `createCategory()`
- `deleteCategory()`
- `getCategoriesByType()`

---

## 6. Sequence Diagram

## 6.1 Sequence đăng nhập

### Luồng xử lý

1. Người dùng nhập email và mật khẩu ở giao diện.
2. Form gửi dữ liệu lên phần xử lý đăng nhập.
3. Hệ thống validate đầu vào bằng `authSchema`.
4. Nếu hợp lệ, hệ thống gọi Clerk để xác thực.
5. Clerk trả kết quả xác thực.
6. Nếu thành công, hệ thống tạo session hoạt động.
7. Người dùng được điều hướng vào hệ thống.

## 6.2 Sequence thêm giao dịch cá nhân

### Luồng xử lý

1. Người dùng mở form tạo giao dịch.
2. Nhập loại giao dịch, số tiền, ngày, mô tả, danh mục và ví.
3. Hệ thống validate đầu vào bằng `CreateTransactionSchema`.
4. Hệ thống kiểm tra ví có tồn tại và thuộc user không.
5. Hệ thống kiểm tra category:
   - nếu chưa có thì tạo
   - nếu có thì dùng lại
6. Hệ thống tạo transaction trong database.
7. Hệ thống cập nhật `MonthHistory`.
8. Hệ thống cập nhật `YearHistory`.
9. Hệ thống trả kết quả thành công.

---

## 7. Detailed Design

## 7.1 Module Auth

### Thành phần

- `SignInForm`
- `authSchema`
- `middleware.ts`
- Clerk auth hooks

### Vai trò

- Validate đầu vào
- Gửi yêu cầu xác thực
- Bảo vệ route riêng tư

## 7.2 Module Wallet

### Hàm chính

- `createWallet(userId, form)`
- `getWallets(userId)`
- `getWalletById(walletId, userId)`
- `updateWallet(userId, form)`
- `deleteWallet(userId, walletId)`
- `getWalletBalance(walletId, userId)`

### Vai trò

- Thực hiện toàn bộ logic CRUD và tính số dư ví

## 7.3 Module Transaction

### Hàm chính

- `createTransaction(userId, form)`
- `updateTransaction(userId, form)`
- `DeleteTransaction(id)`
- `getTransactionsHistory(from, to, userId?)`
- `getBalanceStats(userId, from, to)`

### Vai trò

- Tạo, sửa, xóa giao dịch
- Cập nhật dữ liệu tổng hợp tháng/năm
- Trả lịch sử giao dịch cho giao diện

## 7.4 Module Category

### Hàm chính

- `getCategoriesByType(userId, type)`
- `createCategory(userId, form)`
- `deleteCategory(userId, form)`

### Vai trò

- Quản lý danh mục
- Phục vụ lựa chọn danh mục khi tạo giao dịch

---

## 8. ERD core

## 8.1 User

Ở mức phân tích:

- `id`
- `email`

Ở mức triển khai:

- User do Clerk quản lý
- Hệ thống dùng `userId` làm khóa liên kết

## 8.2 Wallet

- `id` PK
- `userId`
- `name`
- `type`
- `currency`
- `icon`
- `createdAt`

## 8.3 Transaction

- `id` PK
- `userId`
- `walletId` FK
- `amount`
- `description`
- `date`
- `type`
- `category`
- `categoryIcon`
- `createdAt`
- `updateAt`

## 8.4 Category

- `userId`
- `name`
- `icon`
- `type`
- `createdAt`

---

## 9. Test Case core

## 9.1 Nhóm Auth

- Đăng nhập với email và mật khẩu hợp lệ
- Đăng nhập với email không đúng định dạng
- Đăng nhập với mật khẩu quá ngắn
- Truy cập route bảo vệ khi chưa đăng nhập

## 9.2 Nhóm Wallet

- Tạo ví hợp lệ
- Tạo ví thiếu tên
- Sửa ví tồn tại
- Xóa ví tồn tại
- Kiểm tra số dư ví theo giao dịch

## 9.3 Nhóm Transaction

- Tạo giao dịch thu hợp lệ
- Tạo giao dịch chi hợp lệ
- Tạo giao dịch với wallet không tồn tại
- Sửa giao dịch hợp lệ
- Xóa giao dịch hợp lệ
- Xem lịch sử giao dịch theo khoảng ngày

---

## 10. Kết luận phần cá nhân

Phần việc cá nhân tập trung vào phần lõi nhất của hệ thống là xác thực, ví, giao dịch và danh mục. Đây là phần làm nền cho toàn bộ các chức năng mở rộng như ngân sách, mục tiêu, khoản vay và báo cáo.

Điểm quan trọng nhất của phần này là:

- Có xác thực người dùng rõ ràng
- Có mô hình dữ liệu wallet và transaction chặt chẽ
- Có validate đầu vào
- Có kiểm tra quyền sở hữu dữ liệu
- Có cập nhật dữ liệu tổng hợp phục vụ thống kê

Vì vậy đây là phần có ý nghĩa lớn về cả mặt nghiệp vụ lẫn kiến trúc hệ thống.

