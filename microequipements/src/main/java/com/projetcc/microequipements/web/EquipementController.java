package com.projetcc.microequipements.web;

import com.projetcc.microequipements.model.Equipement;
import com.projetcc.microequipements.repository.EquipementRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/equipements")
public class EquipementController {

    private final EquipementRepository equipementRepository;
    private final RestTemplate restTemplate;

    public EquipementController(EquipementRepository equipementRepository, RestTemplate restTemplate) {
        this.equipementRepository = equipementRepository;
        this.restTemplate = restTemplate;
    }


    //Lister tous les équipements
    @GetMapping
    public List<Equipement> getAll() {
        return equipementRepository.findAll();
    }

    //Consulter un équipement précis par son ID
    @GetMapping("/{id}")
    public Equipement getById(@PathVariable Long id) {
        return equipementRepository.findById(id).orElseThrow(() -> new RuntimeException("Équipement introuvable avec l'ID: " + id));
    }

    //Ajouter un nouvel équipement
    @PostMapping
    public Equipement ajouter(@RequestBody Equipement equipement) {
        return equipementRepository.save(equipement);
    }

    @PutMapping("/{id}/etat")
    public Equipement changerEtat(@PathVariable Long id, @RequestBody Map<String, String> body) {
        Equipement equipement = equipementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Équipement introuvable"));

        String ancienEtat = equipement.getEtat();
        String nouvelEtat = body.get("etat");
        equipement.setEtat(nouvelEtat);
        Equipement equipementSauvegarde = equipementRepository.save(equipement);

        // Envoyer la notification au microservice "Notifications et historique"
        try {
            Map<String, Object> historiqueBody = new HashMap<>();
            historiqueBody.put("action", "CHANGEMENT_ETAT_EQUIPEMENT");
            historiqueBody.put("details", "L'équipement " + equipement.getNom() + " (ID: " + id + ") est passé de " + ancienEtat + " à " + nouvelEtat);
            historiqueBody.put("dateHeure", LocalDateTime.now().toString());

            restTemplate.postForObject("http://26.10.0.202:8085/notifications/historique", historiqueBody, Object.class);  // historique !!!!!!!!!!
            System.out.println("Notification envoyée avec succès !");
        } catch (Exception e) {
            System.out.println("Erreur lors de l'envoi de la notification: " + e.getMessage());
        }

        return equipementSauvegarde;
    }

    //Lister les équipements par catégorie
    @GetMapping("/categorie/{categorie}")
    public List<Equipement> getByCategorie(@PathVariable String categorie) {
        return equipementRepository.findByCategorie(categorie);
    }
}