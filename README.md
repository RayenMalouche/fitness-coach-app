# Fitness Coach Application

A full-stack web application for fitness coaches to manage clients, sessions, meal plans, and track progress through photo uploads.

## 🚀 Tech Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- React Calendar for session booking

**Backend:**
- Node.js with Express.js
- PostgreSQL database
- Prisma ORM
- JWT authentication
- Bcrypt for password hashing
- Multer for file uploads

## 📋 Features

### For Coaches:
- ✅ Approve/reject client registrations
- ✅ Set and manage session credits for each client
- ✅ Create available session time slots
- ✅ Approve/reject session bookings
- ✅ Create and assign meal plans to clients
- ✅ View photos uploaded by clients
- ✅ Comprehensive dashboard with all client information

### For Clients:
- ✅ Register and wait for coach approval
- ✅ View remaining session credits
- ✅ Book available session slots (limited by credits)
- ✅ View assigned meal plans
- ✅ Upload meal photos with captions
- ✅ Track booking status (pending/approved/rejected)

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/RayenMalouche/fitness-coach-app.git
cd fitness-coach-app
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/fitness_coach?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=5000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
```

Initialize the database:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

Seed the database with demo accounts:
```bash
npm run prisma:seed
```

This creates:
- **Coach Account:** coach@example.com / password123
- **Client Account:** client@example.com / password123 (pre-approved with 10 credits)

Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the frontend directory (optional):
```env
VITE_API_URL=http://localhost:5000/api
```

Start the frontend development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 🎯 Usage

### First Time Setup

1. **Access the application** at `http://localhost:5173`

2. **Login as Coach:**
   - Email: `coach@example.com`
   - Password: `password123`
   - You'll see the coach dashboard with tabs for Clients, Sessions, Meals, and Photos

3. **Login as Client:**
   - Email: `client@example.com`
   - Password: `password123`
   - You'll see the client dashboard with booking calendar, meal plans, and photo upload

### Coach Workflow

1. **Manage Clients:**
   - View pending client registrations
   - Approve or reject new clients
   - Set session credits for approved clients

2. **Manage Sessions:**
   - Create available time slots
   - View and approve/reject booking requests
   - Delete unused time slots

3. **Meal Plans:**
   - Create meal plans with title, description, and optional image
   - Assign specific dates to each meal
   - View all meals by client

4. **Monitor Progress:**
   - View photos uploaded by clients
   - See captions and timestamps
   - Track client progress over time

### Client Workflow

1. **After Approval:**
   - View your session credits
   - See today's meal plans
   - Access the booking calendar

2. **Book Sessions:**
   - Browse available time slots
   - Book sessions (deducts 1 credit upon approval)
   - Track booking status

3. **Track Meals:**
   - View assigned meal plans
   - Upload photos of meals
   - Add captions to photos

## 📁 Project Structure

```
fitness-coach-app/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Business logic
│   │   ├── middleware/       # Auth & role checks
│   │   ├── routes/           # API routes
│   │   ├── uploads/          # Uploaded images
│   │   ├── utils/            # Utility functions
│   │   └── server.js         # Express server
│   ├── prisma/
│   │   └── schema.prisma     # Database schema
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Page components
│   │   ├── services/         # API service layer
│   │   ├── App.jsx           # Main app component
│   │   └── main.jsx          # Entry point
│   ├── package.json
│   └── .env
│
└── README.md
```
## 📸 Screenshots

Below are some key screens from the application to give you a quick visual overview.

### **Login Screen**
![Login Screen](./screenshots/login.png)

### **Register Screen**
![Register Screen](./screenshots/register.png)

### **Approval Pending (Client View)**
![Approval Pending](./screenshots/pending%20approval%20after%20registration.png)

### **Client Dashboard**
![Client Dashboard](./screenshots/client%20dashboard.png)

### **Client Dashboard with Uploaded Photo**
![Client Uploaded Photo](./screenshots/booking.png)

### **Coach Dashboard – Clients Tab**
![Coach Clients](./screenshots/pending%20account%20approvals.png)

