# 📦 Dhaman Pro (ضمان برو)

**The Ultimate Logistics & Driver Management Suite**

Dhaman Pro is a high-performance, real-time distribution management system built for supervisors and drivers. It streamlines the lifecycle of an order from creation to delivery with a heavy focus on speed, reliability, and local market (Algerian) optimization.

---

## 📸 Screenshots




---

## 🚀 Key Features

### 🛡️ For Supervisors
* **Real-time Analytics:** Track confirmation and cancellation rates with dynamic progress bars.
* **Inventory Management:** Full CRUD operations for products with SKU tracking, pricing, and stock quantity.
* **Team Oversight:** Manage your team of drivers and monitor their active status.
* **Broadcast System:** Instantly dispatch orders to drivers based on their specific **Wilaya** (City) using Socket.io rooms.

### 🚚 For Drivers
* **Smart Dispatch:** Receive instant "New Order" popups with a 15-second acceptance timer.
* **Status Management:** Update order progress from "Pending" to "Delivered" or "Cancelled."
* **Local Optimization:** UI and logic tailored for the Algerian logistics flow (RTL support, local currency).

---

## 🛠️ Technical Stack

### **Frontend (Mobile)**
* **Framework:** React Native (Expo Managed Workflow)
* **State Management:** Redux Toolkit (Async Thunks)
* **Styling:** NativeWind (Tailwind CSS for React Native)
* **Real-time:** Socket.io-client (Event-driven architecture)
* **Navigation:** Expo Router / React Navigation

### **Backend (Server)**
* **Environment:** Node.js & Express
* **Database:** MongoDB with Mongoose (Strict Schema Validation)
* **Real-time:** Socket.io (Room-based broadcasting by Wilaya)
* **Authentication:** JWT-based secure manual implementation

---
