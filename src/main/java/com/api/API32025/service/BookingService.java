package com.api.API32025.service;

import com.api.API32025.controller.car.SegmentController;
import com.api.API32025.dto.booking.BookingDTO;
import com.api.API32025.dto.booking.BookingRequest;
import com.api.API32025.dto.booking.FeedbackRequest;
import com.api.API32025.dto.booking.FeedbackResponseDTO;
import com.api.API32025.dto.car.CarDTO;
import com.api.API32025.dto.customer.CustomerDTO;
import com.api.API32025.entity.*;
import com.api.API32025.respository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    @Autowired
    private final BookingRepository bookingRepository;
    @Autowired
    private final CarRepository carRepository;
    @Autowired
    private final CustomerRepository customerRepository;
    @Autowired
    private final AccountService accountService;

    @Autowired
    private CarOwnerRepository carOwnerRepository;
    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private CancellationReasonRepository cancellationReasonRepository;

    public Booking getBookingById(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt xe"));
    }

    public BookingDTO convertToDTO(Booking booking) {
        BookingDTO dto = new BookingDTO();
        dto.setId(booking.getId());
        dto.setStatus(booking.getStatus());
        dto.setStartDate(booking.getStartDate());
        dto.setEndDate(booking.getEndDate());
        dto.setTotalPrice(booking.getTotalPrice());
        
        CustomerDTO customerDTO = new CustomerDTO();
        customerDTO.setId(booking.getCustomer().getId());
        customerDTO.setFullName(booking.getCustomer().getAccount().getUsername());
        customerDTO.setPhone(booking.getCustomer().getAccount().getProfile().getPhoneNumber());
        dto.setCustomer(customerDTO);
        
        List<CarDTO> carDTOs = booking.getCars().stream()
            .map(car -> {
                CarDTO carDTO = new CarDTO();
                carDTO.setId(car.getId());
                carDTO.setCarName(car.getCarName());
                carDTO.setLicensePlate(car.getLicensePlate());
                carDTO.setPricePerDay(car.getPricePerDay());
                return carDTO;
            })
            .collect(Collectors.toList());
        dto.setCars(carDTOs);
        
        return dto;
    }

    public Booking bookingCreated(BookingRequest request, Account account) {
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        List<Car> cars = carRepository.findAllById(request.getCarIds());
        for (Car car : cars) {
            if (!car.getStatus().equals(Car.CarStatus.AVAILABLE)) {
                throw new RuntimeException("Xe không sẵn sàng: " + car.getId());
            }
        }

        for (Car car : cars) {
            car.setStatus(Car.CarStatus.PENDING);
            carRepository.save(car);
        }
        double total = calculateTotalPrice(cars, request.getStartDate(), request.getEndDate());

        Booking booking = new Booking();
        booking.setCustomer(customer);
        booking.setCars(cars);
        booking.setBookingDate(LocalDateTime.now());
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setStatus(Car.CarStatus.PENDING);
        booking.setTotalPrice(total);

        return bookingRepository.save(booking);
    }
    public Booking payByWallet(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt"));

        // Get customer's wallet
        Wallet customerWallet = account.getWallet();
        double total = booking.getTotalPrice();

        if (customerWallet.getBalance() < total) {
            throw new RuntimeException("Số dư ví không đủ để thanh toán.");
        }

        // Deduct money from customer's wallet
        String customerDescription = String.format("Thanh toán đơn đặt xe %s", 
            booking.getCars().stream()
                .map(Car::getLicensePlate)
                .collect(Collectors.joining(", ")));
        walletService.withdraw(account.getId(), (int)total, customerDescription);

        // Get car owner's account and transfer money
        Car firstCar = booking.getCars().get(0);
        CarOwner carOwner = firstCar.getCarOwner();
        Account ownerAccount = carOwner.getAccount();
        
        String ownerDescription = String.format("Nhận tiền đặt xe %s từ %s", 
            booking.getCars().stream()
                .map(Car::getLicensePlate)
                .collect(Collectors.joining(", ")),
            account.getProfile().getFirstName());
        walletService.deposit(ownerAccount.getId(), (int)total, ownerDescription);

        // Update booking and car status
        booking.setStatus(Car.CarStatus.DEPOSIT);
        booking.getCars().forEach(c -> {
            c.setStatus(Car.CarStatus.DEPOSIT);
            carRepository.save(c);
        });
        booking.setPaymentMethod("WALLET");

        return bookingRepository.save(booking);
    }

    public BookingDTO deliveringCar(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        CarOwner carOwner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

//        System.out.println("Debug deliveringCar - BookingId: " + bookingId);
//        System.out.println("Debug deliveringCar - Current Status: " + booking.getStatus());
//        System.out.println("Debug deliveringCar - Expected Status: " + Car.CarStatus.DEPOSIT);
//        System.out.println("Debug deliveringCar - Status Comparison: " + booking.getStatus().equals(Car.CarStatus.DEPOSIT));

        if (!booking.getStatus().equals(Car.CarStatus.DEPOSIT)) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái đã đặt cọc mới có thể giao xe");
        }

        boolean isOwnerOfAnyCar = booking.getCars().stream()
                .anyMatch(car -> car.getCarOwner().getId().equals(carOwner.getId()));
        if (!isOwnerOfAnyCar) {
            throw new RuntimeException("Bạn không phải là chủ của bất kỳ xe nào trong đơn hàng này");
        }

        booking.setStatus(Car.CarStatus.DELIVERING);
        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.DELIVERING);
            carRepository.save(car);
        }

        booking = bookingRepository.save(booking);
        System.out.println("Debug deliveringCar - New Status after save: " + booking.getStatus());
        return convertToDTO(booking);
    }
    public BookingDTO rentCarByCarOwner(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        CarOwner carOwner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

//        System.out.println("Debug - BookingId: " + bookingId);
//        System.out.println("Debug - Current Booking Status: " + booking.getStatus());
//        System.out.println("Debug - Expected Status: " + Car.CarStatus.DELIVERING);
//        System.out.println("Debug - Status Comparison: " + booking.getStatus().equals(Car.CarStatus.DELIVERING));

        if (!booking.getStatus().equals(Car.CarStatus.DELIVERING)) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái đang giao mới có thể xác nhận cho thuê");
        }

        boolean isOwnerOfAnyCar = booking.getCars().stream()
                .anyMatch(car -> car.getCarOwner().getId().equals(carOwner.getId()));
        if (!isOwnerOfAnyCar) {
            throw new RuntimeException("Bạn không phải là chủ của bất kỳ xe nào trong đơn hàng này");
        }

        booking.setStatus(Car.CarStatus.RENTED);
        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.RENTED);
            carRepository.save(car);
        }

        booking = bookingRepository.save(booking);
        return convertToDTO(booking);
    }

    public BookingDTO rentCarByCustomer(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền xác nhận đơn hàng này");
        }

        if (!booking.getStatus().equals(Car.CarStatus.DELIVERING)) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái đang giao mới có thể xác nhận thuê");
        }

        booking.setStatus(Car.CarStatus.RENTED);
        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.RENTED);
            carRepository.save(car);
        }

        booking = bookingRepository.save(booking);
        return convertToDTO(booking);
    }
    public BookingDTO returnCarByCarOwner(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        CarOwner carOwner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        if (!booking.getStatus().equals(Car.CarStatus.RENTED)) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái đang thuê mới có thể xác nhận trả xe");
        }

        boolean isOwnerOfAnyCar = booking.getCars().stream()
                .anyMatch(car -> car.getCarOwner().getId().equals(carOwner.getId()));
        if (!isOwnerOfAnyCar) {
            throw new RuntimeException("Bạn không phải là chủ của bất kỳ xe nào trong đơn hàng này");
        }

        booking.setStatus(Car.CarStatus.RETURNED);
        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.RETURNED);
            carRepository.save(car);
        }

        booking = bookingRepository.save(booking);
        return convertToDTO(booking);
    }

    public BookingDTO returnCarByCustomer(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền xác nhận đơn hàng này");
        }

        if (!booking.getStatus().equals(Car.CarStatus.RENTED)) {
            throw new RuntimeException("Đơn hàng phải ở trạng thái đang thuê mới có thể xác nhận trả xe");
        }

        booking.setStatus(Car.CarStatus.RETURNED);
        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.RETURNED);
            carRepository.save(car);
        }

        booking = bookingRepository.save(booking);
        return convertToDTO(booking);
    }
    public BookingDTO cancelBookingByCustomer(Long bookingId, Account account, String resion) {
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }

        if (!booking.getStatus().equals(Car.CarStatus.DEPOSIT)) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái này");
        }

        booking.setStatus(Car.CarStatus.CANCEL);

        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.CANCEL);
            carRepository.save(car);
        }

        CancellationReason cancellationReason = new CancellationReason();
        cancellationReason.setBooking(booking);
        cancellationReason.setCar(booking.getCars().get(0));
        cancellationReason.setReason(resion);
        cancellationReason.setCancellationTime(LocalDateTime.now());
        cancellationReason.setRefundAmount(booking.getTotalPrice()*0.9); // 80% hoac 90-100% tuy chinh
        cancellationReason.setProcessed(false);
        cancellationReasonRepository.save(cancellationReason);

        booking = bookingRepository.save(booking);

        return convertToDTO(booking);
    }
    @Scheduled(fixedRate = 60000)
    public void autoCancelPendingBookings() {
        List<Booking> pendingBookings = bookingRepository.findByStatus(Car.CarStatus.PENDING);

        for (Booking booking : pendingBookings) {
            Duration duration = Duration.between(booking.getBookingDate(), LocalDateTime.now());
            if (duration.toMinutes() >= 5) {
                try {
                    cancelBookingWhenPending(booking.getId(), booking.getCustomer().getAccount(),
                            "Quá thời gian thanh toán");
                    System.out.println("Hủy đơn hàng #" + booking.getId() + " do quá hạn");
                } catch (Exception e) {
                    System.err.println("Lỗi khi hủy đơn: " + e.getMessage());
                }
            }
        }
    }
    public long getRemainingTimeToDeposit(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expireTime = booking.getBookingDate().plusMinutes(5);
        return Duration.between(now, expireTime).toSeconds();
    }



    public  BookingDTO cancelBookingWhenPending(Long bookingId, Account account, String reason){
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        Booking currentBooking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!currentBooking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }
        if (!currentBooking.getStatus().equals(Car.CarStatus.PENDING)) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái này");
        }

        currentBooking.setStatus(Car.CarStatus.CANCELPENDING);

        for (Car car : currentBooking.getCars()) {
            car.setStatus(Car.CarStatus.AVAILABLE);
            carRepository.save(car);
        }

        CancellationReason cancellationReason = new CancellationReason();
        cancellationReason.setBooking(currentBooking);
        cancellationReason.setCar(currentBooking.getCars().get(0));
        cancellationReason.setReason("HỦY ĐƠN CHỜ THANH TOÁN: " + reason);
        cancellationReason.setCancellationTime(LocalDateTime.now());
        cancellationReason.setRefundAmount(currentBooking.getTotalPrice() * 0);
        cancellationReason.setProcessed(false);
        cancellationReasonRepository.save(cancellationReason);

        bookingRepository.save(currentBooking);

        return convertToDTO(currentBooking);
    }

    public String getCancelReasonByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        CancellationReason reason = cancellationReasonRepository.findByBooking(booking)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lý do hủy đơn hàng"));

        return reason.getReason();
    }


    public BookingDTO cancelBookingByCarOwner(Long bookingId, Account account, String resion){
        accountService.checkAccountStatus(account);
        CarOwner carOwner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        boolean isOwner = booking.getCars().stream()
                .anyMatch(car -> car.getCarOwner().getId().equals(carOwner.getId()));
        if (!isOwner) {
            throw new RuntimeException("Bạn không có quyền hủy đơn hàng này");
        }


        if (!booking.getStatus().equals(Car.CarStatus.DEPOSIT)) {
            throw new RuntimeException("Không thể hủy đơn hàng ở trạng thái này");
        }

        booking.setStatus(Car.CarStatus.CANCEL);

        for (Car car : booking.getCars()) {
            car.setStatus(Car.CarStatus.CANCEL);
            carRepository.save(car);
        }

        CancellationReason cancellationReason = new CancellationReason();
        cancellationReason.setBooking(booking);
        cancellationReason.setCar(booking.getCars().get(0));
        cancellationReason.setReason(resion);
        cancellationReason.setCancellationTime(LocalDateTime.now());
        cancellationReason.setRefundAmount(booking.getTotalPrice()); // 100% doi voi chu xe
        cancellationReason.setProcessed(false);
        cancellationReasonRepository.save(cancellationReason);

        booking = bookingRepository.save(booking);

        return convertToDTO(booking);
    }

    public BookingDTO refundPriceWhenCustomerCancel(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền hoàn tiền đơn hàng này");
        }

        if (!booking.getStatus().equals(Car.CarStatus.CANCEL)) {
            throw new RuntimeException("Chỉ hoàn tiền được khi đơn đã bị hủy");
        }

        CancellationReason reason = cancellationReasonRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lý do hủy đơn"));

        if (reason.isProcessed()) {
            throw new RuntimeException("Đơn này đã được hoàn tiền rồi");
        }

        double refundAmount = reason.getRefundAmount();
