🚀 Employee Management System API

A full-stack Employee Management System built with a powerful FastAPI backend and a modern React.js frontend.

This project allows organizations to efficiently manage:

🏢 Departments

👨‍💼 Employees

💰 Salaries

📅 Attendance

Designed with clean architecture, proper validation, and scalable structure — perfect for learning and real-world backend development.

🛠 Tech Stack
🔹 Backend

⚡ FastAPI — High-performance Python web framework

🗄 SQLAlchemy — ORM for database interactions

📦 Pydantic — Data validation & serialization

🗃 PostgreSQL

🔹 Frontend

⚛ React.js — Modern UI development

🌐 REST API integration with FastAPI

📡 Dynamic data rendering

✨ Key Features
🏢 Department Management

Create and manage departments

Unique department validation

Structured department responses

👨‍💼 Employee Management

Add employees with department association

Email validation using Pydantic

Nested department details in responses

💰 Salary Tracking

Monthly salary records per employee

Date-based salary storage

Clean salary history retrieval

📅 Attendance System

Enum-based attendance status
(Present, Absent, Late, Sick Leave, Vacation, etc.)

Daily attendance tracking

Linked to specific employees

🔒 Backend Architecture Highlights

Clean separation of:

Models (Database)

Schemas (Validation)

Routes (API Logic)

Proper request validation

Nested relationship responses

Auto-generated API documentation via Swagger

Scalable and modular design

📊 API Documentation

FastAPI automatically generates interactive documentation:

Swagger UI → /docs

ReDoc → /redoc

Test all endpoints directly from the browser.
