package com.yellowpages.controller;

import com.yellowpages.dto.InquiryRequest;
import com.yellowpages.model.Business;
import com.yellowpages.model.Inquiry;
import com.yellowpages.model.User;
import com.yellowpages.repository.BusinessRepository;
import com.yellowpages.repository.InquiryRepository;
import com.yellowpages.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class InquiryController {

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    // Helper to get authenticated user
    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found."));
    }

    // PUBLIC: Submit inquiry to a business (Leads generation)
    @PostMapping("/listings/{id}/inquiries")
    public ResponseEntity<?> submitInquiry(@PathVariable Integer id, @Valid @RequestBody InquiryRequest request) {
        Optional<Business> businessOpt = businessRepository.findById(id);
        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business not found.");
        }

        Business business = businessOpt.get();
        Inquiry inquiry = new Inquiry();
        inquiry.setBusiness(business);
        inquiry.setSenderName(request.getSenderName());
        inquiry.setSenderEmail(request.getSenderEmail());
        inquiry.setSenderPhone(request.getSenderPhone());
        inquiry.setMessage(request.getMessage());
        inquiry.setStatus("PENDING");

        inquiryRepository.save(inquiry);
        return ResponseEntity.ok(inquiry);
    }

    // PRIVATE: Get all inquiries received by the authenticated owner's listings
    @GetMapping("/inquiries")
    public ResponseEntity<?> getMyInquiries() {
        User user = getAuthenticatedUser();
        List<Inquiry> inquiries = inquiryRepository.findByBusinessUserIdOrderByCreatedAtDesc(user.getId());
        return ResponseEntity.ok(inquiries);
    }

    // PRIVATE: Mark inquiry as READ / RESPONDED
    @PutMapping("/inquiries/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer id) {
        User user = getAuthenticatedUser();
        Optional<Inquiry> inquiryOpt = inquiryRepository.findById(id);

        if (inquiryOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Inquiry not found.");
        }

        Inquiry inquiry = inquiryOpt.get();

        // Check if listing belongs to authenticated user
        if (!inquiry.getBusiness().getUser().getId().equals(user.getId()) && !user.getRole().contains("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Permission denied.");
        }

        inquiry.setStatus("READ");
        inquiryRepository.save(inquiry);
        return ResponseEntity.ok(inquiry);
    }
}
