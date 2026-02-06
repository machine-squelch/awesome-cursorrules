import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const PLANS = {
  founding_monthly: {
    priceId: process.env.STRIPE_PRICE_ID_FOUNDING || "",
    name: "Founding Member",
    price: 39,
    interval: "month" as const,
  },
  monthly: {
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY || "",
    name: "Monthly",
    price: 59,
    interval: "month" as const,
  },
  annual: {
    priceId: process.env.STRIPE_PRICE_ID_ANNUAL || "",
    name: "Annual",
    price: 499,
    interval: "year" as const,
  },
} as const;

export type PlanKey = keyof typeof PLANS;
