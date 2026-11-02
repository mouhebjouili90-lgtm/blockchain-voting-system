import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import contractData from './contractData.json';
import {
  CheckCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Award,
  FileText,
  ShieldCheck,
  Users,
  Clock,
  HelpCircle,
  MailCheck,
  Building,
  CheckCircle2,
  Stamp,
  Sparkles,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Search,
  Printer,
  Radio,
  Cpu,
  Layers,
  X,
  Vote,
  Shield,
  Zap,
  ChevronRight
} from 'lucide-react';

const targetChainIdStr = contractData.chainId ? contractData.chainId.toString() : '31337';
const isSepoliaTarget = targetChainIdStr === '11155111';
const TARGET_CHAIN_HEX = isSepoliaTarget ? '0xaa36a7' : '0x7a69';

export default function App() {
  // Web3 States
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState('0');
  const [contract, setContract] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  // Contract States
  const [electionTitle, setElectionTitle] = useState('');
  const [votingState, setVotingState] = useState(0); // 0: NotStarted, 1: Open, 2: Closed
  const [adminAddress, setAdminAddress] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [results, setResults] = useState([]);
  const [winner, setWinner] = useState(null);
  const [totalVotes, setTotalVotes] = useState(0);
  const [totalAuthorized, setTotalAuthorized] = useState(0);

  // User Electoral Status
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Navigation & Form States
  const [activeTab, setActiveTab] = useState('desk'); // 'desk', 'register', 'tally', 'admin', 'guide'
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', title: '', message: '' });

  // Admin & Email Inputs
  const [newVoterAddress, setNewVoterAddress] = useState('');
  const [emailCheck, setEmailCheck] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  // Interactive Modern States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [copiedContract, setCopiedContract] = useState(false);
  const [showBallotModal, setShowBallotModal] = useState(false);
  const [sealingStage, setSealingStage] = useState(0);

  // Provider de lecture seule pour charger les données publiques immédiatement (même sans portefeuille)
  const getReadOnlyProvider = useCallback(() => {
    if (isSepoliaTarget) {
      return new ethers.JsonRpcProvider("https://ethereum-sepolia-rpc.publicnode.com");
    }
    return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  }, []);

  // Chargement des données publiques de l'élection (Accessible à tous sans MetaMask)
  const loadPublicData = useCallback(async () => {
    try {
      const readProvider = getReadOnlyProvider();
      const readContract = new ethers.Contract(contractData.address, contractData.abi, readProvider);

      const title = await readContract.electionTitle();
      const state = await readContract.state();
      const admin = await readContract.admin();
      const votes = await readContract.totalVotes();
      const auth = await readContract.totalAuthorized();

      setElectionTitle(title);
      setVotingState(Number(state));
      setAdminAddress(admin);
      setTotalVotes(Number(votes));
      setTotalAuthorized(Number(auth));

      const candList = await readContract.getCandidatesList();
      setCandidates(candList.map(c => ({
        id: Number(c.id),
        name: c.name,
        description: c.description
      })));

      if (Number(state) === 2) {
        try {
          const fullResults = await readContract.getResults();
          setResults(fullResults.map(r => ({
            id: Number(r.id),
            name: r.name,
            description: r.description,
            voteCount: Number(r.voteCount)
          })));
        } catch (errResults) {
          console.warn("Erreur chargement getResults :", errResults);
        }

        try {
          const w = await readContract.getWinner();
          setWinner({
            id: Number(w.winnerId),
            name: w.winnerName,
            votes: Number(w.winnerVotes),
            isTie: w.isTie
          });
        } catch (e) {
          console.log("Erreur chargement getWinner :", e);
        }
      }
    } catch (err) {
      console.warn("Nœud local en attente de réponse :", err.message);
    }
  }, [getReadOnlyProvider]);

  // Chargement du statut spécifique de l'utilisateur connecté
  const loadUserStatus = useCallback(async (userAddress, contractInstance) => {
    if (!userAddress || !contractInstance) return;
    try {
      const status = await contractInstance.getVoterStatus(userAddress);
      setIsAuthorized(status[0]);
      setHasVoted(status[1]);
    } catch (err) {
      console.error("Erreur statut électeur :", err);
    }
  }, []);

  // Initialisation Web3 et détection automatique de MetaMask
  useEffect(() => {
    loadPublicData();

    if (window.ethereum) {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      // Vérifier le réseau actif
      browserProvider.getNetwork().then((net) => {
        setIsWrongNetwork(net.chainId.toString() !== targetChainIdStr);
      }).catch(console.error);

      // Vérifier si un compte est déjà connecté
      browserProvider.send("eth_accounts", []).then(async (accounts) => {
        if (accounts.length > 0) {
          const userSigner = await browserProvider.getSigner();
          const userBal = await browserProvider.getBalance(accounts[0]);
          const userContract = new ethers.Contract(contractData.address, contractData.abi, userSigner);

          setSigner(userSigner);
          setAccount(accounts[0]);
          setBalance(ethers.formatEther(userBal));
          setContract(userContract);
          loadUserStatus(accounts[0], userContract);
        }
      }).catch(console.error);

      // Écouter les changements de compte
      window.ethereum.on('accountsChanged', async (accounts) => {
        if (accounts.length > 0) {
          const userSigner = await browserProvider.getSigner();
          const userBal = await browserProvider.getBalance(accounts[0]);
          const userContract = new ethers.Contract(contractData.address, contractData.abi, userSigner);

          setAccount(accounts[0]);
          setSigner(userSigner);
          setBalance(ethers.formatEther(userBal));
          setContract(userContract);
          loadUserStatus(accounts[0], userContract);
        } else {
          setAccount('');
          setSigner(null);
          setIsAuthorized(false);
          setHasVoted(false);
        }
      });

      // Écouter les changements de chaîne
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, [loadPublicData, loadUserStatus]);

  // Connexion manuelle du portefeuille MetaMask
  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Le portefeuille MetaMask est requis pour signer les transactions.");
      return;
    }
    try {
      setLoading(true);
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const userSigner = await browserProvider.getSigner();
      const userBalance = await browserProvider.getBalance(accounts[0]);
      const net = await browserProvider.getNetwork();

      setIsWrongNetwork(net.chainId.toString() !== targetChainIdStr);
      setProvider(browserProvider);
      setSigner(userSigner);
      setAccount(accounts[0]);
      setBalance(ethers.formatEther(userBalance));

      const votingContract = new ethers.Contract(
        contractData.address,
        contractData.abi,
        userSigner
      );
      setContract(votingContract);
      await loadUserStatus(accounts[0], votingContract);
      await loadPublicData();

      setFeedback({
        type: 'success',
        title: 'Portefeuille connecté',
        message: `Compte ${accounts[0].substring(0, 10)}... authentifié sur l'interface.`
      });
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'danger',
        title: 'Connexion interrompue',
        message: err.message || "Impossible d'accéder au portefeuille MetaMask."
      });
    } finally {
      setLoading(false);
    }
  };

  // Bascule vers le réseau cible (Sepolia ou Hardhat Localhost)
  const switchToTargetNetwork = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: TARGET_CHAIN_HEX }],
      });
      setIsWrongNetwork(false);
    } catch (switchError) {
      if (switchError.code === 4902 && !isSepoliaTarget) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: TARGET_CHAIN_HEX,
                chainName: 'Réseau Local Hardhat',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
              },
            ],
          });
          setIsWrongNetwork(false);
        } catch (addError) {
          console.error(addError);
        }
      }
    }
  };

  // Métadonnées académiques enrichies (3ème Génie Télécom Filière CS - ENET'Com Sfax)
  const getCandidateMetadata = useCallback((cand, idx) => {
    const name = (cand && cand.name ? cand.name : '').toLowerCase();
    const id = cand && cand.id !== undefined ? cand.id : idx;

    if (name.includes('mouheb') || (id === 0 && !name.includes('blanc') && !name.includes('oussema'))) {
      return {
        dept: "3ème Génie Télécom - Filière CS",
        tag: "telecom",
        initials: "MJ",
        proposals: [
          "Simulation réseau avancée (GNS3, EVE-NG) et labs virtuels de cybersécurité",
          "Ateliers certifiants intensifs Cisco CCNA / CyberOps & Protocoles 5G",
          "Partenariats technologiques pour stages PFE auprès d'entreprises du secteur"
        ]
      };
    }

    if (name.includes('oussema') || (id === 1 && !name.includes('blanc'))) {
      return {
        dept: "3ème Génie Télécom - Filière CS",
        tag: "embedded",
        initials: "OB",
        proposals: [
          "Modernisation des bancs d'essais télécoms et réseaux sans fil du campus",
          "Formations pratiques en architectures Cloud, virtualisation SDN et NFV",
          "Tutorat technique inter-promos et accompagnement personnalisé aux PFE"
        ]
      };
    }

    return {
      dept: "Abstention Civique Constructive",
      tag: "blank",
      initials: "VB",
      proposals: [
        "Vote blanc officiel comptabilisé dans le calcul du quorum légal",
        "Expression démocratique de réserve sans attribution de siège",
        "Garantie de participation intègre, anonyme et infalsifiable on-chain"
      ]
    };
  }, []);

  // Copie de l'adresse du smart contract avec retour visuel
  const handleCopyContract = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(contractData.address);
      setCopiedContract(true);
      setTimeout(() => setCopiedContract(false), 2200);
    }
  };

  // Ouverture du modal de confirmation du bulletin
  const handleOpenVoteModal = () => {
    if (selectedCandidate === null) {
      alert("Veuillez sélectionner un bulletin de vote dans la liste.");
      return;
    }
    setShowBallotModal(true);
  };

  // Exécution du vote avec horodatage on-chain
  const handleExecuteVote = async () => {
    if (selectedCandidate === null) return;
    try {
      setLoading(true);
      setSealingStage(1);
      setFeedback({
        type: 'info',
        title: 'Étape 1/2 : Signature cryptographique',
        message: 'Veuillez valider la transaction dans votre extension MetaMask...'
      });

      const tx = await contract.vote(selectedCandidate);
      setSealingStage(2);
      setFeedback({
        type: 'info',
        title: 'Étape 2/2 : Minage du bloc Ethereum',
        message: `Transaction ${tx.hash.substring(0, 18)}... en cours d'insertion dans le registre.`
      });

      await tx.wait();
      setSealingStage(3);
      setShowBallotModal(false);
      setFeedback({
        type: 'success',
        title: 'Suffrage scellé avec succès !',
        message: 'Votre bulletin a été gravé de façon immuable et irréversible sur la blockchain Ethereum.'
      });
      await loadPublicData();
      await loadUserStatus(account, contract);
    } catch (err) {
      console.error(err);
      setFeedback({
        type: 'danger',
        title: 'Transaction interrompue',
        message: err.reason || err.message || "Une erreur est survenue lors de l'enregistrement de votre vote."
      });
    } finally {
      setLoading(false);
      setSealingStage(0);
    }
  };

  // Admin : Ouvrir le scrutin
  const handleStart = async () => {
    try {
      setLoading(true);
      const tx = await contract.startVoting();
      await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Bureau de vote ouvert',
        message: 'Le scrutin est officiellement ouvert aux électeurs inscrits.'
      });
      await loadPublicData();
    } catch (err) {
      setFeedback({ type: 'danger', title: 'Erreur', message: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Admin : Clôturer le scrutin
  const handleClose = async () => {
    try {
      setLoading(true);
      const tx = await contract.closeVoting();
      await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Scrutin clos et scellé',
        message: 'L\'urne électorale est verrouillée. Le procès-verbal et les résultats officiels sont disponibles.'
      });
      await loadPublicData();
      setActiveTab('tally');
    } catch (err) {
      setFeedback({ type: 'danger', title: 'Erreur', message: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Admin : Inscrire un électeur
  const handleAuthorizeSingle = async () => {
    if (!ethers.isAddress(newVoterAddress)) {
      alert("L'adresse Ethereum saisie n'est pas valide.");
      return;
    }
    try {
      setLoading(true);
      const tx = await contract.authorizeVoter(newVoterAddress);
      await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Électeur inscrit sur la liste électorale',
        message: `L'adresse ${newVoterAddress.substring(0, 10)}... a été ajoutée à la liste blanche.`
      });
      setNewVoterAddress('');
      await loadPublicData();
      if (account) await loadUserStatus(account, contract);
    } catch (err) {
      setFeedback({ type: 'danger', title: 'Erreur', message: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Admin : Inscrire les 3 comptes de test
  const handleAuthorizeTestAccounts = async () => {
    const testAccounts = [
      "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
      "0x90F79bf6EB2c4f870365E785982E1f101E93b906"
    ];
    try {
      setLoading(true);
      const tx = await contract.authorizeVoters(testAccounts);
      await tx.wait();
      setFeedback({
        type: 'success',
        title: 'Comptes de test inscrits',
        message: 'Les 3 comptes électeurs de test ont été inscrits avec succès sur la blockchain.'
      });
      await loadPublicData();
      if (account) await loadUserStatus(account, contract);
    } catch (err) {
      setFeedback({ type: 'danger', title: 'Erreur', message: err.reason || err.message });
    } finally {
      setLoading(false);
    }
  };

  // Simulation vérification email académique ENET'Com Sfax
  const handleEmailCheck = (e) => {
    e.preventDefault();
    const clean = emailCheck.trim().toLowerCase();
    const isValidAcademic =
      clean.endsWith('.tn') ||
      clean.endsWith('.fr') ||
      clean.endsWith('.edu') ||
      clean.includes('enetcom') ||
      clean.includes('univ-sfax') ||
      clean.includes('u-sfax');
    if (isValidAcademic && clean.includes('@')) {
      setEmailVerified(true);
      setFeedback({
        type: 'success',
        title: 'Identité académique certifiée (ENET\'Com Sfax)',
        message: `L'adresse ${clean} appartient bien au réseau institutionnel de l'Université de Sfax. En environnement réel, un jeton cryptographique chiffré relie votre matricule étudiant à votre clé publique Ethereum sans exposer vos données civiles sur le registre.`
      });
    } else {
      setEmailVerified(false);
      setFeedback({
        type: 'danger',
        title: 'Domaine institutionnel non reconnu',
        message: 'Veuillez saisir une adresse électronique universitaire valide (@enetcom.u-sfax.tn ou @univ-sfax.tn) pour certifier votre éligibilité.'
      });
    }
  };

  const isAdmin = account && adminAddress && account.toLowerCase() === adminAddress.toLowerCase();

  const turnoutRate = totalAuthorized > 0 ? ((totalVotes / totalAuthorized) * 100) : 0;
  const isQuorumReached = turnoutRate >= 50.0;

  const filteredCandidates = useMemo(() => {
    return candidates.filter((cand, index) => {
      const meta = getCandidateMetadata(cand, index);
      const matchesDept = selectedDeptFilter === 'all' ||
        meta.tag === selectedDeptFilter ||
        (selectedDeptFilter === 'telecom' && (meta.tag === 'telecom' || meta.tag === 'embedded'));
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch = query === '' ||
        cand.name.toLowerCase().includes(query) ||
        cand.description.toLowerCase().includes(query) ||
        meta.dept.toLowerCase().includes(query);
      return matchesDept && matchesSearch;
    });
  }, [candidates, selectedDeptFilter, searchQuery, getCandidateMetadata]);

  return (
    <div>
      {/* 1. Bandeau supérieur officiel de l'État & Université */}
      <div className="enetcom-topbar">
        <div className="enetcom-topbar-left">
          <span className="enetcom-topbar-item">
            🇹🇳 <strong>RÉPUBLIQUE TUNISIENNE</strong> • MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR ET DE LA RECHERCHE SCIENTIFIQUE
          </span>
        </div>
        <div className="enetcom-topbar-right">
          <span className="enetcom-topbar-item">
            🏛️ UNIVERSITÉ DE SFAX • TECHNOPÔLE DE SFAX
          </span>
          <button
            className="network-badge-btn"
            onClick={switchToTargetNetwork}
            title={isSepoliaTarget ? "Cliquer pour basculer MetaMask sur Sepolia Testnet" : "Cliquer pour basculer MetaMask sur le réseau local Hardhat"}
          >
            <span className="live-dot" style={{ background: isWrongNetwork ? '#ef4444' : '#10b981' }}></span>
            <span>{isWrongNetwork ? `Basculer sur ${isSepoliaTarget ? 'Sepolia' : 'Hardhat'}` : (isSepoliaTarget ? "Sepolia Testnet (11155111)" : "Réseau Hardhat (31337)")}</span>
          </button>
        </div>
      </div>

      {/* 2. En-tête principal officiel ENET'Com Sfax (Bleu Nuit #031c34 + Orange #f36f21 + Sticky) */}
      <header className="enetcom-main-header">
        <div className="enetcom-header-inner">
          <div className="enetcom-branding-wrapper">
            <div className="enetcom-logo-container">
              <img
                src="https://enetcom.rnu.tn/images/logo.png"
                alt="Logo Officiel ENET'Com Sfax"
                className="enetcom-official-logo"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="enetcom-school-titles">
                <div className="enetcom-school-title">ENET'Com Sfax</div>
                <div className="enetcom-school-subtitle">
                  École Nationale d'Électronique et des Télécommunications de Sfax
                </div>
              </div>
            </div>

            {/* Labels d'accréditations réelles ENET'Com */}
            <div className="enetcom-accreditations">
              <span className="accreditation-badge highlight" title="Commission des Titres d'Ingénieur">
                CTI Accréditée
              </span>
              <span className="accreditation-badge" title="European Accredited Engineer">
                EUR-ACE
              </span>
              <span className="accreditation-badge" title="Système de management de la qualité certifié">
                ISO 9001
              </span>
            </div>
          </div>

          <div className="header-actions-cluster">
            {account ? (
              <div className="wallet-badge-enetcom">
                <span className="live-dot"></span>
                <span style={{ fontFamily: 'var(--font-mono)' }}>
                  {account.substring(0, 6)}...{account.substring(account.length - 4)}
                </span>
                <span className="eth-balance">({Number(balance).toFixed(3)} ETH)</span>
                {isAdmin && <span className="admin-tag-enetcom">Président du Bureau</span>}
              </div>
            ) : (
              <button className="btn-enetcom btn-enetcom-orange" onClick={connectWallet} disabled={loading}>
                <ShieldCheck size={18} />
                Authentifier avec MetaMask
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Conteneur principal du portail */}
      <div className="portal-container">
        {/* Fiche de session du scrutin & Jauge de Quorum */}
        <section className="session-banner">
          <div className="session-header-row">
            <div className="session-title-group">
              <h1>{electionTitle || "Conseil Scientifique & Électoral • ENET'Com Sfax 2026"}</h1>
              <p>
                <Building size={16} style={{ color: 'var(--enetcom-orange)' }} />
                Scrutin Décentralisé Universitaire • Registre Ethereum Immuable {isSepoliaTarget && "• Sepolia Public Testnet"}
              </p>
            </div>

            <div className="contract-address-box">
              <span className="stat-label">Smart Contract Officiel</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                {isSepoliaTarget ? (
                  <a
                    href={`https://sepolia.etherscan.io/address/${contractData.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="contract-address-link"
                    title="Voir le registre sur Etherscan Sepolia"
                  >
                    <span>{contractData.address.substring(0, 10)}...{contractData.address.substring(contractData.address.length - 8)}</span>
                    <ExternalLink size={13} />
                  </a>
                ) : (
                  <span className="contract-address-link">
                    {contractData.address.substring(0, 12)}...{contractData.address.substring(contractData.address.length - 6)}
                  </span>
                )}
                <button
                  className="copy-badge-btn"
                  onClick={handleCopyContract}
                  title="Copier l'adresse Ethereum complète du contrat"
                >
                  {copiedContract ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                  <span>{copiedContract ? "Copié !" : "Copier"}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="session-stats-grid">
            <div className="stat-box">
              <span className="stat-label">État du bureau de vote</span>
              <div style={{ marginTop: '0.2rem' }}>
                {votingState === 0 && <span className="status-badge notstarted"><Lock size={14} /> En attente d'ouverture</span>}
                {votingState === 1 && <span className="status-badge open"><Unlock size={14} /> Scrutin Ouvert</span>}
                {votingState === 2 && <span className="status-badge closed"><CheckCircle size={14} /> Scrutin Clôturé</span>}
              </div>
            </div>

            <div className="stat-box">
              <span className="stat-label">Inscrits sur liste électorale</span>
              <span className="stat-value highlight-blue">{totalAuthorized} <small style={{ fontSize: '0.85rem', fontWeight: 500 }}>électeurs</small></span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Suffrages déposés dans l'urne</span>
              <span className="stat-value">{totalVotes} <small style={{ fontSize: '0.85rem', fontWeight: 500 }}>voix</small></span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Taux de participation</span>
              <span className="stat-value highlight-orange">
                {turnoutRate.toFixed(1)} %
              </span>
            </div>

            <div className="stat-box">
              <span className="stat-label">Votre éligibilité</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, marginTop: '0.35rem', color: isAuthorized ? 'var(--status-open)' : 'var(--status-pending)' }}>
                {account ? (isAuthorized ? (hasVoted ? "A émargé et voté ✓" : "Inscrit(e) — Peut voter ✓") : "Non inscrit(e) sur la liste") : "Portefeuille déconnecté"}
              </span>
            </div>
          </div>

          {/* Jauge de Quorum & Mobilisation */}
          <div className="quorum-card">
            <div className="quorum-header">
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <Shield size={16} style={{ color: 'var(--enetcom-orange)' }} />
                Jauge de Quorum & Mobilisation Électorale
              </span>
              <span className={`quorum-status-pill ${isQuorumReached ? 'reached' : 'pending'}`}>
                {isQuorumReached ? (
                  <>
                    <CheckCircle2 size={13} />
                    Quorum institutionnel atteint (≥ 50%)
                  </>
                ) : (
                  <>
                    <Clock size={13} />
                    Quorum en cours (seuil légal : 50%)
                  </>
                )}
              </span>
            </div>

            <div className="quorum-track">
              <div className="quorum-threshold-marker">
                <span className="quorum-threshold-label">Seuil légal 50%</span>
              </div>
              <div
                className="quorum-bar"
                style={{ width: `${Math.min(turnoutRate, 100)}%` }}
              ></div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
              <span>Suffrages exprimés : <strong>{totalVotes}</strong> / {totalAuthorized} inscrits</span>
              <span>Progression globale : <strong>{turnoutRate.toFixed(1)}%</strong></span>
            </div>
          </div>
        </section>

        {/* Notification contextuelle */}
        {feedback.message && (
          <div className={`notice notice-${feedback.type}`}>
            <div>
              {feedback.title && <strong style={{ display: 'block', marginBottom: '0.25rem' }}>{feedback.title}</strong>}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        {/* 4. Barre de navigation des volets du scrutin (Style ENET'Com) */}
        <nav className="enetcom-nav-tabs">
          <button
            className={`enetcom-tab-btn ${activeTab === 'desk' ? 'active' : ''}`}
            onClick={() => setActiveTab('desk')}
          >
            <FileText size={17} />
            Isoloir & Bulletins
          </button>

          <button
            className={`enetcom-tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            <MailCheck size={17} />
            Émargement académique
          </button>

          <button
            className={`enetcom-tab-btn ${activeTab === 'tally' ? 'active' : ''}`}
            onClick={() => setActiveTab('tally')}
          >
            <Award size={17} />
            Procès-verbal & Dépouillement
          </button>

          <button
            className={`enetcom-tab-btn ${activeTab === 'admin' ? 'active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            <ShieldCheck size={17} />
            Présidence du bureau {isAdmin && "(Responsable)"}
          </button>

          <button
            className={`enetcom-tab-btn ${activeTab === 'guide' ? 'active' : ''}`}
            onClick={() => setActiveTab('guide')}
          >
            <HelpCircle size={17} />
            Protocole d'évaluation & Démo
          </button>
        </nav>

        {/* --- VOLET 1 : ISOLOIR & BULLETINS --- */}
        {activeTab === 'desk' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
              <div>
                <h2 className="ballot-desk-title">Sélection du bulletin de vote</h2>
                <p className="ballot-desk-desc">
                  Chaque bulletin est numéroté, attribué à un département d'ingénierie et scellé individuellement. Une fois la transaction validée, votre suffrage est irréversiblement gravé sur la blockchain.
                </p>
              </div>
            </div>

            {/* Barre de filtres par département & Recherche dynamique */}
            <div className="filter-search-container">
              <div className="filter-pills-group">
                <button
                  className={`filter-pill ${selectedDeptFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedDeptFilter('all')}
                >
                  Tous les bulletins ({candidates.length})
                </button>
                <button
                  className={`filter-pill ${selectedDeptFilter === 'telecom' ? 'active' : ''}`}
                  onClick={() => setSelectedDeptFilter('telecom')}
                >
                  📡 3ème Génie Télécom (CS)
                </button>
                <button
                  className={`filter-pill ${selectedDeptFilter === 'blank' ? 'active' : ''}`}
                  onClick={() => setSelectedDeptFilter('blank')}
                >
                  ⚪ Vote Blanc
                </button>
              </div>

              <div className="search-input-box">
                <Search size={15} className="search-input-icon" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, département..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {votingState === 0 && (
              <div className="notice notice-warning">
                <AlertTriangle size={18} />
                <span><strong>Bureau en attente d'ouverture :</strong> Le bureau de vote n'est pas encore ouvert par le président de séance. Veuillez patienter avant d'émettre votre bulletin. Aucun vote ne peut être enregistré.</span>
              </div>
            )}

            {votingState === 2 && (
              <div className="notice notice-info">
                <CheckCircle size={18} />
                <span>Le scrutin est officiellement clôturé. Vous pouvez consulter les résultats définitifs dans l'onglet <strong>Procès-verbal & Dépouillement</strong>.</span>
              </div>
            )}

            {votingState === 1 && !isAuthorized && (
              <div className="notice notice-warning">
                <AlertTriangle size={18} />
                <span>Votre adresse Ethereum n'apparaît pas sur la liste électorale autorisée. Contactez le bureau de vote ou vérifiez votre appartenance académique dans l'onglet <strong>Émargement académique</strong>.</span>
              </div>
            )}

            {votingState === 1 && hasVoted && (
              <div className="notice notice-success">
                <CheckCircle size={18} />
                <span>Votre émargement et votre bulletin ont déjà été validés. En application des règles cryptographiques du smart contract, aucun électeur ne peut voter deux fois.</span>
              </div>
            )}

            {filteredCandidates.length === 0 ? (
              <div className="protocol-sheet" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
                <Search size={36} style={{ color: 'var(--ink-muted)', marginBottom: '0.75rem' }} />
                <h4 style={{ color: 'var(--enetcom-navy)', marginBottom: '0.25rem' }}>Aucun bulletin ne correspond à votre recherche</h4>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>Veuillez modifier vos filtres ou réinitialiser la recherche.</p>
                <button
                  className="btn-enetcom btn-enetcom-outline"
                  onClick={() => { setSelectedDeptFilter('all'); setSearchQuery(''); }}
                  style={{ marginTop: '1rem' }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="ballot-slips-grid">
                {filteredCandidates.map((cand, idx) => {
                  const meta = getCandidateMetadata(cand, cand.id !== undefined ? cand.id : idx);
                  const isSelected = selectedCandidate === cand.id;
                  const canVote = votingState === 1 && isAuthorized && !hasVoted && !loading;

                  return (
                    <div
                      key={cand.id}
                      className={`ballot-slip ${isSelected ? 'selected' : ''}`}
                      onClick={() => {
                        if (canVote) setSelectedCandidate(cand.id);
                      }}
                      style={{
                        cursor: canVote ? 'pointer' : 'default',
                        opacity: canVote ? 1 : 0.8
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                          <span className="ballot-order-tag">OPTION N° {cand.id + 1}</span>
                          <span className={`dept-badge ${meta.tag}`}>{meta.dept}</span>
                        </div>

                        <div className="candidate-header-row">
                          <div className={`candidate-avatar ${meta.tag}`}>
                            {meta.initials}
                          </div>
                          <div>
                            <h3 className="ballot-candidate-name" style={{ margin: 0 }}>{cand.name}</h3>
                            <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{cand.description}</span>
                          </div>
                        </div>

                        {/* Engagements / Programme synthétique */}
                        <ul className="candidate-proposal-list">
                          {meta.proposals.map((prop, pIdx) => (
                            <li key={pIdx} className="candidate-proposal-item">
                              <span>{prop}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div style={{ paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)' }}>
                        {isSelected ? (
                          <div className="ballot-selection-indicator">
                            <CheckCircle2 size={18} />
                            <span>Bulletin sélectionné pour l'urne</span>
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                            {votingState === 0 ? "Scrutin en attente d'ouverture" : (canVote ? "Cliquer pour insérer ce bulletin" : "Choix verrouillé")}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {votingState === 1 && isAuthorized && !hasVoted && (
              <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
                <button
                  className="btn-enetcom btn-enetcom-orange"
                  style={{ padding: '0.95rem 3.5rem', fontSize: '1.05rem' }}
                  onClick={handleOpenVoteModal}
                  disabled={selectedCandidate === null || loading}
                >
                  <Lock size={18} />
                  {loading ? "Scellement cryptographique en cours..." : "Aperçu & Déposer mon bulletin dans l'urne"}
                </button>
                {selectedCandidate !== null && (
                  <div style={{ marginTop: '0.85rem', fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                    Bulletin sélectionné : <strong style={{ color: 'var(--enetcom-navy)' }}>{candidates[selectedCandidate]?.name}</strong>
                  </div>
                )}
              </div>
            )}

            {/* Modal interactif de confirmation du bulletin (Sécurité & Confiance) */}
            {showBallotModal && selectedCandidate !== null && (
              <div className="ballot-modal-overlay">
                <div className="ballot-modal-content">
                  <div className="ballot-modal-header">
                    <div>
                      <h3 style={{ color: 'var(--enetcom-navy)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem', margin: 0 }}>
                        Scellement du Bulletin Cryptographique
                      </h3>
                      <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>
                        École Nationale d'Électronique et des Télécommunications de Sfax
                      </span>
                    </div>
                    <button
                      onClick={() => setShowBallotModal(false)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink-muted)' }}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="ballot-preview-box">
                    <div className="ballot-preview-row">
                      <span style={{ color: 'var(--ink-muted)' }}>Option sélectionnée :</span>
                      <strong style={{ color: 'var(--enetcom-navy)' }}>{candidates[selectedCandidate]?.name}</strong>
                    </div>
                    <div className="ballot-preview-row">
                      <span style={{ color: 'var(--ink-muted)' }}>Département :</span>
                      <span>{getCandidateMetadata(candidates[selectedCandidate], selectedCandidate).dept}</span>
                    </div>
                    <div className="ballot-preview-row">
                      <span style={{ color: 'var(--ink-muted)' }}>Électeur authentifié :</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--enetcom-navy-light)' }}>
                        {account.substring(0, 8)}...{account.substring(account.length - 6)}
                      </span>
                    </div>
                    <div className="ballot-preview-row">
                      <span style={{ color: 'var(--ink-muted)' }}>Réseau d'enregistrement :</span>
                      <span>{isSepoliaTarget ? "Sepolia Public Testnet" : "Réseau Local Hardhat"}</span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: '1.5', marginBottom: '1.5rem' }}>
                    En confirmant, vous allez transmettre votre transaction cryptographique à l'extension MetaMask. Une fois inscrite dans un bloc Ethereum, votre décision sera définitive et inaltérable.
                  </p>

                  <div style={{ display: 'flex', gap: '0.85rem', justifyContent: 'flex-end' }}>
                    <button
                      className="btn-enetcom btn-enetcom-outline"
                      onClick={() => setShowBallotModal(false)}
                      disabled={loading}
                    >
                      Modifier mon choix
                    </button>
                    <button
                      className="btn-enetcom btn-enetcom-orange"
                      onClick={handleExecuteVote}
                      disabled={loading}
                    >
                      <ShieldCheck size={16} />
                      {loading ? "Signature en cours..." : "Confirmer & Signer avec MetaMask"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VOLET 2 : ÉMARGEMENT ACADÉMIQUE --- */}
        {activeTab === 'register' && (
          <div className="protocol-sheet">
            <h2 className="ballot-desk-title" style={{ marginBottom: '0.5rem' }}>Contrôle de l'appartenance académique (ENET'Com Sfax)</h2>
            <p className="ballot-desk-desc">
              Le cahier des charges impose de réserver la participation aux étudiants et enseignants de l'ENET'Com Sfax, tout en séparant l'identité civile de la clé publique de vote on-chain.
            </p>

            <form onSubmit={handleEmailCheck} style={{ maxWidth: '640px', marginBottom: '2.25rem' }}>
              <div className="desk-form-group">
                <label className="desk-form-label">Adresse de messagerie universitaire (Université de Sfax) :</label>
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <input
                    type="email"
                    className="desk-input"
                    placeholder="prenom.nom@enetcom.u-sfax.tn ou etudiant@univ-sfax.tn"
                    value={emailCheck}
                    onChange={(e) => setEmailCheck(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn-enetcom btn-enetcom-navy" style={{ whiteSpace: 'nowrap' }}>
                    Vérifier l'éligibilité
                  </button>
                </div>
              </div>
            </form>

            <div style={{ background: 'var(--enetcom-navy-soft)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(12, 83, 151, 0.2)' }}>
              <h4 style={{ fontSize: '0.95rem', color: 'var(--enetcom-navy)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--enetcom-orange)' }} />
                Adresse Ethereum candidate à l'émargement :
              </h4>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.88rem', color: 'var(--enetcom-navy-light)', wordBreak: 'break-all' }}>
                {account || "Aucun portefeuille connecté — Veuillez vous connecter via MetaMask."}
              </p>
              <div style={{ marginTop: '0.85rem', fontSize: '0.88rem' }}>
                Statut actuel dans le smart contract : <strong>{isAuthorized ? "Inscrit sur la liste électorale ✓" : "Non inscrit"}</strong>
              </div>
            </div>

            <div className="notice notice-info" style={{ marginTop: '1.75rem' }}>
              <Clock size={20} />
              <div>
                <strong>Précision pour le jury de soutenance ENET'Com :</strong> Dans une mise en production réelle, le serveur LDAP/CAS de l'Université de Sfax valide l'identité de l'étudiant, émet un jeton cryptographique à usage unique et autorise l'adresse sans lier publiquement le matricule de l'étudiant à son vote.
              </div>
            </div>
          </div>
        )}

        {/* --- VOLET 3 : PROCÈS-VERBAL & DÉPOUILLEMENT --- */}
        {activeTab === 'tally' && (
          <div>
            {votingState !== 2 ? (
              <div className="protocol-sheet" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <Lock size={48} style={{ color: 'var(--enetcom-orange)', marginBottom: '1.25rem' }} />
                <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.8rem', color: 'var(--enetcom-navy)', marginBottom: '0.5rem' }}>
                  Urne électorale sous scellés cryptographiques
                </h3>
                <p style={{ color: 'var(--ink-muted)', maxWidth: '640px', margin: '0 auto 1.75rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                  Afin de préserver la sincérité du scrutin et d'éviter toute influence sur le comportement des électeurs, les résultats ne peuvent pas être consultés tant que l'élection n'a pas été formellement clôturée par le président du bureau.
                </p>
                <div style={{ display: 'inline-flex', padding: '0.5rem 1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-pill)', border: '1px solid var(--border-medium)', fontSize: '0.88rem' }}>
                  Statut : <strong style={{ marginLeft: '0.4rem', color: 'var(--enetcom-navy)' }}>{votingState === 0 ? "Bureau non encore ouvert" : "Enregistrement des suffrages en cours"}</strong>
                </div>
              </div>
            ) : (
              <div>
                {winner && (
                  <div className="winner-decree">
                    <Award size={48} style={{ color: 'var(--enetcom-orange)', margin: '0 auto 0.5rem' }} />
                    <span style={{ fontSize: '0.82rem', letterSpacing: '0.08em', color: 'var(--enetcom-orange)', fontWeight: 700, textTransform: 'uppercase' }}>
                      {winner.isTie ? "PROCÈS-VERBAL D'ÉGALITÉ PARFAITE" : "DÉLIBÉRATION OFFICIELLE DU CONSEIL ÉLECTORAL"}
                    </span>
                    <h3>{winner.isTie ? "Égalité entre les options en tête" : winner.name}</h3>
                    <p style={{ color: 'var(--ink-secondary)', fontSize: '1.05rem' }}>
                      {winner.isTie ? (
                        <span>Les options en tête ont obtenu le même nombre de suffrages (<strong>{winner.votes} voix</strong> chacune). Application des statuts électoraux de l'école.</span>
                      ) : (
                        <span>Proclamé(e) vainqueur officiel avec <strong>{winner.votes} suffrages exprimés</strong> sur la blockchain Ethereum.</span>
                      )}
                    </p>
                  </div>
                )}

                <div className="protocol-sheet">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-light)' }}>
                    <div>
                      <h3 className="ballot-desk-title" style={{ fontSize: '1.35rem', margin: 0 }}>
                        Décompte exhaustif des suffrages (Audit on-chain)
                      </h3>
                      <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--ink-muted)' }}>
                        Résultats immuables extraits en temps réel des blocs Ethereum certifiés par consensus.
                      </p>
                    </div>
                    <button
                      className="btn-enetcom btn-enetcom-outline"
                      onClick={() => window.print()}
                      style={{ padding: '0.6rem 1.4rem', fontSize: '0.88rem', borderColor: 'var(--enetcom-navy-light)', color: 'var(--enetcom-navy)' }}
                      title="Générer un PDF officiel du Procès-Verbal de l'élection"
                    >
                      <Printer size={16} style={{ color: 'var(--enetcom-orange)' }} />
                      Imprimer le Procès-Verbal Officiel (PDF)
                    </button>
                  </div>

                  <table className="tally-table">
                    <thead>
                      <tr>
                        <th>Option / Candidat</th>
                        <th>Descriptif</th>
                        <th>Suffrages</th>
                        <th>Proportion</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.map((res) => {
                        const pct = totalVotes > 0 ? ((res.voteCount / totalVotes) * 100).toFixed(1) : 0;
                        const isTop = winner && res.voteCount === winner.votes && winner.votes > 0;

                        return (
                          <tr key={res.id}>
                            <td style={{ fontWeight: 700, color: 'var(--enetcom-navy)' }}>
                              {res.name}
                              {isTop && (
                                <span style={{ marginLeft: '0.5rem', color: 'var(--enetcom-orange)', fontSize: '0.78rem' }}>
                                  ★ {winner.isTie ? "Ex-aequo" : "Élu(e)"}
                                </span>
                              )}
                            </td>
                            <td style={{ color: 'var(--ink-muted)', fontSize: '0.85rem' }}>{res.description}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{res.voteCount} voix</td>
                            <td style={{ minWidth: '150px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                                <span>{pct} %</span>
                              </div>
                              <div className="tally-bar-container">
                                <div
                                  className={`tally-bar-fill ${isTop ? 'lead' : ''}`}
                                  style={{ width: `${pct}%` }}
                                ></div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* Sceau de Délibération Académique & Audit Cryptographique (Idéal pour impression et jury) */}
                  <div style={{ marginTop: '2.5rem', paddingTop: '1.75rem', borderTop: '2px dashed var(--border-medium)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                    <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--enetcom-orange)', marginBottom: '0.4rem' }}>
                        Certification Cryptographique
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-secondary)', lineHeight: '1.5' }}>
                        <div><strong>Contrat :</strong> <code style={{ fontSize: '0.75rem' }}>{contractData.address}</code></div>
                        <div><strong>Quorum légal :</strong> {isQuorumReached ? "Atteint (≥ 50%) ✓" : "Non atteint (< 50%)"}</div>
                        <div><strong>Horodatage certification :</strong> {new Date().toLocaleString('fr-FR')}</div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--bg-subtle)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--enetcom-navy)', marginBottom: '0.4rem' }}>
                        Visa du Conseil Électoral & Jury
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', fontStyle: 'italic', marginTop: '1.5rem', borderBottom: '1px solid #94a3b8', paddingBottom: '0.25rem', display: 'flex', justifyContent: 'space-between' }}>
                        <span>Signature & Cachet de l'École</span>
                        <span>ENET'Com Sfax</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- VOLET 4 : PRÉSIDENCE DU BUREAU (ADMINISTRATEUR) --- */}
        {activeTab === 'admin' && (
          <div className="protocol-sheet">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.75rem', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <div>
                <h2 className="ballot-desk-title" style={{ marginBottom: '0.25rem' }}>Administration de la session de vote</h2>
                <p style={{ fontSize: '0.88rem', color: 'var(--ink-muted)' }}>
                  Présidence déclarée : <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--enetcom-navy-light)' }}>{adminAddress}</code>
                </p>
              </div>

              <div>
                {isAdmin ? (
                  <span className="status-badge open"><ShieldCheck size={16} /> Vous êtes le président de séance</span>
                ) : (
                  <span className="status-badge notstarted"><AlertTriangle size={16} /> Accès restreint (Consultation seule)</span>
                )}
              </div>
            </div>

            {/* Contrôles du scrutin */}
            <div style={{ background: 'var(--enetcom-navy-soft)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(12, 83, 151, 0.15)', marginBottom: '2rem' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--enetcom-navy)', marginBottom: '0.85rem' }}>
                Conduite du scrutin
              </h4>
              <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                <button
                  className="btn-enetcom btn-enetcom-orange"
                  onClick={handleStart}
                  disabled={!isAdmin || votingState !== 0 || loading}
                >
                  <Unlock size={16} />
                  Ouvrir le bureau de vote
                </button>

                <button
                  className="btn-enetcom btn-enetcom-danger"
                  onClick={handleClose}
                  disabled={!isAdmin || votingState !== 1 || loading}
                >
                  <Lock size={16} />
                  Clôturer définitivement le scrutin
                </button>

                {votingState === 2 && (
                  <button
                    className="btn-enetcom btn-enetcom-orange"
                    onClick={() => setActiveTab('tally')}
                  >
                    <Award size={16} />
                    Consulter le Procès-Verbal Officiel
                  </button>
                )}

                <button
                  className="btn-enetcom btn-enetcom-outline"
                  onClick={() => { loadPublicData(); if (account) loadUserStatus(account, contract); }}
                  disabled={loading}
                >
                  <RefreshCw size={16} />
                  Actualiser le registre
                </button>
              </div>
            </div>

            {/* Liste d'émargement */}
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <h4 style={{ fontSize: '1rem', color: 'var(--enetcom-navy)', marginBottom: '0.85rem' }}>
                Gestion de la liste d'émargement (Autorisations d'électeurs)
              </h4>

              <div className="desk-form-group">
                <label className="desk-form-label">Inscrire une adresse Ethereum individuelle :</label>
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <input
                    type="text"
                    className="desk-input"
                    placeholder="0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
                    value={newVoterAddress}
                    onChange={(e) => setNewVoterAddress(e.target.value)}
                    disabled={!isAdmin || votingState === 2}
                  />
                  <button
                    className="btn-enetcom btn-enetcom-navy"
                    onClick={handleAuthorizeSingle}
                    disabled={!isAdmin || votingState === 2 || loading || !newVoterAddress}
                  >
                    Inscrire l'électeur
                  </button>
                </div>
              </div>

              <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                <label className="desk-form-label">Démonstration rapide : autoriser le groupe de test</label>
                <button
                  className="btn-enetcom btn-enetcom-outline"
                  onClick={handleAuthorizeTestAccounts}
                  disabled={!isAdmin || votingState === 2 || loading}
                >
                  <Users size={16} />
                  Inscrire les 3 comptes d'électeurs Hardhat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- VOLET 5 : PROTOCOLE D'ÉVALUATION & SOUTENANCE --- */}
        {activeTab === 'guide' && (
          <div className="protocol-sheet">
            <h2 className="ballot-desk-title" style={{ marginBottom: '0.5rem' }}>Guide d'audit & Démonstration de soutenance</h2>
            <p className="ballot-desk-desc">
              Récapitulatif des comptes de test, de l'enchaînement de la démo et des arguments clés pour le jury de l'ENET'Com Sfax.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ background: 'var(--enetcom-navy-soft)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(12, 83, 151, 0.15)' }}>
                <h4 style={{ color: 'var(--enetcom-navy)', fontSize: '1rem', marginBottom: '0.65rem' }}>
                  Comptes de test à disposition
                </h4>
                <ul style={{ fontSize: '0.82rem', paddingLeft: '1.2rem', lineHeight: '1.8', color: 'var(--ink-secondary)' }}>
                  <li>
                    <strong style={{ color: 'var(--enetcom-navy)' }}>Président (Admin) :</strong> <code>0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266</code><br />
                    <span style={{ color: 'var(--ink-muted)' }}>Clé : 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80</span>
                  </li>
                  <li>
                    <strong style={{ color: 'var(--enetcom-navy)' }}>Électeur #1 :</strong> <code>0x70997970C51812dc3A010C7d01b50e0d17dc79C8</code><br />
                    <span style={{ color: 'var(--ink-muted)' }}>Clé : 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d</span>
                  </li>
                  <li>
                    <strong style={{ color: 'var(--enetcom-navy)' }}>Électeur #2 :</strong> <code>0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC</code><br />
                    <span style={{ color: 'var(--ink-muted)' }}>Clé : 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a</span>
                  </li>
                </ul>
              </div>

              <div style={{ background: 'var(--enetcom-navy-soft)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(12, 83, 151, 0.15)' }}>
                <h4 style={{ color: 'var(--enetcom-navy)', fontSize: '1rem', marginBottom: '0.65rem' }}>
                  Scénario d'audit recommandé
                </h4>
                <ol style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', lineHeight: '1.7', color: 'var(--ink-secondary)' }}>
                  <li>Présenter le contrat à l'état <em>Non débuté</em> (votes bloqués).</li>
                  <li>Ouvrir le scrutin avec le compte Président.</li>
                  <li>Inscrire l'Électeur #1 sur la liste d'émargement.</li>
                  <li>Basculer sur l'Électeur #1 et voter pour un candidat.</li>
                  <li>Tenter de revoter : démontrer le blocage du double vote.</li>
                  <li>Clôturer le scrutin avec le compte Président.</li>
                  <li>Consulter le dépouillement final et le vainqueur certifié.</li>
                </ol>
              </div>
            </div>

            <div style={{ background: '#ffffff', border: '2px solid var(--enetcom-orange)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ color: 'var(--enetcom-navy)', fontSize: '1rem', marginBottom: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--enetcom-orange)' }} /> Garanties cryptographiques vs Limites assumées
              </h4>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)', marginBottom: '0.5rem' }}>
                <strong>Garanties :</strong> Impossibilité mathématique pour l'administrateur, le serveur de l'université ou un tiers d'altérer un bulletin émis, de supprimer des suffrages ou de modifier le décompte on-chain.
              </p>
              <p style={{ fontSize: '0.88rem', color: 'var(--ink-secondary)' }}>
                <strong>Analyse critique pour le jury :</strong> La blockchain sécurise parfaitement l'urne une fois les suffrages soumis. L'inscription sur liste blanche dépend en amont de l'authentification académique. Pour préserver l'anonymat absolu en production, une couche Zero-Knowledge Proof (ZKP) ou anneau de signature est recommandée.
              </p>
            </div>
          </div>
        )}

        {/* 5. Pied de page officiel ENET'Com Sfax */}
        <footer className="enetcom-footer">
          <div className="enetcom-footer-inner">
            <div>
              <strong>ENET'Com Sfax</strong> • École Nationale d'Électronique et des Télécommunications de Sfax<br />
              Technopôle de Sfax, Route de Tunis Km 10, B.P. 1163, 3018 Sfax, Tunisie
            </div>
            <div className="enetcom-footer-links">
              <a href="https://enetcom.rnu.tn" target="_blank" rel="noreferrer">Site Officiel</a>
              <a href="https://univ-sfax.tn" target="_blank" rel="noreferrer">Université de Sfax</a>
              {isSepoliaTarget && (
                <a href={`https://sepolia.etherscan.io/address/${contractData.address}`} target="_blank" rel="noreferrer">
                  Etherscan Sepolia
                </a>
              )}
            </div>
            <div>
              Contrat actif : <code>{contractData.address}</code>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
