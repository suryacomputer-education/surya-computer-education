# Payment Gateway Status — Historical Reference Only

Razorpay was explored in an earlier Phase-2 implementation but is **DISABLED** in the current SURYA CIMP architecture.

Current payment flow:
Student → Direct UPI → PENDING VERIFICATION → Admin/authorized verification → Fee update → Receipt → Gmail → Paid Access

Do not configure or call the Razorpay functions in `Gateway.gs` for the current deployment. The file is retained only as historical code/reference.
