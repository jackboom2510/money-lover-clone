# PHÂN CÔNG CÔNG VIỆC  
## Dự án: Ứng dụng Web Quản lý Thu Chi Cá Nhân

---

## 1. Thông tin chung

| Nội dung            | Mô tả                                                        |
| ------------------- | ------------------------------------------------------------ |
| Tên dự án           | Ứng dụng Web Quản lý Thu Chi Cá Nhân                         |
| Thời gian thực hiện | 1 tuần                                                       |
| Số lượng thành viên | 3 người                                                      |
| Phạm vi             | Ứng dụng quản lý tài chính cá nhân                           |
| Actor chính         | User                                                         |
| Family User         | Loại bỏ                                                      |
| Admin               | Loại bỏ                                                      |
| Mục tiêu            | Có demo chạy được + báo cáo phân tích, thiết kế, test đầy đủ |

---

# 2. Phạm vi hệ thống sau khi rút gọn

Sau khi loại bỏ **Family User** và **Admin**, hệ thống trở thành ứng dụng quản lý thu chi cá nhân thuần túy.

## 2.1. Actor của hệ thống

| Actor | Vai trò |
|---|---|
| User | Người dùng cá nhân đăng ký tài khoản, đăng nhập, quản lý ví, ghi thu/chi, tạo ngân sách, theo dõi mục tiêu và xem báo cáo tài chính cá nhân |

---

## 2.2. Chức năng giữ lại

| Nhóm chức năng | Chức năng |
|---|---|
| Tài khoản | Đăng ký, đăng nhập, đăng xuất |
| Ví cá nhân | Tạo, sửa, xóa, xem ví |
| Giao dịch | Thêm, sửa, xóa, lọc giao dịch thu/chi |
| Danh mục | Phân loại giao dịch theo category |
| Tag/Nhãn | Gắn nhãn giao dịch nếu kịp |
| Ngân sách | Tạo ngân sách theo category/tháng |
| Mục tiêu | Tạo mục tiêu tiết kiệm, theo dõi tiến độ |
| Báo cáo | Dashboard tổng thu, tổng chi, số dư, biểu đồ |
| Vay/mượn | Quản lý khoản vay/mượn cá nhân nếu kịp |
| Export | Xuất dữ liệu CSV/JSON |
| Notification đơn giản | Cảnh báo vượt ngân sách hoặc goal, hiển thị trực tiếp trên UI |

---

## 2.3. Chức năng loại bỏ khỏi báo cáo chính

| Chức năng bỏ       | Lý do                             |
| ------------------ | --------------------------------- |
| Family User        | Không còn quản lý gia đình        |
| Family Group       | Không còn nhóm gia đình           |
| Family Wallet      | Không còn ví chung                |
| Group Membership   | Không cần phân quyền nhóm         |
| Admin              | Không còn quản trị viên           |
| Admin Escalation   | Không cần xử lý truy cập đặc biệt |
| System Config      | Không cần cho MVP                 |
| Backup hệ thống    | Thay bằng Export dữ liệu cá nhân  |
| Audit Log phức tạp | Không bắt buộc                    |
| RolePermission     | Không cần phân quyền vai trò      |

---

# 3. Stack công nghệ đề xuất

| Tầng     | Công nghệ                           | Lý do                              |
| -------- | ----------------------------------- | ---------------------------------- |
| Frontend | React + Tailwind CSS + React Router | Dễ component hóa, phù hợp UI-first |
| Backend  | Node.js + Express                   | Nhẹ, viết API nhanh                |
| Database | SQLite hoặc MongoDB Atlas           | Không cần cài DB server phức tạp   |
| Chart    | Recharts hoặc Chart.js              | Dễ nhúng dashboard                 |
| Auth     | JWT + bcrypt                        | Đủ dùng cho demo đăng nhập         |
| Export   | json2csv hoặc fast-csv              | Xuất CSV nhanh                     |
| Git      | GitHub + branch feature             | Dễ quản lý nhóm                    |

> Nếu nhóm quen Java/C#, có thể thay bằng Spring Boot + React. Tuy nhiên với thời gian 1 tuần, Node.js + Express phù hợp hơn để prototype nhanh.

---

# 4. Nguyên tắc phân công

Nhóm chia công việc theo hướng **module + tầng kỹ thuật**, mỗi thành viên phụ trách xuyên suốt từ:

