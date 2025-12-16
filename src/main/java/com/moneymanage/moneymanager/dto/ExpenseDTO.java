package com.moneymanage.moneymanager.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExpenseDTO {

    private Long id;
    private String name;
    private String icon;
    private Long categoryId;
    private String categoryName;
    private LocalDate date;
    private BigDecimal amount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
