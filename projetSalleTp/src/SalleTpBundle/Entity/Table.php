<?php

namespace SalleTpBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Table
 *
 * @ORM\Table(name="table", indexes={@ORM\Index(name="idDossier", columns={"idDossier"}), @ORM\Index(name="idDOOSS", columns={"idDOOSS"}), @ORM\Index(name="foreign", columns={"foreign"})})
 * @ORM\Entity
 */
class Table
{
    /**
     * @var \Donnees
     *
     * @ORM\ManyToOne(targetEntity="Donnees")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="idDOOSS", referencedColumnName="id_dossier")
     * })
     */
    private $iddooss;

    /**
     * @var \Examens
     *
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="NONE")
     * @ORM\OneToOne(targetEntity="Examens")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="idDossier", referencedColumnName="Foreign")
     * })
     */
    private $iddossier;

    /**
     * @var \Donnees
     *
     * @ORM\ManyToOne(targetEntity="Donnees")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="foreign", referencedColumnName="id_dossier")
     * })
     */
    private $foreign;



    /**
     * Set iddooss
     *
     * @param \SalleTpBundle\Entity\Donnees $iddooss
     *
     * @return Table
     */
    public function setIddooss(\SalleTpBundle\Entity\Donnees $iddooss = null)
    {
        $this->iddooss = $iddooss;

        return $this;
    }

    /**
     * Get iddooss
     *
     * @return \SalleTpBundle\Entity\Donnees
     */
    public function getIddooss()
    {
        return $this->iddooss;
    }

    /**
     * Set iddossier
     *
     * @param \SalleTpBundle\Entity\Examens $iddossier
     *
     * @return Table
     */
    public function setIddossier(\SalleTpBundle\Entity\Examens $iddossier)
    {
        $this->iddossier = $iddossier;

        return $this;
    }

    /**
     * Get iddossier
     *
     * @return \SalleTpBundle\Entity\Examens
     */
    public function getIddossier()
    {
        return $this->iddossier;
    }

    /**
     * Set foreign
     *
     * @param \SalleTpBundle\Entity\Donnees $foreign
     *
     * @return Table
     */
    public function setForeign(\SalleTpBundle\Entity\Donnees $foreign = null)
    {
        $this->foreign = $foreign;

        return $this;
    }

    /**
     * Get foreign
     *
     * @return \SalleTpBundle\Entity\Donnees
     */
    public function getForeign()
    {
        return $this->foreign;
    }
}
