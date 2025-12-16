import React from "react";
import { motion } from "framer-motion";

export default function BillingTab() {
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
    </motion.div>
  );
}
