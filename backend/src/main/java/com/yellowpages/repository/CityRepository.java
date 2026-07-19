package com.yellowpages.repository;

import com.yellowpages.model.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CityRepository extends JpaRepository<City, Integer> {
    boolean existsByNameAndState(String name, String state);
    java.util.Optional<City> findByNameAndState(String name, String state);
}
