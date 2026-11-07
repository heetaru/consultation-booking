package sk.shkira.consultationbooking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class BookingApiTest {
    @LocalServerPort
    private int port;
    private final HttpClient client = HttpClient.newHttpClient();

    @Test
    void creatingAndCancellingABookingUpdatesAvailableSlots() throws Exception {
        LocalDate date = nextWeekday();
        assertTrue(get("/api/consultants/1/slots?date=" + date).body().contains("\"09:00\""));

        HttpResponse<String> created = post(body(1, date, "09:00", "alex@example.com"));
        assertEquals(201, created.statusCode(), created.body());
        long id = bookingId(created.body());
        HttpResponse<String> bookings = get("/api/bookings");
        assertEquals(200, bookings.statusCode());
        assertTrue(bookings.body().contains("alex@example.com"), bookings.body());
        assertFalse(get("/api/consultants/1/slots?date=" + date).body().contains("\"09:00\""));
        HttpResponse<String> anotherConsultant = post(body(2, date, "09:00", "other@example.com"));
        assertEquals(201, anotherConsultant.statusCode(), anotherConsultant.body());
        assertEquals(204, delete("/api/bookings/" + bookingId(anotherConsultant.body())).statusCode());
        assertEquals(409, post(body(1, date, "09:00", "second@example.com")).statusCode());
        assertEquals(204, delete("/api/bookings/" + id).statusCode());
        assertTrue(get("/api/consultants/1/slots?date=" + date).body().contains("\"09:00\""));
    }

    @Test
    void rejectsInvalidInputAndWeekendBookings() throws Exception {
        LocalDate date = nextWeekday();
        assertEquals(400, post(body(1, date, "10:15", "alex@example.com")).statusCode());
        assertEquals(400, post(body(1, date, "10:00", "not-an-email")).statusCode());
        LocalDate weekend = LocalDate.now(ZoneId.of("Europe/Bratislava"));
        while (weekend.getDayOfWeek() != DayOfWeek.SATURDAY) weekend = weekend.plusDays(1);
        assertEquals(400, post(body(1, weekend, "10:00", "alex@example.com")).statusCode());
        assertEquals("[]", get("/api/consultants/1/slots?date=" + weekend).body());
    }

    @Test
    void acceptsOnlyDatesInTheNextThirtyDays() throws Exception {
        LocalDate today = LocalDate.now(ZoneId.of("Europe/Bratislava"));
        assertEquals(400, get("/api/consultants/1/slots?date=" + today.minusDays(1)).statusCode());
        assertEquals(200, get("/api/consultants/1/slots?date=" + today.plusDays(29)).statusCode());
        assertEquals(400, get("/api/consultants/1/slots?date=" + today.plusDays(30)).statusCode());
    }

    @Test
    void rejectsMissingConsultantAndUnknownBooking() throws Exception {
        LocalDate date = nextWeekday();
        assertEquals(404, get("/api/consultants/999999/slots?date=" + date).statusCode());
        assertEquals(404, post(body(999999, date, "11:00", "alex@example.com")).statusCode());
        assertEquals(404, delete("/api/bookings/999999").statusCode());
    }

    @Test
    void concurrentRequestsCannotBookTheSameSlotTwice() throws Exception {
        LocalDate date = nextWeekday();
        HttpRequest first = postRequest(body(1, date, "11:30", "first@example.com"));
        HttpRequest second = postRequest(body(1, date, "11:30", "second@example.com"));
        var a = client.sendAsync(first, HttpResponse.BodyHandlers.ofString());
        var b = client.sendAsync(second, HttpResponse.BodyHandlers.ofString());
        assertEquals(List.of(201, 409), List.of(a.join().statusCode(), b.join().statusCode()).stream().sorted().toList());
    }

    private LocalDate nextWeekday() {
        LocalDate date = LocalDate.now(ZoneId.of("Europe/Bratislava")).plusDays(1);
        while (date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY) {
            date = date.plusDays(1);
        }
        return date;
    }

    private String body(long consultantId, LocalDate date, String time, String email) {
        return """
                {"consultantId":%d,"date":"%s","time":"%s","name":"Alex Example","email":"%s"}
                """.formatted(consultantId, date, time, email);
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder(uri(path)).GET().build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }

    private HttpResponse<String> post(String body) throws Exception {
        return client.send(postRequest(body), HttpResponse.BodyHandlers.ofString());
    }

    private HttpRequest postRequest(String body) {
        return HttpRequest.newBuilder(uri("/api/bookings"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build();
    }

    private HttpResponse<String> delete(String path) throws Exception {
        return client.send(HttpRequest.newBuilder(uri(path)).DELETE().build(), HttpResponse.BodyHandlers.ofString());
    }

    private URI uri(String path) {
        return URI.create("http://localhost:" + port + path);
    }

    private long bookingId(String json) {
        Matcher matcher = Pattern.compile("\\\"id\\\"\\s*:\\s*(\\d+)").matcher(json);
        assertTrue(matcher.find(), json);
        return Long.parseLong(matcher.group(1));
    }
}
