# 🏥 Hospital CRM System - Frontend

> **Status:** Active Development  
> **Version:** 1.0.0

A production-ready, highly modular Customer Relationship Management (CRM) system designed specifically for modern hospital operations. This application acts as the central nervous system for patient management, diagnostic workflows, financial tracking, and administrative control.

Built with **React 18** and **Vite**, it features a secure, role-based architecture that serves multiple hospital departments simultaneously.

---

## 🚀 Live Demo & Credentials

Experience the application live: [**Live Demo Link**](https://hoshpital-crm.web.app/)

Use the following credentials to explore different user roles:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Lab Expert** | `lab@gmail.com` | `111111` |
| **Sample Collection** | `sample_collection@gmail.com` | `111111` |
| **Front Desk** | `front@gmail.com` | `111111` |

---

## 🌟 Key Features

### � Comprehensive Patient Management
- **Smart Registration**: Rapidly register patients with auto-suggestions for recurring visitors.
- **Detailed History**: integrated timeline view (`PublicPatientHistory`) showing every visit, test, and payment transaction.
- **Reference Tracking**: Track referring doctors to manage commissions and networking.

### 🧪 Advanced Diagnostic Workflow
- **Multi-Department Support**: Specialized flows for Pathology, Ultrasound, X-Ray, and more.
- **Kanban-Style Lab Board**: Real-time status tracking for every test:
  1.  **Assigned**: Test booked at reception.
  2.  **Collecting Sample**: Phlebotomist/Nurse collecting sample.
  3.  **Running**: Lab expert processing the sample.
  4.  **Completed**: Report ready for delivery.
- **Status Badges**: Visual indicators (Paid/Due, Pending/Done) for quick assessment.

### 💰 Financial & Billing Engine
- **Automated Invoicing**: Instant calculation of test prices, discounts, and due amounts.
- **Revenue Tracking**: Admin dashboards visualizing:
  - Total Revenue vs. Cash Received vs. Due.
  - Daily/Weekly/Monthly financial trends using **Recharts**.
- **Printable Invoices**: Professional invoice generation using `html2pdf.js` and `react-to-print`.

### �️ Security & Architecture
- **Role-Based Access Control (RBAC)**: secure routes (`AdminRoute`, `RoleRoute`) ensure users only see what they are permitted to.
- **Hybrid Backend Connectivity**: A smart `Axios` interceptor setup that automatically switches between `localhost` and the deployed server if the local backend is unreachable.
- **JWT Authentication**: Secure API communication with automatic token injection and 401/403 logout handling.
- **Infinite Scrolling**: Optimized performance for large datasets (e.g., Patient Lists) using `IntersectionObserver`.

---

## 🏗️ Technical Architecture

### Core Stack
- **Frontend Framework**: [React 18](https://react.dev/)
- **Build Tool**: [Vite](https://vitejs.dev/) (Fast HMR & Optimized Builds)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + [daisyUI](https://daisyui.com/) (Component Library)
- **Language**: JavaScript (ES6+)

### State & Data Management
- **TanStack Query (React Query)**: Handles server state, caching, distinct query keys (`dashboard-stats`, `patients`), and background updates.
- **Context API**: Manages global Authentication state (`AuthProvider`).
- **Custom Hooks**: Encapsulated logic for reusability:
  - `useAuth`: Auth context accessor.
  - `useAxiosSecure`: Authenticated HTTP client with failover logic.
  - `useLabBoard`: Manages complex Lab Board state and polling.

### Libraries & Tools
- **Routing**: `react-router-dom` v6.
- **Visualization**: `recharts` for analytics charts.
- **Forms**: `react-hook-form` for complex management forms.
- **UI Feedback**: `sweetalert2` for modals and `react-toastify` for non-intrusive notifications.
- **Utilities**: `lodash` for data manipulation, `html2pdf.js`/`jspdf` for document generation.

---

## 👥 User Roles & Permissions

| Role | Access Level | Responsibilities |
| :--- | :--- | :--- |
| **Admin** | **Full Access** | System configuration, User management, Financial oversight, Deleting records, Viewing all reports. |
| **Front Desk** | **Restricted** | Patient registration, Invoice generation, Assigning tests, Viewing patient history. |
| **Lab Expert** | **Operational** | Viewing Lab Board, Updating test status (Running -> Completed), Uploading results. |
| **Sample Collection** | **Operational** | Viewing Lab Board, Updating status (Assigned -> Sample Collected). |

---

## 📂 Project Structure

A clean, feature-focused directory structure for maintainability:

```bash
src/
├── Components/         # Shared UI components (Loaders, Modals)
├── Hook/               # Custom Business Logic Hooks
│   ├── useAxiosSecure.jsx  # Smart HTTP Client
│   └── ...
├── Pages/
│   ├── Dashboard/      # Main Application Area
│   │   ├── Components/     # Dashboard-specific widgets (Sidebar, Stats)
│   │   ├── Privateuser/    # Role-protected features
│   │   │   ├── AssignTest/     # Billing Logic
│   │   │   ├── LabBoard/       # Diagnostic Workflow
│   │   │   ├── Patients/       # Patient Records
│   │   │   └── Settings/       # Admin Config
│   └── Login/          # Public Auth Pages
├── Providers/          # Context Providers
├── Routes/             # Route Definitions & Guards
│   ├── RoleRoute.jsx       # RBAC Logic
│   └── PrivateRoute.jsx    # Auth Guard
└── ...
```

---

## 🔗 Related Repositories

- **Backend / Server**: [Hospitam_CRM_server](https://github.com/3kramz/Hospitam_CRM_server.git) - The Node.js/Express server powering this application.

---

## ⚡ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/3kramz/Hospital_CRM_client.git
cd Hospital_CRM_client
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Firebase Configuration
This project uses **Firebase Authentication**. You need to set up a project in the [Firebase Console](https://console.firebase.google.com/).

1. Create a project.
2. Enable **Authentication** (Email/Password).
3. Create a Web App to get your config keys.
4. Create a `.env.local` file in the root:

```env
VITE_APIKEY=your_api_key
VITE_AUTHDOMAIN=your_auth_domain
VITE_PROJECTID=your_project_id
VITE_STORAGEBUCKET=your_storage_bucket
VITE_MESSAGINGSENDERID=your_sender_id
VITE_APPID=your_app_id
VITE_MEASUREMENTID=your_measurement_id
```

### 4. Run Development Server
```bash
npm run dev
```

### 5. Build for Production
```bash
npm run build
```
The output will be in the `dist` folder, ready for deployment.

---

## � Deployment

The project is optimized for **Firebase Hosting**.

```bash
# Install Firebase Tools
npm install -g firebase-tools

# Login
firebase login

# Initialize (if first time)
firebase init hosting

# Deploy
npm run build
firebase deploy
```

---

## 🤝 Contribution

We welcome contributions from everyone! **Anyone is free to work on this repository**, fix bugs, improve features, or refactor code.

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📄 License

This project is licensed under a **Non-Commercial Open Source License** - see the [LICENSE](LICENSE.md) file for details. 

**Summary:**
- ✅ You can use it for personal/educational purposes.
- ✅ You can fork, modify, and contribute to the code.
- ❌ You cannot use it for commercial purposes (profit/business) without permission.
