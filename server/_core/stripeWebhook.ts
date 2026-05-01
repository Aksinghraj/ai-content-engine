import { Stripe } from "stripe";
import { updateUserSubscription } from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

export async function handleStripeWebhook(event: any) {
  try {
    switch (event.type) {
      case "checkout.session.completed":
        return await handleCheckoutSessionCompleted(event.data.object);
      
      case "customer.subscription.updated":
        return await handleSubscriptionUpdated(event.data.object);
      
      case "customer.subscription.deleted":
        return await handleSubscriptionDeleted(event.data.object);
      
      case "invoice.paid":
        return await handleInvoicePaid(event.data.object);
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
        return { received: true };
    }
  } catch (error) {
    console.error("Error handling webhook:", error);
    throw error;
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  console.log("[Webhook] Checkout session completed:", session.id);
  
  const userId = parseInt(session.metadata?.userId);
  const customerId = session.customer;
  
  if (!userId || !customerId) {
    console.error("Missing userId or customerId in checkout session");
    return { received: true };
  }

  try {
    // Get subscription ID from the session
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
    });

    const subscription = subscriptions.data[0];
    
    if (subscription) {
      // Update user to Pro tier with Stripe IDs
      await updateUserSubscription(
        userId,
        "pro",
        customerId,
        subscription.id
      );
      
      console.log(`[Webhook] User ${userId} upgraded to Pro`);
    }
    
    return { received: true };
  } catch (error) {
    console.error("Error processing checkout session:", error);
    throw error;
  }
}

async function handleSubscriptionUpdated(subscription: any) {
  console.log("[Webhook] Subscription updated:", subscription.id);
  
  // Handle subscription status changes
  if (subscription.status === "active") {
    console.log(`[Webhook] Subscription ${subscription.id} is now active`);
  } else if (subscription.status === "past_due") {
    console.log(`[Webhook] Subscription ${subscription.id} is past due`);
  }
  
  return { received: true };
}

async function handleSubscriptionDeleted(subscription: any) {
  console.log("[Webhook] Subscription deleted:", subscription.id);
  
  // Find user with this subscription and downgrade to free
  // This would require a query to find the user by stripeSubscriptionId
  // For now, just log it
  
  return { received: true };
}

async function handleInvoicePaid(invoice: any) {
  console.log("[Webhook] Invoice paid:", invoice.id);
  
  // Handle successful payment
  return { received: true };
}

export function verifyStripeSignature(
  body: string,
  signature: string,
  secret: string
): any {
  try {
    return stripe.webhooks.constructEvent(body, signature, secret);
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw error;
  }
}
