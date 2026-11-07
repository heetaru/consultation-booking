package sk.shkira.consultationbooking.booking;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(Long id, Long consultantId, LocalDate date, LocalTime time, String name, String email) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(booking.getId(), booking.getConsultantId(), booking.getBookingDate(),
                booking.getStartTime(), booking.getCustomerName(), booking.getCustomerEmail());
    }
}
