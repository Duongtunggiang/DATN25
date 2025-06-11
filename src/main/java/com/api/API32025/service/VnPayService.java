package com.api.API32025.service;

import com.api.API32025.config.VnPayConfig;
import com.api.API32025.dto.wallet.QueryRequest;
import com.api.API32025.dto.wallet.RefundRequest;
import com.api.API32025.entity.*;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.respository.*;
import com.google.gson.Gson;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class VnPayService {

    @Autowired
    private VnPayConfig config;
    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AccountService accountService;
    @Autowired
    private VnPayTransactionRepository vnPayTransactionRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private  CarRepository carRepository;

    @Autowired
    private WalletService walletService;

    public String createPaymentUrl(Long accountid,int amount, String bankCode, String locale, String clientIp) {
        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", config.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");

        String txnRef = config.getRandomNumber(8);
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don hang: " + txnRef);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", (locale != null) ? locale : "vn");
        vnp_Params.put("vnp_ReturnUrl", config.vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", clientIp);

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        VnPayTransaction transaction = new VnPayTransaction();
        transaction.setVnpTxnRef(txnRef);
        transaction.setAmount(amount);
        transaction.setProcessed(false);
        transaction.setTransactionTime(LocalDateTime.now());

        Account account = accountRepository.findById(accountid)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tài khoản"));

        Wallet wallet = walletRepository.findByAccount(account)
                .orElseGet(() -> {
                    Wallet newWallet = new Wallet();
                    newWallet.setAccount(account);
                    newWallet.setBalance(0);
                    return walletRepository.save(newWallet);
                });

        transaction.setWallet(wallet);
        vnPayTransactionRepository.save(transaction);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (int i = 0; i < fieldNames.size(); i++) {
            String fieldName = fieldNames.get(i);
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (i < fieldNames.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }
        String vnp_SecureHash = hmacSHA512(config.secretKey, hashData.toString());
        return config.vnp_PayUrl + "?" + query + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    public String refund(RefundRequest request, String clientIp) {
        String vnp_RequestId = config.getRandomNumber(8);
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        Map<String, String> vnp_Params = new LinkedHashMap<>();
        vnp_Params.put("vnp_RequestId", vnp_RequestId);
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "refund");
        vnp_Params.put("vnp_TmnCode", config.vnp_TmnCode);
        vnp_Params.put("vnp_TransactionType", request.getTranType());
        vnp_Params.put("vnp_TxnRef", request.getOrderId());
        vnp_Params.put("vnp_Amount", String.valueOf(request.getAmount() * 100));
        vnp_Params.put("vnp_OrderInfo", "Hoàn tiền GD: " + request.getOrderId());
        vnp_Params.put("vnp_TransactionDate", request.getTransDate());
        vnp_Params.put("vnp_CreateBy", request.getUser());
        vnp_Params.put("vnp_IpAddr", clientIp);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        String hashData = String.join("|",
                vnp_RequestId, "2.1.0", "refund", config.vnp_TmnCode,
                request.getOrderId(), String.valueOf(request.getAmount() * 100),
                request.getTransDate(), request.getUser(), clientIp, vnp_CreateDate
        );
        String vnp_SecureHash = hmacSHA512(config.secretKey, hashData);
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);

        Gson gson = new Gson();
        String jsonRequest = gson.toJson(vnp_Params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                config.vnp_ApiUrl + "/refund", HttpMethod.POST, entity, String.class
        );
        return response.getBody();
    }

    public String query(QueryRequest request, String clientIp) {
        String vnp_RequestId = config.getRandomNumber(8);
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        Map<String, String> vnp_Params = new LinkedHashMap<>();
        vnp_Params.put("vnp_RequestId", vnp_RequestId);
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "querydr");
        vnp_Params.put("vnp_TmnCode", config.vnp_TmnCode);
        vnp_Params.put("vnp_TxnRef", request.getOrderId());
        vnp_Params.put("vnp_OrderInfo", "Truy vấn GD: " + request.getOrderId());
        vnp_Params.put("vnp_TransactionDate", request.getTransDate());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_IpAddr", clientIp);

        String hashData = String.join("|",
                vnp_RequestId, "2.1.0", "querydr", config.vnp_TmnCode,
                request.getOrderId(), request.getTransDate(),
                vnp_CreateDate, clientIp, "Truy vấn GD: " + request.getOrderId()
        );
        String vnp_SecureHash = hmacSHA512(config.secretKey, hashData);
        vnp_Params.put("vnp_SecureHash", vnp_SecureHash);

        Gson gson = new Gson();
        String jsonRequest = gson.toJson(vnp_Params);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<String> entity = new HttpEntity<>(jsonRequest, headers);

        RestTemplate restTemplate = new RestTemplate();
        ResponseEntity<String> response = restTemplate.exchange(
                config.vnp_ApiUrl + "/query", HttpMethod.POST, entity, String.class
        );
        return response.getBody();
    }

    public static String hmacSHA512(String key, String data) {
        try {
            Mac hmac512 = Mac.getInstance("HmacSHA512");
            SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
            hmac512.init(secretKey);
            byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(bytes);
        } catch (Exception e) {
            throw new RuntimeException("Error while generating HMAC SHA512", e);
        }
    }

    private static String bytesToHex(byte[] hash) {
        StringBuilder hexString = new StringBuilder(2 * hash.length);
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString().toUpperCase();
    }
    public void handleSuccessTransaction(String txnRef, long amount) {
        Optional<VnPayTransaction> existing = vnPayTransactionRepository.findByVnpTxnRef(txnRef);
        if (existing.isPresent() && existing.get().isProcessed()) {
            return;
        }

        VnPayTransaction transaction = existing.orElseThrow(() -> new RuntimeException("Giao dịch không tồn tại"));
        Wallet wallet = transaction.getWallet();

        wallet.setBalance((int)(wallet.getBalance() + amount));
        walletRepository.save(wallet);

        Transaction history = new Transaction();
        history.setWallet(wallet);
        history.setAmount((int)amount);
        history.setBalanceAfter((int) wallet.getBalance());
        history.setDescription("Nạp tiền qua VNPay");
        history.setType(Transaction.TransactionType.DEPOSIT);
        history.setTransactionTime(LocalDateTime.now());
        transactionRepository.save(history);

        transaction.setProcessed(true);
        vnPayTransactionRepository.save(transaction);
    }

    public String createVnPayBooking(Long accountId, Long bookingId, int amount, String bankCode, String locale, String clientIp) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng"));

        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", config.vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100));
        vnp_Params.put("vnp_CurrCode", "VND");

        String txnRef = "BOOK" + config.getRandomNumber(6); // Thêm tiền tố BOOK để phân biệt
        vnp_Params.put("vnp_TxnRef", txnRef);
        vnp_Params.put("vnp_OrderInfo", "Thanh toan don dat xe: " + bookingId);
        vnp_Params.put("vnp_OrderType", "car_booking");
        vnp_Params.put("vnp_Locale", (locale != null) ? locale : "vn");
        vnp_Params.put("vnp_ReturnUrl", config.vnp_ReturnUrl + "?type=booking");
        vnp_Params.put("vnp_IpAddr", clientIp);

        LocalDateTime now = LocalDateTime.now(ZoneId.of("Asia/Ho_Chi_Minh"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        vnp_Params.put("vnp_CreateDate", now.format(formatter));
        vnp_Params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        if (bankCode != null && !bankCode.isEmpty()) {
            vnp_Params.put("vnp_BankCode", bankCode);
        }

        // Lưu thông tin giao dịch
        VnPayTransaction transaction = new VnPayTransaction();
        transaction.setVnpTxnRef(txnRef);
        transaction.setAmount(amount);
        transaction.setProcessed(false);
        transaction.setTransactionTime(LocalDateTime.now());
        transaction.setOrderInfo("BOOKING_" + bookingId); // Thêm prefix để phân biệt
        transaction.setBookingId(bookingId); // Thêm bookingId
        vnPayTransactionRepository.save(transaction);

        // Build query string
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        
        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                
                if (fieldNames.indexOf(fieldName) < fieldNames.size() - 1) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String vnp_SecureHash = hmacSHA512(config.secretKey, hashData.toString());
        return config.vnp_PayUrl + "?" + query + "&vnp_SecureHash=" + vnp_SecureHash;
    }

    @Transactional
    public void processVnPayBookingCallback(Map<String, String> params) {
        String vnpTxnRef = params.get("vnp_TxnRef");
        String vnpResponseCode = params.get("vnp_ResponseCode");
        String orderInfo = params.get("vnp_OrderInfo");

        // Kiểm tra xem có phải giao dịch booking không
        if (!vnpTxnRef.startsWith("BOOK")) {
            return;
        }

        VnPayTransaction transaction = vnPayTransactionRepository.findByVnpTxnRef(vnpTxnRef)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giao dịch"));

        if (transaction.isProcessed()) {
            return; // Tránh xử lý lại giao dịch đã hoàn thành
        }

        // Nếu thanh toán thành công
        if ("00".equals(vnpResponseCode)) {
            Long bookingId = transaction.getBookingId();
            Booking booking = bookingRepository.findById(bookingId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn đặt xe"));

            // Transfer money to car owner's wallet
            Car firstCar = booking.getCars().get(0);
            CarOwner carOwner = firstCar.getCarOwner();
            Account ownerAccount = carOwner.getAccount();
            Customer customer = booking.getCustomer();
            
            String description = String.format("Nhận tiền đặt xe %s từ %s qua VNPAY", 
                booking.getCars().stream()
                    .map(Car::getLicensePlate)
                    .collect(Collectors.joining(", ")),
                customer.getAccount().getProfile().getFirstName());
            
            walletService.deposit(ownerAccount.getId(), transaction.getAmount(), description);

            // Cập nhật trạng thái booking
            booking.setStatus(Car.CarStatus.DEPOSIT);
            booking.getCars().forEach(c -> {
                c.setStatus(Car.CarStatus.DEPOSIT);
                carRepository.save(c);
            });
            booking.setPaymentMethod("VNPAY");
            bookingRepository.save(booking);
        }

        // Cập nhật trạng thái giao dịch
        transaction.setProcessed(true);
        transaction.setVnpResponseCode(vnpResponseCode);
        transaction.setStatus("00".equals(vnpResponseCode) ? "SUCCESS" : "FAILED");
        vnPayTransactionRepository.save(transaction);
    }

}
