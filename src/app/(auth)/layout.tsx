interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(238,201,151,0.45),_transparent_36%),linear-gradient(180deg,#fbf6ef_0%,#f2e8d6_100%)] px-6 py-10">
      {children}
    </main>
  );
}
