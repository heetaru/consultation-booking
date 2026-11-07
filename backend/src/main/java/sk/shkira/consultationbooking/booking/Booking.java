package sk.shkira.consultationbooking.booking;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "consultant_id", nullable = false)
    private Long consultantId;

    @Column(name = "booking_date", nullable = false)
    private LocalDate bookingDate;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_email", nullable = false)
    private String customerEmail;

    public Booking(Long consultantId, LocalDate bookingDate, LocalTime startTime, String customerName, String customerEmail) {
        this.consultantId = consultantId;
        this.bookingDate = bookingDate;
        this.startTime = startTime;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
    }
}