```text
Phân tích → Thiết kế → Code → Test → Báo cáo phần module
```

Nguyên tắc:

- Mỗi người có module riêng rõ ràng.
- Không để một người chỉ làm tài liệu, một người chỉ code.
- Member 2 giữ vai trò **Integration Lead** để đảm bảo UI và flow demo mượt.
- Member 3 giữ vai trò **Documentation/Architecture Lead** để đảm bảo báo cáo đầy đủ.
- Các module có phụ thuộc hợp lý: Dashboard/Budget/Report sử dụng dữ liệu từ Transaction/Wallet.

---

# 5. Phân công tổng quan

| Thành viên | Vai trò chính                             | Module phụ trách                                                     | Kết quả cần cam kết                                                      |
| ---------- | ----------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Member 1   | Core Backend + Core Frontend              | Auth, User, Wallet, Transaction, Category                            | Đăng nhập được, tạo ví được, thêm giao dịch được, số dư cập nhật đúng    |
| Member 2   | Frontend Lead + Analytics UI              | Layout, Routing, Dashboard, Budget UI, Goal UI, Chart                | App nhìn được, routing mượt, dashboard/budget/goal hiển thị tốt          |
| Member 3   | Business Backend + Export + Documentation | Budget API, Goal API, Loan API, Report API, Export, báo cáo tổng hợp | Budget cảnh báo được, report có dữ liệu, export được, báo cáo hoàn chỉnh |

---

# 6. Phân công chi tiết theo thành viên

---

## 6.1. Member 1 – Account & Core Finance Module

### Phụ trách chính

```text
User
Auth
Wallet
Transaction
Category
```

---

## 6.1.1. Công việc báo cáo của Member 1

| Hạng mục         | Công việc                                             | Deliverable             |
| ---------------- | ----------------------------------------------------- | ----------------------- |
| Thu thập yêu cầu | Mô tả nghiệp vụ đăng ký/đăng nhập, ví, giao dịch      | Nội dung nghiệp vụ core |
| UC Specification | UC-Login, UC-ManageWallet, UC-ManageTransaction       | 3 UC specs              |
| Entity           | User, Wallet, Transaction, Category                   | Entity core             |
| Relationship     | User–Wallet, Wallet–Transaction, Transaction–Category | Quan hệ đối tượng       |
| Analysis Class   | Class User, Wallet, Transaction, Category             | Phần class core         |
| Sequence Diagram | Đăng nhập, thêm giao dịch cá nhân                     | Sequence diagram        |
| Detailed Design  | Detailed class cho core                               | Class chi tiết          |
| ERD              | Bảng users, wallets, transactions, categories         | ERD core                |
| Test Case        | Auth, Wallet, Transaction                             | Test case core          |

---

## 6.1.2. Công việc code của Member 1

| Layer    | File/Module                    | Nội dung                        |
| -------- | ------------------------------ | ------------------------------- |
| DB       | `config/db.js`, migration      | Kết nối database, tạo bảng core |
| Models   | `models/User.js`               | User, password hash             |
| Models   | `models/Wallet.js`             | Ví cá nhân, balance             |
| Models   | `models/Transaction.js`        | Giao dịch thu/chi               |
| Models   | `models/Category.js`           | Danh mục mặc định               |
| Models   | `models/Tag.js`                | Tag optional                    |
| API      | `routes/auth.routes.js`        | Register, login, verify token   |
| API      | `routes/wallet.routes.js`      | CRUD ví, tính balance           |
| API      | `routes/transaction.routes.js` | CRUD giao dịch, filter          |
| API      | `routes/category.routes.js`    | GET categories                  |
| Frontend | `pages/Login.jsx`              | Form đăng nhập                  |
| Frontend | `pages/Register.jsx`           | Form đăng ký                    |
| Frontend | `pages/WalletPage.jsx`         | Quản lý ví                      |
| Frontend | `pages/TransactionPage.jsx`    | Thêm/sửa/xóa giao dịch          |
| Frontend | `services/api.js`              | Axios instance, interceptors    |

---

## 6.1.3. API Member 1 cung cấp

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/wallets
POST   /api/wallets
PUT    /api/wallets/:id
DELETE /api/wallets/:id

