<?php

namespace SalleTpBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use SalleTpBundle\Entity\Examens;
use SalleTpBundle\Form\rechercheForm;

class RechercheFormController extends Controller
{


public function rechercheFormAction()
{ 
    $em = $this->container->get('doctrine')->getEntityManager();

    $qb = $em->createQueryBuilder();
    $qb->select('examens')
      ->buildFrom('SalleTpBundle:Examens', 'examens');
    $query = $qb->getQuery();
    $examens = $query->getResult();

    return $this->container->get('templating')->renderResponse('@SalleTp/rechercheForm/rechercheForm.html.twig', array(
        'examens' => $examens
    ));
}

}
