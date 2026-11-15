<?php

namespace Database\Factories;

use App\Models\Request;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Request>
 */
class RequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */

    public array $statuses = ['open', 'in_progress', 'done'];

    public array $priority = ['low', 'medium', 'high'];
    public function definition(): array
    {
        return [
            'client_id' => rand(1, 5),
            'title' => $this->faker->company(),
            'description' => $this->faker->text(),
            'status' => $this->statuses[rand(0, 2)],
            'priority' => $this->priority[rand(0, 2)],
            'due_date' => $this->faker->dateTimeBetween('now', '+2 months'),
            'resolution' => $this->faker->text(),
        ];
    }
}
