# Data Schema Reference

This document describes the structure of the nursery dataset that powers the Kurigram Nursery Registry.

- **Source file:** [`src/lib/nursery-data.json`](../src/lib/nursery-data.json)
- **Format:** JSON array of `Nursery` objects
- **Size:** 137 entries, ~14,500 lines, ~450 KB
- **Served via:** `GET /api` → returns the full array

---

## Top-level Schema

Each entry in the JSON array represents a single nursery and conforms to the following TypeScript interface (mirrored in `src/app/page.tsx`):

```typescript
interface Nursery {
  registry_serial: number | null
  owner: string
  nursery_name_raw: string
  address: string | null
  mobile: string | null
  mobile_source?: string
  upazila: string
  latitude: number | null
  longitude: number | null
  gps_status: string | null
  maps_link: string | null
  fruit_seedlings: number
  forest_seedlings: number
  medicinal_seedlings: number
  total_seedlings: number
  main_variety: string | null
  verification: string | null
  priority: string | null
  has_pivot_data: boolean
  pivot_inventory: InventoryItem[]
  pivot_total_plants: number
  pivot_total_seedlings: number
  pivot_total_grafts: number
  region: string
  district: string
}

interface InventoryItem {
  category: string         // "Fruit" | "Forest" | "Medicinal"
  plant_name: string | null
  age_group: string | null // e.g., "1-6 Months", "6-12 Months", "2+ Years"
  total: number
  seedlings: number
  grafts: number
}
```

---

## Field Reference

### Identity & Location

