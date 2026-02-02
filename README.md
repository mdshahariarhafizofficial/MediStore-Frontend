# MediStore

An advanced full-stack online medicine shop platform for seamless medicine ordering, selling, and management with role-based access control.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Roles & Permissions](#roles--permissions)
5. [Pages & Routes](#pages--routes)
6. [Database Schema Overview](#database-schema-overview)
7. [API Endpoints Overview](#api-endpoints-overview)
8. [Installation & Setup Instructions](#installation--setup-instructions)
9. [Running the Project](#running-the-project)
10. [Deployment Instructions](#deployment-instructions)
11. [Admin Credentials](#admin-credentials)
12. [Screenshots](#screenshots)
13. [Contributing](#contributing)
14. [License](#license)

---

## Project Overview

**MediStore** is a comprehensive e-commerce platform designed for buying and selling medicines online. It supports multiple user roles (Guest/Public, Customer, Seller, and Admin), enabling a complete marketplace experience with order management, inventory control, and analytics.

### Key Objectives
- Provide a user-friendly interface for customers to browse and purchase medicines
- Enable sellers to manage their inventory and fulfill orders
- Equip administrators with powerful tools to manage the entire platform
- Ensure secure authentication and role-based access control

---

## Features

### Public
- ✅ Browse all available medicines across shops
- ✅ Search and filter products by name, category, and price
- ✅ View detailed shop and medicine information
- ✅ User registration and login
- ✅ Wishlist functionality (after login)

### Customer
- ✅ Add medicines to cart and wishlist
- ✅ Place orders and proceed to checkout
- ✅ View complete order history and order details
- ✅ Manage profile and delivery address
- ✅ Track order status in real-time
- ✅ Multiple payment method support

### Seller
- ✅ Seller dashboard with sales analytics
- ✅ Manage medicines (Create, Read, Update, Delete)
- ✅ View and process customer orders
- ✅ Track sales metrics and revenue
- ✅ Manage inventory and stock levels
- ✅ View customer feedback and ratings

### Admin
- ✅ Comprehensive admin dashboard with platform statistics
- ✅ Manage all users, sellers, and categories
- ✅ Monitor and manage all orders across the platform
- ✅ Update order status and manage fulfillment
- ✅ Delete problematic orders and manage disputes
- ✅ Export data to CSV for reporting
- ✅ View platform analytics and trends

---

## Tech Stack

### Frontend
- **Framework:** Next.js 14+ (React)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** React Query (TanStack Query), Zustand
- **HTTP Client:** Axios
- **UI Components:** Lucide Icons, Custom Components
- **Notifications:** React Hot Toast
- **Build Tool:** Next.js with TypeScript support

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** JavaScript/TypeScript
- **Database:** MongoDB
- **ORM:** Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **API:** RESTful API

### Database
- **Primary DB:** MongoDB
- **Schema Validation:** Mongoose
- **Collections:** Users, Medicines, Orders, Shops, Categories, Carts, Wishlist

### DevOps & Tools
- **Version Control:** Git
- **Package Manager:** npm
- **Environment:** Node.js LTS

---

## Roles & Permissions

| Role | Browse | Cart | Orders | Profile | Seller Panel | Admin Panel |
|------|--------|------|--------|---------|--------------|-------------|
| **Public** | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Customer** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Seller** | ✅ | ❌ | ✅ (own) | ✅ | ✅ | ❌ |
| **Admin** | ✅ | ❌ | ✅ (all) | ✅ | ❌ | ✅ |

---

## Pages & Routes

### Authentication Pages
- `/login` — User login
- `/register` — User registration

### Customer Pages
- `/` — Home/Shop landing
- `/shop` — Browse all medicines
- `/shop/[id]` — Medicine detail page
- `/customer/cart` — Shopping cart
- `/customer/checkout` — Order checkout
- `/customer/orders` — Order history
- `/customer/orders/[id]` — Order details
- `/customer/profile` — Customer profile management

### Seller Pages
- `/seller/dashboard` — Seller analytics dashboard
- `/seller/dashboard/[submenu]` — Dashboard subpages
- `/seller/medicines` — Manage medicines inventory
- `/seller/orders` — View seller orders

### Admin Pages
- `/admin` — Admin dashboard with statistics
- `/admin/categories` — Manage medicine categories
- `/admin/orders` — Manage all platform orders
- `/admin/users` — Manage users and sellers

---

## Database Schema Overview

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String, // "CUSTOMER", "SELLER", "ADMIN"
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Medicine Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: ObjectId (ref: Category),
  sellerId: ObjectId (ref: User),
  image: String,
  rating: Number,
  reviews: Array,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Collection
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  customerId: ObjectId (ref: User),
  sellerId: ObjectId (ref: User),
  items: [
    {
      medicineId: ObjectId,
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: String, // "PLACED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"
  paymentMethod: String,
  shippingAddress: String,
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Shop Collection
```javascript
{
  _id: ObjectId,
  name: String,
  sellerId: ObjectId (ref: User),
  description: String,
  address: String,
  phone: String,
  email: String,
  rating: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Category Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Overview

### Authentication Endpoints
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - User login
POST   /api/auth/logout         - User logout
GET    /api/auth/profile        - Get current user profile
POST   /api/auth/refresh-token  - Refresh JWT token
```

### Customer Endpoints
```
GET    /api/customer/orders           - List customer orders
GET    /api/customer/orders/:id       - Get order details
POST   /api/customer/orders           - Place new order
GET    /api/customer/cart             - Get cart items
POST   /api/customer/cart             - Add item to cart
DELETE /api/customer/cart/:medicineId - Remove from cart
GET    /api/customer/wishlist         - Get wishlist items
POST   /api/customer/wishlist         - Add to wishlist
```

### Seller Endpoints
```
GET    /api/seller/dashboard    - Get seller statistics
GET    /api/seller/medicines    - List seller medicines
POST   /api/seller/medicines    - Create medicine
PUT    /api/seller/medicines/:id - Update medicine
DELETE /api/seller/medicines/:id - Delete medicine
GET    /api/seller/orders       - List seller orders
PATCH  /api/seller/orders/:id/status - Update order status
```

### Admin Endpoints
```
GET    /api/admin/dashboard     - Get admin dashboard stats
GET    /api/admin/orders        - List all orders
GET    /api/admin/orders/:id    - Get order details
PATCH  /api/admin/orders/:id/status - Update order status
DELETE /api/admin/orders/:id    - Delete order
GET    /api/admin/users         - List all users
POST   /api/admin/categories    - Create category
GET    /api/admin/categories    - List categories
PUT    /api/admin/categories/:id - Update category
DELETE /api/admin/categories/:id - Delete category
```

### Medicine & Shop Endpoints
```
GET    /api/medicines           - List all medicines (public)
GET    /api/medicines/:id       - Get medicine details
GET    /api/shops               - List all shops
GET    /api/shops/:id           - Get shop details
GET    /api/categories          - List all categories
```

### Example: Update Order Status
```bash
curl -X PATCH http://localhost:5000/api/admin/orders/123/status \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "DELIVERED"
  }'
```

### Example: Create Medicine (Seller)
```bash
curl -X POST http://localhost:5000/api/seller/medicines \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Aspirin",
    "description": "Pain reliever",
    "price": 50,
    "stock": 100,
    "category": "507f1f77bcf86cd799439011"
  }'
```

---

## Installation & Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- MongoDB (local or MongoDB Atlas)
- Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/yourusername/medistore.git
cd medistore
```

### Step 2: Setup Frontend
```bash
cd frontend
npm install
```

Create a `.env.local` file in the frontend folder:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Step 3: Setup Backend
```bash
cd ../backend
npm install
```

Create a `.env` file in the backend folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/medistore
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

For MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medistore?retryWrites=true&w=majority
```

---

## Running the Project

### Run Frontend (Development Mode)
```bash
cd frontend
npm run dev
```

Frontend will be available at: **http://localhost:3000**

### Run Backend (Development Mode)
```bash
cd backend
npm run dev
```

Backend will be available at: **http://localhost:5000**

### Run Both Simultaneously (Using concurrently or similar)
```bash
# From project root
npm run dev:all
```

### Build Frontend (Production)
```bash
cd frontend
npm run build
npm start
```

### Build Backend (Production)
```bash
cd backend
npm run build
npm start
```

---

## Deployment Instructions

### Deploy Frontend to Vercel
1. Push your frontend code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Click "New Project" and select your repository
4. Set environment variables in Vercel dashboard
5. Click "Deploy"

### Deploy Backend to Render
1. Push your backend code to GitHub
2. Go to [Render](https://render.com)
3. Click "New+" → "Web Service"
4. Select your repository
5. Set environment variables
6. Choose Node environment and deploy

### Deploy Backend to Heroku
```bash
# Install Heroku CLI and login
heroku login

# Create new Heroku app
heroku create your-app-name

# Set environment variables
heroku config:set MONGODB_URI="your_mongo_uri"
heroku config:set JWT_SECRET="your_secret"

# Deploy
git push heroku main
```

### Connect to MongoDB Atlas
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

---

## Admin Credentials

> **Default Admin Account** (Change after first login)
>
> - **Email:** `admin@medistore.com`
> - **Password:** `admin123456`

**Security Note:** Update these credentials immediately in production and use a secure password manager.

---

## Screenshots

### Dashboard
> [Add Dashboard Screenshot]
> ![Dashboard Screenshot](./screenshots/dashboard.png)

### Order Management
> [Add Order Management GIF]
> ![Order Management](./screenshots/orders.gif)

### Customer Shopping
> [Add Shopping GIF]
> ![Shopping](./screenshots/shopping.gif)

### Seller Dashboard
> [Add Seller Dashboard Screenshot]
> ![Seller Dashboard](./screenshots/seller-dashboard.png)

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Support

For support, email support@medistore.com or open an issue in the repository.

---

**Built with ❤️ by the MediStore Team**
