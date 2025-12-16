package com.moneymanage.moneymanager.repository;

import com.moneymanage.moneymanager.entity.IncomeEntity;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface IncomeRepository extends JpaRepository<IncomeEntity,Long> {

    //profileId and Date =  DESC order
    List<IncomeEntity> findByProfileIdOrderByDateDesc(Long profileId);

    // profileId order by date desc top 5
    List<IncomeEntity> findTopFiveByProfileIdOrderByDateDesc(Long profileId);

    @Query("SELECT SUM(i.amount) FROM IncomeEntity i WHERE i.profile.id= :profileId")
    BigDecimal findTotalIncomeByProfileId(@Param("profileId") Long profileId);

    //profileId and date between  name
    List<IncomeEntity> findByProfileIdAndDateBetweenAndNameContainingIgnoreCase(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate,
            String keyword,
            Sort sort
    );

    List<IncomeEntity> findByProfileIdAndDateBetween(
            Long profileId,
            LocalDate startDate,
            LocalDate endDate
    );


}
