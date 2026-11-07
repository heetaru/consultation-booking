package sk.shkira.consultationbooking;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.boot.test.web.server.LocalServerPort;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ApiDocumentationTest {
    @LocalServerPort
    private int port;

    @Test
    void openApiIncludesConsultantEndpoint() throws Exception {
        HttpResponse<String> response = get("/v3/api-docs");

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("/api/consultants"));
    }

    @Test
    void swaggerUiPageIsAvailable() throws Exception {
        HttpResponse<String> response = get("/swagger-ui/index.html");

        assertEquals(200, response.statusCode());
        assertTrue(response.body().contains("swagger-ui"));
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create("http://localhost:" + port + path))
                .GET()
                .build();
        return HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
    }
}