| Field | Type | Description |
|-------|------|-------------|
| `registry_serial` | `number \| null` | Sequential registry number (1–137). `null` for inventory-only entries that were not in the original registry. |
| `owner` | `string` | Nursery owner's name (Bengali). Example: `মোঃ নুর বক্ত আলী` |
| `nursery_name_raw` | `string` | Raw nursery name string from source data — often contains the owner name and location combined. |
| `address` | `string \| null` | Locality / village name (Bengali). May be `null` if not recorded. |
| `mobile` | `string \| null` | 11-digit Bangladeshi mobile number (`01[3-9]XXXXXXXXX`). `null` when not available. |
| `mobile_source` | `string` (optional) | Indicates where the mobile number came from (registry, pivot, or extracted from text). |
| `upazila` | `string` | Upazila name in Bengali. One of 9 values (see [Upazilas](#upazilas-covered) below). |
| `region` | `string` | Division name. Always `রংপুর` (Rangpur). |
| `district` | `string` | District name. Always `কুড়িগ্রাম` (Kurigram). |

### GPS & Maps

| Field | Type | Description |
|-------|------|-------------|
| `latitude` | `number \| null` | Decimal degrees, WGS84. `null` or `0` indicates missing/invalid GPS. |
| `longitude` | `number \| null` | Decimal degrees, WGS84. `null` or `0` indicates missing/invalid GPS. |
| `gps_status` | `string \| null` | Validation flag in Bengali. Examples: `বৈধ ✓ (DMS)` (valid), `নেই ✗` (missing). |
| `maps_link` | `string \| null` | Display label for the Google Maps link. The actual URL is constructed from `latitude` and `longitude` in the frontend. |

### Registry-Level Inventory Summary

These fields come from the original registry spreadsheet (`nursery_registry` tab of the expanded directory) and represent the registry's per-category totals.

| Field | Type | Description |
|-------|------|-------------|
| `fruit_seedlings` | `number` | Total fruit (ফলদ) seedlings recorded in the registry. |
| `forest_seedlings` | `number` | Total forest (বনজ) seedlings recorded in the registry. |
| `medicinal_seedlings` | `number` | Total medicinal (ঔষধি) seedlings recorded in the registry. |
| `total_seedlings` | `number` | Sum of the three seedling categories above. |
| `main_variety` | `string \| null` | Primary plant variety grown (free text, Bengali). |

### Pivot (Detailed) Inventory

The `pivot_*` fields come from the cleaned inventory dataset (`Kurigram_Nursery_Cleaned_Data (2).xlsx`) and provide per-plant-level detail.

| Field | Type | Description |
|-------|------|-------------|
| `has_pivot_data` | `boolean` | `true` if the nursery has detailed inventory rows in the cleaned dataset. |
| `pivot_inventory` | `InventoryItem[]` | Array of detailed inventory rows (see [InventoryItem](#inventoryitem-schema) below). |
| `pivot_total_plants` | `number` | Sum of `total` across all `pivot_inventory` rows. |
| `pivot_total_seedlings` | `number` | Sum of `seedlings` across all `pivot_inventory` rows. |
| `pivot_total_grafts` | `number` | Sum of `grafts` across all `pivot_inventory` rows. |

### Status & Priority

| Field | Type | Description |
|-------|------|-------------|
| `verification` | `string \| null` | Verification status in Bengali. `null` when not yet verified. |
| `priority` | `string \| null` | Priority flag for field follow-up. Common values: `মোবাইল নেই` (no mobile), `জরুরি` (urgent), `সম্পন্ন` (complete). |

---

## InventoryItem Schema

Each element of `pivot_inventory` represents a single plant variety within the nursery's inventory.

| Field | Type | Description |
|-------|------|-------------|
| `category` | `string` | One of `"Fruit"`, `"Forest"`, `"Medicinal"`. Mapped to UI labels: Fruit (ফলদ), Forest (বনজ), Medicinal (ঔষধি). |
| `plant_name` | `string \| null` | Specific plant name in Bengali (e.g., `মাল্টা` = Malta orange, `মেহগনি` = Mahogany). `null` for aggregated rows. |
| `age_group` | `string \| null` | Sapling age bracket. Common values: `"1-6 Months"`, `"6-12 Months"`, `"1-2 Years"`, `"2+ Years"`. |
| `total` | `number` | Total plants of this variety in this age group. |
| `seedlings` | `number` | Number of seedlings (germinated from seed). |
| `grafts` | `number` | Number of grafts (vegetatively propagated). |

> **Constraint:** `total === seedlings + grafts` for each row (within rounding).

---

## Upazilas Covered

The dataset covers **9 upazilas** of Kurigram District:

| Bengali Name | English Transliteration |
|--------------|-------------------------|
| কুড়িগ্রাম সদর | Kurigram Sadar |
| উলিপুর | Ulipur |
| চর রাজিবপুর | Char Rajibpur |
| চিলমারী | Chilmari |
| নাগেশ্বরী | Nageshwari |
| ফুলবাড়ী | Phulbari |
| ভূরুঙ্গামারী | Bhurungamari |
| রাজারহাট | Rajarhat |
| রৌমারী | Roumari |

---

## Aggregate Statistics

As of the latest data merge:

| Metric | Value |
|--------|-------|
| Total nurseries | 137 |
| Nurseries with mobile number | 101 (74%) |
| Nurseries with valid GPS | 90 (66%) |
| Total plants (pivot) | 1,179,360 |
| Total seedlings (pivot) | 817,184 |
| Total grafts (pivot) | 353,990 |

---

## Example Entry

```json
{
  "registry_serial": 1,
  "owner": "মোঃ নুর বক্ত আলী",
  "nursery_name_raw": "মোঃ নুর বক্ত আলী, তালুক কালোয়া",
  "address": "তালুক কালোয়া",
  "mobile": null,
  "upazila": "কুড়িগ্রাম সদর",
  "latitude": 25.560833,
  "longitude": 89.831111,
  "gps_status": "বৈধ ✓ (DMS)",
  "maps_link": "📍 ম্যাপ দেখুন",
  "fruit_seedlings": 0,
  "forest_seedlings": 0,
  "medicinal_seedlings": 0,
  "total_seedlings": 0,
  "main_variety": null,
  "verification": null,
  "priority": "মোবাইল নেই",
  "has_pivot_data": true,
  "pivot_inventory": [
    {
      "category": "Forest",
      "plant_name": "চায়না নিম",
      "age_group": "1-6 Months",
      "total": 0,
      "seedlings": 0,
      "grafts": 0
    },
    {
      "category": "Fruit",
      "plant_name": "মাল্টা",
      "age_group": "1-6 Months",
      "total": 300,
      "seedlings": 0,
      "grafts": 300
    },
    {
      "category": "Medicinal",
      "plant_name": null,
      "age_group": "6-12 Months",
      "total": 800,
      "seedlings": 800,
      "grafts": 0
    }
  ],
  "pivot_total_plants": 4200,
  "pivot_total_seedlings": 3900,
  "pivot_total_grafts": 300,
  "region": "রংপুর",
  "district": "কুড়িগ্রাম"
}
```

---

## Data Provenance

The merged dataset was produced from two Excel source files preserved in [`upload/`](../upload/):

1. **`Kurigram_Nursery_Cleaned_Data (2).xlsx`** — 1,381 rows of plant-level inventory across 137 unique nurseries. Used for all `pivot_*` fields.
2. **`Kurigram_Plant_Nurseries_Expanded_Directory (1).xlsx`** — 204 registry entries with GPS, mobile, verification, and seedling counts. Used for all registry-level fields.

### Merge methodology

1. Deduplicated 137 unique nurseries from the cleaned inventory using `owner + upazila` as the key.
2. Matched 119 registry entries to the 137 inventory entries.
3. Added 18 inventory-only nurseries not present in the registry.
4. Backfilled missing mobile numbers and GPS coordinates from whichever source had the better value.
5. Tagged each entry with `priority` flags.

The complete transformation log is in [`worklog.md`](../worklog.md).

---

## Validation Rules

When adding or updating entries, ensure the following invariants hold:

- `owner` is non-empty.
- `upazila` is one of the 9 valid values (see [Upazilas Covered](#upazilas-covered)).
- `region` is `রংপুর`.
- `district` is `কুড়িগ্রাম`.
- If `mobile` is non-null, it matches the regex `^01[3-9]\d{8}$`.
- If `latitude` and `longitude` are non-null and non-zero, they fall within Kurigram District's bounding box:
  - Latitude: `25.0` – `26.0`
  - Longitude: `89.0` – `90.0`
- For each `InventoryItem`: `total === seedlings + grafts`.
- `pivot_total_plants === sum(pivot_inventory[*].total)`.
- `pivot_total_seedlings === sum(pivot_inventory[*].seedlings)`.
- `pivot_total_grafts === sum(pivot_inventory[*].grafts)`.

---

## Updates & Versioning

When the dataset is regenerated, update the following:

1. The `src/lib/nursery-data.json` file (committed to git).
2. The stats in [`README.md`](../README.md) "Key Metrics" table.
3. The [Aggregate Statistics](#aggregate-statistics) table above.
4. Add an entry to [`CHANGELOG.md`](../CHANGELOG.md) under `[Unreleased]`.
