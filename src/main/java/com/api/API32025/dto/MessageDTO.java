package com.api.API32025.dto;

import com.api.API32025.entity.Message;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MessageDTO {
    private Long id;
    private String content;
    private LocalDateTime timestamp;
    private boolean isRead;
    private boolean isSender;
    private Long senderAccountId;
    private Long receiverAccountId;
    private String senderName;
    private String receiverName;
    private String messageType;
    private Message.MessageStatus status;

    public void setIsSender(boolean isSender) {
        this.isSender = isSender;
    }

    public boolean getIsSender() {
        return isSender;
    }

    public static MessageDTO fromEntity(Message message) {
        MessageDTO dto = new MessageDTO();
        dto.setId(message.getId());
        dto.setContent(message.getContent());
        dto.setTimestamp(message.getTimestamp());
        dto.setRead(message.isRead());
        dto.setMessageType(message.getMessageType());
        dto.setStatus(message.getStatus());
        return dto;
    }
} 