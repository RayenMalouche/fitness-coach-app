// Session Management Controller
// Handles available sessions, bookings, and approvals

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Create available session slots
 * COACH only
 */
const createAvailableSession = async (req, res) => {
  try {
    const { dateTime, duration = 60 } = req.body;

    // Validation
    if (!dateTime) {
      return res.status(400).json({ error: 'DateTime is required' });
    }

    const sessionDate = new Date(dateTime);
    if (isNaN(sessionDate.getTime())) {
      return res.status(400).json({ error: 'Invalid date format' });
    }

    if (sessionDate < new Date()) {
      return res.status(400).json({ error: 'Cannot create sessions in the past' });
    }

    // Create session
    const session = await prisma.availableSession.create({
      data: {
        coachId: req.user.id,
        dateTime: sessionDate,
        duration,
        isBooked: false
      }
    });

    res.status(201).json({
      message: 'Session created successfully',
      session
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
};

/**
 * Get all available sessions (unbooked or pending approval)
 * Available to approved clients
 */
const getAvailableSessions = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      dateTime: { gte: new Date() } // Only future sessions
    };

    if (startDate && endDate) {
      where.dateTime = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    const sessions = await prisma.availableSession.findMany({
      where,
      include: {
        booking: {
          include: {
            client: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: { dateTime: 'asc' }
    });

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
};

/**
 * Book a session
 * CLIENT only (approved)
 */
const bookSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const clientId = req.user.id;

    // Check if session exists and is available
    const session = await prisma.availableSession.findUnique({
      where: { id: sessionId },
      include: { booking: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.isBooked) {
      return res.status(400).json({ error: 'Session already booked' });
    }

    // Check if client has remaining credits
    const credits = await prisma.sessionCredit.findUnique({
      where: { clientId }
    });

    if (!credits) {
      return res.status(400).json({ error: 'No credit information found' });
    }

    const remaining = credits.totalCredits - credits.usedCredits;
    if (remaining <= 0) {
      return res.status(400).json({ error: 'No remaining session credits' });
    }

    // Create booking (pending approval)
    const booking = await prisma.sessionBooking.create({
      data: {
        clientId,
        sessionId,
        status: 'PENDING'
      },
      include: {
        session: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Mark session as booked
    await prisma.availableSession.update({
      where: { id: sessionId },
      data: { isBooked: true }
    });

    res.status(201).json({
      message: 'Booking created successfully. Awaiting coach approval.',
      booking
    });
  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({ error: 'Failed to book session' });
  }
};

/**
 * Get client's bookings
 * CLIENT can see their own, COACH can see all
 */
const getClientBookings = async (req, res) => {
  try {
    let clientId;

    if (req.user.role === 'COACH') {
      clientId = req.params.clientId;
    } else {
      clientId = req.user.id;
    }

    const bookings = await prisma.sessionBooking.findMany({
      where: { clientId },
      include: {
        session: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
};

/**
 * Get all pending bookings
 * COACH only
 */
const getPendingBookings = async (req, res) => {
  try {
    const bookings = await prisma.sessionBooking.findMany({
      where: { status: 'PENDING' },
      include: {
        session: true,
        client: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ bookings });
  } catch (error) {
    console.error('Get pending bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch pending bookings' });
  }
};

/**
 * Approve a session booking
 * COACH only - deducts 1 credit from client
 */
const approveBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get booking details
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: bookingId },
      include: { client: true }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking already processed' });
    }

    // Deduct credit and approve booking in a transaction
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.sessionBooking.update({
        where: { id: bookingId },
        data: { status: 'APPROVED' }
      });

      // Increment used credits
      await tx.sessionCredit.update({
        where: { clientId: booking.clientId },
        data: { usedCredits: { increment: 1 } }
      });
    });

    res.json({ message: 'Booking approved and credit deducted' });
  } catch (error) {
    console.error('Approve booking error:', error);
    res.status(500).json({ error: 'Failed to approve booking' });
  }
};

/**
 * Reject a session booking
 * COACH only - frees up the session slot
 */
const rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;

    // Get booking details
    const booking = await prisma.sessionBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Booking already processed' });
    }

    // Reject booking and free session in transaction
    await prisma.$transaction(async (tx) => {
      // Update booking status
      await tx.sessionBooking.update({
        where: { id: bookingId },
        data: { status: 'REJECTED' }
      });

      // Free up the session slot
      await tx.availableSession.update({
        where: { id: booking.sessionId },
        data: { isBooked: false }
      });
    });

    res.json({ message: 'Booking rejected and session freed' });
  } catch (error) {
    console.error('Reject booking error:', error);
    res.status(500).json({ error: 'Failed to reject booking' });
  }
};

/**
 * Delete an available session
 * COACH only
 */
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await prisma.availableSession.findUnique({
      where: { id: sessionId },
      include: { booking: true }
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    if (session.booking) {
      return res.status(400).json({
        error: 'Cannot delete session with booking. Reject the booking first.'
      });
    }

    await prisma.availableSession.delete({
      where: { id: sessionId }
    });

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
};

module.exports = {
  createAvailableSession,
  getAvailableSessions,
  bookSession,
  getClientBookings,
  getPendingBookings,
  approveBooking,
  rejectBooking,
  deleteSession
};