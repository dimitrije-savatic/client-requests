<?php

namespace App;

enum Status: string
{
    case OPEN = 'open';
    case IN_PROGRESS = 'in_progress';
    case DONE = 'done';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
