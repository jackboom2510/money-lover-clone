# Báo cáo chi tiết phần công việc cá nhân

## Thông tin chung

Tài liệu này mô tả chi tiết phần công việc em đã thực hiện trong dự án `money-lover-clone`, tập trung vào 3 mảng chính:

1. Hoàn thiện module `Transaction`
2. Xây lại luồng `Wallet`
3. Sửa logic nghiệp vụ `Budget / Goal / Loan`

Mục tiêu của phần việc không chỉ là làm cho giao diện hoạt động, mà còn đảm bảo dữ liệu tài chính được cập nhật nhất quán giữa:

- thao tác người dùng trên giao diện
- bảng giao dịch
- số dư ví
- dashboard tổng quan
- các thực thể nghiệp vụ như budget, goal, loan

---

# 1. Hoàn thiện module Transaction

## 1.1. Vấn đề ban đầu

Trước khi chỉnh sửa, module transaction đang bị tách rời theo hai hướng:

- `/transactions` chỉ tập trung vào thêm giao dịch
- `/history` chỉ tập trung vào xem lịch sử

Ngoài ra:

- chưa có đủ CRUD
- phần edit transaction chưa hoàn chỉnh
- các thao tác create / update / delete chưa đồng bộ tốt với các thành phần liên quan như wallet, dashboard, budget, goal, loan

Điều này tạo ra trải nghiệm không liền mạch:

- người dùng phải đi qua nhiều màn khác nhau để quản lý giao dịch
- sau khi sửa hoặc xoá giao dịch, một số khu vực không tự cập nhật
- dữ liệu giao dịch có thể thay đổi nhưng dashboard hoặc entity liên quan chưa phản ánh đúng

## 1.2. Mục tiêu triển khai

Phần Transaction được triển khai lại với mục tiêu:

- đưa tất cả thao tác quản lý giao dịch về một nơi
- đủ CRUD:
  - Create
  - Read
  - Update
  - Delete
- đồng bộ dữ liệu giao dịch với wallet và các entity tài chính khác
- hỗ trợ lọc, xem lịch sử, và export

## 1.3. Phần triển khai cụ thể

### a. Gộp `/transactions` và `/history`

Em đã chuyển `/transactions` thành trang quản lý giao dịch đầy đủ.

Trang này bao gồm:

- khu thêm giao dịch thu (`income`)
- khu thêm giao dịch chi (`expense`)
- bảng lịch sử giao dịch
- bộ lọc theo ngày
- export CSV
- menu thao tác trên từng giao dịch

Đồng thời:

- `/history` không còn là một màn riêng nữa
- route `/history` được giữ lại để redirect sang `/transactions`

Lợi ích:

- người dùng chỉ cần nhớ một màn duy nhất để thao tác với transaction
- luồng sử dụng tự nhiên hơn
- giảm trùng lặp logic giữa hai trang

### b. Create transaction

Form tạo transaction đã được hoàn thiện để hỗ trợ:

- nhập số tiền
- mô tả
- ngày giao dịch
- loại giao dịch (`income` / `expense`)
- category
- wallet
- liên kết tuỳ chọn với:
  - budget
  - goal
  - loan

Khi tạo xong, hệ thống sẽ:

- lưu transaction vào database
- cập nhật lịch sử tháng (`MonthHistory`)
- cập nhật lịch sử năm (`YearHistory`)
- invalidate / refresh các query cần thiết
- đồng bộ lại các entity liên kết nếu có

### c. Read transaction

Phần đọc dữ liệu được làm thông qua bảng lịch sử giao dịch:

- hiển thị category
- mô tả
- ngày
- loại giao dịch
- số tiền định dạng theo currency
- budget / goal / loan liên quan
- thao tác dòng (`Edit`, `Delete`)

Ngoài ra còn có:

- filter category
- filter type
- chọn khoảng ngày
- phân trang
- export CSV

### d. Update transaction

