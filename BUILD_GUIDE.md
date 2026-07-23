# Kurigram Nursery Registry — Deployment Build Guide
## Zero-API-Key | Fully Offline | Open Source

---

## 1. Prerequisites

Install the following on your build machine:
- **Flutter SDK** (stable channel, >=3.0.0)
- **Android Studio** or **VS Code** with Flutter extension
- **Android SDK** (API 21+ minimum)
- A physical Android device or emulator for testing

Verify installation:
```bash
flutter doctor
```
All checks must pass (except optional items).

---

## 2. Project Setup

1. Extract the `kurigram_nursery_registry.zip` file.
2. Open a terminal inside the project root:
```bash
cd kurigram_nursery_registry
```

### 2.1 Configure Android SDK Paths

This project includes a template for `local.properties`. You must create the actual file:

```bash
cp android/local.properties.template android/local.properties
```

Edit `android/local.properties` with your actual paths:

**macOS/Linux:**
```properties
flutter.sdk=/Users/yourname/development/flutter
sdk.dir=/Users/yourname/Library/Android/sdk
flutter.buildMode=release
flutter.versionName=1.0.0
flutter.versionCode=1
```

**Windows:**
```properties
flutter.sdk=C:\Users\yourname\development\flutter
sdk.dir=C:\Users\yourname\AppData\Local\Android\Sdk
flutter.buildMode=release
flutter.versionName=1.0.0
flutter.versionCode=1
```

> **Note:** The `local.properties` file is in `.gitignore` and must NOT be committed to version control.

### 2.2 Fetch Dependencies
```bash
flutter pub get
```

---

## 3. Zero-API-Key Verification

Before building, confirm **no API keys exist** in the codebase:

| File | What to check | Status |
|------|---------------|--------|
| `AndroidManifest.xml` | No `com.google.android.geo.API_KEY` meta-data | Verified |
| `pubspec.yaml` | No `firebase_core`, `google_maps_flutter` | Verified |
| `lib/` | No `Firebase.initializeApp()` calls | Verified |
| `build.gradle` | No Google Services plugin | Verified |

The app uses:
- **OpenStreetMap** (free tiles, no key)
- **SQLite** (local database, no backend)
- **Local filesystem** (images stored on device)

---

## 4. Build Release APK

### Step A: Clean build cache
```bash
flutter clean
```

### Step B: Get dependencies
```bash
flutter pub get
```

### Step C: Build optimized release APK
```bash
# Standard release APK (~15-18 MB, works on all architectures)
flutter build apk --release

# OR split by CPU architecture for smaller files:
flutter build apk --split-per-abi
```

### Output Location
```
build/app/outputs/flutter-apk/app-release.apk
```

---

## 5. Install on Device

### Method A: Direct USB install
```bash
flutter install
```

### Method B: Manual APK transfer
1. Copy `app-release.apk` to the Android device.
2. Open the file on the device and install.
3. You may need to enable **Install from Unknown Sources** in Settings.

---

## 6. Required Permissions (Grant on First Launch)

The app will request these at runtime:
- **Location** — to capture nursery GPS coordinates
- **Camera** — to take compressed nursery photos
- **Phone** — to enable one-tap calling
- **Internet** — to load OpenStreetMap tiles (no data sent to cloud)

No Google account, no Firebase login, no API key registration needed.

---

## 7. Field Deployment Workflow

### For Field Officers (Data Collection)
1. Open app → tap **+** button.
2. Enter nursery name, owner, address, mobile.
3. Tap **Capture Location** — GPS auto-locks.
4. Tap **Take Photo** — image compresses to ~60KB.
5. Add tree inventory (Fruit/Forest/Medicinal).
6. Tap **Save to Local Registry**.

### For District Office (Data Aggregation)
1. Open app → tap **☰ Menu**.
2. Tap **Export Data (Share)** — generates JSON with embedded base64 images.
3. Share via **WhatsApp/Email/Bluetooth** to district office.
4. District office taps **Import Data**, pastes JSON.
5. All nurseries appear on the map instantly.

No cloud. No API keys. No internet required during collection.

---

## 8. Architecture Summary

| Layer | Technology | Cost | Offline |
|-------|-----------|------|---------|
| Map | OpenStreetMap + flutter_map | Free | Cached tiles |
| Database | SQLite (sqflite) | Free | Fully offline |
| Images | Local filesystem | Free | Fully offline |
| Sync | JSON export/import | Free | Peer-to-peer |
| Search | SQLite FTS | Free | Fully offline |

**Total recurring cost: $0.00**

---

## 9. Troubleshooting

| Problem | Solution |
|---------|----------|
| `flutter.sdk not set` error | Create `android/local.properties` from template |
| Map shows blank grid | Check internet connection (tiles load once, then cache) |
| Location not capturing | Enable GPS in Android settings; grant location permission |
| Camera crashes | Grant camera permission; ensure device has camera app |
| Import fails | Ensure JSON is complete and not truncated by WhatsApp |
| App size too large | Use `flutter build apk --split-per-abi` |
| Build fails with Gradle errors | Run `flutter clean` then `flutter pub get` |

---

## 10. Security & Privacy Notes

- All data remains on the device unless explicitly shared by the user.
- No analytics, no tracking, no cloud telemetry.
- Images are compressed to 800px max at 60% quality (~50-80KB each).
- Database is stored in Android's app-private directory.

---

**Build completed. Ready for field deployment in Kurigram.**
