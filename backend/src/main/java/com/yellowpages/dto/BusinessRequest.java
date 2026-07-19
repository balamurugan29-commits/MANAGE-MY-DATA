package com.yellowpages.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BusinessRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Integer categoryId;

    @NotNull
    private Integer cityId;

    private String address;
    private String contactPhone;
    private String contactPhone2;
    private String contactPhone3;
    private String contactEmail;
    private String contactEmail2;
    private String contactEmail3;
    private String website;
    private String logoUrl;
    private String gstNumber;
    private String area;
    private Integer userId;
}
