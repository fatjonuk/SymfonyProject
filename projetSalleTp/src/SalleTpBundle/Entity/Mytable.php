<?php

namespace SalleTpBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * Mytable
 *
 * @ORM\Table(name="mytable")
 * @ORM\Entity
 */
class Mytable
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
     * @var \DateTime
     *
     * @ORM\Column(name="mois", type="date", nullable=true)
     */
    private $mois;

    /**
     * @var integer
     *
     * @ORM\Column(name="chiffreAffaire", type="integer", nullable=true)
     */
    private $chiffreaffaire;



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
     * Set mois
     *
     * @param \DateTime $mois
     *
     * @return Mytable
     */
    public function setMois($mois)
    {
        $this->mois = $mois;

        return $this;
    }

    /**
     * Get mois
     *
     * @return \DateTime
     */
    public function getMois()
    {
        return $this->mois;
    }

    /**
     * Set chiffreaffaire
     *
     * @param integer $chiffreaffaire
     *
     * @return Mytable
     */
    public function setChiffreaffaire($chiffreaffaire)
    {
        $this->chiffreaffaire = $chiffreaffaire;

        return $this;
    }

    /**
     * Get chiffreaffaire
     *
     * @return integer
     */
    public function getChiffreaffaire()
    {
        return $this->chiffreaffaire;
    }
}
