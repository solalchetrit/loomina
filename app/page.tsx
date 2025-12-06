import Image from "next/image";
import FidjooFAQ from "@/components/FidjooFAQ";
import HowItWorks from "@/components/HowItWorks";
import CharacterSheetsSection from "@/components/CharacterSheetsSection";

export default function Home() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-[#f2efeb]">
      <div className="flex flex-col items-center justify-center flex-grow px-6 py-24 gap-20">
        <div className="relative w-[300px] h-[100px] md:w-[500px] md:h-[200px] shrink-0">
          <Image
            src="/logo.png"
            alt="Title Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <FidjooFAQ />
      </div>

      <div className="w-full">
        <HowItWorks />
        <CharacterSheetsSection />
      </div>
    </div>
  );
}
