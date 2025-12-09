import { doc, getDoc, increment, updateDoc } from "firebase/firestore";
import { db } from "../clients/firebase";
import { ICredit } from "../types/credit";
import { IUser } from "../types/user";
import resendService from "./resend/resend-service";

const CREDIT_THRESHOLDS = [100, 0];
const EMAIL_COOLDOWN_HOURS = 24;

interface ICreditInfo {
  name?: string;
  credit: ICredit;
  userId: string;
  email: string;
  lastCreditEmailSent?: string;
  availableCredit: number;
}

class CreditService {
  getCredit = async (uid: string) => {
    const snap = await getDoc(doc(db, `users/${uid}`));
    if (!snap.exists()) return null;

    const data = snap.data() as IUser;

    const quota = Number(data.credit?.quota ?? 0);
    const carry = Number(data.credit?.carry ?? 0);

    return {
      credit: { quota, carry },
      userId: uid,
      name: data.name,
      email: data.email,
      lastCreditEmailSent: data.lastCreditEmailSent,
      availableCredit: quota + carry,
    };
  };
  decreaseCredit = async (amountToDeduct: number, creditObj: ICreditInfo) => {
    const { credit, userId, email, lastCreditEmailSent, name } = creditObj;
    let quota = Number(credit.quota);
    let carry = Number(credit.carry);
    const availableBefore = quota + carry;

    if (quota >= amountToDeduct) {
      quota -= amountToDeduct;
    } else {
      carry = Math.max(0, carry - (amountToDeduct - quota));
      quota = 0;
    }
    const availableAfter = quota + carry;
    await updateDoc(doc(db, `users/${userId}`), { credit: { quota, carry } });
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
      credit: { quota, carry } as ICredit,
      userId,
      availableCredit: availableAfter,
    };
  };

  increaseCredit = async (amountToAdd: number, userId: string) => {
    try {
      await updateDoc(doc(db, `users/${userId}`), {
        "credit.carry": increment(amountToAdd),
      });
      return { success: true };
    } catch (error) {
      console.error("Error increasing credit:", error);
      return { success: false };
    }
  };

  updateCredit = async (userId: string, quota: number, carry: number) => {
    try {
      await updateDoc(doc(db, `users/${userId}`), {
        credit: { quota, carry },
      });
      return {
        credit: { quota, carry } as ICredit,
        userId,
        availableCredit: quota + carry,
      };
    } catch (error) {
      console.error("Error updating credit: ", error);
    }
  };

  sendLowCreditEmail = async (
    userId: string,
    name: string | undefined,
    email: string,
    threshold: number,
    lastCreditEmailSent?: string
  ) => {
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
  };
}

const creditService = new CreditService();
export default creditService;
