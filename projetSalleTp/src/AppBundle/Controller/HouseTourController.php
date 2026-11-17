<?php

namespace AppBundle\Controller;

use AppBundle\Form\ContactType;
use AppBundle\HouseTour\TourConfig;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

/**
 * Interactive 3D tour of the house and the pages it links to.
 *
 * The application kernel declares ISO-8859-1 (AppKernel::getCharset(), kept
 * for the Salle TP pages); these pages are written in UTF-8 and say so.
 */
class HouseTourController extends Controller
{
    private function utf8(Response $response)
    {
        return $response->setCharset('UTF-8');
    }

    /**
     * @Route("/", name="homepage")
     * @Route("/visite-maison", name="house_tour")
     */
    public function tourAction(TourConfig $tour)
    {
        $config = $tour->all();

        return $this->utf8($this->render('house/tour.html.twig', [
            'site' => $config['site'],
            'intro' => $config['intro'],
            'steps' => $config['steps'],
            'final' => $config['final'],
            'tour_js' => $tour->forJavascript(),
        ]));
    }

    /**
     * @Route("/services", name="site_services")
     */
    public function servicesAction(TourConfig $tour)
    {
        return $this->utf8($this->render('site/services.html.twig', [
            'site' => $tour->all()['site'],
            'steps' => $tour->steps(),
        ]));
    }

    /**
     * @Route("/contact", name="site_contact", methods={"GET", "POST"})
     */
    public function contactAction(Request $request, TourConfig $tour, LoggerInterface $logger)
    {
        $form = $this->createForm(ContactType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();
            // No mail transport is configured for this project: the request is
            // logged (var/logs/<env>.log). Plug a mailer or a CRM here.
            $logger->info('Nouvelle demande de contact', [
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'subject' => $data['subject'],
                'message_length' => mb_strlen($data['message']),
            ]);
            $this->addFlash('contact_success', 'Merci, votre demande a bien été enregistrée.');

            return $this->redirectToRoute('site_contact');
        }

        return $this->utf8($this->render('site/contact.html.twig', [
            'site' => $tour->all()['site'],
            'form' => $form->createView(),
        ]));
    }
}
