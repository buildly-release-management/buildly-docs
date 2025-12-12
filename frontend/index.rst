.. _frontend-development:

Frontend Development Guide
==========================

Welcome to the Buildly Frontend Development Guide. This comprehensive resource covers everything you need to build modern, responsive frontends that integrate seamlessly with Buildly Core.

.. contents:: Table of Contents
   :local:
   :depth: 2

Overview
--------

Buildly provides flexible frontend options to suit your development preferences and project requirements:

- **React Template** - Modern React application with Material-UI
- **Angular UI Library** - Comprehensive Angular component library
- **Standalone Integration** - Connect any frontend framework to Buildly Core

Technology Stack
----------------

**Supported Frontend Frameworks:**

- React 18+ with TypeScript
- Angular 12+ with TypeScript  
- Vue.js 3+ (community supported)
- Vanilla JavaScript/TypeScript

**UI Component Libraries:**

- Material-UI (MUI) for React
- Buildly UI Angular components
- Custom design systems supported

**State Management:**

- React: Redux, Context API, Zustand
- Angular: RxJS, NgRx
- Buildly Core API integration patterns

Quick Start
-----------

React Template
~~~~~~~~~~~~~~

The Buildly React Template provides a complete starting point for React applications.

**Installation:**

.. code-block:: bash

   # Clone the React template
   git clone https://github.com/buildlyio/buildly-react-template.git my-app
   cd my-app
   
   # Install dependencies
   npm install
   
   # Configure environment
   cp .env.example .env
   # Edit .env with your Buildly Core API URL
   
   # Start development server
   npm start

**Key Features:**

- Pre-configured routing with React Router
- Material-UI component integration
- OAuth 2.0 authentication setup
- API service layer for Buildly Core
- Responsive layouts and themes
- Form handling with validation
- Internationalization (i18n) support

Angular UI Library
~~~~~~~~~~~~~~~~~~

The Buildly Angular UI library provides reusable components and services.

**Installation:**

.. code-block:: bash

   # Create new Angular app
   ng new my-buildly-app
   cd my-buildly-app
   
   # Install Buildly UI library
   npm install @buildly/ui-angular
   
   # Import in your app module
   # See Angular integration guide below

**Key Components:**

- Data tables with sorting and filtering
- Form components with validation
- Navigation and layout components
- Charts and data visualization
- Authentication components

Project Structure
-----------------

React Template Structure
~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: text

   buildly-react-template/
   ├── public/
   │   ├── index.html
   │   └── assets/
   ├── src/
   │   ├── components/       # Reusable UI components
   │   │   ├── common/
   │   │   ├── forms/
   │   │   └── layouts/
   │   ├── pages/           # Page-level components
   │   │   ├── Dashboard/
   │   │   ├── Auth/
   │   │   └── Profile/
   │   ├── services/        # API services
   │   │   ├── api.js
   │   │   ├── auth.js
   │   │   └── buildly.js
   │   ├── store/           # State management
   │   │   ├── actions/
   │   │   ├── reducers/
   │   │   └── store.js
   │   ├── utils/           # Helper functions
   │   │   ├── validators.js
   │   │   └── formatters.js
   │   ├── routes/          # Route configuration
   │   ├── theme/           # Theme customization
   │   ├── App.js
   │   └── index.js
   ├── package.json
   ├── .env.example
   └── README.md

**Recommended Practices:**

- Keep components small and focused
- Use functional components with hooks
- Implement proper TypeScript types
- Follow component naming conventions
- Organize by feature when scaling

Buildly Core Integration
-------------------------

API Configuration
~~~~~~~~~~~~~~~~~

Configure your frontend to connect to Buildly Core API.

**Environment Configuration:**

.. code-block:: javascript

   // .env file
   REACT_APP_API_URL=https://api.yourdomain.com
   REACT_APP_OAUTH_CLIENT_ID=your-client-id
   REACT_APP_OAUTH_CLIENT_SECRET=your-client-secret

**API Service Setup:**

