import Image from "next/image";
import { FaShieldAlt } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="border-t border-earth-800/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        {/* Zambian-inspired accent stripe */}
        <div className="warm-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-earth-500 text-sm">
            <div className="relative w-8 h-8">
              <Image src="/ifunde-logo.png" alt="iFunde AI Logo" width={32} height={32} className="object-contain" />
            </div>
            <div>
              <span className="font-heading font-semibold text-earth-300">
                iFunde <span className="text-gold">AI</span>
              </span>
              <span className="mx-2 text-earth-700">|</span>
              <span className="text-earth-500 italic text-xs">Umwengo wa Malango</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-earth-600">
            <div className="flex items-center gap-1.5">
              <FaShieldAlt className="w-3 h-3" />
              <span>Local & Private</span>
            </div>
            <span className="text-earth-800">|</span>
            <span>Powered by turbovec</span>
            <span className="text-earth-800">|</span>
            <span>IRAC Framework</span>
          </div>
        </div>

        <p className="text-center text-xs text-earth-700 mt-6">
          Built for the Zambian legal community. Your documents never leave your machine.
        </p>
      </div>
    </footer>
  );
}
