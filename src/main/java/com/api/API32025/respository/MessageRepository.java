package com.api.API32025.respository;

import com.api.API32025.entity.Account;
import com.api.API32025.entity.Chat;
import com.api.API32025.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatAndStatusNot(Chat chat, Message.MessageStatus status);

    List<Message> findBySenderOrReceiver(Account sender, Account receiver);

    List<Message> findByChat(Chat chat);

    Message findTopByChatOrderByTimestampDesc(Chat chat);

    long countByChatAndReceiverAndIsReadFalse(Chat chat, Account receiver);

    List<Message> findByChatAndReceiverAndIsReadFalse(Chat chat, Account receiver);
}

