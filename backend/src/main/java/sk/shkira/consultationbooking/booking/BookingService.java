package sk.shkira.consultationbooking.booking;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import sk.shkira.consultationbooking.consultant.ConsultantService;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private static final ZoneId ZONE = ZoneId.of("Europe/Bratislava");
    private static final LocalTime OPENING = LocalTime.of(9, 0);
    private static final LocalTime CLOSING = LocalTime.of(17, 0);

    private final BookingRepository bookingRepository;
    private final ConsultantService consultantService;

    public List<String> getAvailableSlots(long consultantId, LocalDate date) {
        consultantService.requireConsultant(consultantId);
        validateDate(date);
        if (isWeekend(date)) return List.of();

        Set<LocalTime> booked = bookingRepository.findByConsultantIdAndBookingDate(consultantId, date)
                .stream().map(Booking::getStartTime).collect(Collectors.toSet());
        List<String> available = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now(ZONE);
        for (LocalTime time = OPENING; time.isBefore(CLOSING); time = time.plusMinutes(30)) {
            if (date.atTime(time).isAfter(now) && !booked.contains(time)) {
                available.add(time.toString());
            }
        }
        return available;
    }

    public BookingResponse create(BookingRequest request) {
        consultantService.requireConsultant(request.consultantId());
        validateDate(request.date());
        LocalTime time = request.time();
        boolean correctTime = !time.isBefore(OPENING) && time.isBefore(CLOSING)
                && (time.getMinute() == 0 || time.getMinute() == 30)
                && time.getSecond() == 0 && time.getNano() == 0;
        if (isWeekend(request.date()) || !correctTime
                || !request.date().atTime(time).isAfter(LocalDateTime.now(ZONE))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a future 30-minute slot on a weekday");
        }

        Booking booking = new Booking(request.consultantId(), request.date(), time,
                request.name().trim(), request.email().trim());
        try {
            return BookingResponse.from(bookingRepository.saveAndFlush(booking));
        } catch (DataIntegrityViolationException ex) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "This slot is already booked");
        }
    }

    public List<BookingResponse> getBookings() {
        return bookingRepository.findAllByOrderByBookingDateAscStartTimeAsc().stream()
                .map(BookingResponse::from).toList();
    }

    public BookingResponse getBookingById(long bookingId) {
        Booking currentBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        return BookingResponse.from(currentBooking);
    }

    public void cancel(long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Booking not found"));
        bookingRepository.delete(booking);
    }

    private void validateDate(LocalDate date) {
        LocalDate today = LocalDate.now(ZONE);
        if (date.isBefore(today) || date.isAfter(today.plusDays(29))) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a date within the next 30 days");
        }
    }

    private boolean isWeekend(LocalDate date) {
        return date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
    }

}
