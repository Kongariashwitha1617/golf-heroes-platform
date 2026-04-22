'use client'

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export default function CharitySection() {
  const charities = [
    {
      id: '1',
      name: 'Clean Water Foundation',
      description: 'Providing access to clean water in rural communities',
      image: '💧',
    },
    {
      id: '2',
      name: 'Education First',
      description: 'Building schools and educational programs globally',
      image: '📚',
    },
    {
      id: '3',
      name: 'Health Initiative',
      description: 'Supporting medical facilities in underserved areas',
      image: '🏥',
    },
  ]

  return (
    <section id="charities" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Your Impact Matters
        </h2>
        <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
          Choose where your contribution goes. Every subscription supports charities making real-world difference.
        </p>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {charities.map((charity) => (
            <Card key={charity.id}>
              <CardContent className="pt-6">
                <div className="text-5xl mb-4">{charity.image}</div>
                <CardTitle>{charity.name}</CardTitle>
                <CardDescription className="mt-2">{charity.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-6">View all charities and select your favorite</p>
          <Link href="/signup">
            <Button size="lg">Browse & Subscribe</Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
