const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("==================================================");
  console.log(" Script de Préparation et Démonstration Locale");
  console.log("==================================================");

  const signers = await hre.ethers.getSigners();
  const admin = signers[0];
  const voters = [signers[1], signers[2], signers[3]];

  console.log("\n Administrateur :");
  console.log(`- Adresse : ${admin.address}`);

  console.log("\n Électeurs de test prédéfinis :");
  voters.forEach((v, idx) => {
    console.log(`- Électeur #${idx + 1} : ${v.address}`);
  });

  // Déploiement frais pour la démonstration
  const electionTitle = "Élection des Représentants Étudiants - 3ème Génie Télécom (Filière CS) 2026";
  const candidateNames = ["Mouheb Jouili", "Oussema Ben Ahmed", "Vote Blanc"];
  const candidateDescriptions = [
    "Étudiant en 3ème année Génie Télécommunications (Filière CS) - Priorité à la cybersécurité des infrastructures, simulation réseau et certifications CCNA/CyberOps.",
    "Étudiant en 3ème année Génie Télécommunications (Filière CS) - Modernisation des équipements télécoms, virtualisation Cloud/NFV et partenariats PFE industriels.",
    "Abstention constructive ou aucun des candidats précédents."
  ];

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(electionTitle, candidateNames, candidateDescriptions);
  await voting.waitForDeployment();
  const address = await voting.getAddress();

  console.log(`\n Contrat déployé à : ${address}`);

  // Sauvegarde des données pour le frontend
  const frontendDir = path.join(__dirname, "..", "frontend", "src");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("Voting");
  const contractData = {
    address: address,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    admin: admin.address,
    abi: contractArtifact.abi
  };

  fs.writeFileSync(
    path.join(frontendDir, "contractData.json"),
    JSON.stringify(contractData, null, 2)
  );
  console.log(` Données exportées vers frontend/src/contractData.json`);

  // Autorisation des électeurs
  console.log("\n Inscription des électeurs dans la liste blanche...");
  const voterAddresses = voters.map(v => v.address);
  const txAuth = await voting.authorizeVoters(voterAddresses);
  await txAuth.wait();
  console.log(" Les 3 comptes d'électeurs ont été autorisés !");

  // Ouverture du scrutin
  console.log("\n Ouverture du scrutin par l'administrateur...");
  const txStart = await voting.startVoting();
  await txStart.wait();
  console.log(" Le scrutin est maintenant OUVERT aux votes.");

  console.log("\n==================================================");
  console.log(" Prêt pour la démonstration !");
  console.log("==================================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
