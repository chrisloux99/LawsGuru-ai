import Link from "next/link";
import { FaArrowRight, FaShieldAlt, FaBolt, FaBrain, FaSearch, FaFolderOpen, FaBalanceScale, FaGavel, FaLandmark, FaUsers, FaBook } from "@/components/icons";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import GlowText from "@/components/ui/GlowText";
import Footer from "@/components/layout/Footer";
import ScrollReveal from "@/components/ui/ScrollReveal";

const iracSteps = [
  {
    label: "Issue",
    icon: FaGavel,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    text: "Identify the legal question under Zambian law — what dispute needs resolution?",
  },
  {
    label: "Rule",
    icon: FaBook,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "Surface relevant statutes from the Laws of Zambia, case law from the Supreme Court, and established legal principles.",
  },
  {
    label: "Application",
    icon: FaUsers,
    color: "text-terracotta",
    bg: "bg-terracotta/10",
    border: "border-terracotta/20",
    text: "Analyze how Zambian legal rules apply to your specific facts — consider precedent from the High Court and Court of Appeal.",
  },
  {
    label: "Conclusion",
    icon: FaLandmark,
    color: "text-green-400",
    bg: "bg-zambia-green/10",
    border: "border-zambia-green/20",
    text: "Deliver a reasoned legal conclusion grounded in Zambian jurisprudence and constitutional provisions.",
  },
];

const features = [
  {
    icon: FaFolderOpen,
    title: "Google Drive Sync",
    desc: "Connect your firm's Drive folder — PDFs, DOCX, Google Docs from the Zambia Law Development Commission, all indexed automatically.",
  },
  {
    icon: FaSearch,
    title: "Instant Vector Search",
    desc: "turbovec compresses millions of legal documents to a fraction of their size and searches faster than FAISS — find relevant case law in milliseconds.",
  },
  {
    icon: FaBrain,
    title: "IRAC Legal Analysis",
    desc: "Every answer follows the Issue-Rule-Application-Conclusion framework taught at the University of Zambia School of Law.",
  },
  {
    icon: FaShieldAlt,
    title: "Local & Private",
    desc: "No cloud. No data leaving your machine. Compliant with Zambia's data protection principles. Your legal strategy stays confidential.",
  },
];

const zambianLaws = [
  "Constitution of Zambia (Amendment) Act No. 2 of 2016",
  "The Penal Code Act, Chapter 87",
  "The Criminal Procedure Code Act, Chapter 88",
  "The Lands Act, No. 29 of 1995",
  "The Employment Act, Chapter 268",
  "The Companies Act, No. 10 of 2017",
];

