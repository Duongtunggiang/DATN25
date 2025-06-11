package com.api.API32025.controller.chat;

import com.api.API32025.dto.*;
import com.api.API32025.entity.*;
import com.api.API32025.jwt.JwtUtil;
import com.api.API32025.service.AccountService;
import com.api.API32025.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
@RequiredArgsConstructor
public class ChatController {
    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private AccountService accountService;
    @Autowired
    private ChatService chatService;

    @PostMapping("/car/{carId}")
    public ResponseEntity<ChatDTO> createChat(@PathVariable Long carId, @AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(chatService.createChat(carId, account));
    }

    @GetMapping("/customer")
    public ResponseEntity<List<ChatDTO>> getChatsByCustomer(@AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(chatService.getChatsByCustomer(account));
    }

    @GetMapping("/owner")
    public ResponseEntity<List<ChatDTO>> getChatsByCarOwner(@AuthenticationPrincipal Account account) {
        return ResponseEntity.ok(chatService.getChatsByCarOwner(account));
    }

    @DeleteMapping("/{chatId}")
    public ResponseEntity<?> deleteChat(@PathVariable Long chatId, @AuthenticationPrincipal Account account) {
        chatService.deleteChat(chatId, account);
        return ResponseEntity.ok("Đã xoá cuộc trò chuyện");
    }

    @GetMapping("/{chatId}/messages")
    public ResponseEntity<?> getMessages(
            @PathVariable Long chatId,
            @RequestHeader("Authorization") String token
    ) {
        try {
            System.out.println("Received request for chat messages - chatId: " + chatId);
            System.out.println("Received token: " + token);
            
            if (token == null || !token.startsWith("Bearer ")) {
                System.out.println("Invalid token format");
                return ResponseEntity.status(401).body("Token không hợp lệ");
            }
            
            String jwtToken = token.substring(7);
            System.out.println("Extracted JWT token: " + jwtToken);
            
            Long userId = jwtUtil.extractUserId(jwtToken);
            System.out.println("Extracted user ID: " + userId);
            
            Account account = accountService.getAccountById(userId);
            if (account == null) {
                System.out.println("Account not found for user ID: " + userId);
                return ResponseEntity.status(401).body("Không tìm thấy tài khoản");
            }
            System.out.println("Found account: " + account.getUsername());
            
            List<MessageDTO> messages = chatService.getMessagesByChat(chatId, account);
            System.out.println("Retrieved " + messages.size() + " messages");
            
            return ResponseEntity.ok(messages);
        } catch (Exception e) {
            System.err.println("Error in getMessages: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Lỗi server: " + e.getMessage());
        }
    }

    @PostMapping("/{chatId}/messages")
    public ResponseEntity<?> sendMessage(
            @PathVariable Long chatId,
            @RequestParam String content,
            @RequestHeader("Authorization") String token
    ) {
        try {
            Long userId = jwtUtil.extractUserId(token.substring(7));
            Account account = accountService.getAccountById(userId);
            Message message = chatService.sendMessage(chatId,account, content, "text");
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi gửi tin nhắn: " + e.getMessage());
        }
    }
    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("chatId") Long chatId,
            @RequestHeader("Authorization") String token
    ) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Không có file được chọn");
            }

            if (!file.getContentType().startsWith("image/")) {
                return ResponseEntity.badRequest().body("File không phải là ảnh");
            }

            if (file.getSize() > 5 * 1024 * 1024) { // 5MB limit
                return ResponseEntity.badRequest().body("Kích thước file quá lớn (tối đa 5MB)");
            }

            Long userId = jwtUtil.extractUserId(token.substring(7));
            Account account = accountService.getAccountById(userId);
            if (account == null) {
                return ResponseEntity.status(401).body("Không tìm thấy tài khoản");
            }

            Message message = chatService.saveImage(file, chatId, account);
            MessageDTO messageDTO = MessageDTO.fromEntity(message);
            messageDTO.setIsSender(true);
            messageDTO.setSenderAccountId(message.getSender().getId());
            messageDTO.setReceiverAccountId(message.getReceiver().getId());
            messageDTO.setSenderName(message.getSender().getUsername());
            messageDTO.setReceiverName(message.getReceiver().getUsername());
            
            return ResponseEntity.ok(messageDTO);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }
}

