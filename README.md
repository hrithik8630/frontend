# Hospital Frontend (React + Vite)

This frontend matches the Spring Boot backend in `../backend/management`.

## Setup

```bash
npm install
npm run dev
```

Runs on `http://localhost:5173` (matching backend CORS config).

## API Base URL

Copy `.env.example` to `.env` and edit if needed:

```bash
VITE_API_BASE_URL=http://localhost:8080/api
```

## Pages Implemented

- Register: `POST /api/auth/register`
- Login: `POST /api/auth/login`
- Doctors list, create doctor, available slots
- Appointment booking, patient history, appointment approval
- Beds list and allocation request
- Admin bed requests list and approval

## Notes

- Backend returns JWT token as plain string on login.
- Login includes a "UI Role" selector used only for frontend visibility; backend still enforces real role permissions.
