# SURYA CIMP — Phase 7.2 Progress

This build continues Phase 7 without creating duplicate content/payment engines.

## Added

- `AccessEngine.gs` — one central FREE/PAID access decision for course students and library students.
- Library UPI fee request flow using the existing `UPIPaymentRequests` + existing fee ledger/receipt/audit infrastructure.
- Library payment verification updates the Library student's Paid/Due values only after authorized admin verification.
- Verified Library UPI payments receive the existing fee receipt number and receipt email flow.
- Mock tests now enforce paid access server-side before questions/start/submit.
- Study Materials, Recorded Classes and Live Classes now expose central access state and suppress sensitive links for locked paid content.
- Library Dashboard now has a Pay via UPI action for outstanding membership fee.
- `SetupSheets.gs` safely migrates new headers and creates `ContentEntitlements` for future per-content grants without replacing the central access engine.

## Important configuration

Set Script Property:

- `SURYA_LIBRARY_DEFAULT_FEE` — server-side Library admission/membership fee used for new applications. Public forms cannot choose the authoritative fee.

Existing Direct UPI properties remain required:

- `SURYA_UPI_ID`
- `SURYA_UPI_NAME`
- `SURYA_UPI_NOTE`

## Not yet final

- Final QR rendering UI
- CEO Gmail OTP/financial panel
- Full Attendance UI/integration polish
- PDF → Question Builder
- Final production security audit and end-to-end testing
