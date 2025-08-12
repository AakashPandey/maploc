# MapLoc

A location-based web app built with **Next.js**, **Tailwind CSS**, and **PostgreSQL** that lets users log in, add locations and view them on an interactive map.

**Live Demo:** [maploc.vercel.app](https://maploc.vercel.app/)

---

## 🚀 Tech Stack

* **Frontend & Backend:** [Next.js](https://nextjs.org/) + [Tailwind CSS](https://tailwindcss.com/)
* **Database:** PostgreSQL ([Neon](https://neon.tech/)) + [Drizzle ORM](https://orm.drizzle.team/)
* **Map:** [react-leaflet](https://react-leaflet.js.org/)

---

## ✨ Features

* 🔑 **User Authentication** — Google Sign-In with NextAuth.js
* 🗺 **Interactive Map View** — Browse and explore saved locations
* ➕ **Add Locations Manually** — Enter address details manually
* 📍 **Add Bulk Locations w/ .ZIP** — Add locations info using a .ZIP file
* 📂 **Sidebar Navigation** — Easy access to app features

---

## 🛠 Setup & Installation

### 1. Clone the Repository

```bash
git clone <repo-url>
cd maploc
```

### 2. Populate `.env.local`
Refer to .env.example

You will need:

| Key                    | Description                                  |
| ---------------------- | -------------------------------------------- |
| `DATABASE_URL`         | Postgres connection string (Neon)            |
| `AUTH_SECRET`          | Generate via `npx auth secret`               |
| `NEXTAUTH_URL`         | Your site URL (e.g. `http://localhost:3000`) |
| `GOOGLE_CLIENT_ID`     | From Google Cloud Console                    |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console                    |

#### Google OAuth Setup:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new OAuth 2.0 Client ID
3. Select **Application Type** → **Web Application**
4. Add Authorized **Origins** and **Redirect URIs** (e.g., `https://localhost:3000/api/auth/callback/google`)

---

### 3. Initialize the Database

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

---

### 4. Run Locally

```bash
npx next dev --experimental-https
```

---

## 📌 Notes

* Make sure **Neon PostgreSQL** is set up and accessible.
* Use `--experimental-https` if you want local HTTPS for Google OAuth testing.

---