GET    /api/transactions?walletId=&month=&categoryId=
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET /api/categories
```

---

## 6.1.4. Cam kết cuối tuần của Member 1

```text
User đăng ký/đăng nhập
→ Tạo ví cá nhân
→ Thêm giao dịch thu
→ Thêm giao dịch chi
→ Số dư ví cập nhật đúng
```

---

## 6.2. Member 2 – Frontend Lead + Dashboard/Budget/Goal UI

### Phụ trách chính

```text
UI Layout
Navigation
Dashboard
Chart
Budget UI
Goal UI
Global State
Integration
```

---

## 6.2.1. Công việc báo cáo của Member 2

| Hạng mục         | Công việc                                        | Deliverable                  |
| ---------------- | ------------------------------------------------ | ---------------------------- |
| Thu thập yêu cầu | Mô tả dashboard, budget, goal, report            | Nội dung nghiệp vụ analytics |
| UC Specification | UC-ViewDashboard, UC-ManageBudget, UC-ManageGoal | 3 UC specs                   |
| Entity           | Budget, Goal, ReportDTO, Notification/Warning    | Entity analytics             |
| Relationship     | Budget–Category–Transaction, Goal–Wallet         | Quan hệ đối tượng            |
| Analysis Class   | Budget, Goal, ReportService                      | Phần class analytics         |
| Sequence Diagram | Xem dashboard, tạo budget và cảnh báo            | Sequence diagram             |
| Detailed Design  | Detailed sequence dashboard/budget               | Sequence chi tiết            |
| Test Case        | Dashboard, Budget, Goal, UI flow                 | Test case analytics/UI       |

---

## 6.2.2. Công việc code của Member 2

| Layer    | File/Module                           | Nội dung                                    |
| -------- | ------------------------------------- | ------------------------------------------- |
| Frontend | `components/Layout.jsx`               | Sidebar, Header, layout chung               |
| Frontend | `components/Navbar.jsx`               | Navigation chung                            |
| Frontend | `App.jsx`                             | React Router setup                          |
| Frontend | `context/AppContext.jsx`              | Global state: user, wallets, selectedWallet |
| Frontend | `pages/DashboardPage.jsx`             | Tổng thu, tổng chi, số dư                   |
| Frontend | `components/Dashboard/Chart.jsx`      | Biểu đồ thu/chi                             |
| Frontend | `components/Dashboard/RecentList.jsx` | Giao dịch gần đây                           |
| Frontend | `pages/BudgetPage.jsx`                | Tạo/xem ngân sách                           |
| Frontend | `components/Budget/BudgetCard.jsx`    | Progress bar budget                         |
| Frontend | `pages/GoalPage.jsx`                  | Tạo/xem mục tiêu                            |
| Frontend | `components/Goal/GoalCard.jsx`        | Hiển thị % tiến độ                          |
| Frontend | `services/reportApi.js`               | Gọi API báo cáo                             |
| Frontend | `services/budgetApi.js`               | Gọi API budget                              |
| Frontend | `services/goalApi.js`                 | Gọi API goal                                |

---

## 6.2.3. Nhiệm vụ đặc biệt của Member 2

Member 2 là **Integration Lead**, chịu trách nhiệm:

| Nhiệm vụ            | Mô tả                                           |
| ------------------- | ----------------------------------------------- |
| Ghép API vào UI     | Kết nối API của Member 1 và Member 3            |
| Kiểm soát routing   | Đảm bảo chuyển trang mượt                       |
| Kiểm soát layout    | Đảm bảo giao diện thống nhất                    |
| Kiểm soát demo flow | Đảm bảo luồng demo không lỗi                    |
| Review UI           | Kiểm tra responsive, loading state, error toast |
| Quản lý nhánh chính | Review và merge code vào `main`                 |

---

## 6.2.4. Cam kết cuối tuần của Member 2

```text
App có layout hoàn chỉnh
→ Routing mượt
→ Dashboard hiển thị tổng thu/tổng chi/số dư
→ Chart hiển thị được
→ Budget/Goal có form và progress
```

---

## 6.3. Member 3 – Business Backend + Report/Export + Documentation

### Phụ trách chính

```text
Budget Backend
Goal Backend
Loan Backend
Report Backend
Export
Architecture
Documentation
Test case tổng hợp
```

---

## 6.3.1. Công việc báo cáo của Member 3

| Hạng mục | Công việc | Deliverable |
|---|---|---|
| Mô tả hệ thống | Viết mô tả chung, lý do lựa chọn | Phần I.1 |
| Khảo sát | Khảo sát Money Lover, Excel, ví điện tử | Phần I.2 |
| Bảng thuật ngữ | Tổng hợp glossary | Bảng thuật ngữ |
| Use Case Diagram | Vẽ use case diagram tổng thể cho User | Use case diagram |
| Architecture | Viết kiến trúc MVC | Phần B.1 |
| Component Diagram | Vẽ component/module diagram | Component diagram |
| Deployment Diagram | Vẽ deployment diagram | Deployment diagram |
| ERD tổng hợp | Gom ERD từ Member 1/2 | ERD final |
| Test Case tổng hợp | Gom test case các module | Test case table |
| Format báo cáo | Chuẩn hóa font, mục lục, hình ảnh | File báo cáo final |

---

## 6.3.2. Công việc code của Member 3

| Layer    | File/Module                    | Nội dung                                |
| -------- | ------------------------------ | --------------------------------------- |
| Models   | `models/Budget.js`             | Ngân sách theo category/tháng           |
| Models   | `models/Goal.js`               | Mục tiêu, target amount, current amount |
| Models   | `models/Loan.js`               | Khoản vay/mượn                          |
| Models   | `models/RepaymentSchedule.js`  | Lịch trả, optional                      |
| Models   | `models/Notification.js`       | Thông báo nội bộ                        |
| API      | `routes/budget.routes.js`      | CRUD budget, check overspending         |
| API      | `routes/goal.routes.js`        | CRUD goal, tính progress                |
| API      | `routes/loan.routes.js`        | CRUD loan, tính overdue                 |
| API      | `routes/report.routes.js`      | Summary, by-category, by-month          |
| API      | `routes/backup.routes.js`      | Export CSV/JSON                         |
| Services | `services/report.service.js`   | Tính tổng hợp từ Transaction            |
| Services | `services/budget.service.js`   | Kiểm tra vượt ngân sách                 |
| Frontend | `pages/LoanPage.jsx`           | Quản lý vay/mượn                        |
| Frontend | `pages/ReportsPage.jsx`        | Báo cáo chi tiết                        |
| Frontend | `pages/SettingsPage.jsx`       | Export dữ liệu                          |
| Frontend | `components/Loan/LoanForm.jsx` | Form tạo loan                           |
| Frontend | `components/ExportButton.jsx`  | Nút export CSV                          |

---

## 6.3.3. API Member 3 cung cấp

```http
GET  /api/budgets
POST /api/budgets
GET  /api/budgets/check

