import {
  PaddleSubscriptionCustomData,
  PaddleSubscriptionData,
} from "../clients/paddle";
import { getPlanByPriceId, PLANS } from "../plans";
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
}

const paymentService = new PaymentService();
export default paymentService;
