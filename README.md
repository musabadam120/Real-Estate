# EstateManager - Real Estate Management System

A comprehensive real estate management platform built with React, Node.js, Express, and MongoDB. This application provides role-based dashboards for Admins, Landlords, and Tenants.

## Features

### Admin Dashboard
- Complete system oversight and control
- Property management (create, edit, delete, assign)
- User management (view all users by role)
- Maintenance request monitoring
- Analytics and statistics

### Landlord Dashboard
- View and manage assigned properties
- Track tenant information
- Handle maintenance requests
- Monitor property status and occupancy

### Tenant Dashboard
- View assigned property details
- Submit maintenance requests
- Track maintenance request status
- View landlord contact information

## Technology Stack

### Frontend
- React 19
- React Router v7
- Axios for API calls
- Plain CSS with CSS variables
- Vite as build tool

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for file uploads
- Bcrypt for password hashing

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB database
- Cloudinary account (for file uploads)

### Installation

1. Clone the repository
2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

4. Configure environment variables:

Backend (.env):
```
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Frontend (.env):
```
VITE_API_URL=http://localhost:5000/api
```

### Running the Application

1. Start the backend server:
```bash
cd backend
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

3. Access the application at http://localhost:3000

## User Roles

### Admin
- Full system access
- Can create and manage properties
- Can manage all users
- Can assign landlords and tenants to properties

### Landlord
- Access to assigned properties only
- Can view tenant information
- Can manage maintenance requests for their properties

### Tenant
- Access to assigned property only
- Can submit maintenance requests
- Can view property and landlord details

## Project Structure

```
project/
├── backend/
│   ├── config/           # Configuration files
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── pages/       # Page components
│   │   ├── styles/      # CSS files
│   │   ├── utils/       # Utility functions
│   │   ├── App.jsx      # Main app component
│   │   └── main.jsx     # Entry point
│   └── index.html
└── README.md
```

## API Endpoints

### Authentication
- POST /api/auth/register - Register new user
- POST /api/auth/login - Login user

### Properties
- GET /api/properties - Get all properties (role-filtered)
- POST /api/properties - Create property (admin/landlord)
- GET /api/properties/:id - Get single property
- PUT /api/properties/:id - Update property (admin/landlord)
- DELETE /api/properties/:id - Delete property (admin/landlord)

### Users
- GET /api/users - Get all users (admin only)
- DELETE /api/users/:id - Delete user (admin only)

### Maintenance
- GET /api/maintenance - Get maintenance requests (role-filtered)
- POST /api/maintenance - Create maintenance request (tenant)
- PUT /api/maintenance/:id - Update maintenance request
- DELETE /api/maintenance/:id - Delete maintenance request (admin)

## Design Features

- Modern gradient-based UI
- Responsive design for all screen sizes
- Smooth animations and transitions
- Role-based navigation
- Protected routes with authentication
- Clean and intuitive user interface

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API routes
- Role-based access control
- CORS configuration

## License

This project is licensed under the ISC License.
