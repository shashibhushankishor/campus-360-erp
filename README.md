# 🎓 Campus 360° – Smart Campus ERP & Operational Governance Portal

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)

A modern, high-concurrency, paperless **Campus Operations & Governance ERP System**. Built to solve legacy college ERP bottlenecks like high latency, server crashes during peak loads, physical paper-slip sign-offs, and un-tracked student complaints.

---

## ✨ Key Features

### 🔒 1. Two-Step Mandatory Authentication
* **Primary Auth:** Login using **Google Account** or **Phone Number + OTP**.
* **Student Credential Lock:** Access to the application and navigation drawer is strictly **locked** until mandatory student verification (**Registration Number, Full Name, and Roll Number**) is completed.

### 🏢 2. Five Core Governance Modules
1. **🟢 Campus Infrastructure:** Photo-backed complaint submission with geotagging/location logs and an automated **24-Hour SLA Escalation Countdown Timer**.
2. **🟦 Academic Portal:** Fast reporting for server errors, attendance mismatches, marksheet/result updates, exam schedules, and course desk issues.
3. **🟧 Hostel Maintenance & Repairs:** Comprehensive issue log for Wi-Fi/Internet, Water Coolers, Plumbing/Pipelines, Broken Gates/Doors, Furniture damage, and Cleanliness.
4. **🟪 Mess & Dining Management:** Daily 1-to-5 star food rating system, 30-day menu change voting poll with real-time percentage visualizations, and hygiene feedback logging.
5. **🟥 Security & CCTV Request:** Incident & theft reporting workflow with an integrated admin approval pipeline for viewing and downloading watermarked **CCTV footage clips**.

### ⚡ 3. Administrative & Operational Features
* **📄 Paperless No-Dues Clearance:** Digital clearance pipeline across Library, Accounts, Hostel, Warden, and HOD with single-click verifications.
* **📱 Dynamic QR Out-Pass:** Time-sensitive dynamic QR-code gate pass generation for hostel security checkpoints.
* **🔄 Dual-Role Switcher:** Toggle seamlessly between **Student View** (submission & status tracking) and **Admin View** (staff assignment, SLA status updates, CCTV clip attachments, and polling analytics).

---

## 🛠️ Built With

* **Frontend:** HTML5, CSS3, Tailwind CSS (via CDN), FontAwesome Icons
* **UI Interactions & State Management:** Vanilla JavaScript (ES6+)
* **Charting & Visualizations:** Chart.js
* **Storage & Persistence:** HTML5 LocalStorage API

---

## 🚀 Quick Start Guide

### Running Locally in VS Code

1. **Clone the Repository:**
   ```bash
   git clone [https://github.com/YOUR_USERNAME/Campus-360-ERP.git](https://github.com/YOUR_USERNAME/Campus-360-ERP.git)
   cd Campus-360-ERP
