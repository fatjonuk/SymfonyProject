<?php
// src/Form/Type/ProductType.php
namespace SalleTpBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Bridge\Doctrine\Form\Type\EntityType;

class SelectionType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder->add('Choix_des_donnees_a_visualiser_1',ChoiceType::class,
                    ['choices' => array_flip ($array)])
                ->add('Choix_des_donnees_a_visualiser_2',ChoiceType::class,
                    ['choices' => array_flip ($array)])
                ->add('Choix_des_donnees_a_visualiser_3',ChoiceType::class,
                    ['choices' => array_flip ($array)])
                ->add('Submit',SubmitType::class, array('label' => 'Rechercher'))
                ->add('saveA',SubmitType::class, array('label' => 'Rechercher2'));
    }

    public function configureOptions(OptionsResolver $resolver)
    {
        $resolver->setDefaults([
            'data_class' => 'SalleTpBundle\Form\SelectionType',
        ]);
    }
}