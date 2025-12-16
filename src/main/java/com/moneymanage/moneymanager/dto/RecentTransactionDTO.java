package com.moneymanage.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class RecentTransactionDTO {
    private Long id;
    private Long profileId;
    private String name;
    private String icon;
    private LocalDate date;
    private BigDecimal amount;
    private String type;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
