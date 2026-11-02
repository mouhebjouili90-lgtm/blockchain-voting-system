# Rapport de Projet & Guide de Soutenance : Système de Vote Décentralisé sur Blockchain

Ce document regroupe l'ensemble des éléments techniques, la procédure de démonstration et les arguments théoriques nécessaires pour réussir la soutenance orale de votre projet de fin d'études.

---

## 1. Vue d'Ensemble du Projet

- **Problématique :** Comment organiser une élection universitaire transparente, vérifiable par tous, tout en garantissant qu'un électeur ne vote qu'une seule fois et qu'aucun vote ne soit altéré après son émission ?
- **Solution développée :** Une application décentralisée (**DApp**) reposant sur un smart contract Ethereum (Solidity 0.8.24) orchestré avec Hardhat, et une interface moderne en React avec intégration du portefeuille MetaMask (via Ethers.js v6).

---

## 2. Architecture Technique

```
┌────────────────────────────────────────────────────────┐
│                   INTERFACE REACT (Vite)               │
│  - Espace Électeur (Vote sécurisé)                     │
│  - Module de vérification Email Académique             │
│  - Affichage dynamique des Résultats & Vainqueur      │
│  - Dashboard Administrateur (Ouverture / Clôture)      │
└───────────────────────────┬────────────────────────────┘
                            │ Signature Web3 (MetaMask / Ethers.js v6)
                            ▼
┌────────────────────────────────────────────────────────┐
│             SMART CONTRACT SOLIDITY (Voting.sol)        │
│  - Gestion du cycle de vie (NotStarted -> Open -> Closed)
│  - Liste blanche d'adresses autorisées (Whitelist)    │
│  - Prévention infalsifiable du double vote             │
│  - Scellement des résultats jusqu'à la clôture         │
└───────────────────────────┬────────────────────────────┘
                            │ Exécution & Consensus
                            ▼
┌────────────────────────────────────────────────────────┐
│          RÉSEAU BLOCKCHAIN (Hardhat Local / Sepolia)   │
│  - Registre distribué et immuable                      │
│  - Émission d'événements publics (VoteCast, etc.)      │
└────────────────────────────────────────────────────────┘
```

---

## 3. Explication Détaillée des Fonctions du Contrat (`Voting.sol`)

*À réviser attentivement avant la soutenance : chaque fonction peut être interrogée par le jury.*

1. **`constructor(string _electionTitle, string[] _candidateNames, string[] _candidateDescriptions)`** :
   - Initialise le scrutin avec un titre et la liste immuable des candidats.
   - Enregistre le déployeur (`msg.sender`) comme unique administrateur (`admin`).
   - Place l'état initial à `NotStarted`.

2. **`startVoting()`** :
   - Réservé à l'administrateur (`onlyAdmin`).
   - Fait passer l'état à `Open`.
   - Émet l'événement `VotingStarted`.

3. **`closeVoting()`** :
   - Réservé à l'administrateur (`onlyAdmin`).
   - Fait passer l'état à `Closed`.
   - Dès cet instant, les votes sont définitivement bloqués et les résultats deviennent consultables.
   - Émet l'événement `VotingClosed`.

4. **`authorizeVoter(address _voter)` et `authorizeVoters(address[] _voters)`** :
   - Vérifie que le scrutin n'est pas clôturé et que l'adresse n'a pas déjà été autorisée.
   - Ajoute l'adresse au `mapping isAuthorized`.
   - Permet l'inscription en lot pour économiser les frais de transaction.

5. **`vote(uint256 _candidateId)`** :
   - **Vérifications strictes :**
     - Le scrutin est-il `Open` ?
     - L'appelant (`msg.sender`) est-il dans `isAuthorized` ?
     - L'appelant a-t-il déjà voté (`!hasVoted[msg.sender]`) ?
     - L'ID du candidat existe-t-il ?
   - **Effets :** `hasVoted[msg.sender] = true;`, incrémentation de `candidates[_candidateId].voteCount` et de `totalVotes`.
   - Émet l'événement `VoteCast(msg.sender, _candidateId)`.

6. **`getResults()` & `getWinner()`** :
   - Protégés par `onlyWhen(VotingState.Closed)`.
   - Garantit qu'aucun électeur ne peut voir les scores partiels avant la clôture officielle du scrutin, évitant ainsi d'influencer les votes en cours de journée.

---

## 4. Protocole de Test Hardhat (100% Validé)

