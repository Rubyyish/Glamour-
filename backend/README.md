# Node.js Backend with MongoDB

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   - Update `.env` file with your MongoDB connection string
   - Set a secure JWT secret key

3. **Start MongoDB:**
   - Make sure MongoDB is running locally or use MongoDB Atlas

4. **Run the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Request Examples

**Register:**
```json
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Login:**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

## Project Structure
```
backend/
├── models/          # Database models
├── routes/          # API routes
├── middleware/      # Custom middleware
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env            # Environment variables
```