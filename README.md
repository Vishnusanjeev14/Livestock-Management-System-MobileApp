# Livestock-Management-System-MobileApp


A comprehensive mobile application built with React Native and Expo to help farmers and ranchers efficiently manage their livestock and farm operations.


##  Features

This app provides a suite of tools to manage various aspects of livestock farming:

* **👤 Authentication:** Secure user sign-up and sign-in.
* **🐄 Animal Management:** Keep detailed records for each animal, including name, species, breed, date of birth, gender, and health status.
* **🧬 Breeding Records:** Track mating pairs, breeding dates, and outcomes.
* **🌾 Feeding Schedules:** Log feed types, quantities, and dates for each animal.
* **🩺 Health Records:** Monitor checkups, diagnoses, treatments, and veterinarian details.
* **🥛 Production Tracking:** Record production data like milk yield, egg counts, etc.
* **💰 Sales Management:** Log sales of both animals and farm products (milk, eggs, etc.).
* **📦 Inventory Control:** Manage stock levels for feed, medicine, and equipment, including low stock alerts.
* **📊 Financial Overview:** Track expenses and income, view financial summaries.
* **👥 Staff Management:** Manage employee details, assign tasks, and track attendance.
* **☀️ Environment Monitoring:** Record weather conditions, temperature, humidity, etc. (Includes a mock weather forecast feature).
* **📅 Scheduler:** Set reminders for important tasks like vaccinations or health checks.

## Tech Stack

* **Frontend:** React Native with Expo
* **Backend:** Node.js, Express.js
* **Database:** MongoDB (using Mongoose)
* **Authentication:** JWT (JSON Web Tokens)

## Getting Started

### Prerequisites

* Node.js (LTS version recommended)
* npm or yarn
* MongoDB Atlas account (or local MongoDB instance)
* Expo Go app on your mobile device (or an emulator/simulator)
* Your computer's local IP address

### Backend Setup (`LSM/server`)

1.  **Navigate to the server directory:**
    ```bash
    cd LSM/server
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Set up environment variables:**
    * Rename `.env.example` to `.env`.
    * Update `MONGODB_URI` with your MongoDB connection string.
    * Optionally, change `JWT_SECRET` and `PORT`.
4.  **Start the server:**
    ```bash
    npm start
    # or for development with nodemon
    npm run dev
    ```
    The server should start, typically on port 5001.

### Frontend Setup (`livestock-management-mobile`)

1.  **Navigate to the mobile app directory:**
    ```bash
    cd ../livestock-management-mobile
    # (Assuming you are still in the LSM/server directory)
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Configure the API endpoint:**
    * Open `services/api.js`.
    * **IMPORTANT:** Change the `API_BASE_URL` constant to use your computer's local IP address where the backend server is running (e.g., `http://192.168.1.10:5001/api`). **Do not use `localhost` or `127.0.0.1` if you plan to run on a physical device.**
4.  **Start the Expo development server:**
    ```bash
    npx expo start
    ```
5.  **Run the app:**
    * Scan the QR code with the Expo Go app on your phone.
    * Or, press `a` for Android Emulator or `i` for iOS Simulator if you have them set up.

## Screens Overview

The app is organized into several screens accessible from the Dashboard:

* **Dashboard:** Main entry point, quick actions.
* **Animals:** List, add, edit, delete livestock.
* **Breeding:** Manage breeding records.
* **Feeding:** Log feeding activities.
* **Health:** Track health checkups and treatments.
* **Production:** Record milk, eggs, wool, etc.
* **Veterinary:** Manage vet appointments and records.
* **Sales:** Track animal and product sales.
* **Inventory:** Manage farm supplies.
* **Finance:** Record income and expenses, view reports.
* **Staff:** Manage employees and assign tasks.
* **Environment:** Log weather data, view forecast (mock).
* **Scheduler:** Manage reminders.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project is licensed under the 0BSD License. See the `livestock-management-mobile/package.json` file for details.
