# API Usage Guide

## Quick Start

### 1. Import what you need
```javascript
// Import specific APIs
import { authApi, userApi } from '../api';

// Or import everything
import { auth, user, axiosInstance, ENDPOINTS } from '../api';

// Use the custom hook for authentication
import { useAuth } from '../hooks/useAuth';
```

### 2. Using the Auth Hook (Recommended)
```javascript
import { useAuth } from '../hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, login, register, logout, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await login({ email: 'user@example.com', password: 'password' });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

### 3. Using API Functions Directly
```javascript
import { authApi, userApi } from '../api';

// Authentication
const loginUser = async (credentials) => {
  try {
    const response = await authApi.login(credentials);
    console.log('User logged in:', response.user);
  } catch (error) {
    console.error('Login failed:', error);
  }
};

// Register user
const registerUser = async (userData) => {
  try {
    const response = await authApi.register(userData);
    console.log('User registered:', response.user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};

// Get all users (requires authentication)
const fetchUsers = async () => {
  try {
    const users = await userApi.getAllUsers();
    console.log('Users:', users);
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
};
```

### 4. Using Axios Instance for Custom Requests
```javascript
import { axiosInstance, ENDPOINTS } from '../api';

// Custom API call
const customApiCall = async () => {
  try {
    const response = await axiosInstance.get('/custom-endpoint');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Using predefined endpoints
const getUser = async (userId) => {
  try {
    const response = await axiosInstance.get(ENDPOINTS.USERS.GET_BY_ID(userId));
    return response.data;
  } catch (error) {
    throw error;
  }
};
```

## API Structure

### Authentication API (`authApi`)
- `login(credentials)` - Login user
- `register(userData)` - Register new user
- `logout()` - Logout current user
- `getCurrentUser()` - Get user from localStorage
- `isAuthenticated()` - Check if user is logged in
- `getToken()` - Get auth token

### User API (`userApi`)
- `getAllUsers()` - Get all users
- `getUserById(id)` - Get user by ID
- `updateUser(id, userData)` - Update user
- `deleteUser(id)` - Delete user

### Endpoints (`ENDPOINTS`)
All API endpoints are centralized in the ENDPOINTS object for easy maintenance.

## Error Handling

The API automatically handles:
- Token expiration (redirects to login)
- Network errors
- Authentication errors

You can catch specific errors in your components:
```javascript
try {
  await authApi.login(credentials);
} catch (error) {
  if (error.message === 'Invalid credentials') {
    // Handle invalid login
  } else {
    // Handle other errors
  }
}
```

## Configuration

Update the base URL in `axiosInstance.js` if your backend runs on a different port:
```javascript
baseURL: 'http://localhost:3001/api', // Change port as needed
```