// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

/**
 * @title Voting
 * @dev Contrat intelligent pour un système de vote universitaire à scrutin unique.
 * Conforme au cahier des charges :
 * - Administrateur unique pour gérer le scrutin et autoriser les adresses
 * - Liste de candidats figée au déploiement (avec option Vote Blanc)
 * - Gestion du cycle de vie : NonDémarré -> Ouvert -> Fermé
 * - Liste blanche d'adresses autorisées (une voix par électeur)
 * - Consultation des résultats restreinte jusqu'à la clôture officielle
 */
contract Voting {
    // --- STRUCTURES & ENUMÉRATIONS ---

    enum VotingState {
        NotStarted, // Le scrutin est créé mais pas encore ouvert
        Open,       // Les votes sont autorisés
        Closed      // Le scrutin est terminé, les résultats sont disponibles
    }

    struct Candidate {
        uint256 id;
        string name;
        string description;
        uint256 voteCount;
    }

    // Version allégée sans les votes pour la consultation publique avant clôture
    struct CandidateInfo {
        uint256 id;
        string name;
        string description;
    }

    // --- VARIABLES D'ÉTAT ---

    address public immutable admin;
    string public electionTitle;
    VotingState public state;
    
    Candidate[] private candidates;
    
    // Suivi des électeurs
    mapping(address => bool) public isAuthorized;
    mapping(address => bool) public hasVoted;
    
    uint256 public totalVotes;
    uint256 public totalAuthorized;

    // --- ÉVÉNEMENTS ---

    event VotingStarted();
    event VotingClosed();
    event VoterAuthorized(address indexed voter);
    event VotersBatchAuthorized(uint256 count);
    event VoteCast(address indexed voter, uint256 indexed candidateId);

    // --- MODIFICATEURS DE VISIBILITÉ / RESTRICTION ---

    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l'administrateur peut executer cette action");
        _;
    }

    modifier onlyWhen(VotingState expectedState, string memory errorMessage) {
        require(state == expectedState, errorMessage);
        _;
    }

    // --- CONSTRUCTEUR ---

    /**
     * @notice Déploie le contrat avec un titre d'élection et une liste initiale de candidats.
     * @param _electionTitle Titre ou question du scrutin.
     * @param _candidateNames Liste des noms des candidats.
     * @param _candidateDescriptions Descriptions ou professions de foi correspondantes.
     */
    constructor(
        string memory _electionTitle,
        string[] memory _candidateNames,
        string[] memory _candidateDescriptions
    ) {
        require(bytes(_electionTitle).length > 0, "Le titre de l'election est requis");
        require(
            _candidateNames.length >= 2,
            "Il faut au moins 2 options/candidats pour un scrutin"
        );
        require(
            _candidateNames.length == _candidateDescriptions.length,
            "Noms et descriptions doivent avoir la meme taille"
        );

        admin = msg.sender;
        electionTitle = _electionTitle;
        state = VotingState.NotStarted;

        for (uint256 i = 0; i < _candidateNames.length; i++) {
            require(bytes(_candidateNames[i]).length > 0, "Nom de candidat vide");
            candidates.push(
                Candidate({
                    id: i,
                    name: _candidateNames[i],
                    description: _candidateDescriptions[i],
                    voteCount: 0
                })
            );
        }
    }

    // --- GESTION DU SCRUTIN (ADMIN) ---

    /**
     * @notice Ouvre le scrutin pour permettre aux électeurs autorisés de voter.
     */
    function startVoting() external onlyAdmin onlyWhen(VotingState.NotStarted, "Le scrutin ne peut etre ouvert que depuis l'etat NotStarted") {
        state = VotingState.Open;
        emit VotingStarted();
    }

    /**
     * @notice Clôture définitivement le scrutin. Les résultats deviennent alors consultables.
     */
    function closeVoting() external onlyAdmin onlyWhen(VotingState.Open, "Le scrutin ne peut etre ferme que s'il est ouvert") {
        state = VotingState.Closed;
        emit VotingClosed();
    }

    /**
     * @notice Autorise une adresse MetaMask à participer au vote.
     * @param _voter Adresse Ethereum de l'électeur.
     */
    function authorizeVoter(address _voter) external onlyAdmin {
        require(state != VotingState.Closed, "Impossible d'autoriser apres la cloture du scrutin");
        require(_voter != address(0), "Adresse nulle invalide");
        require(!isAuthorized[_voter], "Cette adresse est deja autorisee");

        isAuthorized[_voter] = true;
        totalAuthorized++;

        emit VoterAuthorized(_voter);
    }

    /**
     * @notice Autorise en une seule transaction un lot d'adresses d'électeurs.
     * @param _voters Tableau d'adresses à autoriser.
     */
    function authorizeVoters(address[] calldata _voters) external onlyAdmin {
        require(state != VotingState.Closed, "Impossible d'autoriser apres la cloture du scrutin");
        
        uint256 addedCount = 0;
        for (uint256 i = 0; i < _voters.length; i++) {
            address v = _voters[i];
            if (v != address(0) && !isAuthorized[v]) {
                isAuthorized[v] = true;
                totalAuthorized++;
                addedCount++;
                emit VoterAuthorized(v);
            }
        }
        
        emit VotersBatchAuthorized(addedCount);
    }

    // --- FONCTION DE VOTE (ÉLECTEUR) ---

    /**
     * @notice Permet à un électeur autorisé d'émettre son vote unique pour un candidat.
     * @param _candidateId Identifiant numérique du candidat choisi.
     */
    function vote(uint256 _candidateId) external onlyWhen(VotingState.Open, "Le scrutin n'est pas ouvert") {
        require(isAuthorized[msg.sender], "Vous n'etes pas autorise a voter");
        require(!hasVoted[msg.sender], "Vous avez deja vote");
        require(_candidateId < candidates.length, "Identifiant de candidat invalide");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        totalVotes++;

        emit VoteCast(msg.sender, _candidateId);
    }

    // --- CONSULTATION PUBLIQUE (LECTURE) ---

    /**
     * @notice Retourne le nombre total de candidats.
     */
    function getCandidatesCount() external view returns (uint256) {
        return candidates.length;
    }

    /**
     * @notice Retourne la liste des candidats sans leurs compteurs de votes (visible pendant le scrutin).
     */
    function getCandidatesList() external view returns (CandidateInfo[] memory) {
        CandidateInfo[] memory list = new CandidateInfo[](candidates.length);
        for (uint256 i = 0; i < candidates.length; i++) {
            list[i] = CandidateInfo({
                id: candidates[i].id,
                name: candidates[i].name,
                description: candidates[i].description
            });
        }
        return list;
    }

    /**
     * @notice Retourne les résultats complets avec compteurs de votes.
     * @dev Accessible UNIQUEMENT lorsque le scrutin est officiellement clôturé.
     */
    function getResults() external view onlyWhen(VotingState.Closed, "Les resultats ne sont accessibles qu'apres la cloture du scrutin") returns (Candidate[] memory) {
        return candidates;
    }

    /**
     * @notice Retourne le candidat ayant obtenu le plus grand nombre de voix.
     * @dev Accessible UNIQUEMENT après clôture.
     */
    function getWinner() external view onlyWhen(VotingState.Closed, "Le vainqueur n'est consultable qu'apres la cloture") returns (
        uint256 winnerId,
        string memory winnerName,
        uint256 winnerVotes,
        bool isTie
    ) {
        require(candidates.length > 0, "Aucun candidat");

        uint256 maxVotes = 0;
        uint256 winningIndex = 0;
        bool tie = false;

        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winningIndex = i;
                tie = false;
            } else if (candidates[i].voteCount == maxVotes && maxVotes > 0) {
                tie = true;
            }
        }

        return (
            candidates[winningIndex].id,
            candidates[winningIndex].name,
            maxVotes,
            tie
        );
    }

    /**
     * @notice Retourne le statut électoral de l'appelant (autorisé, a déjà voté).
     */
    function getVoterStatus(address _voter) external view returns (bool authorized, bool voted) {
        return (isAuthorized[_voter], hasVoted[_voter]);
    }
}
