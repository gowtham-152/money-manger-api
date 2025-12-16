package com.moneymanage.moneymanager.service;

import com.moneymanage.moneymanager.dto.CategoryDTO;
import com.moneymanage.moneymanager.entity.CategoryEntity;
import com.moneymanage.moneymanager.entity.ProfileEntity;
import com.moneymanage.moneymanager.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final ProfileService profileService;
    private final CategoryRepository categoryRepository;

    public CategoryDTO saveCategory(CategoryDTO dto) {

        ProfileEntity profile = profileService.getCurrentProfile();

        if (categoryRepository.existsByNameAndProfileId(
                dto.getName(), profile.getId())) {
            throw new RuntimeException("Category already exists");
        }

        CategoryEntity entity = CategoryEntity.builder()
                .name(dto.getName())
                .icon(dto.getIcon())
                .type(dto.getType())
                .profile(profile) // 2.44
                .build();

        return toDTO(categoryRepository.save(entity));
    }

    public List<CategoryDTO> getCategoriesForCurrentUser(){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<CategoryEntity> categories = categoryRepository.findByProfileId(profile.getId());
        return categories.stream().map(this::toDTO).toList();
    }


    public List<CategoryDTO> getCategoriesByTypeForCurrentUser(String type){
        ProfileEntity profile = profileService.getCurrentProfile();
        List<CategoryEntity> entities = categoryRepository.findByTypeAndProfileId(type, profile.getId());
        return entities.stream().map(this::toDTO).toList();
    }

    public CategoryDTO updateCategory(Long categoryId, CategoryDTO dto){
        ProfileEntity profile = profileService.getCurrentProfile();
        CategoryEntity existingCategory = categoryRepository.findByIdAndProfileId(categoryId, profile.getId())
                .orElseThrow(() -> new RuntimeException("Category not found or not accessible"));
        existingCategory.setName(dto.getName());
        existingCategory.setIcon(dto.getIcon());
        existingCategory.setType(dto.getType());
        existingCategory = categoryRepository.save(existingCategory);
        return toDTO(existingCategory);
    }

    private CategoryDTO toDTO(CategoryEntity e) {
        return CategoryDTO.builder()
                .id(e.getId())
                .name(e.getName())
                .icon(e.getIcon())
                .type(e.getType())
                .profileId(e.getProfile().getId())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }
}
