"use client";

import { Button } from "./ui/button";

const testimonials = [
  {
    text: "We used the Recall Hero playbook with a 26-year-old dental practice. They loved the printed postcard scripts and the agent saved the hygienist schedule in week one.",
    author: "Erin Park",
    handle: "BoomerOps Agency",
    initial: "E",
  },
  {
    text: "The analog onboarding kit sealed the deal with a 58-year-old HVAC owner. We delivered fridge magnets, call scripts, and the AI now books $18k/mo in tune-ups.",
    author: "Marcus Boyd",
    handle: "Legacy Launch Co.",
    initial: "M",
  },
  {
    text: "White-glove setup plus handwritten note scripts helped us win a senior living community we've chased for years. The families rave about the concierge agent.",
    author: "Sonia Patel",
    handle: "Bridgepoint Automation",
    initial: "S",
  },
  {
    text: "We packaged three playbooks for a regional insurance brokerage. Their owner loved the ROI scorecard and mailed renewal letters the agent auto-generates.",
    author: "David Harper",
    handle: "PolicyPilot",
    initial: "D",
  },
  {
    text: "Landing a franchise group meant delivering analog-first collateral. BuildMyAgent had the mailers, scripts, and pricing baked in. Closed a $4.5k/mo retainer.",
    author: "Lisa Gomez",
    handle: "Main Street Lab",
    initial: "L",
  },
  {
    text: "We swapped out our manual demo deck for these playbooks and cut close time in half. Owners love seeing the done-for-you onboarding checklist.",
    author: "Carson Lee",
    handle: "Analog Advantage",
    initial: "C",
  },
];

export function Testimonials() {
  return (
    <div className="container mx-auto px-4">
      <div className="text-center mb-12">
        <Button className="mb-4" variant="outline">
          Testimonials
        </Button>
        <h2 className="text-4xl font-bold mb-4">What our users say</h2>
        <p className="text-gray-600 text-lg">Our app has become an essential tool for users around the world.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {testimonials.map((testimonial, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-6 bg-white">
            <p className="text-gray-700 mb-4">{testimonial.text}</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {testimonial.initial}
              </div>
              <div>
                <p className="font-semibold">{testimonial.author}</p>
                <p className="text-sm text-gray-500">{testimonial.handle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

