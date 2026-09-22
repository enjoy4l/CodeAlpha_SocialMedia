Pulse
A mini social media app. Users can sign up, create posts, follow other users, like and comment on posts, and see a personalized feed of people they follow.

🔗 Live app: https://code-alpha-social-media-beta.vercel.app/
🔗 Live API: https://codealpha-socialmedia-o22w.onrender.com
Features

- Authentication — signup/login with hashed passwords (bcrypt) and JWT-based sessions
- Profiles — bio, avatar, follower/following counts, viewable for any user
- Posts — create and view posts with text and optional image URL
- Follow system — follow/unfollow other users, with live count updates
- Personalized feed — see posts from people you follow, with a global feed fallback for new accounts
- Likes — toggle like/unlike on posts with live count updates
- Comments — comment on posts, shown with the commenter's username

Tech Stack

Frontend
- React (Vite)
- Tailwind CSS
- React Router
- Axios

Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT for authentication
- bcrypt.js for password hashing

Deployment
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

Project Structure

```
├── client/          # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── pages/       # Home, Signup, Login, Profile
│   │   └── components/  # Navbar, etc.
│   └── package.json
│
├── server/          # Express backend
│   ├── models/          # User, Post
│   ├── routes/           # auth, users, posts
│   ├── middleware/       # JWT auth middleware
│   ├── index.js
│   └── package.json
│
└── package.json     # Root script to run both together (concurrently)
```

Running Locally

Prerequisites: Node.js, a MongoDB Atlas connection string (or local MongoDB)

1. Clone the repo:
   ```bash
   git clone https://github.com/enjoy4l/CodeAlpha_SocialMedia.git
   cd CodeAlpha_SocialMedia
   ```

2. Set up backend environment variables — create `server/.env`:
   ```
   MONGO_URI=y  our_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   PORT=5000
   ```

3. Set up frontend environment variables — create `client/.env`:
   ```
   VITE_API_URL=http://localhost:5000
   ```

4. Install dependencies (root, server, and client):
   ```bash
   npm install
   npm install --prefix server
   npm install --prefix client
   ```

5. Run both server and client together:
   ```bash
   npm run dev
   ```

   The client runs on `http://localhost:5173` (or the next available port) and the API on `http://localhost:5000`.

API Overview

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Create a new account |
| POST | `/api/auth/login` | Log in and receive a JWT |
| GET | `/api/users/:id` | Get a user's profile |
| POST | `/api/users/:id/follow` | Follow a user |
| POST | `/api/users/:id/unfollow` | Unfollow a user |
| GET | `/api/posts` | Get the feed (follow-aware if authenticated) |
| POST | `/api/posts` | Create a new post |
| POST | `/api/posts/:id/like` | Toggle like on a post |
| POST | `/api/posts/:id/comment` | Add a comment to a post |

## About

Built as part of the [CodeAlpha](https://www.codealpha.tech) Full Stack Development internship.
