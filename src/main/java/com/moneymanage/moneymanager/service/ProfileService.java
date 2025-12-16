package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.dto.AuthDTO;
import com.moneymanage.moneymanager.dto.ProfileDTO;
import com.moneymanage.moneymanager.entity.ProfileEntity;
import com.moneymanage.moneymanager.repository.ProfileRepository;
import com.moneymanage.moneymanager.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class ProfileService {

    private final ProfileRepository profileRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;
    //private AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    @Value("${app.activation.url}")
    private String activationURL;

    @Lazy
    private AuthenticationManager authenticationManager;

    @Autowired
    public void setAuthenticationManager(@Lazy AuthenticationManager authenticationManager) {
        this.authenticationManager = authenticationManager;
    }
    public ProfileDTO registerProfile(ProfileDTO profileDTO){

        ProfileEntity newProfile = toEntity(profileDTO);
        newProfile.setActivationToken(UUID.randomUUID().toString());
        newProfile.setPassword(passwordEncoder.encode(newProfile.getPassword()));
        newProfile = profileRepository.save(newProfile);
        //Send Email
        String activationLink = activationURL+"/api/v1.0/activate?token="+newProfile.getActivationToken();
        String subject = "Activate your Money Manager Account";
        String body = "Click on the following link to activate your account: "+activationLink;
        emailService.sendEmail(newProfile.getEmail(), subject,body);
        return toDTO(newProfile);

    }

    public ProfileEntity toEntity(ProfileDTO profileDTO){
        return ProfileEntity.builder()
                .id(profileDTO.getId())
                .fullName(profileDTO.getFullName())
                .email(profileDTO.getEmail())
                .password(profileDTO.getPassword())
                .profileImageUrl(profileDTO.getProfileImageUrl())
                .createdAt(profileDTO.getCreatedAt())
                .updatedAt(profileDTO.getUpdatedAt())
                .build();
    }

    public ProfileDTO toDTO(ProfileEntity profileEntity){
        return ProfileDTO.builder()
                .id(profileEntity.getId())
                .fullName(profileEntity.getFullName())
                .email(profileEntity.getEmail())
                .profileImageUrl(profileEntity.getProfileImageUrl())
                .createdAt(profileEntity.getCreatedAt())
                .updatedAt(profileEntity.getUpdatedAt())
                .build();
    }

    public boolean activateProfile(String activationToken){
        return profileRepository.findByActivationToken(activationToken)
                .map(profile -> {
                    profile.setIsactive(true);
                    profileRepository.save(profile);
                    return true;
                })
                .orElse(false);

    }

    public boolean isAccountActive(String email){
        return profileRepository.findByEmail(email)
                .map(ProfileEntity::getIsactive)
                .orElse(false);
    }

    public ProfileEntity getCurrentProfile(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        assert authentication != null;
        return profileRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: "+authentication.getName()));
    }

    public ProfileDTO getPublicProfile(String email){
        ProfileEntity currentUser = null;
        if(email == null)
            currentUser = getCurrentProfile();
        else
            currentUser = profileRepository.findByEmail(email)
                    .orElseThrow(() -> new UsernameNotFoundException("Profile not found with email: "+email));

        return ProfileDTO.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .email(currentUser.getEmail())
                .profileImageUrl(currentUser.getProfileImageUrl())
                .createdAt(currentUser.getCreatedAt())
                .updatedAt(currentUser.getUpdatedAt())
                .build();
    }

    public Map<String, Object> authenticateAndGenerateToken(AuthDTO authDTO) {
        try {
//            ProfileEntity profile = profileRepository.findByEmail(authDTO.getEmail())
//                    .orElseThrow(() -> new RuntimeException("User not found"));
//            System.out.println("Password in DB: " + profile.getPassword());
//            System.out.println("Login password: " + authDTO.getPassword());
//            System.out.println("Password matches: " + passwordEncoder.matches(authDTO.getPassword(), profile.getPassword()));

            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(authDTO.getEmail(), authDTO.getPassword())
            );

            ProfileDTO user = getPublicProfile(authDTO.getEmail());
            String token = jwtUtil.generateToken(authDTO.getEmail());
            System.out.println("Generated JWT: " + token);
            return Map.of("token", token, "user", user);

        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid Email and password.");
        } catch (DisabledException e) {
            throw new RuntimeException("Account is not activated.");
        }

    }
}
