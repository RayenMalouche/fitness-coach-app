const express = require('express');
const router = express.Router();
const mealController = require('../controllers/mealController');
const { authenticate } = require('../middleware/auth');
const { isCoach, isApprovedClient, isCoachOrApprovedClient } = require('../middleware/roleCheck');

router.get('/today', authenticate, isApprovedClient, mealController.getTodaysMeals);
router.get('/my', authenticate, isApprovedClient, mealController.getClientMeals);
router.get('/client/:clientId', authenticate, isCoach, mealController.getClientMeals);
router.post('/', authenticate, isCoach, mealController.createMeal);
router.get('/:mealId', authenticate, isCoachOrApprovedClient, mealController.getMealById);
router.put('/:mealId', authenticate, isCoach, mealController.updateMeal);
router.delete('/:mealId', authenticate, isCoach, mealController.deleteMeal);

module.exports = router;