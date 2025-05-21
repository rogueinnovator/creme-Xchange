import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen overflow-hidden">
      {/* Graphic Side */}
      <div className="hidden relative w-full max-w-[840px]  bg-gray-700 overflow-hidden lg:block">
        <div className="absolute left-[102px] top-[380px] w-[637px] h-[801px]">
          <Image
            src="/images/Logo.png"
            alt="logo"
            width={652}
            height={260}
            className="object-contain"
          />
        </div>
      </div>

      {/* Auth Form */}
      <div className="w-full max-w-[1080px] mx-auto p-6 md:px-28 md:py-14 bg-white flex flex-col gap-10 overflow-hidden">
        {children}
      </div>
    </main>
  );
}
