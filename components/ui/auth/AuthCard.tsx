interface AuthCardProps {
  children: React.ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div
      className="
        w-full max-w-md mx-4
        bg-white
        rounded-3xl
        shadow-card-3d
        px-8 py-10
        md:px-12
      "
    >
      {children}
    </div>
  );
}