La suite de tests unitaires (`test/Voting.test.js`) couvre **25 scénarios critiques** :
- **Double vote :** Vérification formelle du rejet avec message d'erreur explicite.
- **Vote hors période :** Rejet des votes émis avant l'ouverture ou après la clôture.
- **Accès non autorisé :** Rejet des votes émis par des adresses non inscrites en liste blanche.
- **Sécurité admin :** Interdiction stricte pour les comptes tiers d'ouvrir, fermer ou modifier la liste blanche.
- **Scellement des résultats :** Impossibilité d'appeler `getResults()` ou `getWinner()` tant que l'état n'est pas `Closed`.
- **Cas d'égalité :** Détection automatique d'un score ex-aequo.

---

## 5. Guide Pratique pour la Démonstration en Direct

### Étape A : Lancer la Blockchain Locale
Dans un premier terminal, à la racine du projet :
```bash
npm run chain
```
*Laisse ce terminal ouvert : il simule 20 comptes Ethereum avec 10 000 ETH chacun.*

### Étape B : Déployer le Contrat et Configurer la Démo
Dans un second terminal :
```bash
npm run deploy:local
```
*(Optionnel pour pré-autoriser les 3 comptes de test : `npm run seed:local`)*

### Étape C : Lancer l'Interface Web
Dans le second terminal :
```bash
npm run frontend
```
Ouvrez votre navigateur sur **http://localhost:3000**.

### Étape D : Déroulement de la Démo devant le Jury
1. **Connexion :** Cliquez sur « Connecter MetaMask » avec le compte Déployeur (Admin).
2. **Ajout Réseau :** Cliquez sur le bouton « Réseau Local Hardhat » pour configurer automatiquement le RPC `http://127.0.0.1:8545` (Chain ID 31337).
3. **Onglet Admin :** Montrez l'état « Scrutin en attente d'ouverture ». Cliquez sur « Ouvrir le bureau de vote ».
4. **Autorisation :** Cliquez sur « Inscrire les 3 comptes de test » pour injecter les adresses étudiantes dans la liste blanche du contrat.
5. **Vote :** Basculez sur le compte Électeur 1 dans MetaMask, sélectionnez le bulletin de **Mouheb Jouili** ou d'**Oussema Ben Ahmed**, puis cliquez sur « Aperçu & Déposer mon bulletin ». La modale de scellement cryptographique s'affiche. Cliquez sur « Confirmer & Signer avec MetaMask ».
6. **Preuve du rejet du double vote :** Tentez de voter une deuxième fois. Montrez le verrouillage du bouton et l'interdiction on-chain.
7. **Secret pendant le scrutin :** Rendez-vous sur l'onglet Procès-verbal. Montrez le message confirmant que les résultats sont scellés sous clé.
8. **Clôture et Révélation :** Revenez sur le compte Admin, cliquez sur « Clôturer définitivement le scrutin ».
9. **Dépouillement & PV Officiel :** Allez sur l'onglet Procès-verbal : le vainqueur, la jauge de quorum et le tableau des suffrages s'affichent. Cliquez sur « Imprimer le Procès-Verbal Officiel (PDF) » pour montrer l'attestation avec le visa du jury ENET'Com.

---

## 6. Clés Privées des Comptes de Test (Hardhat)

Pour importer rapidement ces comptes dans MetaMask :
- **Compte 0 (Admin) :** `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
- **Compte 1 (Électeur 1) :** `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
- **Compte 2 (Électeur 2) :** `0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a`

---

## 7. Réponses aux Questions Fréquentes du Jury

1. **Pourquoi la blockchain est-elle utile ici si l'admin autorise les adresses ?**
   *Réponse :* La blockchain n'a pas vocation à authentifier l'identité physique hors-ligne (c'est le rôle de l'annuaire universitaire / email académique). En revanche, une fois les adresses autorisées, **l'administrateur n'a plus aucun pouvoir de manipulation sur les bulletins émis ni sur le décompte final**. Même s'il le voulait, il ne peut ni modifier un vote, ni en supprimer, ni inverser le vainqueur.

2. **Le vote est-il totalement anonyme ?**
   *Réponse :* Sur une blockchain publique, chaque transaction lie une adresse publique au choix de vote émis. Dans ce prototype (Niveau 1 du cahier des charges), la confidentialité est assurée par le fait que l'adresse Ethereum n'a pas besoin de révéler le nom civil de l'étudiant on-chain. Pour aller plus loin (élections à fort enjeu), les évolutions cibles prévoient le chiffrement *commit-reveal* ou l'utilisation de preuves à divulgation nulle de connaissance (*Zero-Knowledge Proofs - zk-SNARKs*).

3. **Comment passe-t-on sur le réseau public Sepolia ?**
   *Réponse :* Il suffit d'ajouter l'URL RPC de test (ex: via Alchemy ou Infura) et la clé privée du déployeur dans `hardhat.config.js`, puis d'exécuter `npx hardhat run scripts/deploy.js --network sepolia` après avoir alimenté le compte via un faucet gratuit de Sepolia ETH.
