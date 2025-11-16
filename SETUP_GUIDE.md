# Complete Setup Guide - Fitness Coach Application

This guide will walk you through setting up the Fitness Coach application from scratch.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **PostgreSQL** v12 or higher ([Download](https://www.postgresql.org/download/))
- **npm** (comes with Node.js)
- A code editor (VS Code recommended)

## Step-by-Step Setup

### 1. Database Setup

#### Option A: Using PostgreSQL (Recommended for Production)

1. **Install PostgreSQL** if not already installed

2. **Create a new database:**
   ```bash
   # Login to PostgreSQL
   psql -U postgres
   
   # Create database
   CREATE DATABASE fitness_coach;
   
   # Exit
   \q
   ```

3. **Note your connection details:**
   - Host: `localhost`
   - Port: `5432` (default)
   - Database: `fitness_coach`
   - Username: `postgres` (or your username)
   - Password: (your password)

#### Option B: Using SQLite (Quick Development)

For quick local development, you can use SQLite instead:
- In your `.env` file, use: `DATABASE_URL="file:./dev.db"`

### 2. Backend Setup

```bash
# Navigate to backend directory
cd fitness-coach-app/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
```

**Edit `.env` file with your settings:**
```env
DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/fitness_coach?schema=public"
JWT_SECRET="your-random-secret-key-here-make-it-long"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

**Generate a secure JWT_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# Or use any random string generator
```

**Initialize the database:**
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with demo accounts
npm run prisma:seed
```

**Start the backend server:**
```bash
npm run dev
```

You should see:
```
🚀 Server running on port 5000
📍 API available at http://localhost:5000/api
📁 Uploads served at http://localhost:5000/uploads
```

### 3. Frontend Setup

Open a **new terminal window:**

```bash
# Navigate to frontend directory
cd fitness-coach-app/frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

You should see:
```
VITE v5.0.8  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 4. Access the Application

1. **Open your browser** and go to `http://localhost:5173`

2. **Login with demo accounts:**

   **Coach Account:**
   - Email: `coach@example.com`
   - Password: `password123`
   
   **Client Account:**
   - Email: `client@example.com`
   - Password: `password123`

## Troubleshooting

### Port Already in Use

**Backend (Port 5000):**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9  # Mac/Linux
netstat -ano | findstr :5000    # Windows (find PID, then kill)

# Or change port in backend/.env
PORT=5001
```

**Frontend (Port 5173):**
- Vite will automatically suggest an alternative port if 5173 is busy

### Database Connection Issues

**"Connection refused" error:**
1. Ensure PostgreSQL is running:
   ```bash
   # Mac with Homebrew
   brew services start postgresql
   
   # Linux
   sudo service postgresql start
   
   # Windows
   # Use Services app or pgAdmin
   ```

2. Verify connection string in `.env`:
   ```env
   DATABASE_URL="postgresql://USERNAME:PASSWORD@localhost:5432/fitness_coach"
   ```

3. Test connection:
   ```bash
   psql -h localhost -U postgres -d fitness_coach
   ```

**"Database does not exist":**
```bash
createdb fitness_coach
```

### Prisma Migration Issues

**Reset database and start fresh:**
```bash
cd backend
npx prisma migrate reset
npx prisma migrate dev --name init
npm run prisma:seed
```

### File Upload Issues

**Photos not uploading:**
1. Check `backend/src/uploads` directory exists:
   ```bash
   mkdir -p backend/src/uploads
   ```

2. Verify permissions:
   ```bash
   chmod 755 backend/src/uploads
   ```

### Module Not Found Errors

**Backend:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

**Frontend:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

### Viewing the Database

**Option 1: Prisma Studio (Recommended)**
```bash
cd backend
npm run prisma:studio
```
Opens a GUI at `http://localhost:5555` to browse your database

**Option 2: PostgreSQL Command Line**
```bash
psql -U postgres -d fitness_coach

# Common commands:
\dt              # List tables
SELECT * FROM "User";
\q               # Quit
```

### Hot Reload

Both frontend and backend have hot reload enabled:
- **Backend:** Changes restart the server automatically (nodemon)
- **Frontend:** Changes refresh the browser automatically (Vite HMR)

### Clearing Data

**Reset everything:**
```bash
cd backend
npx prisma migrate reset
npm run prisma:seed
```

**Clear just photos:**
```bash
rm -rf backend/src/uploads/*
```

## Environment Variables Reference

### Backend (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `PORT` | Backend server port | `5000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Frontend (.env - Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000/api` |

## Testing the Application

### 1. Test Coach Features

1. Login as coach
2. Go to "Clients" tab
3. Approve the demo client
4. Set credits (e.g., 10 sessions)
5. Go to "Sessions" tab
6. Create available session slots
7. Go to "Meals" tab
8. Select a client and create meal plans

### 2. Test Client Features

1. Login as client
2. View dashboard with credits
3. Click calendar dates with available sessions
4. Book a session
5. View meals in "Today's Meals"
6. Upload a meal photo

### 3. Test Approval Flow

1. Register a new client account
2. Login as coach
3. See pending client in "Clients" tab
4. Approve the client
5. Set credits for the new client

## Next Steps

### Customization

1. **Branding:**
   - Update colors in `frontend/tailwind.config.js`
   - Change app name in `frontend/index.html`

2. **Email Notifications:**
   - Add email service (SendGrid, Mailgun)
   - Send notifications for bookings, approvals, etc.

3. **Payment Integration:**
   - Add Stripe/PayPal for credit purchases
   - Auto-assign credits after payment

4. **Exercise Videos:**
   - Follow pattern in README.md
   - Add video model and components

### Production Deployment

See README.md "Deployment" section for:
- Backend deployment (Railway, Heroku, AWS)
- Frontend deployment (Vercel, Netlify)
- Database hosting (Railway, Heroku Postgres, AWS RDS)

## Getting Help

### Common Issues

1. **"Cannot find module"** - Run `npm install` in respective directory
2. **"Port in use"** - Change port or kill process
3. **"Database connection failed"** - Check PostgreSQL is running
4. **"Invalid token"** - Logout and login again
5. **"Photos not loading"** - Check uploads directory exists

### Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Express Docs](https://expressjs.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Need More Help?

- Check the main README.md file
- Review code comments in source files
- Open an issue on GitHub

## Success Checklist

- [ ] PostgreSQL installed and running
- [ ] Backend dependencies installed
- [ ] Database created and migrated
- [ ] Demo accounts seeded
- [ ] Backend server running on port 5000
- [ ] Frontend dependencies installed
- [ ] Frontend server running on port 5173
- [ ] Can login as coach
- [ ] Can login as client
- [ ] Can approve clients
- [ ] Can create sessions
- [ ] Can book sessions
- [ ] Can create meals
- [ ] Can upload photos

If all items are checked, you're all set! 🎉