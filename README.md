# King William Hotel Reservation System

A full-stack web application for hotel reservations and management. This project provides both 
customer-facing features for booking rooms and a staff portal for managing reservations.

## Features

### Customer Features
- Browse available rooms with real-time availability checking
- Book rooms with date selection
- Add optional services to reservations
- Create accounts to manage reservations
- View and modify existing reservations
- View guest bills

### Staff Features
- Overview of current occupancy metrics
- Review and approve/reject modification requests
- View all reservations and their statuses
- Analytics for room type popularity and service usage

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop 
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/niloahs/kw-hotel.git
   cd kw-hotel
   ```

2. **Ensure Docker is running**
 
3. **Start the PostgreSQL database with Docker**

   ```bash
   docker-compose up -d
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory with the following variables:
   ```
    DATABASE_URL=postgres://postgres:password@localhost:5433/kingwilliam
    NEXTAUTH_URL=http://localhost:3000
    NEXTAUTH_SECRET=123
   ```

5. **Install dependencies**
   ```bash
   npm install
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### Database Setup

The Docker Compose configuration will automatically:
- Create a PostgreSQL 15 database with the correct schema on port 5433
- Seed initial data including:
    - Staff login (admin@kingwilliam.ca / password123)
    - Room types and rooms
    - Seasonal rate configurations
    - Available services

### Useful Database Commands

```bash
# Connect to the database using psql
docker exec -it kw-hotel-db psql -U postgres -d kingwilliam

# View database logs
docker-compose logs -f db

# Stop the database
docker-compose stop

# Restart the database
docker-compose restart

# Remove database (deletes all data)
docker-compose down -v
```

## Usage

### Customer Flow

1. Browse the hotel website to view rooms
2. Select dates and search for available rooms
3. Choose a room and complete the reservation form
4. Add optional services
5. Receive a confirmation code (if account wasn't created)
6. Create or log into an account to view/modify reservations

### Staff Flow

1. Login with staff credentials (admin@kingwilliam.ca / password123)
2. Access the staff dashboard to view analytics
3. View all reservations
4. Approve or reject modification requests

## Project Structure

- `/src/app` - Page components and API routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and database helpers
- `/src/types` - TypeScript type definitions
- `/docker` - Docker configuration and database initialization scripts

## Troubleshooting

**Database Connection Issues**
- Ensure Docker is running
- Check that port 5433 is not in use
- Verify your DATABASE_URL in the .env file
- Make sure only one PostgreSQL service is running

**Authentication Problems**
- Make sure NEXTAUTH_SECRET is set
- Check that NEXTAUTH_URL matches your development URL