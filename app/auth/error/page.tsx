const messages: Record<string, string> = {
  OAuthAccountNotLinked: "We found an existing account for this email. Try signing in with the provider you used before.",
  Configuration: "Authentication is not configured correctly. Please contact support.",
  AccessDenied: "You do not have permission to access this resource.",
  Verification: "We could not verify your sign-in attempt. Please request a new link.",
};

export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
  const code = searchParams?.error ?? "Default";
  const message = messages[code] ?? "Something went wrong during sign-in. Please try again.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Sign-in error</h1>
        <p className="mt-4 text-sm text-gray-600">{message}</p>
        <a
          href="/auth/signin"
          className="mt-6 inline-flex justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
        >
          Back to sign-in
        </a>
      </div>
    </div>
  );
}
