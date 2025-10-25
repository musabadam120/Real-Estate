# Quick Setup Guide

## Step 1: Configure Backend Environment

1. Navigate to the backend folder
2. Create or update `.env` file with your credentials:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. Install dependencies (if not already done):
```bash
cd backend
npm install
```

4. Start the backend server:
```bash
npm start
```

The backend will run on http://localhost:5000

## Step 2: Configure Frontend Environment

1. Navigate to the frontend folder
2. Update `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

3. Install dependencies (if not already done):
```bash
cd frontend
npm install
```

4. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on http://localhost:3000

## Step 3: Create Your First Admin User

You can create the first admin user in two ways:

### Option 1: Using the Registration Page
1. Go to http://localhost:3000/register
2. Fill in the form and select "Landlord" or "Tenant" role
3. After registration, manually update the user's role to "admin" in MongoDB

### Option 2: Direct Database Insert
Connect to your MongoDB database and insert:

```javascript
{
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$10$hashedPasswordHere", // Use bcrypt to hash
  role: "admin",
  createdAt: new Date(),
  updatedAt: new Date()
}
```

## Testing the Application

### Admin Login
1. Login with admin credentials
2. You'll be redirected to `/admin/dashboard`
3. Navigate through:
   - Dashboard - View statistics
   - Properties - Create and manage properties
   - Users - View all users
   - Maintenance - Monitor maintenance requests

### Landlord Login
1. Admin must create properties and assign them to landlord
2. Login with landlord credentials
3. Access landlord dashboard at `/landlord/dashboard`
4. Features:
   - View assigned properties
   - Manage maintenance requests
   - View tenant information

### Tenant Login
1. Admin must assign tenant to a property
2. Login with tenant credentials
3. Access tenant dashboard at `/tenant/dashboard`
4. Features:
   - View assigned property
   - Submit maintenance requests
   - View landlord contact info

## Default Routes

- Login: http://localhost:3000/login
- Register: http://localhost:3000/register
- Admin Dashboard: http://localhost:3000/admin/dashboard
- Landlord Dashboard: http://localhost:3000/landlord/dashboard
- Tenant Dashboard: http://localhost:3000/tenant/dashboard

## Common Issues

### Backend won't start
- Check MongoDB connection string
- Ensure MongoDB is running
- Verify all environment variables are set

### Frontend can't connect to backend
- Check VITE_API_URL in frontend/.env
- Ensure backend is running on port 5000
- Check CORS settings in backend

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET is set in backend/.env
- Verify user credentials in database

## Production Build

To build for production:

```bash
cd frontend
npm run build
```

This creates an optimized build in `frontend/dist/`

## Need Help?

Check the main README.md for more detailed information about:
- API endpoints
- Project structure
- Technology stack
- Security features
