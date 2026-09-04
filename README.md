# 🚀 HRBuddy

A **full-stack Employee Management System** built with a high-performance **FastAPI backend** and a modern **React.js frontend**.

HRBuddy helps organizations efficiently manage employee-related operations while providing **ML-powered employee attrition prediction** to support data-driven HR decisions.

## ✨ Features

### 🏢 Department Management

* Create and manage departments
* Unique department validation
* Structured department responses
* Department-employee relationship management

### 👨‍💼 Employee Management

* Add and manage employees
* Associate employees with departments
* Email validation using Pydantic
* Nested department details in API responses

### 💰 Salary Tracking

* Maintain monthly salary records
* Date-based salary storage
* Retrieve employee salary history

### 📅 Attendance Management

* Daily attendance tracking
* Attendance linked to individual employees
* Enum-based attendance statuses such as:

  * Present
  * Absent
  * Late
  * Sick Leave
  * Vacation

### 🤖 Employee Attrition Prediction

* Integrated a **Machine Learning model** into the FastAPI backend
* Predicts the likelihood of employee attrition using key employee attributes
* Uses a **Logistic Regression** model for classification
* Implements **feature scaling and preprocessing** using Scikit-learn
* Provides predictions through a dedicated REST API endpoint
* Returns the predicted attrition status and probability

## 🛠 Tech Stack

### 🔹 Backend

* ⚡ **FastAPI** — High-performance Python web framework
* 🗄 **SQLAlchemy** — ORM for database interactions
* 📦 **Pydantic** — Data validation and serialization
* 🗃 **PostgreSQL** — Relational database
* 🤖 **Scikit-learn** — Machine Learning and preprocessing
* 🐍 **Python** — Backend and ML development

### 🔹 Frontend

* ⚛ **React.js** — Modern UI development
* 🌐 **REST API** — Communication with FastAPI backend
* 📡 **Dynamic data rendering**
* 🎨 Responsive and component-based UI

## 🧠 Machine Learning

The project integrates a **Logistic Regression** model for employee attrition prediction.

The prediction pipeline includes:

1. Collecting employee attributes through a FastAPI request
2. Validating input using **Pydantic schemas**
3. Preparing the input features using Pandas
4. Scaling features using **StandardScaler**
5. Generating an attrition prediction using the trained Logistic Regression model
6. Returning the prediction and attrition probability through the REST API

### Key Features Used

## 🔒 Backend Architecture

The backend follows a modular structure with a clear separation of concerns:

* **Models** — Database models and relationships
* **Schemas** — Request/response validation using Pydantic
* **Routes** — API endpoint and business logic
* **ML Model** — Employee attrition prediction
* **Database** — PostgreSQL persistence

Additional backend capabilities include:

* Proper request validation
* Nested relationship responses
* RESTful API design
* Scalable and modular structure
* Interactive API documentation
* ML model integration

## 📊 API Documentation

FastAPI automatically generates interactive API documentation.

### Swagger UI

```text
/docs
```

### ReDoc

```text
/redoc
```

You can use Swagger UI to **test API endpoints directly from the browser**, including the employee attrition prediction endpoint.

## 🚀 Project Highlights

HRBuddy combines **full-stack web development, REST API design, database management, and Machine Learning** into a single application.

The project demonstrates practical experience with:

* FastAPI backend development
* React.js frontend development
* REST API integration
* SQLAlchemy ORM
* PostgreSQL
* Pydantic validation
* Scikit-learn
* Machine Learning model deployment
* Feature preprocessing and scaling
* Employee attrition prediction
