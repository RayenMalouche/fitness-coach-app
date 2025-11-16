// Meal Plan Routes
// Handles meal creation, assignment, and retrieval

const express = require('express');
const {
  createMeal,
  getClientMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getTodaysMeals
} = require('../controllers/mealController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isApprovedClient, isCoachOrApprovedClient } = require('../middleware/roleCheck');

const router = express.Router();

/**
 * POST /api/meals
 * Create and assign a meal plan (COACH only)
 */
router.post('/', authenticate, isCoach, createMeal);

/**
 * GET /api/meals/today
 * Get today's meals for current client (CLIENT only)
 */
router.get('/today', authenticate, isApprovedClient, getTodaysMeals);

/**
 * GET /api/meals/my
 * Get own meals (CLIENT only)
 */
router.get('/my', authenticate, isApprovedClient, getClientMeals);

/**
 * GET /api/meals/client/:clientId
 * Get client's meals (COACH only)
 */
router.get('/client/:clientId', authenticate, isCoach, getClientMeals);

/**
 * GET /api/meals/:mealId
 * Get single meal details
 */
router.get('/:mealId', authenticate, isCoachOrApprovedClient, getMealById);

/**
 * PUT /api/meals/:mealId
 * Update a meal plan (COACH only)
 */
router.put('/:mealId', authenticate, isCoach, updateMeal);

/**
 * DELETE /api/meals/:mealId
 * Delete a meal plan (COACH only)
 */
router.delete('/:mealId', authenticate, isCoach, deleteMeal);

module.exports = router;