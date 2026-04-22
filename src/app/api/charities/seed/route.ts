import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: NextRequest) {
  try {
    const charities = [
      {
        id: 'c4cf330e-9f2d-4690-adcc-29e46765e7ac',
        name: 'Red Cross',
        description: 'Helping people in need through disaster relief and health services',
        image_url: null,
        is_featured: true,
        is_active: true
      },
      {
        id: 'a1b2c3d4-0000-0000-0000-000000000001',
        name: 'UNICEF',
        description: 'Supporting children and mothers in developing countries',
        image_url: null,
        is_featured: true,
        is_active: true
      },
      {
        id: 'a1b2c3d4-0000-0000-0000-000000000002',
        name: 'World Wildlife Fund',
        description: 'Protecting endangered species and their habitats',
        image_url: null,
        is_featured: false,
        is_active: true
      },
      {
        id: 'a1b2c3d4-0000-0000-0000-000000000003',
        name: 'Doctors Without Borders',
        description: 'Providing medical assistance to people in crisis',
        image_url: null,
        is_featured: true,
        is_active: true
      }
    ]

    // Clear existing charities
    await supabaseAdmin.from('charities').delete().neq('id', '')

    // Insert new charities
    const { data, error } = await supabaseAdmin
      .from('charities')
      .insert(charities)
      .select()

    if (error) {
      console.error('Error seeding charities:', error)
      return NextResponse.json(
        { error: 'Failed to seed charities: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: 'Charities seeded successfully',
      count: data?.length || 0
    })
  } catch (error) {
    console.error('Error seeding charities:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
