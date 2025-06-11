package com.api.API32025.controller.wallet;

import com.api.API32025.dto.wallet.PaymentRequest;
import com.api.API32025.dto.wallet.PaymentResDTO;
import com.api.API32025.dto.wallet.QueryRequest;
import com.api.API32025.dto.wallet.RefundRequest;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@Controller
@RequestMapping("/api/vnpay")
public class VnPayController {

    @Autowired
    private VnPayService vnPayService;
    @Autowired
    private JwtUtil jwtUtil;

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

    @GetMapping("/return")
    public String handleVnpayReturn(@RequestParam Map<String, String> params) {
        String vnp_ResponseCode = params.get("vnp_ResponseCode");
        String vnp_TransactionStatus = params.get("vnp_TransactionStatus");

        if ("00".equals(vnp_ResponseCode) && "00".equals(vnp_TransactionStatus)) {
            String vnp_TxnRef = params.get("vnp_TxnRef");
            long amount = Long.parseLong(params.get("vnp_Amount")) / 100;
            String orderInfo = params.get("vnp_OrderInfo");

            if (orderInfo != null && orderInfo.startsWith("Thanh toan don hang")) {
                // Nạp tiền ví
                vnPayService.handleSuccessTransaction(vnp_TxnRef, amount);
                return "redirect:http://localhost:3000/vi-tien";
            } else if (orderInfo != null && orderInfo.startsWith("Thanh toan don dat xe")) {
                // Thanh toán đặt xe
                vnPayService.processVnPayBookingCallback(params);
                return "redirect:http://localhost:3000/dat-xe/thanh-cong";
            }
        }

        return "redirect:http://localhost:3000/thanh-toan-that-bai";
    }


    private Long extractBookingId(String orderInfo) {
        try {
            String[] parts = orderInfo.split(":");
            return Long.parseLong(parts[1].trim());
        } catch (Exception e) {
            return null;
        }
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

    @GetMapping("/create-booking-payment")
    public ResponseEntity<PaymentResDTO> createBookingPayment(
            @RequestHeader("Authorization") String token,
            @RequestParam Long bookingId,
            @RequestParam int amount,
            @RequestParam(required = false) String bankCode,
            @RequestParam(required = false) String locale,
            HttpServletRequest request
    ) {
        Long accountId = jwtUtil.extractUserId(token.substring(7));
        String clientIp = request.getRemoteAddr();
        String paymentUrl = vnPayService.createVnPayBooking(accountId, bookingId,amount, bankCode, locale, clientIp);
        PaymentResDTO response = new PaymentResDTO("OK", "Thành công", paymentUrl);
        return ResponseEntity.ok(response);
    }

}