GET  /api/goals
POST /api/goals
PUT  /api/goals/:id/contribute

GET  /api/loans
POST /api/loans
GET  /api/loans/:id/overdue

GET /api/reports/summary
GET /api/reports/by-category
GET /api/reports/by-month

GET /api/backup/export
```

---

## 6.3.4. Cam kết cuối tuần của Member 3

```text
Budget cảnh báo được
→ Goal tính % đúng
→ Report trả dữ liệu chuẩn
→ Export file CSV/JSON được
→ Báo cáo tài liệu hoàn chỉnh
```

---

# 7. Phân công theo sườn báo cáo

---

## I. Mô tả hệ thống

| Mục | Người chính | Người hỗ trợ | Deliverable |
|---|---|---|---|
| 1. Mô tả chung, lý do lựa chọn | Member 3 | Member 1, 2 | Mô tả hệ thống cá nhân |
| 2. Khảo sát hệ thống tương tự | Member 3 | Member 2 | Bảng so sánh Money Lover, Excel, ví điện tử |

---

## II. Thu thập yêu cầu

| Mục                             | Người chính  | Người hỗ trợ | Deliverable       |
| ------------------------------- | ------------ | ------------ | ----------------- |
| 3. Bảng thuật ngữ               | Member 3     | Member 1, 2  | Glossary          |
| 4. Mục tiêu và phạm vi          | Member 3     | Member 1, 2  | Scope cá nhân     |
| Ai sử dụng phần mềm?            | Member 3     | -            | Actor: User       |
| Người dùng có chức năng gì?     | Member 1 + 2 | Member 3     | Bảng chức năng    |
| Mỗi chức năng hoạt động ra sao? | Member 1 + 2 | Member 3     | Mô tả workflow    |
| Thông tin/đối tượng xử lý       | Member 1     | Member 2     | Entity list       |
| Quan hệ giữa đối tượng          | Member 1     | Member 2     | Relationship list |
| UML Use Case                    | Member 3     | Member 1, 2  | Use case diagram  |
| Bảng yêu cầu người dùng         | Member 3     | Member 1, 2  | FR table          |

---

## II. Phân tích

| Mục                    | Người chính  | Người hỗ trợ      | Deliverable            |
| ---------------------- | ------------ | ----------------- | ---------------------- |
| 5. UC Specification    | Member 1 + 2 | Member 3 tổng hợp | UC specs               |
| 6. Trích xuất thực thể | Member 1     | Member 2          | Entity extraction      |
| 6. Sơ đồ lớp phân tích | Member 1     | Member 2, 3       | Analysis class diagram |
| 7. Sequence diagram    | Member 1 + 2 | Member 3 review   | Sequence diagrams      |

---

## B. Xây dựng mới

| Mục                       | Người chính  | Người hỗ trợ      | Deliverable        |
| ------------------------- | ------------ | ----------------- | ------------------ |
| Architecture MVC          | Member 3     | Member 1, 2       | Mô tả kiến trúc    |
| Component diagram         | Member 3     | Member 1, 2       | Component diagram  |
| Deployment diagram        | Member 3     | Member 1, 2       | Deployment diagram |
| Detailed class diagram    | Member 1     | Member 2, 3       | Class diagram      |
| Detailed sequence diagram | Member 1 + 2 | Member 3 tổng hợp | Sequence chi tiết  |
| ERD                       | Member 1     | Member 2, 3       | ERD                |
| Test case                 | Member 3     | Member 1, 2       | Test case table    |

---

# 8. Use case sau khi chỉ còn User

| Use Case ID | Use Case Name             | Người phụ trách        | Priority |
| ----------- | ------------------------- | ---------------------- | -------- |
| UC-01       | Đăng ký/Đăng nhập         | Member 1               | Must     |
| UC-02       | Quản lý ví cá nhân        | Member 1               | Must     |
| UC-03       | Quản lý giao dịch thu/chi | Member 1               | Must     |
| UC-04       | Quản lý danh mục/tag      | Member 1 hoặc Member 3 | Should   |
| UC-05       | Xem dashboard/báo cáo     | Member 2               | Must     |
| UC-06       | Quản lý ngân sách         | Member 2 + Member 3    | Must     |
| UC-07       | Quản lý mục tiêu          | Member 2 + Member 3    | Should   |
| UC-08       | Quản lý vay/mượn cá nhân  | Member 3               | Should   |
| UC-09       | Export dữ liệu            | Member 3               | Should   |
| UC-10       | Import dữ liệu            | Member 3               | Could    |

---

# 9. Bảng yêu cầu người dùng rút gọn

| ID    | Tên yêu cầu         | Mô tả                                        | Priority | Người phụ trách |
| ----- | ------------------- | -------------------------------------------- | -------- | --------------- |
| FR-01 | Đăng ký/Đăng nhập   | User có thể tạo tài khoản và đăng nhập       | Must     | Member 1        |
| FR-02 | Quản lý ví          | User tạo/sửa/xóa ví cá nhân                  | Must     | Member 1        |
| FR-03 | Ghi thu/chi         | User thêm/sửa/xóa giao dịch                  | Must     | Member 1        |
| FR-04 | Phân loại giao dịch | Giao dịch có category/tag                    | Must     | Member 1        |
| FR-05 | Lọc giao dịch       | Lọc theo ví, ngày, category                  | Should   | Member 1        |
| FR-06 | Dashboard           | Hiển thị tổng thu, tổng chi, số dư           | Must     | Member 2        |
| FR-07 | Báo cáo biểu đồ     | Biểu đồ theo category/tháng                  | Must     | Member 2        |
| FR-08 | Ngân sách           | User đặt ngân sách theo category/tháng       | Must     | Member 2 + 3    |
| FR-09 | Cảnh báo ngân sách  | Cảnh báo khi chi tiêu vượt ngân sách         | Must     | Member 3        |
| FR-10 | Mục tiêu tài chính  | User tạo goal tiết kiệm                      | Should   | Member 2 + 3    |
| FR-11 | Vay/mượn cá nhân    | User tạo khoản vay/mượn, theo dõi trạng thái | Should   | Member 3        |
| FR-12 | Export dữ liệu      | Xuất giao dịch ra CSV/JSON                   | Should   | Member 3        |
| FR-13 | Responsive UI       | Giao diện dùng được trên desktop/mobile      | Should   | Member 2        |

---

# 10. Entity và phân công phụ trách

## 10.1. Entity tối thiểu

| Entity | Người phụ trách |
|---|---|
| User | Member 1 |
| Wallet | Member 1 |
| Transaction | Member 1 |
| Category | Member 1 |
| Budget | Member 3 |
| Goal | Member 3 |
| ReportDTO | Member 3 |
| ExportFile | Member 3 |

---

## 10.2. Entity có thể thêm nếu kịp

| Entity            | Người phụ trách        |
| ----------------- | ---------------------- |
| Tag               | Member 1 hoặc Member 3 |
| Notification      | Member 3               |
| Session           | Member 1               |
| Loan              | Member 3               |
| RepaymentSchedule | Member 3               |

---

## 10.3. Entity bỏ hoàn toàn

```text
Admin
FamilyUser
FamilyGroup
GroupMembership
Invitation
RolePermission
AuditLog phức tạp
BackupSnapshot hệ thống
SystemConfig
EscalationRequest
```

---

# 11. ERD tối giản

```text
users
- id
- name
- email
- password_hash
- created_at

