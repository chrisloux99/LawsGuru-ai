import { FaShieldAlt, FaBalanceScale } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="border-t border-earth-800/50 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        {/* Zambian-inspired accent stripe */}
        <div className="warm-divider mb-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-earth-500 text-sm">
            <div className="w-8 h-8 rounded-lg bg-gold/10 border border-gold/20 flex items-center justify-center">
              <FaBalanceScale className="w-4 h-4 text-gold" />
            </div>
            <div>
              <span className="font-heading font-semibold text-earth-300">
                LawGuru AI
              </span>
              <span className="mx-2 text-earth-700">|</span>
              <span className="text-earth-500">Legal Research, Decoded</span>
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
