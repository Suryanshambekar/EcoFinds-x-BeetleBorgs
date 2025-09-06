# EcoFinds - Sustainable Marketplace Platform

![EcoFinds Logo](Frontend/src/assets/environmental_logo.svg)

EcoFinds is a sustainable marketplace platform that promotes environmental consciousness by enabling users to buy and sell second-hand items. The platform tracks CO2 savings and encourages sustainable consumption practices through a modern, user-friendly interface.

## 🌱 Project Overview

EcoFinds is a full-stack web application built with React and Node.js that connects buyers and sellers in a sustainable marketplace. The platform emphasizes environmental impact by tracking CO2 savings for each transaction, promoting the circular economy and reducing waste.

### Key Features

- **User Authentication**: Secure OTP-based login system with JWT tokens
- **Product Management**: Create, update, and manage product listings with image uploads
- **Shopping Cart**: Add items to cart with quantity management
- **Order Management**: Complete order processing with status tracking
- **CO2 Tracking**: Environmental impact measurement for each purchase
- **Image Upload**: Multiple image support for product listings
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic cart count and status updates

## 🏗️ Architecture

### Frontend (React)
- **Framework**: React 19.1.1 with React Router DOM
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios for API communication
- **Styling**: CSS with responsive design
- **Authentication**: JWT token-based with local storage

### Backend (Node.js)
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + OTP verification system
- **File Upload**: Multer for image handling
- **Email Service**: Nodemailer for OTP delivery
- **Security**: bcrypt for password hashing, CORS enabled

## 📁 Project Structure

```
EcoFinds X BeetleBorgs/
├── Backend/                    # Node.js API Server
│   ├── middleware/            # Authentication & upload middleware
│   ├── models/               # MongoDB schemas
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Cart.js
│   │   ├── Order.js
│   │   └── Otp.js
│   ├── routes/               # API endpoints
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── cart.js
│   │   ├── orders.js
│   │   └── upload.js
│   ├── utils/                # Utility functions
│   │   └── mailer.js
│   ├── uploads/              # Uploaded images
│   ├── server.js             # Main server file
│   ├── package.json
│   └── API_DOCUMENTATION.md
├── Frontend/                  # React Application
│   ├── public/               # Static assets
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── Navbar.js
│   │   │   ├── ProductCard.js
│   │   │   └── Modal.js
│   │   ├── pages/            # Page components
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   ├── AddProduct.js
│   │   │   ├── MyListings.js
│   │   │   ├── Cart.js
│   │   │   └── Purchases.js
│   │   ├── utils/            # Utility functions
│   │   │   └── storage.js
│   │   ├── api.js            # API configuration
│   │   ├── App.js            # Main app component
│   │   └── styles.css        # Global styles
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git**

### Backend Setup

1. **Navigate to Backend directory**
   ```bash
   cd Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the Backend directory:
   ```env
   # Database
   MONGO_URI=mongodb://localhost:27017/ecofinds
   # or for MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/ecofinds

   # JWT
   JWT_SECRET=your_jwt_secret_key_here

   # Email Configuration (for OTP)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Server
   PORT=4000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

   The API server will run on `http://localhost:4000`

### Frontend Setup

1. **Navigate to Frontend directory**
   ```bash
   cd Frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   The React app will run on `http://localhost:3000`

### Database Setup

1. **Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - The application will automatically create the database and collections

2. **MongoDB Atlas (Cloud)**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Update the `MONGO_URI` in your `.env` file

## 🔧 Configuration

### Email Setup (for OTP functionality)

1. **Gmail Setup**
   - Enable 2-factor authentication on your Gmail account
   - Generate an App Password
   - Use the App Password in your `.env` file

2. **Other Email Providers**
   - Update the SMTP configuration in `Backend/utils/mailer.js`
   - Adjust the email template as needed

### File Upload Configuration

- **Upload Directory**: `Backend/uploads/`
- **File Size Limit**: 5MB per file
- **Supported Formats**: JPEG, JPG, PNG, GIF, WebP
- **Multiple Files**: Up to 5 images per product

## 📱 Usage

### User Registration & Login

1. **Sign Up**: Create a new account with email verification
2. **Login**: Use email/password with OTP verification
3. **Profile**: Manage your account settings

### Product Management

1. **Add Product**: Upload images, set price, add description
2. **My Listings**: View and manage your products
3. **Edit/Delete**: Update product information or remove listings

### Shopping Experience

1. **Browse Products**: Search and filter by category
2. **Add to Cart**: Select items and quantities
3. **Checkout**: Complete purchase with shipping details
4. **Track Orders**: Monitor order status and history

### Environmental Impact

- **CO2 Tracking**: Each purchase shows environmental savings
- **Sustainability Metrics**: View your contribution to the circular economy
- **Impact Dashboard**: Track your environmental footprint

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/verify-otp` - Verify OTP and get token

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update/:itemId` - Update item quantity
- `DELETE /api/cart/remove/:itemId` - Remove item from cart
- `POST /api/cart/checkout` - Process checkout

### Orders
- `GET /api/orders` - Get order history
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

### File Upload
- `POST /api/upload/image` - Upload single image
- `POST /api/upload/images` - Upload multiple images
- `GET /upload/:filename` - Serve uploaded images

For detailed API documentation, see `Backend/API_DOCUMENTATION.md`

## 🛠️ Development

### Available Scripts

**Backend:**
```bash
npm start      # Start production server
npm run dev    # Start development server with nodemon
```

**Frontend:**
```bash
npm start      # Start development server
npm build      # Build for production
npm test       # Run tests
npm eject      # Eject from Create React App
```

### Code Structure

- **Components**: Reusable UI components in `Frontend/src/components/`
- **Pages**: Main application pages in `Frontend/src/pages/`
- **Models**: Database schemas in `Backend/models/`
- **Routes**: API endpoints in `Backend/routes/`
- **Middleware**: Authentication and upload handling in `Backend/middleware/`

## 🚀 Deployment

### Backend Deployment

1. **Environment Variables**: Set production environment variables
2. **Database**: Use MongoDB Atlas for production
3. **File Storage**: Consider cloud storage for uploaded images
4. **Process Manager**: Use PM2 for production process management

### Frontend Deployment

1. **Build**: Run `npm run build` to create production build
2. **Static Hosting**: Deploy to Netlify, Vercel, or similar
3. **Environment**: Update API endpoints for production

### Docker Deployment (Optional)

Create `Dockerfile` for both frontend and backend for containerized deployment.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the package.json files for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation in `Backend/API_DOCUMENTATION.md`
- Review the code comments for implementation details

## 🌟 Features Roadmap

- [ ] Advanced search and filtering
- [ ] User reviews and ratings
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Payment integration
- [ ] Social sharing
- [ ] Environmental impact analytics
- [ ] Seller verification system

---

**EcoFinds** - Making sustainability accessible through technology 🌱