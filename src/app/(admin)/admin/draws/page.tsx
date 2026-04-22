'use client'

import { useState, useEffect } from 'react'
import { drawService } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import type { Draw } from '@/types/database'

export default function DrawsPage() {
  const [draws, setDraws] = useState<Draw[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDraw, setEditingDraw] = useState<Draw | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    draw_numbers: '',
    total_pool: 5000,
    jackpot_rollover: 0,
    status: 'pending' as Draw['status'],
  })

  const loadDraws = async () => {
    try {
      setLoading(true)
      const { data, error } = await (await import('@/lib/supabase')).supabase
        .from('draws')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false })
      if (error) throw error
      setDraws(data || [])
    } catch (err) {
      console.error('Error loading draws:', err)
      setError('Failed to load draws')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadDraws() }, [])

  const resetForm = () => {
    setFormData({
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      draw_numbers: '',
      total_pool: 5000,
      jackpot_rollover: 0,
      status: 'pending',
    })
    setEditingDraw(null)
  }

  const openEditModal = (draw: Draw) => {
    setEditingDraw(draw)
    setFormData({
      month: draw.month,
      year: draw.year,
      draw_numbers: draw.draw_numbers.join(', '),
      total_pool: draw.total_pool,
      jackpot_rollover: draw.jackpot_rollover || 0,
      status: draw.status,
    })
    setShowCreateModal(true)
  }

  const handleSubmit = async () => {
    const numbers = formData.draw_numbers
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n >= 1 && n <= 45)

    if (numbers.length !== 5) {
      setError('Please enter exactly 5 valid numbers between 1 and 45')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const { supabase } = await import('@/lib/supabase')
      if (editingDraw) {
        const { error } = await supabase
          .from('draws')
          .update({
            month: formData.month,
            year: formData.year,
            draw_numbers: numbers,
            total_pool: formData.total_pool,
            jackpot_rollover: formData.jackpot_rollover,
            status: formData.status,
          })
          .eq('id', editingDraw.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('draws')
          .insert([{
            month: formData.month,
            year: formData.year,
            draw_numbers: numbers,
            total_pool: formData.total_pool,
            jackpot_rollover: formData.jackpot_rollover,
            status: formData.status,
          }])
        if (error) throw error
      }

      await loadDraws()
      setShowCreateModal(false)
      resetForm()
    } catch (err: any) {
      setError(err.message || 'Failed to save draw')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePublish = async (draw: Draw) => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('draws')
        .update({ status: 'published' })
        .eq('id', draw.id)
      if (error) throw error
      await loadDraws()
    } catch (err: any) {
      setError(err.message || 'Failed to publish draw')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" variant="white" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Draws</h1>
          <p className="text-gray-400">Manage golf draws and prize pools</p>
        </div>
        <Button onClick={() => { resetForm(); setShowCreateModal(true) }}>
          Create Draw
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      <Card className="bg-[#112240] border-white/10">
        <CardHeader>
          <CardTitle className="text-white">Draw Management</CardTitle>
          <CardDescription className="text-gray-400">
            Manage golf draws and prize pools
          </CardDescription>
        </CardHeader>
        <CardContent>
          {draws.length === 0 ? (
            <p className="text-gray-400">No draws found. Create your first draw.</p>
          ) : (
            <div className="space-y-4">
              {draws.map((draw) => (
                <div key={draw.id} className="border border-white/10 rounded-lg p-4 bg-white/5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {draw.month}/{draw.year}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Numbers: {draw.draw_numbers.join(', ')}
                      </p>
                      <p className="text-sm text-gray-400">
                        Pool: ${draw.total_pool.toLocaleString()}
                      </p>
                      <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium ${
                        draw.status === 'published' 
                          ? 'bg-green-500/20 text-green-400'
                          : draw.status === 'simulated'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {draw.status}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEditModal(draw)}>
                        Edit
                      </Button>
                      {draw.status !== 'published' && (
                        <Button size="sm" onClick={() => handlePublish(draw)}>
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#112240] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">
                {editingDraw ? 'Edit Draw' : 'Create Draw'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); resetForm() }}
                className="text-gray-400 hover:text-white text-2xl">×</button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                  <input type="number" min="1" max="12"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Year</label>
                  <input type="number" min="2024"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Winning Numbers (5 numbers, 1-45, comma separated)
                </label>
                <input type="text" placeholder="e.g. 5, 12, 18, 23, 31"
                  value={formData.draw_numbers}
                  onChange={(e) => setFormData({...formData, draw_numbers: e.target.value})}
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Total Pool ($)</label>
                <input type="number" min="0"
                  value={formData.total_pool}
                  onChange={(e) => setFormData({...formData, total_pool: parseFloat(e.target.value)})}
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as Draw['status']})}
                  className="w-full px-4 py-2 bg-[#0a1628] border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#00ff87]"
                >
                  <option value="pending">Pending</option>
                  <option value="simulated">Simulated</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => { setShowCreateModal(false); resetForm() }}
                disabled={submitting}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : editingDraw ? 'Update Draw' : 'Create Draw'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}