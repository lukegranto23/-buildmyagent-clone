"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const { data: session, status } = useSession();

  return (
    <header className="border-b">
      <nav className="container mx-auto flex items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <span>Main Street Agent</span>
          <span className="text-gray-500">Lab</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/agents" className="text-gray-600 hover:text-gray-900">
            Agents
          </Link>
          <Link href="/workflows" className="text-gray-600 hover:text-gray-900">
            Workflows
          </Link>
          <Link href="#method" className="text-gray-600 hover:text-gray-900">
            Method
          </Link>
          <Link href="#integrations" className="text-gray-600 hover:text-gray-900">
            Integrations
          </Link>
          <Link href="#pricing" className="text-gray-600 hover:text-gray-900">
            Plans
          </Link>
          <Link href="#faq" className="text-gray-600 hover:text-gray-900">
            FAQ
          </Link>
          {session ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={() => signOut()}>
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/auth/signin">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
