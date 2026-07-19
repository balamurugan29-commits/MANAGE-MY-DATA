package com.yellowpages.config;

import com.yellowpages.model.Category;
import com.yellowpages.model.City;
import com.yellowpages.model.User;
import com.yellowpages.repository.CategoryRepository;
import com.yellowpages.repository.CityRepository;
import com.yellowpages.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private CityRepository cityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private void saveCityIfNotExists(String name, String state) {
        if (!cityRepository.existsByNameAndState(name, state)) {
            cityRepository.save(new City(null, name, state));
        }
    }

    @Override
    public void run(String... args) throws Exception {
        // Seed B2B categories if empty
        if (categoryRepository.count() == 0) {
            categoryRepository.save(new Category(null, "Business Services", "business-services", "business-services", "B2B services, consulting, HR, accounting, and marketing."));
            categoryRepository.save(new Category(null, "Real Estate & Construction", "construction-real-estate", "construction-real-estate", "Building materials, builders, contractors, and real estate services."));
            categoryRepository.save(new Category(null, "Engineering Service", "engineering-service", "engineering-service", "Industrial engineering, fabrication, design, and machinery solutions."));
            categoryRepository.save(new Category(null, "Tours, Travels & Hotels", "tours-travels-hotels", "tours-travels-hotels", "Tour packages, hotels, agents, logistics, and hospitality."));
            categoryRepository.save(new Category(null, "Computers & Internet", "computer-software", "computer-software", "Software development, IT hardware, networking, and digital solutions."));
            categoryRepository.save(new Category(null, "Financial & Legal Services", "financial-legal-services", "financial-legal-services", "Banking, loans, legal advisors, patents, and corporate legal services."));
            categoryRepository.save(new Category(null, "Transportation & Logistics", "transportation-logistics-services", "transportation-logistics-services", "Shipping, trucking, warehouse services, packers and movers."));
            categoryRepository.save(new Category(null, "Education & Training", "education-training-services", "education-training-services", "Industrial training, schools, universities, professional courses."));
            categoryRepository.save(new Category(null, "Pharmaceutical & Healthcare", "pharmaceutical-drugs-medicines", "pharmaceutical-drugs-medicines", "Medicines, medical equipment, hospital services, and pharma distribution."));
            categoryRepository.save(new Category(null, "Electronics & Electrical", "electronics-electrical", "electronics-electrical", "Electronic components, wiring, power distribution, and instruments."));
            categoryRepository.save(new Category(null, "Industrial Machinery", "machines", "machines", "Heavy machinery, factory equipment, components, and tools."));
            categoryRepository.save(new Category(null, "Apparel & Fashion Accessories", "apparel-fashion", "apparel-fashion", "Garments, fabrics, textiles, shoes, and luxury items."));
        }

        // Seed popular cities and Tamil Nadu districts
        saveCityIfNotExists("Delhi", "Delhi");
        saveCityIfNotExists("Mumbai", "Maharashtra");
        saveCityIfNotExists("Bengaluru", "Karnataka");
        saveCityIfNotExists("Surat", "Gujarat");
        saveCityIfNotExists("Ahmedabad", "Gujarat");
        saveCityIfNotExists("Pune", "Maharashtra");
        saveCityIfNotExists("Hyderabad", "Telangana");
        saveCityIfNotExists("Kolkata", "West Bengal");
        saveCityIfNotExists("Jaipur", "Rajasthan");
        saveCityIfNotExists("Noida", "Uttar Pradesh");
        saveCityIfNotExists("Gurugram", "Haryana");
        saveCityIfNotExists("Vadodara", "Gujarat");
        saveCityIfNotExists("Ludhiana", "Punjab");

        // Tamil Nadu districts/cities
        saveCityIfNotExists("Ariyalur", "Tamil Nadu");
        saveCityIfNotExists("Chengalpattu", "Tamil Nadu");
        saveCityIfNotExists("Chennai", "Tamil Nadu");
        saveCityIfNotExists("Coimbatore", "Tamil Nadu");
        saveCityIfNotExists("Cuddalore", "Tamil Nadu");
        saveCityIfNotExists("Dharmapuri", "Tamil Nadu");
        saveCityIfNotExists("Dindigul", "Tamil Nadu");
        saveCityIfNotExists("Erode", "Tamil Nadu");
        saveCityIfNotExists("Kallakurichi", "Tamil Nadu");
        saveCityIfNotExists("Kanchipuram", "Tamil Nadu");
        saveCityIfNotExists("Kanniyakumari", "Tamil Nadu");
        saveCityIfNotExists("Karur", "Tamil Nadu");
        saveCityIfNotExists("Krishnagiri", "Tamil Nadu");
        saveCityIfNotExists("Madurai", "Tamil Nadu");
        saveCityIfNotExists("Mayiladuthurai", "Tamil Nadu");
        saveCityIfNotExists("Nagapattinam", "Tamil Nadu");
        saveCityIfNotExists("Namakkal", "Tamil Nadu");
        saveCityIfNotExists("Nilgiris", "Tamil Nadu");
        saveCityIfNotExists("Perambalur", "Tamil Nadu");
        saveCityIfNotExists("Pudukkottai", "Tamil Nadu");
        saveCityIfNotExists("Ramanathapuram", "Tamil Nadu");
        saveCityIfNotExists("Ranipet", "Tamil Nadu");
        saveCityIfNotExists("Salem", "Tamil Nadu");
        saveCityIfNotExists("Sivaganga", "Tamil Nadu");
        saveCityIfNotExists("Tenkasi", "Tamil Nadu");
        saveCityIfNotExists("Thanjavur", "Tamil Nadu");
        saveCityIfNotExists("Theni", "Tamil Nadu");
        saveCityIfNotExists("Thoothukudi", "Tamil Nadu");
        saveCityIfNotExists("Tiruchirappalli", "Tamil Nadu");
        saveCityIfNotExists("Tirunelveli", "Tamil Nadu");
        saveCityIfNotExists("Tirupathur", "Tamil Nadu");
        saveCityIfNotExists("Tiruppur", "Tamil Nadu");
        saveCityIfNotExists("Tiruvallur", "Tamil Nadu");
        saveCityIfNotExists("Tiruvannamalai", "Tamil Nadu");
        saveCityIfNotExists("Tiruvarur", "Tamil Nadu");
        saveCityIfNotExists("Vellore", "Tamil Nadu");
        saveCityIfNotExists("Viluppuram", "Tamil Nadu");
        saveCityIfNotExists("Virudhunagar", "Tamil Nadu");

        // Seed default Admin User (admin / admin123)
        userRepository.findByUsername("admin").ifPresentOrElse(
            admin -> {
                admin.setPassword(passwordEncoder.encode("admin123"));
                userRepository.save(admin);
            },
            () -> {
                User admin = new User();
                admin.setUsername("admin");
                admin.setEmail("admin@yellowpages.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole("ROLE_ADMIN");
                userRepository.save(admin);
            }
        );

        // Seed default Super Admin User (superadmin / super123)
        userRepository.findByUsername("superadmin").ifPresentOrElse(
            superadmin -> {
                superadmin.setPassword(passwordEncoder.encode("super123"));
                userRepository.save(superadmin);
            },
            () -> {
                User superadmin = new User();
                superadmin.setUsername("superadmin");
                superadmin.setEmail("superadmin@yellowpages.com");
                superadmin.setPassword(passwordEncoder.encode("super123"));
                superadmin.setRole("ROLE_SUPER_ADMIN");
                userRepository.save(superadmin);
            }
        );
    }
}
