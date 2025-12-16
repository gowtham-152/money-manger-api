package com.moneymanage.moneymanager.repository;

import com.moneymanage.moneymanager.entity.CategoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<CategoryEntity, Long> {

    //profile_id find query
    List<CategoryEntity> findByProfileId(Long profileId);

    //id and profile_id
    Optional<CategoryEntity> findByIdAndProfileId(Long id, Long profileId);

    //type and profile_id
    List<CategoryEntity> findByTypeAndProfileId(String type,Long profileId);

    //name and profile_id
    Boolean existsByNameAndProfileId(String name, Long profileId);


}
