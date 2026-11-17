<?php

namespace SalleTpBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Examens
 *
 * @ORM\Table(name="examens")
 * @ORM\Entity(repositoryClass="SalleTpBundle\Repository\ExamensRepository")
 */
class Examens
{
    /**
     * @var int
     *
     * @ORM\Column(name="id", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     */
    private $id;

    /**
     * @var int
     *
     * @ORM\Column(name="IRM", type="smallint", nullable=true)
     */
    private $iRM;

    /**
     * @var int
     *
     * @ORM\Column(name="Scanner", type="smallint", nullable=true)
     */
    private $scanner;

    /**
     * @var string
     *
     * @ORM\Column(name="mois", type="string", length=255)
     */
    private $mois;


    /**
     * Get id
     *
     * @return int
     */
    public function getId()
    {
        return $this->id;
    }

    /**
     * Set iRM
     *
     * @param integer $iRM
     *
     * @return Examens
     */
    public function setIRM($iRM)
    {
        $this->iRM = $iRM;

        return $this;
    }

    /**
     * Get iRM
     *
     * @return int
     */
    public function getIRM()
    {
        return $this->iRM;
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
     * @return int
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
     * @return exaamens
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
     * To string
     *
     * @return string
     */
    public function __toString() {
    return $this->mois;
    }
}