Em đã bổ sung `Edit Transaction`, tức phần `Update` của CRUD.

Khi người dùng bấm `Edit`, hệ thống mở dialog chỉnh sửa và cho phép sửa:

- amount
- description
- type
- wallet
- category
- date
- liên kết budget / goal / loan

Khi lưu:

- transaction được update qua API `PUT /api/transactions`
- dữ liệu được chuẩn hoá lại
- các bảng history tháng / năm được cập nhật lại
- các entity cũ và mới liên kết với transaction đều được sync lại

Đây là điểm quan trọng, vì transaction sửa từ `income` sang `expense` hoặc đổi wallet / budget / goal / loan có thể làm thay đổi rất nhiều dữ liệu liên quan.

### e. Delete transaction

Chức năng xoá transaction được hoàn thiện để:

- xoá transaction chính
- cập nhật ngược lại month history / year history
- cập nhật dashboard
- cập nhật bảng transaction
- cập nhật wallet balance
- sync lại budget / goal / loan đang liên quan

## 1.4. Khó khăn kỹ thuật và cách xử lý

### Lỗi edit xong giao dịch “biến mất”

Có hai nguyên nhân chính đã được xử lý:

1. API update transaction từng trả về object không serialize được
   - khiến route `PUT /api/transactions` lỗi
   - phía client thấy như thao tác thất bại hoặc danh sách bị sai

2. Date normalization gây lệch múi giờ
   - khi sửa giao dịch, date có thể bị lệch khỏi khoảng lọc hiện tại
   - người dùng tưởng transaction đã bị mất

Giải pháp:

- chuẩn hóa response trả về
- lưu date theo kiểu ngày UTC thuần (`date only`) cho transaction create / edit

### Lỗi bảng history trên dashboard không refresh

Phần history trên dashboard dùng query key riêng.
Ban đầu, khi xoá transaction chỉ invalidate key quá rộng, dẫn đến có trường hợp chart / bảng không refetch rõ ràng.

Giải pháp:

- invalidate đúng key cho dashboard history
- invalidate thêm dashboard summary

## 1.5. Kết quả đạt được

Sau khi hoàn thiện:

- transaction có đủ CRUD
- `/transactions` trở thành trung tâm quản lý giao dịch
- `/history` được hợp nhất logic
- dữ liệu sau create / edit / delete phản ánh chính xác hơn trên giao diện

---

# 2. Xây lại luồng Wallet

## 2.1. Mục tiêu

Wallet là thành phần quan trọng vì mỗi transaction phải gắn với một ví cụ thể.
Do đó em triển khai lại để wallet không chỉ là dữ liệu phụ, mà trở thành một module có thể quản lý rõ ràng.

## 2.2. Chức năng đã triển khai

### a. Tạo trang `/wallets`

Trang `/wallets` được bổ sung như một màn riêng để người dùng:

- xem danh sách ví
- xem số dư từng ví
- tạo ví mới
- sửa ví
- xoá ví

### b. Create wallet

Người dùng có thể tạo ví với:

- tên ví
- loại ví
- icon
- currency

Ngoài việc tạo trang wallet riêng, em còn cho phép tạo nhanh wallet ngay trong picker khi người dùng đang tạo transaction.

### c. Edit wallet

Nút edit của wallet được nối lại thành dialog chỉnh sửa thực sự.
Người dùng có thể thay đổi:

- tên ví
- loại ví
- icon

Sau khi lưu:

- wallet list được refresh
- UI cập nhật ngay

### d. Delete wallet

Khi xoá ví:

- dữ liệu ví bị xoá
- query wallet được invalidate
- danh sách ví trên giao diện cập nhật ngay

### e. Wallet Picker

Em thêm `wallet-picker` để transaction có thể chọn ví trực tiếp.

Wallet picker hỗ trợ:

- đọc danh sách wallet
- chọn wallet hiện có
- tạo mới wallet ngay trong picker nếu chưa có ví phù hợp

