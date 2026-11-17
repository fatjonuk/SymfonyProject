<?php

namespace SalleTpBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Form\Extension\Core\Type\ButtonType;
use App\Entity\Category;
use Symfony\Component\Form\ClickableInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;

function convertirNomTables($className,$namespace)
        { 
         $cleanClassName = str_replace($namespace.'\Entity\\', '', $className);
         $parts = explode('\\', $cleanClassName);

           return implode('', $parts);
        }

class FirstController extends Controller
{
	public function convertirNomTables($className,$namespace)
        {
         $cleanClassName = str_replace($namespace.'\Entity\\', '', $className);
         $parts = explode('\\', $cleanClassName);

           return implode('', $parts);
        }


	public function nomTableFormAction(Request $request)
    	{

		//on cree un entityManager
    	$em = $this->getDoctrine()->getManager();
    	//On recupere tout les noms des tables avec le namespace devant
    	$entities = $em->getConfiguration()->getMetadataDriverImpl()->getAllClassNames();
    	//on recupere le NameSpace pour ensuite le supprimer
    	$namespace = str_replace('\Controller', '',__NAMESPACE__);

    	//Pour chaque nom de table on supprime le Namespace qui est devant
    	foreach ($entities as $className) {
    	    $ent[] = $this->convertirNomTables($className,$namespace);
    	}
    	//Creation d'une table nomTable => nomTable
    	$entitiesNames = array_combine( array_values($ent) ,array_values($ent) );

		//Creation du formulaire avec choix du nom de la table
    	$Selection = $this->createFormBuilder([],["allow_extra_fields" => true,])
    	                ->add('Nom_de_la_table_des_donnees',ChoiceType::class,
    	                ['choices' => array_flip ($entitiesNames)])
    	                //->add('Nom_de_la_table_des_donnees_2',ChoiceType::class,
                    //['choices' => array_flip ($entitiesNames)])
                ->add('Submit',SubmitType::class, array('label' => 'Selectionner'))
                //->add('Ajouter', SubmitType::class, ['attr' => ['class' => 'save'],])
                ->getForm();

        //Creation du 2eme formulaire
	    $Selection2 = $this->createFormBuilder([],["allow_extra_fields" => true,])
	                ->add('Nom_de_la_table_des_donnees_5',ChoiceType::class,
	                    ['choices' => array_flip ($entitiesNames)])
	                ->getForm();

   		 $Selection->handleRequest($request);

   		 if($Selection->isSubmitted()){
                $id1 = $Selection["Nom_de_la_table_des_donnees"]->getData();
                //$id2 = $Selection["Nom_de_la_table_des_donnees_2"]->getData();
                return $this->redirect(
                        $this->generateUrl('site_NomColonne_form', array('nomTable1'=> $id1/*'nomTable2'=> $id2*/)));
            }

         return $this->render('@SalleTp/Form/nomTableForm.html.twig',
                    array('Selection' => $Selection->createView(),'Selection2' => $Selection->createView()));

   	}


   	public function nomColonneFormAction(Request $request,$nomTable1/*,$nomTable2*/)
    {

		$namespace = str_replace('\Controller', '',__NAMESPACE__);
	    $bundleEntityName1 = $namespace.':'.$nomTable1; //nom de l'entite comme l'exemple: Bundlename:Entityname
	    //$bundleEntityName2 = $namespace.':'.$nomTable2; //nom de l'entite comme l'exemple: Bundlename:Entityname
	    $entityName1 = $namespace.'\Entity\\'.$nomTable1; //chemin de l'entite comme l'exemple: Bundlename/Entity/	Entityname
	    //$entityName2 = $namespace.'\Entity\\'.$nomTable2; //chemin de l'entite comme l'exemple: Bundlename/Entity/	Entityname
	    $repository1 = $this->getDoctrine()->getManager()->getRepository($bundleEntityName1);
	    //$repository2 = $this->getDoctrine()->getManager()->getRepository($bundleEntityName2);

	    $em = $this->getDoctrine()->getManager();

	    $names1 = $em->getClassMetadata($entityName1)->getFieldNames();
	    $array1 =array_combine ( array_values($names1) ,array_values($names1) );
	    //$names2 = $em->getClassMetadata($entityName2)->getFieldNames();
	    //$array2 =array_combine ( array_values($names2) ,array_values($names2) );

	    $Selection = $this->createFormBuilder()
	                    ->add('Choix_des_donnees_a_visualiser_1',ChoiceType::class,
	                    ['choices' => array_flip ($array1)])
	                    /*->add('Choix_des_donnees_a_visualiser_2',ChoiceType::class,
	                    ['choices' => array_flip ($array1)])*/
	                    ->add('Choix_des_donnees_a_visualiser_3',ChoiceType::class,
	                    ['choices' => array_flip ($array1)])
	                ->add('Submit',SubmitType::class, array('label' => 'Rechercher'))
                ->getForm();

	    $Selection->handleRequest($request);



	    if($Selection->isSubmitted()){
	        $id1 = $Selection["Choix_des_donnees_a_visualiser_1"]->getData();
	        /*$id2 = $Selection["Choix_des_donnees_a_visualiser_2"]->getData();*/
	        $id3 = $Selection["Choix_des_donnees_a_visualiser_3"]->getData();
	        $repository = $this->getDoctrine()->getManager()->getRepository($bundleEntityName1);
	        $nomTable1 = $repository->findAll();
	        return $this->render('@SalleTp/Form/affichage.html.twig',array('nomTable1'=> $nomTable1/*,'nomTable2'=> $mois2*/	, 'id1' => $id1,'id2' => $id1,'id3' => $id3));

	    }

	        $repository = $this->getDoctrine()->getManager()->getRepository($bundleEntityName1);
	        $nomTable1 = $repository->findAll();
	        /*$id1 = 'IRM';$id3 = 'Mois';*/
		    return $this->render('@SalleTp/Form/nomTableForm.html.twig',
                    array('Selection' => $Selection->createView(),'Selection2' => $Selection->createView(),
                'nomTable1'	=> $nomTable1));

    }
}
