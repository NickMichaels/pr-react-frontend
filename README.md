# Patient Referral App - Frontend

React frontend application for the Patient Referral App.

## Features

- Login form that authenticates with the Symfony backend API
- JWT token storage in localStorage
- Providers list display with authentication
- Modern, responsive UI

## Installation

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build

Build for production:

```bash
npm run build
```

## API Endpoints

- `POST /api/login_check` - Login endpoint (username and password)
- `GET /api/providers` - Get all providers (requires JWT token in Authorization header)

## Authentication

The app stores the JWT token in localStorage after successful login. The token is automatically included in API requests to protected endpoints.

