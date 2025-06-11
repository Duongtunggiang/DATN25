package com.api.API32025.controller.booking;

import com.api.API32025.dto.booking.BookingDTO;
import com.api.API32025.dto.booking.BookingRequest;
import com.api.API32025.dto.booking.FeedbackRequest;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Booking;
import com.api.API32025.entity.Car;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.respository.CarRepository;
import com.api.API32025.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    @Autowired
    private BookingService bookingService;

    @Autowired
    private VnPayService vnPayService;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AccountService accountService;

    @Autowired
    private CarService carService;

    @Autowired
    private CarRepository carRepository;

    @Autowired
    private FeedbackService feedbackService;

    @GetMapping("/{id}")
    public ResponseEntity<?> getBookingById(@PathVariable Long id) {
        Booking booking = bookingService.getBookingById(id);
        BookingDTO bookingDTO = bookingService.convertToDTO(booking);
        return ResponseEntity.ok(bookingDTO);
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request,
                                         @AuthenticationPrincipal Account account) {
        bookingService.autoCancelPendingBookings();
        return ResponseEntity.ok(bookingService.bookingCreated(request, account));
    }
    @GetMapping("/time-for-deposit/{bookingId}")
    public ResponseEntity<?> timeForDeposit(@PathVariable Long bookingId) {
        long secondsRemaining = bookingService.getRemainingTimeToDeposit(bookingId);
        return ResponseEntity.ok(secondsRemaining);
    }


    @PostMapping("/{bookingId}/pay")
    public ResponseEntity<?> payBooking(@PathVariable Long bookingId,
                                      @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.payByWallet(bookingId, account));
    }

    @PostMapping("/{bookingId}/start-delivery")
    public ResponseEntity<?> startDelivery(@PathVariable Long bookingId,
                                         @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.deliveringCar(bookingId, account));
    }

    @PostMapping("/{bookingId}/confirm-rent/owner")
    public ResponseEntity<?> confirmRentByOwner(@PathVariable Long bookingId,
                                              @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.rentCarByCarOwner(bookingId, account));
    }

    @PostMapping("/{bookingId}/confirm-rent/customer")
    public ResponseEntity<?> confirmRentByCustomer(@PathVariable Long bookingId,
                                                 @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.rentCarByCustomer(bookingId, account));
    }

    @PostMapping("/{bookingId}/return/owner")
    public ResponseEntity<?> confirmReturnByOwner(@PathVariable Long bookingId,
                                                @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.returnCarByCarOwner(bookingId, account));
    }

    @PostMapping("/{bookingId}/return/customer")
    public ResponseEntity<?> confirmReturnByCustomer(@PathVariable Long bookingId,
                                                   @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.returnCarByCustomer(bookingId, account));
    }

    @PostMapping("/{bookingId}/feedback")
    public ResponseEntity<?> addFeedback(@PathVariable Long bookingId,
                                       @RequestBody FeedbackRequest request,
                                       @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.addFeedback(bookingId, request, account));
    }

    @GetMapping("/my-feedback/{bookingId}")
    private ResponseEntity<?> getMyFeedback(@PathVariable Long bookingId,
                                            @AuthenticationPrincipal Account account){
        return ResponseEntity.ok(bookingService.getFeedBackBookingCustomer(bookingId,account));
    }

    @GetMapping("/{bookingId}/car/{carId}/feedback")
    public ResponseEntity<?> getCarFeedback(@PathVariable Long bookingId,
                                          @PathVariable Long carId) {
        Car car = carService.getCarEntityById(carId);
        BookingService.CarFeedbackDTO feedback = bookingService.getFeedbackByCar(bookingId, car);
        return ResponseEntity.ok(feedback);
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingDTO>> getMyBookings(@AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.getBookingsByAccount(account));
    }

    @GetMapping("/car-owner-bookings")
    public ResponseEntity<List<BookingDTO>> getCarOwnerBookings(@AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(bookingService.getBookingsByCarOwner(account));
    }

    @GetMapping("/my-bookings/filter")
    public ResponseEntity<List<BookingDTO>> getMyBookingsByStatus(
            @AuthenticationPrincipal Account account,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(bookingService.getBookingsByStatus(account, status));
    }

    @PostMapping("/vnpay-url")
    public ResponseEntity<?> createVnPayUrl(@RequestBody BookingRequest request,
                                            @AuthenticationPrincipal Account account) {
//        String url = vnPayService.createVnPayBooking(request, account);
        return ResponseEntity.ok("");
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestParam String newStatus) {
        Booking booking = bookingService.updateStatus(id, newStatus.toUpperCase());
        return ResponseEntity.ok(booking);
    }
    @GetMapping("/status-by-car/{carId}")
    public ResponseEntity<?> getBookingStatusByCarId(@PathVariable Long carId) {
        try {
            // Lấy booking mới nhất của xe
            String status = bookingService.getLatestBookingStatusByCarId(carId);
            return ResponseEntity.ok(status);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("Không tìm thấy booking")) {
                return ResponseEntity.ok(null);
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/cancel-when-pending")
    public ResponseEntity<?> cancelBookingWhenPending(
            @PathVariable Long bookingId,
            @RequestParam String reason,
            @RequestHeader("Authorization") String token)
    {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            Account account = accountService.getAccountById(userId);
            BookingDTO canceledBooking = bookingService.cancelBookingWhenPending(bookingId, account, reason);
            return ResponseEntity.ok(canceledBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/customer-cancel")
    public ResponseEntity<?> cancelBookingWithReason(
            @PathVariable Long bookingId,
            @RequestParam String reason,
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            Account account = accountService.getAccountById(userId);
            BookingDTO canceledBooking = bookingService.cancelBookingByCustomer(bookingId, account, reason);
            return ResponseEntity.ok(canceledBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{bookingId}/carowner-cancel")
    public ResponseEntity<?> cancelBookingByCarOwner(
            @PathVariable Long bookingId,
            @RequestParam String reason,
            @RequestHeader("Authorization") String token) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            Account account = accountService.getAccountById(userId);
            BookingDTO canceledBooking = bookingService.cancelBookingByCarOwner(bookingId, account, reason);
            return ResponseEntity.ok(canceledBooking);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    @GetMapping("/{bookingId}/cancellation-reason")
    public ResponseEntity<String> getCancellationReason(@PathVariable Long bookingId) {
        String reason = bookingService.getCancelReasonByBookingId(bookingId);
        return ResponseEntity.ok(reason);
    }

    @PostMapping("/{bookingId}/refund")
    public ResponseEntity<BookingDTO> refundBooking(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token
    ) {
        Long userId = jwtUtil.extractUserId(token.substring(7));
        Account account = accountService.getAccountById(userId);
        BookingDTO result = bookingService.refundPrice(bookingId, account);
        return ResponseEntity.ok(result);
    }


    @PutMapping("/{bookingId}/delivering")
    public ResponseEntity<?> deliveringCar(
            @PathVariable Long bookingId,
            @RequestHeader("Authorization") String token
    ){
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            Account account = accountService.getAccountById(userId);
            BookingDTO deliveringCar = bookingService.deliveringCar(bookingId, account);
            return ResponseEntity.ok(deliveringCar);
        }catch (Exception e){
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/calculate")
    public ResponseEntity<Double> calculateBookingPrice(@RequestBody BookingRequest request) {
        try {
            List<Car> cars = carRepository.findAllById(request.getCarIds());
            if (cars.isEmpty()) {
                throw new RuntimeException("Không tìm thấy xe");
            }

            // Kiểm tra trạng thái xe
            for (Car car : cars) {
                if (!car.getStatus().equals(Car.CarStatus.AVAILABLE)) {
                    throw new RuntimeException("Xe không sẵn sàng: " + car.getId());
                }
            }

            double total = bookingService.calculateTotalPrice(cars, request.getStartDate(), request.getEndDate());
            return ResponseEntity.ok(total);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @PostMapping("/{bookingId}/car/{carId}/set-available")
    public ResponseEntity<?> setCarAvailable(
            @PathVariable Long bookingId,
            @PathVariable Long carId,
            @AuthenticationPrincipal Account account) {
        BookingDTO booking = bookingService.setCarAvailable(carId, bookingId);
        return ResponseEntity.ok(booking);
    }

    @GetMapping("/{carId}/feedback")
    public ResponseEntity<?> getCarFeedback(@PathVariable Long carId) {
        List<FeedbackService.FeedbackDTO> feedbacks = feedbackService.getFeedbacksByCar(carId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/car/{carId}/current")
    public ResponseEntity<?> getCurrentBookingForCar(@PathVariable Long carId) {
        return ResponseEntity.ok(bookingService.getCurrentBookingForCar(carId));
    }

    @GetMapping("/car/{carId}/all-feedbacks")
    public ResponseEntity<?> getAllCarFeedbacks(@PathVariable Long carId) {
        Car car = carService.getCarEntityById(carId);
        List<BookingService.FeedbackDTO> feedbacks = bookingService.getAllFeedbacksByCar(car);
        return ResponseEntity.ok(feedbacks);
    }
    @GetMapping("/cars/{carId}/feedbacks")
    public ResponseEntity<?> getAllFeedbackByCar(@PathVariable Long carId) {
        return ResponseEntity.ok(bookingService.getAllFeedbackByCarId(carId));
    }

}

