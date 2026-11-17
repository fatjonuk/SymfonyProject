<?php

namespace SalleTpBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Donnees
 *
 * @ORM\Table(name="donnees")
 * @ORM\Entity
 */
class Donnees
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id_dossier", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $idDossier;

    /**
     * @var integer
     *
     * @ORM\Column(name="accession_number", type="integer", nullable=false)
     */
    private $accessionNumber;

    /**
     * @var integer
     *
     * @ORM\Column(name="code_cabinet", type="integer", nullable=false)
     */
    private $codeCabinet;

    /**
     * @var string
     *
     * @ORM\Column(name="libelle_cabinet", type="text", length=65535, nullable=false)
     */
    private $libelleCabinet;

    /**
     * @var integer
     *
     * @ORM\Column(name="dateDossier", type="integer", nullable=false)
     */
    private $datedossier;

    /**
     * @var integer
     *
     * @ORM\Column(name="anneeDossier", type="integer", nullable=false)
     */
    private $anneedossier;

    /**
     * @var string
     *
     * @ORM\Column(name="moisDossier", type="text", length=65535, nullable=false)
     */
    private $moisdossier;

    /**
     * @var integer
     *
     * @ORM\Column(name="numéroDuJourDossier", type="integer", nullable=false)
     */
    private $numérodujourdossier;

    /**
     * @var string
     *
     * @ORM\Column(name="nomJourDossier", type="text", length=65535, nullable=false)
     */
    private $nomjourdossier;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="heureDossier", type="time", nullable=false)
     */
    private $heuredossier;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="heureCotation", type="time", nullable=false)
     */
    private $heurecotation;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="heureDebutExamen", type="time", nullable=false)
     */
    private $heuredebutexamen;

    /**
     * @var string
     *
     * @ORM\Column(name="heureFinExamen", type="text", length=65535, nullable=false)
     */
    private $heurefinexamen;

    /**
     * @var integer
     *
     * @ORM\Column(name="Patient", type="integer", nullable=false)
     */
    private $patient;

    /**
     * @var string
     *
     * @ORM\Column(name="nom_patient", type="text", length=65535, nullable=false)
     */
    private $nomPatient;

    /**
     * @var string
     *
     * @ORM\Column(name="prenom_patient", type="text", length=65535, nullable=false)
     */
    private $prenomPatient;

    /**
     * @var string
     *
     * @ORM\Column(name="nom_naiss_patient", type="text", length=65535, nullable=false)
     */
    private $nomNaissPatient;

    /**
     * @var integer
     *
     * @ORM\Column(name="DateDeNaissance", type="integer", nullable=false)
     */
    private $datedenaissance;

    /**
     * @var integer
     *
     * @ORM\Column(name="AnnéeDeNaissance", type="integer", nullable=false)
     */
    private $annéedenaissance;

    /**
     * @var integer
     *
     * @ORM\Column(name="NIR", type="integer", nullable=false)
     */
    private $nir;

    /**
     * @var integer
     *
     * @ORM\Column(name="AgeALaDateDuDossier", type="integer", nullable=false)
     */
    private $agealadatedudossier;

    /**
     * @var string
     *
     * @ORM\Column(name="sexe", type="text", length=65535, nullable=false)
     */
    private $sexe;

    /**
     * @var string
     *
     * @ORM\Column(name="sexeARS", type="text", length=65535, nullable=false)
     */
    private $sexears;

    /**
     * @var integer
     *
     * @ORM\Column(name="code_postal", type="integer", nullable=false)
     */
    private $codePostal;

    /**
     * @var string
     *
     * @ORM\Column(name="ville", type="text", length=65535, nullable=false)
     */
    private $ville;

    /**
     * @var string
     *
     * @ORM\Column(name="Radiologue", type="text", length=65535, nullable=false)
     */
    private $radiologue;

    /**
     * @var string
     *
     * @ORM\Column(name="Actes", type="text", length=65535, nullable=false)
     */
    private $actes;

    /**
     * @var integer
     *
     * @ORM\Column(name="code_type_examen", type="integer", nullable=false)
     */
    private $codeTypeExamen;

    /**
     * @var string
     *
     * @ORM\Column(name="libelle_type_examen", type="text", length=65535, nullable=false)
     */
    private $libelleTypeExamen;

    /**
     * @var string
     *
     * @ORM\Column(name="modificateurs", type="text", length=65535, nullable=false)
     */
    private $modificateurs;

    /**
     * @var integer
     *
     * @ORM\Column(name="code_asso", type="integer", nullable=false)
     */
    private $codeAsso;

    /**
     * @var string
     *
     * @ORM\Column(name="Manipulateurs", type="text", length=65535, nullable=false)
     */
    private $manipulateurs;

    /**
     * @var integer
     *
     * @ORM\Column(name="appareil_code", type="integer", nullable=false)
     */
    private $appareilCode;

    /**
     * @var string
     *
     * @ORM\Column(name="appareil_libelle", type="text", length=65535, nullable=false)
     */
    private $appareilLibelle;

    /**
     * @var integer
     *
     * @ORM\Column(name="id_ident_amo", type="integer", nullable=false)
     */
    private $idIdentAmo;

    /**
     * @var integer
     *
     * @ORM\Column(name="codeAMO", type="integer", nullable=false)
     */
    private $codeamo;

    /**
     * @var integer
     *
     * @ORM\Column(name="id_ident_ets", type="integer", nullable=false)
     */
    private $idIdentEts;

    /**
     * @var integer
     *
     * @ORM\Column(name="id_ets", type="integer", nullable=false)
     */
    private $idEts;

    /**
     * @var integer
     *
     * @ORM\Column(name="ETS", type="integer", nullable=false)
     */
    private $ets;

    /**
     * @var integer
     *
     * @ORM\Column(name="num_sejour", type="integer", nullable=false)
     */
    private $numSejour;

    /**
     * @var integer
     *
     * @ORM\Column(name="nipp", type="integer", nullable=false)
     */
    private $nipp;

    /**
     * @var integer
     *
     * @ORM\Column(name="UF", type="integer", nullable=false)
     */
    private $uf;

    /**
     * @var string
     *
     * @ORM\Column(name="statut", type="text", length=65535, nullable=false)
     */
    private $statut;

    /**
     * @var string
     *
     * @ORM\Column(name="StatutDHospitalisation", type="text", length=65535, nullable=false)
     */
    private $statutdhospitalisation;

    /**
     * @var string
     *
     * @ORM\Column(name="activite_liberale", type="text", length=65535, nullable=false)
     */
    private $activiteLiberale;

    /**
     * @var string
     *
     * @ORM\Column(name="type_consultation", type="text", length=65535, nullable=false)
     */
    private $typeConsultation;

    /**
     * @var string
     *
     * @ORM\Column(name="type_accueil", type="text", length=65535, nullable=false)
     */
    private $typeAccueil;

    /**
     * @var integer
     *
     * @ORM\Column(name="NbActesAmbulatoiresPublics", type="integer", nullable=false)
     */
    private $nbactesambulatoirespublics;

    /**
     * @var integer
     *
     * @ORM\Column(name="NbActesAmbulatoiresActivitéLibérale", type="integer", nullable=false)
     */
    private $nbactesambulatoiresactivitélibérale;

    /**
     * @var integer
     *
     * @ORM\Column(name="NbActesEnHospitalisation", type="integer", nullable=false)
     */
    private $nbactesenhospitalisation;

    /**
     * @var integer
     *
     * @ORM\Column(name="NbActes", type="integer", nullable=false)
     */
    private $nbactes;

    /**
     * @var integer
     *
     * @ORM\Column(name="nb_produit", type="integer", nullable=false)
     */
    private $nbProduit;

    /**
     * @var string
     *
     * @ORM\Column(name="liste_produit", type="text", length=65535, nullable=false)
     */
    private $listeProduit;

    /**
     * @var integer
     *
     * @ORM\Column(name="cr_valide", type="integer", nullable=false)
     */
    private $crValide;

    /**
     * @var string
     *
     * @ORM\Column(name="cotation_valide", type="text", length=65535, nullable=false)
     */
    private $cotationValide;

    /**
     * @var string
     *
     * @ORM\Column(name="facture_valide", type="text", length=65535, nullable=false)
     */
    private $factureValide;

    /**
     * @var string
     *
     * @ORM\Column(name="facture_FT_valide", type="text", length=65535, nullable=false)
     */
    private $factureFtValide;

    /**
     * @var string
     *
     * @ORM\Column(name="médecinPrescripteur", type="text", length=65535, nullable=false)
     */
    private $médecinprescripteur;

    /**
     * @var string
     *
     * @ORM\Column(name="spécialitéMédecinPrescripteur", type="text", length=65535, nullable=false)
     */
    private $spécialitémédecinprescripteur;

    /**
     * @var string
     *
     * @ORM\Column(name="médecinTraitant", type="text", length=65535, nullable=false)
     */
    private $médecintraitant;

    /**
     * @var integer
     *
     * @ORM\Column(name="spécialitéMédecinTraitant", type="integer", nullable=false)
     */
    private $spécialitémédecintraitant;



    /**
     * Get idDossier
     *
     * @return integer
     */
    public function getIdDossier()
    {
        return $this->idDossier;
    }

    /**
     * Set accessionNumber
     *
     * @param integer $accessionNumber
     *
     * @return Donnees
     */
    public function setAccessionNumber($accessionNumber)
    {
        $this->accessionNumber = $accessionNumber;

        return $this;
    }

    /**
     * Get accessionNumber
     *
     * @return integer
     */
    public function getAccessionNumber()
    {
        return $this->accessionNumber;
    }

    /**
     * Set codeCabinet
     *
     * @param integer $codeCabinet
     *
     * @return Donnees
     */
    public function setCodeCabinet($codeCabinet)
    {
        $this->codeCabinet = $codeCabinet;

        return $this;
    }

    /**
     * Get codeCabinet
     *
     * @return integer
     */
    public function getCodeCabinet()
    {
        return $this->codeCabinet;
    }

    /**
     * Set libelleCabinet
     *
     * @param string $libelleCabinet
     *
     * @return Donnees
     */
    public function setLibelleCabinet($libelleCabinet)
    {
        $this->libelleCabinet = $libelleCabinet;

        return $this;
    }

    /**
     * Get libelleCabinet
     *
     * @return string
     */
    public function getLibelleCabinet()
    {
        return $this->libelleCabinet;
    }

    /**
     * Set datedossier
     *
     * @param integer $datedossier
     *
     * @return Donnees
     */
    public function setDatedossier($datedossier)
    {
        $this->datedossier = $datedossier;

        return $this;
    }

    /**
     * Get datedossier
     *
     * @return integer
     */
    public function getDatedossier()
    {
        return $this->datedossier;
    }

    /**
     * Set anneedossier
     *
     * @param integer $anneedossier
     *
     * @return Donnees
     */
    public function setAnneedossier($anneedossier)
    {
        $this->anneedossier = $anneedossier;

        return $this;
    }

    /**
     * Get anneedossier
     *
     * @return integer
     */
    public function getAnneedossier()
    {
        return $this->anneedossier;
    }

    /**
     * Set moisdossier
     *
     * @param string $moisdossier
     *
     * @return Donnees
     */
    public function setMoisdossier($moisdossier)
    {
        $this->moisdossier = $moisdossier;

        return $this;
    }

    /**
     * Get moisdossier
     *
     * @return string
     */
    public function getMoisdossier()
    {
        return $this->moisdossier;
    }

    /**
     * Set numérodujourdossier
     *
     * @param integer $numérodujourdossier
     *
     * @return Donnees
     */
    public function setNumérodujourdossier($numérodujourdossier)
    {
        $this->numérodujourdossier = $numérodujourdossier;

        return $this;
    }

    /**
     * Get numérodujourdossier
     *
     * @return integer
     */
    public function getNumérodujourdossier()
    {
        return $this->numérodujourdossier;
    }

    /**
     * Set nomjourdossier
     *
     * @param string $nomjourdossier
     *
     * @return Donnees
     */
    public function setNomjourdossier($nomjourdossier)
    {
        $this->nomjourdossier = $nomjourdossier;

        return $this;
    }

    /**
     * Get nomjourdossier
     *
     * @return string
     */
    public function getNomjourdossier()
    {
        return $this->nomjourdossier;
    }

    /**
     * Set heuredossier
     *
     * @param \DateTime $heuredossier
     *
     * @return Donnees
     */
    public function setHeuredossier($heuredossier)
    {
        $this->heuredossier = $heuredossier;

        return $this;
    }

    /**
     * Get heuredossier
     *
     * @return \DateTime
     */
    public function getHeuredossier()
    {
        return $this->heuredossier;
    }

    /**
     * Set heurecotation
     *
     * @param \DateTime $heurecotation
     *
     * @return Donnees
     */
    public function setHeurecotation($heurecotation)
    {
        $this->heurecotation = $heurecotation;

        return $this;
    }

    /**
     * Get heurecotation
     *
     * @return \DateTime
     */
    public function getHeurecotation()
    {
        return $this->heurecotation;
    }

    /**
     * Set heuredebutexamen
     *
     * @param \DateTime $heuredebutexamen
     *
     * @return Donnees
     */
    public function setHeuredebutexamen($heuredebutexamen)
    {
        $this->heuredebutexamen = $heuredebutexamen;

        return $this;
    }

    /**
     * Get heuredebutexamen
     *
     * @return \DateTime
     */
    public function getHeuredebutexamen()
    {
        return $this->heuredebutexamen;
    }

    /**
     * Set heurefinexamen
     *
     * @param string $heurefinexamen
     *
     * @return Donnees
     */
    public function setHeurefinexamen($heurefinexamen)
    {
        $this->heurefinexamen = $heurefinexamen;

        return $this;
    }

    /**
     * Get heurefinexamen
     *
     * @return string
     */
    public function getHeurefinexamen()
    {
        return $this->heurefinexamen;
    }

    /**
     * Set patient
     *
     * @param integer $patient
     *
     * @return Donnees
     */
    public function setPatient($patient)
    {
        $this->patient = $patient;

        return $this;
    }

    /**
     * Get patient
     *
     * @return integer
     */
    public function getPatient()
    {
        return $this->patient;
    }

    /**
     * Set nomPatient
     *
     * @param string $nomPatient
     *
     * @return Donnees
     */
    public function setNomPatient($nomPatient)
    {
        $this->nomPatient = $nomPatient;

        return $this;
    }

    /**
     * Get nomPatient
     *
     * @return string
     */
    public function getNomPatient()
    {
        return $this->nomPatient;
    }

    /**
     * Set prenomPatient
     *
     * @param string $prenomPatient
     *
     * @return Donnees
     */
    public function setPrenomPatient($prenomPatient)
    {
        $this->prenomPatient = $prenomPatient;

        return $this;
    }

    /**
     * Get prenomPatient
     *
     * @return string
     */
    public function getPrenomPatient()
    {
        return $this->prenomPatient;
    }

    /**
     * Set nomNaissPatient
     *
     * @param string $nomNaissPatient
     *
     * @return Donnees
     */
    public function setNomNaissPatient($nomNaissPatient)
    {
        $this->nomNaissPatient = $nomNaissPatient;

        return $this;
    }

    /**
     * Get nomNaissPatient
     *
     * @return string
     */
    public function getNomNaissPatient()
    {
        return $this->nomNaissPatient;
    }

    /**
     * Set datedenaissance
     *
     * @param integer $datedenaissance
     *
     * @return Donnees
     */
    public function setDatedenaissance($datedenaissance)
    {
        $this->datedenaissance = $datedenaissance;

        return $this;
    }

    /**
     * Get datedenaissance
     *
     * @return integer
     */
    public function getDatedenaissance()
    {
        return $this->datedenaissance;
    }

    /**
     * Set annéedenaissance
     *
     * @param integer $annéedenaissance
     *
     * @return Donnees
     */
    public function setAnnéedenaissance($annéedenaissance)
    {
        $this->annéedenaissance = $annéedenaissance;

        return $this;
    }

    /**
     * Get annéedenaissance
     *
     * @return integer
     */
    public function getAnnéedenaissance()
    {
        return $this->annéedenaissance;
    }

    /**
     * Set nir
     *
     * @param integer $nir
     *
     * @return Donnees
     */
    public function setNir($nir)
    {
        $this->nir = $nir;

        return $this;
    }

    /**
     * Get nir
     *
     * @return integer
     */
    public function getNir()
    {
        return $this->nir;
    }

    /**
     * Set agealadatedudossier
     *
     * @param integer $agealadatedudossier
     *
     * @return Donnees
     */
    public function setAgealadatedudossier($agealadatedudossier)
    {
        $this->agealadatedudossier = $agealadatedudossier;

        return $this;
    }

    /**
     * Get agealadatedudossier
     *
     * @return integer
     */
    public function getAgealadatedudossier()
    {
        return $this->agealadatedudossier;
    }

    /**
     * Set sexe
     *
     * @param string $sexe
     *
     * @return Donnees
     */
    public function setSexe($sexe)
    {
        $this->sexe = $sexe;

        return $this;
    }

    /**
     * Get sexe
     *
     * @return string
     */
    public function getSexe()
    {
        return $this->sexe;
    }

    /**
     * Set sexears
     *
     * @param string $sexears
     *
     * @return Donnees
     */
    public function setSexears($sexears)
    {
        $this->sexears = $sexears;

        return $this;
    }

    /**
     * Get sexears
     *
     * @return string
     */
    public function getSexears()
    {
        return $this->sexears;
    }

    /**
     * Set codePostal
     *
     * @param integer $codePostal
     *
     * @return Donnees
     */
    public function setCodePostal($codePostal)
    {
        $this->codePostal = $codePostal;

        return $this;
    }

    /**
     * Get codePostal
     *
     * @return integer
     */
    public function getCodePostal()
    {
        return $this->codePostal;
    }

    /**
     * Set ville
     *
     * @param string $ville
     *
     * @return Donnees
     */
    public function setVille($ville)
    {
        $this->ville = $ville;

        return $this;
    }

    /**
     * Get ville
     *
     * @return string
     */
    public function getVille()
    {
        return $this->ville;
    }

    /**
     * Set radiologue
     *
     * @param string $radiologue
     *
     * @return Donnees
     */
    public function setRadiologue($radiologue)
    {
        $this->radiologue = $radiologue;

        return $this;
    }

    /**
     * Get radiologue
     *
     * @return string
     */
    public function getRadiologue()
    {
        return $this->radiologue;
    }

    /**
     * Set actes
     *
     * @param string $actes
     *
     * @return Donnees
     */
    public function setActes($actes)
    {
        $this->actes = $actes;

        return $this;
    }

    /**
     * Get actes
     *
     * @return string
     */
    public function getActes()
    {
        return $this->actes;
    }

    /**
     * Set codeTypeExamen
     *
     * @param integer $codeTypeExamen
     *
     * @return Donnees
     */
    public function setCodeTypeExamen($codeTypeExamen)
    {
        $this->codeTypeExamen = $codeTypeExamen;

        return $this;
    }

    /**
     * Get codeTypeExamen
     *
     * @return integer
     */
    public function getCodeTypeExamen()
    {
        return $this->codeTypeExamen;
    }

    /**
     * Set libelleTypeExamen
     *
     * @param string $libelleTypeExamen
     *
     * @return Donnees
     */
    public function setLibelleTypeExamen($libelleTypeExamen)
    {
        $this->libelleTypeExamen = $libelleTypeExamen;

        return $this;
    }

    /**
     * Get libelleTypeExamen
     *
     * @return string
     */
    public function getLibelleTypeExamen()
    {
        return $this->libelleTypeExamen;
    }

    /**
     * Set modificateurs
     *
     * @param string $modificateurs
     *
     * @return Donnees
     */
    public function setModificateurs($modificateurs)
    {
        $this->modificateurs = $modificateurs;

        return $this;
    }

    /**
     * Get modificateurs
     *
     * @return string
     */
    public function getModificateurs()
    {
        return $this->modificateurs;
    }

    /**
     * Set codeAsso
     *
     * @param integer $codeAsso
     *
     * @return Donnees
     */
    public function setCodeAsso($codeAsso)
    {
        $this->codeAsso = $codeAsso;

        return $this;
    }

    /**
     * Get codeAsso
     *
     * @return integer
     */
    public function getCodeAsso()
    {
        return $this->codeAsso;
    }

    /**
     * Set manipulateurs
     *
     * @param string $manipulateurs
     *
     * @return Donnees
     */
    public function setManipulateurs($manipulateurs)
    {
        $this->manipulateurs = $manipulateurs;

        return $this;
    }

    /**
     * Get manipulateurs
     *
     * @return string
     */
    public function getManipulateurs()
    {
        return $this->manipulateurs;
    }

    /**
     * Set appareilCode
     *
     * @param integer $appareilCode
     *
     * @return Donnees
     */
    public function setAppareilCode($appareilCode)
    {
        $this->appareilCode = $appareilCode;

        return $this;
    }

    /**
     * Get appareilCode
     *
     * @return integer
     */
    public function getAppareilCode()
    {
        return $this->appareilCode;
    }

    /**
     * Set appareilLibelle
     *
     * @param string $appareilLibelle
     *
     * @return Donnees
     */
    public function setAppareilLibelle($appareilLibelle)
    {
        $this->appareilLibelle = $appareilLibelle;

        return $this;
    }

    /**
     * Get appareilLibelle
     *
     * @return string
     */
    public function getAppareilLibelle()
    {
        return $this->appareilLibelle;
    }

    /**
     * Set idIdentAmo
     *
     * @param integer $idIdentAmo
     *
     * @return Donnees
     */
    public function setIdIdentAmo($idIdentAmo)
    {
        $this->idIdentAmo = $idIdentAmo;

        return $this;
    }

    /**
     * Get idIdentAmo
     *
     * @return integer
     */
    public function getIdIdentAmo()
    {
        return $this->idIdentAmo;
    }

    /**
     * Set codeamo
     *
     * @param integer $codeamo
     *
     * @return Donnees
     */
    public function setCodeamo($codeamo)
    {
        $this->codeamo = $codeamo;

        return $this;
    }

    /**
     * Get codeamo
     *
     * @return integer
     */
    public function getCodeamo()
    {
        return $this->codeamo;
    }

    /**
     * Set idIdentEts
     *
     * @param integer $idIdentEts
     *
     * @return Donnees
     */
    public function setIdIdentEts($idIdentEts)
    {
        $this->idIdentEts = $idIdentEts;

        return $this;
    }

    /**
     * Get idIdentEts
     *
     * @return integer
     */
    public function getIdIdentEts()
    {
        return $this->idIdentEts;
    }

    /**
     * Set idEts
     *
     * @param integer $idEts
     *
     * @return Donnees
     */
    public function setIdEts($idEts)
    {
        $this->idEts = $idEts;

        return $this;
    }

    /**
     * Get idEts
     *
     * @return integer
     */
    public function getIdEts()
    {
        return $this->idEts;
    }

    /**
     * Set ets
     *
     * @param integer $ets
     *
     * @return Donnees
     */
    public function setEts($ets)
    {
        $this->ets = $ets;

        return $this;
    }

    /**
     * Get ets
     *
     * @return integer
     */
    public function getEts()
    {
        return $this->ets;
    }

    /**
     * Set numSejour
     *
     * @param integer $numSejour
     *
     * @return Donnees
     */
    public function setNumSejour($numSejour)
    {
        $this->numSejour = $numSejour;

        return $this;
    }

    /**
     * Get numSejour
     *
     * @return integer
     */
    public function getNumSejour()
    {
        return $this->numSejour;
    }

    /**
     * Set nipp
     *
     * @param integer $nipp
     *
     * @return Donnees
     */
    public function setNipp($nipp)
    {
        $this->nipp = $nipp;

        return $this;
    }

    /**
     * Get nipp
     *
     * @return integer
     */
    public function getNipp()
    {
        return $this->nipp;
    }

    /**
     * Set uf
     *
     * @param integer $uf
     *
     * @return Donnees
     */
    public function setUf($uf)
    {
        $this->uf = $uf;

        return $this;
    }

    /**
     * Get uf
     *
     * @return integer
     */
    public function getUf()
    {
        return $this->uf;
    }

    /**
     * Set statut
     *
     * @param string $statut
     *
     * @return Donnees
     */
    public function setStatut($statut)
    {
        $this->statut = $statut;

        return $this;
    }

    /**
     * Get statut
     *
     * @return string
     */
    public function getStatut()
    {
        return $this->statut;
    }

    /**
     * Set statutdhospitalisation
     *
     * @param string $statutdhospitalisation
     *
     * @return Donnees
     */
    public function setStatutdhospitalisation($statutdhospitalisation)
    {
        $this->statutdhospitalisation = $statutdhospitalisation;

        return $this;
    }

    /**
     * Get statutdhospitalisation
     *
     * @return string
     */
    public function getStatutdhospitalisation()
    {
        return $this->statutdhospitalisation;
    }

    /**
     * Set activiteLiberale
     *
     * @param string $activiteLiberale
     *
     * @return Donnees
     */
    public function setActiviteLiberale($activiteLiberale)
    {
        $this->activiteLiberale = $activiteLiberale;

        return $this;
    }

    /**
     * Get activiteLiberale
     *
     * @return string
     */
    public function getActiviteLiberale()
    {
        return $this->activiteLiberale;
    }

    /**
     * Set typeConsultation
     *
     * @param string $typeConsultation
     *
     * @return Donnees
     */
    public function setTypeConsultation($typeConsultation)
    {
        $this->typeConsultation = $typeConsultation;

        return $this;
    }

    /**
     * Get typeConsultation
     *
     * @return string
     */
    public function getTypeConsultation()
    {
        return $this->typeConsultation;
    }

    /**
     * Set typeAccueil
     *
     * @param string $typeAccueil
     *
     * @return Donnees
     */
    public function setTypeAccueil($typeAccueil)
    {
        $this->typeAccueil = $typeAccueil;

        return $this;
    }

    /**
     * Get typeAccueil
     *
     * @return string
     */
    public function getTypeAccueil()
    {
        return $this->typeAccueil;
    }

    /**
     * Set nbactesambulatoirespublics
     *
     * @param integer $nbactesambulatoirespublics
     *
     * @return Donnees
     */
    public function setNbactesambulatoirespublics($nbactesambulatoirespublics)
    {
        $this->nbactesambulatoirespublics = $nbactesambulatoirespublics;

        return $this;
    }

    /**
     * Get nbactesambulatoirespublics
     *
     * @return integer
     */
    public function getNbactesambulatoirespublics()
    {
        return $this->nbactesambulatoirespublics;
    }

    /**
     * Set nbactesambulatoiresactivitélibérale
     *
     * @param integer $nbactesambulatoiresactivitélibérale
     *
     * @return Donnees
     */
    public function setNbactesambulatoiresactivitélibérale($nbactesambulatoiresactivitélibérale)
    {
        $this->nbactesambulatoiresactivitélibérale = $nbactesambulatoiresactivitélibérale;

        return $this;
    }

    /**
     * Get nbactesambulatoiresactivitélibérale
     *
     * @return integer
     */
    public function getNbactesambulatoiresactivitélibérale()
    {
        return $this->nbactesambulatoiresactivitélibérale;
    }

    /**
     * Set nbactesenhospitalisation
     *
     * @param integer $nbactesenhospitalisation
     *
     * @return Donnees
     */
    public function setNbactesenhospitalisation($nbactesenhospitalisation)
    {
        $this->nbactesenhospitalisation = $nbactesenhospitalisation;

        return $this;
    }

    /**
     * Get nbactesenhospitalisation
     *
     * @return integer
     */
    public function getNbactesenhospitalisation()
    {
        return $this->nbactesenhospitalisation;
    }

    /**
     * Set nbactes
     *
     * @param integer $nbactes
     *
     * @return Donnees
     */
    public function setNbactes($nbactes)
    {
        $this->nbactes = $nbactes;

        return $this;
    }

    /**
     * Get nbactes
     *
     * @return integer
     */
    public function getNbactes()
    {
        return $this->nbactes;
    }

    /**
     * Set nbProduit
     *
     * @param integer $nbProduit
     *
     * @return Donnees
     */
    public function setNbProduit($nbProduit)
    {
        $this->nbProduit = $nbProduit;

        return $this;
    }

    /**
     * Get nbProduit
     *
     * @return integer
     */
    public function getNbProduit()
    {
        return $this->nbProduit;
    }

    /**
     * Set listeProduit
     *
     * @param string $listeProduit
     *
     * @return Donnees
     */
    public function setListeProduit($listeProduit)
    {
        $this->listeProduit = $listeProduit;

        return $this;
    }

    /**
     * Get listeProduit
     *
     * @return string
     */
    public function getListeProduit()
    {
        return $this->listeProduit;
    }

    /**
     * Set crValide
     *
     * @param integer $crValide
     *
     * @return Donnees
     */
    public function setCrValide($crValide)
    {
        $this->crValide = $crValide;

        return $this;
    }

    /**
     * Get crValide
     *
     * @return integer
     */
    public function getCrValide()
    {
        return $this->crValide;
    }

    /**
     * Set cotationValide
     *
     * @param string $cotationValide
     *
     * @return Donnees
     */
    public function setCotationValide($cotationValide)
    {
        $this->cotationValide = $cotationValide;

        return $this;
    }

    /**
     * Get cotationValide
     *
     * @return string
     */
    public function getCotationValide()
    {
        return $this->cotationValide;
    }

    /**
     * Set factureValide
     *
     * @param string $factureValide
     *
     * @return Donnees
     */
    public function setFactureValide($factureValide)
    {
        $this->factureValide = $factureValide;

        return $this;
    }

    /**
     * Get factureValide
     *
     * @return string
     */
    public function getFactureValide()
    {
        return $this->factureValide;
    }

    /**
     * Set factureFtValide
     *
     * @param string $factureFtValide
     *
     * @return Donnees
     */
    public function setFactureFtValide($factureFtValide)
    {
        $this->factureFtValide = $factureFtValide;

        return $this;
    }

    /**
     * Get factureFtValide
     *
     * @return string
     */
    public function getFactureFtValide()
    {
        return $this->factureFtValide;
    }

    /**
     * Set médecinprescripteur
     *
     * @param string $médecinprescripteur
     *
     * @return Donnees
     */
    public function setMédecinprescripteur($médecinprescripteur)
    {
        $this->médecinprescripteur = $médecinprescripteur;

        return $this;
    }

    /**
     * Get médecinprescripteur
     *
     * @return string
     */
    public function getMédecinprescripteur()
    {
        return $this->médecinprescripteur;
    }

    /**
     * Set spécialitémédecinprescripteur
     *
     * @param string $spécialitémédecinprescripteur
     *
     * @return Donnees
     */
    public function setSpécialitémédecinprescripteur($spécialitémédecinprescripteur)
    {
        $this->spécialitémédecinprescripteur = $spécialitémédecinprescripteur;

        return $this;
    }

    /**
     * Get spécialitémédecinprescripteur
     *
     * @return string
     */
    public function getSpécialitémédecinprescripteur()
    {
        return $this->spécialitémédecinprescripteur;
    }

    /**
     * Set médecintraitant
     *
     * @param string $médecintraitant
     *
     * @return Donnees
     */
    public function setMédecintraitant($médecintraitant)
    {
        $this->médecintraitant = $médecintraitant;

        return $this;
    }

    /**
     * Get médecintraitant
     *
     * @return string
     */
    public function getMédecintraitant()
    {
        return $this->médecintraitant;
    }

    /**
     * Set spécialitémédecintraitant
     *
     * @param integer $spécialitémédecintraitant
     *
     * @return Donnees
     */
    public function setSpécialitémédecintraitant($spécialitémédecintraitant)
    {
        $this->spécialitémédecintraitant = $spécialitémédecintraitant;

        return $this;
    }

    /**
     * Get spécialitémédecintraitant
     *
     * @return integer
     */
    public function getSpécialitémédecintraitant()
    {
        return $this->spécialitémédecintraitant;
    }
}
