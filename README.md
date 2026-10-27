# 📚 Library Book Reservation System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-GitHub%20Pages-success?style=for-the-badge&logo=github&logoColor=white)](https://reena32.github.io/Library_Book_Reservation_System/)
[![Java](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Hibernate](https://img.shields.io/badge/Hibernate-ORM%206.6-59666C?style=for-the-badge&logo=hibernate&logoColor=white)](https://hibernate.org/)
[![Database](https://img.shields.io/badge/Database-H2%20%7C%20MySQL-00758F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Frontend](https://img.shields.io/badge/Frontend-Bootstrap%205.3%20%7C%20ES6+-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Build](https://img.shields.io/badge/Build-Maven%203.x-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

An enterprise-ready, full-stack **Library Book Reservation and Inventory Management System** built with **Spring Boot 3**, **Spring Data JPA**, and **Vanilla JavaScript / Bootstrap 5**. The system streamlines book discovery, inventory tracking, reservation workflows, overdue fine calculations, and multi-role operations for educational institutions and libraries.

---

## 📌 About

- **Description:** A robust full-stack Library Book Reservation and Inventory Management System built with Java 21, Spring Boot 3, Spring Data JPA, Hibernate, and Bootstrap 5. Provides role-based portals for students and administrators, real-time book availability tracking, reservation lifecycle management, and dynamic overdue fine calculations.
- **Live Demo / Website:** [https://reena32.github.io/Library_Book_Reservation_System/](https://reena32.github.io/Library_Book_Reservation_System/)
- **Repository:** [https://github.com/reena32/Library_Book_Reservation_System](https://github.com/reena32/Library_Book_Reservation_System)
- **Topics:** `spring-boot`, `java-21`, `library-management-system`, `spring-data-jpa`, `hibernate-orm`, `bootstrap-5`, `h2-database`, `mysql`, `rest-api`, `full-stack`, `capstone-project`, `book-reservation`

---

## 📑 Table of Contents
- [About](#-about)
- [Architecture Overview](#-architecture-overview)
- [Comprehensive File & Directory Structure](#-comprehensive-file--directory-structure)
- [Key Features & Role Matrix](#-key-features--role-matrix)
- [Database Schema & ER Relationships](#-database-schema--er-relationships)
- [Technology Stack](#-technology-stack)
- [Getting Started & Installation](#-getting-started--installation)
- [Database Configuration](#-database-configuration)
- [Seed Data & Default Credentials](#-seed-data--default-credentials)
- [REST API Reference](#-rest-api-reference)
- [Configuration Properties](#-configuration-properties)
- [Git Repository & Version Control](#-git-repository--version-control)

---

## 🏛️ Architecture Overview

The system follows an industry-standard **N-Tier layered architecture** ensuring strict separation of concerns, maintainability, and clean code principles:

```text
       ┌────────────────────────────────────────────────────────┐
       │             Browser Client / User Interface            │
       │    (Single-Page App: HTML5, CSS3, ES6+, Bootstrap 5)   │
       └───────────────────────────┬────────────────────────────┘
                                   │ HTTP / JSON REST
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │              Presentation Layer (Controllers)          │
       │     AuthController | BookController | ReservationCtrl   │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                Business Logic Layer (Services)         │
       │       UserService | BookService | ReservationService    │
       └───────────────────────────┬────────────────────────────┘
                                   │
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │            Data Access Layer (JPA Repositories)        │
       │       UserRepository | BookRepository | ReservationRepo│
       └───────────────────────────┬────────────────────────────┘
                                   │ Hibernate / JDBC
                                   ▼
       ┌────────────────────────────────────────────────────────┐
       │                  Relational Database                   │
       │       H2 Database (In-Memory)  /  MySQL Database       │
       └────────────────────────────────────────────────────────┘
```

---

## 📂 Comprehensive File & Directory Structure

Here is the complete project directory tree detailing every file, directory, and its functional responsibility:

```text
Library_Book_Reservation_System/
│
├── .mvn/                                      # Maven wrapper binaries and configuration
│   └── wrapper/
│       └── maven-wrapper.properties           # Defines Maven distribution version and download URL
│
├── src/                                       # Application source code
│   ├── main/
│   │   ├── java/
│   │   │   └── com/
│   │   │       └── library/
│   │   │           ├── LibraryReservationApplication.java  # Main entry point (@SpringBootApplication)
│   │   │           │
│   │   │           ├── config/                # Configuration & bootstrap components
│   │   │           │   └── DataInitializer.java   # CommandLineRunner that automatically seeds
│   │   │           │                              # the default Admin and 6 sample books on startup
│   │   │           │
│   │   │           ├── controller/            # REST API Web Layer (Exposes HTTP endpoints)
│   │   │           │   ├── AuthController.java          # Handles Student registration, login & directory
│   │   │           │   ├── BookController.java          # Handles Book CRUD, searching, and filtering
│   │   │           │   └── ReservationController.java   # Handles reservation, return, cancellation & fines
│   │   │           │
│   │   │           ├── model/                 # Domain Entities (JPA / Hibernate Mappings)
│   │   │           │   ├── Book.java                # Entity for books (title, author, copies, ISBN, etc.)
│   │   │           │   ├── Reservation.java         # Entity for reservations (status, dates, fines)
│   │   │           │   └── User.java                # Entity for accounts (students & administrators)
│   │   │           │
│   │   │           ├── repository/            # Data Access Layer (Spring Data JPA)
│   │   │           │   ├── BookRepository.java          # CRUD + custom searches (title, author, category)
│   │   │           │   ├── ReservationRepository.java   # Queries reservations by User and active status
│   │   │           │   └── UserRepository.java          # Queries users by email, studentId, or role
│   │   │           │
│   │   │           └── service/               # Business Logic Services
│   │   │               ├── BookService.java             # Stock validation, book catalog lifecycle
│   │   │               ├── ReservationService.java      # Reservation rules, returns, fine computation
│   │   │               └── UserService.java             # Student registration and credential validation
│   │   │
│   │   └── resources/                         # Static assets & application configuration
│   │       ├── application.properties         # Server port, database connection, JPA settings
│   │       │
│   │       └── static/                        # Frontend Single-Page Application (SPA)
│   │           ├── index.html                 # UI markup: navigation, modals, catalog, dashboard tables
│   │           └── app.js                     # Client logic: authentication state, AJAX/Fetch calls, DOM
│   │
│   └── test/                                  # Unit & Integration tests
│       └── java/
│           └── com/
│               └── library/
│                   └── LibraryReservationApplicationTests.java  # Context-load smoke test
│
├── target/                                    # Compiled bytecodes, classes, and packaged JAR (Git ignored)
├── .gitattributes                             # Git line ending configuration
├── .gitignore                                 # Excludes build targets, temp files, and IDE directories
├── HELP.md                                    # Spring Boot default help documentation
├── mvnw                                       # Unix shell script for Maven Wrapper
├── mvnw.cmd                                   # Windows batch script for Maven Wrapper
├── pom.xml                                    # Project Object Model: dependencies, plugins, Java version
└── README.md                                  # Complete system documentation (this file)
```

---

## 🌟 Key Features & Role Matrix

| Feature | Student | Administrator |
|---|:---:|:---:|
| **Self-Registration & Profile** | ✅ | — (Pre-seeded) |
| **Authentication (Student ID or Email)** | ✅ | ✅ |
| **Browse Books & Real-Time Stock** | ✅ | ✅ |
| **Search / Filter Catalog (Category, Keyword)** | ✅ | ✅ |
| **Reserve Available Book** | ✅ | — |
| **View Personal Reservations & Due Dates** | ✅ | — |
| **Cancel Own Active Reservation** | ✅ | — |
| **Track Accumulated Overdue Fines** | ✅ | ✅ |
| **Add New Book to Inventory** | ❌ | ✅ |
| **Edit Book Details & Stock Levels** | ❌ | ✅ |
| **Delete Book from Inventory** | ❌ | ✅ |
| **Global Reservation Tracker** | ❌ | ✅ |
| **Process Book Return & Restock** | ❌ | ✅ |
| **Configure Daily Overdue Fine Rate** | ❌ | ✅ |
| **View Enrolled Students Directory** | ❌ | ✅ |

---

## 🗄️ Database Schema & ER Relationships

The system uses three primary tables linked via relational foreign key constraints:

```text
   ┌─────────────────────────┐             ┌─────────────────────────┐
   │          USERS          │             │          BOOKS          │
   ├─────────────────────────┤             ├─────────────────────────┤
   │ PK  id           (BIGINT│             │ PK  id           (BIGINT│
   │     student_id   (VARCHAR             │     title        (VARCHAR
   │     name         (VARCHAR             │     author       (VARCHAR
   │     email        (VARCHAR             │     category     (VARCHAR
   │     department   (VARCHAR             │     isbn         (VARCHAR
   │     password     (VARCHAR             │     total_copies (INT)  │
   │     role         (VARCHAR             │     avail_copies (INT)  │
   └────────────┬────────────┘             └────────────┬────────────┘
                │ 1                                     │ 1
                │                                       │
                │ N                                     │ N
          ┌─────┴───────────────────────────────────────┴─────┐
          │                    RESERVATIONS                   │
          ├───────────────────────────────────────────────────┤
          │ PK  id                (BIGINT, AUTO_INCREMENT)    │
          │ FK  user_id           (BIGINT) -> USERS(id)       │
          │ FK  book_id           (BIGINT) -> BOOKS(id)       │
          │     reservation_date  (DATE)                      │
          │     due_date          (DATE)                      │
          │     return_date       (DATE, NULLABLE)            │
          │     status            (VARCHAR)                   │
          │     fine_amount       (DOUBLE)                    │
          └───────────────────────────────────────────────────┘
```

---

## 💻 Technology Stack

### Backend
- **Language:** Java 21 (LTS)
- **Framework:** Spring Boot 3.4.4
  - `spring-boot-starter-web`: RESTful Web APIs with embedded Tomcat
  - `spring-boot-starter-data-jpa`: Object-Relational Mapping (ORM) via Hibernate 6
  - `spring-boot-starter-validation`: Data integrity and request validation
  - `spring-boot-starter-test`: JUnit 5 testing framework
- **Databases Supported:**
  - **H2 Database** (In-Memory embedded mode for zero-setup execution)
  - **MySQL Database** (`mysql-connector-j`) for production persistence

### Frontend
- **Markup & Layout:** HTML5 Semantic Structure
- **Styling:** Bootstrap 5.3.3 + Bootstrap Icons 1.11.3
- **Logic:** Vanilla JavaScript (ES6+), Fetch API, DOM manipulation
- **UI Paradigm:** Responsive Single-Page Application (SPA)

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- **JDK 21 or higher:** Verify with `java -version`
- **Git:** Verify with `git --version`
- *(Optional)* **MySQL 8.x:** Required only if you switch off the default H2 database.

### 2. Clone the Repository
```bash
git clone https://github.com/reena32/Library_Book_Reservation_System.git
cd Library_Book_Reservation_System
```

### 3. Run the Application
The project includes the official Maven Wrapper (`mvnw`), so no manual Maven installation is required:

- **Windows (Command Prompt / PowerShell):**
  ```cmd
  mvnw.cmd spring-boot:run
  ```
- **macOS / Linux:**
  ```bash
  ./mvnw spring-boot:run
  ```

### 4. Access the Interfaces
- **Web Application:** [http://localhost:8085](http://localhost:8085)
- **H2 Database Console:** [http://localhost:8085/h2-console](http://localhost:8085/h2-console)

---

## ⚙️ Database Configuration

Configuration resides in [`src/main/resources/application.properties`](src/main/resources/application.properties).

### Default: Embedded H2 Mode (Zero-Config)
```properties
server.port=8085

# Embedded H2 Configuration
spring.datasource.url=jdbc:h2:mem:library_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
spring.datasource.driver-class-name=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=

# H2 Web Console
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.H2Dialect
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

### Optional: Switching to MySQL
To use MySQL, ensure MySQL server is running on port 3306, then update `application.properties`:
```properties
server.port=8085

# MySQL Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA / Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect
```

---

## 🔑 Seed Data & Default Credentials

On application launch, [`DataInitializer.java`](src/main/java/com/library/config/DataInitializer.java) automatically inspects the database and seeds initial data if absent:

### 1. Default Admin Credentials
- **Student / Admin ID:** `ADMIN01`
- **Email:** `admin@library.com`
- **Password:** `admin123`
- **Role:** `ADMIN`

### 2. Student Accounts
Students can register dynamically via the **Register** tab on the web portal.

### 3. Pre-Seeded Sample Books
| Title | Author | Category | ISBN | Total Copies |
|---|---|---|---|:---:|
| **Clean Code** | Robert C. Martin | Computer Science | `978-0132350884` | 5 |
| **Introduction to Algorithms** | Thomas H. Cormen | Computer Science | `978-0262033848` | 4 |
| **Database System Concepts** | Abraham Silberschatz | Information Technology | `978-0073523323` | 3 |
| **Computer Networking: A Top-Down Approach** | James Kurose | Networking | `978-0133594140` | 5 |
| **Operating System Principles** | Peter B. Galvin | Computer Science | `978-0471417439` | 4 |
| **Artificial Intelligence: A Modern Approach** | Stuart Russell | AI & ML | `978-0136042594` | 3 |

---

## 📡 REST API Reference

All API responses are formatted in JSON with standard HTTP status codes (`200 OK`, `400 Bad Request`, `401 Unauthorized`, `404 Not Found`).

### 1. Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new student | `{ "studentId": "STU101", "name": "Jane", "email": "jane@mail.com", "department": "CS", "password": "pass" }` |
| `POST` | `/api/auth/login` | Log in user or admin | `{ "identifier": "admin@library.com", "password": "admin123" }` |
| `GET` | `/api/auth/students` | List all enrolled students | *None* |

### 2. Book Endpoints (`/api/books`)
| Method | Endpoint | Description | Request Body / Params |
|---|---|---|---|
| `GET` | `/api/books` | List books (supports search filter) | Query: `?search=clean` |
| `GET` | `/api/books/{id}` | Get single book by ID | *None* |
| `POST` | `/api/books` | Add new book (Admin) | `{ "title": "Spring in Action", "author": "Craig Walls", "category": "CS", "isbn": "978-1617294945", "totalCopies": 5, "availableCopies": 5 }` |
| `PUT` | `/api/books/{id}` | Update existing book (Admin) | Book JSON object |
| `DELETE`| `/api/books/{id}` | Remove book from catalog (Admin) | *None* |

### 3. Reservation Endpoints (`/api/reservations`)
| Method | Endpoint | Description | Request Body |
|---|---|---|---|
| `POST` | `/api/reservations/reserve` | Reserve a book | `{ "userId": 1, "bookId": 2 }` |
| `GET` | `/api/reservations/user/{userId}` | List reservations for student | *None* |
| `GET` | `/api/reservations` | List all system reservations (Admin) | *None* |
| `POST` | `/api/reservations/{id}/return` | Process return & restock book (Admin) | *None* |
| `POST` | `/api/reservations/{id}/cancel` | Cancel an active reservation | `{ "userId": 1 }` |
| `GET` | `/api/reservations/fine-rate` | Fetch active daily fine rate | *None* |
| `POST` | `/api/reservations/fine-rate` | Update daily fine rate (Admin) | `{ "dailyFineRate": 2.50 }` |

---

## 🔧 Configuration Properties

| Key | Default | Description |
|---|---|---|
| `server.port` | `8085` | HTTP server listening port |
| `spring.datasource.url` | `jdbc:h2:mem:library_db...` | JDBC connection URL |
| `spring.datasource.driver-class-name` | `org.h2.Driver` | JDBC driver class |
| `spring.h2.console.enabled` | `true` | Enables browser console at `/h2-console` |
| `spring.jpa.hibernate.ddl-auto` | `update` | Automatically synchronizes schema with entities |
| `spring.jpa.show-sql` | `true` | Logs generated SQL statements to the console |

---

## 📦 Git Repository & Version Control

- **GitHub Repository:** [https://github.com/reena32/Library_Book_Reservation_System](https://github.com/reena32/Library_Book_Reservation_System)
- **Primary Branch:** `main`

To sync changes locally with GitHub:
```bash
# Check status
git status

# Commit changes
git add .
git commit -m "Your descriptive commit message"

# Push to repository
git push origin main
```

---

## 📄 License
This project is open-source software licensed under the **MIT License**.
