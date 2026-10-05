<h1 align="center">🚀 User Master Project</h1>

<p align="center">
  <b>A full-stack enterprise application for centralized user management.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" />
  <img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white" />
  <img src="https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" />
  <img src="https://img.shields.io/badge/AWS_EC2-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white" />
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" />
</p>

<p align="center">
  A full-stack User Master project built using <b>React, Spring Boot Microservices, MySQL, Redis, Docker, AWS EC2, and Vercel</b>.
</p>

<p align="center">
  The system provides centralized user management with authentication, master data management, search and filtering, Excel import/export, notifications, audit history, caching, and role-based access control.
</p>

---

## 📑 Table of Contents

<details open>
<summary><b>Click to expand/collapse</b></summary>

1. [Project Overview](#1-project-overview)
2. [Key Features](#2-key-features)
3. [Technology Stack](#3-technology-stack)
4. [System Architecture](#4-system-architecture)
5. [Complete Application Flow](#5-complete-application-flow)
6. [Authentication Flow](#6-authentication-flow)
7. [Microservices](#7-microservices)
8. [User Master Flow](#8-user-master-flow)
9. [Search & Filtering](#9-search--filtering)
10. [Master Data Flow](#10-master-data-flow)
11. [Excel Import Flow](#11-excel-import-flow)
12. [Excel Export Flow](#12-excel-export-flow)
13. [User History / Audit Flow](#13-user-history--audit-flow)
14. [Notification Flow](#14-notification-flow)
15. [Redis & Caching](#15-redis--caching)
16. [Frontend Architecture](#16-frontend-architecture)
17. [Backend Architecture](#17-backend-architecture)
18. [Database](#18-database)
19. [Docker Architecture](#19-docker-architecture)
20. [Project Structure](#20-project-structure)
21. [Local Development](#21-local-development)
22. [Environment Configuration](#22-environment-configuration)
23. [AWS Deployment](#23-aws-deployment)
24. [Vercel Deployment](#24-vercel-deployment)
25. [API Routing](#25-api-routing)
26. [API Documentation - Swagger / OpenAPI](#26-api-documentation---swagger--openapi)
27. [Deployment Verification](#27-deployment-verification)
28. [Production Status](#28-production-status)
29. [Security Notes](#29-security-notes)
30. [Repository](#30-repository)
31. [Conclusion](#31-conclusion)

</details>

---

## 1. Project Overview

The **User Master** project is a microservices-based enterprise application designed to manage users and related master data.

The application consists of:

- ⚛️ React frontend
- ☕ Spring Boot microservices
- 🚪 API Gateway
- 🔍 Service discovery using Eureka
- ⚙️ Centralized configuration using Config Server
- 🗄️ MySQL database
- ⚡ Redis caching
- 🐳 Docker containerization
- ☁️ AWS EC2 backend deployment
- ▲ Vercel frontend deployment

> The frontend communicates with the backend through the **API Gateway** rather than directly accessing individual microservices.

---

## 2. Key Features

<details>
<summary><b>👤 User Management</b></summary>

- Create users
- Update users
- View user details
- Search users
- Filter users
- Pagination and sorting
- Active/inactive user management
- User status management
- User check update history

</details>

<details>
<summary><b>🔐 Authentication & Security</b></summary>

- Login authentication
- JWT-based authentication
- Role-based authorization
- Protected backend APIs
- Gateway-level request routing and authentication support

</details>

<details>
<summary><b>📚 Master Data</b></summary>

The system supports master data such as:

- Department
- Designation
- Branch
- Employee
- Module
- Role

</details>

<details>
<summary><b>📊 Excel Management</b></summary>

- Download user import template
- Upload user Excel file
- Validate uploaded records
- Detect duplicate records
- Separate valid, invalid, and duplicate records
- Import valid users
- Export user data
- Export completion notification

</details>

<details>
<summary><b>📜 User History</b></summary>

User activities are maintained through audit history, including:

- `ADD`
- `UPDATE`
- `STATUS_CHANGE`

History records contain information about the action, user, new data, performer, and timestamp.

</details>

<details>
<summary><b>🔔 Notifications</b></summary>

The application provides notifications for system events such as user data export completion.

</details>

<details>
<summary><b>⚡ Redis Caching</b></summary>

Redis is used for caching frequently accessed user-related information and statistics.

</details>

---

## 3. Technology Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React, TypeScript, Vite, Material UI (MUI), Redux Toolkit, React Hook Form, Yup, React Material Table, amCharts, reactCharts |
| **Backend** | Java, Spring Boot, Spring Security, Spring Cloud, Spring Data JPA, Spring Cloud Gateway, Spring Cloud Netflix Eureka, OpenFeign, Gradle |
| **Database & Caching** | MySQL 8, Redis 7 |
| **DevOps & Deployment** | Docker, Docker Compose, AWS EC2, Vercel, GitHub |

---

## 4. System Architecture

                    ┌──────────────────────┐
                    │   React Frontend     │
                    │      Vercel          │
                    └──────────┬───────────┘
                               │
                               │ HTTPS / API
                               ▼
                    ┌──────────────────────┐
                    │    API Gateway       │
                    │       :8084          │
                    └──────────┬───────────┘
                               │
             ┌─────────────────┼─────────────────┐
             │                 │                 │
             ▼                 ▼                 ▼
     ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
     │ Auth Service │  │ User Master  │  │Master Service│
     │    :8081     │  │    :8080     │  │    :8087     │
     └──────┬───────┘  └──────┬───────┘  └──────────────┘
            │                 │
            ▼                 ▼
         MySQL            MySQL + Redis

             ┌─────────────────────────────┐
             │       Eureka Server         │
             │            :8761            │
             └─────────────────────────────┘

             ┌─────────────────────────────┐
             │       Config Server         │
             │            :8888            │
             └─────────────────────────────┘

---

## 5. Complete Application Flow

### Frontend to Backend Flow

User
  │
  ▼
React Frontend
  │
  ▼
Vercel
  │
  ▼
API Gateway :8084
  │
  ├── /auth/** ──────────────► Auth Service :8081
  │
  ├── /user/** ──────────────► User Master :8080
  │
  ├── /notification/** ─────► User Master :8080
  │
  ├── /uploads/** ───────────► User Master :8080
  │
  └── Master APIs ───────────► Master Service :8087

- The frontend uses the **API Gateway** as the backend entry point.
- Individual backend services are discovered through **Eureka**.

---

## 6. Authentication Flow

User
  │
  ▼
Login Page
  │
  ▼
API Gateway
  │
  ▼
Auth Service
  │
  ▼
Authentication
  │
  ▼
JWT Token
  │
  ▼
Frontend
  │
  ▼
JWT attached to protected API requests

The frontend stores the authenticated session information and sends the **JWT** with subsequent protected API requests.

---

## 7. Microservices

<details>
<summary><b>🚪 API Gateway — Port: 8084</b></summary>

**Responsibilities:**
- Single entry point for frontend API requests
- Route requests to backend services
- Service discovery integration
- JWT/security handling
- CORS configuration
- Upload routing

</details>

<details>
<summary><b>🔐 Auth Service — Port: 8081</b></summary>

**Responsibilities:**
- User authentication
- Login processing
- JWT generation
- Authentication-related operations

</details>

<details>
<summary><b>👤 User Master — Port: 8080</b></summary>

**Responsibilities:**
- User management
- User search and filtering
- User status management
- User history
- Excel import/export
- Notifications
- Redis caching
- User file uploads

</details>

<details>
<summary><b>📚 Master Service — Port: 8087</b></summary>

**Responsibilities:**
- Department master
- Designation master
- Branch master
- Employee master
- Module master
- Role master

</details>

<details>
<summary><b>🧩 Common Service</b></summary>

The Common Service provides reusable application functionality shared by backend components.

**Contains:**
- Excel processing
- Email functionality
- Notifications
- Shared reusable services

> The Common Service does **not** own the User Master database.

</details>

<details>
<summary><b>⚙️ Config Server — Port: 8888</b></summary>

Provides centralized configuration for microservices.

</details>

<details>
<summary><b>🔍 Eureka Server — Port: 8761</b></summary>

Provides service discovery and registration for the microservices.

</details>

---

## 8. User Master Flow

The User Master module provides complete user lifecycle management.

User Activity Board
      │
      ▼
Search / Filters
      │
      ▼
API Gateway
      │
      ▼
User Master
      │
      ├── MySQL
      │
      └── Redis

**Supported operations include:**
- Add user
- Update user
- View user
- Search user
- Filter user
- Sort user
- Paginate user list
- Change user status
- Soft delete user
- Show user history

---

## 9. Search & Filtering

The User Master dashboard supports:

- 🔍 Global search
- 👤 Employee name search
- 🏢 Department filter
- 💼 Designation filter
- 🏬 Branch filter
- 🎭 Role filter
- ✅ Active/inactive status filter
- 📅 Created date range
- 📄 Pagination
- ↕️ Sorting

> The frontend sends filter parameters through the **API Gateway** to the **User Master** service.

---

## 10. Master Data Flow

Master data is maintained separately by the Master Service.

Frontend
   │
   ▼
API Gateway
   │
   ▼
Master Service
   │
   ▼
MySQL

Master data is consumed by **User Master** through service-to-service communication.

---

## 11. Excel Import Flow

Download Template
       │
       ▼
Fill User Data
       │
       ▼
Upload Excel
       │
       ▼
Excel Validation
       │
       ├── VALID
       ├── INVALID
       └── DUPLICATE
       │
       ▼
Import Valid Records
       │
       ▼
User Master Database

The Excel process validates **mandatory fields** and checks **duplicate user information** before importing records.

---

## 12. Excel Export Flow

User selects date range
        │
        ▼
Export request
        │
        ▼
User Master
        │
        ▼
Excel generation
        │
        ▼
Email / Notification
        │
        ▼
Export completed notification

Export functionality supports user data extraction for the selected **date range**.

---

## 13. User History / Audit Flow

User changes are recorded in the user history table.

**Supported actions:**
- `ADD`
- `UPDATE`
- `STATUS_CHANGE`

**History records include:**

| Field | Description |
|-------|-------------|
| User ID | Unique user identifier |
| Employee Code | Employee reference code |
| Action | ADD / UPDATE / STATUS_CHANGE |
| Performed By | User who made the change |
| Performed At | Timestamp of change |
| Old Data | Previous state |
| New Data | Updated state |

> The history logic is handled within the **User Master** service and is persisted **transactionally** with user operations.

---

## 14. Notification Flow

Notifications are generated for supported system events.

**Example:**

User Data Export
       │
       ▼
Excel Generation
       │
       ▼
Email Processing
       │
       ▼
Notification Created
       │
       ▼
Frontend Notification Panel

**Notifications contain:**

- Title
- Message
- Type
- Read/Unread status
- Created timestamp
- Reference information where applicable

---

## 15. Redis & Caching

Redis is used to improve performance by caching frequently accessed data.

**Examples include:**
- User details
- User status statistics
- Department statistics

> Cache entries are **invalidated** when relevant user data changes to prevent stale information.

---

## 16. Frontend Architecture

The frontend is built using **React** and **TypeScript**.

user-master-frontend/
│
├── public/
│
├── src/
│   ├── apps/
│   │   ├── auth/
│   │   └── components/
│   │       └── charts/
│   │           ├── amChart/
│   │           └── reactChart/
│   │
│   ├── layout/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   │
│   ├── store/
│   │   ├── slices/
│   │   ├── user/
│   │   └── store.ts
│   │
│   ├── validations/
│   ├── route/
│   ├── assets/
│   │
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vercel.json
└── vite.config.ts

- **Redux Toolkit** is used for application state management.
- **React Hook Form** and **Yup** are used for user form handling and validation.
- **Material UI** provides the application interface and responsive layout.

---

## 17. Backend Architecture

The backend follows a **layered Spring Boot architecture**.

Controller
    │
    ▼
Service
    │
    ▼
Repository
    │
    ▼
MySQL

**Additional components include:**
- DTOs
- Feign clients
- Security
- Exception handling
- Redis caching
- Service discovery
- Centralized configuration

---

## 18. Database

The application uses **MySQL** as its primary relational database.

**Major User Master data includes:**
- `user_master`
- `user_history`
- `notification`
- `export_file`

**Master data includes tables for:**
- Department
- Designation
- Branch
- Employee
- Module
- Role

> The database is persisted using **Docker volumes** in the deployed environment.

---

## 19. Docker Architecture

The backend environment is containerized using **Docker Compose**.

**Main containers:**

| Service | Port |
|---------|-----:|
| API Gateway | 8084 |
| Auth Service | 8081 |
| User Master | 8080 |
| Master Service | 8087 |
| Config Server | 8888 |
| Eureka Server | 8761 |
| MySQL | 3307 → 3306 |
| Redis | 6379 |

- Docker Compose manages service startup and networking.
- Persistent Docker volumes are used for database, Redis, and user-upload data.

---

## 20. Project Structure

office/
│
├── api-gateway
├── auth-service
├── common-service
├── config-server
├── eureka-server
├── master-service
├── user-master
├── user-master-frontend
└── docker-compose.yml

---

## 21. Local Development

<details>
<summary><b>☕ Backend</b></summary>

Each Spring Boot service can be built using **Gradle**:

./gradlew clean bootJar

Docker Compose can then be used to run the backend infrastructure and services.

</details>

<details>
<summary><b>⚛️ Frontend</b></summary>

The frontend is developed using **Vite**:

npm install
npm run dev

The frontend communicates with the backend through the configured **API base URL**.

</details>

---

## 22. Environment Configuration

Configuration is externalized using **environment variables** and **centralized configuration**.

**Important configuration areas include:**
- Database connection
- Redis connection
- JWT secret
- Eureka URL
- Config Server URL
- Frontend API base URL

> ⚠️ **Secrets and passwords must not be committed to GitHub.**

---

## 23. AWS Deployment

The backend is deployed on an **AWS EC2** instance using Docker Compose.

**Deployment flow:**

GitHub
   │
   ▼
AWS EC2
   │
   ▼
Git Pull
   │
   ▼
Gradle Build
   │
   ▼
Docker Image Build
   │
   ▼
Docker Compose
   │
   ▼
Running Microservices

- The **API Gateway** is exposed for frontend communication.
- Internal services communicate through the **Docker network** and **Eureka service discovery**.

---

## 24. Vercel Deployment

The React frontend is deployed on **Vercel**.

Browser
   │
   ▼
Vercel Frontend
   │
   ▼
Vercel API Rewrite
   │
   ▼
AWS EC2 API Gateway :8084
   │
   ▼
Backend Microservices

The frontend uses:

VITE_API_BASE_URL=/api

API requests are routed through the configured **Vercel rewrite** to the **AWS API Gateway**.

---

## 25. API Routing

The API Gateway provides routing for major application areas.

**Examples:**

| Route | Target Service |
|-------|---------------|
| `/auth/**` | Auth Service |
| `/api/auth/**` | Auth Service |
| `/user/**` | User Master |
| `/notification/**` | User Master |
| `/uploads/**` | User Master |
| `/branch/**` | Master Service |
| `/department/**` | Master Service |
| `/designation/**` | Master Service |
| `/employee/**` | Master Service |
| `/module/**` | Master Service |
| `/role/**` | Master Service |

> The exact routing configuration is maintained in the **Gateway configuration**.

---

## 26. API Documentation - Swagger / OpenAPI

The backend APIs are documented using **Swagger/OpenAPI**.

Swagger provides an interactive API documentation interface that allows developers to:

- 📋 View available API endpoints
- 📦 Review request and response models
- 🔧 Check API parameters
- 🌐 Understand HTTP methods and responses
- 🔑 Authorize requests using a JWT token
- 🧪 Test protected and public APIs directly from the Swagger UI

### Swagger UI

Swagger UI provides an interactive interface for exploring and testing the available backend APIs.

The Swagger documentation can be accessed through the deployed application environment using the configured **Swagger/OpenAPI** endpoint.

> The exact Swagger URL depends on the **service and gateway routing configuration**.

### Authentication

Protected APIs require a valid **JWT access token**.

The token can be provided through the Swagger **Authorize** option and is then used when testing secured endpoints.

### API Testing Flow

Swagger UI
    │
    ▼
API Gateway
    │
    ▼
Authentication / JWT Validation
    │
    ▼
Target Microservice
    │
    ▼
Database / Redis / Other Services

> Swagger/OpenAPI is primarily used for **API documentation, development, integration testing, and backend API verification**.

---

## 27. Deployment Verification

The deployed environment was verified for:

- ✅ Frontend availability
- ✅ API Gateway availability
- ✅ CORS configuration
- ✅ Auth Service startup
- ✅ User Master startup
- ✅ Eureka service registration
- ✅ Config Server connectivity
- ✅ MySQL connectivity
- ✅ Redis availability
- ✅ Docker container health
- ✅ GitHub deployment synchronization

> **Auth Service** successfully registered with Eureka and started on port `8081`.
>
> **User Master** successfully connected to MySQL and registered with Eureka.

---

## 28. Production Status

The current application deployment consists of:

Frontend
└── Vercel

Backend
└── AWS EC2
    └── Docker Compose
        ├── API Gateway
        ├── Auth Service
        ├── User Master
        ├── Master Service
        ├── Common Service
        ├── Config Server
        ├── Eureka Server
        ├── MySQL
        └── Redis

> The changed backend services have been **rebuilt and redeployed**, and the final **deployment verification** has been completed.

---

## 29. Security Notes

- 🔒 Do not commit passwords, database credentials, JWT secrets, or mail credentials.
- 🔑 Use environment variables for sensitive configuration.
- 🛡️ Keep internal services protected from direct public access where possible.
- 🌐 Expose only the required public entry points.
- 🎫 JWT authentication is used for protected application APIs.

---

## 30. Repository

The complete project is maintained in **GitHub** as a single repository containing the frontend and backend services.

---

## 31. Conclusion

The **User Master System** provides a complete enterprise-style user management solution with:

- ⚛️ Modern React frontend
- ☕ Spring Boot microservices backend
- 🔍 Centralized service discovery and configuration
- 🗄️ MySQL persistence
- ⚡ Redis caching
- 📊 Excel processing
- 🔔 Notifications
- 📜 Audit history
- 🐳 Docker-based deployment
- ☁️ AWS infrastructure
- ▲ Vercel frontend hosting

---

<p align="center">
  <b>⭐ If you like this project, give it a star on GitHub! ⭐</b>
</p>