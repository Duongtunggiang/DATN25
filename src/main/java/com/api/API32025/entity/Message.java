package com.api.API32025.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String content;

    private String messageType;

    private LocalDateTime timestamp;

    @Enumerated(EnumType.STRING)
    private MessageStatus status = MessageStatus.SENT;

    private boolean isRead = false;

    private boolean isReported = false;

    @ManyToOne
    @JoinColumn(name = "chat_id", nullable = false)
    @JsonBackReference
    private Chat chat;

    @ManyToOne
    @JoinColumn(name = "sender_account_id", nullable = false)
    private Account sender;

    @ManyToOne
    @JoinColumn(name = "receiver_account_id", nullable = false)
    private Account receiver;

    public enum MessageStatus {
        SENT,
        DELETED,
        REPORTED
    }
}
