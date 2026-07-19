package com.yellowpages.controller;

import com.yellowpages.dto.BusinessRequest;
import com.yellowpages.dto.ProductRequest;
import com.yellowpages.dto.ReviewRequest;
import com.yellowpages.model.*;
import com.yellowpages.repository.*;
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
public class BusinessController {

    @Autowired
    private BusinessRepository businessRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ReviewRepository reviewRepository;

    // Helper to get authenticated user
    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Error: Authenticated user not found."));
    }

    // PUBLIC: Search directory listings
    @GetMapping("/listings/search")
    public ResponseEntity<List<Business>> search(
            @RequestParam(required = false) String term,
            @RequestParam(required = false) Integer cityId,
            @RequestParam(required = false) Integer categoryId) {
        
        List<Business> results = businessRepository.searchListings(
                term != null && term.trim().isEmpty() ? null : term, 
                cityId, 
                categoryId
        );
        return ResponseEntity.ok(results);
    }

    // PUBLIC: Get detailed information of a single business
    @GetMapping("/listings/{id}")
    public ResponseEntity<?> getListingDetails(@PathVariable Integer id) {
        Optional<Business> businessOpt = businessRepository.findById(id);
        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business not found.");
        }
        return ResponseEntity.ok(businessOpt.get());
    }

    // PUBLIC: Get catalog products of a business
    @GetMapping("/listings/{id}/products")
    public ResponseEntity<List<Product>> getListingProducts(@PathVariable Integer id) {
        return ResponseEntity.ok(productRepository.findByBusinessId(id));
    }

    // PUBLIC: Get reviews of a business
    @GetMapping("/listings/{id}/reviews")
    public ResponseEntity<List<Review>> getListingReviews(@PathVariable Integer id) {
        return ResponseEntity.ok(reviewRepository.findByBusinessIdAndIsApprovedTrueOrderByCreatedAtDesc(id));
    }

    // PUBLIC: Submit a review for a business
    @PostMapping("/listings/{id}/reviews")
    public ResponseEntity<?> submitReview(@PathVariable Integer id, @Valid @RequestBody ReviewRequest reviewReq) {
        Optional<Business> businessOpt = businessRepository.findById(id);
        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business not found.");
        }

        Business business = businessOpt.get();
        Review review = new Review();
        review.setBusiness(business);
        review.setUserName(reviewReq.getUserName());
        review.setRating(reviewReq.getRating());
        review.setComment(reviewReq.getComment());
        review.setIsApproved(true); // Auto-approve for demo simplicity
        reviewRepository.save(review);

        // Recalculate average rating
        List<Review> reviews = reviewRepository.findByBusinessIdAndIsApprovedTrueOrderByCreatedAtDesc(id);
        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        business.setRating(Math.round(avg * 10.0) / 10.0);
        businessRepository.save(business);

        return ResponseEntity.ok(review);
    }

    // PRIVATE: Get listings owned by authenticated business user
    @GetMapping("/listings")
    public ResponseEntity<List<Business>> getMyListings() {
        User user = getAuthenticatedUser();
        List<Business> myList;
        if (user.getRole().equals("ROLE_ADMIN") || user.getRole().equals("ROLE_SUPER_ADMIN") || user.getRole().equals("ROLE_EMPLOYEE")) {
            myList = businessRepository.findAll();
        } else {
            myList = businessRepository.findByUser(user);
        }
        return ResponseEntity.ok(myList);
    }

    // PRIVATE: Create a business listing (Open to all authenticated users)
    @PostMapping("/listings")
    public ResponseEntity<?> createListing(@Valid @RequestBody BusinessRequest request) {
        User user = getAuthenticatedUser();
        
        Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
        Optional<City> cityOpt = cityRepository.findById(request.getCityId());

        if (categoryOpt.isEmpty() || cityOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Invalid Category or City ID.");
        }

        Business business = new Business();
        
        // If creator is admin or employee, support custom owner assignment
        User owner = user;
        if ((user.getRole().equals("ROLE_ADMIN") || user.getRole().equals("ROLE_SUPER_ADMIN") || user.getRole().equals("ROLE_EMPLOYEE")) 
                && request.getUserId() != null) {
            Optional<User> ownerOpt = userRepository.findById(request.getUserId());
            if (ownerOpt.isPresent()) {
                owner = ownerOpt.get();
            }
        }
        business.setUser(owner);
        
        business.setName(request.getName());
        business.setDescription(request.getDescription());
        business.setCategory(categoryOpt.get());
        business.setCity(cityOpt.get());
        business.setAddress(request.getAddress());
        business.setContactPhone(request.getContactPhone());
        business.setContactPhone2(request.getContactPhone2());
        business.setContactPhone3(request.getContactPhone3());
        business.setContactEmail(request.getContactEmail());
        business.setContactEmail2(request.getContactEmail2());
        business.setContactEmail3(request.getContactEmail3());
        business.setWebsite(request.getWebsite());
        business.setLogoUrl(request.getLogoUrl());
        business.setGstNumber(request.getGstNumber());
        business.setArea(request.getArea());
        
        // Auto-approve since creator is Admin/SuperAdmin/Employee
        if (user.getRole().equals("ROLE_ADMIN") || user.getRole().equals("ROLE_SUPER_ADMIN") || user.getRole().equals("ROLE_EMPLOYEE")) {
            business.setIsApproved(true);
        } else {
            business.setIsApproved(false);
        }
        business.setIsVerified(false);
        business.setRating(0.0);

        businessRepository.save(business);
        return ResponseEntity.ok(business);
    }

    // PRIVATE: Update business listing details
    @PutMapping("/listings/{id}")
    public ResponseEntity<?> updateListing(@PathVariable Integer id, @Valid @RequestBody BusinessRequest request) {
        User user = getAuthenticatedUser();
        Optional<Business> businessOpt = businessRepository.findById(id);

        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business listing not found.");
        }

        Business business = businessOpt.get();

        // Security check: Only Admin/SuperAdmin/Employee or the listing owner can update details
        if (!user.getRole().equals("ROLE_ADMIN") && !user.getRole().equals("ROLE_SUPER_ADMIN") && !user.getRole().equals("ROLE_EMPLOYEE") && (business.getUser() == null || !business.getUser().getId().equals(user.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: You are not authorized to update this listing.");
        }

        // If creator is admin or employee, support updating owner association
        if ((user.getRole().equals("ROLE_ADMIN") || user.getRole().equals("ROLE_SUPER_ADMIN") || user.getRole().equals("ROLE_EMPLOYEE")) 
                && request.getUserId() != null) {
            Optional<User> ownerOpt = userRepository.findById(request.getUserId());
            if (ownerOpt.isPresent()) {
                business.setUser(ownerOpt.get());
            }
        }

        Optional<Category> categoryOpt = categoryRepository.findById(request.getCategoryId());
        Optional<City> cityOpt = cityRepository.findById(request.getCityId());

        if (categoryOpt.isEmpty() || cityOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Error: Invalid Category or City ID.");
        }

        business.setName(request.getName());
        business.setDescription(request.getDescription());
        business.setCategory(categoryOpt.get());
        business.setCity(cityOpt.get());
        business.setAddress(request.getAddress());
        business.setContactPhone(request.getContactPhone());
        business.setContactPhone2(request.getContactPhone2());
        business.setContactPhone3(request.getContactPhone3());
        business.setContactEmail(request.getContactEmail());
        business.setContactEmail2(request.getContactEmail2());
        business.setContactEmail3(request.getContactEmail3());
        business.setWebsite(request.getWebsite());
        business.setLogoUrl(request.getLogoUrl());
        business.setGstNumber(request.getGstNumber());
        business.setArea(request.getArea());

        businessRepository.save(business);
        return ResponseEntity.ok(business);
    }

    // PRIVATE: Delete business listing
    @DeleteMapping("/listings/{id}")
    public ResponseEntity<?> deleteListing(@PathVariable Integer id) {
        User user = getAuthenticatedUser();
        Optional<Business> businessOpt = businessRepository.findById(id);

        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business listing not found.");
        }

        Business business = businessOpt.get();

        // Security check: Only Admin/SuperAdmin/Employee can delete
        if (!user.getRole().equals("ROLE_ADMIN") && !user.getRole().equals("ROLE_SUPER_ADMIN") && !user.getRole().equals("ROLE_EMPLOYEE")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: Only administrators or employees can delete listings.");
        }

        businessRepository.delete(business);
        return ResponseEntity.ok("Listing deleted successfully.");
    }

    // PRIVATE: Add product to a business listing catalog
    @PostMapping("/listings/{id}/products")
    public ResponseEntity<?> addProduct(@PathVariable Integer id, @Valid @RequestBody ProductRequest productReq) {
        User user = getAuthenticatedUser();
        Optional<Business> businessOpt = businessRepository.findById(id);

        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business not found.");
        }

        Business business = businessOpt.get();

        // Security check: Only Admin/SuperAdmin/Employee or the listing owner can add products
        if (!user.getRole().equals("ROLE_ADMIN") && 
            !user.getRole().equals("ROLE_SUPER_ADMIN") && 
            !user.getRole().equals("ROLE_EMPLOYEE") && 
            (business.getUser() == null || !business.getUser().getId().equals(user.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: You are not authorized to add products to this listing.");
        }

        Product product = new Product();
        product.setBusiness(business);
        product.setName(productReq.getName());
        product.setDescription(productReq.getDescription());
        product.setPrice(productReq.getPrice());
        product.setImageUrl(productReq.getImageUrl());

        productRepository.save(product);
        return ResponseEntity.ok(product);
    }

    // PRIVATE: Delete product from listing
    @DeleteMapping("/listings/{id}/products/{productId}")
    public ResponseEntity<?> deleteProduct(@PathVariable Integer id, @PathVariable Integer productId) {
        User user = getAuthenticatedUser();
        Optional<Business> businessOpt = businessRepository.findById(id);

        if (businessOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Business not found.");
        }

        Business business = businessOpt.get();

        // Security check: Only Admin/SuperAdmin/Employee or the listing owner can delete products
        if (!user.getRole().equals("ROLE_ADMIN") && 
            !user.getRole().equals("ROLE_SUPER_ADMIN") && 
            !user.getRole().equals("ROLE_EMPLOYEE") && 
            (business.getUser() == null || !business.getUser().getId().equals(user.getId()))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Error: You are not authorized to delete products from this listing.");
        }

        Optional<Product> productOpt = productRepository.findById(productId);
        if (productOpt.isEmpty() || !productOpt.get().getBusiness().getId().equals(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Product not found under this business.");
        }

        productRepository.delete(productOpt.get());
        return ResponseEntity.ok("Product deleted successfully.");
    }

    // AUTHENTICATED: Get all users with ROLE_BUSINESS (for data entry employees/admins to assign listings)
    @GetMapping("/listings/business-users")
    public ResponseEntity<List<User>> getBusinessUsers() {
        User user = getAuthenticatedUser();
        // Security check: Only Admin, SuperAdmin, or Employee can fetch
        if (!user.getRole().equals("ROLE_ADMIN") && 
            !user.getRole().equals("ROLE_SUPER_ADMIN") && 
            !user.getRole().equals("ROLE_EMPLOYEE")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        // Retrieve only business users
        return ResponseEntity.ok(userRepository.findByRole("ROLE_BUSINESS"));
    }
}
