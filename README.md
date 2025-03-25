# Expense Sharing Application

<img alt="Expense Sharing Demo" src="/Users/nabiharaza/PycharmProjects/CoffeeRun/frontend/src/images/coffeeimg.png" title="Coffee Run"/>

A web application for tracking shared expenses among groups with automatic balance calculations and next-payer suggestions.

## Features

- 👥 **User Management** - Create user profiles
- 🏘️ **Group Management** - Organize expenses by groups
- 💰 **Expense Tracking** - Record shared expenses with itemized breakdowns
- ⚖️ **Auto Balances** - Fine Grained "who owes whom" calculations
- 🔄 **Next Payer** - Smart suggestion for who should pay next
- 📊 **Transaction History** - Full audit trail of all expenses

## Tech Stack

**Frontend:**
- React.js
- React Router
- React Toastify
- Tailwind CSS

**Backend:**
- Python Flask
- Flask-CORS
- psycopg2 (PostgreSQL adapter)

**Database:**
- PostgreSQL

## Installation

### Prerequisites
- Python 3.7+
- Node.js 14+
- PostgreSQL
- pip & npm
- **Docker**: Version 20.10 or higher.
- **Docker Compose**: Version 1.29 or higher.
- **Git**: For cloning the repository.

### Directory Structure
````
CoffeeRun/
├── backend/
│   ├── main.py               # Flask application
│   ├── requirements.txt      # Python dependencies
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   ├── App.js            # Main application
│   ├── package.json          # Frontend dependencies
````
### Backend Setup
1. Clone the repo:
   ```bash
   git clone https://github.com/your-repo/expense-sharing-app.git
   cd expense-sharing-app/
   ```
2. DB is running remotely but you can also create your own database with the script in `backend/scripts/init.sql`  
3. Build and Run with Docker Compose
   ```bash
    docker-compose up --build
   ```
  - Frontend: http://localhost:3000
  - API: http://localhost:5001
  - Database: localhost:5400 (exposed for debugging).
4. Stop the Application
   ```bash
   docker-compose down
   ```
   - To remove volumes: `docker-compose down -v`

### Usage
- Open `http://localhost:3000` in your browser.
- Navigate to `/add-user` to create users.
- Go to `/create-group` to form groups and add members.
- Use `/groups/:groupId/expenses/new` to add expenses.
- Check balances and transaction history at `/groups/:groupId`.

### Development
- Backend: Edit files in `backend/`, then rebuild with docker-compose up --build.
- Frontend: Modify files in `frontend/`, hot-reloading works via volume mapping.
- Database: Connect to `localhost:5400` with credentials `postgres:postgres`.
### Troubleshooting
- API Errors: Check logs with `docker-compose logs api`.
- Database Connection: Ensure `init.sql` ran correctly; verify with `psql -h localhost -p 5400 -U postgres`.
- Port Conflicts: Adjust `docker-compose.yml` ports if needed.