<?php
namespace SalleTpBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use SalleTpBundle\Entity\Examens;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;

class TableListController extends Controller
{
    public function tableListAction(){
    	 return $this->render('@SalleTp/Infos/tableList.html.twig');
	}
   } 