## 2.3. Đồng bộ wallet với transaction

Một yêu cầu quan trọng của wallet là số dư phải thay đổi theo transaction.

Vì vậy em đã sửa để:

- tạo transaction xong -> wallet balance refresh
- sửa transaction xong -> wallet balance refresh
- xoá transaction xong -> wallet balance refresh

Nhờ đó:

- người dùng không cần reload trang
- số dư ví phản ánh nhanh theo giao dịch mới nhất

## 2.4. Vấn đề currency ở wallet

Ban đầu, currency của wallet có chỗ bị hardcode không khớp với currency người dùng chọn ở `/manage`.

Em đã xử lý để:

- ví mới tạo lấy đúng currency mặc định của user
- currency hiển thị nhất quán hơn với phần setting

## 2.5. Kết quả đạt được

Sau triển khai:

- wallet trở thành module quản lý độc lập
- transaction gắn với wallet chặt chẽ hơn
- số dư ví cập nhật đúng theo thao tác CRUD transaction

---

# 3. Sửa logic nghiệp vụ Budget / Goal / Loan

## 3.1. Đây là phần quan trọng nhất

Phần này là trọng tâm nghiệp vụ của dự án.

Vấn đề lớn ban đầu là:

- transaction là dữ liệu gốc
- nhưng budget / goal / loan lại có các field tổng hợp riêng như:
  - `spent`
  - `contributed`
  - `paidAmount`
  - `status`
  - `overdue`

Nếu transaction thay đổi mà các field này không sync lại, dữ liệu sẽ lệch giữa:

- transaction list
- dashboard
- popup quản lý entity
- select list khi link transaction

## 3.2. Vấn đề nghiệp vụ trước khi sửa

### Budget

- `Budget.spent` không được cập nhật nhất quán sau transaction create / delete / update
- phần dashboard và phần check budget có thể đọc ra số khác nhau

### Goal

- contribute goal có thể update goal chỉ bằng `id`, không chặn theo `userId`
- `contributed` không phản ánh đúng nếu transaction thay đổi
- `isCompleted` không tự cập nhật lại đúng khi số tiền góp đạt target hoặc giảm xuống

### Loan

- `paidAmount`, `status`, `overdue` không đồng bộ tốt với transaction liên kết
- check overdue có thể đọc loan theo id mà chưa scope chặt theo user

## 3.3. Giải pháp kiến trúc em áp dụng

Em chọn hướng:

**Transaction là nguồn phát sinh thay đổi**, còn state tổng hợp của `budget / goal / loan` sẽ được đồng bộ lại sau mutation.

Tức là sau khi:

- create transaction
- update transaction
- delete transaction

hệ thống sẽ chạy các hàm sync tương ứng để tính lại state hiện tại.

## 3.4. Các hàm sync đã thêm / chỉnh

### Budget

- `syncBudgetState(userId, budgetId)`

Chức năng:

- tính lại tổng expense của budget từ transaction
- cập nhật lại `Budget.spent`

### Goal

- `syncGoalState(userId, goalId)`

Chức năng:

- tính lại tổng đóng góp vào goal
- cập nhật `Goal.contributed`
- cập nhật `Goal.isCompleted`

### Loan

- `syncLoanState(userId, loanId)`

Chức năng:

- tính lại tổng số tiền đã trả
- cập nhật `Loan.paidAmount`
- cập nhật `Loan.status`
- cập nhật `Loan.overdue`

## 3.5. Ownership / Security

Em đã siết lại kiểm tra quyền sở hữu theo `userId` ở các luồng nhạy cảm:

- contribute goal
- overdue loan

Mục tiêu:

- user không được phép tác động entity của người khác chỉ bằng id
- dữ liệu nghiệp vụ nhạy cảm phải luôn gắn với user hiện tại

## 3.6. Tích hợp sync vào CRUD transaction

