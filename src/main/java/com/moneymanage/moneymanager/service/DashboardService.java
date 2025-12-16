package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.dto.ExpenseDTO;
import com.moneymanage.moneymanager.dto.IncomeDTO;
import com.moneymanage.moneymanager.dto.RecentTransactionDTO;
import com.moneymanage.moneymanager.entity.ProfileEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import static java.util.stream.Stream.concat;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final IncomeService incomeService;
    private final ExpenseService expenseService;
    private final ProfileService profileService;

    public Map<String, Object> getDashboardData() {

        ProfileEntity profile = profileService.getCurrentProfile();

        // Fetch totals ONCE
        BigDecimal totalIncome = incomeService.getTotalIncomeForCurrentUser();
        BigDecimal totalExpense = expenseService.getTotalExpenseForCurrentUser();
        BigDecimal totalBalance = totalIncome.subtract(totalExpense);

        // Latest transactions
        List<IncomeDTO> latestIncomes =
                incomeService.getLatestFiveIncomesForCurrentUser();

        List<ExpenseDTO> latestExpenses =
                expenseService.getLatestFiveExpensesForCurrentUser();

        List<RecentTransactionDTO> recentTransactions =
                concat(
                        latestIncomes.stream().map(income ->
                                RecentTransactionDTO.builder()
                                        .id(income.getId())
                                        .profileId(profile.getId())
                                        .icon(income.getIcon())
                                        .name(income.getName())
                                        .amount(income.getAmount())
                                        .date(income.getDate())
                                        .createdAt(income.getCreatedAt())
                                        .updatedAt(income.getUpdatedAt())
                                        .type("income")
                                        .build()
                        ),
                        latestExpenses.stream().map(expense ->
                                RecentTransactionDTO.builder()
                                        .id(expense.getId())
                                        .profileId(profile.getId())
                                        .icon(expense.getIcon())
                                        .name(expense.getName())
                                        .amount(expense.getAmount())
                                        .date(expense.getDate())
                                        .createdAt(expense.getCreatedAt())
                                        .updatedAt(expense.getUpdatedAt())
                                        .type("expense") // ✅ FIXED
                                        .build()
                        )
                )
                        .sorted((a, b) -> {
                            int cmp = b.getDate().compareTo(a.getDate());
                            if (cmp == 0 && a.getCreatedAt() != null && b.getCreatedAt() != null) {
                                return b.getCreatedAt().compareTo(a.getCreatedAt());
                            }
                            return cmp;
                        })
                        .toList();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalBalance", totalBalance);
        result.put("totalIncome", totalIncome);
        result.put("totalExpense", totalExpense);
        result.put("recentTransactions", recentTransactions); // ✅ FIXED
        result.put("latestFiveExpenses", latestExpenses);
        result.put("latestFiveIncomes", latestIncomes);

        return result;
    }
}
