const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Create checkout session
router.post('/create-checkout-session', auth, async (req, res) => {
  try {
    const { itemName, itemPrice, itemImage, itemCategory } = req.body;

    // Convert price string like "$45" to cents
    const priceInCents = Math.round(parseFloat(itemPrice.replace('$', '')) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: itemName,
              images: [itemImage],
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/collections`,
      metadata: {
        userId: req.user._id.toString(),
        itemName,
        itemCategory: itemCategory || 'general'
      }
    });

    // Create transaction record
    const transaction = new Transaction({
      userId: req.user._id,
      userEmail: req.user.email,
      userName: req.user.name,
      itemName,
      itemPrice: parseFloat(itemPrice.replace('$', '')),
      itemImage,
      itemCategory: itemCategory || 'general',
      stripeSessionId: session.id,
      amount: priceInCents / 100,
      currency: 'usd',
      status: 'pending',
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    });

    await transaction.save();

    res.json({ url: session.url, transactionId: transaction._id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook to handle Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      await Transaction.findOneAndUpdate(
        { stripeSessionId: session.id },
        {
          status: 'completed',
          stripePaymentIntentId: session.payment_intent,
          completedAt: new Date()
        }
      );
      break;

    case 'checkout.session.expired':
      await Transaction.findOneAndUpdate(
        { stripeSessionId: event.data.object.id },
        { status: 'cancelled' }
      );
      break;

    case 'charge.refunded':
      const charge = event.data.object;
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: charge.payment_intent },
        {
          status: 'refunded',
          amountRefunded: charge.amount_refunded / 100,
          refundedAt: new Date()
        }
      );
      break;

    case 'payment_intent.payment_failed':
      await Transaction.findOneAndUpdate(
        { stripePaymentIntentId: event.data.object.id },
        { status: 'failed' }
      );
      break;
  }

  res.json({ received: true });
});

// Verify payment success (called from frontend)
router.get('/verify-session/:sessionId', auth, async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.retrieve(req.params.sessionId);
    
    const transaction = await Transaction.findOne({ stripeSessionId: req.params.sessionId });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    // Update transaction if payment was successful
    if (session.payment_status === 'paid' && transaction.status === 'pending') {
      transaction.status = 'completed';
      transaction.stripePaymentIntentId = session.payment_intent;
      transaction.completedAt = new Date();
      await transaction.save();
    }

    res.json({
      success: true,
      transaction: {
        id: transaction._id,
        status: transaction.status,
        amount: transaction.amount,
        itemName: transaction.itemName
      }
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
