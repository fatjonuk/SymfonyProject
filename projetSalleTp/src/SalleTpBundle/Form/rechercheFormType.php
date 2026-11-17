<?php

namespace SalleTpBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilder;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver; 

class rechercheFormType extends AbstractType
{
   public function buildForm(FormBuilder $builder, array $options)
   {      
        $builder->add('IRM', TextType::class)
        ->add('Rechercher',SubmitType::class);
    }
    
    public function getName()
    {        
        return 'irmrecherche';
    }
}