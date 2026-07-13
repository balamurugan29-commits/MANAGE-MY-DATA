package com.yellowpages.repository;

import com.yellowpages.model.Business;
import com.yellowpages.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Integer> {
    List<Business> findByUser(User user);
    List<Business> findByIsApprovedFalse();
    List<Business> findByIsApprovedTrue();

    @Query("SELECT b FROM Business b WHERE b.isApproved = true " +
           "AND (:term IS NULL OR LOWER(b.name) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "OR LOWER(b.category.name) LIKE LOWER(CONCAT('%', :term, '%')) " +
           "OR LOWER(b.address) LIKE LOWER(CONCAT('%', :term, '%'))) " +
           "AND (:cityId IS NULL OR b.city.id = :cityId) " +
           "AND (:categoryId IS NULL OR b.category.id = :categoryId)")
    List<Business> searchListings(
        @Param("term") String term,
        @Param("cityId") Integer cityId,
        @Param("categoryId") Integer categoryId
    );

    long countByIsApprovedTrue();
    long countByIsVerifiedTrue();
}
