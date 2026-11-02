const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("--------------------------------------------------");
  console.log(" Déploiement du Smart Contract de Vote...");
  console.log("--------------------------------------------------");

  const signers = await hre.ethers.getSigners();
  if (!signers || signers.length === 0) {
    console.error("\n ERREUR : Aucun compte trouvé pour ce réseau !");
    console.error("Le fichier .env est introuvable ou ne contient pas de PRIVATE_KEY valide.");
    console.error("Veuillez créer le fichier .env à la racine du projet et y renseigner :");
    console.error("PRIVATE_KEY=votre_cle_privee_metamask\n");
    process.exit(1);
  }

  const deployer = signers[0];
  console.log(`Compte déployeur (Administrateur) : ${deployer.address}`);
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Solde : ${hre.ethers.formatEther(balance)} ETH`);

  const electionTitle = "Élection des Représentants Étudiants - 3ème Génie Télécom (Filière CS) 2026";
  const candidateNames = [
    "Mouheb Jouili",
    "Oussema Ben Ahmed",
    "Vote Blanc"
  ];
  const candidateDescriptions = [
    "Étudiant en 3ème année Génie Télécommunications (Filière CS) - Priorité à la cybersécurité des infrastructures, simulation réseau et certifications CCNA/CyberOps.",
    "Étudiant en 3ème année Génie Télécommunications (Filière CS) - Modernisation des équipements télécoms, virtualisation Cloud/NFV et partenariats PFE industriels.",
    "Abstention constructive ou aucun des candidats précédents."
  ];

  const Voting = await hre.ethers.getContractFactory("Voting");
  const voting = await Voting.deploy(electionTitle, candidateNames, candidateDescriptions);
  await voting.waitForDeployment();

  const contractAddress = await voting.getAddress();
  console.log(`\n Contrat Voting déployé avec succès à l'adresse : ${contractAddress}`);
  console.log(` Titre du scrutin : "${electionTitle}"`);
  console.log(` Nombre d'options : ${candidateNames.length}`);

  // Sauvegarde des données (adresse + ABI) pour le frontend React
  const frontendDir = path.join(__dirname, "..", "frontend", "src");
  if (!fs.existsSync(frontendDir)) {
    fs.mkdirSync(frontendDir, { recursive: true });
  }

  const contractArtifact = await hre.artifacts.readArtifact("Voting");
  const contractData = {
    address: contractAddress,
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    admin: deployer.address,
    abi: contractArtifact.abi
  };

  fs.writeFileSync(
    path.join(frontendDir, "contractData.json"),
    JSON.stringify(contractData, null, 2)
  );
  console.log(`\n Données du contrat exportées vers : frontend/src/contractData.json`);
  console.log("--------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
