package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.dto.ExpenseDTO;
import com.moneymanage.moneymanager.entity.CategoryEntity;
import com.moneymanage.moneymanager.entity.ExpenseEntity;
import com.moneymanage.moneymanager.entity.ProfileEntity;
import com.moneymanage.moneymanager.repository.CategoryRepository;
import com.moneymanage.moneymanager.repository.ExpenseRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final CategoryRepository categoryRepository;
    private final ExpenseRepository expenseRepository;
    private final ProfileService profileService;

    public ExpenseDTO addExpense(ExpenseDTO dto){
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
        ExpenseEntity newExpense = toEntity(dto,profile,category);
        newExpense = expenseRepository.save(newExpense);
        return toDTO(newExpense);

    }

    //Retrieves all expense for currentUser month based start and end date
    public List<ExpenseDTO> getCurrentMonthExpensesForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());
        List<ExpenseEntity> list = expenseRepository.findByProfileIdAndDateBetween(profile.getId(), startDate, endDate);
        return list.stream().map(this::toDTO).toList();

    }

    // Delete the expense id data

    public void deleteExpense(Long expenseId){
        ProfileEntity profile = profileService.getCurrentProfile();
        ExpenseEntity entity = expenseRepository.findById(expenseId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if(!entity.getProfile().getId().equals(profile.getId()))
            throw new RuntimeException(("Unauthorized to delete this expense"));
        expenseRepository.delete(entity);
    }

    //Get latest 5 expenses

    public List<ExpenseDTO> getLatestFiveExpensesForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<ExpenseEntity> list = expenseRepository.findByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    //Total Expense
    public BigDecimal getTotalExpenseForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = expenseRepository.findTotalExpenseByProfileId(profile.getId());
        return total != null ? total:BigDecimal.ZERO;
    }

    //filter expense
    public List<ExpenseDTO> filterExpenses(LocalDate startDate, LocalDate endDate, String keyword, Sort sort){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<ExpenseEntity> list = expenseRepository.findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(profile.getId(),startDate,endDate,keyword,sort);
        return list.stream().map(this::toDTO).toList();
    }

    //Notification
    @Transactional
    public List<ExpenseDTO> getExpensesForUserOnDate(Long profileId, LocalDate date) {
        return expenseRepository
                .findByProfileIdAndDate(profileId, date)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    //Helper method
    private ExpenseEntity toEntity(ExpenseDTO dto, ProfileEntity profile, CategoryEntity category){
        return ExpenseEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .profile(profile)
                .date(dto.getDate())
                .category(category)
                .build();
    }

    private ExpenseDTO toDTO(ExpenseEntity entity){
        return ExpenseDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory() != null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory()!=null ? entity.getCategory().getName() : "N/A")
                .amount(entity.getAmount())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

}
