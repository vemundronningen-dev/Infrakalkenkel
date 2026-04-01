import { LoginForm } from '@/components/login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="text-sm text-slate-600">Log in to manage XML pricing estimates.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
