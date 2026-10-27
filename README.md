# 📚 Library Book Reservation System

A full-stack web application designed for university and college libraries to manage book inventories, student accounts, and book reservations with fine calculation and automated inventory tracking.

---

## 🌟 Key Features

### 👤 Student Portal
- **Self-Service Registration & Login:** Students can register with their Student ID, Name, Email, Department, and Password.
- **Book Catalog & Search:** Browse available books with live inventory counts. Filter by title, author, category, or ISBN.
- **One-Click Reservation:** Reserve available books instantly with automated validation (prevents duplicate active reservations).
- **Personal Dashboard:** Track active and past reservations, due dates, return statuses, and any accumulated fines.
- **Self Cancellation:** Cancel active reservations prior to pickup.

### 🛡️ Admin Management Console
- **Inventory Management (CRUD):** Add new books, update existing catalog entries, and delete books.
- **Global Reservation Monitor:** View all student reservations in real-time with status filters (`ACTIVE`, `RETURNED`, `CANCELLED`).
- **Book Return Processing:** Mark books as returned, automatically incrementing available inventory.
- **Fine Management:** Dynamic daily overdue fine calculation with customizable fine rates.
- **Registered Students Directory:** View all enrolled students and their details.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Backend** | Java 21, Spring Boot 3.4.4, Spring Data JPA, Hibernate, Bean Validation |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons |
| **Database** | H2 Database (Embedded, default) / MySQL (Optional, pre-configured) |
| **Build & Dependency Tool** | Apache Maven 3.x (via Maven Wrapper `mvnw`) |

---

## 🚀 Getting Started

### Prerequisites
- **Java Development Kit (JDK):** Version 21 or higher installed (`java -version`)
- *(Optional)* **MySQL:** If you choose to run with an external MySQL database instead of the default embedded H2.

---

### Running the Application

1. **Clone or Open the Repository:**
   ```bash
   cd "g:/reena capstone"
   ```

2. **Start the Application:**
   - **On Windows (PowerShell / Command Prompt):**
     ```cmd
     mvnw.cmd spring-boot:run
     ```
   - **On Linux / macOS:**
     ```bash
     ./mvnw spring-boot:run
     ```

3. **Open the Web Application:**
   Visit: **[http://localhost:8085](http://localhost:8085)**

---

## 🔑 Default Credentials & Seed Data

On initial startup, `DataInitializer` automatically populates the database with default accounts and sample books:

### Default Admin Account
- **Identifier (Email or ID):** `admin@library.com` or `ADMIN01`
- **Password:** `admin123`
- **Role:** Administrator

### Default Students
You can immediately register a new student account using the **Register** tab on the login screen, or log in with any newly created credentials.

### Sample Books
The database automatically seeds 6 sample books across Computer Science, Information Technology, AI/ML, and Networking:
- *Clean Code* by Robert C. Martin
- *Introduction to Algorithms* by Thomas H. Cormen
- *Database System Concepts* by Abraham Silberschatz
- *Computer Networking: A Top-Down Approach* by James Kurose
- *Operating System Principles* by Peter B. Galvin
- *Artificial Intelligence: A Modern Approach* by Stuart Russell

---

## 💾 Database Configuration

The application is pre-configured with embedded **H2 Database** for zero-setup execution.

### 1. H2 Database (Default)
- **H2 Web Console:** [http://localhost:8085/h2-console](http://localhost:8085/h2-console)
  - **JDBC URL:** `jdbc:h2:mem:library_db`
  - **User Name:** `sa`
  - **Password:** *(leave blank)*

### 2. Switching to MySQL (Optional)
To use MySQL instead of H2, update [`src/main/resources/application.properties`](file:///g:/reena%20capstone/src/main/resources/application.properties):

```properties
# MySQL Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/library_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## 📡 REST API Documentation

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new student account |
| `POST` | `/api/auth/login` | Authenticate student or admin (`identifier`, `password`) |
| `GET` | `/api/auth/students` | Get all registered students (Admin) |

### 📖 Books (`/api/books`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/books` | Get all books (supports `?search=` query parameter) |
| `GET` | `/api/books/{id}` | Get book details by ID |
| `POST` | `/api/books` | Add a new book (Admin) |
| `PUT` | `/api/books/{id}` | Update existing book information (Admin) |
| `DELETE`| `/api/books/{id}` | Delete a book by ID (Admin) |

### 🔖 Reservations (`/api/reservations`)
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/reservations/reserve` | Reserve a book (`userId`, `bookId`) |
| `GET` | `/api/reservations/user/{userId}` | Get reservations for a specific student |
| `GET` | `/api/reservations` | Get all reservations across all students (Admin) |
| `POST` | `/api/reservations/{id}/return` | Mark reservation as returned & restock book |
| `POST` | `/api/reservations/{id}/cancel` | Cancel an active reservation |
| `GET` | `/api/reservations/fine-rate` | Get current daily fine rate |
| `POST` | `/api/reservations/fine-rate` | Update daily fine rate (`dailyFineRate`) |

---

## 📂 Project Structure

```text
reena capstone/
├── pom.xml                               # Project dependencies & build configuration
├── mvnw / mvnw.cmd                       # Maven wrapper executables
├── README.md                             # Project documentation
├── src/
│   ├── main/
│   │   ├── java/com/library/
│   │   │   ├── LibraryReservationApplication.java  # Spring Boot Main Class
│   │   │   ├── config/
│   │   │   │   └── DataInitializer.java            # Automatic admin & book data seeder
│   │   │   ├── controller/                         # REST API Controllers
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── BookController.java
│   │   │   │   └── ReservationController.java
│   │   │   ├── model/                              # JPA Database Entities
│   │   │   │   ├── Book.java
│   │   │   │   ├── Reservation.java
│   │   │   │   └── User.java
│   │   │   ├── repository/                         # Spring Data Repositories
│   │   │   │   ├── BookRepository.java
│   │   │   │   ├── ReservationRepository.java
│   │   │   │   └── UserRepository.java
│   │   │   └── service/                            # Business Logic Services
│   │   │       ├── BookService.java
│   │   │       ├── ReservationService.java
│   │   │       └── UserService.java
│   │   └── resources/
│   │       ├── application.properties              # Port, JPA & Database configuration
│   │       └── static/                             # Single-Page Application (Frontend)
│   │           ├── index.html                      # UI layout & modal templates
│   │           └── app.js                          # Client-side state & API integration
```

---

## 📜 License
This project is open-source and developed as a capstone library management solution.
