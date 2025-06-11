package com.api.API32025.dto.auth;

import com.api.API32025.entity.Account;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
@Data
public class AccountDTO {
    private Long id;
    private String username;
    private String email;
    private Account.AccountStatus status;

    public AccountDTO() {
    }

    public AccountDTO(Long id, String username, String email) {
        this.id = id;
        this.username = username;
        this.email = email;
    }

    public static AccountDTO fromEntity(Account account) {
        AccountDTO dto = new AccountDTO();
        dto.setId(account.getId());
        dto.setEmail(account.getEmail());
        dto.setStatus(account.getStatus());
        return dto;
    }
}

