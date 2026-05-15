# Gợi ý trả lời thầy - Phần core Auth, Wallet, Transaction, Category

Tài liệu này được viết để hỗ trợ trình bày miệng trước giảng viên. Nội dung bám sát phần việc cá nhân gồm: `Auth`, `Wallet`, `Transaction`, `Category`.

---

## 1. Tổng quan phần em phụ trách

Phần em phụ trách là phần `core` của hệ thống, gồm 3 nhóm nghiệp vụ chính:

- Xác thực người dùng: đăng ký, đăng nhập, đăng xuất
- Quản lý ví cá nhân
- Quản lý giao dịch tài chính cá nhân

Ngoài ra còn có phần `Category` để phân loại giao dịch, vì giao dịch muốn có ý nghĩa thì phải biết nó thuộc loại chi tiêu hay thu nhập nào.

Cách nói ngắn gọn:

> “Phần em làm là phần lõi của hệ thống, vì mọi nghiệp vụ tài chính đều phải bắt đầu từ xác thực người dùng, sau đó người dùng có ví để chứa tiền, và cuối cùng tạo giao dịch phát sinh trên ví đó.”

---

## 2. Thu thập yêu cầu

### 2.1 Nghiệp vụ đăng ký/đăng nhập

- Người dùng mới có thể đăng ký tài khoản.
- Người dùng cũ có thể đăng nhập bằng email và mật khẩu.
- Sau khi đăng nhập thành công, hệ thống tạo session cho người dùng.
- Các trang nghiệp vụ bên trong chỉ cho phép truy cập khi đã đăng nhập.

Điểm quan trọng:

- Hệ thống dùng `Clerk` để xử lý xác thực.
- Middleware có nhiệm vụ chặn các route riêng tư nếu user chưa đăng nhập.
- Dự án không tự cài đặt cơ chế password hashing và session từ đầu, mà tích hợp dịch vụ xác thực ngoài.

Cách giải thích:

> “Ở phần đăng nhập, em chia hệ thống thành hai lớp. Lớp đầu là validate dữ liệu đầu vào bằng schema. Lớp thứ hai là gửi yêu cầu xác thực sang Clerk. Nếu Clerk xác nhận thành công thì hệ thống kích hoạt session và cho người dùng vào hệ thống.”

### 2.2 Nghiệp vụ quản lý ví

- Mỗi người dùng có thể tạo nhiều ví.
- Ví có thể là tiền mặt, tài khoản ngân hàng, ví điện tử hoặc thẻ tín dụng.
- Mỗi ví có tên, loại, tiền tệ và icon.
- Người dùng có thể tạo, sửa, xóa ví.
- Số dư ví được tính từ tổng giao dịch thu trừ tổng giao dịch chi.

Điểm quan trọng:

- Một ví luôn thuộc về một người dùng.
- Mỗi giao dịch luôn phải gắn với một ví.
- Không lưu số dư ví cứng trong bảng, mà tính từ giao dịch để đảm bảo tính nhất quán.

Cách giải thích:

> “Ví là nơi quy chiếu dòng tiền. Nếu không có ví thì không biết giao dịch đó phát sinh từ đâu. Em chọn cách tính số dư ví động từ giao dịch, vì như vậy khi sửa hoặc xóa giao dịch thì dữ liệu vẫn chính xác.”

### 2.3 Nghiệp vụ quản lý giao dịch

- Người dùng có thể tạo giao dịch thu hoặc chi.
- Mỗi giao dịch gồm: số tiền, ngày, mô tả, loại giao dịch, danh mục, ví.
- Khi tạo giao dịch, hệ thống kiểm tra dữ liệu đầu vào trước.
- Hệ thống kiểm tra ví có tồn tại và có thuộc về user không.
- Hệ thống kiểm tra danh mục:
  - nếu đã tồn tại thì dùng lại
  - nếu chưa có thì tạo mới
- Sau đó hệ thống lưu giao dịch vào database.
- Người dùng cũng có thể sửa và xóa giao dịch.

