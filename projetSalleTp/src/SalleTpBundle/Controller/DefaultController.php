<?php

namespace SalleTpBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use SalleTpBundle\Entity\Examens;

class DefaultController extends Controller
{ 
    public function indexAction(Request $request)
    {
    	$examens = new Examens;
    	$form = $this->createFormBuilder()
    			->add('Type',TextType::class)
                ->add('Donnee1',TextType::class)
                ->add('Donnee2',TextType::class)
    			->add('Rechercher',SubmitType::class)
    			->getForm();
    	$form->handleRequest($request);
    	if($form->isSubmitted()){
        $type = $form["Type"]->getData();
        $donne1 = $form["Donnee1"]->getData();
        $donne2 = $form["Donnee2"]->getData();
    	return $this->redirect($this->generateUrl('site_ripn_infos4', array( 'type' => $type,'donne1' => $donne1,'donne2' => $donne2 )));

    	}
        return $this->render('@SalleTp/Default/index.html.twig',
    						array('monFormulaire' => $form->createView()));
    }

    public function index2Action()
    {
        return $this->render('@SalleTp/Form/affichage4.html.twig');
    }


}
