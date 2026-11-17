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

class StatsController extends Controller
{ 
    public function statsAction($id1 , $id2)
    {
    	$repository = $this->getDoctrine()->getManager()->getRepository('SalleTpBundle:Examens');
    	$mois1 = $repository->findOneByMois($id1);
	$mois2 = $repository->findOneByMois($id2);
        return $this->render('@SalleTp/Stats/stats.html.twig',
    						array('mois1' => $mois1 , 'mois2' => $mois2 ));
    }

    public function convertirNomTables($className,$namespace)
        {
         $cleanClassName = str_replace($namespace.'\Entity\\', '', $className);
         $parts = explode('\\', $cleanClassName);

           return implode('', $parts);
        }

   public function infoAction(Request $request)
    {

    $em = $this->getDoctrine()->getManager();
    $entities = $em->getConfiguration()->getMetadataDriverImpl()->getAllClassNames();
    $namespace = str_replace('\Controller', '',__NAMESPACE__);

    foreach ($entities as $className) {
        $ent[] = $this->convertirNomTables($className,$namespace);
    }
    $entitiesNames = array_combine ( array_values($ent) ,array_values($ent) );

    $Selection = $this->createFormBuilder([],["allow_extra_fields" => true,])
                    ->add('Nom_de_la_table_des_donnees_1',ChoiceType::class,
                    ['choices' => array_flip ($entitiesNames)])
                    //->add('Nom_de_la_table_des_donnees_2',ChoiceType::class,
                    //['choices' => array_flip ($entitiesNames)])
                ->add('Submit',SubmitType::class, array('label' => 'Selectionner'))
                //->add('Ajouter', SubmitType::class, ['attr' => ['class' => 'save'],])
                ->getForm();

    $Selection2 = $this->createFormBuilder([],["allow_extra_fields" => true,])
                ->add('Nom_de_la_table_des_donnees_5',ChoiceType::class,
                    ['choices' => array_flip ($entitiesNames)])
                ->getForm();

    $Selection->handleRequest($request);
    //$i = 3;
   //if($Selection->isSubmitted()){
        /*if ($Selection->getClickedButton() && 'Ajouter' === $Selection->getClickedButton()->getName()){
            //Fonction unsubmit cree dans le fichier Symfony\Component\Form.php
            $Selection->unsubmit();
            $nom = 'Nom_de_la_table_des_donnees_'.$i;
            $Selection->add($nom,ChoiceType::class,
                    ['choices' => array_flip ($entitiesNames)]);
            $i++;
        }elseif($Selection->getClickedButton() && 'Submit' === $Selection->getClickedButton()->getName()){

            $Selection2->submit($request->get($Selection2->getName()));
            /*$_SESSION['mes_data']= $Selection2["Nom_de_la_table_des_donnees_5"]->getData();
            $datas = $_SESSION['mes_data'];
            $data=$Selection["Nom_de_la_table_des_donnees_1"]->getData();
            $data2=$Selection2["Nom_de_la_table_des_donnees_5"]->getData();

            return $this->render('@SalleTp/Infos/info.html.twig',
                array('Selection' => $Selection->createView(),'Selection2' => $Selection2->createView(),'form'=>$Selection,'form2'=>$Selection2,'data'=>$datas,'data2'=>$data2));
        }*/
            if($Selection->isSubmitted()){
                $id1 = $Selection["Nom_de_la_table_des_donnees_1"]->getData();
                //$id2 = $Selection["Nom_de_la_table_des_donnees_2"]->getData();
                return $this->redirect(
                        $this->generateUrl('site_ripn_infosNomtable', array('nomTable1'=> $id1,/*'nomTable2'=> $id2*/)));
            }



       /* while($Selection->isSubmitted() === false && $i<8){
        if ($Selection->getClickedButton() && 'Ajouter' === $Selection->getClickedButton()->getName()){
            //Fonction unsubmit cree dans le fichier Symfony\Component\Form.php
            $Selection->unsubmit();
            $nom = 'Nom_de_la_table_des_donnees_'.$i;
            $Selection->add($nom,ChoiceType::class,
                    ['choices' => array_flip ($entitiesNames)]);
            $i++;
            if ($Selection->getClickedButton() && 'Ajouter' === $Selection->getClickedButton()->getName()){
                $id1 = $Selection["Nom_de_la_table_des_donnees_1"]->getData();
                $id2 = $Selection["Nom_de_la_table_des_donnees_3"]->getData();
                return $this->redirect(
                        $this->generateUrl('site_ripn_infosNomtable', array('nomTable1'=> $id1,'nomTable2'=> $id2)));
            }
        }
        if($Selection->isSubmitted()){
            if ($Selection->getClickedButton() && 'Submit' === $Selection->getClickedButton()->getName()){
                $id12 = $Selection["Nom_de_la_table_des_donnees_1"]->getData();
                $id22 = $Selection["Nom_de_la_table_des_donnees_1"]->getData();
                return $this->redirect(
                        $this->generateUrl('site_ripn_infosNomtable', array('nomTable1'=> $id12,'nomTable2'=> $id22)));
            }
        }*/

        $repository = $this->getDoctrine()->getManager()->getRepository('SalleTpBundle:Mytable');
        $mois = $repository->findAll();
        $id1 = 'chiffreaffaire';$id2 = 'id';$id3 = 'mois';

         return $this->render('@SalleTp/Infos/infobis.html.twig',
                    array('Selection' => $Selection->createView(),'Selection2' => $Selection->createView(),'nomTable1'=> $mois,'nomTable2'=> $namespace,'id1'=>$entitiesNames,'id2'=>$id2,'id3'=>$id3));

}



