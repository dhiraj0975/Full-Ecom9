# Customer Frontend - Authentication

A modern React frontend for customer authentication with beautiful UI and responsive design.

## Features

- ✅ **Modern UI/UX** - Clean, responsive design with Tailwind CSS
- ✅ **User Registration** - Complete registration form with validation
- ✅ **User Login** - Secure login with JWT token
- ✅ **Protected Routes** - Route protection based on authentication status
- ✅ **Responsive Design** - Works on mobile, tablet, and desktop
- ✅ **Form Validation** - Client-side validation with error handling
- ✅ **Loading States** - Beautiful loading indicators
- ✅ **Error Handling** - User-friendly error messages

## Tech Stack

- **React 18** - Modern React with hooks
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The application will start on `http://localhost:5173`

### 3. Build for Production
```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   └── common/
│       └── Header.jsx          # Navigation header
├── pages/
│   ├── auth/
│   │   ├── Login.jsx           # Login page
│   │   └── Register.jsx        # Registration page
│   └── Home.jsx                # Home page
├── App.jsx                     # Main app component
├── index.jsx                   # Entry point
└── index.css                   # Global styles
```

## API Integration

The frontend connects to your backend API running on `http://localhost:5002`:

### Authentication Endpoints:
- `POST /api/customers/register` - User registration
- `POST /api/customers/login` - User login

### Features:
- **JWT Token Storage** - Tokens stored in localStorage
- **Automatic Redirects** - Redirects based on auth status
- **Error Handling** - Displays API errors to users
- **Loading States** - Shows loading during API calls

## Pages

### 1. Home Page (`/`)
- Welcome message
- Different content for logged-in vs guest users
- Call-to-action buttons

### 2. Login Page (`/login`)
- Email and password fields
- Password visibility toggle
- Form validation
- Error handling
- Link to registration

### 3. Register Page (`/register`)
- Complete registration form
- Password confirmation
- Address fields
- Form validation
- Success/error messages

## Authentication Flow

1. **Guest User** → Can access home page and auth pages
2. **Registration** → Creates account, redirects to login
3. **Login** → Authenticates user, stores token
4. **Logged-in User** → Can access protected features
5. **Logout** → Clears token, redirects to home

## Styling

- **Tailwind CSS** for utility-first styling
- **Custom CSS** for specific components
- **Responsive design** for all screen sizes
- **Smooth transitions** and hover effects
- **Modern color scheme** with blue primary color

## Development

### Available Scripts:
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables:
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5002
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
