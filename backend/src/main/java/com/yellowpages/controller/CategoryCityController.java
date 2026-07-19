package com.yellowpages.controller;

import com.yellowpages.model.Category;
import com.yellowpages.model.City;
import com.yellowpages.repository.CategoryRepository;
import com.yellowpages.repository.CityRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api")
public class CategoryCityController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CityRepository cityRepository;

    @GetMapping("/categories")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @GetMapping("/cities")
    public ResponseEntity<List<City>> getAllCities() {
        return ResponseEntity.ok(cityRepository.findAll());
    }

    @PostMapping("/cities")
    public ResponseEntity<City> createCity(@RequestBody City city) {
        if (city.getName() == null || city.getName().trim().isEmpty() ||
            city.getState() == null || city.getState().trim().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String nameTrimmed = city.getName().trim();
        String stateTrimmed = city.getState().trim();
        return cityRepository.findByNameAndState(nameTrimmed, stateTrimmed)
                .map(ResponseEntity::ok)
                .orElseGet(() -> {
                    City newCity = new City();
                    newCity.setName(nameTrimmed);
                    newCity.setState(stateTrimmed);
                    return ResponseEntity.ok(cityRepository.save(newCity));
                });
    }
}
