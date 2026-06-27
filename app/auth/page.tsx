import { AuthForm } from "@/components/ui/auth/AuthForm";
import { themeGradients } from "@/config/theme.config";

export const metadata = {
  title: "Tummy Gummy Bunny — Enter Your Name",
};

export default function AuthPage() {
  return (
    <main
      className="min-h-screen w-full flex items-center justify-center overflow-x-hidden"
      style={{ background: themeGradients.sky }}
    >
      {/* Ambient blobs — top-right warm gold, bottom-left ember glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-summer-gold/12 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[480px] h-[480px] rounded-full bg-summer-ember/12 blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex justify-center py-12">
        <AuthForm />
      </div>
    </main>
  );
}