    public function infoNomtableAction(Request $request,$nomTable1/*,$nomTable2*/)
    {

    $namespace = str_replace('\Controller', '',__NAMESPACE__);
    $bundleEntityName1 = $namespace.':'.$nomTable1; //nom de l'entite comme l'exemple: Bundlename:Entityname
    //$bundleEntityName2 = $namespace.':'.$nomTable2; //nom de l'entite comme l'exemple: Bundlename:Entityname
    $entityName1 = $namespace.'\Entity\\'.$nomTable1; //chemin de l'entite comme l'exemple: Bundlename/Entity/Entityname
    //$entityName2 = $namespace.'\Entity\\'.$nomTable2; //chemin de l'entite comme l'exemple: Bundlename/Entity/Entityname
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
                    ->add('Choix_des_donnees_a_visualiser_2',ChoiceType::class,
                    ['choices' => array_flip ($array1)])
                    ->add('Choix_des_donnees_a_visualiser_3',ChoiceType::class,
                    ['choices' => array_flip ($array1)])
                ->add('Submit',SubmitType::class, array('label' => 'Rechercher'))
                ->getForm();

    $Selection->handleRequest($request);



    if($Selection->isSubmitted()){
        $id1 = $Selection["Choix_des_donnees_a_visualiser_1"]->getData();
        $id2 = $Selection["Choix_des_donnees_a_visualiser_2"]->getData();
        $id3 = $Selection["Choix_des_donnees_a_visualiser_3"]->getData();
        $repository = $this->getDoctrine()->getManager()->getRepository($bundleEntityName1);
        $nomTable1 = $repository->findAll();
        return $this->render('@SalleTp/Infos/info3.html.twig',array('nomTable1'=> $nomTable1/*,'nomTable2'=> $mois2*/, 'id1' => $id1,'id2' => $id2,'id3' => $id3));

    }

        $repository = $this->getDoctrine()->getManager()->getRepository('SalleTpBundle:Examens');
        $nomTable1 = $repository->findAll();
        $id1 = 'IRM';$id3 = 'Mois';
        return $this->render('@SalleTp/Infos/info.html.twig',
                    array('Selection' => $Selection->createView(),'Selection2' => $Selection->createView(),'nomTable1'=> $nomTable1/*,'nomTable2'=> $nomTable1*/,'id1'=>$id1,'id3'=>$id3));

    }






    public function info2Action($id,Request $request)
    {
    	$repository = $this->getDoctrine()->getManager()->getRepository('SalleTpBundle:Examens');
    	$mois = $repository->findOneByMois($id);
	$Selection = $this->createFormBuilder()
    				->add('Mois',EntityType::class,
					array('class' => 'SalleTpBundle:Examens'))
				->add('Submit',SubmitType::class, array('label' => 'rech'))
				->getForm();
	$Selection->handleRequest($request);
        return $this->render('@SalleTp/Infos/info2.html.twig',
     					array('Selection' => $Selection->createView(),
						'mois' => $mois ));
    }




public function info3Action($id1,$id2,$id3,$nomTable1)
    {

        $namespace = str_replace('\Controller', '',__NAMESPACE__);
        $bundleEntityName1 = $namespace.':'.$nomTable1; //nom de l'entite comme l'exemple: Bundlename:Entityname
        $entityName1 = $namespace.'\Entity\\'.$nomTable1; //chemin de l'entite comme l'exemple: Bundlename/Entity/Entityname
        $repository1 = $this->getDoctrine()->getManager()->getRepository($bundleEntityName1);
        $mois1 = $repository1->findAll();

        $bundleEntityName2 = $namespace.':'.$nomTable2; //nom de l'entite comme l'exemple: Bundlename:Entityname
        $entityName2 = $namespace.'\Entity\\'.$nomTable2; //chemin de l'entite comme l'exemple: Bundlename/Entity/Entityname
        $repository2 = $this->getDoctrine()->getManager()->getRepository($bundleEntityName2);
        $mois2 = $repository2->findAll();
        return $this->render('@SalleTp/Infos/info3.html.twig',array('nomTable1'=> $mois1/*,'nomTable2'=> $mois2*/, 'id1' => $id1,'id2' => $id2,'id3' => $id3));
    }



public function info4Action($type , $donne1 , $donne2)
    {

        return $this->render('@SalleTp/Infos/info4.html.twig', array( 'type' => $type,'donnee' => $donne1,'donnee2' => $donne2 ));
    }










}
