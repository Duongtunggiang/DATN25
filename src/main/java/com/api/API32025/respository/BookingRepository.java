package com.api.API32025.respository;

import com.api.API32025.entity.Booking;
import com.api.API32025.entity.Car;
import com.api.API32025.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByCustomerOrderByBookingDateDesc(Customer customer);

    List<Booking> findByCustomerAndStatusOrderByBookingDateDesc(Customer customer, Car.CarStatus status);

    Optional<Booking> findByCars_Id(Long carId);

    @Query("SELECT b FROM Booking b JOIN b.cars c WHERE c = :car AND b.status = :status")
    List<Booking> findByCarAndStatus(Car car, Car.CarStatus status);

    List<Booking> findByStatusAndCars_IdAndNumberFeedbackIsNotNull(Car.CarStatus status, Long carId);

    @Query("SELECT b FROM Booking b JOIN b.cars c WHERE c.id = :carId ORDER BY b.bookingDate DESC")
    Optional<Booking> findFirstByCars_IdOrderByBookingDateDesc(Long carId);

    @Query("SELECT DISTINCT b FROM Booking b JOIN b.cars c WHERE c IN :cars ORDER BY b.bookingDate DESC")
    List<Booking> findByCarsInOrderByBookingDateDesc(List<Car> cars);

    List<Booking> findByStatus(Car.CarStatus status);


    @Query("SELECT b FROM Booking b JOIN b.cars c WHERE c.id = :carId AND b.status = :status")
    List<Booking> findFeedbacksByCarId(@Param("carId") Long carId, @Param("status") Car.CarStatus status);

}