export default function HomePage() {
  return (
    <div className="min-h-screen kente-bg">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-screen px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-radial from-gold/5 via-transparent to-transparent" />
        <div className="absolute inset-0 adinkra-dots opacity-30" />
        <div className="absolute left-0 top-0 bottom-0 w-1 zambian-stripe opacity-60" />

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-up delay-0 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-copper/20 bg-copper/5 mb-8">
            <FaBolt className="w-3.5 h-3.5 text-copper" />
            <span className="text-xs font-body text-copper-light">
              Built for Zambian legal professionals — powered by turbovec
            </span>
          </div>

          <h1 className="animate-fade-in-up delay-1 font-heading text-5xl sm:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-earth-100">Legal Research,</span>
            <br />
            <GlowText className="text-gold">Decoded</GlowText>
          </h1>

          <p className="animate-fade-in-up delay-2 text-lg sm:text-xl text-earth-400 max-w-2xl mx-auto mb-10 font-body leading-relaxed">
            AI-powered legal analysis for the Zambian justice system. Ask
            questions about statutes, case law, and constitutional matters — get
            structured IRAC answers with cited sources, all running locally on
            your machine.
          </p>

          <div className="animate-fade-in-up delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/chat">
              <Button size="lg" variant="copper">
                Start Researching
                <FaArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/documents">
              <Button variant="secondary" size="lg">
                <FaFolderOpen className="w-4 h-4 mr-2" />
                Connect Drive
              </Button>
            </Link>
          </div>

          <div className="animate-fade-in-up delay-4 mt-12 glass-panel p-4 max-w-lg mx-auto">
            <p className="text-xs text-earth-500 font-body mb-2">
              Optimized for Zambian legal sources:
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {zambianLaws.slice(0, 3).map((law) => (
                <span
                  key={law}
                  className="text-[11px] px-2 py-1 rounded-lg bg-surface-tertiary/50 text-earth-400 border border-earth-800/50"
                >
                  {law}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="animate-fade-in-up delay-5 absolute bottom-8 text-earth-600 text-sm">
          <div className="animate-float">
            Scroll to discover
          </div>
        </div>
      </section>

      {/* IRAC Explainer */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 adinkra-dots opacity-20" />
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-copper text-sm font-body uppercase tracking-[0.2em] mb-4">
                The Framework
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-earth-100">
                Every answer, structured like a{" "}
                <span className="text-gold">Zambian advocate</span>
              </h2>
              <p className="text-earth-400 font-body mt-4 max-w-2xl mx-auto">
                The IRAC method is the backbone of legal analysis at the Zambia
                Institute of Advanced Legal Education and law firms across Lusaka.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {iracSteps.map((step, i) => (
              <ScrollReveal key={step.label} delay={i * 100}>
                <Card className="h-full">
                  <div
                    className={`w-12 h-12 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center mb-4`}
                  >
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`font-heading text-2xl font-extrabold ${step.color}`}
                    >
                      {step.label[0]}
                    </span>
                    <h3 className="font-heading text-lg font-bold text-earth-100">
                      {step.label}
                    </h3>
                  </div>
                  <p className="text-earth-400 text-sm font-body leading-relaxed">
                    {step.text}
                  </p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Warm divider */}
      <div className="warm-divider mx-6" />

      {/* Features Bento Grid */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 kente-bg opacity-50" />
        <div className="max-w-5xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-copper text-sm font-body uppercase tracking-[0.2em] mb-4">
                Capabilities
              </p>
              <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-earth-100">
                Built for the{" "}
                <span className="text-terracotta">Zambian bar</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feat, i) => (
              <ScrollReveal key={feat.title} delay={i * 100}>
                <Card glow className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-copper/10 border border-copper/20 flex items-center justify-center mb-4">
                    <feat.icon className="w-6 h-6 text-copper" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-earth-100 mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-earth-400 text-sm font-body leading-relaxed">
                    {feat.desc}
                  </p>
                </Card>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Zambian Legal Sources */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <ScrollReveal>
            <Card copper>
              <div className="flex flex-col sm:flex-row items-start gap-6">
                <div className="w-14 h-14 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                  <FaBalanceScale className="w-7 h-7 text-gold" />
                </div>
                <div>
                  <h3 className="font-heading text-xl font-bold text-earth-100 mb-2">
                    Zambian Legal Sources
                  </h3>
                  <p className="text-earth-400 font-body text-sm mb-4">
                    LawGuru AI is optimized to work with documents from the
                    Zambian legal system, including:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {zambianLaws.map((law) => (
                      <div
                        key={law}
                        className="flex items-center gap-2 text-sm text-earth-300"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                        {law}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 relative">
        <div className="absolute inset-0 bg-gradient-radial from-copper/5 via-transparent to-transparent" />
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center relative z-10">
            <h2 className="font-heading text-3xl sm:text-5xl font-extrabold text-earth-100 mb-6">
              Ready to decode{" "}
              <span className="text-gold">Zambian law</span>?
            </h2>
            <p className="text-earth-400 text-lg mb-10 font-body">
              Connect your document library, ask your first question, and see the
              IRAC framework in action — powered by Zambian legal knowledge.
            </p>
            <Link href="/chat">
              <Button size="lg" variant="copper">
                <FaBalanceScale className="w-4 h-4 mr-2" />
                Launch LawGuru AI
              </Button>
            </Link>
          </div>
        </ScrollReveal>
      </section>

      <Footer />
    </div>
  );
}
