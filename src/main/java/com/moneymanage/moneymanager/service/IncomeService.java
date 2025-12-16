package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.dto.ExpenseDTO;
import com.moneymanage.moneymanager.dto.IncomeDTO;
import com.moneymanage.moneymanager.entity.CategoryEntity;
import com.moneymanage.moneymanager.entity.ExpenseEntity;
import com.moneymanage.moneymanager.entity.IncomeEntity;
import com.moneymanage.moneymanager.entity.ProfileEntity;
import com.moneymanage.moneymanager.repository.CategoryRepository;
import com.moneymanage.moneymanager.repository.IncomeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class IncomeService {

    private final CategoryRepository categoryRepository;
    private final IncomeRepository incomeRepository;
    private final ProfileService profileService;

    public IncomeDTO addIncome(IncomeDTO dto){
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));
       IncomeEntity newIncome = toEntity(dto,profile,category);
        newIncome = incomeRepository.save(newIncome);
        return toDTO(newIncome);

    }

    //Retrieves all income for currentUser month based start and end date
    public List<IncomeDTO> getCurrentMonthExpensesForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        LocalDate now = LocalDate.now();
        LocalDate startDate = now.withDayOfMonth(1);
        LocalDate endDate = now.withDayOfMonth(now.lengthOfMonth());
        List<IncomeEntity> list = incomeRepository.findByProfileIdAndDateBetween(profile.getId(), startDate, endDate);
        return list.stream().map(this::toDTO).toList();

    }

    // Delete the expense id data
    public void deleteIncome(Long incomeId){
        ProfileEntity profile = profileService.getCurrentProfile();
        IncomeEntity entity = incomeRepository.findById(incomeId)
                .orElseThrow(() -> new RuntimeException("Expense not found"));
        if(!entity.getProfile().getId().equals(profile.getId()))
            throw new RuntimeException(("Unauthorized to delete this expense"));
        incomeRepository.delete(entity);
    }

    //Get latest 5 incomes
    public List<IncomeDTO> getLatestFiveIncomesForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.findByProfileIdOrderByDateDesc(profile.getId());
        return list.stream().map(this::toDTO).toList();
    }

    //Total Income
    public BigDecimal getTotalIncomeForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        BigDecimal total = incomeRepository.findTotalIncomeByProfileId(profile.getId());
        return total != null ? total:BigDecimal.ZERO;
    }

    //filter income
    public List<IncomeDTO> filterIncomes(LocalDate startDate, LocalDate endDate, String keyword, Sort sort){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<IncomeEntity> list = incomeRepository.findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(profile.getId(),startDate,endDate,keyword,sort);
        return list.stream().map(this::toDTO).toList();
    }

    //Helper method
    private IncomeEntity toEntity(IncomeDTO dto, ProfileEntity profile, CategoryEntity category){
        return IncomeEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .amount(dto.getAmount())
                .profile(profile)
                .date(dto.getDate())
                .category(category)
                .build();
    }

    private IncomeDTO toDTO(IncomeEntity entity){
        return IncomeDTO.builder()
                .id(entity.getId())
                .name(entity.getName())
                .icon(entity.getIcon())
                .categoryId(entity.getCategory()!=null ? entity.getCategory().getId() : null)
                .categoryName(entity.getCategory()!=null ? entity.getCategory().getName() : "N/A")
                .amount(entity.getAmount())
                .date(entity.getDate())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
