# Báo cáo ngắn: sửa logic Loan / Goal / Budget

## Mục tiêu

Ổn định lại logic nghiệp vụ cho `loan`, `goal`, `budget` để dữ liệu không bị lệch giữa:

- transaction được liên kết
- dashboard summary
- danh sách entity
- các API kiểm tra/trạng thái

## Vấn đề trước khi sửa

### 1. Transaction liên kết nhưng không cập nhật entity

Khi tạo hoặc xoá transaction có `budgetId`, `goalId`, `loanId`, hệ thống chỉ lưu transaction và month/year history, nhưng không đồng bộ lại:

- `Budget.spent`
- `Goal.contributed`
- `Goal.isCompleted`
- `Loan.paidAmount`
- `Loan.overdue`
- `Loan.status`

Kết quả là các màn hình khác nhau có thể hiện số liệu khác nhau cho cùng một dữ liệu.

### 2. Lỗ hổng ownership

- `contributeToGoal()` trước đây update goal chỉ theo `id`
- `getLoanOverdue()` trước đây đọc loan chỉ theo `id`

Điều này cho phép caller đã đăng nhập truy cập hoặc tác động vào entity không thuộc user hiện tại nếu có id.

### 3. Loan update có lỗi runtime

`PUT /api/loans` từng ghi `updatedAt` dù model `Loan` không có field này trong Prisma schema, gây lỗi khi update.

### 4. Action create chưa nhận đủ field từ UI

- Goal tạo mới bỏ qua `priority`
- Loan tạo mới bỏ qua `loanType`
- Một số form cũ truyền date dạng string, không khớp schema chặt hơn

## Những gì đã sửa

### 1. Đồng bộ lại state của Budget / Goal / Loan

Đã thêm các helper:

- `syncBudgetState(userId, budgetId)`
- `syncGoalState(userId, goalId)`
- `syncLoanState(userId, loanId)`

Các helper này tính lại trạng thái thật từ dữ liệu transaction hiện có và ghi lại vào entity tương ứng.

### 2. Tự động sync sau create / delete transaction

Trong `lib/actions/transactions.ts`:

- sau khi tạo transaction:
  - nếu có `budgetId` -> sync budget
  - nếu có `goalId` -> sync goal
  - nếu có `loanId` -> sync loan
- sau khi xoá transaction:
  - sync lại đúng entity tương ứng

### 3. Chặn truy cập chéo giữa user

Đã sửa các action/route để luôn scope theo `userId`:

- contribute goal
- kiểm tra overdue loan

### 4. Sửa luồng create entity cho đúng schema UI

Đã cập nhật:

- `createGoal()` nhận và lưu `priority`
- `createLoan()` nhận và lưu `loanType`
- các form cũ `create-budget`, `create-goal`, `create-loan` được đổi để truyền `Date` đúng kiểu và đủ field bắt buộc

### 5. Sửa logic hoàn thành goal và trạng thái loan

#### Goal

- contribution được tính lại từ transaction income liên kết
- `contributed` được clamp theo `targetAmount`
- `isCompleted` tự cập nhật theo số tiền thực tế

#### Loan

- `paidAmount` được tính lại từ transaction expense liên kết
- `status` được tính lại theo:
  - `paid`
  - `active`
  - `overdue`
- `overdue` được cập nhật lại từ `dueDate` và số tiền còn nợ

### 6. Sửa route update loan

`PUT /api/loans` đã bỏ field `updatedAt` không tồn tại và trả về dữ liệu sau khi sync trạng thái.

### 7. Cải thiện dữ liệu trả ra cho entity selector

Trong `entity.service.ts`:

- budget options chỉ lấy budget còn active và còn trong date range
- goal options trả thêm `isCompleted`
- loan options trả thêm `status`

## File chính đã sửa

- `lib/actions/budget.ts`
- `lib/actions/goal.ts`
- `lib/actions/loan.ts`
- `lib/actions/transactions.ts`
- `app/api/goals/[goalId]/contribute/route.ts`
- `app/api/loans/[id]/overdue/route.ts`
- `app/api/loans/route.ts`
- `lib/services/entity.service.ts`
- `components/dialog/create-budget.tsx`
- `components/dialog/create-goal.tsx`
- `components/dialog/create-loan.tsx`
- `components/dialog/goal-list.tsx`

## Kết quả mong đợi sau sửa

- số liệu budget / goal / loan không còn lệch giữa các màn hình
- transaction linked vào entity sẽ cập nhật trạng thái thật của entity đó
- dashboard summary phản ánh đúng hơn dữ liệu hiện tại
- route nhạy cảm an toàn hơn vì đã kiểm tra ownership
- sửa loan không còn lỗi runtime do field không tồn tại

## Kiểm tra đã thực hiện

- `npm run build` pass
- `npm run lint` pass, chỉ còn warning cũ ở `components/ui/date-range-picker.tsx`

## Ghi chú

Repo vẫn có một vấn đề cũ với `npm run typecheck` do `.next/types` không ổn định trong một số thời điểm, nhưng đây không phải lỗi phát sinh riêng từ phần sửa logic `loan / goal / budget`.
