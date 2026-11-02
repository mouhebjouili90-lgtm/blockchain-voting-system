# 🗳️ Blockchain Voting System (dApp)

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-363636?logo=solidity&logoColor=white)](https://soliditylang.org/)
[![Ethereum](https://img.shields.io/badge/Ethereum-EVM%20Compatible-3C3C3D?logo=ethereum&logoColor=white)](https://ethereum.org/)
[![Hardhat](https://img.shields.io/badge/Built%20with-Hardhat-FFF100?logo=hardhat&logoColor=black)](https://hardhat.org/)
[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Ethers.js](https://img.shields.io/badge/Web3-Ethers.js%20v6-2535A0?logo=ethereum&logoColor=white)](https://docs.ethers.org/)
[![Tests](https://img.shields.io/badge/Tests-25%20Passing-brightgreen?logo=mocha&logoColor=white)](https://github.com/mouhebjouili90-lgtm/blockchain-voting-system)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

> **Système de vote électronique décentralisé, transparent et infalsifiable** développé pour les scrutins universitaires et associatifs. Alliant un smart contract Solidity audité à une interface Web3 moderne en React / Ethers.js.

---

## 📌 Présentation du Projet

Dans les organisations et universités, les élections traditionnelles souffrent souvent d'un manque de transparence, de processus de dépouillement manuels lents et de soupçons potentiels de manipulation.

Ce projet résout ces défis en tirant parti de la **technologie Blockchain (Ethereum / EVM)** :
- 🔒 **Registre immuable :** Chaque bulletin de vote est une transaction enregistrée de manière permanente et incorruptible.
- 🎯 **Scrutin à tour unique scellé :** Les résultats partiels sont maintenus secrets pendant la phase de vote pour éliminer tout biais d'influence, puis publiés instantanément dès la clôture officielle.
- 🛡️ **Anti-fraude strict :** Liste blanche cryptographique (whitelisting) gérée par l'administrateur, garantissant rigoureusement **une seule voix par électeur légitime**.
- ⚡ **Expérience utilisateur Web3 fluide :** Intégration native avec **MetaMask**, affichage en temps réel du statut électoral et panneau d'administration interactif.

---

## 🏗️ Architecture Technique

```
                                  ┌──────────────────────────────┐
                                  │      Client Web (Vite + React)│
                                  │  - Interface Électeur        │
                                  │  - Dashboard Administrateur   │
                                  └──────────────┬───────────────┘
                                                 │ Ethers.js v6
                                                 │ MetaMask Provider
                                                 ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     Ethereum Blockchain (Hardhat / Sepolia)             │
│                                                                         │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │                        Voting.sol                               │   │
│   ├─────────────────────────────────────────────────────────────────┤   │
│   │  • Gestion des États : NotStarted ➔ Open ➔ Closed               │   │
│   │  • Liste Blanche : isAuthorized(address) => bool                │   │
│   │  • Émargement : hasVoted(address) => bool                       │   │
│   │  • Candidats fixes + Option "Vote Blanc" au déploiement         │   │
│   │  • Dépouillement automatisé et détection d'égalité              │   │
│   └─────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Fonctionnalités Clés

### 1. Smart Contract (`Voting.sol`)
- **Machine à états stricte :** 
  - `NotStarted` : Inscription des électeurs et préparation du scrutin.
  - `Open` : Scrutin ouvert aux électeurs autorisés.
  - `Closed` : Clôture irréversible et publication instantanée des résultats.
- **Gestion des Électeurs en Batch :** Capacité d'autoriser plusieurs adresses en une seule transaction (`batchAuthorizeVoters`) pour minimiser les frais de gas.
- **Scellement du Dépouillement :** La fonction `getResults()` et l'accès au compte de voix sont strictement verrouillés tant que l'élection n'est pas déclarée close.
- **Support du Vote Blanc :** Option de vote d'abstention constructive intégrée nativement dans la liste des candidats.

### 2. Interface Utilisateur Web3 (`frontend/`)
- **Connexion Web3 & Détection Réseau :** Changement automatique de réseau vers Localhost ou Sepolia Testnet.
- **Panneau Électeur :** Visualisation des candidats, vérification d'éligibilité et émargement en direct.
- **Tableau de Bord Administrateur :**
  - Ajout unitaire ou groupé d'adresses autorisées.
  - Contrôle d'ouverture et de clôture du scrutin.
  - Statistiques de participation en direct (taux de participation, bulletins déposés).
- **Affichage des Résultats Graphiques :** Graphiques comparatifs, mise en avant du vainqueur et gestion des cas d'égalité.

---

## 📂 Structure du Répertoire

```plaintext
├── contracts/
│   └── Voting.sol                # Contrat intelligent principal (Solidity 0.8.24)
├── scripts/
│   ├── deploy.js                 # Déploiement et export ABI/adresses vers le frontend
│   └── seedDemo.js               # Script d'injection de données de test et simulation
├── test/
│   └── Voting.test.js            # Suite complète de tests unitaires (25 tests)
├── frontend/                     # Application Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── App.jsx               # Composant principal d'interface utilisateur
│   │   ├── contractData.json     # ABI et adresse déployée synchronisées
│   │   └── index.css             # Design moderne et responsive
│   └── package.json
├── presentation.html             # Slides interactives pour soutenance / présentation
├── PRESENTATION_SLIDES_CONTENU.md # Script détaillé pour la présentation orale
├── QUESTIONS_REPONSES_JURY_CODE.md # Guide de préparation technique aux questions du jury
├── RAPPORT_ET_SOUTENANCE.md      # Rapport académique et méthodologique
├── hardhat.config.js             # Configuration Hardhat (compilateur, réseaux)
├── package.json
└── README.md
```

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) (version 18 ou supérieure)
- Extension de navigateur [MetaMask](https://metamask.io/)

### 1. Installation
Clonez le dépôt et installez les dépendances du contrat et du frontend :

```bash
# Cloner le projet
git clone https://github.com/mouhebjouili90-lgtm/blockchain-voting-system.git
cd blockchain-voting-system

# Installer les dépendances Hardhat
npm install

# Installer les dépendances Frontend
cd frontend
npm install
cd ..
```

---

### 2. Exécution des Tests Unitaires
Le projet comprend **25 tests automatisés** validant la sécurité, les accès administrateur, l'intégrité du dépouillement et la résistance aux attaques de rejeu :

```bash
npx hardhat test
```

```plaintext
  Contrat Voting (Scrutin Blockchain Universitaire)
    1. Initialisation et Déploiement (5 tests)
    2. Gestion du Cycle de Vie (5 tests)
    3. Autorisation des Électeurs (6 tests)
    4. Processus de Vote & Sécurité (6 tests)
    5. Confidentialité et Résultats (3 tests)

  25 passing (2s)
```

---

### 3. Lancement Local (Développement)

#### Étape A : Démarrer la blockchain locale
```bash
npx hardhat node
```

#### Étape B : Déployer le contrat
Dans un nouveau terminal :
```bash
npm run deploy:local
```
*(Cette commande compile le contrat, le déploie sur le nœud local et met automatiquement à jour `frontend/src/contractData.json`)*.

#### Étape C (Optionnel) : Injecter des votes de démonstration
```bash
npm run seed:local
```

#### Étape D : Lancer l'interface Web3
```bash
cd frontend
npm run dev
```
Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur.

---

### 4. Déploiement sur le Testnet Public Sepolia

1. Copiez le fichier d'environnement modèle :
   ```bash
   cp .env.example .env
   ```
2. Renseignez votre URL RPC (ex. Alchemy ou RPC public) et votre clé privée dans `.env` :
   ```ini
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   PRIVATE_KEY=votre_cle_privee_metamask
   ```
3. Déployez sur Sepolia :
   ```bash
   npm run deploy:sepolia
   ```

---

## 🔒 Considérations de Sécurité & Bonnes Pratiques

- **Reentrancy Protection :** Les modifications d'état (`hasVoted = true`) sont effectuées avant toute émission d'événement et sans appel externe à risque (Pattern Checks-Effects-Interactions).
- **Contrôle d'accès strict :** Modificateurs `onlyAdmin` et `onlyWhen` protégeant les opérations d'ouverture, de clôture et d'autorisation.
- **Zéro fuite de données :** Aucune adresse d'électeur n'est publiquement liée à son choix de candidat sur l'interface publique.
- **Variables immuables :** L'adresse de l'administrateur est marquée `immutable` pour économiser du gas et empêcher toute altération post-déploiement.

---

## 🎓 Matériel de Soutenance & Présentation

Le projet inclut un ensemble complet d'outils pour la présentation devant jury :
- **[presentation.html](presentation.html)** : Diaporama Web interactif prêt pour rétroprojecteur.
- **[RAPPORT_ET_SOUTENANCE.md](RAPPORT_ET_SOUTENANCE.md)** : Rapport complet détaillant les choix d'ingénierie et l'évaluation coût/sécurité.
- **[QUESTIONS_REPONSES_JURY_CODE.md](QUESTIONS_REPONSES_JURY_CODE.md)** : 15+ questions-réponses ciblées pour anticiper les interrogations du jury.

---

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Développé par [Mouheb Jouili](https://github.com/mouhebjouili90-lgtm)**
