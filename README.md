# SendIT - Parcel Tracking System

A comprehensive parcel tracking and management system built with Angular (Frontend) and NestJS (Backend), featuring real-time tracking, user management, and courier operations.

## 🚀 Features

### Core Features
- **Parcel Tracking**: Real-time tracking with status updates and location history
- **User Management**: Multi-role system (User, Admin, Courier)
- **Live Maps**: Interactive maps using Leaflet for parcel route visualization
- **Email Notifications**: Automated email notifications for status updates
- **PDF Receipts**: Generate and download parcel receipts
- **Two-Factor Authentication**: Enhanced security with 2FA support
- **Password Reset**: Secure password reset functionality

### User Features
- **Dashboard**: Overview of sent and received parcels
- **Parcel Management**: Create, view, and manage parcels
- **Real-time Tracking**: Live tracking with map visualization
- **History**: Complete parcel history and activity logs
- **Support System**: Contact support with integrated form

### Admin Features
- **User Management**: Manage all users and their roles
- **Parcel Oversight**: Monitor and manage all parcels
- **Courier Assignment**: Assign couriers to parcels
- **Analytics**: System statistics and performance metrics
- **Bulk Operations**: Mass parcel and user management

### Courier Features
- **Assigned Parcels**: View and manage assigned deliveries
- **Status Updates**: Update parcel status and location
- **Route Optimization**: Efficient delivery route planning
- **Real-time Location**: Update current location for tracking

## 🛠️ Technology Stack

### Frontend
- **Angular 19**: Modern reactive framework
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Leaflet**: Interactive maps and geolocation
- **RxJS**: Reactive programming
- **Angular Router**: Client-side routing

### Backend
- **NestJS**: Progressive Node.js framework
- **Prisma**: Type-safe database ORM
- **PostgreSQL**: Reliable relational database
- **JWT**: Secure authentication
- **Nodemailer**: Email service integration
- **PDFKit**: PDF generation
- **bcrypt**: Password hashing

### Database
- **PostgreSQL**: Primary database
- **Prisma Migrations**: Database schema management
- **Soft Deletes**: Data integrity preservation

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SendIT
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd backend
npm install
```

#### Environment Configuration
Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sendit_db"
JWT_SECRET="your-super-secret-jwt-key"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

#### Database Setup
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database (optional)
npm run db:seed
```

#### Start Backend Server
```bash
# Development mode
npm run start:dev

# Production mode
npm run start:prod
```

The backend will be available at `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd frontend
npm install
```

#### Start Development Server
```bash
# Start with proxy configuration
npm start
```

The frontend will be available at `http://localhost:4200`

## 📁 Project Structure

```
SendIT/
├── backend/                 # NestJS Backend
│   ├── src/
│   │   ├── auth/           # Authentication module
│   │   ├── parcels/        # Parcel management
│   │   ├── users/          # User management
│   │   ├── contact/        # Support system
│   │   ├── email/          # Email service
│   │   └── prisma/         # Database service
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # Database migrations
│   └── restclient/         # API testing files
├── frontend/               # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/      # Admin features
│   │   │   ├── auth/       # Authentication
│   │   │   ├── user/       # User features
│   │   │   ├── landing/    # Landing page
│   │   │   └── shared/     # Shared components
│   │   └── environments/   # Environment config
│   └── proxy.conf.json     # API proxy configuration
└── README.md
```

## 🔐 Authentication & Authorization

### User Roles
- **USER**: Regular users who can send/receive parcels
- **ADMIN**: System administrators with full access
- **COURIER**: Delivery personnel with parcel management access

### JWT Authentication
- Secure token-based authentication
- Role-based access control
- Token refresh mechanism
- Protected routes and endpoints

## 📦 API Endpoints

### Authentication
```
POST /api/auth/register          # User registration
POST /api/auth/login            # User login
POST /api/auth/request-password-reset  # Password reset request
POST /api/auth/reset-password   # Password reset
```

### Parcels
```
GET    /api/parcels/sent        # Get user's sent parcels
GET    /api/parcels/received    # Get user's received parcels
GET    /api/parcels/track/:id   # Track parcel by number
POST   /api/parcels             # Create new parcel (Admin)
PATCH  /api/parcels/:id/status  # Update parcel status
POST   /api/parcels/:id/steps   # Add tracking step
```

### Users
```
GET    /api/users/me            # Get current user profile
PATCH  /api/users/me            # Update user profile
GET    /api/users               # Get all users (Admin)
DELETE /api/users/:id           # Delete user (Admin)
```

### Admin
```
GET    /api/admin/stats         # System statistics
GET    /api/admin/parcels       # All parcels
PATCH  /api/admin/parcels/:id   # Update parcel
```

## 🗄️ Database Schema

### Core Models

#### User
- Basic info (name, email, phone)
- Role-based access (USER, ADMIN, COURIER)
- Notification preferences
- Two-factor authentication settings

#### Parcel
- Sender and receiver relationships
- Status tracking (PENDING, IN_TRANSIT, DELIVERED, etc.)
- Pricing and tracking number
- Current location coordinates
- Estimated delivery date

#### ParcelTrackingStep
- Status updates with timestamps
- Location coordinates
- Detailed descriptions

#### Notification
- User notifications
- Email, SMS, and push notification support
- Read/unread status

## 🗺️ Features in Detail

### Real-time Tracking
- Live location updates
- Interactive map visualization
- Status timeline
- Estimated delivery times
- Route optimization

### Email Notifications
- Welcome emails
- Status update notifications
- Password reset emails
- Courier assignment notifications
- Delivery confirmations

### PDF Generation
- Parcel receipts
- Delivery confirmations
- Tracking information
- Professional formatting

### Map Integration
- Leaflet.js for interactive maps
- Geocoding for address conversion
- Route visualization
- Real-time location updates

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm run test              # Unit tests
npm run test:e2e         # End-to-end tests
npm run test:cov         # Coverage report
```

### Frontend Testing
```bash
cd frontend
npm test                 # Unit tests
```

## 🚀 Deployment

### Backend Deployment
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Build and start the application

### Frontend Deployment
1. Update API endpoints in environment files
2. Build the application: `npm run build`
3. Deploy to your preferred hosting service

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/sendit_db"
JWT_SECRET="your-jwt-secret"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
```

#### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔄 Version History

- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added real-time tracking and maps
- **v1.2.0**: Enhanced admin dashboard and analytics
- **v1.3.0**: Added courier management and 2FA

---

**SendIT** - Making parcel tracking simple and efficient! 📦✨ 