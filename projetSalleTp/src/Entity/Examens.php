<?php

namespace SalleTpBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Examens
 *
 * @ORM\Table(name="examens")
 * @ORM\Entity
 */
class Examens
{
    /**
     * @var integer
     *
     * @ORM\Column(name="id", type="integer", nullable=false)
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
     */
    private $id;

    /**
     * @var integer
     *
     * @ORM\Column(name="Scanner", type="integer", nullable=false)
     */
    private $scanner;

    /**
     * @var string
     *
     * @ORM\Column(name="Mois", type="text", length=65535, nullable=false)
     */
    private $mois;

    /**
     * @var integer
     *
     * @ORM\Column(name="IRM", type="integer", nullable=false)
     */
    private $irm;



    /**
     * Get id
     *
     * @return integer
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set scanner
     *
     * @param integer $scanner
     *
     * @return Examens
     */
    public function setScanner($scanner)
    {
        $this->scanner = $scanner;

        return $this;
    }

    /**
     * Get scanner
     *
     * @return integer
     */
    public function getScanner()
    {
        return $this->scanner;
    }

    /**
     * Set mois
     *
     * @param string $mois
     *
     * @return Examens
     */
    public function setMois($mois)
    {
        $this->mois = $mois;

        return $this;
    }

    /**
     * Get mois
     *
     * @return string
     */
    public function getMois()
    {
        return $this->mois;
    }

    /**
     * Set irm
     *
     * @param integer $irm
     *
     * @return Examens
     */
    public function setIrm($irm)
    {
        $this->irm = $irm;

        return $this;
    }

    /**
     * Get irm
     *
     * @return integer
     */
    public function getIrm()
    {
        return $this->irm;
    }
}
