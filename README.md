# 🌐 Système Distribué de Gestion des Incidents IT

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=java&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.0-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

Ce projet est un système distribué complet basé sur une **architecture microservices**. Il modélise le cycle de traitement complet des incidents informatiques au sein d'une entreprise : de la déclaration de la panne jusqu'à son affectation, sa résolution et son historisation.

Le respect de la règle d'or des microservices a été rigoureusement appliqué : **Chaque microservice possède sa propre base de données isolée.**

---

## 🏗️ Architecture Globale

Le système est composé de 5 microservices backend indépendants et d'un Dashboard frontend centralisé (Single Page Application) :

| Microservice | Port | Base de Données | Rôle Principal |
| :--- | :--- | :--- | :--- |
| **MS1 : Déclaration Incidents** | `8081` | `db_incidents` | Point d'entrée pour la création des tickets d'incidents. Vérifie les données auprès des autres MS. |
| **MS2 : Affectation & Traitement**| `8082` | `db_affectations` | Gère le cycle de vie du ticket (En cours, Résolu) et l'assigne à un technicien. |
| **MS3 : Utilisateurs & Équipes** | `8083` | `db_utilisateurs` | Référentiel des employés et des techniciens. |
| **MS4 : Équipements & Ressources**| `8084` | `db_equipements` | Gère le parc matériel de l'entreprise (Serveurs, Routeurs, PC) et leur état de santé. |
| **MS5 : Notifications & Historique**| `8085` | `db_notifications`| La "boîte noire" du système. Trace toutes les actions critiques (Logs) de manière globale. |

> **Note :** Le système est supervisé par une interface Web React.js qui communique avec l'ensemble de ces services via des appels API REST.

---

## 🚀 Fonctionnalités Clés

* **Communication Inter-services :** Utilisation de `RestTemplate` pour la composition des services (ex: MS1 interroge MS4 pour vérifier si un équipement existe avant d'ouvrir un ticket).
* **Isolation des Données :** Strictement aucune base de données n'est partagée.
* **Tolérance aux pannes (Health Check) :** Le Dashboard React intègre un système de *Ping* en temps réel pour vérifier quels microservices sont en ligne ou hors ligne.
* **Configuration Dynamique :** L'interface front-end gère dynamiquement les adresses IP locales via le `localStorage` pour faciliter le déploiement et les tests en réseau local entre plusieurs machines.

---

## 🛠️ Technologies Utilisées

### Back-end
* **Java 17** / **Spring Boot**
* **Spring Data JPA** / Hibernate
* **MySQL** (Une base de données par microservice)
* **Swagger / OpenAPI** (Documentation des API)

### Front-end
* **React.js** (Vite)
* **Tailwind CSS** (Styling UI/UX)
* **Fetch API** (Consommation des requêtes HTTP)

---

## ⚙️ Installation et Exécution

### Prérequis
* Java 17 (JDK)
* Node.js & npm
* Serveur MySQL en cours d'exécution

## 👥 Équipe de Développement
Projet réalisé dans le cadre du module Systèmes Distribués à l'EMSI (École Marocaine des Sciences de l'Ingénieur), Filière 4IASDT.
* Bilal EL-Haoudar - Microservice Équipements (MS4) & Interface React
* Ilyas Oulmidi - Microservice Utilisateurs (MS3)
* Ahmed Nahri - Microservice Déclaration Incidents (MS1)
* Ilyas Choqri - Microservice Affectation & Traitement (MS2)
* Anas Lhamri - Microservice Notifications & Historique (MS5)

