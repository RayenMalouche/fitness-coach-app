// Meal Plan Controller
// Handles meal creation, assignment, and retrieval

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create and assign a meal plan to a client
 * COACH only
 */
const createMeal = async (req, res) => {
  try {
    const { clientId, title, description, imageUrl, assignedDate } = req.body;

    // Validation
    if (!clientId || !title || !description || !assignedDate) {
      return res.status(400).json({
        error: 'ClientId, title, description, and assignedDate are required'
      });
    }

    // Verify client exists and is approved
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (!client.approved) {
      return res.status(400).json({ error: 'Cannot assign meals to unapproved client' });
    }

    // Create meal
    const meal = await prisma.meal.create({
      data: {
        coachId: req.user.id,
        clientId,
        title,
        description,
        imageUrl: imageUrl || null,
        assignedDate: new Date(assignedDate)
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Meal plan created successfully',
      meal
    });
  } catch (error) {
    console.error('Create meal error:', error);
    res.status(500).json({ error: 'Failed to create meal plan' });
  }
};

/**
 * Get meals for a specific client
 * COACH can see any client's meals, CLIENT can only see their own
 */
const getClientMeals = async (req, res) => {
  try {
    let clientId;
    const { startDate, endDate } = req.query;

    // Determine which client's meals to fetch
    if (req.user.role === 'COACH') {
      clientId = req.params.clientId;
    } else {
      clientId = req.user.id;
    }

    // Build where clause
    const where = { clientId };

    if (startDate && endDate) {
      where.assignedDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const meals = await prisma.meal.findMany({
      where,
      include: {
        coach: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { assignedDate: 'desc' }
    });

    res.json({ meals });
  } catch (error) {
    console.error('Get meals error:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
};

/**
 * Get single meal details
 */
const getMealById = async (req, res) => {
  try {
    const { mealId } = req.params;

    const meal = await prisma.meal.findUnique({
      where: { id: mealId },
      include: {
        coach: {
          select: {
            id: true,
            name: true
          }
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Authorization check
    const isAuthorized =
      req.user.role === 'COACH' ||
      meal.clientId === req.user.id;

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ meal });
  } catch (error) {
    console.error('Get meal error:', error);
    res.status(500).json({ error: 'Failed to fetch meal' });
  }
};

/**
 * Update a meal plan
 * COACH only
 */
const updateMeal = async (req, res) => {
  try {
    const { mealId } = req.params;
    const { title, description, imageUrl, assignedDate } = req.body;

    // Check if meal exists
    const existingMeal = await prisma.meal.findUnique({
      where: { id: mealId }
    });

    if (!existingMeal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Only coach who created it can update
    if (existingMeal.coachId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update meal
    const updatedMeal = await prisma.meal.update({
      where: { id: mealId },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(assignedDate && { assignedDate: new Date(assignedDate) })
      },
      include: {
        client: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    res.json({
      message: 'Meal updated successfully',
      meal: updatedMeal
    });
  } catch (error) {
    console.error('Update meal error:', error);
    res.status(500).json({ error: 'Failed to update meal' });
  }
};

/**
 * Delete a meal plan
 * COACH only
 */
const deleteMeal = async (req, res) => {
  try {
    const { mealId } = req.params;

    // Check if meal exists
    const meal = await prisma.meal.findUnique({
      where: { id: mealId }
    });

    if (!meal) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    // Only coach who created it can delete
    if (meal.coachId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.meal.delete({
      where: { id: mealId }
    });

    res.json({ message: 'Meal deleted successfully' });
  } catch (error) {
    console.error('Delete meal error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
};

/**
 * Get today's meals for the current client
 * CLIENT only
 */
const getTodaysMeals = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const meals = await prisma.meal.findMany({
      where: {
        clientId: req.user.id,
        assignedDate: {
          gte: today,
          lt: tomorrow
        }
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { assignedDate: 'asc' }
    });

    res.json({ meals });
  } catch (error) {
    console.error('Get today meals error:', error);
    res.status(500).json({ error: 'Failed to fetch today\'s meals' });
  }
};

module.exports = {
  createMeal,
  getClientMeals,
  getMealById,
  updateMeal,
  deleteMeal,
  getTodaysMeals
};