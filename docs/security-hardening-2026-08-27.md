# Lumae Security Hardening Record

**Scope:** production web application hardening completed on 27 August 2026. This record describes implemented safeguards and the limits of application-layer protection. It intentionally excludes secrets, tokens, customer data, and payment identifiers.

## Implemented safeguards

| Area | Implemented control | Outcome |
|---|---|---|
| Credit purchases | Server-owned Razorpay order ledger binds each order to one authenticated user, package, amount, currency, and provider order ID. | The browser cannot choose the credit amount or transfer a payment to another account. |
| Payment retries | A unique provider-payment reference and transactional credit issuance prevent duplicate credits. | Retried verification cannot credit the same payment twice. |
| Razorpay webhooks | The signature is checked against the exact raw request bytes before parsing; webhook metadata no longer selects a user, plan, or credit amount. | A forged or altered webhook is rejected, and captured payment notification alone cannot issue credits. |
| Stripe checkout | Session verification confirms the authenticated user reference and compares the server-side package amount before issuing credits. | A checkout session cannot be used to credit another account or an altered package. |
| Private storage | The generic storage proxy permits only explicit public brand assets. Feedback and social-media objects require a signed-in owner session or administrator role. | Guessed private storage URLs return Not Found. |
| Audio transcription | Arbitrary external URLs are rejected. The service uses a signed Lumae-managed storage object after validating its path. | The transcription service cannot be used to request internal or arbitrary internet addresses. |
| CSRF | Every state-changing tRPC request requires a trusted Origin or valid Referer, including requests without an Origin header. | Cross-site form and missing-Origin bypass attempts are rejected. |
| Sessions | The SDK default is eight hours; standard email/password sessions are eight hours; OAuth browser sessions are twelve hours. Remember Me remains an explicit thirty-day opt-in. | Long-lived default session exposure is reduced. |
| Password recovery | Reset requests use one public response shape for local, OAuth-only, unknown, and rate-limited accounts. | The response does not reveal whether an address exists or which sign-in method it uses. |
| Errors and logs | Storage, transcription, payment, and webhook responses avoid provider-body, account-email, and raw error disclosures. Debug session output returns only whether a session is authenticated. | Client-facing errors are less useful for account discovery or secret leakage. |
| Placeholder APIs | The mounted placeholder monetization API was removed from the production tRPC router. | No active client can request fabricated billing results from that endpoint. |

## Verification evidence

The targeted adversarial security regression suite passed with **9 tests**. The full suite passed with **66 test files and 644 tests**; four integration files and five approval-gated tests remained intentionally skipped because they require real external-provider consent or delivery configuration.

## Remaining responsibilities

No web application can promise that it is impossible to attack. Lumae now has stronger application controls, but account safety also depends on configuration and operations outside the source code. The owner should keep provider credentials in the secret manager only, require MFA for Google/Meta/LinkedIn/Razorpay/Stripe administrator accounts, complete provider security review, restrict production dashboard access, review audit logs, promptly patch dependencies, and maintain tested backups. Social Auto-Post must remain disabled until provider validation is successful.
