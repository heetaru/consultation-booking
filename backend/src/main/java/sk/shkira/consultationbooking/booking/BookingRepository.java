package sk.shkira.consultationbooking.booking;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByConsultantIdAndBookingDate(Long consultantId, LocalDate bookingDate);
    List<Booking> findAllByOrderByBookingDateAscStartTimeAsc();
    List<Booking> findByConsultantIdOrderByBookingDateAscStartTimeAsc(Long consultantId);
}