wallets
- id
- user_id
- name
- type
- currency
- balance
- created_at

categories
- id
- name
- type
- icon
- color

transactions
- id
- user_id
- wallet_id
- category_id
- amount
- type
- description
- transaction_date
- created_at

budgets
- id
- user_id
- category_id
- amount_limit
- month
- year
- created_at

goals
- id
- user_id
- name
- target_amount
- current_amount
- deadline
- status
- created_at

loans
- id
- user_id
- counterparty
- amount
- type
- due_date
- status
- created_at
```

Nếu có tag:

```text
tags
- id
- user_id
- name

transaction_tags
- transaction_id
- tag_id
```

---

# 12. Diagram cần làm

| Diagram                          | Người phụ trách                        |
| -------------------------------- | -------------------------------------- |
| Use Case Diagram                 | Member 3                               |
| Analysis Class Diagram           | Member 1                               |
| Sequence: Đăng nhập              | Member 1                               |
| Sequence: Thêm giao dịch         | Member 1                               |
| Sequence: Xem dashboard          | Member 2                               |
| Sequence: Tạo budget và cảnh báo | Member 2 + Member 3                    |
| Component Diagram                | Member 3                               |
| Deployment Diagram               | Member 3                               |
| ERD                              | Member 1                               |
| Detailed Class Diagram           | Member 1 + Member 2                    |
| Detailed Sequence Diagram        | Member 1 + Member 2, Member 3 tổng hợp |

---

# 13. Component Diagram mức module

```text
[User Browser]
      |
      v
