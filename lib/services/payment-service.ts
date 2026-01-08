import {
  PaddleSubscriptionCustomData,
  PaddleSubscriptionData,
} from "../clients/paddle";
import {
  RazorpaySubscriptionData,
  RazorpaySubscriptionCustomData,
  mapRazorpayStatus,
} from "../clients/razorpay";
import {
  PolarSubscriptionData,
  PolarSubscriptionCustomData,
  mapPolarStatus,
} from "../clients/polar";
import {
  getPlanByPriceId,
  getPlanByRazorpayPlanId,
  getPlanByPolarProductId,
  PLANS,
} from "../plans";
import { IUserSubscription } from "../types/user";
import userService from "./user-service";
import creditService from "./credit-service";
import resendService from "./resend/resend-service";

class PaymentService {
  async handleSubscriptionCreated(data: PaddleSubscriptionData) {
    try {
      console.log("Handling subscription.created:", data);

      const customData =
        data.custom_data as unknown as PaddleSubscriptionCustomData;

      //getting user from email
      const user = await userService.getUser(customData.userEmail);
      if (!user) throw new Error("User not found");

      // Get plan details
      const plan = PLANS[customData.planId as keyof typeof PLANS];
      if (!plan) throw new Error(`Plan ${customData.planId} not found`);

      // Calculate monthly credits from tier
      const tierData = plan.tiers.find((tier) => tier.id === customData.tierId);
      if (!tierData) throw new Error(`Tier ${customData.tierId} not found`);

      const recurringQuota = tierData.messages;

      // Build subscription object
      const subscription: IUserSubscription = {
        subscriptionId: data.id,
        customerId: data.customer_id,
        planId: customData.planId,
        tierId: customData.tierId,
        paddlePriceId: tierData.paddlePriceId,
        status: data.status,
        recurringQuota,
        startedAt: data.started_at,
        nextPaymentAt: data.next_billed_at,
        renewsAt: data.next_billed_at,
      };

      // Update user with subscription
      await userService.updateUser(customData.userEmail, {
        subscription,
      });

      // Renew recurring credits quota
      await creditService.renewQuota(customData.userEmail, recurringQuota);

      return { success: true, user };
    } catch (error) {
      console.error("Error handling subscription.created:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleSubscriptionUpdated(data: PaddleSubscriptionData) {
    try {
      console.log("Handling subscription.updated:", data);

      const customData =
        data.custom_data as unknown as PaddleSubscriptionCustomData;
      const user = await userService.getUser(customData.userEmail);
      if (!user) throw new Error("User not found");

      const updatedSubscription: IUserSubscription = {
        ...user.subscription,
        status: data.status,
        nextPaymentAt: data.next_billed_at,
        renewsAt: data.next_billed_at,
      };

      // Check for plan change via price_id
      const currentPriceId = data.items?.[0]?.price_id;
      if (currentPriceId) {
        const planInfo = getPlanByPriceId(currentPriceId);
        if (planInfo && planInfo.tier.id !== user.subscription?.tierId) {
          updatedSubscription.planId = planInfo.planId;
          updatedSubscription.tierId = planInfo.tier.id;
          updatedSubscription.recurringQuota = planInfo.tier.messages;
          console.log(
            `Plan changed to ${planInfo.planId} - ${planInfo.tier.id}`
          );
        }
      }

      await userService.updateUser(customData.userEmail, {
        subscription: updatedSubscription,
      });

      // Send email if payment failed (past_due)
      if (data.status === "past_due") {
        await this.sendPaymentFailedEmail(customData.userEmail, user.name);
      }

      console.log(
        `Subscription updated for ${customData.userEmail}: status=${data.status}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error handling subscription.updated:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleSubscriptionCanceled(data: PaddleSubscriptionData) {
    try {
      console.log("Handling subscription.canceled:", data);

      const customData =
        data.custom_data as unknown as PaddleSubscriptionCustomData;
      const user = await userService.getUser(customData.userEmail);
      if (!user) throw new Error("User not found");

      const updatedSubscription: IUserSubscription = {
        ...user.subscription,
        status: "canceled",
        planId: "none",
        tierId: "none",
        paddlePriceId: "none",
        recurringQuota: 0,
        canceledAt: data.canceled_at || new Date().toISOString(),
      };
      delete updatedSubscription.nextPaymentAt;
      delete updatedSubscription.renewsAt;

      await userService.updateUser(customData.userEmail, {
        subscription: updatedSubscription,
      });

      console.log(`Subscription canceled for ${customData.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling subscription.canceled:", error);
      return { success: false, error: error as Error };
    }
  }

  private async sendPaymentFailedEmail(email: string, name?: string) {
    try {
      await resendService.sendEmail({
        to: email,
        subject: "Action Required: Payment Failed for Your Subscription",
        template: { id: "payment-failed", variables: { name: name || "" } },
      });
      console.log(`Payment failed email sent to ${email}`);
    } catch (error) {
      console.error("Error sending payment failed email:", error);
    }
  }

  // Razorpay subscription handlers
  async handleRazorpaySubscriptionActivated(data: RazorpaySubscriptionData) {
    try {
      console.log("Handling Razorpay subscription activated:", data.id);

      const notes = data.notes as unknown as RazorpaySubscriptionCustomData;
      if (!notes?.userEmail) {
        console.error("Missing user email in subscription notes");
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(notes.userEmail);
      if (!user) throw new Error("User not found");

      const plan = PLANS[notes.planId as keyof typeof PLANS];
      if (!plan) throw new Error(`Plan ${notes.planId} not found`);

      const tierData = plan.tiers.find((tier) => tier.id === notes.tierId);
      if (!tierData) throw new Error(`Tier ${notes.tierId} not found`);

      const recurringQuota = tierData.messages;

      const subscription: IUserSubscription = {
        subscriptionId: data.id,
        customerId: data.customer_id,
        planId: notes.planId,
        tierId: notes.tierId,
        razorpayPlanId: data.plan_id,
        status: mapRazorpayStatus(data.status),
        recurringQuota,
        startedAt: new Date(data.current_start * 1000).toISOString(),
        nextPaymentAt: new Date(data.charge_at * 1000).toISOString(),
        renewsAt: new Date(data.current_end * 1000).toISOString(),
      };

      await userService.updateUser(notes.userEmail, { subscription });
      await creditService.renewQuota(notes.userEmail, recurringQuota);

      console.log(`Razorpay subscription activated for ${notes.userEmail}`);
      return { success: true, user };
    } catch (error) {
      console.error("Error handling Razorpay subscription activated:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleRazorpaySubscriptionCharged(data: RazorpaySubscriptionData) {
    try {
      console.log("Handling Razorpay subscription charged:", data.id);

      const notes = data.notes as unknown as RazorpaySubscriptionCustomData;
      if (!notes?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(notes.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      const plan = PLANS[notes.planId as keyof typeof PLANS];
      const tierData = plan?.tiers.find((tier) => tier.id === notes.tierId);
      const recurringQuota = tierData?.messages || 0;

      // Always set all subscription fields to handle race conditions
      // where charged event may arrive before activated event completes
      const updatedSubscription: IUserSubscription = {
        subscriptionId: data.id,
        customerId: data.customer_id,
        planId: notes.planId,
        tierId: notes.tierId,
        razorpayPlanId: data.plan_id,
        status: "active",
        recurringQuota,
        startedAt:
          user.subscription?.startedAt ||
          new Date(data.current_start * 1000).toISOString(),
        lastPaymentAt: new Date().toISOString(),
        nextPaymentAt: new Date(data.charge_at * 1000).toISOString(),
        renewsAt: new Date(data.current_end * 1000).toISOString(),
      };

      await userService.updateUser(notes.userEmail, {
        subscription: updatedSubscription,
      });

      // Renew credits on successful payment
      await creditService.renewQuota(notes.userEmail, recurringQuota);

      console.log(`Razorpay subscription charged for ${notes.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling Razorpay subscription charged:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleRazorpaySubscriptionPending(data: RazorpaySubscriptionData) {
    try {
      console.log("Handling Razorpay subscription pending/halted:", data.id);

      const notes = data.notes as unknown as RazorpaySubscriptionCustomData;
      if (!notes?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(notes.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      const updatedSubscription: IUserSubscription = {
        ...user.subscription,
        status: "past_due",
      };

      await userService.updateUser(notes.userEmail, {
        subscription: updatedSubscription,
      });

      // Send payment failed email
      await this.sendPaymentFailedEmail(notes.userEmail, user.name);

      console.log(`Razorpay subscription pending for ${notes.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling Razorpay subscription pending:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleRazorpaySubscriptionCancelled(data: RazorpaySubscriptionData) {
    try {
      console.log("Handling Razorpay subscription cancelled:", data.id);

      const notes = data.notes as unknown as RazorpaySubscriptionCustomData;
      if (!notes?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(notes.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      const updatedSubscription: IUserSubscription = {
        ...user.subscription,
        status: "canceled",
        planId: "none",
        tierId: "none",
        razorpayPlanId: "none",
        recurringQuota: 0,
        canceledAt: data.ended_at
          ? new Date(data.ended_at * 1000).toISOString()
          : new Date().toISOString(),
      };
      delete updatedSubscription.nextPaymentAt;
      delete updatedSubscription.renewsAt;

      await userService.updateUser(notes.userEmail, {
        subscription: updatedSubscription,
      });

      console.log(`Razorpay subscription cancelled for ${notes.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling Razorpay subscription cancelled:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleRazorpaySubscriptionPaused(data: RazorpaySubscriptionData) {
    try {
      console.log("Handling Razorpay subscription paused:", data.id);

      const notes = data.notes as unknown as RazorpaySubscriptionCustomData;
      if (!notes?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(notes.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      await userService.updateUser(notes.userEmail, {
        subscription: {
          ...user.subscription,
          status: "paused",
        },
      });

      console.log(`Razorpay subscription paused for ${notes.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling Razorpay subscription paused:", error);
      return { success: false, error: error as Error };
    }
  }

  async handleRazorpaySubscriptionResumed(data: RazorpaySubscriptionData) {
    try {
      console.log("Handling Razorpay subscription resumed:", data.id);

      const notes = data.notes as unknown as RazorpaySubscriptionCustomData;
      if (!notes?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(notes.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      await userService.updateUser(notes.userEmail, {
        subscription: {
          ...user.subscription,
          status: "active",
          nextPaymentAt: new Date(data.charge_at * 1000).toISOString(),
          renewsAt: new Date(data.current_end * 1000).toISOString(),
        },
      });

      console.log(`Razorpay subscription resumed for ${notes.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling Razorpay subscription resumed:", error);
      return { success: false, error: error as Error };
    }
  }

  // Polar subscription handlers
  async handlePolarSubscriptionCreated(data: PolarSubscriptionData) {
    try {
      console.log("Handling Polar subscription created:", data.id);

      const metadata = data.metadata as unknown as PolarSubscriptionCustomData;
      if (!metadata?.userEmail) {
        console.error("Missing user email in subscription metadata");
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(metadata.userEmail);
      if (!user) throw new Error("User not found");

      const plan = PLANS[metadata.planId as keyof typeof PLANS];
      if (!plan) throw new Error(`Plan ${metadata.planId} not found`);

      const tierData = plan.tiers.find((tier) => tier.id === metadata.tierId);
      if (!tierData) throw new Error(`Tier ${metadata.tierId} not found`);

      const recurringQuota = tierData.messages;

      const subscription: IUserSubscription = {
        subscriptionId: data.id,
        customerId: data.customerId,
        planId: metadata.planId,
        tierId: metadata.tierId,
        polarSubscriptionId: data.id,
        status: mapPolarStatus(data.status),
        recurringQuota,
        startedAt: data.currentPeriodStart,
        nextPaymentAt: data.currentPeriodEnd || undefined,
        renewsAt: data.currentPeriodEnd || undefined,
      };

      await userService.updateUser(metadata.userEmail, { subscription });
      await creditService.renewQuota(metadata.userEmail, recurringQuota);

      console.log(`Polar subscription created for ${metadata.userEmail}`);
      return { success: true, user };
    } catch (error) {
      console.error("Error handling Polar subscription created:", error);
      return { success: false, error: error as Error };
    }
  }

  async handlePolarSubscriptionUpdated(data: PolarSubscriptionData) {
    try {
      console.log("Handling Polar subscription updated:", data.id);

      const metadata = data.metadata as unknown as PolarSubscriptionCustomData;
      if (!metadata?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(metadata.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      const plan = PLANS[metadata.planId as keyof typeof PLANS];
      const tierData = plan?.tiers.find((tier) => tier.id === metadata.tierId);
      const recurringQuota = tierData?.messages || user.subscription?.recurringQuota || 0;

      // Check for plan change via product_id
      const currentProductId = data.productId;
      if (currentProductId) {
        const planInfo = getPlanByPolarProductId(currentProductId);
        if (planInfo && planInfo.tier.id !== user.subscription?.tierId) {
          const updatedSubscription: IUserSubscription = {
            ...user.subscription,
            planId: planInfo.planId,
            tierId: planInfo.tier.id,
            recurringQuota: planInfo.tier.messages,
            status: mapPolarStatus(data.status),
            nextPaymentAt: data.currentPeriodEnd || undefined,
            renewsAt: data.currentPeriodEnd || undefined,
          };
          await userService.updateUser(metadata.userEmail, {
            subscription: updatedSubscription,
          });
          console.log(
            `Plan changed to ${planInfo.planId} - ${planInfo.tier.id}`
          );
          return { success: true };
        }
      }

      const updatedSubscription: IUserSubscription = {
        ...user.subscription,
        status: mapPolarStatus(data.status),
        nextPaymentAt: data.currentPeriodEnd || undefined,
        renewsAt: data.currentPeriodEnd || undefined,
        recurringQuota,
      };

      await userService.updateUser(metadata.userEmail, {
        subscription: updatedSubscription,
      });

      // Send email if payment failed (past_due)
      if (data.status === "past_due") {
        await this.sendPaymentFailedEmail(metadata.userEmail, user.name);
      }

      console.log(
        `Polar subscription updated for ${metadata.userEmail}: status=${data.status}`
      );
      return { success: true };
    } catch (error) {
      console.error("Error handling Polar subscription updated:", error);
      return { success: false, error: error as Error };
    }
  }

  async handlePolarSubscriptionCanceled(data: PolarSubscriptionData) {
    try {
      console.log("Handling Polar subscription canceled:", data.id);

      const metadata = data.metadata as unknown as PolarSubscriptionCustomData;
      if (!metadata?.userEmail) {
        return { success: false, error: new Error("Missing user email") };
      }

      const user = await userService.getUser(metadata.userEmail);
      if (!user) {
        return { success: false, error: new Error("User not found") };
      }

      const updatedSubscription: IUserSubscription = {
        ...user.subscription,
        status: "canceled",
        planId: "none",
        tierId: "none",
        polarSubscriptionId: "none",
        recurringQuota: 0,
        canceledAt: data.canceledAt || new Date().toISOString(),
      };
      delete updatedSubscription.nextPaymentAt;
      delete updatedSubscription.renewsAt;

      await userService.updateUser(metadata.userEmail, {
        subscription: updatedSubscription,
      });

      console.log(`Polar subscription canceled for ${metadata.userEmail}`);
      return { success: true };
    } catch (error) {
      console.error("Error handling Polar subscription canceled:", error);
      return { success: false, error: error as Error };
    }
  }
}

const paymentService = new PaymentService();
export default paymentService;
