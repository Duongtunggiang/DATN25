package com.api.API32025.controller;

import com.api.API32025.AI.ChatBot;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/chatbot")
public class ChatBotController {

    private final List<ChatMessage> chatHistory = new ArrayList<>();

    @PostMapping("/ask")
    public ResponseEntity<String> askBot(@RequestBody ChatRequest request) {
        String input = request.getMessage();

        String reply = ChatBot.askPythonAPI(input);
        if (reply == null) {
            reply = ChatBot.askGeminiAI(input);
        }

        chatHistory.add(new ChatMessage("User", input));
        chatHistory.add(new ChatMessage("Bot", reply));

        return ResponseEntity.ok(reply);
    }

    @GetMapping("/messages")
    public ResponseEntity<List<ChatMessage>> getMessages() {
        return ResponseEntity.ok(chatHistory);
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
