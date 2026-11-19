package sk.shkira.consultationbooking.booking;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingRequest(
        @NotNull Long consultantId,
        @NotNull LocalDate date,
        @NotNull LocalTime time,
        @NotBlank @Size(max = 100) String name,
        @NotBlank @Email @Size(max = 254) String email
) {
}
