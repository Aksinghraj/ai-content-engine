# Lumae Android Release Notes

## Release identity

| Setting | Value |
|---|---|
| Application ID | `in.lumae.app` |
| Display name | Lumae AI |
| Min SDK | 24 |
| Compile SDK | 36 |
| Target SDK | 36 |
| Release format | Android App Bundle (`.aab`) |

## Build prerequisites

1. Install Android SDK Platform 36 and a matching build-tools package on the release machine.
2. Copy `keystore.properties.example` to `keystore.properties` and replace all placeholder values. Keep the upload key outside source control.
3. Build the production web bundle with `pnpm build`.
4. Run `pnpm exec cap sync android` to copy the bundle into the Android project.
5. Build with `cd android && ./gradlew bundleRelease`.
6. Upload `app/build/outputs/bundle/release/app-release.aab` to Google Play Console.

## Play App Signing and App Links

Enable Play App Signing in Play Console. After Google provides the App Signing certificate SHA-256 fingerprint, publish `https://lumae.co.in/.well-known/assetlinks.json` using this structure, replacing the placeholder fingerprint:

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "in.lumae.app",
      "sha256_cert_fingerprints": ["REPLACE_WITH_PLAY_APP_SIGNING_SHA256"]
    }
  }
]
```

Do not publish the placeholder. App Links must be tested after the signed Play build is installed.

## Security boundaries

- The Android project denies cleartext HTTP traffic.
- Keep release keys and `keystore.properties` out of source control.
- Do not add SMS, Resend, Meta, OAuth, or payment secrets to the Android bundle.
- Keep user authentication and sensitive operations on the Lumae backend.
- Verify Data safety disclosures against the final app and all included SDKs before every Play submission.
