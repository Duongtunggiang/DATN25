package com.api.API32025.service;

import com.api.API32025.dto.*;
import com.api.API32025.entity.*;
import com.api.API32025.respository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatRepository chatRepository;
    private final CustomerRepository customerRepository;
    private final CarRepository carRepository;

    @Autowired
    private CarOwnerRepository carOwnerRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private AccountRepository accountRepository;

    public ChatDTO createChat(Long carId, Account account) {
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));

        Car car = carRepository.findById(carId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy xe"));

        CarOwner carOwner = car.getCarOwner();

        Chat chat = chatRepository.findByCustomerAndCarOwner(customer, carOwner)
                .filter(c -> c.getStatus() != Chat.ChatStatus.DELETED)
                .orElseGet(() -> {
                    Chat newChat = new Chat();
                    newChat.setCustomer(customer);
                    newChat.setCarOwner(carOwner);
                    newChat.setCreatedAt(LocalDateTime.now());
                    newChat.setStatus(Chat.ChatStatus.ACTIVE);
                    return chatRepository.save(newChat);
                });

        return convertToDTO(chat);
    }

    public List<ChatDTO> getChatsByCustomer(Account account) {
        Customer customer = customerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        return chatRepository.findByCustomer(customer).stream()
                .filter(chat -> chat.getStatus() == Chat.ChatStatus.ACTIVE)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ChatDTO> getChatsByCarOwner(Account account) {
        CarOwner owner = carOwnerRepository.findByAccount(account)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chủ xe"));
        return chatRepository.findByCarOwner(owner).stream()
                .filter(chat -> chat.getStatus() == Chat.ChatStatus.ACTIVE)
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public void deleteChat(Long chatId, Account account) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        chat.setStatus(Chat.ChatStatus.DELETED);
        chatRepository.save(chat);
    }

    private ChatDTO convertToDTO(Chat chat) {
        ChatDTO dto = new ChatDTO();
        dto.setId(chat.getId());
        dto.setCustomerId(chat.getCustomer().getId());
        dto.setCustomerName(chat.getCustomer().getAccount().getUsername());
        dto.setCarOwnerId(chat.getCarOwner().getId());
        dto.setCarOwnerName(chat.getCarOwner().getAccount().getUsername());
        dto.setCreatedAt(chat.getCreatedAt());
        dto.setStatus(chat.getStatus());

        // Add account IDs for profile fetching
        dto.setCustomerAccountId(chat.getCustomer().getAccount().getId());
        dto.setCarOwnerAccountId(chat.getCarOwner().getAccount().getId());

        // Get last message
        Message lastMessage = messageRepository.findTopByChatOrderByTimestampDesc(chat);
        if (lastMessage != null) {
            dto.setLastMessage(lastMessage.getContent());
            dto.setLastMessageTime(lastMessage.getTimestamp());
        }

        // Get unread count
        long unreadCount = messageRepository.countByChatAndReceiverAndIsReadFalse(
            chat, 
            chat.getCustomer().getAccount()
        );
        dto.setUnreadCount((int) unreadCount);

        return dto;
    }
    public boolean isCarOwner(Account account) {
        return carOwnerRepository.findByAccount(account).isPresent();
    }

    public boolean isCustomer(Account account) {
        return customerRepository.findByAccount(account).isPresent();
    }

    public Message sendMessage(Long chatId, Account account, String content, String messageType) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

        // Lấy sender là ai: Customer hay CarOwner?
        boolean isCarOwner = carOwnerRepository.findByAccount(account).isPresent();
        boolean isCustomer = customerRepository.findByAccount(account).isPresent();

        if (!isCarOwner && !isCustomer) {
            throw new RuntimeException("Không xác định được vai trò của người dùng");
        }

        Account sender;
        Account receiver;

        if (isCarOwner) {
            sender = chat.getCarOwner().getAccount();
            receiver = chat.getCustomer().getAccount();

            if (!sender.getId().equals(account.getId())) {
                throw new RuntimeException("Bạn không phải là chủ xe trong cuộc trò chuyện này");
            }
        } else { // isCustomer
            sender = chat.getCustomer().getAccount();
            receiver = chat.getCarOwner().getAccount();

            if (!sender.getId().equals(account.getId())) {
                throw new RuntimeException("Bạn không phải là khách hàng trong cuộc trò chuyện này");
            }
        }

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setMessageType(messageType);
        message.setStatus(Message.MessageStatus.SENT);
        message.setRead(false);

        return messageRepository.save(message);
    }


    public void deleteMessage(Long messageId, Account account) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tin nhắn"));

        if (!message.getSender().equals(account)) {
            throw new RuntimeException("Bạn không có quyền xóa tin nhắn này");
        }

        message.setStatus(Message.MessageStatus.DELETED);
        messageRepository.save(message);
    }

    public List<MessageDTO> getMessagesByChat(Long chatId, Account currentUser) {
        try {
            Chat chat = chatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

            // Kiểm tra xem người dùng có quyền truy cập chat này không
            boolean isCarOwner = carOwnerRepository.findByAccount(currentUser).isPresent();
            boolean isCustomer = customerRepository.findByAccount(currentUser).isPresent();

            if (!isCarOwner && !isCustomer) {
                throw new RuntimeException("Không xác định được vai trò của người dùng");
            }

            if (isCarOwner && !chat.getCarOwner().getAccount().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Bạn không có quyền truy cập cuộc trò chuyện này");
            }

            if (isCustomer && !chat.getCustomer().getAccount().getId().equals(currentUser.getId())) {
                throw new RuntimeException("Bạn không có quyền truy cập cuộc trò chuyện này");
            }

            // Mark messages as read
            List<Message> unreadMessages = messageRepository.findByChatAndReceiverAndIsReadFalse(chat, currentUser);
            for (Message message : unreadMessages) {
                message.setRead(true);
                messageRepository.save(message);
            }

            List<Message> messages = messageRepository.findByChatAndStatusNot(chat, Message.MessageStatus.DELETED);

            return messages.stream()
                    .map(message -> {
                        MessageDTO dto = MessageDTO.fromEntity(message);
                        // Set isSender flag based on current user
                        dto.setIsSender(message.getSender().getId().equals(currentUser.getId()));
                        
                        // Add account IDs for profile fetching
                        dto.setSenderAccountId(message.getSender().getId());
                        dto.setReceiverAccountId(message.getReceiver().getId());
                        
                        // Add names for fallback display
                        dto.setSenderName(message.getSender().getUsername());
                        dto.setReceiverName(message.getReceiver().getUsername());
                        
                        return dto;
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi lấy tin nhắn: " + e.getMessage());
        }
    }

    public Message saveImage(MultipartFile file, Long chatId, Account account) {
        try {
            Chat chat = chatRepository.findById(chatId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc trò chuyện"));

            // Create uploads directory if it doesn't exist
            String uploadDir = System.getProperty("user.dir") + "/Images/uploads/chat-images";
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                boolean created = dir.mkdirs();
                if (!created) {
                    throw new RuntimeException("Không thể tạo thư mục lưu ảnh");
                }
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String filename = UUID.randomUUID().toString() + extension;
            String filepath = uploadDir + "/" + filename;

            // Save the file
            File dest = new File(filepath);
            file.transferTo(dest);

            // Create message with image URL - using the path that matches SecurityConfig
            String imageUrl = "/Images/uploads/chat-images/" + filename;
            Message message = new Message();
            message.setChat(chat);
            message.setSender(account);
            message.setReceiver(chat.getCustomer().getAccount().equals(account) ? 
                chat.getCarOwner().getAccount() : chat.getCustomer().getAccount());
            message.setContent(imageUrl);
            message.setTimestamp(LocalDateTime.now());
            message.setMessageType("image");
            message.setStatus(Message.MessageStatus.SENT);
            message.setRead(false);

            return messageRepository.save(message);
        } catch (IOException e) {
            throw new RuntimeException("Lỗi khi lưu ảnh: " + e.getMessage());
        }
    }

}
