# Task Management System

A full-stack task management application designed to help teams plan, assign, track, and monitor work efficiently. The project combines a .NET backend with a React frontend, offering a modular architecture for authentication, collaboration, notifications, analytics, and work session tracking.

## Overview

This project is structured as a modular enterprise-style application with separate concerns for:

- Identity and authentication
- Team management
- Task management
- Comments and collaboration
- Notifications and real-time updates
- Work session tracking
- Logging and statistics

The backend exposes a REST API while the frontend provides a modern single-page interface for users to interact with the system.

## Tech Stack

### Backend
- ASP.NET Core Web API
- .NET 10
- Entity Framework Core
- PostgreSQL
- JWT authentication
- SignalR for real-time notifications
- OpenAPI / Scalar API documentation

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS

## Main Features

- User registration and login
- JWT-based authentication and authorization
- Team creation and membership management
- Task creation, updates, assignment, and status tracking
- Comments on tasks and team activity
- Notification system for user updates
- Work session management for tracking active work time
- Analytics and statistics for team productivity
- Logging and monitoring for backend activity

## Project Structure

```text
Task-Management-System/
├── Client/                          # React frontend application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
├── TaskManagementSystem/            # .NET solution and backend modules
│   ├── TaskManagementSystem.Api/   # API entry point
│   ├── TaskManagementSystem.Data/  # Data access and EF Core configuration
│   ├── TaskManagementSystem.Modules.Identity/
│   ├── TaskManagementSystem.Modules.Tasks/
│   ├── TaskManagementSystem.Modules.Teams/
│   ├── TaskManagementSystem.Modules.Comment/
│   ├── TaskManagementSystem.Modules.Notification/
│   ├── TaskManagementSystem.Modules.Logs/
│   ├── TaskManagementSystem.Modules.Statistics/
│   ├── TaskManagementSystem.Modules.WorkSession/
│   ├── TaskManagementSystem.Tests/
│   └── TaskManagementSystem.slnx
├── Design/                          # Design assets and mockups
├── Documents/                       # Project documentation files
├── .gitignore
├── README.md
└── LICENSE (if added later)
```

## Architecture

The application uses a modular backend structure where each domain area is separated into its own module. This keeps the codebase scalable and easier to maintain as the system grows.

At a high level:

- API layer handles requests, authentication, and middleware setup
- Data layer manages database access and configuration
- Feature modules manage the domain logic for tasks, teams, notifications, comments, etc.
- Frontend consumes the API and renders the user interface

## Prerequisites

Before running the project locally, make sure you have the following installed:

- .NET 10 SDK
- Node.js 20+ and npm
- PostgreSQL database
- A configured environment file or matching environment variables

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/LRRashkov22/Task-Management-System.git
cd Task-Management-System
```

### 2. Configure the backend

The API project reads configuration from the .env 

### 3. Run the backend

```bash
cd TaskManagementSystem
 dotnet restore
 dotnet build
 dotnet run --project TaskManagementSystem.Api
```

### 4. Run the frontend

```bash
cd Client
npm install
npm run dev
```

The frontend will typically run on the Vite default port, usually:

- http://localhost:5173

## API and Documentation

The backend includes OpenAPI support and API documentation tooling. Once the API is running, you can explore the endpoints through the configured documentation interface.

## Development Notes

- The project follows a modular monolith-style architecture.
- The frontend is a Vite React application with TypeScript.
- The backend uses JWT and CORS configuration for secure frontend communication.
- SignalR is configured to support real-time notification scenarios.

## License

This project does not currently include a license file in the repository root. If you plan to publish or share it publicly, consider adding an appropriate license such as MIT or Apache 2.0.

## Contributing

Contributions are welcome. If you would like to improve the project:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## Contact

For project questions or collaboration, contact the repository owner or review the project documentation in the `Documents` folder.
