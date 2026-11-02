# Application de vote basée sur la blockchain : récapitulatif du projet

## 1. Contexte

- **Type de projet :** projet d'études, prototype fonctionnel
- **Type de vote :** vote à faible enjeu
- **Électeurs :** membres d'une faculté (quelques centaines), identifiables par leurs emails universitaires
- **Niveau de départ :** aucune connaissance préalable de la blockchain ; maîtrise de JavaScript/React

## 2. Ce que la blockchain apporte (et ne résout pas)

**Apport :** un registre public et infalsifiable. Un vote enregistré ne peut plus être modifié ni supprimé, même par l'administrateur, et tout le monde peut vérifier le décompte.

**Limites :** la blockchain ne sait pas si la personne qui vote est un électeur autorisé, ni si elle vote une seule fois. Elle ne garantit pas non plus le secret du vote, car toutes les transactions sont visibles par défaut. Ces points doivent être traités par l'architecture de l'application.

## 3. Décisions prises

| # | Question | Décision |
|---|----------|----------|
| 1 | Type de vote | Vote à faible enjeu, projet d'études, quelques centaines de votants |
| 2 | Qui vote et comment le prouver | Liste blanche d'emails universitaires, vérifiés par un lien ou un code envoyé par email |
| 3 | Secret du vote | Niveau 1 : jeton anonyme à usage unique (pas de commit-reveal ni de preuves à divulgation nulle pour l'instant) |
| 4 | Blockchain | Réseau local Hardhat pour développer, puis réseau de test public Sepolia pour la démo |
| 5 | Autorisation des électeurs | Approche la plus simple : le serveur enregistre l'adresse de l'électeur dans le contrat après vérification de l'email |
| 6 | Ouverture, clôture, résultats | Un administrateur unique ouvre et ferme le scrutin manuellement ; résultats affichés uniquement après la clôture |
| 7 | Nombre de scrutins | Un seul scrutin par contrat, liste fixe de candidats, un seul choix parmi N options (vote blanc facultatif) |

## 4. Architecture

1. **Contrat intelligent (Solidity, Hardhat)** : un scrutin, une liste fixe de candidats, un administrateur qui ouvre et ferme le vote, une liste d'adresses autorisées, un vote par adresse, résultats lisibles après la clôture.
2. **Serveur (Node.js + Express)** : vérifie l'email universitaire, envoie un code, puis appelle le contrat pour autoriser l'adresse de l'électeur.
3. **Base de données (SQLite ou MongoDB)** : liste blanche des emails, état des vérifications.
4. **Interface (React + ethers.js)** : connexion avec MetaMask, inscription, choix du candidat, affichage des résultats après la clôture.

### Déroulé d'un vote

1. L'électeur saisit son email universitaire et son adresse de portefeuille MetaMask.
2. Le serveur vérifie le domaine de l'email et envoie un code de vérification.
3. Après validation du code, le serveur appelle le contrat pour ajouter l'adresse à la liste des électeurs autorisés.
4. L'électeur choisit son candidat dans l'interface et signe la transaction avec MetaMask.
5. Le contrat vérifie que l'adresse est autorisée, que le vote est ouvert et que l'adresse n'a pas déjà voté, puis compte la voix.
6. Après la clôture par l'administrateur, les résultats sont affichés.

## 5. Plan de développement

1. **Comprendre les bases (1 à 2 jours).** Portefeuille, adresse, transaction, contrat intelligent, frais de gaz. Suivre un tutoriel Solidity interactif (par exemple CryptoZombies) ou la documentation officielle de Solidity.
2. **Installer l'environnement.** Node.js, Hardhat, extension MetaMask, éditeur avec extension Solidity.
3. **Écrire le contrat.** Commencer par le minimum (candidats, fonction `voter`, compteur), puis ajouter l'administrateur, l'ouverture/clôture et la liste d'adresses autorisées.
4. **Tester le contrat avec Hardhat.** Cas à couvrir : double vote, vote avant ouverture, vote d'une adresse non autorisée, lecture des résultats avant la clôture.
5. **Construire le serveur.** Route d'inscription avec vérification du domaine de l'email, envoi du code, appel du contrat pour autoriser l'adresse.
6. **Construire l'interface React.** Dans l'ordre : connexion MetaMask, page d'inscription, page de vote, page de résultats.
7. **Déployer sur Sepolia et tester de bout en bout** avec quelques camarades. Récupérer de l'ETH de test via un « faucet » gratuit.
8. **Rédiger les limites dans le rapport** (voir section suivante).

**Premier objectif conseillé :** un contrat qui accepte un vote et refuse le second, testé en local. Tout le reste se greffe dessus.

## 6. Limites connues à documenter dans le rapport

- **Confiance dans l'administrateur :** il constitue la liste des électeurs et contrôle l'ouverture et la clôture. La blockchain protège les votes une fois émis, pas la liste initiale.
- **Le serveur voit l'email et l'adresse** de l'électeur au moment de l'autorisation. Il pourrait, en théorie, faire le lien entre les deux.
- **La liste des adresses autorisées est publique** sur la blockchain.
- **Les compteurs de votes restent techniquement lisibles** pendant le scrutin par quelqu'un qui interroge directement le contrat ; le masquage des résultats n'existe que dans l'interface.
- **La liste des candidats est figée** après le déploiement du contrat.
- **Le serveur envoie une transaction par électeur** : gratuit sur un réseau de test, payant sur un réseau réel.
- **Vote en ligne et élections officielles :** ce prototype n'est pas adapté à un scrutin à fort enjeu (identité, coercition, achat de votes, secret garanti).

## 7. Pistes d'amélioration

- **Secret renforcé :** chiffrement des votes avec dévoilement à la fin (*commit-reveal*), ou preuves à divulgation nulle de connaissance.
- **Autorisation par signature :** le serveur signe une autorisation vérifiée par le contrat (`ecrecover`), ce qui évite une transaction d'inscription par électeur.
- **Plusieurs scrutins :** un contrat « fabrique » qui crée un contrat par élection.
- **Ouverture et clôture automatiques** par dates, au lieu d'une action manuelle de l'administrateur.
- **Autres formats de vote :** oui/non/abstention, classement, choix multiples.

## 8. Version réduite pour la livraison (échéance : demain)

Le projet est à rendre demain et sera réalisé en vibe coding (Claude Code ou Antigravity). Le périmètre est donc réduit pour tenir en une journée. L'architecture complète des sections 3 et 4 reste la cible, présentée comme évolution dans le rapport.

### À garder (le cœur)

- Le contrat Solidity : candidats, ouverture/clôture par l'administrateur, liste d'adresses autorisées, un vote par adresse, résultats après clôture.
- Les tests Hardhat : double vote, vote d'une adresse non autorisée, vote avant ouverture, lecture des résultats avant la clôture.
- Une petite interface React avec MetaMask : voter et afficher les résultats.

### À simplifier ou simuler

- **Vérification des emails :** pas d'envoi de codes. Un script administrateur autorise une liste d'adresses de test. Si le temps le permet, ajouter un petit serveur Express avec une liste blanche d'emails codée en dur. La vérification par email universitaire est présentée comme l'étape suivante.
- **Sepolia :** à faire en dernier, uniquement s'il reste du temps. Une démo sur Hardhat en local est acceptable pour un prototype.

### Planning réaliste

| Étape | Durée indicative | Contenu |
|-------|------------------|---------|
| 1 | Heure 1 | Installer Node.js, Hardhat, MetaMask ; faire créer le projet Hardhat par l'agent |
| 2 | Heures 2-3 | Contrat + tests, jusqu'à ce que tous les tests passent |
| 3 | Heures 4-5 | Interface React branchée sur le réseau local |
| 4 | Heure 6 | Démo complète en local avec 3 ou 4 comptes de test |
| 5 | Heure 7 | Déploiement Sepolia (bonus), rédaction du rapport et de la soutenance |

### Bonnes pratiques de vibe coding

- Donner ce fichier `.md` à l'agent comme cahier des charges et lui demander de travailler **étape par étape** : d'abord le contrat et ses tests, puis l'interface.
- Après chaque étape, exécuter `npx hardhat test` et ne passer à la suite que lorsque tous les tests passent.
- Se faire expliquer chaque fonction du contrat, car elle devra être défendue à l'oral.
- Si une étape bloque plus d'une heure (MetaMask, réseau local), simplifier plutôt qu'insister.

### Risques à surveiller

1. Du code généré qui semble fonctionner mais contient un bug de logique (par exemple un double vote possible). Les tests sont la protection principale.
2. Un temps excessif passé à déboguer MetaMask et le réseau local.
3. Un livrable que l'on ne sait pas expliquer : relire et comprendre le contrat avant la soutenance.