### Khi tạo transaction

Sau khi lưu transaction:

- nếu có `budgetId` -> sync budget
- nếu có `goalId` -> sync goal
- nếu có `loanId` -> sync loan

### Khi xoá transaction

Sau khi xoá:

- tính lại các thực thể liên quan
- tránh trường hợp goal / loan / budget giữ số cũ dù transaction đã biến mất

### Khi sửa transaction

Đây là case phức tạp nhất, vì:

- transaction có thể đổi amount
- đổi type
- đổi wallet
- đổi ngày
- đổi entity liên kết

Do đó em xử lý:

- lấy linked entity cũ
- update transaction mới
- sync lại entity cũ
- sync lại entity mới

Nhờ vậy tránh được lỗi:

- move transaction từ goal A sang goal B nhưng goal A không giảm
- chuyển loan link cũ sang loan mới nhưng loan cũ vẫn còn giữ paidAmount sai

## 3.7. Đồng bộ dashboard và UI liên quan

Sau khi sửa logic backend, em còn điều chỉnh UI để đọc nhất quán:

- dashboard summary
- dashboard overview
- entity select
- popup goal / budget / loan

Đặc biệt:

- dashboard goal không chỉ hiện số goal completed
- còn hiển thị progress theo số tiền thực góp / target

## 3.8. Currency trong Budget / Goal / Loan

Sau khi user đổi currency ở `/manage`, các phần này ban đầu vẫn hardcode `$`.

Em đã sửa để:

- dashboard overview dùng currency hiện tại của user
- popup goal / budget / loan dùng formatter theo currency hiện tại
- entity select cũng hiển thị theo currency của user

Ví dụ:

- nếu user chọn `VND`
- các amount trong dashboard và popup quản lý sẽ hiển thị theo `₫`

## 3.9. Kết quả đạt được

Sau khi hoàn thiện:

- transaction và budget / goal / loan được liên kết đúng hơn
- dashboard không còn đọc số liệu “mỗi nơi một kiểu”
- user có thể thao tác CRUD transaction mà hệ thống vẫn giữ được state nghiệp vụ chính xác

---

# 4. Kết luận cá nhân

Phần việc em thực hiện không chỉ là thêm giao diện, mà chủ yếu là:

- hợp nhất luồng sử dụng
- hoàn thiện CRUD
- sửa tính nhất quán dữ liệu
- siết lại logic nghiệp vụ
- cải thiện trải nghiệm thực tế của người dùng

Nếu mô tả ngắn gọn bằng góc nhìn kỹ thuật:

> Em tập trung vào lớp nghiệp vụ và đồng bộ dữ liệu giữa transaction với các thực thể tài chính khác, đồng thời hoàn thiện các luồng quản lý giao dịch và ví để hệ thống hoạt động nhất quán hơn.

---

# 5. Từ khoá có thể dùng khi vấn đáp

Nếu thầy hỏi sâu, bạn có thể dùng các ý sau:

- `single transaction management flow`
- `CRUD transaction`
- `state synchronization`
- `derived financial state`
- `invalidate query cache`
- `consistency between transaction and dashboard`
- `ownership check by userId`
- `domain logic for budget / goal / loan`
- `resync after create / update / delete`
- `currency consistency across UI`

---

# 6. Tóm tắt ngắn để nói miệng

Em phụ trách ba phần chính:

1. Em gộp quản lý giao dịch về một chỗ, hoàn thiện CRUD cho transaction và làm trang `/transactions` thành trung tâm quản lý giao dịch.
2. Em xây lại luồng ví, gồm tạo, sửa, xoá ví và liên kết ví với transaction.
3. Em sửa phần logic nghiệp vụ quan trọng nhất là budget, goal, loan, bằng cách đồng bộ lại trạng thái của các thực thể này mỗi khi transaction được tạo, sửa, hoặc xoá, để dashboard và dữ liệu hiển thị không bị lệch nhau.
