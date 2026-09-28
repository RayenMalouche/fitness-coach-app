// Fuel: pick an athlete by their bib, then plan what they eat and when.

import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'

import { useAnnouncer } from './track/announcer'
import { SectionHead } from './track/app-shell'
import { Bib } from './track/bib'
import MealCard from './MealCard'
import { clientAPI, mealAPI } from '../services/api'
import { cn } from '../lib/cn'
import { errorText } from '../lib/format'

export default function MealManagement() {
  const announce = useAnnouncer()
  const [clients, setClients] = useState([])
  const [selectedClient, setSelectedClient] = useState('')
  const [meals, setMeals] = useState([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newMeal, setNewMeal] = useState({ title: '', description: '', assignedDate: '' })

  useEffect(() => {
    clientAPI
      .getAll()
      .then((response) => setClients(response.data.clients.filter((c) => c.approved)))
      .catch((error) => {
        console.error('Failed to load clients:', error)
        announce('Could not load athletes', 'stop')
      })
  }, [announce])

  const loadClientMeals = async (clientId = selectedClient) => {
    try {
      const response = await mealAPI.getClientMeals(clientId)
      setMeals(response.data.meals)
    } catch (error) {
      console.error('Failed to load meals:', error)
    }
  }

  useEffect(() => {
    if (selectedClient) loadClientMeals(selectedClient)
  }, [selectedClient])

  const handleCreateMeal = async (e) => {
    e.preventDefault()
    try {
      await mealAPI.create({ ...newMeal, clientId: selectedClient })
      setNewMeal({ title: '', description: '', assignedDate: '' })
      setShowCreateForm(false)
      announce('Fuel planned')
      await loadClientMeals()
    } catch (error) {
      announce(errorText(error, 'Could not plan meal'), 'stop')
    }
  }

  const handleDeleteMeal = async (meal) => {
    if (!confirm(`Remove "${meal.title}"?`)) return
    try {
      await mealAPI.delete(meal.id)
      announce('Meal removed', 'flag')
      await loadClientMeals()
    } catch (error) {
      announce(errorText(error, 'Could not remove meal'), 'stop')
    }
  }

  const athlete = clients.find((c) => c.id === selectedClient)
  const sorted = meals.slice().sort((a, b) => new Date(a.assignedDate) - new Date(b.assignedDate))

  return (
    <div className="space-y-10">
      <section>
        <SectionHead kicker="Pick an athlete" title="Fuel station" />
        {clients.length === 0 ? (
          <p className="text-cinder">No athletes on the start list yet.</p>
        ) : (
          <div role="radiogroup" aria-label="Athlete" className="flex flex-wrap gap-4">
            {clients.map((client) => (
              <button
                key={client.id}
                type="button"
                role="radio"
                aria-checked={selectedClient === client.id}
                onClick={() => {
                  setSelectedClient(client.id)
                  setShowCreateForm(false)
                }}
                className={cn(
                  'flex flex-col items-center gap-2 p-2 transition',
                  selectedClient === client.id ? 'bg-ink/5 outline outline-2 outline-tartan' : 'opacity-70 hover:opacity-100',
                )}
              >
                <Bib id={client.id} name={client.name} />
                <span className="text-sm font-semibold">{client.name}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {athlete && (
        <section>
          <SectionHead kicker={`Bib · ${athlete.name}`} title="Meal plan">
            <button type="button" onClick={() => setShowCreateForm(!showCreateForm)} className={showCreateForm ? 'btn-ghost' : 'btn-go'}>
              {showCreateForm ? 'Cancel' : (
                <>
                  <Plus className="h-5 w-5" aria-hidden /> Plan a meal
                </>
              )}
            </button>
          </SectionHead>

          {showCreateForm && (
            <form onSubmit={handleCreateMeal} className="mb-8 grid gap-4 bg-lane p-5 sm:grid-cols-[2fr_1fr]">
              <label>
                <span className="label mb-2 block !text-ink">Meal</span>
                <input
                  type="text"
                  value={newMeal.title}
                  onChange={(e) => setNewMeal({ ...newMeal, title: e.target.value })}
                  className="field"
                  placeholder="Protein-rich breakfast"
                  required
                />
              </label>
              <label>
                <span className="label mb-2 block !text-ink">Day</span>
                <input
                  type="date"
                  value={newMeal.assignedDate}
                  onChange={(e) => setNewMeal({ ...newMeal, assignedDate: e.target.value })}
                  className="field"
                  required
                />
              </label>
              <label className="sm:col-span-2">
                <span className="label mb-2 block !text-ink">What and how much</span>
                <textarea
                  value={newMeal.description}
                  onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                  rows={4}
                  className="field"
                  placeholder="Ingredients, portions, timing around the session…"
                  required
                />
              </label>
              <div className="sm:col-span-2">
                <button type="submit" className="btn-go">
                  Plan meal
                </button>
              </div>
            </form>
          )}

          {sorted.length === 0 ? (
            <p className="border-2 border-dashed border-ink/15 px-6 py-10 text-center text-cinder">No meals planned for {athlete.name} yet.</p>
          ) : (
            <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sorted.map((meal) => (
                <li key={meal.id}>
                  <MealCard meal={meal} onDelete={() => handleDeleteMeal(meal)} />
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  )
}
