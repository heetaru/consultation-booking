# Consultation Booking

A full-stack app for finding and booking consultation slots. Bookings can be searched by ID, filtered by consultant, and canceled. A PostgreSQL unique constraint prevents double-booking the same slot.

**Stack:** Angular, TypeScript, Angular Material, Java 21, Spring Boot, PostgreSQL, Flyway, Docker Compose.

## Run locally

Requirements: JDK 21, Node.js 26 with npm, and Docker with Compose.

1. Start PostgreSQL from the repository root: `docker compose up -d --wait`.
2. In `backend`, run `./gradlew bootRun` (Windows: `.\gradlew.bat bootRun`).
3. In `frontend`, run `npm ci`, then `npm start`.

Open [the app](http://localhost:4200) or [Swagger UI](http://localhost:8080/swagger-ui/index.html). Flyway creates the tables and seeds two sample consultants.

Try booking a future weekday slot with fictional details, finding it by ID, and canceling it. This local demo has no sign-in.
