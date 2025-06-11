package com.api.API32025.respository;

import com.api.API32025.entity.Booking;
import com.api.API32025.entity.CancellationReason;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CancellationReasonRepository extends JpaRepository<CancellationReason,Long> {
    Optional<CancellationReason> findByBooking(Booking booking);

    Optional<CancellationReason> findByBookingId(Long bookingId);

}
