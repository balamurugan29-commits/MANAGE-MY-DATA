package com.yellowpages.repository;

import com.yellowpages.model.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Integer> {
    List<Inquiry> findByBusinessIdOrderByCreatedAtDesc(Integer businessId);
    List<Inquiry> findByBusinessUserIdOrderByCreatedAtDesc(Integer userId);
    List<Inquiry> findAllByOrderByCreatedAtDesc();
}
