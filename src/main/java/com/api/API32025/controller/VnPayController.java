package com.api.API32025.controller;

import com.api.API32025.config.VnPayConfig;
import com.api.API32025.dto.PaymentRequest;
import com.api.API32025.dto.PaymentResDTO;
import com.api.API32025.dto.QueryRequest;
import com.api.API32025.dto.RefundRequest;
import com.api.API32025.entity.Account;
import com.api.API32025.entity.Wallet;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.respository.AccountRepository;
import com.api.API32025.respository.WalletRepository;
import com.api.API32025.service.VnPayService;
import com.api.API32025.service.WalletService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
import java.util.*;

@RestController
@RequestMapping("/api/vnpay")
public class VnPayController {

    @Autowired
    private VnPayService vnPayService;
    @Autowired
    private JwtUtil jwtUtil;

//    @GetMapping("/create-payment")
//    public ResponseEntity<?> createPayment(
//            @RequestParam String orderId,
//            @RequestParam Long amount,
//            @RequestParam String orderInfo) {
//        try {
//            String paymentUrl = vnPayService.createPaymentUrl(orderId, amount, orderInfo);
//            Map<String, Object> response = new HashMap<>();
//            response.put("paymentUrl", paymentUrl);
//            return ResponseEntity.ok(response);
//        } catch (Exception e) {
//            e.printStackTrace();
//            Map<String, String> error = new HashMap<>();
//            error.put("error", "Lỗi khi tạo URL thanh toán");
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
//        }
//    }

    @GetMapping("/create-payment")
    public ResponseEntity<PaymentResDTO> createPayment(
            @RequestHeader("Authorization") String token,
            @RequestParam int amount,
            @RequestParam(required = false) String bankCode,
            @RequestParam(required = false) String locale,
            HttpServletRequest request
    ) {
        Long accountId = jwtUtil.extractUserId(token.substring(7));
        String clientIp = request.getRemoteAddr();
        String paymentUrl = vnPayService.createPaymentUrl(accountId ,amount, bankCode, locale, clientIp);
        PaymentResDTO response = new PaymentResDTO("OK", "Thành công", paymentUrl);
        return ResponseEntity.ok(response);
    }


    @PostMapping("/create-payment")
    public ResponseEntity<?> createPayment(
            @RequestHeader("Authorization") String token,@RequestBody PaymentRequest request, HttpServletRequest servletRequest) {
        Long accountId = jwtUtil.extractUserId(token.substring(7));
        String url = vnPayService.createPaymentUrl(
                accountId,request.getAmount(), request.getBankCode(), request.getLocale(), servletRequest.getRemoteAddr()
        );
        return ResponseEntity.ok(Map.of("code", "00", "message", "success", "data", url));
    }

//    @GetMapping("/return")
//    public ResponseEntity<?> vnpayReturn(@RequestParam Map<String, String> params) {
//        // Xử lý callback, kiểm tra vnp_SecureHash, cập nhật đơn hàng hoặc ví tại đây
//        return ResponseEntity.ok("Giao dịch thành công!");
//    }
    @GetMapping("/return")
    public String handleVnpayReturn(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TransactionStatus = params.get("vnp_TransactionStatus");

        if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
            String vnp_TxnRef = params.get("vnp_TxnRef");
            long amount = Long.parseLong(params.get("vnp_Amount")) / 100; // Vì VNPay trả về *100

            // Gọi service để cộng tiền vào ví dựa trên mã giao dịch
            vnPayService.handleSuccessTransaction(vnp_TxnRef, amount);
        }

        return "redirect:http://localhost:3000/vi-tien"; // hoặc /wallet nếu frontend là SPA
    }

    @PostMapping("/refund")
    public ResponseEntity<?> refund(@RequestBody RefundRequest request, HttpServletRequest servletRequest) {
        String result = vnPayService.refund(request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(result);
    }
    @PostMapping("/query")
    public ResponseEntity<?> query(@RequestBody QueryRequest request, HttpServletRequest servletRequest) {
        String result = vnPayService.query(request, servletRequest.getRemoteAddr());
        return ResponseEntity.ok(result);
    }
//
//    @GetMapping("/return")
//    public String paymentReturn(HttpServletRequest request) {
//        Map<String, String[]> params = request.getParameterMap();
//        Map<String, String> fields = new HashMap<>();
//        for (Map.Entry<String, String[]> entry : params.entrySet()) {
//            fields.put(entry.getKey(), entry.getValue()[0]);
//        }
//
//        // Lấy chữ ký trả về
//        String vnp_SecureHash = fields.remove("vnp_SecureHash");
//        String vnp_SecureHashType = fields.remove("vnp_SecureHashType");
//
//        // Sắp xếp và tạo chuỗi dữ liệu để xác thực chữ ký
//        List<String> fieldNames = new ArrayList<>(fields.keySet());
//        Collections.sort(fieldNames);
//
//        StringBuilder hashData = new StringBuilder();
//        for (String fieldName : fieldNames) {
//            String value = fields.get(fieldName);
//            if ((value != null) && (value.length() > 0)) {
//                hashData.append(fieldName).append('=').append(value).append('&');
//            }
//        }
//
//        // Bỏ ký tự & cuối cùng
//        String data = hashData.substring(0, hashData.length() - 1);
//
//        try {
//            String secureHash = vnPayService.hmacSHA512(VnPayConfig.vnp_HashSecret, data);
//            if (secureHash.equalsIgnoreCase(vnp_SecureHash)) {
//                // Chữ ký đúng, xử lý trạng thái thanh toán
//                String responseCode = fields.get("vnp_ResponseCode");
//                if ("00".equals(responseCode)) {
//                    // Thanh toán thành công
//                    return "Thanh toán thành công cho đơn hàng: " + fields.get("vnp_TxnRef");
//                } else {
//                    // Thanh toán thất bại
//                    return "Thanh toán thất bại, mã lỗi: " + responseCode;
//                }
//            } else {
//                return "Sai chữ ký, không thể xác nhận giao dịch";
//            }
//        } catch (Exception e) {
//            e.printStackTrace();
//            return "Lỗi xác thực chữ ký";
//        }
//    }
}
