<?php

namespace SalleTpBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class ConnectionController extends Controller
{ 
    public function connectionAction()
    {
        return $this->render('@SalleTp/Connection/connection.html.twig');
    }
}
