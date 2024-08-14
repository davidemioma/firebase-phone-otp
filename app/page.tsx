import OTPLogin from "@/components/OTPLogin";

export default function Home() {
  return (
    <main className="py-10 px-5 w-full max-w-4xl mx-auto flex flex-col gap-5">
      <h1 className="text-4xl font-bold text-center">
        How to add One-Time Password Phone Authentication
      </h1>

      <OTPLogin />
    </main>
  );
}
