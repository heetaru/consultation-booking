# Consultation Booking

A learning project for booking consultations. The first stage is a Spring Boot API that returns a small list of demo consultants.

## Run the backend

Requirements: JDK 21. Set `JAVA_HOME` and the IntelliJ Gradle JVM to JDK 21.

```bash
cd backend
./gradlew bootRun
```

Open `http://localhost:8080/api/consultants` to view the demo consultants.

The database, booking functionality, and Angular frontend will be added in later stages.
