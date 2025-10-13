import { Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import { AuthRequest } from '../middleware/auth';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia',
});

export const createPaymentIntent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if user is the rider
    if (booking.riderId !== req.userId) {
      res.status(403).json({ error: 'You can only create payment for your own bookings' });
      return;
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.agreedPrice * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        riderId: booking.riderId,
        driverId: booking.ride.driverId,
      },
      capture_method: 'manual', // Hold funds until ride completes
    });

    // Update booking with payment ID
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        stripePaymentId: paymentIntent.id,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};

export const confirmPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      res.status(400).json({ error: 'Payment intent ID is required' });
      return;
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(paymentIntentId);

    // Update booking status
    const booking = await prisma.booking.findFirst({
      where: {
        stripePaymentId: paymentIntentId,
      },
    });

    if (booking) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'CHARGED',
        },
      });
    }

    res.json({
      message: 'Payment confirmed successfully',
      paymentIntent,
    });
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

export const refundPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' });
      return;
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    if (!booking.stripePaymentId) {
      res.status(400).json({ error: 'No payment found for this booking' });
      return;
    }

    // Only driver or rider can refund
    if (booking.riderId !== req.userId && booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'You do not have permission to refund this booking' });
      return;
    }

    // Create refund
    const refund = await stripe.refunds.create({
      payment_intent: booking.stripePaymentId,
    });

    // Update booking status
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED',
      },
    });

    res.json({
      message: 'Payment refunded successfully',
      refund,
    });
  } catch (error) {
    console.error('Refund payment error:', error);
    res.status(500).json({ error: 'Failed to refund payment' });
  }
};

export const getPaymentStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        ride: true,
      },
    });

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }

    // Check if user is involved in this booking
    if (booking.riderId !== req.userId && booking.ride.driverId !== req.userId) {
      res.status(403).json({ error: 'You do not have access to this payment information' });
      return;
    }

    let paymentIntent = null;
    if (booking.stripePaymentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(booking.stripePaymentId);
    }

    res.json({
      bookingId: booking.id,
      paymentStatus: booking.paymentStatus,
      agreedPrice: booking.agreedPrice,
      stripePaymentIntent: paymentIntent,
    });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to get payment status' });
  }
};

