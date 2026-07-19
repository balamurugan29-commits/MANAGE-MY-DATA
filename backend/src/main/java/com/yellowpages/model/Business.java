package com.yellowpages.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "businesses")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 25)
    private String name;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "city_id")
    private City city;

    @Column(length = 50)
    private String address;

    @Column(name = "contact_phone", length = 12)
    private String contactPhone;

    @Column(name = "contact_phone2", length = 12)
    private String contactPhone2;

    @Column(name = "contact_phone3", length = 12)
    private String contactPhone3;

    @Column(name = "contact_email", length = 25)
    private String contactEmail;

    @Column(name = "contact_email2", length = 25)
    private String contactEmail2;

    @Column(name = "contact_email3", length = 25)
    private String contactEmail3;

    @Column(length = 25)
    private String website;

    @Column(name = "logo_url", length = 255)
    private String logoUrl;

    @Column(name = "gst_number", length = 15)
    private String gstNumber;

    @Column(name = "area", length = 20)
    private String area;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "is_approved", nullable = false)
    private Boolean isApproved = false; // Admin must approve listings

    @Column(nullable = false)
    private Double rating = 0.0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
