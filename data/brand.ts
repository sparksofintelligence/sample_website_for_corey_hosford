import type { BrandConfig } from "@/types/store";

export const brand: BrandConfig = {
  name: "Freedom Performance",
  parentBrand: "Freedom Autoworks",
  tagline: "Purpose-built suspension.",
  subline: "The performance division of Freedom Autoworks.",
  logoImage: "/images/logo.png",
  heroImage: "/images/hero-coilovers.png",
  accentColor: "#E8331C",
  categoryLabel: "Coilover Kits",
  announcement: "Assembled and tested in Mesa, AZ. Free fitment check before every order.",
  phone: "480-555-0188",
  email: "parts@freedomperformance.demo",
  address: "1234 S Performance Way, Mesa, AZ 85210",
  trustPoints: [
    {
      title: "Real fitment guidance",
      text: "Chassis notes checked before the order moves.",
      icon: "fitment",
    },
    {
      title: "Assembled in-house",
      text: "Bench checked by people who work on these cars.",
      icon: "wrench",
    },
    {
      title: "Ships in 48h or built to order",
      text: "Clear stock status before you add to cart.",
      icon: "shipping",
    },
    {
      title: "Driver-owned",
      text: "Parts selected for cars that actually get used.",
      icon: "driver",
    },
  ],
  specialistPoints: [
    {
      title: "Fitment answered by people who know the chassis",
      text: "Ride height, wheel clearance, and hardware questions get handled before parts ship.",
    },
    {
      title: "One category means deep stock knowledge",
      text: "A focused catalog makes it easier to know what is ready now and what needs a build slot.",
    },
    {
      title: "No call-center guessing",
      text: "Plain answers, clean order notes, and no mystery substitutions.",
    },
  ],
  faq: [
    {
      question: "Can you confirm fitment before I order?",
      answer:
        "Yes. Send the chassis, wheel size, tire size, and intended ride height. We check notes before the order is released.",
    },
    {
      question: "How do I choose spring rates?",
      answer:
        "Start with the listed street or track rate. We can adjust for tire, weight, aero, and how rough the roads are where the car lives.",
    },
    {
      question: "Can I install these at home?",
      answer:
        "Most kits are bolt-on for an experienced home mechanic. Alignment is required after install. Stuck hardware and old bushings can add time.",
    },
    {
      question: "What is covered by warranty?",
      answer:
        "Demo warranty terms cover manufacturing defects for street use. Crash damage, improper installation, and racing wear are not included.",
    },
    {
      question: "How long does built-to-order take?",
      answer:
        "Built-to-order parts show their lead time on the product card. Most listed builds are scheduled for 3-5 weeks before shipping.",
    },
  ],
  footerLinks: ["Kits", "Drift", "Accessories", "Fitment", "FAQ"],
};
