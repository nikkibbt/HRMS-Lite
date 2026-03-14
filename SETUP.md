# Quick Setup Guide

Follow these steps to get the HRMS Lite application running locally.

## Prerequisites Check

Ensure you have installed:
- Node.js (v18+) - Check with: `node --version`
- npm - Check with: `npm --version`
- MongoDB (local or Atlas account)

## Step-by-Step Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Backend Environment

```bash
# Copy the example env file
cp .env.example .env

# Edit .env and update MONGODB_URI if needed
# For local MongoDB: mongodb://localhost:27017/hrms-lite
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/hrms-lite
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

### 4. Configure Frontend Environment (Optional)

```bash
# Copy the example env file
cp .env.example .env

# Edit .env if your backend runs on a different port
# Default: VITE_API_URL=http://localhost:5000/api
```

### 5. Start MongoDB

**Local MongoDB:**
```bash
# macOS/Linux
mongod

# Windows
net start MongoDB
```

**MongoDB Atlas:**
- No local setup needed, just use your connection string in `.env`

### 6. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### 7. Open the Application

Navigate to: `http://localhost:3000`

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh` or `mongo`
- Check connection string format
- For Atlas: Ensure IP whitelist includes your IP (0.0.0.0/0 for testing)

### Port Already in Use
- Backend: Change PORT in `backend/.env`
- Frontend: Vite will automatically use next available port

### Module Not Found Errors
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

## Next Steps

1. Add your first employee via "Add Employee" tab
2. Mark attendance via "Attendance" tab
3. View all employees in "Employees" tab

For detailed documentation, see [README.md](./README.md)