Điểm quan trọng:

- Giao dịch là trung tâm của hệ thống tài chính.
- Mọi thống kê, số dư, lịch sử đều dựa trên transaction.
- Sau khi tạo/sửa/xóa transaction, hệ thống cập nhật thêm `MonthHistory` và `YearHistory`.

Cách giải thích:

> “Transaction không chỉ là CRUD đơn giản. Khi một transaction thay đổi thì các dữ liệu tổng hợp phía sau cũng phải thay đổi theo, nên phần này ảnh hưởng trực tiếp đến dashboard và báo cáo.”

### 2.4 Nghiệp vụ danh mục

- Danh mục dùng để phân loại giao dịch.
- Có hai loại danh mục chính: `income` và `expense`.
- Người dùng có thể tạo và xóa danh mục.
- Danh mục giúp báo cáo theo nhóm chi tiêu hoặc nguồn thu.

Cách giải thích:

> “Category là phần phân loại giao dịch. Nếu không có category thì chỉ biết có phát sinh tiền, nhưng không biết đó là ăn uống, đi lại hay lương, đầu tư.”

---

## 3. UC Specification

## UC-Login

### Mục tiêu

Cho phép người dùng đăng nhập vào hệ thống để truy cập các chức năng cá nhân.

### Actor chính

- Người dùng

### Tiền điều kiện

- Người dùng đã có tài khoản

### Hậu điều kiện

- Session được tạo
- Người dùng vào được hệ thống

### Luồng chính

1. Người dùng mở form đăng nhập.
2. Nhập email và mật khẩu.
3. Hệ thống kiểm tra định dạng dữ liệu bằng `authSchema`.
4. Nếu hợp lệ, hệ thống gọi `signIn.create()` của Clerk.
5. Clerk xác thực tài khoản.
6. Nếu thành công, hệ thống gọi `setActive()` để kích hoạt session.
7. Điều hướng người dùng về trang chính.

### Ngoại lệ

- Email sai định dạng
- Mật khẩu ngắn hơn quy định
- Tài khoản hoặc mật khẩu không đúng

Cách nói:

> “Use case login của em đi theo hướng validate đầu vào trước, rồi mới xác thực thực tế bằng Clerk. Sau khi Clerk trả về thành công thì session mới được active.”

---

## UC-ManageWallet

### Mục tiêu

Cho phép người dùng quản lý các ví cá nhân.

### Actor chính

- Người dùng đã đăng nhập

### Tiền điều kiện

- Người dùng đã đăng nhập

### Hậu điều kiện

- Ví được tạo, sửa hoặc xóa thành công

### Luồng chính

1. Người dùng truy cập màn hình Wallets.
2. Chọn tạo ví mới hoặc chỉnh sửa ví cũ.
3. Nhập thông tin ví: tên, loại ví, tiền tệ, icon.
4. Hệ thống validate dữ liệu bằng schema Zod.
5. Hệ thống lưu thay đổi vào database.
6. Giao diện cập nhật lại danh sách ví.

### Ngoại lệ

- Thiếu tên ví
- Tên ví quá dài
- Ví không tồn tại khi sửa hoặc xóa

Cách nói:

> “ManageWallet là use case CRUD chuẩn, nhưng điều em chú ý là mọi thao tác đều gắn với `userId` để đảm bảo tính sở hữu dữ liệu.”

---

## UC-ManageTransaction

### Mục tiêu

Cho phép người dùng tạo, sửa, xóa và xem giao dịch tài chính.

### Actor chính

- Người dùng đã đăng nhập

### Tiền điều kiện

- Người dùng đã đăng nhập
- Có ít nhất một ví

### Hậu điều kiện

- Giao dịch được thay đổi thành công
- Lịch sử tổng hợp được cập nhật

### Luồng chính khi tạo giao dịch

