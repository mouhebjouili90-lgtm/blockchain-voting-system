# Support de Présentation & Guide des 12 Diapositives : Soutenance Blockchain ENET'Com

Ce document contient l'intégralité du contenu textuel des **12 diapositives** mises à jour avec les informations techniques réelles de notre projet, ainsi que les **notes d'orateur (ce que vous devez dire au jury)** pour chaque diapositive.

Vous pouvez également lancer directement le fichier interactif **[`presentation.html`](file:///c:/Users/INFO%20STORE/Desktop/projetblockchain/presentation.html)** dans votre navigateur pour projeter les diapositives avec les flèches du clavier ou les exporter en PDF (`Ctrl + P`).

---

## 🖥️ Diapositive 1 : Titre & Contexte Institutionnel

- **Titre principal :** Système de Vote Décentralisé sur Blockchain Ethereum
- **Sous-titre :** Architecture d'un scrutin étudiant inviolable, auditable et sans tiers de confiance
- **Badges institutionnels :** ENET'Com Sfax • Université de Sfax | 3ème année Génie Télécommunications (Filière CS)
- **Composants clés mentionnés :** Smart Contract Solidity 0.8.24 • Signature Web3 MetaMask / Ethers.js v6 • DApp React réactive • Validation Hardhat & Sepolia Testnet

> 🗣️ **Note d'orateur (Ce que vous dites) :**  
> *"Monsieur le Président, membres du jury, nous vous présentons aujourd'hui notre projet de fin d'études portant sur la conception et le déploiement d'un système de vote électronique décentralisé sur la blockchain Ethereum, contextualisé pour l'élection des représentants de promotion en 3ème année Génie Télécom à l'ENET'Com Sfax."*

---

## 🖥️ Diapositive 2 : Le problème d'un vote électronique

- **Titre :** Le problème d'un vote électronique
- **Sous-titre :** Avant la technologie, trois défis fondamentaux de confiance et de sécurité.
- **Carte 01 (Cyan) :**
  - **Titre :** Qui peut voter ? — *Authentification Sélective*
  - **Détail :** Restreindre l'accès strictement aux étudiants inscrits (ENET'Com Sfax) tout en **dissociant l'identité civile** de l'adresse publique Ethereum pour préserver l'intimité civique.
- **Carte 02 (Violet) :**
  - **Titre :** Un seul vote ? — *Prévention du Double Vote*
  - **Détail :** Garantir mathématiquement l'unicité du suffrage grâce à un verrouillage booléen on-chain irréversible, sans dépendre de la complaisance d'un opérateur de base de données.
- **Carte 03 (Cyan) :**
  - **Titre :** Peut-on vérifier ? — *Audit & Scellement*
  - **Détail :** Permettre à tout électeur ou membre du jury d'auditer l'intégrité du registre, tout en maintenant les résultats **strictement scellés** jusqu'à la clôture officielle du scrutin.
- **Bandeau bas :** Défi d'ingénierie : Résoudre le trilemme électoral — Éligibilité certifiée • Unicité absolue • Dépouillement vérifiable

> 🗣️ **Note d'orateur :**  
> *"Tout système électoral fait face à un trilemme : vérifier qui vote sans violer l'intimité, empêcher rigoureusement de voter deux fois, et permettre un audit public sans fuite prématurée des tendances."*

---

## 🖥️ Diapositive 3 : Vote classique ou Blockchain ?

- **Titre :** Vote classique ou Blockchain ?
- **Sous-titre :** Même objectif démocratique. Un niveau de garantie et d'auditabilité radicalement opposé.
- **Colonne Gauche (Avant · Système Centralisé Web2 / SQL) :**
  - — **Serveur unique vulnérable :** Un administrateur avec accès root peut altérer silencieusement la table des suffrages.
  - — **Audit opaque "boîte noire" :** Dépouillement interne inaccessible aux électeurs et au jury universitaire.
  - — **Risque de bourrage numérique :** Facilité d'injection de suffrages artificiels par manipulation directe des logs.
  - — **Confiance subjective :** Les participants sont contraints de faire une confiance aveugle à l'organisateur.
- **Colonne Droite (Après · Consensus Distribué Web3 / Ethereum) :**
  - ✓ **Registre immuable partagé :** Chaque transaction de vote est scellée dans un bloc distribué sur les nœuds validateurs.
  - ✓ **Vérification publique universelle :** Tout étudiant peut auditer le Smart Contract et les transactions sur Etherscan.
  - ✓ **Règles inviolables en Solidity :** Même le déployeur/président ne peut ni modifier un vote, ni inverser le vainqueur.
  - ✓ **Confiance décentralisée :** La sincérité du scrutin repose sur la cryptographie asymétrique et le consensus mathématique.
