"use client";

import { Button } from "./ui/button";

export function Community() {
  return (
    <div className="container mx-auto px-4 text-center">
      <Button className="mb-4" variant="outline">
        Community
      </Button>
      <h2 className="text-4xl font-bold mb-4">Hang out with other Main Street automation pros</h2>
      <p className="text-gray-600 text-lg mb-8">
        Swap analog onboarding tips, share closing decks, and get feedback on your boomer-focused offers inside our private community.
      </p>
      <Button className="bg-blue-600 text-white hover:bg-blue-700" size="lg">
        Join the Boomer Business Collective
      </Button>
    </div>
  );
}