[Web UI - React]
      |
      v
[Application Server - Express MVC]
      |
      |-- Auth Module
      |-- Wallet Module
      |-- Transaction Module
      |-- Category Module
      |-- Budget Module
      |-- Goal Module
      |-- Loan Module
      |-- Report Module
      |-- Export Module
      |
      v
[Database - SQLite/MongoDB]
```

---

# 14. Cấu trúc thư mục project

```text
money-keeper/
├── backend/
│   ├── server.js
│   ├── .env.example
│   ├── package.json
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Wallet.js
│       │   ├── Transaction.js
│       │   ├── Category.js
│       │   ├── Budget.js
│       │   ├── Goal.js
│       │   ├── Loan.js
│       │   └── Notification.js
│       ├── routes/
│       │   ├── auth.routes.js
│       │   ├── wallet.routes.js
│       │   ├── transaction.routes.js
│       │   ├── category.routes.js
│       │   ├── budget.routes.js
│       │   ├── goal.routes.js
│       │   ├── loan.routes.js
│       │   ├── report.routes.js
│       │   └── backup.routes.js
│       ├── middleware/
│       │   └── auth.js
│       └── services/
│           ├── report.service.js
│           └── budget.service.js
│
├── frontend/
│   ├── package.json
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── context/
│       │   └── AppContext.jsx
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── Navbar.jsx
│       │   ├── Dashboard/
│       │   ├── Budget/
│       │   ├── Goal/
│       │   └── Loan/
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── WalletPage.jsx
│       │   ├── TransactionPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── BudgetPage.jsx
│       │   ├── GoalPage.jsx
│       │   ├── LoanPage.jsx
│       │   └── SettingsPage.jsx
│       └── services/
│           ├── api.js
│           └── reportApi.js
│
└── package.json
```

---

# 15. API Contract

## 15.1. Member 1 cung cấp

```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