.. code-block:: javascript

   // src/services/buildly.js
   import axios from 'axios';
   
   const API_URL = process.env.REACT_APP_API_URL;
   
   // Create axios instance with default config
   const buildlyAPI = axios.create({
     baseURL: API_URL,
     timeout: 10000,
     headers: {
       'Content-Type': 'application/json',
     }
   });
   
   // Add authentication token to requests
   buildlyAPI.interceptors.request.use(
     (config) => {
       const token = localStorage.getItem('access_token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     },
     (error) => Promise.reject(error)
   );
   
   // Handle token refresh on 401
   buildlyAPI.interceptors.response.use(
     (response) => response,
     async (error) => {
       const originalRequest = error.config;
       
       if (error.response.status === 401 && !originalRequest._retry) {
         originalRequest._retry = true;
         try {
           const refreshToken = localStorage.getItem('refresh_token');
           const response = await axios.post(`${API_URL}/oauth/token/`, {
             grant_type: 'refresh_token',
             refresh_token: refreshToken,
             client_id: process.env.REACT_APP_OAUTH_CLIENT_ID,
           });
           
           localStorage.setItem('access_token', response.data.access_token);
           return buildlyAPI(originalRequest);
         } catch (refreshError) {
           // Redirect to login
           window.location.href = '/login';
           return Promise.reject(refreshError);
         }
       }
       
       return Promise.reject(error);
     }
   );
   
   export default buildlyAPI;

Authentication Implementation
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

OAuth 2.0 authentication with Buildly Core.

**Login Flow:**

.. code-block:: javascript

   // src/services/auth.js
   import buildlyAPI from './buildly';
   
   export const authService = {
     async login(username, password) {
       try {
         const response = await buildlyAPI.post('/oauth/token/', {
           grant_type: 'password',
           username,
           password,
           client_id: process.env.REACT_APP_OAUTH_CLIENT_ID,
           client_secret: process.env.REACT_APP_OAUTH_CLIENT_SECRET,
         });
         
         const { access_token, refresh_token, user } = response.data;
         
         // Store tokens
         localStorage.setItem('access_token', access_token);
         localStorage.setItem('refresh_token', refresh_token);
         localStorage.setItem('user', JSON.stringify(user));
         
         return { success: true, user };
       } catch (error) {
         return { 
           success: false, 
           error: error.response?.data?.error || 'Login failed' 
         };
       }
     },
     
     async logout() {
       // Clear local storage
       localStorage.removeItem('access_token');
       localStorage.removeItem('refresh_token');
       localStorage.removeItem('user');
       
       // Optional: Call server logout endpoint
       try {
         await buildlyAPI.post('/oauth/revoke-token/');
       } catch (error) {
         console.error('Logout error:', error);
       }
     },
     
     getCurrentUser() {
       const userStr = localStorage.getItem('user');
       return userStr ? JSON.parse(userStr) : null;
     },
     
     isAuthenticated() {
       return !!localStorage.getItem('access_token');
     }
   };

**Protected Routes:**

.. code-block:: javascript

   // src/components/ProtectedRoute.js
   import React from 'react';
   import { Navigate } from 'react-router-dom';
   import { authService } from '../services/auth';
   
   const ProtectedRoute = ({ children }) => {
     if (!authService.isAuthenticated()) {
       return <Navigate to="/login" replace />;
     }
     
     return children;
   };
   
   export default ProtectedRoute;

State Management
----------------

Redux Setup (React)
~~~~~~~~~~~~~~~~~~~

**Store Configuration:**

.. code-block:: javascript

   // src/store/store.js
   import { createStore, applyMiddleware, combineReducers } from 'redux';
   import thunk from 'redux-thunk';
   import { composeWithDevTools } from 'redux-devtools-extension';
   
   // Import reducers
   import authReducer from './reducers/authReducer';
   import dataReducer from './reducers/dataReducer';
   import uiReducer from './reducers/uiReducer';
   
   const rootReducer = combineReducers({
     auth: authReducer,
     data: dataReducer,
     ui: uiReducer,
   });
   
   const store = createStore(
     rootReducer,
     composeWithDevTools(applyMiddleware(thunk))
   );
   
   export default store;

**Example Reducer:**

.. code-block:: javascript

   // src/store/reducers/authReducer.js
   const initialState = {
     user: null,
     isAuthenticated: false,
     loading: false,
     error: null,
   };
   
   export default function authReducer(state = initialState, action) {
     switch (action.type) {
       case 'LOGIN_REQUEST':
         return { ...state, loading: true, error: null };
       case 'LOGIN_SUCCESS':
         return {
           ...state,
           loading: false,
           isAuthenticated: true,
           user: action.payload,
           error: null,
         };
       case 'LOGIN_FAILURE':
         return {
           ...state,
           loading: false,
           isAuthenticated: false,
           error: action.payload,
         };
       case 'LOGOUT':
         return initialState;
       default:
         return state;
     }
   }

**Actions:**

.. code-block:: javascript

   // src/store/actions/authActions.js
   import { authService } from '../../services/auth';
   
   export const login = (username, password) => async (dispatch) => {
     dispatch({ type: 'LOGIN_REQUEST' });
     
     const result = await authService.login(username, password);
     
     if (result.success) {
       dispatch({ type: 'LOGIN_SUCCESS', payload: result.user });
     } else {
       dispatch({ type: 'LOGIN_FAILURE', payload: result.error });
     }
   };
   
   export const logout = () => async (dispatch) => {
     await authService.logout();
     dispatch({ type: 'LOGOUT' });
   };

UI Components
-------------

Common Component Patterns
~~~~~~~~~~~~~~~~~~~~~~~~~~

**Data Table Component:**

.. code-block:: jsx

   // src/components/common/DataTable.jsx
   import React, { useState } from 'react';
   import {
     Table,
     TableBody,
     TableCell,
     TableContainer,
     TableHead,
     TableRow,
     TablePagination,
     Paper,
     CircularProgress,
   } from '@mui/material';
   
   const DataTable = ({ 
     columns, 
     data, 
     loading = false,
     onRowClick,
     pagination = true 
   }) => {
     const [page, setPage] = useState(0);
     const [rowsPerPage, setRowsPerPage] = useState(10);
     
     const handleChangePage = (event, newPage) => {
       setPage(newPage);
     };
     
     const handleChangeRowsPerPage = (event) => {
       setRowsPerPage(parseInt(event.target.value, 10));
       setPage(0);
     };
     
     if (loading) {
       return (
         <Paper sx={{ p: 3, textAlign: 'center' }}>
           <CircularProgress />
         </Paper>
       );
     }
     
     const paginatedData = pagination
       ? data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
       : data;
     
     return (
       <Paper>
         <TableContainer>
           <Table>
             <TableHead>
               <TableRow>
                 {columns.map((column) => (
                   <TableCell key={column.id}>{column.label}</TableCell>
                 ))}
               </TableRow>
             </TableHead>
             <TableBody>
               {paginatedData.map((row, index) => (
                 <TableRow 
                   key={index}
                   hover
                   onClick={() => onRowClick && onRowClick(row)}
                   sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                 >
                   {columns.map((column) => (
                     <TableCell key={column.id}>
                       {column.render 
                         ? column.render(row[column.id], row)
                         : row[column.id]
                       }
                     </TableCell>
                   ))}
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
         {pagination && (
           <TablePagination
             component="div"
             count={data.length}
             page={page}
             onPageChange={handleChangePage}
             rowsPerPage={rowsPerPage}
             onRowsPerPageChange={handleChangeRowsPerPage}
           />
         )}
       </Paper>
     );
   };
   
   export default DataTable;

**Form Component with Validation:**

.. code-block:: jsx

   // src/components/common/Form.jsx
   import React from 'react';
   import { useForm, Controller } from 'react-hook-form';
   import { TextField, Button, Box } from '@mui/material';
   
   const Form = ({ fields, onSubmit, submitText = 'Submit' }) => {
     const { control, handleSubmit, formState: { errors } } = useForm();
     
     return (
       <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 2 }}>
         {fields.map((field) => (
           <Controller
             key={field.name}
             name={field.name}
             control={control}
             defaultValue=""
             rules={field.rules}
             render={({ field: controllerField }) => (
               <TextField
                 {...controllerField}
                 label={field.label}
                 type={field.type || 'text'}
                 fullWidth
                 margin="normal"
                 error={!!errors[field.name]}
                 helperText={errors[field.name]?.message}
                 {...field.props}
               />
             )}
           />
         ))}
         <Button 
           type="submit" 
           variant="contained" 
           fullWidth 
           sx={{ mt: 2 }}
         >
           {submitText}
         </Button>
       </Box>
     );
   };
   
   export default Form;

Styling and Theming
-------------------

Material-UI Theme Customization
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

**Custom Theme:**

.. code-block:: javascript

   // src/theme/theme.js
   import { createTheme } from '@mui/material/styles';
   
   const theme = createTheme({
     palette: {
       primary: {
         main: '#0C5595',
         light: '#4A8BC2',
         dark: '#083A68',
       },
       secondary: {
         main: '#FF6B35',
       },
       background: {
         default: '#F5F7FA',
         paper: '#FFFFFF',
       },
     },
     typography: {
       fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
       h1: {
         fontSize: '2.5rem',
         fontWeight: 600,
       },
       h2: {
         fontSize: '2rem',
         fontWeight: 600,
       },
       button: {
         textTransform: 'none',
       },
     },
     shape: {
       borderRadius: 8,
     },
     components: {
       MuiButton: {
         styleOverrides: {
           root: {
             borderRadius: 8,
             padding: '10px 24px',
           },
         },
       },
       MuiCard: {
         styleOverrides: {
           root: {
             boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
           },
         },
       },
     },
   });
   
   export default theme;

**Apply Theme:**

.. code-block:: jsx

   // src/App.js
   import React from 'react';
   import { ThemeProvider } from '@mui/material/styles';
   import CssBaseline from '@mui/material/CssBaseline';
   import theme from './theme/theme';
   import Routes from './routes';
   
   function App() {
     return (
       <ThemeProvider theme={theme}>
         <CssBaseline />
         <Routes />
       </ThemeProvider>
     );
   }
   
   export default App;

Routing
-------

React Router Setup
~~~~~~~~~~~~~~~~~~

**Route Configuration:**

.. code-block:: jsx

   // src/routes/index.jsx
   import React from 'react';
   import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
   import ProtectedRoute from '../components/ProtectedRoute';
   
   // Pages
   import Login from '../pages/Auth/Login';
   import Register from '../pages/Auth/Register';
   import Dashboard from '../pages/Dashboard';
   import Profile from '../pages/Profile';
   import NotFound from '../pages/NotFound';
   
   const AppRoutes = () => {
     return (
       <BrowserRouter>
         <Routes>
           {/* Public Routes */}
           <Route path="/login" element={<Login />} />
           <Route path="/register" element={<Register />} />
           
           {/* Protected Routes */}
           <Route 
             path="/dashboard" 
             element={
               <ProtectedRoute>
                 <Dashboard />
               </ProtectedRoute>
             } 
           />
           <Route 
             path="/profile" 
             element={
               <ProtectedRoute>
                 <Profile />
               </ProtectedRoute>
             } 
           />
           
           {/* Redirects and 404 */}
           <Route path="/" element={<Navigate to="/dashboard" replace />} />
           <Route path="*" element={<NotFound />} />
         </Routes>
       </BrowserRouter>
     );
   };
   
   export default AppRoutes;

Testing
-------

Unit Testing
~~~~~~~~~~~~

**Component Testing with React Testing Library:**

.. code-block:: javascript

   // src/components/common/__tests__/DataTable.test.js
   import React from 'react';
   import { render, screen, fireEvent } from '@testing-library/react';
   import DataTable from '../DataTable';
   
   describe('DataTable', () => {
     const mockColumns = [
       { id: 'name', label: 'Name' },
       { id: 'email', label: 'Email' },
     ];
     
     const mockData = [
       { name: 'John Doe', email: 'john@example.com' },
       { name: 'Jane Smith', email: 'jane@example.com' },
     ];
     
     it('renders table with data', () => {
       render(<DataTable columns={mockColumns} data={mockData} />);
       
       expect(screen.getByText('John Doe')).toBeInTheDocument();
       expect(screen.getByText('jane@example.com')).toBeInTheDocument();
     });
     
     it('calls onRowClick when row is clicked', () => {
       const handleRowClick = jest.fn();
       render(
         <DataTable 
           columns={mockColumns} 
           data={mockData} 
           onRowClick={handleRowClick}
         />
       );
       
       const firstRow = screen.getByText('John Doe').closest('tr');
       fireEvent.click(firstRow);
       
       expect(handleRowClick).toHaveBeenCalledWith(mockData[0]);
     });
   });

**API Service Testing:**

.. code-block:: javascript

   // src/services/__tests__/auth.test.js
   import { authService } from '../auth';
   import buildlyAPI from '../buildly';
   
   jest.mock('../buildly');
   
   describe('authService', () => {
     beforeEach(() => {
       localStorage.clear();
       jest.clearAllMocks();
     });
     
     it('logs in successfully', async () => {
       const mockResponse = {
         data: {
           access_token: 'mock-token',
           refresh_token: 'mock-refresh',
           user: { id: 1, username: 'testuser' },
         },
       };
       
       buildlyAPI.post.mockResolvedValue(mockResponse);
       
       const result = await authService.login('testuser', 'password');
       
       expect(result.success).toBe(true);
       expect(localStorage.getItem('access_token')).toBe('mock-token');
     });
   });

Build and Deployment
--------------------

Production Build
~~~~~~~~~~~~~~~~

**Build Configuration:**

.. code-block:: bash

   # Build for production
   npm run build
   
   # Output is in build/ directory
   # - Minified and optimized
   # - Source maps for debugging
   # - Static assets with cache busting

**Environment-Specific Builds:**

.. code-block:: bash

   # Development
   npm run build:dev
   
   # Staging
   npm run build:staging
   
   # Production
   npm run build:prod

**package.json scripts:**

.. code-block:: json

   {
     "scripts": {
       "start": "react-scripts start",
       "build": "react-scripts build",
       "build:dev": "REACT_APP_ENV=development npm run build",
       "build:staging": "REACT_APP_ENV=staging npm run build",
       "build:prod": "REACT_APP_ENV=production npm run build",
       "test": "react-scripts test",
       "test:coverage": "react-scripts test --coverage --watchAll=false"
     }
   }

Performance Optimization
------------------------

Code Splitting
~~~~~~~~~~~~~~

**Lazy Loading Routes:**

.. code-block:: jsx

   import React, { lazy, Suspense } from 'react';
   import { CircularProgress, Box } from '@mui/material';
   
   // Lazy load pages
   const Dashboard = lazy(() => import('../pages/Dashboard'));
   const Profile = lazy(() => import('../pages/Profile'));
   
   const LoadingFallback = () => (
     <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
       <CircularProgress />
     </Box>
   );
   
   const AppRoutes = () => {
     return (
       <Suspense fallback={<LoadingFallback />}>
         <Routes>
           <Route path="/dashboard" element={<Dashboard />} />
           <Route path="/profile" element={<Profile />} />
         </Routes>
       </Suspense>
     );
   };

**Component Memoization:**

.. code-block:: jsx

   import React, { memo, useMemo, useCallback } from 'react';
   
   const ExpensiveComponent = memo(({ data, onItemClick }) => {
     // Component only re-renders when data or onItemClick changes
     
     const processedData = useMemo(() => {
       return data.map(item => ({
         ...item,
         processed: heavyComputation(item)
       }));
     }, [data]);
     
     const handleClick = useCallback((item) => {
       onItemClick(item);
     }, [onItemClick]);
     
     return (
       <div>
         {processedData.map(item => (
           <div key={item.id} onClick={() => handleClick(item)}>
             {item.name}
           </div>
         ))}
       </div>
     );
   });

Best Practices
--------------

Code Organization
~~~~~~~~~~~~~~~~~

✅ **DO:**

- Use functional components with hooks
- Implement proper TypeScript types
- Keep components under 250 lines
- Use meaningful component names
- Organize by feature for large apps
- Implement proper error boundaries
- Use environment variables for config

❌ **DON'T:**

- Mix business logic with UI code
- Use inline styles (use theme)
- Commit API keys or secrets
- Ignore PropTypes/TypeScript
- Nest components too deeply
- Fetch data in render methods

Accessibility
~~~~~~~~~~~~~

- Use semantic HTML elements
- Add ARIA labels where needed
- Ensure keyboard navigation works
- Maintain proper heading hierarchy
- Provide text alternatives for images
- Use sufficient color contrast
- Test with screen readers

Security
~~~~~~~~

- Sanitize user inputs
- Implement CSRF protection
- Use HTTPOnly cookies for tokens
- Validate on both client and server
- Keep dependencies updated
- Implement rate limiting
- Use Content Security Policy

Next Steps
----------

**Further Reading:**

- :doc:`/design/responsive` - Responsive design guidelines
- :doc:`/backend/api-development` - API integration patterns
- :doc:`/deployment/docker` - Deployment strategies

**External Resources:**

- `React Documentation <https://react.dev/>`_
- `Material-UI Documentation <https://mui.com/>`_
- `Buildly React Template Repository <https://github.com/buildlyio/buildly-react-template>`_

**Video Resources:**

- `Buildly YouTube Channel <https://www.youtube.com/@buildlyio>`_ - Frontend development tutorials and demos
- `OpenBuild YouTube Channel <https://www.youtube.com/@openbuild7609>`_ - Additional frontend development guides

**Community:**

- Join the Buildly Slack community
- Contribute to GitHub repositories
- Share your implementations

.. note::
   This guide is continuously updated. Check the GitHub repository for the latest examples and templates.
