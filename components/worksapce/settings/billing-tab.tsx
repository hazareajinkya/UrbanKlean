import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCurrentUser } from "@/lib/hooks/user/use-user";
import { getPlanByPriceId, PLANS } from "@/lib/plans";
import { capitalize, formatDate } from "@/lib/utils";
import {
  ArrowUpRight,
  Check,
  CreditCard,
  Layers,
  Package,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function BillingTab() {
  const { user } = useCurrentUser();

  const subscription = user?.subscription;

  const plan = PLANS[subscription?.planId as keyof typeof PLANS];
  const tier = plan?.tiers.find((t) => t.id === subscription?.tierId);

  const total = subscription?.recurringQuota || 0;
  const remaining = user?.credit?.recurring || 0;
  const used = total - remaining;
  const progressValue = (used / total) * 100;

  const tierMessages = Number(tier?.messages) / 1000;

  const manageSubscription = () => {
    const paddleCustomerPortalUrl =
      process.env.NEXT_PUBLIC_PADDLE_CUSTOMER_PORTAL;
    console.log("paddleCustomerPortalUrl", paddleCustomerPortalUrl);
    if (paddleCustomerPortalUrl) {
      window.open(paddleCustomerPortalUrl, "_blank");
    }
  };

  return (
    <motion.div
      key="domains"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <div className="mb-6">
        <h1 className="text-xl">Billing</h1>
        <p className="text-muted-foreground text-sm">
          Manage your workspace billing and subscription.
        </p>
      </div>

      <div className="flex gap-4">
        <Card className="w-[70%] ">
          <CardHeader>
            <div className="flex items-center gap-2 w-full justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Current Plan</p>
                <div className="flex items-center gap-2 mt-1">
                  <h1 className="text-2xl ">
                    {plan?.name} {tierMessages}k
                  </h1>
                  <span className="text-xs mt-0.5 border text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                    {capitalize(subscription?.status ?? "")}
                  </span>
                </div>
              </div>

              <p className="text-lg font-medium"> ${tier?.price} / month</p>
            </div>
          </CardHeader>

          <CardContent>
            <div className="flex items-center justify-between gap-2 ">
              <p className="text-sm text-muted-foreground">Usage</p>
              <p className="text-sm text-muted-foreground">{progressValue}%</p>
            </div>
            <Progress value={progressValue} className="mt-2 mb-2" />
            <div className="flex justify-between items-center gap-2 mb-4">
              <p className="text-sm text-muted-foreground">
                {used} / {total}
              </p>
              <p className="text-sm text-muted-foreground">
                {remaining} remaining
              </p>
            </div>
          </CardContent>
          <CardFooter className="gap-2 justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Renews On</p>
              <p className="text-sm">{formatDate(subscription?.renewsAt)}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="rounded-full"
                onClick={manageSubscription}
              >
                <CreditCard className="w-4 h-4" />
                Manage Subscription
              </Button>
              <Button
                variant="outline"
                className="text-destructive rounded-full"
                onClick={manageSubscription}
              >
                Cancel
              </Button>
            </div>
          </CardFooter>
        </Card>

        <Card className="w-[30%] dark">
          <CardHeader></CardHeader>
          <CardContent>
            <h1 className="text-center text-lg mb-1">Need more messages?</h1>
            <p className="text-center text-muted-foreground text-sm">
              Upgrade your plan or buy message credits to get more messages.
            </p>
          </CardContent>
          <CardFooter className="flex-col mt-2 gap-2">
            <Button variant="default" className="rounded-full">
              <ArrowUpRight className="w-4 h-4" />
              Upgrade Plan
            </Button>
            <Button variant="outline" className="rounded-full">
              Buy Message Credits
            </Button>
          </CardFooter>
        </Card>
      </div>
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg ">Features Included</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {plan?.features.map((feature) => (
              <li
                key={feature}
                className="flex items-center gap-3 text-sm text-muted-foreground"
              >
                <Check className="w-5 h-5 shrink-0" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </motion.div>
  );
}
