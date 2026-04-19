package com.projetcc.microequipements.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Equipement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String description;
    private String categorie; // ex: "PC", "Serveur", "Imprimante", "Routeur"
    private String etat;      // ex: "ACTIF", "EN_PANNE", "EN_MAINTENANCE"

    public Equipement() {
    }

    public Equipement(String nom, String description, String categorie, String etat) {
        this.nom = nom;
        this.description = description;
        this.categorie = categorie;
        this.etat = etat;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategorie() { return categorie; }
    public void setCategorie(String categorie) { this.categorie = categorie; }

    public String getEtat() { return etat; }
    public void setEtat(String etat) { this.etat = etat; }
}