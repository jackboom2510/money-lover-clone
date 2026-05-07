# Manual Test Flow

## Preconditions

- App is running at `http://localhost:3000`
- User is signed in
- User has completed the wizard and has a default currency

## 1. Wallet Flow

### 1.1 Create wallet

1. Open `/wallets`
2. Click `Create wallet`
3. Enter:
   - Name: `Cash Wallet`
   - Type: `Cash`
   - Icon: any icon
4. Submit

Expected:
- New wallet card appears immediately without full page reload
- Wallet balance starts at `0`
- Currency display matches current user setting, not forced `VND`

### 1.2 Edit wallet

1. On `/wallets`, click the pencil icon on `Cash Wallet`
2. Change:
   - Name: `Main Cash`
   - Type: `E-Wallet` or another type
   - Icon: another icon
3. Save

Expected:
- Dialog opens correctly
- Wallet card updates immediately after save
- No manual reload needed

### 1.3 Delete wallet

1. Click the trash icon on the wallet
2. Confirm delete

Expected:
- Wallet disappears immediately
- No manual reload needed

## 2. Transaction -> Wallet Sync

### 2.1 Add income transaction

1. Open `/transactions`
2. Click `New Income`
3. Fill:
   - Description: `Salary`
   - Amount: `1000`
   - Wallet: `Main Cash`
   - Category: any income category
   - Date: today
4. Submit
5. Return to `/wallets`

Expected:
- Wallet balance increases to `+1000`
- No manual reload needed if the page is revisited normally

### 2.2 Add expense transaction

1. Open `/transactions`
2. Click `New Expense`
3. Fill:
   - Description: `Lunch`
   - Amount: `100`
   - Wallet: `Main Cash`
   - Category: any expense category
   - Date: today
4. Submit
5. Return to `/wallets`

Expected:
- Wallet balance becomes `900`

### 2.3 Delete transaction

1. Open `/history` or transaction list where delete is available
2. Delete the `Lunch` transaction
3. Return to `/wallets`

Expected:
- Wallet balance returns to `1000`
- No manual reload needed

## 3. Budget Flow

### 3.1 Create budget

1. Open dashboard budget management
2. Create budget:
   - Name: `Food Budget`
   - Amount: `500`
   - Category: `food`
   - Start date: today
   - End date: end of current month
3. Save

Expected:
- Budget appears in budget list
- `spent = 0`

### 3.2 Link expense to budget

1. Create a new expense transaction
2. Amount: `120`
3. Wallet: `Main Cash`
4. Link it to `Food Budget`
5. Save

Expected:
- Budget `spent` becomes `120`
- Remaining and percentage logic stay consistent across:
  - budget list
  - dashboard summary
  - entity select
  - budget check/report sections

### 3.3 Delete linked expense

1. Delete the expense transaction linked to `Food Budget`

Expected:
- Budget `spent` decreases correctly
- If it was the only linked transaction, `spent` returns to `0`

## 4. Goal Flow

### 4.1 Create goal

1. Open goal management
2. Create goal:
   - Name: `Emergency Fund`
   - Target amount: `2000`
   - Priority: `high`
   - Target date: future date
3. Save

Expected:
- Goal appears with the chosen priority
- `contributed = 0`
- `isCompleted = false`

### 4.2 Link income to goal

1. Create a new income transaction
2. Amount: `700`
3. Wallet: `Main Cash`
4. Link it to `Emergency Fund`
5. Save

Expected:
- Goal `contributed` becomes `700`
- Goal remains incomplete

### 4.3 Complete goal

1. Create another income transaction linked to `Emergency Fund`
2. Amount: `1500`
3. Save

Expected:
- Goal contribution is capped at target if needed
- `isCompleted = true`
- Dashboard completed goal count increases

### 4.4 Delete linked goal transaction

1. Delete one of the transactions linked to the goal

Expected:
- Goal contribution recalculates correctly
- `isCompleted` flips back if contribution drops below target

## 5. Loan Flow

### 5.1 Create loan

1. Open loan management
2. Create loan:
   - Name: `Car Loan`
   - Total amount: `10000`
   - Loan type: `auto`
   - Due date: future date
3. Save

Expected:
- Loan appears with correct `loanType`
- `paidAmount = 0`
- `status = active`
- `overdue = false`

### 5.2 Link repayment transaction

1. Create an expense transaction
2. Amount: `2000`
3. Wallet: `Main Cash`
4. Link it to `Car Loan`
5. Save

Expected:
- Loan `paidAmount` becomes `2000`
- Outstanding amount decreases
- Status remains correct

### 5.3 Fully repay loan

1. Create another linked expense transaction
2. Amount: `8000`
3. Save

Expected:
- `paidAmount` becomes `10000`
- `status = paid`
- `overdue = false`

### 5.4 Delete linked repayment

1. Delete one repayment transaction

Expected:
- `paidAmount` decreases correctly
- Status recalculates back from `paid` if needed

## 6. Security / Ownership Sanity

### 6.1 Goal contribute API

Expected:
- Goal contribution only works for the current user's goal
- Foreign goal ids should not be updateable

### 6.2 Loan overdue API

Expected:
- Loan overdue lookup only works for the current user's loan
- Foreign loan ids should not disclose state

## 7. Dashboard Consistency Check

After completing the flows above, compare:

- `/dashboard`
- `/wallets`
- budget list
- goal list
- loan list
- entity selects inside transaction dialog

Expected:
- Numbers are consistent across all surfaces
- No place shows stale `spent`, `contributed`, `paidAmount`, `status`, or `overdue`

## Pass Criteria

The flow passes when:

- No full-page manual reload is needed for wallet-related updates
- Linked transaction changes propagate correctly to budget/goal/loan
- Dashboard and detail views show the same numbers
- Loan and goal APIs respect ownership
