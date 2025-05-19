package com.api.API32025.dto;

import com.api.API32025.entity.Brand;

public class BrandDTO {
    private Long id;
    private String brandName;
    private Long categoryId;
    private Long segmentId;
    public Long getId() {
        return id;
    }

    public BrandDTO() {
    }

    public BrandDTO(Brand brand) {
        this.id = brand.getId();
        this.brandName = brand.getBrandName();
    }
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public Long getSegmentId() {
        return segmentId;
    }

    public void setSegmentId(Long segmentId) {
        this.segmentId = segmentId;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBrandName() {
        return brandName;
    }

    public void setBrandName(String brandName) {
        this.brandName = brandName;
    }
}
