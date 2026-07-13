package com.yellowpages.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class InquiryRequest {
    @NotBlank
    private String senderName;

    @NotBlank
    private String senderEmail;

    private String senderPhone;

    @NotBlank
    private String message;
}