1. Người dùng mở form tạo giao dịch.
2. Chọn loại giao dịch là thu hoặc chi.
3. Nhập số tiền, ngày, mô tả, danh mục, ví.
4. Hệ thống validate bằng `CreateTransactionSchema`.
5. Hệ thống kiểm tra ví có thuộc về người dùng không.
6. Hệ thống tìm category:
   - có rồi thì dùng
   - chưa có thì tạo
7. Hệ thống tạo `Transaction`.
8. Hệ thống cập nhật `MonthHistory`.
9. Hệ thống cập nhật `YearHistory`.
10. Trả kết quả thành công.

### Luồng sửa giao dịch

- Tìm giao dịch cũ theo `id + userId`
- Kiểm tra ví mới
- Cập nhật transaction
- Tính lại tổng hợp tháng và năm

### Luồng xóa giao dịch

- Tìm giao dịch theo `id + userId`
- Xóa giao dịch
- Trừ lại dữ liệu tổng hợp tháng và năm

### Ngoại lệ

- Wallet không tồn tại
- Giao dịch không tồn tại
- Dữ liệu đầu vào không hợp lệ

Cách nói:

> “Use case transaction là use case quan trọng nhất vì nó là nơi dữ liệu tài chính thật sự phát sinh. Em không chỉ lưu transaction mà còn cập nhật các bảng tổng hợp để hệ thống báo cáo chính xác.”

---

## 4. Entity core

## 4.1 User

Về mặt phân tích hệ thống, `User` là thực thể sở hữu toàn bộ dữ liệu cá nhân.

### Vai trò

- Đăng nhập vào hệ thống
- Sở hữu ví
- Sở hữu giao dịch
- Sở hữu danh mục

### Lưu ý triển khai

- Trong dự án thực tế, user được quản lý bởi `Clerk`
- Trong database nội bộ không có bảng `users` truyền thống
- Hệ thống sử dụng `userId` để liên kết dữ liệu

Cách nói:

> “Về mặt phân tích thì vẫn có entity User. Nhưng ở mức triển khai, hệ thống không tự quản lý bảng users mà dùng Clerk, còn trong database nội bộ chỉ dùng `userId` làm khóa tham chiếu.”

## 4.2 Wallet

### Thuộc tính chính

- `id`
- `userId`
- `name`
- `type`
- `currency`
- `icon`
- `createdAt`

### Vai trò

- Đại diện cho nguồn chứa tiền
- Là nơi gắn các giao dịch
- Là cơ sở để tính số dư

## 4.3 Transaction

### Thuộc tính chính

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

- Ghi nhận một sự kiện tài chính cụ thể
- Là thực thể trung tâm của hệ thống
- Dùng để tính số dư và thống kê

## 4.4 Category

### Thuộc tính chính

- `name`
- `userId`
- `icon`
- `type`
- `createdAt`

### Vai trò

- Phân loại giao dịch
- Hỗ trợ báo cáo theo nhóm
- Tăng ý nghĩa cho transaction

---

## 5. Relationship

## 5.1 User - Wallet

- Một người dùng có thể có nhiều ví
- Một ví chỉ thuộc về một người dùng

Cardinality:

- `User 1 - n Wallet`

## 5.2 Wallet - Transaction

- Một ví có thể có nhiều giao dịch
- Một giao dịch bắt buộc thuộc về một ví

Cardinality:

- `Wallet 1 - n Transaction`

## 5.3 Transaction - Category

- Một category có thể được dùng bởi nhiều transaction
- Một transaction gắn với một category tại thời điểm ghi nhận

Cardinality:

- `Category 1 - n Transaction`

Lưu ý:

- Trong code triển khai, transaction lưu `category` và `categoryIcon` dạng text
- Nhưng về mặt phân tích, đây vẫn là quan hệ phân loại chuẩn giữa category và transaction

Cách nói:

> “Ở mức phân tích em biểu diễn Transaction thuộc Category. Còn ở mức code, em lưu tên và icon của category ngay trong transaction để giữ snapshot dữ liệu tại thời điểm phát sinh.”

---

## 6. Analysis Class

## 6.1 Class User

### Thuộc tính

- `userId`
- `email`

### Trách nhiệm

