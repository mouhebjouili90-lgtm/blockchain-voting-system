const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Contrat Voting (Scrutin Blockchain Universitaire)", function () {
  let voting;
  let admin, voter1, voter2, voter3, nonAuthorizedUser;
  
  const electionTitle = "Election des delegues de promotion 2026";
  const candidateNames = ["Alice Martin", "Bob Dupont", "Vote Blanc"];
  const candidateDescriptions = [
    "Programme axe sur les ressources numeriques et le tutorat",
    "Programme axe sur les activites sportives et associatives",
    "Vote d'abstention constructive / aucun des candidats"
  ];

  beforeEach(async function () {
    [admin, voter1, voter2, voter3, nonAuthorizedUser] = await ethers.getSigners();

    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy(
      electionTitle,
      candidateNames,
      candidateDescriptions
    );
    await voting.waitForDeployment();
  });

  describe("1. Initialisation et Déploiement", function () {
    it("Définit correctement l'administrateur", async function () {
      expect(await voting.admin()).to.equal(admin.address);
    });

    it("Initialise le titre du scrutin et le statut NotStarted (0)", async function () {
      expect(await voting.electionTitle()).to.equal(electionTitle);
      expect(await voting.state()).to.equal(0); // VotingState.NotStarted
    });

    it("Enregistre correctement les candidats", async function () {
      const count = await voting.getCandidatesCount();
      expect(count).to.equal(3);

      const list = await voting.getCandidatesList();
      expect(list.length).to.equal(3);
      expect(list[0].name).to.equal("Alice Martin");
      expect(list[1].name).to.equal("Bob Dupont");
      expect(list[2].name).to.equal("Vote Blanc");
    });

    it("Rejette le déploiement avec moins de 2 candidats", async function () {
      const VotingFactory = await ethers.getContractFactory("Voting");
      await expect(
        VotingFactory.deploy("Titre", ["Seul"], ["Desc"])
      ).to.be.revertedWith("Il faut au moins 2 options/candidats pour un scrutin");
    });

    it("Rejette le déploiement si noms et descriptions sont désalignés", async function () {
      const VotingFactory = await ethers.getContractFactory("Voting");
      await expect(
        VotingFactory.deploy("Titre", ["A", "B"], ["Desc A"])
      ).to.be.revertedWith("Noms et descriptions doivent avoir la meme taille");
    });
  });

  describe("2. Gestion du Cycle de Vie (Admin)", function () {
    it("Permet à l'admin d'ouvrir le scrutin", async function () {
      await expect(voting.connect(admin).startVoting())
        .to.emit(voting, "VotingStarted");
      expect(await voting.state()).to.equal(1); // VotingState.Open
    });

    it("Interdit à un non-admin d'ouvrir le scrutin", async function () {
      await expect(
        voting.connect(voter1).startVoting()
      ).to.be.revertedWith("Seul l'administrateur peut executer cette action");
    });

    it("Interdit de fermer un scrutin non encore ouvert", async function () {
      await expect(
        voting.connect(admin).closeVoting()
      ).to.be.revertedWith("Le scrutin ne peut etre ferme que s'il est ouvert");
    });

    it("Permet à l'admin d'ouvrir puis de fermer le scrutin", async function () {
      await voting.connect(admin).startVoting();
      await expect(voting.connect(admin).closeVoting())
        .to.emit(voting, "VotingClosed");
      expect(await voting.state()).to.equal(2); // VotingState.Closed
    });

    it("Interdit de réouvrir un scrutin clôturé", async function () {
      await voting.connect(admin).startVoting();
      await voting.connect(admin).closeVoting();
      await expect(
        voting.connect(admin).startVoting()
      ).to.be.revertedWith("Le scrutin ne peut etre ouvert que depuis l'etat NotStarted");
    });
  });

  describe("3. Autorisation des Électeurs", function () {
    it("Permet à l'admin d'autoriser une adresse", async function () {
      await expect(voting.connect(admin).authorizeVoter(voter1.address))
        .to.emit(voting, "VoterAuthorized")
        .withArgs(voter1.address);

      expect(await voting.isAuthorized(voter1.address)).to.be.true;
      expect(await voting.totalAuthorized()).to.equal(1);
    });

    it("Interdit à un compte ordinaire d'autoriser des électeurs", async function () {
      await expect(
        voting.connect(voter1).authorizeVoter(voter2.address)
      ).to.be.revertedWith("Seul l'administrateur peut executer cette action");
    });

    it("Rejette l'adresse 0x0", async function () {
      await expect(
        voting.connect(admin).authorizeVoter(ethers.ZeroAddress)
      ).to.be.revertedWith("Adresse nulle invalide");
    });

    it("Rejette la ré-autorisation d'une même adresse", async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await expect(
        voting.connect(admin).authorizeVoter(voter1.address)
      ).to.be.revertedWith("Cette adresse est deja autorisee");
    });

    it("Permet d'autoriser un lot d'adresses (batch)", async function () {
      await expect(
        voting.connect(admin).authorizeVoters([voter1.address, voter2.address, voter3.address])
      ).to.emit(voting, "VotersBatchAuthorized").withArgs(3);

      expect(await voting.isAuthorized(voter1.address)).to.be.true;
      expect(await voting.isAuthorized(voter2.address)).to.be.true;
      expect(await voting.isAuthorized(voter3.address)).to.be.true;
      expect(await voting.totalAuthorized()).to.equal(3);
    });

    it("Interdit d'ajouter des électeurs après la clôture", async function () {
      await voting.connect(admin).startVoting();
      await voting.connect(admin).closeVoting();

      await expect(
        voting.connect(admin).authorizeVoter(voter1.address)
      ).to.be.revertedWith("Impossible d'autoriser apres la cloture du scrutin");
    });
  });

  describe("4. Processus de Vote & Sécurité", function () {
    it("Rejette un vote émis avant l'ouverture du scrutin", async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await expect(
        voting.connect(voter1).vote(0)
      ).to.be.revertedWith("Le scrutin n'est pas ouvert");
    });

    it("Rejette un vote émis par une adresse non autorisée", async function () {
      await voting.connect(admin).startVoting();
      await expect(
        voting.connect(nonAuthorizedUser).vote(0)
      ).to.be.revertedWith("Vous n'etes pas autorise a voter");
    });

    it("Permet un vote valide par un électeur autorisé", async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await voting.connect(admin).startVoting();

      await expect(voting.connect(voter1).vote(0))
        .to.emit(voting, "VoteCast")
        .withArgs(voter1.address, 0);

      expect(await voting.hasVoted(voter1.address)).to.be.true;
      expect(await voting.totalVotes()).to.equal(1);
    });

    it("Rejette formellement le double vote (sécurité critique)", async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await voting.connect(admin).startVoting();

      // Premier vote
      await voting.connect(voter1).vote(0);

      // Deuxième vote
      await expect(
        voting.connect(voter1).vote(1)
      ).to.be.revertedWith("Vous avez deja vote");
    });

    it("Rejette un vote pour un ID de candidat invalide", async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await voting.connect(admin).startVoting();

      await expect(
        voting.connect(voter1).vote(99)
      ).to.be.revertedWith("Identifiant de candidat invalide");
    });

    it("Rejette un vote émis après la clôture du scrutin", async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await voting.connect(admin).startVoting();
      await voting.connect(admin).closeVoting();

      await expect(
        voting.connect(voter1).vote(0)
      ).to.be.revertedWith("Le scrutin n'est pas ouvert");
    });
  });

  describe("5. Confidentialité et Résultats", function () {
    beforeEach(async function () {
      await voting.connect(admin).authorizeVoter(voter1.address);
      await voting.connect(admin).authorizeVoter(voter2.address);
      await voting.connect(admin).authorizeVoter(voter3.address);
    });

    it("Bloque l'accès aux résultats avant la clôture du scrutin", async function () {
      await voting.connect(admin).startVoting();
      await voting.connect(voter1).vote(0);

      await expect(
        voting.getResults()
      ).to.be.revertedWith("Les resultats ne sont accessibles qu'apres la cloture du scrutin");

      await expect(
        voting.getWinner()
      ).to.be.revertedWith("Le vainqueur n'est consultable qu'apres la cloture");
    });

    it("Dévoile les résultats exacts et le vainqueur après la clôture", async function () {
      await voting.connect(admin).startVoting();

      // voter1 vote pour Alice (id 0)
      await voting.connect(voter1).vote(0);
      // voter2 vote pour Alice (id 0)
      await voting.connect(voter2).vote(0);
      // voter3 vote pour Bob (id 1)
      await voting.connect(voter3).vote(1);

      // Clôture
      await voting.connect(admin).closeVoting();

      const results = await voting.getResults();
      expect(results[0].voteCount).to.equal(2); // Alice Martin
      expect(results[1].voteCount).to.equal(1); // Bob Dupont
      expect(results[2].voteCount).to.equal(0); // Vote Blanc

      const winner = await voting.getWinner();
      expect(winner.winnerId).to.equal(0);
      expect(winner.winnerName).to.equal("Alice Martin");
      expect(winner.winnerVotes).to.equal(2);
      expect(winner.isTie).to.be.false;
    });

    it("Détecte une situation d'égalité (tie) après clôture", async function () {
      await voting.connect(admin).startVoting();

      await voting.connect(voter1).vote(0); // Alice : 1
      await voting.connect(voter2).vote(1); // Bob : 1

      await voting.connect(admin).closeVoting();

      const winner = await voting.getWinner();
      expect(winner.isTie).to.be.true;
      expect(winner.winnerVotes).to.equal(1);
    });
  });
});
