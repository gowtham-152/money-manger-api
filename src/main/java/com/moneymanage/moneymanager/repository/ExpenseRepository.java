package com.moneymanage.moneymanager.repository;

import com.moneymanage.moneymanager.entity.ExpenseEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<ExpenseEntity,Long> {

    //profileId and Date =  DESC order
    List<ExpenseEntity> findByProfileIdOrderByDateDesc(Long profileId);

    // profileId order by date desc top 5
    List<ExpenseEntity> findTopFiveByProfileIdOrderByDateDesc(Long profileId);

    @Query("SELECT SUM(e.amount) FROM ExpenseEntity e WHERE e.profile.id= :profileId")
    BigDecimal findTotalExpenseByProfileId(@Param("profileId") Long profileId);

    //profileId and date between  name
    List<ExpenseEntity> findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate,
            String keyword,
            Sort sort
    );

    List<ExpenseEntity> findByProfileIdAndDateBetween(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate
    );

    List<ExpenseEntity> findByProfileIdAndDate(Long profileId, LocalDate date);


}
