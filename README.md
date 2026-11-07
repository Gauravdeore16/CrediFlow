# 🚀 CrediFlow – Loan Processing & EMI Management System

CrediFlow is an enterprise-grade full-stack loan management platform built with **Spring Boot 3**, **Spring Security (JWT)**, **Spring Data JPA**, **H2/MySQL**, and **React.js** (Vite + TailwindCSS + Recharts). It automates the entire loan lifecycle: application, document verification, income-based eligibility validation, loan officer approvals, disbursement, dynamic EMI schedule generation, and mock payment gateway integration.

---

## 🎯 System Architecture

```
                    +---------------------------------------+
                    |        React.js Frontend (Vite)       |
                    |   Customer / Officer / Admin Consoles |
                    +---------------------------------------+
                                        |
                                   REST / Axios
                                        |
                    +---------------------------------------+
                    |    Spring Boot 3.5 Backend (Java 25)   |
                    |     Spring Security + JWT + JPA       |
                    +---------------------------------------+
                                   /    |    \
                          Controllers Services Security
                                        |
                                   Repositories
                                        |
                                 H2 / MySQL Database
```

---

## 👥 Pre-Configured Test User Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@crediflow.com` | `Admin@123` | System management, reports, officer creation, and loan approvals |
| **Loan Officer** | `officer@crediflow.com` | `Officer@123` | Review applications, verify documents, approve/reject loans, and disburse approved loans |
| **Customer** | `gaurav@example.com` | `Customer@123` | ₹45,000 monthly income, active disbursed loan |

---

## 🧮 Business Rules & Key Logic

### 1. EMI Calculation Formula
$$EMI = P \times R \times \frac{(1 + R)^N}{(1 + R)^N - 1}$$
- $P$ = Principal Approved Amount
- $R$ = Monthly Interest Rate ($\text{Annual Rate} / 12 / 100$)
- $N$ = Number of Months

### 2. Income Eligibility Engine
- Monthly Income $\ge ₹25,000$
- Maximum Capacity: $\min(\text{Product Max Limit}, 20 \times \text{Monthly Income})$

### 3. Loan Lifecycle Matrix
`SUBMITTED` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `DOCUMENT_VERIFICATION` $\rightarrow$ `APPROVED` $\rightarrow$ `DISBURSED` (Active EMIs) $\rightarrow$ `CLOSED`.

---

## 🛠️ How to Run the Application

### 1. Start the Backend (Spring Boot)
Ensure Java 25 (the current LTS release) and Maven are installed. Generate a private JWT signing secret once, save it securely, and set the same value in each backend terminal. Never commit the secret:

```powershell
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$env:CREDIFLOW_JWT_SECRET = [Convert]::ToBase64String($bytes)
$rng.Dispose()
```

Then open a terminal in `backend/`:
```bash
cd backend
mvn spring-boot:run
```
- Backend runs at: `http://localhost:8080`
- H2 Console available at: `http://localhost:8080/h2-console` (JDBC URL: `jdbc:h2:file:./data/crediflowdb`)

### 2. Start the Frontend (React.js)
Open a terminal in `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
- Frontend runs at: `http://localhost:3000`

---

## 📁 Project Structure

```
CrediFlow/
├── backend/
│   ├── src/main/java/com/loansphere/
│   │   ├── config/ (DataInitializer.java)
│   │   ├── controller/ (Auth, Customer, Loan, Officer, Admin Controllers)
│   │   ├── dto/ (Request & Response DTOs)
│   │   ├── entity/ (User, Customer, LoanOfficer, Loan, Emi, Payment, Transaction)
│   │   ├── exception/ (GlobalExceptionHandler, LoanException)
│   │   ├── repository/ (JPA Repositories)
│   │   ├── security/ (JwtUtil, JwtFilter, SecurityConfig)
│   │   └── service/ (EmiCalculationService, EligibilityService, LoanService)
│   ├── src/test/java/com/loansphere/service/ (Unit tests)
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/ (Navbar, Badge, StatCard, Modal)
│   │   ├── context/ (AuthContext.jsx)
│   │   ├── pages/ (Customer, Officer, Admin, Public Pages)
│   │   ├── services/ (api.js, authService)
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── database/
    └── schema.sql
```
