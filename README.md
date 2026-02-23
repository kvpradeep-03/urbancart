# 🛒 UrbanCart

UrbanCart is a full-stack eCommerce web application that allows users to browse products, manage a shopping cart, and place secure orders.  
It demonstrates real-world shopping workflows including authentication, cart management, order processing, email notification, and payment verification.

---

## 🚀 Features

- Secure user authentication and authorization

- Product browsing and search functionality

- Cart and order management system

- Admin panel for product and order control

- Cloud-based media storage with CDN-style delivery for product images

- Secure checkout with Razorpay payment gateway integration and signature verification

- Containerized deployment using Docker for environment consistency

- Automated CI/CD pipeline using GitHub Actions

- Production deployment on Render

- Fully responsive user interface

---

## 🛠 Tech Stack

### Frontend
- React.js
- JavaScript (ES6+)
- Material UI
- HTML5 & CSS3

### Backend
- Python
- Django
- Django REST Framework (REST APIs)

### Database & Storage
- MySQL (primary relational database)
- TiDB (cloud storage layer for media assets)

### Payments & Communication
- Razorpay (payment processing & verification)
- Brevo (transactional email delivery)

### DevOps & Deployment
- Docker (containerization)
- GitHub Actions (CI/CD automation)
- Render (cloud deployment)


---

## 🏗 Project Architecture 

```mermaid
flowchart TD

A[User Browser] --> B[React Frontend]
B -->|API Requests| C[Django REST API]

C --> D[Authentication & Authorization]
C --> E[Product & Cart Services]
C --> F[Order & Payment Service]

E --> G[(MySQL Database)]
F --> G

C --> H[TiDB Media Storage]
H -->|Image Delivery| B

F --> I[Razorpay Payment Gateway]
F --> J[Payment Verification]

C --> K[Brevo Email Service]

subgraph DevOps & Deployment
L[Docker Containers]
M[GitHub Actions CI/CD]
N[Render Cloud Hosting]
end

C --> L
L --> M
M --> N
```
<br>
<br>

## ⚡ Request Lifecycle
```mermaid
sequenceDiagram
participant U as User Browser
participant F as React Frontend
participant A as Django REST API
participant S as Services Layer
participant DB as MySQL Database
participant M as Media Storage (TiDB)
participant P as Razorpay
participant E as Brevo Email Service

U->>F: User action (Add to cart / Checkout)
F->>A: HTTP API Request (JSON)
A->>S: Validate & process request
S->>DB: Read/Write data
DB-->>S: Return results
S-->>A: Business logic response

alt If media required
A->>M: Fetch image URL
M-->>A: Media response
end

alt If payment initiated
A->>P: Create payment order
P-->>F: Payment popup
P->>A: Payment signature callback
A->>S: Verify payment & update order
end

A->>E: Send confirmation email
A-->>F: JSON response
F-->>U: UI updated
```

### 🖹 API documentation
 - documentation in progress...
    