- Đăng nhập
- Quản lý dữ liệu cá nhân
- Sở hữu wallet, transaction, category

## 6.2 Class Wallet

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

## 6.3 Class Transaction

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

## 6.4 Class Category

### Thuộc tính

- `name`
- `type`
- `icon`

### Phương thức

- `createCategory()`
- `deleteCategory()`
- `getCategoriesByType()`

Cách nói:

> “Ở mức analysis class, em tập trung vào trách nhiệm của lớp chứ chưa đi sâu vào framework. User là chủ sở hữu dữ liệu, Wallet là nơi chứa dòng tiền, Transaction là bản ghi nghiệp vụ trung tâm, Category là lớp phân loại.”

---

## 7. Sequence Diagram

## 7.1 Sequence đăng nhập

### Diễn giải

1. Người dùng nhập email và mật khẩu trên giao diện.
2. Form gửi dữ liệu đến lớp xử lý đăng nhập.
3. Hệ thống validate dữ liệu đầu vào bằng Zod.
4. Nếu hợp lệ thì gửi thông tin sang Clerk.
5. Clerk kiểm tra tài khoản.
6. Nếu thành công, hệ thống kích hoạt session bằng `setActive()`.
7. Hệ thống điều hướng người dùng vào trang chính.

Cách nói:

> “Luồng đăng nhập của em gồm ba bước: nhập liệu ở UI, validate đầu vào, rồi xác thực thực tế ở Clerk.”

## 7.2 Sequence thêm giao dịch cá nhân

### Diễn giải

1. Người dùng mở form thêm giao dịch.
2. Nhập loại giao dịch, số tiền, ngày, mô tả, ví, danh mục.
3. Gửi form đến action `createTransaction`.
4. Action validate dữ liệu bằng schema.
5. Hệ thống kiểm tra ví thuộc user.
6. Hệ thống kiểm tra danh mục:
   - nếu có thì dùng lại
   - nếu chưa có thì tạo
7. Hệ thống tạo transaction trong database.
8. Đồng thời cập nhật `MonthHistory`.
9. Đồng thời cập nhật `YearHistory`.
10. Trả kết quả thành công.
11. Giao diện làm mới dữ liệu.

Điểm nhấn:

> “Sequence transaction quan trọng ở chỗ ngoài việc lưu dữ liệu chính còn phải cập nhật dữ liệu thống kê đi kèm.”

---

## 8. Detailed Design

## 8.1 WalletAction

### Hàm chính

- `createWallet(userId, form)`
- `getWallets(userId)`
- `getWalletById(walletId, userId)`
- `updateWallet(userId, form)`
- `deleteWallet(userId, walletId)`
- `getWalletBalance(walletId, userId)`

### Ý nghĩa

- Đây là module xử lý toàn bộ nghiệp vụ liên quan đến ví.

## 8.2 TransactionAction

### Hàm chính

- `createTransaction(userId, form)`
- `updateTransaction(userId, form)`
- `DeleteTransaction(id)`
- `getTransactionsHistory(from, to, userId?)`
- `getBalanceStats(userId, from, to)`

### Ý nghĩa

- Đây là module quan trọng nhất vì nó điều khiển việc tạo/sửa/xóa giao dịch và cập nhật dữ liệu tổng hợp.

## 8.3 CategoryAction

### Hàm chính

- `getCategoriesByType(userId, type)`
- `createCategory(userId, form)`
- `deleteCategory(userId, form)`

## 8.4 Auth Layer

### Thành phần chính

- `SignInForm`
- `authSchema`
- `middleware.ts`
- Clerk `useSignIn`, `setActive`, `auth().protect()`

Cách nói:

> “Ở phần thiết kế chi tiết, em biểu diễn theo module/hàm thực tế trong code để cho thấy mỗi thành phần chịu trách nhiệm rõ ràng.”

---

## 9. ERD core

## 9.1 User

Ở mức phân tích:

- `id`
- `email`

Ở mức triển khai:

- User do Clerk quản lý
- Dự án nội bộ dùng `userId` làm khóa liên kết

