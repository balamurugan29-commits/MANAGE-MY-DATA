# Project Walkthrough: MANAGE MY DATA B2B Business Directory

We have successfully developed and extended the full-stack B2B Business Directory application. The application uses a **React (Vite)** frontend, a **Spring Boot** backend, and is configured to connect to **Microsoft SQL Server (MSSQL)**.

---

## 🏗️ What was Implemented

### 1. Database Layer (`db/`)
- Created [schema.sql](file:///d:/techno%20new/manage%20%20my%20data/db/schema.sql): Sets up tables mapping users, categories, cities, businesses, product catalogs, contact leads/inquiries, and review ratings.
- Populated database seed details including 12 key industrial categories and 15 major Indian cities.

### 2. Multi-Tiered Access & Roles Control Panel
We introduced a tiered administrative system separating Super Admin, Admins, and general users:
- **Super Boss Admin (`ROLE_SUPER_ADMIN`)**:
  - Full platform management capabilities.
  - Exclusive access to the **Admin Accounts Management Panel** inside the Admin Console.
  - Power to create new normal admins and delete active sub-admins.
  - Seeded credentials: `superadmin` / `super123`
- **Sub-Admin (`ROLE_ADMIN`)**:
  - Fully empowered to moderate search listings (approve registrations and toggle verification badges) and view analytics stats.
  - Blocked from editing other admin accounts or viewing the Admin user table.
  - Seeded credentials: `admin` / `admin123`

---

## 🔒 Data Entry Role Restrictions

As requested, **only Super Admins and Admins can perform data entry** (creating listings, modifying profiles, or managing catalog products). 
General users are read-only visitors who can search the directory, check business maps, and submit inquiries/reviews.

### Enforced Rules:
1. **Backend REST API Guards**:
   - `POST /api/listings`, `PUT /api/listings/{id}`, `DELETE /api/listings/{id}`, `POST /api/listings/{id}/products`, and `DELETE /api/listings/{id}/products/{productId}` check the caller's role. If the caller does not have `ROLE_ADMIN` or `ROLE_SUPER_ADMIN`, a `403 Forbidden` response is returned.
2. **Frontend UI Restrictions**:
   - **Navbar Link Filtering**: The "Data Entry Dashboard" link is only rendered if the logged-in user is an Admin or Super Admin.
   - **Dashboard Page Guard**: If a general user attempts to navigate directly to `/dashboard`, the page displays an **Access Restricted** message blocker.
   - **Homepage CTA Branding**: Reworded call-to-actions to instruct sellers to submit details to administrators to perform data entry and showcase their product catalog.

---

## 📍 Cascading Location Filters (State -> City -> Area)

To provide dynamic locality filtering, we implemented a cascading location selector in the **Search Listings** sidebar:
1. **State Dropdown**:
   - Displays all unique states dynamically collected from the database (e.g. *Tamil Nadu*, *Maharashtra*, *Delhi*, etc.).
   - Selecting a State filters the *City / Location* dropdown list to show only the cities inside that state.
2. **City / Location Dropdown**:
   - Updates reactively based on the selected state.
   - Choosing a City triggers the rendering of the *Area / Locality* dropdown.
3. **Area / Locality Dropdown**:
   - Loaded from a lookup map of areas mapping major cities to their neighborhoods (e.g., selecting **Chennai** shows *Anna Nagar*, *Guindy*, *Tambaram*, *Adyar*, *T. Nagar*, *Velachery*).
   - Selecting an Area filters directory listings and updates map pins immediately on the client side based on address matches (e.g., matching "Anna Nagar" in the address).

---

## 🐳 Running with Docker Compose

Spin up the entire containerized stack using:

```bash
docker compose up --build -d
```

### Access URL Ports:
- **React Frontend Portal**: **[http://localhost:5173](http://localhost:5173)**
- **Spring Boot Backend API**: **[http://localhost:8080](http://localhost:8080)**

---

## 👤 Verification Workflow (Demo Script)

### 1. Cascading Filters Verification
1. Navigate to **Search Listings** on **[http://localhost:5173/#/search](http://localhost:5173/#/search)**.
2. In the sidebar, select **Tamil Nadu** under the *State* dropdown.
3. The *City / Location* dropdown is updated to show only Tamil Nadu cities (e.g. *Chennai*, *Coimbatore*).
4. Select **Chennai** from the *City / Location* dropdown.
5. The **Area / Locality** dropdown renders below the city selector.
6. Select **Anna Nagar** from the area list.
7. The listings list and the interactive side-panel map automatically update to display Chennai businesses located in the Anna Nagar locality.
