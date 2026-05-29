# 📸 Instagram Clone

A full-stack Instagram Clone built using the MERN Stack that provides core Instagram functionalities such as user authentication, post creation, stories, messaging, notifications, profile management, and real-time communication using Socket.IO.

## 🚀 Features

### 👤 User Authentication
- User Registration
- User Login
- JWT Authentication
- Protected Routes

### 🖼️ Posts
- Create Posts
- Upload Images
- Like/Unlike Posts
- Comment on Posts
- Delete Posts

### 📖 Stories
- Upload Stories
- View Stories
- Automatic Story Management

### 💬 Messaging
- One-to-One Chat
- Real-Time Messaging using Socket.IO
- Conversation Management

### 🔔 Notifications
- Like Notifications
- Comment Notifications
- Follow Notifications

### 👥 User Profile
- View User Profiles
- Update Profile Information
- Upload Profile Picture
- Follow / Unfollow Users

### ⚡ Real-Time Features
- Instant Messaging
- Live Notifications
- Online User Tracking

---

# 🛠️ Tech Stack

## Frontend
- React.js
- Vite
- Redux Toolkit
- React Hooks
- CSS

## Backend
- Node.js
- Express.js

## Database
- MongoDB
- Mongoose

## Authentication
- JWT (JSON Web Token)
- bcryptjs

## Image Upload
- Multer
- Cloudinary

## Real-Time Communication
- Socket.IO

---

# 📂 Project Structure

## Backend

```text
backend/
│
├── controllers/
│
├── middlewares/
│   ├── isAuthenticated.js
│   └── multer.js
│
├── model/
│   ├── user.model.js
│   ├── post.model.js
│   ├── comment.model.js
│   ├── story.model.js
│   ├── notification.model.js
│   ├── conversation.model.js
│   └── message.model.js
│
├── routes/
│   ├── user.route.js
│   ├── post.route.js
│   ├── story.route.js
│   ├── notification.route.js
│   └── message.route.js
│
├── socket/
│   └── socket.js
│
├── utils/
│   ├── cloudinary.js
│   ├── datauri.js
│   └── db.js
│
├── .env
├── index.js
└── package.json
```

## Frontend

```text
frontend/
│
├── public/
├── assets/
│
├── src/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── redux/
│   ├── App.jsx
│   ├── main.jsx
│   ├── App.css
│   └── index.css
│
├── package.json
├── vite.config.js
└── README.md

# ⚙️ Environment Variables

Create a `.env` file inside the backend folder.

```env
PORT=8000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

FRONTEND_URL=http://localhost:5173
```

---

# 🔧 Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/instagram-clone.git
```

```bash
cd instagram-clone
```

---

## Install Backend Dependencies

```bash
cd backend
npm install
```


## Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

# ▶️ Running the Project

## Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on:
http://localhost:8000

## Start Frontend

```bash
cd frontend
npm run dev

Frontend runs on:
http://localhost:5173

# 🗄️ Database Models

### User
- Username
- Email
- Password
- Profile Picture
- Bio
- Followers
- Following

### Post
- Image
- Caption
- Likes
- Comments
- Owner

### Comment
- Text
- User
- Post

### Story
- Story Image
- User
- Created At

### Notification
- Sender
- Receiver
- Type

### Conversation
- Participants

### Message
- Conversation
- Sender
- Message Text

---

# 🔒 Security Features

- JWT Authentication
- Password Hashing
- Protected API Routes
- Middleware-Based Authorization
- Secure File Upload Handling

---

# 📈 Future Improvements

- Reels Feature
- Video Upload Support
- Group Chat
- Voice Messages
- Story Reactions
- Push Notifications
- Dark Mode
---

# 🤝 Contributing

1. Fork the repository

2. Create a new branch

```bash
git checkout -b feature-name
```

3. Commit your changes

```bash
git commit -m "Added new feature"
```

4. Push to GitHub

```bash
git push origin feature-name
```

5. Open a Pull Request

---

# 👨‍💻 Developer

**Samikshya**

MCA Student | MERN Stack Developer

---

# 📜 License

This project is developed for educational and learning purposes.
