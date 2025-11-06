export default function VerifyRequestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h1 className="text-2xl font-semibold text-gray-900">Check your email</h1>
        <p className="mt-4 text-sm text-gray-600">
          We sent a secure sign-in link to your inbox. Click the button in that email to continue.
        </p>
        <p className="mt-6 text-xs text-gray-400">
          Didn&apos;t receive it? Wait a minute and check your spam folder, then try again.
        </p>
      </div>
    </div>
  );
}
