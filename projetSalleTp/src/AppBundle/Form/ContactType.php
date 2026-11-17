<?php

namespace AppBundle\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\TelType;
use Symfony\Component\Form\Extension\Core\Type\TextareaType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Validator\Constraints as Assert;

class ContactType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('name', TextType::class, [
                'label' => 'Nom et prénom',
                'constraints' => [new Assert\NotBlank(['message' => 'Indiquez votre nom.']), new Assert\Length(['max' => 120])],
            ])
            ->add('email', EmailType::class, [
                'label' => 'E-mail',
                'constraints' => [new Assert\NotBlank(['message' => 'Indiquez votre adresse e-mail.']), new Assert\Email(['message' => 'Adresse e-mail invalide.'])],
            ])
            ->add('phone', TelType::class, [
                'label' => 'Téléphone (facultatif)',
                'required' => false,
                'constraints' => [new Assert\Length(['max' => 30])],
            ])
            ->add('subject', ChoiceType::class, [
                'label' => 'Votre projet',
                'choices' => [
                    'Tableau électrique et mise en sécurité' => 'tableau',
                    'Prises et circuits' => 'prises',
                    'Éclairage' => 'eclairage',
                    'Cuisine et équipements' => 'cuisine',
                    'Chauffage électrique' => 'chauffage',
                    'Panneaux photovoltaïques' => 'photovoltaique',
                    'Borne de recharge' => 'borne',
                    'Autre demande' => 'autre',
                ],
            ])
            ->add('message', TextareaType::class, [
                'label' => 'Votre message',
                'attr' => ['rows' => 6],
                'constraints' => [new Assert\NotBlank(['message' => 'Décrivez votre demande en quelques mots.']), new Assert\Length(['min' => 10, 'max' => 5000, 'minMessage' => 'Votre message est un peu court.'])],
            ])
            ->add('consent', CheckboxType::class, [
                'label' => 'J’accepte que ces informations soient utilisées pour répondre à ma demande.',
                'constraints' => [new Assert\IsTrue(['message' => 'Votre accord est nécessaire pour traiter la demande.'])],
            ]);
    }
}
