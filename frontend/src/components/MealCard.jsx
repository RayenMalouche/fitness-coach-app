// Meal Card Component
// Displays individual meal plan details

export default function MealCard({ meal }) {
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
      {meal.imageUrl && (
        <img
          src={`${API_BASE}${meal.imageUrl}`}
          alt={meal.title}
          className="w-full h-48 object-cover rounded-lg mb-3"
        />
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{meal.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
      <div className="flex items-center text-xs text-gray-500">
        <span>📅</span>
        <span className="ml-2">
          {new Date(meal.assignedDate).toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}