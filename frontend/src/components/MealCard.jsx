// One meal on the plan, as a fuel-station card.

import { API_ORIGIN, day } from '../lib/format'

export default function MealCard({ meal, onDelete }) {
  return (
    <article className="flex h-full flex-col bg-lane">
      <div className="flex items-center justify-between bg-infield px-4 py-2 text-lane">
        <span className="font-mono text-xs uppercase tracking-[0.14em]">Fuel</span>
        <span className="font-mono text-xs">{day(meal.assignedDate)}</span>
      </div>
      {meal.imageUrl && <img src={`${API_ORIGIN}${meal.imageUrl}`} alt={meal.title} className="h-44 w-full object-cover" />}
      <div className="flex flex-1 flex-col px-4 py-4">
        <h3 className="headline text-2xl">{meal.title}</h3>
        <p className="mt-2 flex-1 whitespace-pre-line text-cinder">{meal.description}</p>
        {onDelete && (
          <button type="button" onClick={onDelete} className="act-dq mt-4 self-start">
            Remove
          </button>
        )}
      </div>
    </article>
  )
}
