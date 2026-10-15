# Chhote Lal Property Dealer — Website

A modern, responsive, and functional real estate property-dealing website for **Chhote Lal Property Dealer**, located in Varanasi, Uttar Pradesh, India. Built strictly following the official Brand Guidelines, visual hierarchy, honest disclaimers, and authentic business data.

---

## 1. Business Information

- **Business Name:** Chhote Lal Property Dealer
- **Location:** Near Sai Ideal Public Academy, Varanasi, Uttar Pradesh, India
- **Phone:** `9664280667` ([tel:9664280667](tel:9664280667))
- **WhatsApp:** [https://wa.me/919664280667](https://wa.me/919664280667)
- **Languages Supported:** Hindi and English (द्विभाषी)
- **Primary Services:** Buying and selling residential plots, independent houses, and land in Varanasi.

---

## 2. Brand Identity & Design System

- **Primary Navy:** `#10243A`
- **Deep Navy:** `#0A1726`
- **Gold Accent:** `#D6A84F`
- **Warm White:** `#F8F7F3`
- **Pure White:** `#FFFFFF`
- **Text Charcoal:** `#263238`
- **Muted Grey:** `#667085`
- **Border Grey:** `#E4E7EC`
- **Typography:**
  - Hindi: *Noto Sans Devanagari* (Google Fonts)
  - English: *Inter* (Google Fonts)
- **Logo:** Custom SVG emblem combining an architectural roofline, plot perimeter outline, and location pin with clean navy & gold lettering.

---

## 3. Website Pages & Architecture

| File | Page Name | Features |
|---|---|---|
| `index.html` | **Home** | Top announcement bar, Brand header, Hero section with dual Hindi copy & CTAs, Floating real search panel, Featured properties grid, Category cards, Why Contact Us, Sell Property banner, 3-step process, FAQ accordion, Footer with disclaimer. |
| `properties.html` | **Buy Property (All Listings)** | Full filter bar (type, locality search, min/max budget, status, sort), reactive results counter, loading skeleton, empty state, and error handling. |
| `plots.html` | **Plots in Varanasi** | Pre-filtered listing dedicated to residential and colony plots in Varanasi. |
| `houses.html` | **Houses in Varanasi** | Pre-filtered listing for independent family houses with bedroom/bathroom specs. |
| `land.html` | **Land in Varanasi** | Pre-filtered listing for commercial and road-facing land in Biswa/Bigha/Acre. |
| `property-details.html` | **Property Details** | Dynamic query parser (`?id=...`), photo gallery, confirmed facilities, specs table, encoded WhatsApp enquiry button, on-page direct enquiry form, legal disclaimer, similar listings. |
| `sell.html` | **Sell Property** | Property submission form with multi-image drag-and-drop file upload (max 5MB), live thumbnail previews, 10-digit mobile validation, consent checkbox, anti-spam honeypot, and server response. |
| `about.html` | **About Us** | Authentic business background, core principles (transparent info, direct dialogue, honest guidance), contact callouts. |
| `contact.html` | **Contact Us** | Direct phone call CTA, WhatsApp chat link, verified location description, buyer requirement enquiry form. |
| `privacy-policy.html` | **Privacy Policy** | Explains what data is collected, purpose of collection, non-disclosure terms, and contact instructions. |
| `admin/login.html` | **Admin Login** | Secure admin login with session authentication and robots `noindex` protection. |
| `admin/dashboard.html` | **Admin Dashboard** | KPI overview cards, Property CRUD (Add, Edit, Delete with modal confirmation, Status dropdown), Buyer Enquiry tracker with internal notes, Seller Submissions reviewer, Supabase settings tab. |
| `404.html` | **Not Found Page** | 404 error page with quick links to Home, Properties, and Contact. |

---

## 4. Database & Storage Architecture (Supabase)

The project includes production-ready SQL scripts located in the `supabase/` folder:

1. **`supabase/schema.sql`**:
   - `properties` table with UUID, type, locality, price, area, status, facilities, images, and full-text indexes.
   - `buyer_enquiries` table with customer details, requested property, budget, status, and internal notes.
   - `seller_enquiries` table with owner details, location, area, expected price, photos array, and consent.
   - **Row Level Security (RLS)** policies enabled:
     - Public can only view non-archived properties.
     - Public can submit enquiries/listings.
     - Only authenticated administrators have full CRUD access.
2. **`supabase/storage-rules.sql`**:
   - Creates the `property-images` public storage bucket.
   - Allows public reads and restricts image upload/delete permissions strictly to authenticated admins.

### Setup Instructions for Supabase:
1. Open your [Supabase Dashboard](https://supabase.com).
2. Create a new project.
3. Go to the **SQL Editor** tab.
4. Copy and paste the contents of `supabase/schema.sql` and run it.
5. Copy and paste the contents of `supabase/storage-rules.sql` and run it.
6. In `Project Settings > API`, copy your Project URL and Anon Key into your `.env` or in `js/config.js`.

> **Note:** The application includes a self-contained client persistence engine that works seamlessly out-of-the-box in any browser even before Supabase is connected, persisting all admin edits, new listings, and form submissions in localStorage!

---

## 5. Local Development & Testing

To test the application locally without requiring Node or external dependencies, run a lightweight HTTP server using PowerShell:

```powershell
# Open PowerShell in the project directory
cd "C:\Users\hp\.gemini\antigravity-ide\scratch\chhote-lal-property-dealer"

# Run the included lightweight server:
powershell -ExecutionPolicy Bypass -File server.ps1
```
Then visit: `http://localhost:8080` in your web browser.

### Admin Login Credentials (for verification):
- **URL:** `http://localhost:8080/admin/login.html`
- **Username / Email:** `admin` (or `9664280667` / `admin@chhote-lal.local`)
- **Password:** `ChhoteLal@9664` (or `Varanasi@2026`)

---

## 6. Vercel Deployment Instructions

1. Push the code repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Chhote Lal Property Dealer website"
   git branch -M main
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and log in.
3. Click **Add New Project** and select your GitHub repository.
4. Set Framework Preset to **Other** (Static HTML).
5. Add the Environment Variables from `.env.example` if connecting live Supabase.
6. Click **Deploy**. Vercel will deploy the site with HTTPS, custom headers, and clean URLs automatically configured via `vercel.json`.

---

## 7. SEO & Legal Compliance

- Strict adherence to business data: No fake addresses, email, RERA badges, or fabricated reviews.
- Structured Data (JSON-LD) for `RealEstateAgent` included on `index.html`.
- Meta robots configured with `noindex, nofollow` on all admin pages to protect customer enquiries.
- Pre-filled WhatsApp URLs encoded using `encodeURIComponent` to prevent broken characters.
- Property details verification disclaimer present across all public pages.
