package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.entity.ProfileEntity;
import com.moneymanage.moneymanager.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AppUserDetailsService implements UserDetailsService {

    private final ProfileRepository profileRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        ProfileEntity profile = profileRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return User.builder()
                .username(profile.getEmail())
                .password(profile.getPassword()) // must be encoded from DB
                .roles("USER")
                .disabled(!profile.getIsactive()) // only activated users can log in
                .build();
    }

}
