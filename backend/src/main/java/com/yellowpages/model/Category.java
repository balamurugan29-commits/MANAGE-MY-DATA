package com.yellowpages.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "categories")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Category {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "icon_class", length = 20)
    private String iconClass;

    @Column(unique = true, nullable = false, length = 50)
    private String slug;

    @Column(columnDefinition = "NVARCHAR(MAX)")
    private String description;
}
