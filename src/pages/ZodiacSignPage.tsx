import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Heart, ArrowRight, MessageCircle } from "lucide-react";
import { ZODIAC_SLUG_MAP, zodiacSeoMeta } from "@/data/seoData";
import { zodiacData, getZodiacSign } from "@/data/zodiacData";
import StarField from "@/components/StarField";

const ZodiacSignPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const sign = slug && zodiacData[slug] ? zodiacData[slug] : undefined;

  useEffect(() => {
    if (!sign) return;
    const meta = zodiacSeoMeta(sign);
    document.title = meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", meta.description);

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.id = "zodiac-jsonld";
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: meta.title,
      description: meta.description,
      author: { "@type": "Organization", name: "ASTROLOGAI" },
    });
    document.head.appendChild(jsonLd);

    // Canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = `https://astro-mysmysticaitechnologiescomtic-journey.lovable.app/zodiac/${slug}`;

    return () => { document.getElementById("zodiac-jsonld")?.remove(); };
  }, [sign]);

  if (!sign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-gold mb-4">Sign not found</h1>
          <Link to="/" className="text-gold/70 hover:text-gold transition-colors">← Back to ASTROLOGAI</Link>
        </div>
      </div>
    );
  }

  const sections = [
    { emoji: "🌟", title: "אישיות", titleEn: "Personality", content: sign.personality },
    { emoji: "❤️", title: "אהבה", titleEn: "Love", content: sign.love },
    { emoji: "💼", title: "קריירה", titleEn: "Career", content: sign.career },
    { emoji: "💰", title: "כסף ושפע", titleEn: "Money & Abundance", content: sign.money },
    { emoji: "🏥", title: "בריאות", titleEn: "Health", content: sign.health },
    { emoji: "✨", title: "מסר רוחני", titleEn: "Spiritual Message", content: sign.spiritual },
    { emoji: "🔥", title: "אנרגיה סנסואלית", titleEn: "Sensual Energy", content: sign.sensual },
  ];

  const allSlugs = Object.keys(ZODIAC_SLUG_MAP);
  const currentIdx = allSlugs.indexOf(slug || "");
  const prevSlug = currentIdx > 0 ? allSlugs[currentIdx - 1] : null;
  const nextSlug = currentIdx < allSlugs.length - 1 ? allSlugs[currentIdx + 1] : null;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <StarField />

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-12 md:py-20">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 text-foreground/40 font-body text-xs">
          <Link to="/" className="hover:text-gold transition-colors">ASTROLOGAI</Link>
          <span>/</span>
          <span className="text-gold/60">Zodiac</span>
          <span>/</span>
          <span className="text-gold">{sign.hebrewName}</span>
        </nav>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <motion.div
            className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              background: "radial-gradient(circle, hsl(var(--crimson) / 0.15), hsl(var(--gold) / 0.08), transparent)",
              border: "1px solid hsl(var(--gold) / 0.2)",
              boxShadow: "0 0 40px hsl(var(--gold) / 0.1)",
            }}
            animate={{ boxShadow: ["0 0 20px hsl(var(--gold) / 0.1)", "0 0 40px hsl(var(--gold) / 0.2)", "0 0 20px hsl(var(--gold) / 0.1)"] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-5xl">{sign.symbol}</span>
          </motion.div>

          <h1 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-2">{sign.hebrewName}</h1>
          <p className="font-body text-foreground/50 text-lg mb-1">{sign.name}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <span className="px-3 py-1 rounded-full font-body text-xs" style={{ background: "hsl(var(--gold) / 0.1)", border: "1px solid hsl(var(--gold) / 0.2)", color: "hsl(var(--gold))" }}>
              {sign.dateRange}
            </span>
            <span className="px-3 py-1 rounded-full font-body text-xs" style={{ background: "hsl(var(--crimson) / 0.1)", border: "1px solid hsl(var(--crimson) / 0.2)", color: "hsl(var(--crimson-light))" }}>
              {sign.element}
            </span>
          </div>
        </motion.div>

        <div className="section-divider max-w-[100px] mx-auto mb-12" />

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.titleEn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="rounded-xl p-6 md:p-8"
              style={{
                background: "linear-gradient(145deg, hsl(var(--deep-blue-light) / 0.4), hsl(0 20% 10% / 0.2))",
                border: "1px solid hsl(var(--gold) / 0.1)",
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "hsl(var(--gold) / 0.08)", border: "1px solid hsl(var(--gold) / 0.15)" }}>
                  <span className="text-lg">{section.emoji}</span>
                </div>
                <div>
                  <h2 className="font-heading text-lg text-gold">{section.title}</h2>
                  <p className="font-body text-foreground/30 text-xs">{section.titleEn}</p>
                </div>
              </div>
              <p className="text-foreground/70 font-body text-sm leading-[1.9] text-start">{section.content}</p>
            </motion.div>
          ))}
        </div>

        <div className="section-divider max-w-[100px] mx-auto my-12" />

        {/* Navigation */}
        <div className="flex justify-between items-center mb-12">
          {prevSlug ? (
            <Link to={`/zodiac/${prevSlug}`} className="text-gold/50 hover:text-gold transition-colors font-body text-sm flex items-center gap-1">
              <ArrowRight className="w-4 h-4 rotate-180" /> {prevSlug.charAt(0).toUpperCase() + prevSlug.slice(1)}
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link to={`/zodiac/${nextSlug}`} className="text-gold/50 hover:text-gold transition-colors font-body text-sm flex items-center gap-1">
              {nextSlug.charAt(0).toUpperCase() + nextSlug.slice(1)} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>

        {/* CTAs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          <Link
            to="/"
            className="rounded-xl p-6 text-center transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.06))", border: "1px solid hsl(var(--gold) / 0.15)" }}
          >
            <Heart className="w-6 h-6 text-gold mx-auto mb-3" />
            <h3 className="font-heading text-sm text-gold mb-2">בדקו התאמה זוגית</h3>
            <p className="text-foreground/40 font-body text-xs">גלו את הכימיה הרוחנית שלכם</p>
          </Link>
          <Link
            to="/"
            className="rounded-xl p-6 text-center transition-all hover:scale-[1.02]"
            style={{ background: "linear-gradient(135deg, hsl(var(--gold) / 0.06), hsl(var(--deep-blue-light) / 0.3))", border: "1px solid hsl(var(--gold) / 0.15)" }}
          >
            <Sparkles className="w-6 h-6 text-gold mx-auto mb-3" />
            <h3 className="font-heading text-sm text-gold mb-2">קריאת טארוט אישית</h3>
            <p className="text-foreground/40 font-body text-xs">קבלו מסר מהקלפים</p>
          </Link>
        </motion.div>

        {/* All Signs Grid */}
        <div className="mt-12">
          <h2 className="font-heading text-xl text-gold text-center mb-8">כל המזלות</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {allSlugs.map((s) => {
              const sd = zodiacData[s];
              if (!sd) return null;
              return (
                <Link
                  key={s}
                  to={`/zodiac/${s}`}
                  className={`rounded-lg p-3 text-center transition-all hover:scale-105 ${s === slug ? "ring-1 ring-gold/40" : ""}`}
                  style={{
                    background: s === slug ? "hsl(var(--gold) / 0.08)" : "hsl(var(--deep-blue-light) / 0.3)",
                    border: "1px solid hsl(var(--gold) / 0.08)",
                  }}
                >
                  <span className="text-2xl block mb-1">{sd.symbol}</span>
                  <p className="font-body text-[10px] text-foreground/50">{sd.hebrewName}</p>
                  <p className="font-body text-[9px] text-foreground/30">{s}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-16 pb-8">
          <Link to="/" className="text-gold/40 hover:text-gold transition-colors font-body text-xs">← ASTROLOGAI</Link>
        </div>
      </div>
    </div>
  );
};

export default ZodiacSignPage;
