package sk.shkira.consultationbooking.booking;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @GetMapping("/api/consultants/{consultantId}/slots")
    public List<String> getAvailableSlots(@PathVariable long consultantId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return bookingService.getAvailableSlots(consultantId, date);
    }

    @PostMapping("/api/bookings")
    public ResponseEntity<BookingResponse> create(@Valid @RequestBody BookingRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bookingService.create(request));
    }

    @GetMapping("/api/bookings")
    public List<BookingResponse> getBookings() {
        return bookingService.getBookings();
    }

    @DeleteMapping("/api/bookings/{id}")
    public ResponseEntity<Void> cancel(@PathVariable long id) {
        bookingService.cancel(id);
        return ResponseEntity.noContent().build();
    }
}
