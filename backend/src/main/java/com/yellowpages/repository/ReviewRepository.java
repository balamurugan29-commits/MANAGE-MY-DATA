package com.yellowpages.repository;

import com.yellowpages.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {
    List<Review> findByBusinessIdAndIsApprovedTrueOrderByCreatedAtDesc(Integer businessId);
    List<Review> findByBusinessIdOrderByCreatedAtDesc(Integer businessId);
}
