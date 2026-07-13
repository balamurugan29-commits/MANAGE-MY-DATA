package com.yellowpages.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProductRequest {
    @NotBlank
    private String name;

    private String description;
    private Double price;
    private String imageUrl;
}
