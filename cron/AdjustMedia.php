<?php

namespace OpenBroadcaster\Modules\ObAdManager\Cron;

use OpenBroadcaster\Base\Cron;

class AdjustMedia extends Cron
{
    public function interval(): int
    {
        return 60 * 60 * 12;
    }

    public function run(): bool
    {
        echo "Adjusting media items.\n";

        $models = \OBFModels::get_instance();
        $models->obadmanager('adjust_media');

        return true;
    }
}