GET    /api/wallets
POST   /api/wallets
PUT    /api/wallets/:id
DELETE /api/wallets/:id

GET    /api/transactions?walletId=&month=&categoryId=
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id

GET /api/categories
```

---

## 15.2. Member 3 cung cấp

```http
GET  /api/budgets
POST /api/budgets
GET  /api/budgets/check

GET  /api/goals
POST /api/goals
PUT  /api/goals/:id/contribute

GET  /api/loans
POST /api/loans
GET  /api/loans/:id/overdue

GET /api/reports/summary
GET /api/reports/by-category
GET /api/reports/by-month

GET /api/backup/export
```

---

## 15.3. Quy tắc API

- Member 2 chỉ gọi đúng endpoint đã thống nhất.
- Nếu cần thêm field response, phải báo nhóm trước khi sửa.
- Response API thống nhất dạng:

```json
{
  "success": true,
  "message": "OK",
  "data": {}
}
```

---

# 16. Git Strategy

| Nhánh | Người sở hữu | Nội dung |
|---|---|---|
| `main` | Member 2 | Code ổn định, luôn chạy được |
| `feature/core` | Member 1 | Auth, Wallet, Transaction |
| `feature/ui` | Member 2 | Layout, Dashboard, Budget UI, Goal UI |
| `feature/business` | Member 3 | Budget API, Goal API, Loan API, Report, Export |

## Flow làm việc mỗi ngày

1. Buổi sáng: Pull `main`, rebase nhánh của mình.
2. Trong ngày: Commit nhỏ theo chức năng.
3. Buổi tối: Push lên nhánh riêng.
4. Tạo Pull Request vào `main`.
5. Member 2 review và merge trước 22h.
6. `main` luôn phải chạy được.

Ví dụ commit:

```text
feat(auth): implement login api
feat(wallet): add wallet crud
feat(transaction): update wallet balance after transaction
feat(report): add dashboard summary api
feat(ui): add dashboard layout
fix(budget): correct overspending calculation
```

---

# 17. Timeline 1 tuần

| Ngày | Member 1 – Core | Member 2 – Frontend | Member 3 – Business |
|---|---|---|---|
| Day 1 | Setup DB, tạo models User/Wallet/Transaction/Category | Setup React, Layout, Router, UI prototype | Setup models Budget/Goal/Loan, stub API |
| Day 2 | API Auth, API Wallet CRUD | Login/Register UI, Sidebar, WalletPage UI | API Budget CRUD, API Goal CRUD |
| Day 3 | API Transaction CRUD, tính balance, seed category | TransactionPage UI, Dashboard layout, Axios setup | API Report aggregation |
| Day 4 | Hoàn thiện filter transaction, fix bug | DashboardPage gọi API report, BudgetPage UI, GoalPage UI | API Loan CRUD, overdue check, export CSV |
| Day 5 | Review code, tối ưu DB query | Budget progress bar, Goal %, routing hoàn thiện | Backup/export, notification simple |
| Day 6 | Test core: auth, wallet, transaction, balance | Test UI flow, responsive, fix lỗi ghép API | Test budget warning, report, export |
| Day 7 | Seed data demo, tài khoản test | UI polish, loading state, error toast | Chuẩn bị file export mẫu, hỗ trợ final demo |

---

# 18. Test case tối thiểu

| TC ID | Chức năng | Input | Expected Output | Người phụ trách |
|---|---|---|---|---|
| TC-01 | Đăng ký | Name, email, password | Tạo user thành công | Member 1 |
| TC-02 | Đăng nhập | Email, password đúng | Trả JWT/token | Member 1 |
| TC-03 | Tạo ví | Tên ví, tiền tệ | Ví được tạo | Member 1 |
| TC-04 | Thêm thu nhập | Amount > 0, type income | Số dư ví tăng | Member 1 |
| TC-05 | Thêm chi tiêu | Amount > 0, type expense | Số dư ví giảm | Member 1 |
| TC-06 | Lọc giao dịch | Wallet/category/month | Trả danh sách đúng | Member 1 |
| TC-07 | Dashboard summary | Có dữ liệu giao dịch | Tổng thu/chi/số dư đúng | Member 2 |
| TC-08 | Biểu đồ category | Có giao dịch chi | Chart hiển thị đúng category | Member 2 |
| TC-09 | Tạo budget | Category, limit | Budget được tạo | Member 3 |
| TC-10 | Vượt budget | Chi tiêu > limit | Hiển thị cảnh báo | Member 3 |
| TC-11 | Tạo goal | Target amount | Goal được tạo, progress đúng | Member 3 |
| TC-12 | Tạo loan | Counterparty, amount | Loan được lưu | Member 3 |
| TC-13 | Export CSV | Click export | Tải file CSV/JSON | Member 3 |
| TC-14 | Routing UI | Chuyển trang | Không lỗi route | Member 2 |
| TC-15 | Responsive UI | Desktop/mobile | Giao diện không vỡ | Member 2 |

---

# 19. Checklist demo cuối tuần

| # | Flow demo | Người chịu trách nhiệm cuối |
|---|---|---|
| 1 | Đăng ký tài khoản mới | Member 1 |
| 2 | Đăng nhập | Member 1 |
| 3 | Tạo ví “Tiền mặt” | Member 1 |
| 4 | Thêm giao dịch thu “Lương” 10 triệu | Member 1 |
| 5 | Thêm giao dịch chi “Ăn uống” 500 nghìn | Member 1 |
| 6 | Dashboard hiển thị tổng thu 10 triệu, tổng chi 500 nghìn | Member 2 |
| 7 | Biểu đồ hiển thị chi tiêu theo category | Member 2 |
| 8 | Tạo Budget “Ăn uống” 400 nghìn | Member 3 |
| 9 | Hệ thống cảnh báo đã vượt budget | Member 3 |
| 10 | Tạo Goal “Mua laptop” 20 triệu | Member 3 |
| 11 | Tạo Loan “Cho bạn mượn” 2 triệu | Member 3 |
| 12 | Export CSV giao dịch | Member 3 |
| 13 | UI responsive, routing mượt | Member 2 |

---

# 20. Bảng phân công cuối cùng

| Member   | Vai trò                                          | Code chính                                                                                | Báo cáo chính                                                                              | Cam kết cuối                                      |
| -------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------- |
| Member 1 | Core Backend + Auth/Wallet/Transaction Frontend  | DB schema, Auth API, Wallet API, Transaction API, Login/Register/Wallet/Transaction pages | Entity core, ERD, UC Login/Wallet/Transaction, sequence giao dịch                          | Đăng nhập, tạo ví, thêm giao dịch, số dư đúng     |
| Member 2 | Frontend Lead + Dashboard/Budget/Goal UI         | Layout React, Routing, Dashboard, Chart, Budget UI, Goal UI, Global State                 | UC Dashboard/Budget/Goal, sequence dashboard/budget, UI flow                               | App nhìn được, routing mượt, Dashboard có dữ liệu |
| Member 3 | Business Backend + Report/Export + Documentation | Budget API, Goal API, Loan API, Report API, Export CSV, Settings/Loan/Report pages        | Mô tả hệ thống, khảo sát, glossary, FR, architecture, component, deployment, test tổng hợp | Budget cảnh báo, Goal %, Report đúng, Export được |

---

# 21. Kết luận

Với phạm vi chỉ còn **User cá nhân**, phân công tối ưu là:

```text
Member 1:
Core Finance – Auth, Wallet, Transaction, Category, ERD, class diagram.

Member 2:
Frontend Lead – Layout, Dashboard, Chart, Budget/Goal UI, Integration.

Member 3:
Business Backend – Budget, Goal, Loan, Report, Export, Documentation tổng hợp.
```

Cách chia này đảm bảo:

- Mỗi người có module riêng rõ ràng.
- Không chồng chéo quá nhiều.
- Có phụ thuộc hợp lý: Member 2 và Member 3 dùng dữ liệu từ Member 1.
- Có thể hoàn thành trong 1 tuần.
- Đủ cả báo cáo, code, test case và demo chạy được.