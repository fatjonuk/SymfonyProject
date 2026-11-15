<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class SceneTestController extends AbstractController
{
    #[Route('/', name: 'accueil')]
    public function accueil(): Response
    {
        return $this->render('accueil_provisoire.html.twig');
    }

    /** Page de test de la maison 3D (étape 1). */
    #[Route('/test/maison', name: 'test_maison')]
    public function maison(): Response
    {
        return $this->render('test/maison.html.twig');
    }
}
