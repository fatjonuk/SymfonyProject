<?php

namespace AppBundle\HouseTour;

use Symfony\Component\Yaml\Yaml;

/**
 * Reads the central configuration of the 3D house tour
 * (app/config/house_tour.yml): texts, step order, camera keyframes and hotspots.
 */
class TourConfig
{
    private $file;
    private $data;

    public function __construct($file)
    {
        $this->file = $file;
    }

    public function all()
    {
        if (null === $this->data) {
            $data = Yaml::parse(file_get_contents($this->file));
            foreach ($data['steps'] as $index => &$step) {
                $step['number'] = $index + 1;
                $step += ['details' => [], 'hotspots' => [], 'button' => null, 'action' => null, 'more' => null];
            }
            unset($step);
            $this->data = $data;
        }

        return $this->data;
    }

    public function steps()
    {
        return $this->all()['steps'];
    }

    /**
     * Data handed to the JavaScript tour (camera keyframes, hotspots, labels).
     */
    public function forJavascript()
    {
        $data = $this->all();
        $steps = [];
        foreach ($data['steps'] as $step) {
            $steps[] = [
                'id' => $step['id'],
                'number' => $step['number'],
                'nav' => $step['nav'],
                'title' => $step['title'],
                'action' => $step['action'],
                'camera' => $step['camera'],
                'hotspots' => $step['hotspots'],
            ];
        }

        return [
            'intro' => ['camera' => $data['intro']['camera']],
            'steps' => $steps,
            'final' => ['camera' => $data['final']['camera']],
        ];
    }
}