//        String description = String.format("Hoàn 90%% tiền đơn %s do khách hàng hủy", booking.getId());
        String withdrawDescription = String.format("Hoàn tiền 90%% đơn %s do khách hủy", booking.getId());
        String depositDescription = String.format("Nhận hoàn tiền 90%% đơn %s do bạn hủy", booking.getId());

        // Trừ tiền từ ví chủ xe
        CarOwner owner = booking.getCars().get(0).getCarOwner();
        Account ownerAccount = owner.getAccount();
//        walletService.withdraw(ownerAccount.getId(), (int)refundAmount,
//                String.format("Hoàn tiền -10% đơn %s do khách hủy", booking.getId()));
        walletService.withdraw(ownerAccount.getId(), (int)refundAmount, withdrawDescription);
        // Nạp lại vào ví khách
        walletService.deposit(account.getId(), (int) refundAmount, depositDescription);

        reason.setProcessed(true);
        cancellationReasonRepository.save(reason);

        booking.setStatus(Car.CarStatus.REFUND);
        bookingRepository.save(booking);

        return convertToDTO(booking);
    }


    public BookingDTO refundPriceWhenCarCancel(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        CarOwner carOwner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));

        if (!booking.getStatus().equals(Car.CarStatus.CANCEL)) {
            throw new RuntimeException("Chỉ hoàn tiền được khi đơn đã bị hủy");
        }

        CancellationReason reason = cancellationReasonRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lý do hủy đơn"));

        if (reason.isProcessed()) {
            throw new RuntimeException("Đơn này đã được hoàn tiền rồi");
        }

        // Lấy thông tin ví chủ xe và khách hàng
        Account ownerAccount = carOwner.getAccount();
        Account customerAccount = booking.getCustomer().getAccount();

        double refundAmount = reason.getRefundAmount();
        String withdrawDescription = String.format("Hoàn tiền đơn %s ", booking.getId());
        String depositDescription = String.format("Nhận tiền hoàn đơn %s ", booking.getId());

        // Trừ tiền từ ví chủ xe
        walletService.withdraw(ownerAccount.getId(), (int) refundAmount, withdrawDescription);

        // Nạp tiền vào ví khách hàng
        walletService.deposit(customerAccount.getId(), (int) refundAmount, depositDescription);

        // Đánh dấu đã hoàn tiền
        reason.setProcessed(true);
        cancellationReasonRepository.save(reason);

        booking.setStatus(Car.CarStatus.REFUND);
        bookingRepository.save(booking);

        return convertToDTO(booking);
    }


    public BookingDTO refundPrice(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Optional<Customer> customerOpt = customerRepository.findByAccount(account);
        if (customerOpt.isPresent()) {
            return refundPriceWhenCustomerCancel(bookingId, account);
        }

        Optional<CarOwner> carOwnerOpt = carOwnerRepository.findByAccount(account);
        if (carOwnerOpt.isPresent()) {
            return refundPriceWhenCarCancel(bookingId, account);
        }

        throw new RuntimeException("Bạn không có quyền hoàn tiền đơn hàng này");
    }

    public Booking addFeedback(Long bookingId, FeedbackRequest request, Account account) {
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng!"));
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền nhận xét đơn hàng này");
        }
        if (!Car.CarStatus.RETURNED.equals(booking.getStatus())) {
            throw new RuntimeException("Chỉ có thể xem lại các đơn hàng đã trả lại");
        }
        // hàm cập nhật feedback nếu đã có..
        if (Car.CarStatus.FEEDBACK.equals(booking.getStatus())) {
            // Cho phép cập nhật lại feedback
            booking.setNumberFeedback(request.getNumberFeedback());
            booking.setContentFeedback(request.getContentFeedback());
            return bookingRepository.save(booking);
        }

        booking.setStatus(Car.CarStatus.FEEDBACK);
        booking.setBookingDate(LocalDateTime.now());
        booking.setNumberFeedback(request.getNumberFeedback());
        booking.setContentFeedback(request.getContentFeedback());
        return bookingRepository.save(booking);

    }

    public double calculateTotalPrice(List<Car> cars, LocalDate start, LocalDate end) {
        if (start == null || end == null) {
            throw new RuntimeException("Ngày bắt đầu và kết thúc không được để trống");
        }

        if (start.isAfter(end)) {
            throw new RuntimeException("Ngày bắt đầu phải trước ngày kết thúc");
        }

        if (cars == null || cars.isEmpty()) {
            throw new RuntimeException("Danh sách xe không được để trống");
        }

        long days = ChronoUnit.DAYS.between(start, end) + 1; // +1 vì tính cả ngày cuối
        return cars.stream()
            .mapToDouble(Car::getPricePerDay)
            .sum() * days;
    }

    public FeedbackResponseDTO getFeedBackBookingCustomer(Long bookingId, Account account) {
        accountService.checkAccountStatus(account);
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));
        if(!booking.getStatus().equals(Car.CarStatus.FEEDBACK)){
            throw new RuntimeException("Đơn hàng chưa được phản hồi");
        }
        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền xem đánh giá đơn hàng này");
        }
        return new FeedbackResponseDTO(booking);
    }

    public CarFeedbackDTO getFeedbackByCar(Long bookingId, Car car) {
        List<Booking> completedBookings = bookingRepository.findByCarAndStatus(car, Car.CarStatus.RETURNED);

        List<FeedbackDTO> feedbacks = completedBookings.stream()
                .filter(booking -> booking.getNumberFeedback() != null)
                .map(booking -> {
                    FeedbackDTO dto = new FeedbackDTO();
                    dto.setBookingId(booking.getId());
                    dto.setCustomerName(booking.getCustomer().getAccount().getUsername());
                    dto.setRating(booking.getNumberFeedback());
                    dto.setContent(booking.getContentFeedback());
                    dto.setFeedbackDate(booking.getBookingDate());
                    return dto;
                })
                .collect(Collectors.toList());

        double averageRating = feedbacks.stream()
                .mapToDouble(FeedbackDTO::getRating)
                .average()
                .orElse(0.0);

        CarFeedbackDTO result = new CarFeedbackDTO();
        result.setAverageRating(averageRating);
        result.setFeedbacks(feedbacks);

        return result;
    }

    public List<BookingDTO> getBookingsByAccount(Account account) {
        // Check if account is car owner
        Optional<CarOwner> carOwnerOpt = carOwnerRepository.findByAccount(account);
        if (carOwnerOpt.isPresent()) {
            CarOwner carOwner = carOwnerOpt.get();
            // Get all cars owned by this car owner
            List<Car> ownerCars = carRepository.findByCarOwner(carOwner);
            // Get all bookings for these cars
            List<Booking> bookings = bookingRepository.findByCarsInOrderByBookingDateDesc(ownerCars);
            return bookings.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }

        // If account is customer, return their bookings
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        List<Booking> bookings = bookingRepository.findByCustomerOrderByBookingDateDesc(customer);
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<BookingDTO> getBookingsByCarOwner(Account account) {
        CarOwner carOwner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));
        
        // Get all cars owned by this car owner
        List<Car> ownerCars = carRepository.findByCarOwner(carOwner);
        
        // Get all bookings for these cars
        List<Booking> bookings = bookingRepository.findByCarsInOrderByBookingDateDesc(ownerCars);
        
        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public String getBookingStatusByCarId(Long carId) {
        return bookingRepository.findFirstByCars_IdOrderByBookingDateDesc(carId)
                .map(booking -> booking.getStatus().name())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt với xe Id: " + carId));
    }
    public String getLatestBookingStatusByCarId(Long carId) {
        return bookingRepository.findFirstByCars_IdOrderByBookingDateDesc(carId)
                .map(booking -> booking.getStatus().toString())
                .orElse(null); // Return null if no booking is found
    }
    public List<BookingDTO> getBookingsByStatus(Account account, String status) {
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        List<Booking> bookings;
        if (status != null && !status.isEmpty()) {
            Car.CarStatus carStatus = Car.CarStatus.valueOf(status.toUpperCase());
            bookings = bookingRepository.findByCustomerAndStatusOrderByBookingDateDesc(customer, carStatus);
        } else {
            bookings = bookingRepository.findByCustomerOrderByBookingDateDesc(customer);
        }

        return bookings.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    public BookingDTO setCarAvailable(Long carId, Long bookingId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        if (!car.getStatus().equals(Car.CarStatus.RETURNED) && !car.getStatus().equals(Car.CarStatus.CANCEL)
                && !car.equals(Car.CarStatus.DELETED) && !car.equals(Car.CarStatus.INACTIVE)) {
            throw new RuntimeException("Xe phải ở trạng thái đã trả mới có thể đặt về trạng thái sẵn sàng");
        }

        car.setStatus(Car.CarStatus.AVAILABLE);
        carRepository.save(car);

        return convertToDTO(booking);
    }
    public Booking updateStatus(Long bookingId, String newStatus) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        Car.CarStatus carStatus;
        try {
            carStatus = Car.CarStatus.valueOf(newStatus);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Trạng thái không hợp lệ: " + newStatus);
        }

        booking.setStatus(carStatus);
        booking.getCars().forEach(car -> {
            car.setStatus(carStatus);
            carRepository.save(car);
        });

        return bookingRepository.save(booking);
    }
    public class CarFeedbackDTO {
        private Double averageRating;
        private List<FeedbackDTO> feedbacks;

        public Double getAverageRating() {
            return averageRating;
        }

        public void setAverageRating(Double averageRating) {
            this.averageRating = averageRating;
        }

        public List<FeedbackDTO> getFeedbacks() {
            return feedbacks;
        }

        public void setFeedbacks(List<FeedbackDTO> feedbacks) {
            this.feedbacks = feedbacks;
        }
    }

    public class FeedbackDTO {
        private Long bookingId;
        private String customerName;
        private Double rating;
        private String content;
        private LocalDateTime feedbackDate;

        public Long getBookingId() {
            return bookingId;
        }

        public void setBookingId(Long bookingId) {
            this.bookingId = bookingId;
        }

        public String getCustomerName() {
            return customerName;
        }

        public void setCustomerName(String customerName) {
            this.customerName = customerName;
        }

        public Double getRating() {
            return rating;
        }

        public void setRating(Double rating) {
            this.rating = rating;
        }

        public String getContent() {
            return content;
        }

        public void setContent(String content) {
            this.content = content;
        }

        public LocalDateTime getFeedbackDate() {
            return feedbackDate;
        }

        public void setFeedbackDate(LocalDateTime feedbackDate) {
            this.feedbackDate = feedbackDate;
        }
    }

    public BookingDTO getCurrentBookingForCar(Long carId) {
        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        if (car.getBookings() != null) {
            car.getBookings().forEach(booking -> {
                System.out.println("Debug getCurrentBookingForCar - Booking " + booking.getId() + 
                    " Status: " + booking.getStatus());
            });
        }

        // Tìm booking mới nhất có trạng thái phù hợp (DEPOSIT, DELIVERING, RENTED)
        return car.getBookings().stream()
                .filter(booking -> {
                    Car.CarStatus status = booking.getStatus();
                    return status == Car.CarStatus.DEPOSIT || 
                           status == Car.CarStatus.DELIVERING || 
                           status == Car.CarStatus.RENTED ||
                           status == Car.CarStatus.RETURNED;
                })
                .max((b1, b2) -> b1.getBookingDate().compareTo(b2.getBookingDate()))
                .map(this::convertToDTO)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt xe hiện tại"));
    }

    public List<FeedbackDTO> getAllFeedbacksByCar(Car car) {
        List<Booking> completedBookings = bookingRepository.findByCarAndStatus(car, Car.CarStatus.RETURNED);

        return completedBookings.stream()
                .filter(booking -> booking.getNumberFeedback() != null)
                .map(booking -> {
                    FeedbackDTO dto = new FeedbackDTO();
                    dto.setBookingId(booking.getId());
                    dto.setCustomerName(booking.getCustomer().getAccount().getUsername());
                    dto.setRating(booking.getNumberFeedback());
                    dto.setContent(booking.getContentFeedback());
                    dto.setFeedbackDate(booking.getBookingDate());
                    return dto;
                })
                .collect(Collectors.toList());
    }
    public CarFeedbackDTO getAllFeedbackByCarId(Long carId) {
        List<Booking> bookings = bookingRepository.findFeedbacksByCarId(carId, Car.CarStatus.FEEDBACK);

        List<FeedbackDTO> feedbacks = bookings.stream()
                .filter(b -> b.getNumberFeedback() != null && b.getContentFeedback() != null)
                .map(b -> {
                    FeedbackDTO dto = new FeedbackDTO();
                    dto.setBookingId(b.getId());
                    dto.setCustomerName(b.getCustomer().getAccount().getUsername());
                    dto.setRating(b.getNumberFeedback());
                    dto.setContent(b.getContentFeedback());
                    dto.setFeedbackDate(b.getBookingDate()); // hoặc BookingDate tùy bạn
                    return dto;
                }).collect(Collectors.toList());

        double average = feedbacks.stream()
                .mapToDouble(FeedbackDTO::getRating)
                .average().orElse(0.0);

        CarFeedbackDTO result = new CarFeedbackDTO();
        result.setAverageRating(average);
        result.setFeedbacks(feedbacks);

        return result;
    }

}

