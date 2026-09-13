# Razorpay disabled — SURYA CIMP

Razorpay is intentionally disabled in the current architecture.
Current payment flow: Direct UPI → Pending Verification → Admin/authorized verification → Fee/Library balance → Receipt → Email → Paid access.
`Gateway.gs` remains only as historical reference. Active frontend/backend routes return RAZORPAY_DISABLED.
