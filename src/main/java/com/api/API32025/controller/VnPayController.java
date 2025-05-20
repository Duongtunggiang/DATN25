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
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.io.UnsupportedEncodingException;
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

            vnPayService.handleSuccessTransaction(vnp_TxnRef, amount);
        }

        return "redirect:http://localhost:3000/vi-tien";
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

}
