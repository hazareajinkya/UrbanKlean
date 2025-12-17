import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../clients/firebase";
import { IUser, ICreditBalance } from "../types/user";
import resendService from "./resend/resend-service";

const CREDIT_THRESHOLDS = [100, 0];
const EMAIL_COOLDOWN_HOURS = 24;

interface ICreditInfo {
  name?: string;
  credit: ICreditBalance;
  userId: string;
  email: string;
  lastCreditEmailSent?: string;
  availableCredit: number;
}

class CreditService {
  async getCredit(uid: string) {
    const snap = await getDoc(doc(db, `users/${uid}`));
    if (!snap.exists()) return null;

    const data = snap.data() as IUser;

    const recurring = Number(data.credit?.recurring ?? 0);
    const purchased = Number(data.credit?.purchased ?? 0);

    return {
      credit: { recurring, purchased },
      userId: uid,
      name: data.name,
      email: data.email,
      lastCreditEmailSent: data.lastCreditEmailSent,
      availableCredit: recurring + purchased,
    };
  }

  async decreaseCredit(amountToDeduct: number, creditObj: ICreditInfo) {
    const { credit, userId, email, lastCreditEmailSent, name } = creditObj;
    let recurring = Number(credit.recurring);
    let purchased = Number(credit.purchased);
    const availableBefore = recurring + purchased;

    if (recurring >= amountToDeduct) {
      recurring -= amountToDeduct;
    } else {
      purchased = Math.max(0, purchased - (amountToDeduct - recurring));
      recurring = 0;
    }
    const availableAfter = recurring + purchased;
    await updateDoc(doc(db, `users/${userId}`), {
      credit: { recurring, purchased },
    });
    for (const threshold of CREDIT_THRESHOLDS) {
      if (availableBefore >= threshold && availableAfter < threshold) {
        this.sendLowCreditEmail(
          userId,
          name,
          email,
          threshold,
          lastCreditEmailSent
        );
        break;
      }
    }
    return {
      credit: { recurring, purchased } as ICreditBalance,
      userId,
      availableCredit: availableAfter,
    };
  }

  async increaseCredit(amountToAdd: number, userId: string) {
    try {
      await updateDoc(doc(db, `users/${userId}`), {
        "credit.purchased": increment(amountToAdd),
      });
      return { success: true };
    } catch (error) {
      console.error("Error increasing credit:", error);
      return { success: false };
    }
  }

  async updateCredit(userId: string, recurring: number, purchased: number) {
    try {
      await updateDoc(doc(db, `users/${userId}`), {
        credit: { recurring, purchased },
      });
      return {
        credit: { recurring, purchased } as ICreditBalance,
        userId,
        availableCredit: recurring + purchased,
      };
    } catch (error) {
      console.error("Error updating credit: ", error);
    }
  }

  renewQuota = async (userId: string, newRecurringAmount: number) => {
    try {
      await updateDoc(doc(db, `users/${userId}`), {
        "credit.recurring": newRecurringAmount,
      });
      return { success: true };
    } catch (error) {
      console.error("Error renewing recurring credits:", error);
      return { success: false };
    }
  };

  async sendLowCreditEmail(
    userId: string,
    name: string | undefined,
    email: string,
    threshold: number,
    lastCreditEmailSent?: string
  ) {
    try {
      if (lastCreditEmailSent) {
        const hoursSinceLastEmail =
          (Date.now() - new Date(lastCreditEmailSent).getTime()) /
          (1000 * 60 * 60);
        if (hoursSinceLastEmail < EMAIL_COOLDOWN_HOURS) {
          console.log(
            `Skipping low credit email to ${email} - last sent ${hoursSinceLastEmail.toFixed(
              1
            )} hours ago`
          );
          return;
        }
      }

      if (threshold === 0) {
        resendService.sendEmail({
          to: email,
          subject: `Urgent: Recharge Your MagicalCX Account Now`,
          template: {
            id: "credit-limit-alert",
            variables: {
              name: name || "",
            },
          },
        });
      } else {
        resendService.sendEmail({
          to: email,
          subject: `Low Credits Alert: Top Up Now to Avoid Interruption`,
          template: {
            id: "credit-limit-warning",
            variables: {
              name: name || "",
              credit: threshold.toString(),
            },
          },
        });
      }
      console.log(
        `Low credit email sent to ${email} (threshold: ${threshold})`
      );

      await updateDoc(doc(db, `users/${userId}`), {
        lastCreditEmailSent: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error sending low credit email: ", error);
    }
  }
}

const creditService = new CreditService();
export default creditService;