### **Coach Dashboard – Sessions Tab**
![Coach Sessions](./screenshots/creating%20available%20session%20dates.png)

### **Coach Dashboard – Meal Plans Tab**
![Coach Meal Plans](./screenshots/meal%20plan%20created%20for%20a%20client.png)

### **Empty Meal Plan View**
![Empty Meal Plan](./screenshots/empty%20meal%20plan.png)

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile

### Clients (Coach Only)
- `GET /api/clients` - Get all clients
- `GET /api/clients/:clientId` - Get client details
- `POST /api/clients/:clientId/approve` - Approve client
- `DELETE /api/clients/:clientId/reject` - Reject client
- `PUT /api/clients/:clientId/credits` - Update client credits
- `GET /api/clients/:clientId/credits` - Get client credits

### Sessions
- `POST /api/sessions/available` - Create available session (Coach)
- `GET /api/sessions/available` - Get available sessions
- `DELETE /api/sessions/available/:sessionId` - Delete session (Coach)
- `POST /api/sessions/:sessionId/book` - Book session (Client)
- `GET /api/sessions/bookings/my` - Get own bookings (Client)
- `GET /api/sessions/bookings/pending` - Get pending bookings (Coach)
- `POST /api/sessions/bookings/:bookingId/approve` - Approve booking (Coach)
- `POST /api/sessions/bookings/:bookingId/reject` - Reject booking (Coach)

### Meals
- `POST /api/meals` - Create meal (Coach)
- `GET /api/meals/my` - Get own meals (Client)
- `GET /api/meals/today` - Get today's meals (Client)
- `GET /api/meals/client/:clientId` - Get client meals (Coach)
- `PUT /api/meals/:mealId` - Update meal (Coach)
- `DELETE /api/meals/:mealId` - Delete meal (Coach)

### Photos
- `POST /api/photos/upload` - Upload photo (Client)
- `GET /api/photos/my` - Get own photos (Client)
- `GET /api/photos/client/:clientId` - Get client photos (Coach)
- `GET /api/photos/all` - Get all photos (Coach)
- `DELETE /api/photos/:photoId` - Delete photo

## 🚢 Deployment

### Backend Deployment
1. Set up a PostgreSQL database (e.g., on Railway, Heroku, or AWS RDS)
2. Set environment variables on your hosting platform
3. Run migrations: `npx prisma migrate deploy`
4. Deploy to platforms like Heroku, Railway, or AWS

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy to Vercel, Netlify, or any static hosting
3. Update API URL in environment variables

## 🔐 Security Considerations

- JWT tokens expire after 7 days
- Passwords are hashed with bcrypt (10 rounds)
- Role-based access control on all routes
- File upload validation (images only, 5MB limit)
- SQL injection protection via Prisma ORM

## 🎨 Customization

### Adding Exercise Videos (Future Feature)
The structure is ready for expansion. To add exercise videos:

1. **Add to Prisma Schema:**
```prisma
model ExerciseVideo {
  id          String   @id @default(uuid())
  title       String
  description String
  videoUrl    String
  duration    Int
  difficulty  String
  createdAt   DateTime @default(now())
}
```

2. **Create controllers and routes** similar to meals
3. **Add UI components** in the coach dashboard

### Styling Customization
- Modify `tailwind.config.js` to change color schemes
- Update component styles in individual `.jsx` files
- All colors use Tailwind's primary palette for easy theming

## 📝 Database Schema

See `backend/prisma/schema.prisma` for complete database structure including:
- Users (Coach & Client roles)
- Session Credits
- Available Sessions
- Session Bookings
- Meals
- Meal Photos

## 🐛 Troubleshooting

**Database Connection Issues:**
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists: `createdb fitness_coach`

**Port Already in Use:**
- Backend: Change PORT in backend/.env
- Frontend: Vite will prompt for alternate port

**File Upload Issues:**
- Check `backend/src/uploads` directory exists
- Verify file permissions
- Ensure multer configuration is correct

## 📄 License

MIT License - feel free to use for personal or commercial projects.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ for fitness coaches and their clients.