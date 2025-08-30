# BlogHub - Modern Blogging Platform

A beautiful, modern blogging platform with user authentication, blog creation, and admin approval system.

## ✨ Features

### 🎨 **Beautiful Modern UI**

- Gradient backgrounds with glassmorphism effects
- Smooth animations and hover effects
- Responsive design for all devices
- Clean, intuitive interface

### 👥 **User Management**

- **Users**: Can create and publish blog posts (pending approval)
- **Admins**: Can approve/reject pending blogs and manage content
- Secure JWT authentication
- Role-based access control

### 📝 **Blog Management**

- Create rich blog posts with title and content
- Character count indicators for better UX
- Real-time status updates
- Tab-based navigation for different blog states

### 🛡️ **Content Moderation**

- All user blogs require admin approval
- Admins can approve or reject pending blogs
- Clean separation between published and pending content

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd vibeHack
   ```

2. **Install Backend Dependencies**

   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**

   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/bloghub
   JWT_SECRET=your-super-secret-jwt-key
   ```

### Running the Application

1. **Start the Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

   Server will run on `http://localhost:5000`

2. **Start the Frontend (in a new terminal)**
   ```bash
   cd frontend
   npm start
   ```
   Frontend will run on `http://localhost:3000`

## 🎯 How to Use

### 1. **Welcome Page**

- Beautiful landing page with features showcase
- Call-to-action buttons for signup/login
- Stats display and feature highlights

### 2. **User Registration**

- Choose between User or Admin role
- Password validation (minimum 6 characters)
- Success feedback with auto-redirect

### 3. **User Login**

- Email and password authentication
- Loading states and error handling
- Automatic role detection

### 4. **Home Dashboard**

#### **For Users:**

- **Create Blog Posts**: Use the intuitive form with character counters
- **View Published Blogs**: See all approved blogs from all users
- **Track Pending Blogs**: Monitor your blogs awaiting approval
- **Tab Navigation**: Switch between approved and pending blogs

#### **For Admins:**

- **Approve/Reject Blogs**: Review and moderate user submissions
- **Manage Content**: Full control over what gets published
- **View All Content**: Access to both published and pending blogs
- **Bulk Actions**: Efficiently process multiple blog approvals

## 🎨 UI Features

### **Modern Design Elements**

- **Glassmorphism**: Translucent cards with backdrop blur
- **Gradient Backgrounds**: Beautiful purple-blue gradients
- **Smooth Animations**: Hover effects and transitions
- **Status Badges**: Color-coded blog status indicators
- **Loading States**: Professional loading overlays
- **Toast Messages**: Success/error notifications with close buttons

### **Responsive Design**

- **Mobile-First**: Optimized for all screen sizes
- **Tablet Support**: Perfect layout for medium screens
- **Desktop Enhanced**: Full-featured experience on large screens

### **Accessibility Features**

- High contrast text for readability
- Keyboard navigation support
- Screen reader friendly structure
- Focus indicators for interactive elements

## 🔧 Technical Stack

### **Frontend**

- **React 19**: Latest React with modern hooks
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **CSS3**: Modern CSS with animations and gradients

### **Backend**

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database with Mongoose ODM
- **JWT**: Authentication tokens
- **bcrypt**: Password hashing

## 📱 User Flows

### **User Journey**

1. **Welcome** → **Sign Up** → **Login** → **Home Dashboard**
2. **Create Blog** → **View in Pending** → **Admin Approval** → **Published**

### **Admin Journey**

1. **Login** → **Home Dashboard** → **Pending Blogs Tab**
2. **Review Content** → **Approve/Reject** → **Content Goes Live**

## 🎨 Color Scheme

- **Primary Gradient**: `#667eea` to `#764ba2`
- **Success**: `#51cf66` to `#40c057`
- **Error**: `#ff6b6b` to `#ee5a24`
- **Warning**: `#ffd43b` to `#fab005`
- **Text**: `#374151` (dark) / `#6b7280` (medium) / `#9ca3af` (light)

## 🚀 Future Enhancements

- Rich text editor for blog content
- Image upload functionality
- Blog categories and tags
- User profiles and avatars
- Comment system
- Like/reaction system
- Search and filtering
- Email notifications
- Dark mode toggle

## 📞 Support

For any issues or questions, please check the console logs for detailed error messages. The application includes comprehensive error handling and user feedback.

---

**Enjoy your beautiful blogging experience with BlogHub!** ✨
