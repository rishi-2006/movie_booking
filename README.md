# 🎬 CineBook — Movie Ticket Booking Website

CineBook is a modern, responsive movie ticket booking website built using **Angular, TypeScript, Node.js, and Express.js**. It provides an interactive cinema booking experience with movie discovery, showtime selection, seat booking, digital tickets, booking history, and an administrative dashboard.

The project uses **JSON files for persistent data storage**, making it suitable for learning, academic projects, and local demonstrations without requiring a database.

## ✨ Features

### 🎥 Movie Discovery
- Browse movies currently showing and upcoming releases.
- Search movies by title.
- Filter movies by genre and language.
- Sort movies by rating.
- View movie posters, descriptions, ratings, and duration.

### 🎟️ Ticket Booking
- Select a movie, cinema, date, and showtime.
- Interactive cinema seat-selection interface.
- View available, selected, and booked seats.
- Automatically calculate ticket prices.
- Validate customer information before booking.
- Generate a unique booking ID.
- Display a digital ticket after successful booking.
- Print booking confirmations.

### 📋 My Bookings
- Retrieve bookings using a booking ID and email address.
- View movie, cinema, showtime, and seat information.
- Check booking status.

### 🛠️ Admin Dashboard
- Administrator authentication.
- Add, edit, and delete movies.
- View booking information.
- View booking statistics.
- Manage cinema and showtime information, where implemented.

### 🎨 Modern UI/UX
- Premium cinema-inspired dark theme.
- Responsive layout for desktop, tablet, and mobile.
- Movie poster cards and interactive elements.
- Form validation and error messages.
- Loading indicators and booking feedback.

## 🧰 Technology Stack

| Component | Technology |
|---|---|
| Frontend | Angular |
| Programming Language | TypeScript |
| UI | HTML and CSS |
| Routing | Angular Router |
| API Communication | Angular HttpClient |
| Backend | Node.js |
| Backend Framework | Express.js |
| API Architecture | REST API |
| Data Storage | JSON files |
| Authentication | JWT and password hashing, where configured |
| Version Control | Git and GitHub |

## 📁 Project Structure

```text
movie_booking/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── environments/
│   ├── public/
│   ├── angular.json
│   ├── package.json
│   └── tsconfig.json
│
├── backend/
│   ├── data/
│   │   ├── movies.json
│   │   ├── cinemas.json
│   │   ├── shows.json
│   │   ├── bookings.json
│   │   └── users.json
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── repositories/
│   │   ├── routes/
│   │   └── services/
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── .gitignore
└── README.md
```

*Note: The exact directory structure may vary slightly depending on the project implementation.*

## ⚙️ Prerequisites

Install the following before running CineBook:

- Node.js with npm.
- Angular CLI compatible with your Angular version.
- Visual Studio Code or another code editor.
- Git (optional, for version control).

Check your installations:

```bash
node -v
npm -v
git --version
```

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/rishi-2006/movie_booking.git
cd movie_booking
```

### 2. Install Frontend Dependencies

Open a terminal in the project root and run:

```bash
cd frontend
npm install
```

### 3. Install Backend Dependencies

Open another terminal in the project root and run:

```bash
cd backend
npm install
```

### 4. Configure Environment Variables

Inside the `backend` folder, create a `.env` file using `.env.example` as a reference.

For example, PowerShell users can run:

```powershell
Copy-Item .env.example .env
```

Configure the required environment variables according to the backend implementation.

Typical settings may include:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret
```

Use the actual variable names expected by your backend code. If the project uses additional variables, configure them as well.

**Security:** Never commit `.env` files, real passwords, or authentication secrets to GitHub.

### 5. Start the Backend

Open a terminal:

```bash
cd backend
npm run dev
```

If the project does not define a development script, use:

```bash
npm start
```

The backend should run at:

http://localhost:5000

Check the health endpoint, if implemented:

http://localhost:5000/api/health

### 6. Start the Angular Frontend

Open a second terminal:

```bash
cd frontend
npm start
```

If there is no `start` script, run:

```bash
npx ng serve
```

Open your browser at:

http://localhost:4200

Keep both the frontend and backend terminals running while using the application.

## 🔌 API Overview

The backend provides REST APIs for communication between Angular and Express.

The following endpoints describe the intended API structure; verify the implemented routes in the backend source code.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Check backend status |
| GET | `/api/movies` | Retrieve movies |
| GET | `/api/movies/:id` | Retrieve movie details |
| POST | `/api/movies` | Add a movie |
| PUT | `/api/movies/:id` | Update a movie |
| DELETE | `/api/movies/:id` | Delete a movie |
| GET | `/api/cinemas` | Retrieve cinemas |
| GET | `/api/shows` | Retrieve showtimes |
| GET | `/api/shows/:id/seats` | Retrieve seat availability |
| POST | `/api/bookings` | Create a booking |
| POST | `/api/bookings/lookup` | Retrieve a booking |
| GET | `/api/bookings` | Retrieve bookings for an authorized administrator |
| POST | `/api/auth/login` | Administrator login |

Protected routes require appropriate authentication and authorization.

## 💾 Data Storage

CineBook stores application data in JSON files instead of a traditional database.

- `movies.json` — Movie information.
- `cinemas.json` — Cinema information.
- `shows.json` — Showtimes, seat layouts, and availability.
- `bookings.json` — Booking records.
- `users.json` — User or administrator records, depending on implementation.

The backend reads and updates these files when processing application requests.

### Storage Limitations

JSON file storage is intended for local development and demonstrations. It does not provide the same concurrency, reliability, and scaling guarantees as a database.

For production deployment, use a suitable database and a reliable reservation system that supports transactions.

## 🧪 Testing

Test the following features after starting the application:

- Homepage and movie listings load correctly.
- Movie search and filtering work.
- Movie details display correctly.
- Cinema and showtime selection works.
- Seat selection updates the total price.
- Already-booked seats cannot be reserved again.
- Booking confirmations are generated correctly.
- Booking information persists after restarting the backend.
- Customers can retrieve their bookings.
- Administrative routes require authentication.
- The application displays useful errors when requests fail.

Only mark a feature as working after verifying it in the running application.

## 🛡️ Security Considerations

- Keep environment variables and secrets out of version control.
- Validate customer input on the backend.
- Calculate ticket prices on the server.
- Protect administrative endpoints.
- Use password hashing for stored credentials.
- Restrict access to customer booking information.
- Avoid exposing sensitive information in API responses.

This project is intended as an educational application and should receive additional security testing before any production use.

## 🔮 Future Enhancements

- Integrate a real payment gateway.
- Add customer registration and login.
- Add email booking confirmations.
- Integrate a live movie information API.
- Add cinema-specific seat categories.
- Implement booking cancellation and refunds.
- Migrate JSON storage to a relational or document database.
- Deploy the frontend and backend to cloud hosting.

## 👨‍💻 Author

**Rishikesh Pendyala**

GitHub: [@rishi-2006](https://github.com/rishi-2006)

Project Repository: [movie_booking](https://github.com/rishi-2006/movie_booking)

## 📄 License

No license has been specified yet. Unless a license is added to the repository, reuse and redistribution are subject to applicable copyright laws.

---

**CineBook — Discover Movies. Choose Your Seats. Enjoy the Show!** 🎬
