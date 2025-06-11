package com.api.API32025.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "provinces")
public class Province {
    @Id
    private String code;
    private String name;
    private String nameEn;
    private String fullName;
    private String fullNameEn;
    private String codeName;
    private Integer administrativeUnitId;
    private Integer administrativeRegionId;

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFullNameEn() {
        return fullNameEn;
    }

    public void setFullNameEn(String fullNameEn) {
        this.fullNameEn = fullNameEn;
    }

    public String getCodeName() {
        return codeName;
    }

    public void setCodeName(String codeName) {
        this.codeName = codeName;
    }

    public Integer getAdministrativeUnitId() {
        return administrativeUnitId;
    }

    public void setAdministrativeUnitId(Integer administrativeUnitId) {
        this.administrativeUnitId = administrativeUnitId;
    }

    public Integer getAdministrativeRegionId() {
        return administrativeRegionId;
    }

    public void setAdministrativeRegionId(Integer administrativeRegionId) {
        this.administrativeRegionId = administrativeRegionId;
    }
} 