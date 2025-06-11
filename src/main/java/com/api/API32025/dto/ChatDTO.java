package com.api.API32025.dto;

import com.api.API32025.entity.Chat;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Data
public class ChatDTO {
    private Long id;
    private Long customerId;
    private String customerName;
    private Long carOwnerId;
    private String carOwnerName;
    private LocalDateTime createdAt;
    private Chat.ChatStatus status;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private int unreadCount;
    private Long customerAccountId;
    private Long carOwnerAccountId;
}

