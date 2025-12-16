package com.moneymanage.moneymanager.repository;

import com.moneymanage.moneymanager.entity.ProfileEntity;
import org.springframework.context.annotation.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.swing.text.html.Option;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<ProfileEntity, Long> {

    //select * from tbl_profiles where email = ?
    Optional<ProfileEntity> findByEmail(String email);

    //select * from tbl_profiles where activationToken = ?
    Optional<ProfileEntity> findByActivationToken(String activationToken);
}
