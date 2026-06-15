# PharmaServ — Admin API Documentation

**Version:** 3.0  
**Base URL:** `http://<host>:<port>`  
**Auth:** Bearer JWT — include `Authorization: Bearer <accessToken>` on all routes.

---

## Security & Access Control

All endpoints in this documentation require:
1. `JwtAuthGuard`: Verifies that a valid Access Token is provided.
2. `RolesGuard` with `@Roles(UserRole.ADMIN)`: restrics access exclusively to users with the `admin` role.

### Typical Error Codes
* **400 Bad Request:** Validation failed or body constraint violated.
* **401 Unauthorized:** Missing, expired, or invalid token.
* **403 Forbidden:** User has a valid token but lacks the `admin` role.
* **404 Not Found:** Requested resource does not exist.
* **409 Conflict:** Resource already exists (e.g., duplicate mobile number).

---

## Table of Contents
1. [Admin User Management](#1-admin-user-management)
2. [Address Hierarchy Management](#2-address-hierarchy-management)
3. [Pharmacy Verification & Approval](#3-pharmacy-verification--approval)
4. [Pharmacy Files Management](#4-pharmacy-files-management)
5. [User Accounts Directory](#5-user-accounts-directory)
6. [Registered App Users Directory](#6-registered-app-users-directory)
7. [Warehouse Setup & Delivery Zones](#7-warehouse-setup--delivery-zones)
8. [Home Screen Curation](#8-home-screen-curation)
9. [Product catalog management](#9-product-catalog-management)
10. [Stats & Sales Reports](#10-stats--sales-reports)
11. [Password Reset Requests](#11-password-reset-requests)

---

## 1. Admin User Management

### POST /admin/users/create-admin
Creates a new administrator account.

**Request Body:**
```json
{
  "userName": "Admin User",
  "mobileNo": "+963933335555",
  "password": "adminPassword123"
}
```
* `userName` (string, Required): The admin user's name.
* `mobileNo` (string, Required): Unique phone number in international format.
* `password` (string, Required): Minimum 8 characters.

**Response 201:**
```json
{
  "message": "Admin user created successfully",
  "user": {
    "id": "uuid",
    "userName": "Admin User",
    "mobileNo": "+963933335555",
    "role": "admin",
    "enabled": true,
    "createdAt": "2026-06-14T20:54:48.000Z"
  }
}
```
**Response 400:** Bad request (validation failed or phone already exists).

---

## 2. Address Hierarchy Management

### POST /admin/address/states
**Request Body:** `{ "name": "Damascus" }` (Required: `name` string)  
**Response 201:** `{ "message": "State created successfully", "state": { "id": "uuid", "name": "Damascus", "createdAt": "...", "updatedAt": "..." } }`

### GET /admin/address/states
**Response 200:**
```json
{
  "message": "States retrieved successfully",
  "states": [{ "id": "uuid", "name": "Damascus", "citiesCount": 5, "createdAt": "...", "updatedAt": "..." }],
  "total": 1
}
```

### GET /admin/address/states/:id
**Response 200:** Returns the state object with its list of cities.  
**Response 404:** State not found.

### PUT /admin/address/states/:id
**Request Body:** `{ "name": "Updated Damascus" }`  
**Response 200:** `{ "message": "State updated successfully", "state": { ... } }`

### DELETE /admin/address/states/:id
**Response 200:** `{ "message": "State deleted successfully" }`

---

### POST /admin/address/cities
**Request Body:** `{ "name": "Mazzeh", "stateId": "uuid-of-state" }` (All fields required)  
**Response 201:** Created city details.

### GET /admin/address/cities
**Query Params:** `stateId` (string, Optional) — Filter by State.  
**Response 200:** Paginated or list of cities.

### GET /admin/address/cities/:id
**Response 200:** City object with district listings.

### PUT /admin/address/cities/:id
**Request Body:** `{ "name": "Updated Mazzeh", "stateId": "uuid-of-state" }`  
**Response 200:** Updated city details.

### DELETE /admin/address/cities/:id
**Response 200:** Success message.

---

### POST /admin/address/districts
**Request Body:** `{ "name": "Mazzeh Al-Gharbia", "cityId": "uuid-of-city" }`  
**Response 201:** Created district details.

### GET /admin/address/districts
**Query Params:** `cityId` (Optional), `stateId` (Optional).  
**Response 200:** List of districts with cityName and stateName.

### GET /admin/address/districts/:id
**Response 200:** District details.

### PUT /admin/address/districts/:id
**Request Body:** `{ "name": "Mazzeh Al-Gharbia", "cityId": "uuid-of-city" }`  
**Response 200:** Updated district.

### DELETE /admin/address/districts/:id
**Response 200:** Success message.

---

## 3. Pharmacy Verification & Approval

### GET /admin/pharmacies/stats
Returns a count breakdown of pharmacy registrations.

**Response 200:**
```json
{
  "message": "Pharmacy statistics retrieved successfully",
  "statistics": { "total": 200, "pending": 10, "approved": 185, "rejected": 5 }
}
```

### GET /admin/pharmacies
Browse all pharmacy registrations.

**Query Params:**
* `status` (enum: `Pending` | `Active` | `Disabled`, Optional)
* `limit` (number, Default 50, Max 100)
* `offset` (number, Default 0)
* `orderBy` (string: `createdAt` | `updatedAt` | `pharmacy_name`, Default `createdAt`)
* `orderDirection` (enum: `ASC` | `DESC`, Default `DESC`)
* `search` (string, Optional)
* `hasDocuments` (boolean string: `true` | `false`, Optional)

**Response 200:** Paginated list of pharmacies with total and filters returned.

---

### PUT /admin/pharmacies/:id/approve
Approves registration. Changes `pharmacies.status` -> `Active` and enables all users under the pharmacy.

**Request Body:** `{ "adminNotes": "License papers verified" }` (Notes are optional)

**Response 200:**
```json
{
  "message": "Pharmacy approved successfully and all associated users have been enabled",
  "pharmacy": {
    "id": "uuid",
    "pharmacy_name": "Al-Nour Pharmacy",
    "status": "Active",
    "adminNotes": "License papers verified"
  },
  "pharmacyProfile": { ... },
  "users": {
    "updatedCount": 1,
    "users": [{ "id": "uuid", "userName": "manager", "enabled": true }]
  }
}
```

### PUT /admin/pharmacies/:id/reject
Rejects registration. Changes `pharmacies.status` -> `Disabled` and disables associated users.

**Request Body:** `{ "adminNotes": "Documents are expired" }`

**Response 200:** Same shape as approve but status is `Disabled`, user `enabled: false`.

---

### GET /admin/pharmacies/:id
Retrieves full information for a pharmacy, including user, profile details, and uploaded files.

**Response 200:**
```json
{
  "message": "Pharmacy details retrieved successfully",
  "pharmacy": { "id": "uuid", "status": "Pending", "hasUploadedDocuments": true, ... },
  "pharmacyProfile": { ... },
  "user": { "id": "uuid", "userName": "manager", "mobileNo": "..." },
  "documents": [{ "id": "uuid", "fileName": "license.pdf", "fileType": "pharmacy_license" }]
}
```

---

## 4. Pharmacy Files Management

### POST /admin/pharmacy-files/upload/:pharmacyId
Allows admins to upload verification documents for a pharmacy.

**Content-Type:** `multipart/form-data`  
**Body Parameters:**
* `files` (Binary array, Required): Multiple documents (images/PDFs) to upload.
* `fileTypes` (JSON String, Required): Mapping index of files to types, e.g. `'{"0":"pharmacy_license","1":"id_card"}'`.

**Response 201:** Success message and array of saved file records.

### GET /admin/pharmacy-files/pharmacy/:pharmacyId
Retrieve list of documents for a pharmacy.

**Response 200:** `{ "message": "...", "pharmacy": { ... }, "files": [...], "stats": { ... } }`

### GET /admin/pharmacy-files/download/:fileId
Download a specific file.

**Response 200:** Binary file buffer with corresponding `Content-Type` and `Content-Disposition`.

### DELETE /admin/pharmacy-files/:fileId
Deletes a document from the DB and from file storage.

### GET /admin/pharmacy-files/stats
Returns global statistics about uploaded pharmacy documents (total files, size, files per type).

### GET /admin/pharmacy-files/all
List all uploaded pharmacy files. Optional query param: `fileType`.

### GET /admin/pharmacy-files/required-types
Returns types of documents required for registration.  
**Response 200:** `{"message": "...", "requiredTypes": [{"value": "pharmacy_license", "label": "Pharmacy License"}]}`

### DELETE /admin/pharmacy-files/pharmacy/:pharmacyId/cleanup
Cleans up and deletes all files belonging to a pharmacy.

---

## 5. User Accounts Directory

This section manages **all** accounts in the database (Admins, Warehouse managers, Pharmacy managers, etc.).

### GET /admin/users
List all users with filters.

**Query Params:**
* `role` (enum: `admin` | `warehouse_manager` | `warehouse_user` | `pharmacy_manager` | `pharmacy_user`, Optional)
* `search` (string, Optional): Match username or mobile number.
* `enabled` (boolean, Optional)
* `warehouseId` (string, Optional)
* `pharmacyId` (string, Optional)
* `limit` (number, 1-100, Default 10)
* `offset` (number, Default 0)
* `orderBy` (string, Default `userName`)
* `orderDirection` (enum: `ASC` | `DESC`, Default `ASC`)

**Response 200:** Paginated users list with profile relations included.

### GET /admin/users/pharmacy
Returns only pharmacy-side users.  
**Response 200:** `{ "message": "...", "users": [...], "total": 42 }`

### GET /admin/users/:id
Retrieves account and profile info for a single user by ID.

### PUT /admin/users/:id/enable
Enables a disabled user account. If user belongs to a pharmacy, also marks pharmacy status as `Active`.

### PUT /admin/users/:id/disable
Disables a user account. If user belongs to a pharmacy, also marks pharmacy status as `Disabled`.

### PUT /admin/users/:id/disable-with-cleanup
Disables user and deletes all uploaded pharmacy documents on disk and database.

**Request Body (Optional):** `{ "reason": "Violation of terms" }`

### GET /admin/users/:userId/documents
Retrieves documents uploaded by a specific user.

### PUT /admin/users/:id/change-password
Directly changes the password of any user. The password is automatically hashed and updated.

* **Request Body:**
  ```json
  {
    "newPassword": "newSecurePassword123"
  }
  ```
  * `newPassword` (string, Required): The new password for the user, minimum 6 characters.

* **Response 200 Success:**
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
* **Response 404 Error (Not Found):**
  ```json
  {
    "statusCode": 404,
    "message": "User not found",
    "error": "Not Found"
  }
  ```

---

## 6. Registered App Users Directory

Manages users who registered from the app (Pharmacy Managers / Independent Pharmacists).

### GET /admin/registered-users/pharmacy-accounts
List users with `accountType = Pharmacy_Account`.

**Query Params:** `enabled` (boolean), `search` (string), `limit` (number), `offset` (number).  
**Response 200:** Paginated list including profile objects.

### GET /admin/registered-users/independent-pharmacists
List users with `accountType = Independent_Pharmacist`. Same query params as above.

### GET /admin/registered-users/:id
Returns detailed account info, profile images, and uploaded documents for a registered app user.

---

## 7. Warehouse Setup & Delivery Zones

### POST /admin/warehouses/create
Creates a warehouse.

**Request Body:**
```json
{
  "warehouse_name": "North Warehouse",
  "district": "uuid-of-district",
  "phone": "+963955551234",
  "location": "33.5138, 36.2765",
  "imageUrl": "http://<host>/uploads/files/warehouse.jpg"
}
```
* `warehouse_name` (string, Required)
* `district` (UUID, Required): District where warehouse is located.
* `phone` (string, Required)
* `location` (string, Optional): Map coordinates / link.
* `imageUrl` (string, Optional): Image URL of the warehouse.

**Response 201:** Created warehouse object, including `imageUrl`.

---

### POST /admin/warehouses/users/warehouse-manager
Creates a warehouse manager user account.

**Request Body:**
```json
{
  "userName": "Manager Name",
  "mobileNo": "+963944445555",
  "password": "password123",
  "warehouseId": "uuid-of-warehouse"
}
```
* `userName` (string, Required)
* `mobileNo` (string, Required)
* `password` (string, Required, Min 6 chars)
* `warehouseId` (UUID, Optional)

**Response 201:** Success message and manager user object.

---

### GET /admin/warehouses/stats
**Response 200:** `{ "message": "...", "statistics": { "total": 10, "enabled": 8, "disabled": 2 } }`

### GET /admin/warehouses
List warehouses with filters.

**Query Params:** `status` (enabled/disabled), `search`, `district`, `limit`, `offset`, `orderBy` (`createdAt` | `updatedAt` | `warehouse_name`), `orderDirection` (`ASC` | `DESC`).

**Response 200:**
```json
{
  "message": "Warehouses retrieved successfully",
  "warehouses": [
    {
      "id": "uuid",
      "warehouse_name": "North Warehouse",
      "district": "district-uuid",
      "phone": "+963955551234",
      "location": "33.5138, 36.2765",
      "status": "enabled",
      "adminNotes": null,
      "imageUrl": "http://<host>/uploads/files/warehouse.jpg",
      "createdAt": "2026-06-14T20:54:48.000Z",
      "updatedAt": "2026-06-14T20:54:48.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 50,
    "offset": 0,
    "hasMore": false,
    "returned": 1
  },
  "filters": {
    "status": "all",
    "search": "",
    "district": ""
  }
}
```

### GET /admin/warehouses/:id
Returns warehouse details and its user accounts.

**Response 200:**
```json
{
  "message": "Warehouse details retrieved successfully",
  "warehouse": {
    "id": "uuid",
    "warehouse_name": "North Warehouse",
    "district": "district-uuid",
    "phone": "+963955551234",
    "location": "33.5138, 36.2765",
    "status": "enabled",
    "adminNotes": null,
    "imageUrl": "http://<host>/uploads/files/warehouse.jpg",
    "createdAt": "2026-06-14T20:54:48.000Z",
    "updatedAt": "2026-06-14T20:54:48.000Z"
  },
  "users": [
    {
      "id": "uuid",
      "userName": "Manager Name",
      "mobileNo": "+963944445555",
      "role": "warehouse_manager",
      "enabled": true,
      "createdAt": "2026-06-14T20:54:48.000Z",
      "updatedAt": "2026-06-14T20:54:48.000Z"
    }
  ],
  "userCount": 1
}
```

---

### Delivery Districts Configuration
Admins configure which districts a warehouse serves.

* **POST `/admin/warehouses/:warehouseId/districts`**
  * Body: `{ "districtId": "uuid" }`
  * Response 201: Adds district to warehouse delivery zone.
* **DELETE `/admin/warehouses/:warehouseId/districts/:districtId`**
  * Response 200: Removes district from delivery zone.
* **PUT `/admin/warehouses/:warehouseId/districts/:districtId`**
  * Body: `{ "active": boolean }`
  * Response 200: Enables or disables delivery to this district.
* **GET `/admin/warehouses/:warehouseId/districts`**
  * Response 200: List all districts assigned to the warehouse.
* **GET `/admin/warehouses/:warehouseId/districts/active`**
  * Response 200: List only active districts.

---

## 8. Home Screen Curation

Admins curate the banners, offers, and featured products displayed on the pharmacy mobile home screen.

### POST /admin/home-screen/banners
Creates a banner. Supports uploading image via multipart request.

**Content-Type:** `multipart/form-data`  
**Parameters:**
* `image` (File, Optional): Image to upload.
* `start_date` (string, Required): YYYY-MM-DD
* `end_date` (string, Optional): YYYY-MM-DD
* `is_carousel` (boolean, Default: false)
* `promotion_id` (UUID, Optional): Link to promotion.
* `sort_order` (integer, Default: 0)
* `is_active` (boolean, Default: true)

**Response 201:** Created banner details.

### POST /admin/home-screen/banners/:id/image
Uploads/replaces the image for an existing banner.  
**Content-Type:** `multipart/form-data` with `image` file field.

### GET /admin/home-screen/banners
List all banners sorted by `sort_order`.

### PATCH /admin/home-screen/banners/:id
Updates banner fields. Body matches partial of fields.

### DELETE /admin/home-screen/banners/:id
Deletes banner and deletes file on disk.

---

### POST /admin/home-screen/offers
Creates a promo card. Supports image upload.

**Content-Type:** `multipart/form-data`  
**Parameters:**
* `image` (File, Optional)
* `title_ar` (string, Required)
* `title_en` (string, Required)
* `details` (string, Optional)
* `promotion_id` (UUID, Optional)
* `sort_order` (integer)
* `is_active` (boolean)

**Response 201:** Created offer details.

### POST /admin/home-screen/offers/:id/image
Uploads/replaces image for an offer.

### GET /admin/home-screen/offers
Lists all offers.

### PATCH /admin/home-screen/offers/:id
Updates offer fields.

### DELETE /admin/home-screen/offers/:id
Deletes offer.

---

### POST /admin/home-screen/featured-items
Features a product on the home screen.

**Request Body:**
```json
{
  "item_id": "uuid-of-item",
  "sort_order": 0,
  "is_active": true
}
```
* `item_id` (UUID, Required)

**Response 201:** Added featured item details.  
**Response 400:** Item not found or already featured.

### GET /admin/home-screen/featured-items
List all featured items.

### PATCH /admin/home-screen/featured-items/:id
Updates sort order or active status.

### DELETE /admin/home-screen/featured-items/:id
Removes the item from the featured listing.

---

## 9. Product Catalog Management

Admins can perform CRUD operations on the global product database, active ingredients, item groups, and manufacturers.

### POST /items
Creates a new global item.

**Request Body:**
```json
{
  "manufacturer_id": "uuid",
  "item_group": "uuid",
  "item_name": "Panadol 500mg",
  "generic_name": "Paracetamol",
  "barcode": "6281234567890",
  "buying_price": 1200.0,
  "selling_price": 1500.0,
  "currency": "uuid-of-currency",
  "drug_class": "OTC",
  "enabled": true,
  "needs_stamp": false
}
```
* `manufacturer_id` (UUID, Required)
* `item_group` (UUID, Required)
* `item_name` (string, Required)
* `buying_price` (number, Required)
* `selling_price` (number, Required)
* `currency` (UUID, Required)
* `drug_class` (enum: `OTC` | `RX` | `Controlled`, Required)

**Response 201:** Created item object.

### PATCH /items/:id
Updates item details. Body takes partial of fields.

### PATCH /items/:id/toggle-enabled
Toggles items between enabled/disabled.

### DELETE /items/:id
Deletes item from global directory.

---

### Active Ingredients
* **POST `/active-ingredients`**  
  Body: `{ "active_ingredient_name": "Paracetamol" }`
* **GET `/active-ingredients/search`**  
  Query: `name` (string)
* **PATCH `/active-ingredients/:id`**  
  Body: `{ "active_ingredient_name": "Paracetamol Extra" }`
* **DELETE `/active-ingredients/:id`**

### Medicine Ingredients (Linking Active Ingredients to Products)
* **POST `/medicine-ingredients`**  
  Body: `{ "item_id": "uuid", "ingredient_id": "uuid", "strength": "500mg" }` (item_id and ingredient_id required)
* **PATCH `/medicine-ingredients/:itemId/:ingredientId`**  
  Body: `{ "strength": "650mg" }`
* **DELETE `/medicine-ingredients/:itemId/:ingredientId`**

### Item Groups
* **POST `/item-groups`**  
  Body: `{ "group_name": "Analgesics" }`
* **PATCH `/item-groups/:id`**  
  Body: `{ "group_name": "Pain Relievers" }`
* **PATCH `/item-groups/:id/toggle-active`**
* **DELETE `/item-groups/:id`**

### Manufacturers

#### POST /manufacturers
Creates a new manufacturer.

**Request Body:**
```json
{
  "name": "Pfizer Inc.",
  "code": "PFZ",
  "description": "Leading pharmaceutical company",
  "country": "United States",
  "phone": "+1-555-123-4567",
  "email": "contact@pfizer.com",
  "website": "https://www.pfizer.com",
  "active": true,
  "imageUrl": "http://<host>/uploads/files/mfg.jpg"
}
```
* `name` (string, Required): Unique manufacturer name.
* `code` (string, Optional): Unique manufacturer code.
* `description` (string, Optional)
* `country` (string, Optional)
* `phone` (string, Optional)
* `email` (string, Optional)
* `website` (string, Optional)
* `active` (boolean, Optional, Default: true)
* `imageUrl` (string, Optional): Image URL of the manufacturer.

**Response 201:**
```json
{
  "message": "Manufacturer created successfully",
  "manufacturer": {
    "id": "uuid",
    "name": "Pfizer Inc.",
    "code": "PFZ",
    "description": "Leading pharmaceutical company",
    "country": "United States",
    "phone": "+1-555-123-4567",
    "email": "contact@pfizer.com",
    "website": "https://www.pfizer.com",
    "active": true,
    "imageUrl": "http://<host>/uploads/files/mfg.jpg",
    "created_at": "2026-06-14T21:04:36.000Z",
    "updated_at": "2026-06-14T21:04:36.000Z"
  }
}
```

#### GET /manufacturers
Lists all manufacturers with filtering and pagination.

**Query Parameters:**
* `search` (string, Optional): Filter by name, code, or country.
* `active` (boolean, Optional): Filter by active status.
* `country` (string, Optional): Filter by country.
* `limit` (number, Default: 10)
* `offset` (number, Default: 0)
* `orderBy` (enum: `name` | `code` | `country` | `created_at` | `updated_at`, Default: `name`)
* `orderDirection` (enum: `ASC` | `DESC`, Default: `ASC`)

**Response 200:**
```json
{
  "message": "Manufacturers retrieved successfully",
  "manufacturers": [
    {
      "id": "uuid",
      "name": "Pfizer Inc.",
      "code": "PFZ",
      "description": "Leading pharmaceutical company",
      "country": "United States",
      "phone": "+1-555-123-4567",
      "email": "contact@pfizer.com",
      "website": "https://www.pfizer.com",
      "active": true,
      "imageUrl": "http://<host>/uploads/files/mfg.jpg",
      "created_at": "2026-06-14T21:04:36.000Z",
      "updated_at": "2026-06-14T21:04:36.000Z"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "hasMore": false,
    "returned": 1
  }
}
```

#### GET /manufacturers/active
Returns all active manufacturers.

**Response 200:**
```json
{
  "message": "Active manufacturers retrieved successfully",
  "manufacturers": [ ... ],
  "total": 1
}
```

#### GET /manufacturers/:id
Get a specific manufacturer by ID.

**Response 200:**
```json
{
  "message": "Manufacturer retrieved successfully",
  "manufacturer": { ... }
}
```

#### PATCH /manufacturers/:id
Updates manufacturer details.

**Request Body:** (Partial update of POST body fields, including `imageUrl`).

**Response 200:**
```json
{
  "message": "Manufacturer updated successfully",
  "manufacturer": { ... }
}
```

#### PATCH /manufacturers/:id/toggle-active
Toggles active status.

**Response 200:**
```json
{
  "message": "Manufacturer activated/deactivated successfully",
  "manufacturer": { ... }
}
```

#### DELETE /manufacturers/:id
Deletes a manufacturer.

**Response 200:**
```json
{
  "message": "Manufacturer deleted successfully"
}
```

---

### Currencies
* **POST `/currencies`**  
  Body: `{ "currency_code": "USD", "currency_name": "US Dollar", "exchange_rate": 1.0, "is_active": true, "is_default": false }`
* **PATCH `/currencies/:id`**
* **PATCH `/currencies/:id/set-default`**
* **PATCH `/currencies/:id/toggle-active`**
* **DELETE `/currencies/:id`**

---

## 10. Stats & Sales Reports

### GET /admin/stats/warehouses
Warehouse counts. `{ "statistics": { "total": 10, "enabled": 8, "disabled": 2 } }`

### GET /admin/stats/pharmacies
Pharmacy counts. `{ "statistics": { "total": 150, "pending": 20, "active": 120, "disabled": 10 } }`

### GET /admin/stats/items
Product counts by status, drug class, manufacturer, and item groups.

### GET /admin/stats/manufacturers
Manufacturer counts by status and location.

### GET /admin/reports/warehouse-sales
Returns total sales amount grouped by manufacturer.

**Query Params:**
* `start_date` (string, Optional, YYYY-MM-DD)
* `end_date` (string, Optional, YYYY-MM-DD)
* `warehouse_id` (UUID, Optional)
* `status` (string, Optional): Comma-separated list of order statuses.

**Response 200:**
```json
{
  "message": "Warehouse sales report retrieved successfully",
  "report": {
    "period": { "start": "2026-04-01T00:00:00.000Z", "end": "2026-04-30T23:59:59.999Z" },
    "filters": { "warehouse_id": "uuid | null", "status": ["Pending", "Completed"] },
    "summary": { "total_sales": 125000.00, "total_orders": 45, "currency": "SYP" },
    "by_manufacturer": [
      {
        "manufacturer_id": "uuid",
        "manufacturer_name": "Pharma Corp",
        "total_sales": 75000.00,
        "order_count": 28,
        "item_count": 12,
        "currency": "SYP"
      }
    ]
  }
}

---

## 11. Password Reset Requests

Allows administrators to review and action (resolve or reject) password reset requests submitted by pharmacy/app users.

### GET /admin/password-reset-requests
Retrieve a list of password reset requests.

* **Query Parameters:**
  * `status` (string enum: `pending` | `resolved` | `rejected`, Optional) - Filter requests by status.
  * `limit` (number, Optional, Default 10) - Max number of requests per page.
  * `offset` (number, Optional, Default 0) - Number of requests to skip.

* **Response 200 Success:**
  ```json
  {
    "message": "Requests retrieved successfully",
    "requests": [
      {
        "id": "uuid",
        "mobileNo": "+963933335555",
        "status": "pending",
        "adminNotes": null,
        "createdAt": "2026-06-15T01:10:00.000Z",
        "updatedAt": "2026-06-15T01:10:00.000Z",
        "user": {
          "id": "uuid",
          "userName": "Pharmacy Owner",
          "mobileNo": "+963933335555",
          "role": "pharmacy_manager"
        }
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 10,
      "offset": 0,
      "hasMore": false,
      "currentPage": 1,
      "totalPages": 1
    }
  }
  ```

---

### PUT /admin/password-reset-requests/:id/resolve
Mark a password reset request as resolved.

* **Path Parameters:**
  * `id` (string UUID, Required) - Request ID.
* **Request Body:**
  ```json
  {
    "adminNotes": "Approved, new password sent to user"
  }
  ```
  * `adminNotes` (string, Optional) - Details or notes from admin.

* **Response 200 Success:**
  ```json
  {
    "message": "Password reset request resolved successfully",
    "request": {
      "id": "uuid",
      "mobileNo": "+963933335555",
      "status": "resolved",
      "adminNotes": "Approved, new password sent to user",
      "userId": "uuid",
      "createdAt": "2026-06-15T01:10:00.000Z",
      "updatedAt": "2026-06-15T01:20:00.000Z"
    }
  }
  ```
* **Response 404 Error (Not Found):**
  ```json
  {
    "statusCode": 404,
    "message": "Reset request not found",
    "error": "Not Found"
  }
  ```

---

### PUT /admin/password-reset-requests/:id/reject
Mark a password reset request as rejected.

* **Path Parameters:**
  * `id` (string UUID, Required) - Request ID.
* **Request Body:**
  ```json
  {
    "adminNotes": "Rejected, invalid request details"
  }
  ```
  * `adminNotes` (string, Optional) - Details or notes from admin.

* **Response 200 Success:**
  ```json
  {
    "message": "Password reset request rejected successfully",
    "request": {
      "id": "uuid",
      "mobileNo": "+963933335555",
      "status": "rejected",
      "adminNotes": "Rejected, invalid request details",
      "userId": "uuid",
      "createdAt": "2026-06-15T01:10:00.000Z",
      "updatedAt": "2026-06-15T01:20:00.000Z"
    }
  }
  ```
* **Response 404 Error (Not Found):**
  ```json
  {
    "statusCode": 404,
    "message": "Reset request not found",
    "error": "Not Found"
  }
  ```
```
