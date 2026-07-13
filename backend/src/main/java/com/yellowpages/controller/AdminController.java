package com.yellowpages.controller;

import com.yellowpages.model.Business;
import com.yellowpages.model.User;
import com.yellowpages.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InquiryRepository inquiryRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    // Admin view: get all pending listings
    @GetMapping("/pending")
    public ResponseEntity<List<Business>> getPendingListings() {
        return ResponseEntity.ok(businessRepository.findByIsApprovedFalse());
    }

    // Admin action: approve a listing
    @PutMapping("/approve/{id}")
    public ResponseEntity<?> approveListing(@PathVariable Integer id) {
        Optional<Business> businessOpt = businessRepository.findById(id);
        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business listing not found.");
        }

        Business business = businessOpt.get();
        business.setIsApproved(true);
        businessRepository.save(business);
        return ResponseEntity.ok(business);
    }

    // Admin action: toggle verification status
    @PutMapping("/verify/{id}")
    public ResponseEntity<?> toggleVerification(@PathVariable Integer id) {
        Optional<Business> businessOpt = businessRepository.findById(id);
        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business listing not found.");
        }

        Business business = businessOpt.get();
        business.setIsVerified(!business.getIsVerified());
        businessRepository.save(business);
        return ResponseEntity.ok(business);
    }

    // Admin stats: total users, listings, pending approvals, leads etc.
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalListings", businessRepository.count());
        stats.put("approvedListings", businessRepository.countByIsApprovedTrue());
        stats.put("pendingApprovals", businessRepository.findByIsApprovedFalse().size());
        stats.put("verifiedListings", businessRepository.countByIsVerifiedTrue());
        stats.put("totalProducts", productRepository.count());
        stats.put("totalInquiries", inquiryRepository.count());
        stats.put("totalReviews", reviewRepository.count());

        return ResponseEntity.ok(stats);
    }

    // Super Admin: List all admin accounts
    @GetMapping("/users/admins")
    public ResponseEntity<?> getAdmins() {
        return ResponseEntity.ok(userRepository.findByRoleIn(List.of("ROLE_ADMIN", "ROLE_SUPER_ADMIN")));
    }

    // Super Admin: Create a new standard Admin account
    @PostMapping("/users/admins")
    public ResponseEntity<?> createAdmin(@RequestBody User adminReq) {
        if (userRepository.existsByUsername(adminReq.getUsername())) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }
        if (userRepository.existsByEmail(adminReq.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User newAdmin = new User();
        newAdmin.setUsername(adminReq.getUsername());
        newAdmin.setEmail(adminReq.getEmail());
        newAdmin.setPassword(passwordEncoder.encode(adminReq.getPassword()));
        newAdmin.setRole("ROLE_ADMIN"); // Only standard ADMIN accounts can be created this way
        
        userRepository.save(newAdmin);
        return ResponseEntity.ok(newAdmin);
    }

    // Super Admin: Delete an Admin account
    @DeleteMapping("/users/admins/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Integer id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin user not found.");
        }

        User userToDelete = userOpt.get();
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();

        if (userToDelete.getUsername().equals(currentUsername)) {
            return ResponseEntity.badRequest().body("Error: You cannot delete your own admin account!");
        }

        if (userToDelete.getRole().equals("ROLE_SUPER_ADMIN")) {
            return ResponseEntity.badRequest().body("Error: Super Admin accounts cannot be deleted!");
        }

        userRepository.delete(userToDelete);
        return ResponseEntity.ok("Admin account deleted successfully.");
    }
}
