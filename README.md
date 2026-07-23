# Kurigram Nursery Registry

A fully offline, zero-API-key mobile GIS application for nursery data collection and mapping in Kurigram District, Bangladesh.

## Features

- **Interactive Map**: OpenStreetMap-based mapping with real-time nursery pins
- **GPS Auto-Capture**: One-tap location locking for nursery coordinates
- **Image Compression**: Photos automatically resized to 800px at 60% quality (~60KB per image)
- **Inventory Management**: Track Fruit (ফলদ), Forest (বনজ), and Medicinal (ঔষধি) saplings
- **Offline-First**: Full SQLite database — works without any internet connection
- **Peer-to-Peer Sync**: Export/import registry data via WhatsApp/Email as JSON with embedded base64 images
- **Search**: Find nurseries by name, address, owner, or tree type
- **One-Tap Actions**: Direct calling and navigation to any nursery
- **Zero Cost**: No Firebase, no Google Cloud, no API keys, no recurring bills

## Architecture

| Layer | Technology | Cost | Offline |
|-------|-----------|------|---------|
| Map | OpenStreetMap + flutter_map | Free | Cached tiles |
| Database | SQLite (sqflite) | Free | Fully offline |
| Images | Local filesystem | Free | Fully offline |
| Sync | JSON export/import | Free | Peer-to-peer |
| Search | SQLite FTS | Free | Fully offline |

## Requirements

- Flutter SDK >= 3.0.0
- Android SDK (API 21+)
- Android Studio or VS Code

## Quick Start

### 1. Configure Flutter SDK Path

Copy the template and set your actual Flutter SDK path:

```bash
cp android/local.properties.template android/local.properties
```

Edit `android/local.properties`:
```
flutter.sdk=/Users/yourname/development/flutter
sdk.dir=/Users/yourname/Library/Android/sdk
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Build Release APK

```bash
flutter clean
flutter pub get
flutter build apk --release
```

The APK will be at:
```
build/app/outputs/flutter-apk/app-release.apk
```

### 4. Install on Device

```bash
flutter install
```

Or manually transfer the APK to your Android device and install.

## Permissions

The app requires these Android permissions (requested at runtime):

- **Internet** — to load OpenStreetMap tiles
- **Location (Fine & Coarse)** — to capture nursery GPS coordinates
- **Camera** — to take nursery photos
- **Phone** — to enable one-tap calling

No Google account, no Firebase login, no API key registration needed.

## Project Structure

```
kurigram_nursery_registry/
├── android/                          # Android platform files
│   ├── app/
│   │   ├── build.gradle              # App-level build config (minify enabled)
│   │   ├── proguard-rules.pro        # ProGuard obfuscation rules
│   │   └── src/
│   │       ├── main/
│   │       │   ├── AndroidManifest.xml    # Permissions only, no API keys
│   │       │   ├── kotlin/.../MainActivity.kt
│   │       │   └── res/              # Android resources (styles, drawables)
│   │       ├── debug/
│   │       └── profile/
│   ├── build.gradle                  # Project-level build config
│   ├── settings.gradle               # Flutter plugin loader
│   ├── gradle.properties
│   └── gradle/wrapper/               # Gradle wrapper config
├── lib/
│   ├── main.dart                     # App entry point
│   ├── models/
│   │   ├── nursery.dart              # Nursery data model
│   │   └── inventory_item.dart       # Inventory item model
│   ├── services/
│   │   ├── database_helper.dart      # SQLite CRUD + JSON export/import
│   │   └── image_service.dart        # Camera + compression pipeline
│   └── screens/
│       ├── map_screen.dart           # OpenStreetMap + search + markers
│       └── nursery_form_screen.dart  # Data collection form
├── pubspec.yaml                      # Dependencies (all open source)
├── analysis_options.yaml
├── .gitignore
└── BUILD_GUIDE.md                    # Detailed deployment instructions
```

## Field Workflow

### For Field Officers (Data Collection)

1. Open app → tap **+** (Add Nursery)
2. Enter nursery name, owner, address, mobile
3. Tap **Capture Location** — GPS auto-locks coordinates
4. Tap **Take Photo** — image compresses to ~60KB automatically
5. Add tree inventory (select category: Fruit/Forest/Medicinal)
6. Tap **Save to Local Registry**

Data is stored locally on the device. No internet required.

### For District Office (Data Aggregation)

1. Open app → tap **☰ Menu**
2. Tap **Export Data (Share)** — generates JSON with embedded base64 images
3. Share via WhatsApp/Email/Bluetooth to district office
4. District office opens app → **Menu → Import Data**
5. Paste the JSON string — all nurseries with photos appear on the map instantly

No server infrastructure. No cloud costs. Works in zero-signal areas.

## Data Model

### Nursery
- `name` (required)
- `owner_name`
- `address`
- `mobile`
- `lat`, `lng` (GPS coordinates)
- `image_path` (local file path)
- `created_at`
- `inventory` (list of InventoryItem)

### InventoryItem
- `category`: Fruit (ফলদ) / Forest (বনজ) / Medicinal (ঔষধি)
- `tree_name`: e.g., Malta, Mango, Mahogany
- `age_range`: e.g., "1-6 months", "2+ years"
- `quantity`: number of saplings

## Customization

### Change Map Center
Edit `lib/screens/map_screen.dart`:
```dart
initialCenter: const LatLng(25.8103, 89.6487), // Kurigram center
```

### Adjust Image Compression
Edit `lib/services/image_service.dart`:
```dart
quality: 60,      // Change to 50-90
minWidth: 800,    // Change max dimension
minHeight: 800,
```

### Add More Tree Categories
Edit `lib/screens/nursery_form_screen.dart`:
```dart
items: ['Fruit (ফলদ)', 'Forest (বনজ)', 'Medicinal (ঔষধি)', 'Your Category']
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Map shows blank grid | Check internet connection (tiles load once, then cache) |
| Location not capturing | Enable GPS in Android settings; grant location permission |
| Camera crashes | Grant camera permission; ensure device has camera app |
| Import fails | Ensure JSON is complete and not truncated by WhatsApp |
| Build fails with "flutter.sdk not set" | Configure `android/local.properties` with your Flutter SDK path |
| APK too large | Use `flutter build apk --split-per-abi` |

## License

This project is open source. All dependencies are permissively licensed.
No proprietary Google services are used.

## Support

For build issues, ensure:
1. Flutter SDK is properly installed (`flutter doctor` passes)
2. `android/local.properties` points to your Flutter and Android SDKs
3. Android device has Developer Options and USB Debugging enabled

---

**Built for Kurigram District, Bangladesh. Zero cost. Fully offline. Field-ready.**
