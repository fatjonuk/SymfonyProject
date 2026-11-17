<?php

namespace SalleTpBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Donnees
 *
 * @ORM\Table(name="donnees", uniqueConstraints={@ORM\UniqueConstraint(name="id_dossier", columns={"id_dossier"})})
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
    private $dateDossier;

    /**
     * @var integer
     *
     * @ORM\Column(name="anneeDossier", type="integer", nullable=false)
     */
    private $anneeDossier;

    /**
     * @var integer
     *
     * @ORM\Column(name="moisDossier", type="integer", nullable=false)
     */
    private $moisDossier;

    /**
     * @var integer
     *
     * @ORM\Column(name="numéro du jour dossier", type="integer", nullable=false)
     */
    private $numeroDuJourDossier;

    /**
     * @var string
     *
     * @ORM\Column(name="nom jour dossier", type="text", length=65535, nullable=false)
     */
    private $nomJourDossier;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="heure dossier", type="time", nullable=false)
     */
    private $heureDossier;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="heure cotation", type="time", nullable=false)
     */
    private $heureCotation;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="heure debut examen", type="time", nullable=false)
     */
    private $heureDebutExamen;

    /**
     * @var string
     *
     * @ORM\Column(name="heure fin examen", type="text", length=65535, nullable=false)
     */
    private $heureFinExamen;

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
     * @ORM\Column(name="Date de Naissance", type="integer", nullable=false)
     */
    private $dateDeNaissance;

    /**
     * @var integer
     *
     * @ORM\Column(name="Année de Naissance", type="integer", nullable=false)
     */
    private $anneeDeNaissance;

    /**
     * @var integer
     *
     * @ORM\Column(name="NIR", type="integer", nullable=false)
     */
    private $nir;

    /**
     * @var integer
     *
     * @ORM\Column(name="Age à la date du dossier", type="integer", nullable=false)
     */
    private $ageALaDateDuDossier;

    /**
     * @var string
     *
     * @ORM\Column(name="sexe", type="text", length=65535, nullable=false)
     */
    private $sexe;

    /**
     * @var string
     *
     * @ORM\Column(name="sexe ARS", type="text", length=65535, nullable=false)
     */
    private $sexeArs;

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
     * @ORM\Column(name="code AMO", type="integer", nullable=false)
     */
    private $codeAmo;

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
     * @ORM\Column(name="Statut d'hospitalisation", type="text", length=65535, nullable=false)
     */
    private $statutDhospitalisation;

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
     * @ORM\Column(name="Nb Actes Ambulatoires publics", type="integer", nullable=false)
     */
    private $nbActesAmbulatoiresPublics;

    /**
     * @var integer
     *
     * @ORM\Column(name="Nb Actes Ambulatoires activité libérale", type="integer", nullable=false)
     */
    private $nbActesAmbulatoiresActiviteOrale;

    /**
     * @var integer
     *
     * @ORM\Column(name="Nb Actes en hospitalisation", type="integer", nullable=false)
     */
    private $nbActesEnHospitalisation;

    /**
     * @var integer
     *
     * @ORM\Column(name="Nb Actes", type="integer", nullable=false)
     */
    private $nbActes;

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
     * @ORM\Column(name="médecin prescripteur", type="text", length=65535, nullable=false)
     */
    private $medecinPrescripteur;

    /**
     * @var string
     *
     * @ORM\Column(name="spécialité médecin prescripteur", type="text", length=65535, nullable=false)
     */
    private $specialiteMedecinPrescripteur;

    /**
     * @var string
     *
     * @ORM\Column(name="médecin traitant", type="text", length=65535, nullable=false)
     */
    private $medecinTraitant;

    /**
     * @var integer
     *
     * @ORM\Column(name="spécialité médecin traitant", type="integer", nullable=false)
     */
    private $specialiteMedecinTraitant;



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
     * Set dateDossier
     *
     * @param integer $dateDossier
     *
     * @return Donnees
     */
    public function setDateDossier($dateDossier)
    {
        $this->dateDossier = $dateDossier;

        return $this;
    }

    /**
     * Get dateDossier
     *
     * @return integer
     */
    public function getDateDossier()
    {
        return $this->dateDossier;
    }

    /**
     * Set anneeDossier
     *
     * @param integer $anneeDossier
     *
     * @return Donnees
     */
    public function setAnneeDossier($anneeDossier)
    {
        $this->anneeDossier = $anneeDossier;

        return $this;
    }

    /**
     * Get anneeDossier
     *
     * @return integer
     */
    public function getAnneeDossier()
    {
        return $this->anneeDossier;
    }

    /**
     * Set moisDossier
     *
     * @param integer $moisDossier
     *
     * @return Donnees
     */
    public function setMoisDossier($moisDossier)
    {
        $this->moisDossier = $moisDossier;

        return $this;
    }

    /**
     * Get moisDossier
     *
     * @return integer
     */
    public function getMoisDossier()
    {
        return $this->moisDossier;
    }

    /**
     * Set numeroDuJourDossier
     *
     * @param integer $numeroDuJourDossier
     *
     * @return Donnees
     */
    public function setNumeroDuJourDossier($numeroDuJourDossier)
    {
        $this->numeroDuJourDossier = $numeroDuJourDossier;

        return $this;
    }

    /**
     * Get numeroDuJourDossier
     *
     * @return integer
     */
    public function getNumeroDuJourDossier()
    {
        return $this->numeroDuJourDossier;
    }

    /**
     * Set nomJourDossier
     *
     * @param string $nomJourDossier
     *
     * @return Donnees
     */
    public function setNomJourDossier($nomJourDossier)
    {
        $this->nomJourDossier = $nomJourDossier;

        return $this;
    }

    /**
     * Get nomJourDossier
     *
     * @return string
     */
    public function getNomJourDossier()
    {
        return $this->nomJourDossier;
    }

    /**
     * Set heureDossier
     *
     * @param \DateTime $heureDossier
     *
     * @return Donnees
     */
    public function setHeureDossier($heureDossier)
    {
        $this->heureDossier = $heureDossier;

        return $this;
    }

    /**
     * Get heureDossier
     *
     * @return \DateTime
     */
    public function getHeureDossier()
    {
        return $this->heureDossier;
    }

    /**
     * Set heureCotation
     *
     * @param \DateTime $heureCotation
     *
     * @return Donnees
     */
    public function setHeureCotation($heureCotation)
    {
        $this->heureCotation = $heureCotation;

        return $this;
    }

    /**
     * Get heureCotation
     *
     * @return \DateTime
     */
    public function getHeureCotation()
    {
        return $this->heureCotation;
    }

    /**
     * Set heureDebutExamen
     *
     * @param \DateTime $heureDebutExamen
     *
     * @return Donnees
     */
    public function setHeureDebutExamen($heureDebutExamen)
    {
        $this->heureDebutExamen = $heureDebutExamen;

        return $this;
    }

    /**
     * Get heureDebutExamen
     *
     * @return \DateTime
     */
    public function getHeureDebutExamen()
    {
        return $this->heureDebutExamen;
    }

    /**
     * Set heureFinExamen
     *
     * @param string $heureFinExamen
     *
     * @return Donnees
     */
    public function setHeureFinExamen($heureFinExamen)
    {
        $this->heureFinExamen = $heureFinExamen;

        return $this;
    }

    /**
     * Get heureFinExamen
     *
     * @return string
     */
    public function getHeureFinExamen()
    {
        return $this->heureFinExamen;
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
     * Set dateDeNaissance
     *
     * @param integer $dateDeNaissance
     *
     * @return Donnees
     */
    public function setDateDeNaissance($dateDeNaissance)
    {
        $this->dateDeNaissance = $dateDeNaissance;

        return $this;
    }

    /**
     * Get dateDeNaissance
     *
     * @return integer
     */
    public function getDateDeNaissance()
    {
        return $this->dateDeNaissance;
    }

    /**
     * Set anneeDeNaissance
     *
     * @param integer $anneeDeNaissance
     *
     * @return Donnees
     */
    public function setAnneeDeNaissance($anneeDeNaissance)
    {
        $this->anneeDeNaissance = $anneeDeNaissance;

        return $this;
    }

    /**
     * Get anneeDeNaissance
     *
     * @return integer
     */
    public function getAnneeDeNaissance()
    {
        return $this->anneeDeNaissance;
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
     * Set ageALaDateDuDossier
     *
     * @param integer $ageALaDateDuDossier
     *
     * @return Donnees
     */
    public function setAgeALaDateDuDossier($ageALaDateDuDossier)
    {
        $this->ageALaDateDuDossier = $ageALaDateDuDossier;

        return $this;
    }

    /**
     * Get ageALaDateDuDossier
     *
     * @return integer
     */
    public function getAgeALaDateDuDossier()
    {
        return $this->ageALaDateDuDossier;
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
     * Set sexeArs
     *
     * @param string $sexeArs
     *
     * @return Donnees
     */
    public function setSexeArs($sexeArs)
    {
        $this->sexeArs = $sexeArs;

        return $this;
    }

    /**
     * Get sexeArs
     *
     * @return string
     */
    public function getSexeArs()
    {
        return $this->sexeArs;
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
     * Set codeAmo
     *
     * @param integer $codeAmo
     *
     * @return Donnees
     */
    public function setCodeAmo($codeAmo)
    {
        $this->codeAmo = $codeAmo;

        return $this;
    }

    /**
     * Get codeAmo
     *
     * @return integer
     */
    public function getCodeAmo()
    {
        return $this->codeAmo;
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
     * Set statutDhospitalisation
     *
     * @param string $statutDhospitalisation
     *
     * @return Donnees
     */
    public function setStatutDhospitalisation($statutDhospitalisation)
    {
        $this->statutDhospitalisation = $statutDhospitalisation;

        return $this;
    }

    /**
     * Get statutDhospitalisation
     *
     * @return string
     */
    public function getStatutDhospitalisation()
    {
        return $this->statutDhospitalisation;
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
     * Set nbActesAmbulatoiresPublics
     *
     * @param integer $nbActesAmbulatoiresPublics
     *
     * @return Donnees
     */
    public function setNbActesAmbulatoiresPublics($nbActesAmbulatoiresPublics)
    {
        $this->nbActesAmbulatoiresPublics = $nbActesAmbulatoiresPublics;

        return $this;
    }

    /**
     * Get nbActesAmbulatoiresPublics
     *
     * @return integer
     */
    public function getNbActesAmbulatoiresPublics()
    {
        return $this->nbActesAmbulatoiresPublics;
    }

    /**
     * Set nbActesAmbulatoiresActiviteOrale
     *
     * @param integer $nbActesAmbulatoiresActiviteOrale
     *
     * @return Donnees
     */
    public function setNbActesAmbulatoiresActiviteOrale($nbActesAmbulatoiresActiviteOrale)
    {
        $this->nbActesAmbulatoiresActiviteOrale = $nbActesAmbulatoiresActiviteOrale;

        return $this;
    }

    /**
     * Get nbActesAmbulatoiresActiviteOrale
     *
     * @return integer
     */
    public function getNbActesAmbulatoiresActiviteOrale()
    {
        return $this->nbActesAmbulatoiresActiviteOrale;
    }

    /**
     * Set nbActesEnHospitalisation
     *
     * @param integer $nbActesEnHospitalisation
     *
     * @return Donnees
     */
    public function setNbActesEnHospitalisation($nbActesEnHospitalisation)
    {
        $this->nbActesEnHospitalisation = $nbActesEnHospitalisation;

        return $this;
    }

    /**
     * Get nbActesEnHospitalisation
     *
     * @return integer
     */
    public function getNbActesEnHospitalisation()
    {
        return $this->nbActesEnHospitalisation;
    }

    /**
     * Set nbActes
     *
     * @param integer $nbActes
     *
     * @return Donnees
     */
    public function setNbActes($nbActes)
    {
        $this->nbActes = $nbActes;

        return $this;
    }

    /**
     * Get nbActes
     *
     * @return integer
     */
    public function getNbActes()
    {
        return $this->nbActes;
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
     * Set medecinPrescripteur
     *
     * @param string $medecinPrescripteur
     *
     * @return Donnees
     */
    public function setMedecinPrescripteur($medecinPrescripteur)
    {
        $this->medecinPrescripteur = $medecinPrescripteur;

        return $this;
    }

    /**
     * Get medecinPrescripteur
     *
     * @return string
     */
    public function getMedecinPrescripteur()
    {
        return $this->medecinPrescripteur;
    }

    /**
     * Set specialiteMedecinPrescripteur
     *
     * @param string $specialiteMedecinPrescripteur
     *
     * @return Donnees
     */
    public function setSpecialiteMedecinPrescripteur($specialiteMedecinPrescripteur)
    {
        $this->specialiteMedecinPrescripteur = $specialiteMedecinPrescripteur;

        return $this;
    }

    /**
     * Get specialiteMedecinPrescripteur
     *
     * @return string
     */
    public function getSpecialiteMedecinPrescripteur()
    {
        return $this->specialiteMedecinPrescripteur;
    }

    /**
     * Set medecinTraitant
     *
     * @param string $medecinTraitant
     *
     * @return Donnees
     */
    public function setMedecinTraitant($medecinTraitant)
    {
        $this->medecinTraitant = $medecinTraitant;

        return $this;
    }

    /**
     * Get medecinTraitant
     *
     * @return string
     */
    public function getMedecinTraitant()
    {
        return $this->medecinTraitant;
    }

    /**
     * Set specialiteMedecinTraitant
     *
     * @param integer $specialiteMedecinTraitant
     *
     * @return Donnees
     */
    public function setSpecialiteMedecinTraitant($specialiteMedecinTraitant)
    {
        $this->specialiteMedecinTraitant = $specialiteMedecinTraitant;

        return $this;
    }

    /**
     * Get specialiteMedecinTraitant
     *
     * @return integer
     */
    public function getSpecialiteMedecinTraitant()
    {
        return $this->specialiteMedecinTraitant;
    }
}