## 9.2 Wallet

- `id` PK
- `userId`
- `name`
- `type`
- `currency`
- `icon`
- `createdAt`

## 9.3 Transaction

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

## 9.4 Category

- `userId`
- `name`
- `icon`
- `type`
- `createdAt`

Giải thích:

> “ERD core của em xoay quanh user, wallet, transaction và category. Trong đó wallet và transaction có quan hệ trực tiếp mạnh nhất.”

---

## 10. Test Case core

## 10.1 Nhóm Auth

- Đăng nhập với email/password hợp lệ
- Đăng nhập với email sai định dạng
- Đăng nhập với mật khẩu quá ngắn
- Truy cập route bảo vệ khi chưa đăng nhập

## 10.2 Nhóm Wallet

- Tạo ví hợp lệ
- Tạo ví thiếu tên
- Sửa ví tồn tại
- Xóa ví tồn tại
- Tính số dư ví đúng

## 10.3 Nhóm Transaction

- Tạo giao dịch thu hợp lệ
- Tạo giao dịch chi hợp lệ
- Tạo giao dịch với wallet không tồn tại
- Sửa giao dịch hợp lệ
- Xóa giao dịch hợp lệ
- Xem lịch sử giao dịch theo khoảng ngày

---

## 11. Đoạn trả lời mẫu 3-5 phút

> “Phần em phụ trách là phần core của hệ thống, gồm xác thực người dùng, quản lý ví, quản lý giao dịch và danh mục.  
> Về xác thực, hệ thống dùng Clerk để xử lý đăng nhập, đăng ký và session; phía dự án của em chịu trách nhiệm validate dữ liệu đầu vào và bảo vệ route bằng middleware.  
> Về ví, mỗi người dùng có thể tạo nhiều ví khác nhau như tiền mặt, ngân hàng, ví điện tử. Ví là nơi quy chiếu dòng tiền và số dư ví được tính động từ tổng thu trừ tổng chi.  
> Về giao dịch, người dùng có thể tạo giao dịch thu hoặc chi, mỗi giao dịch bắt buộc gắn với một ví và một danh mục. Khi tạo giao dịch, hệ thống kiểm tra dữ liệu, kiểm tra quyền sở hữu ví, xử lý danh mục, rồi mới lưu vào database. Sau đó hệ thống cập nhật các bảng lịch sử để phục vụ thống kê và báo cáo.  
> Về mặt mô hình dữ liệu, bốn thực thể core là User, Wallet, Transaction và Category. Quan hệ chính là một user có nhiều wallet, một wallet có nhiều transaction, và category dùng để phân loại transaction.  
> Phần thiết kế chi tiết của em được hiện thực qua các action như WalletAction, TransactionAction và CategoryAction, còn phần kiểm thử tập trung vào Auth, Wallet và Transaction vì đây là luồng xương sống của hệ thống.”

---

## 12. Câu hỏi phụ thầy có thể hỏi

### Vì sao dùng Clerk?

> “Vì Clerk giúp chuẩn hóa xác thực, giảm rủi ro bảo mật và giúp nhóm tập trung vào nghiệp vụ tài chính thay vì tự xây auth từ đầu.”

### Vì sao transaction phải gắn wallet?

> “Để biết dòng tiền phát sinh ở nguồn nào. Nếu không gắn wallet thì không thể tính số dư từng ví.”

### Vì sao số dư ví không lưu trực tiếp?

> “Vì lưu trực tiếp dễ lệch dữ liệu khi có sửa hoặc xóa giao dịch. Tính từ transaction sẽ nhất quán hơn.”

### Category có vai trò gì?

> “Category giúp phân loại thu chi, từ đó phục vụ thống kê, báo cáo và phân tích hành vi chi tiêu.”

### Giao dịch có phải chỉ là CRUD không?

> “Không. Ngoài CRUD, nó còn kéo theo cập nhật bảng tổng hợp, nên transaction là nghiệp vụ trung tâm của hệ thống.”