- **Bandeau bas :** Transition de paradigme : Remplacer la confiance envers une personne par la certitude des mathématiques

> 🗣️ **Note d'orateur :**  
> *"Dans une base de données SQL classique, un administrateur système ou un hacker peut modifier un enregistrement sans laisser de trace physique. Sur Ethereum, les règles sont figées dans le bytecode du contrat et validées par consensus distribué."*

---

## 🖥️ Diapositive 4 : La Blockchain en 3 piliers techniques

- **Titre :** La Blockchain en 3 piliers techniques
- **Sous-titre :** Un registre décentralisé infalsifiable plutôt qu'une base de données privative.
- **Pilier 1 (Cyan) : Consensus Distribué**  
  Le registre d'émargement et d'urnes est répliqué sur plusieurs nœuds Ethereum indépendants. Aucun point unique de défaillance (*Single Point of Failure*) ne peut interrompre le scrutin.
- **Pilier 2 (Violet) : Immuabilité SHA-256 / Keccak-256**  
  Chaque suffrage est scellé dans un bloc cryptographique lié au précédent par son empreinte (*Hash*). Tenter de modifier un vote invaliderait la chaîne entière.
- **Pilier 3 (Cyan) : Smart Contracts EVM**  
  Le règlement électoral est compilé en Bytecode Solidity 0.8.24 et exécuté par l'Ethereum Virtual Machine. Les règles s'appliquent automatiquement sans intervention humaine.
- **Bandeau bas :** **Bloc** = lot de votes horodatés • **Hash** = empreinte cryptographique unique • **EVM** = processeur universel Ethereum

> 🗣️ **Note d'orateur :**  
> *"Trois mécanismes garantissent cette sécurité : la distribution du registre, le hachage cryptographique liant chaque bloc au précédent, et l'EVM qui applique le code Solidity à la lettre."*

---

## 🖥️ Diapositive 5 : Notre projet en bref

- **Titre :** Notre projet en bref
- **Sous-titre :** Déploiement concret d'une infrastructure de vote pour l'Université de Sfax.
- **01 Cadre d'application :** Élection officielle des représentants de promotion : **3ème année Génie Télécommunications (Filière CS)** — ENET'Com Sfax.
- **02 Candidatures réelles :** Scrutin à 3 options officielles : **Mouheb Jouili** (Cyber/Réseaux) vs **Oussema Ben Ahmed** (Cloud/Télécom) + **Vote Blanc** officiel.
- **03 Priorités techniques :** Protection infalsifiable anti-double vote, scellement cryptographique des résultats jusqu'à clôture et calcul en temps réel du **quorum légal (≥ 50%)**.
- **04 Double déploiement :** Réseau local **Hardhat Node** (Chain ID 31337) pour les tests instantanés + Réseau public mondial **Ethereum Sepolia Testnet** (Chain ID 11155111).
- **Bandeau bas :** **Objectif :** Offrir une expérience électeur fluide (UX Web3) adossée à une sécurité militaire sans compromis

> 🗣️ **Note d'orateur :**  
> *"Nous avons contextualisé l'élection avec 3 bulletins : Mouheb Jouili, Oussema Ben Ahmed et le Vote Blanc. Nous avons testé le contrat localement sur Hardhat puis déployé sur le réseau public mondial Sepolia."*

---

## 🖥️ Diapositive 6 : Architecture du système (DApp Web3)

- **Titre :** Architecture du système (DApp Web3)
- **Sous-titre :** Une chaîne de confiance décentralisée de bout en bout, sans serveur intermédiaire de vote.
- **Flux des 4 composants :**
  1. **ÉLECTEUR (Cyan) :** Étudiant ENET'Com Sfax s'authentifiant avec son portefeuille Web3.
  2. **INTERFACE REACT (Violet) :** DApp Vite & Glassmorphism avec isoloir numérique et jauge de quorum.
  3. **WALLET METAMASK (Cyan) :** Signature ECDSA secp256k1 de la transaction par clé privée locale.
  4. **SMART CONTRACT (Violet) :** Voting.sol valide l'éligibilité et inscrit le suffrage dans l'EVM Ethereum.
- **Encadré technique :** *Sécurité architecturale : Contrairement à une fausse DApp avec serveur backend centralisé, ici le navigateur dialogue directement avec le nœud RPC Ethereum via Ethers.js v6. Le vote ne transite par aucun serveur propriétaire.*
- **Bandeau bas :** Le client web prépare le bulletin • MetaMask signe avec la clé privée • Le Smart Contract décide et scelle

> 🗣️ **Note d'orateur (Point capital pour le jury !) :**  
> *"Attention à une erreur fréquente : notre DApp ne passe PAS par un serveur Node.js pour voter. L'utilisateur signe sa transaction avec MetaMask, et Ethers.js l'envoie directement aux validateurs de la blockchain."*

