// Client Management Controller
// Handles client listing, approval, and credit management (COACH only)

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Get all clients (both pending and approved)
 * COACH only
 */
const getAllClients = async (req, res) => {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        name: true,
        approved: true,
        createdAt: true,
        sessionCredits: {
          select: {
            totalCredits: true,
            usedCredits: true
          }
        }
      },
      orderBy: [
        { approved: 'asc' }, // Pending first
        { createdAt: 'desc' }
      ]
    });

    res.json({ clients });
  } catch (error) {
    console.error('Get all clients error:', error);
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
};

/**
 * Get single client details
 * COACH only
 */
const getClientById = async (req, res) => {
  try {
    const { clientId } = req.params;

    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' },
      select: {
        id: true,
        email: true,
        name: true,
        approved: true,
        createdAt: true,
        sessionCredits: true,
        sessionBookings: {
          include: {
            session: true
          },
          orderBy: { createdAt: 'desc' }
        },
        mealsAssigned: {
          orderBy: { assignedDate: 'desc' }
        },
        photosUploaded: {
          orderBy: { sentAt: 'desc' }
        }
      }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    res.json({ client });
  } catch (error) {
    console.error('Get client error:', error);
    res.status(500).json({ error: 'Failed to fetch client details' });
  }
};

/**
 * Approve a pending client
 * COACH only
 */
const approveClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Check if client exists and is pending
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (client.approved) {
      return res.status(400).json({ error: 'Client already approved' });
    }

    // Approve client
    const updatedClient = await prisma.user.update({
      where: { id: clientId },
      data: { approved: true },
      select: {
        id: true,
        email: true,
        name: true,
        approved: true
      }
    });

    res.json({
      message: 'Client approved successfully',
      client: updatedClient
    });
  } catch (error) {
    console.error('Approve client error:', error);
    res.status(500).json({ error: 'Failed to approve client' });
  }
};

/**
 * Reject a pending client (delete account)
 * COACH only
 */
const rejectClient = async (req, res) => {
  try {
    const { clientId } = req.params;

    // Check if client exists
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Delete client (cascade deletes related records)
    await prisma.user.delete({
      where: { id: clientId }
    });

    res.json({ message: 'Client rejected and removed successfully' });
  } catch (error) {
    console.error('Reject client error:', error);
    res.status(500).json({ error: 'Failed to reject client' });
  }
};

/**
 * Set or update client's session credits
 * COACH only
 */
const updateClientCredits = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { totalCredits } = req.body;

    // Validation
    if (typeof totalCredits !== 'number' || totalCredits < 0) {
      return res.status(400).json({ error: 'Invalid credits amount' });
    }

    // Check if client exists and is approved
    const client = await prisma.user.findUnique({
      where: { id: clientId, role: 'CLIENT' }
    });

    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }

    if (!client.approved) {
      return res.status(400).json({ error: 'Cannot set credits for unapproved client' });
    }

    // Update or create session credits
    const credits = await prisma.sessionCredit.upsert({
      where: { clientId },
      update: { totalCredits },
      create: {
        clientId,
        totalCredits,
        usedCredits: 0
      }
    });

    res.json({
      message: 'Credits updated successfully',
      credits
    });
  } catch (error) {
    console.error('Update credits error:', error);
    res.status(500).json({ error: 'Failed to update credits' });
  }
};

/**
 * Get client's remaining credits
 * Available to both COACH and CLIENT
 */
const getClientCredits = async (req, res) => {
  try {
    let clientId;

    // If coach is requesting, get from params
    // If client is requesting, use their own ID
    if (req.user.role === 'COACH') {
      clientId = req.params.clientId;
    } else {
      clientId = req.user.id;
    }

    const credits = await prisma.sessionCredit.findUnique({
      where: { clientId }
    });

    if (!credits) {
      return res.status(404).json({ error: 'Credits not found' });
    }

    const remaining = credits.totalCredits - credits.usedCredits;

    res.json({
      totalCredits: credits.totalCredits,
      usedCredits: credits.usedCredits,
      remainingCredits: remaining
    });
  } catch (error) {
    console.error('Get credits error:', error);
    res.status(500).json({ error: 'Failed to fetch credits' });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  approveClient,
  rejectClient,
  updateClientCredits,
  getClientCredits
};