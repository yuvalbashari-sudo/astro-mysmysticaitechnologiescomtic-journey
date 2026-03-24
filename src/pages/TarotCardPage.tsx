import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Heart, Briefcase, Eye, Star, MessageCircle } from "lucide-react";
import { TAROT_SLUG_MAP, tarotSeoMeta } from "@/data/seoData";
import { majorArcana } from "@/data/tarotWorldData";
import { tarotCardImages } from "@/data/tarotCardImages";
import StarField from "@/components/StarField";
import { useCardName } from "@/hooks/useCardName";

const TarotCardPage = () => {
  const { slug } = useParams<{ slug: string }>();

  const cardName = slug ? TAROT_SLUG_MAP[slug] : undefined;
  const card = cardName ? majorArcana.find(c => c.name === cardName) : undefined;
  const cardImage = cardName ? tarotCardImages[cardName] : undefined;

  useEffect(() => {
    if (!card) return;
    const meta = tarotSeoMeta(card);
    document.title = meta.title;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", meta.description);

    const jsonLd = document.createElement("script");
    jsonLd.type = "application/ld+json";
    jsonLd.id = "tarot-jsonld";
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Article",
      headline: meta.title,
      description: meta.description,
      image: cardImage,
      author: { "@type": "Organization", name: "ASTROLOGAI" },
    });
    document.head.appendChild(jsonLd);
    return () => { document.getElementById("tarot-jsonld")?.remove(); };
  }, [card, cardImage]);

  if (!card) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-2xl text-gold mb-4">Card not found</h1>
          <Link to="/" className="text-gold/70 hover:text-gold transition-colors">← Back to ASTROLOGAI</Link>
        </div>
      </div>
    );
  }

  const m = card.meanings;
  const sections = [
    { emoji: "🔮", title: "משמעות כללית", titleEn: "General Meaning", content: m.general },
    { emoji: "❤️", title: "אהבה", titleEn: "Love", content: m.love },
    { emoji: "💼", title: "קריירה", titleEn: "Career", content: m.career },
    { emoji: "✨", title: "מסר רוחני", titleEn: "Spiritual Message", content: m.spiritual },
    { emoji: "🌟", title: "עצה", titleEn: "Advice", content: m.advice },
  ];

  const allSlugs = Object.keys(TAROT_SLUG_MAP);
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
          <span className="text-gold/60">Tarot</span>
          <span>/</span>
          <span className="text-gold">{card.hebrewName}</span>
        </nav>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          {cardImage && (
            <motion.div
              className="w-48 h-72 md:w-56 md:h-80 mx-auto mb-8 rounded-xl overflow-hidden relative"
              style={{
                border: "2px solid hsl(var(--gold) / 0.3)",
                boxShadow: "0 0 40px hsl(var(--gold) / 0.15), 0 20px 60px hsl(0 0% 0% / 0.5)",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <img src={cardImage} alt={`${card.name} Tarot Card`} className="w-full h-full object-cover" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
            </motion.div>
          )}
          <span className="text-4xl block mb-3">{card.symbol}</span>
          <h1 className="font-heading text-3xl md:text-5xl gold-gradient-text mb-2">{card.hebrewName}</h1>
          <p className="font-body text-foreground/50 text-lg mb-1">{card.name}</p>
          <p className="font-body text-foreground/30 text-sm">Arcana #{card.number}</p>
        </motion.div>

        <div className="section-divider max-w-[100px] mx-auto mb-12" />

        {/* Content Sections */}
        <div className="space-y-8">
          {sections.map((section, i) => (
            <motion.div
              key={section.titleEn}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
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

        {/* Nav between cards */}
        <div className="flex justify-between items-center mb-12">
          {prevSlug ? (
            <Link to={`/tarot/${prevSlug}`} className="text-gold/50 hover:text-gold transition-colors font-body text-sm flex items-center gap-1">
              <ArrowRight className="w-4 h-4 rotate-180" /> {TAROT_SLUG_MAP[prevSlug]}
            </Link>
          ) : <div />}
          {nextSlug ? (
            <Link to={`/tarot/${nextSlug}`} className="text-gold/50 hover:text-gold transition-colors font-body text-sm flex items-center gap-1">
              {TAROT_SLUG_MAP[nextSlug]} <ArrowRight className="w-4 h-4" />
            </Link>
          ) : <div />}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-2xl p-8 md:p-12 text-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--crimson) / 0.08), hsl(var(--gold) / 0.06), hsl(var(--deep-blue-light) / 0.3))",
            border: "1px solid hsl(var(--gold) / 0.15)",
            boxShadow: "0 0 40px hsl(var(--gold) / 0.05)",
          }}
        >
          <Sparkles className="w-8 h-8 text-gold mx-auto mb-4" />
          <h2 className="font-heading text-2xl gold-gradient-text mb-3">גלו מה הקלפים אומרים לכם</h2>
          <p className="text-foreground/50 font-body text-sm mb-6 max-w-md mx-auto">
            קבלו קריאת טארוט אישית ומיסטית — הקלפים מחכים לחשוף את המסר שנועד רק לכם
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-heading text-sm tracking-wide transition-all hover:scale-105"
            style={{
              background: "linear-gradient(135deg, hsl(var(--gold) / 0.2), hsl(var(--crimson) / 0.15))",
              border: "1px solid hsl(var(--gold) / 0.3)",
              color: "hsl(var(--gold))",
              boxShadow: "0 0 20px hsl(var(--gold) / 0.1)",
            }}
          >
            <MessageCircle className="w-4 h-4" />
            <span>פתחו קריאת טארוט חינם</span>
          </Link>
        </motion.div>

        {/* All Cards Grid */}
        <div className="mt-16">
          <h2 className="font-heading text-xl text-gold text-center mb-8">כל קלפי הטארוט</h2>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {Object.entries(TAROT_SLUG_MAP).map(([s, name]) => (
              <Link
                key={s}
                to={`/tarot/${s}`}
                className={`rounded-lg p-2 text-center transition-all hover:scale-105 ${s === slug ? "ring-1 ring-gold/40" : ""}`}
                style={{
                  background: s === slug ? "hsl(var(--gold) / 0.08)" : "hsl(var(--deep-blue-light) / 0.3)",
                  border: "1px solid hsl(var(--gold) / 0.08)",
                }}
              >
                {tarotCardImages[name] && (
                  <img src={tarotCardImages[name]} alt={name} className="w-full aspect-[2/3] object-cover rounded-md mb-1" loading="lazy" />
                )}
                <p className="font-body text-[10px] text-foreground/50 truncate">{name}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-16 pb-8">
          <Link to="/" className="text-gold/40 hover:text-gold transition-colors font-body text-xs">← ASTROLOGAI</Link>
        </div>
      </div>
    </div>
  );
};

export default TarotCardPage;