---

## 🖥️ Diapositive 7 : Le Smart Contract (Voting.sol)

- **Titre :** Le Smart Contract (Voting.sol)
- **Sous-titre :** Le code Solidity 0.8.24 transforme le règlement électoral en logique mathématique immuable.
- **Garanties et Modificateurs :**
  - ✓ **Contrôle d'accès & Liste blanche :** Modifier `onlyAdmin` et `mapping(address => bool) isAuthorized` avec fonction d'inscription en lot (`authorizeVoters`).
  - ✓ **Unicité absolue du suffrage :** Vérification `require(!hasVoted[msg.sender])` puis verrouillage irréversible `hasVoted[msg.sender] = true`.
  - ✓ **Machine d'états hermétique :** `enum VotingState { NotStarted, Open, Closed }` interdisant tout vote ou dépouillement prématuré.
- **Encart 4 Fonctions fondamentales :**
  - `startVoting()` : Ouvre le bureau (état Open) et déclenche l'événement.
  - `vote(uint256 candidateId)` : Scelle le suffrage et émet l'événement VoteCast.
  - `closeVoting()` : Clôture irrévocable du scrutin (état Closed).
  - `getResults()` & `getWinner()` : Protégées par `onlyWhen(Closed)` : secret total garanti.
- **Bandeau bas :** Entrée autorisée → Règle mathématique vérifiée → Suffrage scellé dans le bloc

> 🗣️ **Note d'orateur :**  
> *"Le contrat implémente une machine d'états stricte : NotStarted, Open, Closed. Tant que l'état n'est pas Closed, la fonction getResults() rejette tout appel pour éviter d'influencer le vote."*

---

## 🖥️ Diapositive 8 : La Stack Technologique Complète

- **Titre :** La Stack Technologique Complète
- **Sous-titre :** Six composants professionnels éprouvés, chacun avec une responsabilité ciblée.
- **Grille des 6 composants :**
  1. **REACT 18 & VITE :** Interface web réactive, isoloir numérique, jauge dynamique de quorum et design glassmorphic ENET'Com.
  2. **SOLIDITY 0.8.24 :** Smart Contract avec gestion d'erreurs natives, optimisations de gas et protection anti-reentrancy.
  3. **ETHERS.JS V6 :** Bibliothèque d'interaction Web3 pour l'encodage ABI, la communication JSON-RPC et l'écoute d'événements.
  4. **WALLET METAMASK :** Gestionnaire de clés cryptographiques du votant, signature sécurisée ECDSA sans exposer la clé privée.
  5. **HARDHAT SUITE :** Nœud local EVM (Chain ID 31337), scripts de déploiement et suite d'audit de **25 tests automatisés**.
  6. **SEPOLIA TESTNET :** Blockchain publique Ethereum de production (Chain ID 11155111) vérifiable publiquement sur Etherscan.
- **Bandeau bas :** **Validation continue :** 25 tests unitaires validés à 100% avec Chai & Hardhat avant tout déploiement

> 🗣️ **Note d'orateur :**  
> *"Notre stack combine React et Vite pour le frontend, Solidity pour le registre, et Hardhat pour les tests. Nous avons automatisé 25 tests unitaires qui couvrent 100% des cas limites."*

---

## 🖥️ Diapositive 9 : Le parcours d'un vote

- **Titre :** Le parcours d'un vote
- **Sous-titre :** De l'authentification de l'étudiant à la preuve infalsifiable sur la blockchain.
- **Les 6 étapes chronologiques :**
  - **1. Connexion :** Détection MetaMask et validation du réseau cible (Sepolia / Hardhat).
  - **2. Éligibilité :** Vérification de l'email académique et présence sur la whitelist du contrat.
  - **3. Choix :** Sélection du bulletin : Mouheb Jouili, Oussema Ben Ahmed ou Vote Blanc.
  - **4. Scellement :** Modale de prévisualisation cryptographique et signature avec MetaMask.
  - **5. Consensus :** Exécution de `vote()` sur l'EVM, minage du bloc et validation du nonce.
  - **6. Preuve On-Chain :** Émission de l'événement `VoteCast`, mise à jour du quorum et reçu.
- **Bandeau bas :** Expérience utilisateur transparente • Confirmation de transaction • Verrouillage anti-double vote immédiat

> 🗣️ **Note d'orateur :**  
> *"Du point de vue de l'étudiant, l'expérience est aussi simple qu'un site Web standard : il choisit son bulletin, prévisualise son scellement et signe avec son portefeuille."*

---

## 🖥️ Diapositive 10 : Démonstration en direct (Scénarios d'audit)

