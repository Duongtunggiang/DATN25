package com.api.API32025.controller.chatbot;

import com.api.API32025.AI.ChatBot;
import com.api.API32025.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chatbot")
public class ChatBotController {
    @Autowired
    private JwtUtil jwtUtil;

    private final List<ChatMessage> chatHistory = new ArrayList<>();
    private final Map<Long, List<ChatMessage>> chatHistories = new HashMap<>();


    @PostMapping("/ask")
    public ResponseEntity<String> askBot(
            @RequestHeader("Authorization") String token,
            @RequestBody ChatRequest request) {
        Long accountId = jwtUtil.extractUserId(token.substring(7));
        String input = request.getMessage();

        String reply = ChatBot.askPythonAPI(input);
        if (reply == null) {
            reply = ChatBot.askGeminiAI(input);
        }

        chatHistories.putIfAbsent(accountId, new ArrayList<>());
        chatHistories.get(accountId).add(new ChatMessage("User", input));
        chatHistories.get(accountId).add(new ChatMessage("Bot", reply));

        return ResponseEntity.ok(reply);
    }


    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages(
            @RequestHeader("Authorization") String token) {
        Long accountId = jwtUtil.extractUserId(token.substring(7));
        List<ChatMessage> history = chatHistories.getOrDefault(accountId, new ArrayList<>());
        return ResponseEntity.ok(history);
    }


    public static class ChatRequest {
        private String message;
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ChatMessage {
        private String sender;
        private String content;

        public ChatMessage() {}

        public ChatMessage(String sender, String content) {
            this.sender = sender;
            this.content = content;
        }

        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }

        public String getContent() { return content; }
        public void setContent(String content) { this.content = content; }
    }
}
