# File Sharing System - Backend

A secure and efficient backend for a file-sharing system built with [NestJS](https://nestjs.com/), [Prisma](https://www.prisma.io/), and [Redis](https://redis.io/).

## 🚀 Features

- **Authentication**: JWT-based authentication with secure login and registration.
- **File Management**: Upload, share, and manage files with ease.
- **Real-time Events**: WebSocket integration for instant updates.
- **Caching**: Global caching layer using Redis for optimized performance.
- **Email Service**: Integrated SMTP mailer for notifications and password resets.
- **Database**: PostgreSQL with Prisma ORM for type-safe database queries.

## 🛠️ Tech Stack

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Caching**: Redis
- **Real-time**: Socket.io
- **Mailing**: Nodemailer (via NestJS Mailer)

## 📋 Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## ⚙️ Project Setup

1. **Clone the repository**:

   ```bash
   git clone <repository-url>
   cd file-sharing-system/backend
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the `backend` directory based on the `.env.example` file:

   ```bash
   cp .env.example .env
   ```

   Update the variables in `.env` with your actual configuration (Database URL, Redis URL, Email credentials, etc.).

4. **Prisma Database Setup**:
   Initialize the database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

## 🏃 Running the App

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The server will start at `http://localhost:3000` (or the port specified in your configuration).

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e
```

## 📁 Project Structure

- `src/`: Main source code.
  - `auth/`: Authentication logic.
  - `files/`: File management and upload logic.
  - `mail/`: Email service implementation.
  - `events/`: WebSocket gateways and handling.
  - `prisma/`: Prisma service and configuration.
- `prisma/`: Database schema and migrations.
- `uploads/`: Local directory for stored files (if applicable).

## 📄 License

This project is [UNLICENSED](LICENSE).