- **Titre :** Démonstration en direct (Scénarios d'audit)
- **Sous-titre :** Quatre tests critiques pour prouver la résilience et la sécurité devant le jury.
- **Les 4 scénarios d'audit :**
  - **01 Vote Valide :** Électeur autorisé votant pour **Mouheb Jouili**. La transaction est minée, le compteur on-chain s'incrémente et le reçu est affiché.
  - **02 Double Vote Rejeté :** Tentative de revoter avec la même adresse. Le bouton est désactivé et le Smart Contract **revert formellement** la transaction.
  - **03 Scrutin Scellé :** Consultation de l'onglet Dépouillement pendant l'élection : message de scellement strict interdisant toute fuite des scores partiels.
  - **04 Clôture & PV PDF :** Clôture par l'admin, révélation du vainqueur, jauge de quorum validée et **génération du Procès-Verbal officiel** prêt pour impression.
- **Bandeau bas :** **Preuve en direct :** Démonstration instantanée sur Hardhat et vérifiable en parallèle sur Sepolia Etherscan

> 🗣️ **Note d'orateur :**  
> *"Nous allons maintenant procéder à la démonstration en direct sur nos 4 scénarios : vote régulier, tentative de double vote bloquée, vérification du scellement, et clôture avec impression du PV."*

---

## 🖥️ Diapositive 11 : Garanties de sécurité et limites réelles

- **Titre :** Garanties de sécurité et limites réelles
- **Sous-titre :** Analyse critique honnête d'ingénieur : ce que la blockchain résout et ce qui reste à couvrir.
- **Colonne Gauche (Ce que le Smart Contract garantit formellement) :**
  - ✓ **Intégrité totale des suffrages :** Zéro altération possible une fois la transaction inscrite dans un bloc.
  - ✓ **Égalité de traitement :** Tout compte est soumis aux mêmes règles sans passe-droit pour l'administrateur.
  - ✓ **Tolérance zéro double vote :** Impossibilité mathématique d'émettre plus d'un bulletin par clé autorisée.
  - ✓ **Dépouillement instantané et certifié :** Décompte automatique éliminant les erreurs humaines et contestations.
- **Colonne Droite (Limites inhérentes au Niveau 1 du cahier des charges) :**
  - × **Pseudonymat vs Anonymat absolu :** L'adresse publique est visible on-chain (exige ZK-SNARKs pour secret total).
  - × **Sécurité du terminal client :** La blockchain ne protège pas si l'ordinateur de l'étudiant est infecté par un malware.
  - × **Protection contre la coercition :** Un vote à distance n'empêche pas un tiers de surveiller l'écran de l'électeur.
  - × **Frais de Gas sur Mainnet :** Nécessité de testnet ou Layer-2 pour éviter des coûts par bulletin trop élevés.
- **Bandeau bas :** **Vision d'ingénieur :** La blockchain sécurise le canal et le registre, l'identité et le secret absolu demandent des briques avancées

> 🗣️ **Note d'orateur (Les jurys adorent cette transparence !) :**  
> *"En tant qu'ingénieurs, nous devons rester lucides : la blockchain résout l'intégrité et l'inviolabilité du registre. Cependant, le secret absolu du vote nécessite des preuves à divulgation nulle de connaissance (zk-SNARKs), car Ethereum est par nature pseudonyme."*

---

## 🖥️ Diapositive 12 : Perspectives d'évolution & Conclusion

- **Titre :** Perspectives d'évolution & Conclusion
- **Sous-titre :** Feuille de route pour une mise en production universitaire à grande échelle.
- **Feuille de route technique :**
  - **01 Preuves à divulgation nulle (zk-SNARKs) :** Prouver qu'on est un étudiant éligible sans jamais révéler son adresse publique ni son choix de vote.
  - **02 Passerelle LDAP / CAS Université de Sfax :** Génération automatique de jetons cryptographiques à usage unique depuis l'annuaire étudiant institutionnel.
  - **03 Déploiement sur Rollup Layer-2 (Arbitrum / Polygon) :** Frais de transaction quasi nuls (< 0.001$) et débit de plus de 2 000 votes par seconde.
  - **04 Chiffrement Homomorphe (Paillier) :** Additionner les votes directement sous forme chiffrée sans jamais déchiffrer les bulletins individuels.
- **Encart de fin :**
  - **MERCI** — Avez-vous des questions ?
  - **École Nationale d'Électronique et des Télécommunications de Sfax**
  - Département Génie Télécommunications • 2026
- **Bandeau bas :** **Conclusion :** La blockchain offre le socle d'inaltérabilité indispensable pour restaurer la confiance dans le vote électronique

> 🗣️ **Note d'orateur :**  
> *"Pour conclure, ce projet prouve la faisabilité d'un vote étudiant 100% transparent et inviolable. Nous vous remercions pour votre attention et sommes à votre entière disposition pour répondre à vos questions."*
