import { useState, useEffect, useRef } from "react";

const PLACEHOLDER_EXAMPLES = [
  "My mom loves gardening and hates clutter. Her birthday is next week...",
  "Girlfriend, 28, obsessed with true crime podcasts and fancy coffee. Anniversary coming up, budget ~$75...",
  "My wife never buys anything for herself. She loves cooking and quiet mornings. Under $100...",
  "Grandma is 80 and doesn't need anything. She likes birds and crossword puzzles...",
  "She's my best friend, turning 30. Into yoga, travel, and anything matcha. Budget flexible...",
];

const SOFT_PROMPTS = [
  "What does she light up about?",
  "What would she never buy for herself?",
  "What's the occasion?",
];

export default function GiftFinder() {
  const [input, setInput] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [phase, setPhase] = useState("input");
  const [thinking, setThinking] = useState(false);
  const [dots, setDots] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!thinking) return;
    let count = 0;
    const interval = setInterval(() => {
      count = (count + 1) % 4;
      setDots(".".repeat(count || 1));
    }, 500);
    return () => clearInterval(interval);
  }, [thinking]);

  const handleSubmit = () => {
    if (!input.trim()) return;
    setPhase("thinking");
    setThinking(true);

    setTimeout(() => {
      setThinking(false);
      setPhase("results");
    }, 2800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleStartOver = () => {
    setInput("");
    setPhase("input");
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  return (
    <div style={styles.page}>
      <div style={styles.grain} />

      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoMark}>♡</div>
          <h1 style={styles.title}>Gift Finder</h1>
          <p style={styles.subtitle}>for her</p>
        </div>

        {/* Input Phase */}
        {phase === "input" && (
          <div style={styles.inputSection}>
            <p style={styles.prompt}>Tell us about her.</p>
            <p style={styles.subPrompt}>
              As little or as much as you'd like — we'll take it from here.
            </p>

            <div style={styles.textareaWrapper}>
              <textarea
                ref={textareaRef}
                style={styles.textarea}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                rows={5}
              />
            </div>

            <div style={styles.softPrompts}>
              {SOFT_PROMPTS.map((p, i) => (
                <span key={i} style={styles.softPrompt}>
                  {p}
                </span>
              ))}
            </div>

            <button
              style={{
                ...styles.submitButton,
                opacity: input.trim() ? 1 : 0.4,
                cursor: input.trim() ? "pointer" : "default",
              }}
              onClick={handleSubmit}
              disabled={!input.trim()}
            >
              Find her something wonderful
            </button>

            <p style={styles.reassurance}>
              No sign-up. No spam. Just a good gift.
            </p>
          </div>
        )}

        {/* Thinking Phase */}
        {phase === "thinking" && (
          <div style={styles.thinkingSection}>
            <div style={styles.thinkingIcon}>✦</div>
            <p style={styles.thinkingText}>
              Finding something she'll love{dots}
            </p>
            <p style={styles.thinkingSubtext}>
              Reading between the lines of what you told us
            </p>
          </div>
        )}

        {/* Results Phase */}
        {phase === "results" && (
          <div style={styles.resultsSection}>
            <p style={styles.resultsIntro}>
              Based on what you told us, here are a few ideas we feel good
              about.
            </p>

            <div style={styles.resultsGrid}>
              {MOCK_RESULTS.map((gift, i) => (
                <div
                  key={i}
                  style={{
                    ...styles.giftCard,
                    animationDelay: `${i * 0.15}s`,
                  }}
                >
                  <div style={styles.giftCardInner}>
                    <div style={styles.giftHeader}>
                      <span style={styles.giftPrice}>{gift.price}</span>
                      <span style={styles.giftReadiness}>
                        {gift.giftReady ? "🎁 Gift-ready" : "📦 Needs wrapping"}
                      </span>
                    </div>
                    <h3 style={styles.giftName}>{gift.name}</h3>
                    <p style={styles.giftWhy}>{gift.why}</p>
                    <div style={styles.giftFooter}>
                      <a
                        href="#"
                        style={styles.giftLink}
                        onClick={(e) => e.preventDefault()}
                      >
                        View this gift →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={styles.resultsActions}>
              <p style={styles.resultsQuestion}>
                Not quite right? Tell us what's off and we'll adjust.
              </p>
              <button style={styles.startOverButton} onClick={handleStartOver}>
                Start over
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            You got this. She's going to love it.
          </p>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Nunito:wght@400;500;600&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes gentlePulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }

        @keyframes softSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        textarea::placeholder {
          color: #b8a99a;
          transition: opacity 0.4s ease;
        }

        textarea:focus::placeholder {
          opacity: 0.4;
        }
      `}</style>
    </div>
  );
}

const MOCK_RESULTS = [
  {
    name: "Handcrafted Ceramic Pour-Over Set",
    price: "$68",
    why: "You mentioned she loves fancy coffee and quiet mornings — this is a handmade ceramic dripper and mug set from a small Portland studio. It turns her morning coffee into a ritual, not a task.",
    giftReady: true,
  },
  {
    name: "Crime Junkie Live Show Tickets",
    price: "$45–$75",
    why: "She's into true crime podcasts — Crime Junkie is touring this spring. An experience she wouldn't buy for herself, and way more memorable than merch.",
    giftReady: true,
  },
  {
    name: "Linen-Bound Guided Journal by Therapy Notebooks",
    price: "$35",
    why: "Not a blank journal (those collect dust). This one has structured prompts for reflection and gratitude. Pairs well with the coffee ritual. Beautifully packaged.",
    giftReady: true,
  },
  {
    name: "Maude Burnout Candle — Pillow",
    price: "$42",
    why: "Yes, we know — 'not another candle.' But this one is from a design-forward brand she probably hasn't seen at Target. The scent is subtle and the packaging is genuinely beautiful.",
    giftReady: true,
  },
];

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(168deg, #faf6f1 0%, #f3ece4 40%, #ede4d8 100%)",
    fontFamily: "'Nunito', sans-serif",
    color: "#4a3f35",
    position: "relative",
    overflow: "hidden",
  },
  grain: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
    pointerEvents: "none",
    zIndex: 0,
  },
  container: {
    maxWidth: 680,
    margin: "0 auto",
    padding: "60px 24px 40px",
    position: "relative",
    zIndex: 1,
  },
  header: {
    textAlign: "center",
    marginBottom: 56,
    animation: "fadeUp 0.8s ease both",
  },
  logoMark: {
    fontSize: 28,
    marginBottom: 12,
    opacity: 0.5,
    color: "#c4a882",
  },
  title: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 42,
    fontWeight: 400,
    color: "#3a302a",
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 400,
    color: "#9a8b7a",
    marginTop: 4,
    fontStyle: "italic",
    letterSpacing: "0.02em",
  },
  inputSection: {
    animation: "fadeUp 0.8s ease 0.2s both",
    textAlign: "center",
  },
  prompt: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 26,
    color: "#3a302a",
    marginBottom: 8,
  },
  subPrompt: {
    fontSize: 15,
    color: "#9a8b7a",
    marginBottom: 32,
  },
  textareaWrapper: {
    position: "relative",
    marginBottom: 16,
  },
  textarea: {
    width: "100%",
    minHeight: 140,
    padding: "20px 24px",
    fontSize: 16,
    lineHeight: 1.7,
    fontFamily: "'Nunito', sans-serif",
    color: "#4a3f35",
    background: "rgba(255, 255, 255, 0.65)",
    border: "1.5px solid #ddd2c4",
    borderRadius: 16,
    outline: "none",
    resize: "vertical",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease, background 0.3s ease",
    boxShadow: "0 2px 20px rgba(170, 145, 110, 0.06)",
  },
  softPrompts: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 32,
  },
  softPrompt: {
    fontSize: 13,
    color: "#b8a99a",
    background: "rgba(255,255,255,0.5)",
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #e8ddd0",
  },
  submitButton: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: 16,
    fontWeight: 600,
    color: "#fff",
    background: "linear-gradient(135deg, #b8956a 0%, #a07d55 100%)",
    border: "none",
    borderRadius: 12,
    padding: "14px 36px",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 16px rgba(168, 130, 85, 0.25)",
    letterSpacing: "0.01em",
  },
  reassurance: {
    fontSize: 13,
    color: "#c4b5a3",
    marginTop: 20,
  },
  thinkingSection: {
    textAlign: "center",
    padding: "80px 0",
    animation: "fadeUp 0.6s ease both",
  },
  thinkingIcon: {
    fontSize: 32,
    color: "#c4a882",
    marginBottom: 20,
    animation: "softSpin 3s linear infinite",
    display: "inline-block",
  },
  thinkingText: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 22,
    color: "#3a302a",
    marginBottom: 8,
  },
  thinkingSubtext: {
    fontSize: 14,
    color: "#b8a99a",
    fontStyle: "italic",
  },
  resultsSection: {
    animation: "fadeUp 0.8s ease both",
  },
  resultsIntro: {
    fontSize: 15,
    color: "#9a8b7a",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 1.6,
  },
  resultsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  giftCard: {
    background: "rgba(255, 255, 255, 0.6)",
    border: "1.5px solid #e8ddd0",
    borderRadius: 16,
    overflow: "hidden",
    animation: "fadeUp 0.6s ease both",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
  },
  giftCardInner: {
    padding: "24px 28px",
  },
  giftHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  giftPrice: {
    fontWeight: 600,
    fontSize: 15,
    color: "#a07d55",
  },
  giftReadiness: {
    fontSize: 12,
    color: "#b8a99a",
  },
  giftName: {
    fontFamily: "'DM Serif Display', serif",
    fontSize: 20,
    fontWeight: 400,
    color: "#3a302a",
    marginBottom: 10,
    lineHeight: 1.3,
  },
  giftWhy: {
    fontSize: 14,
    lineHeight: 1.7,
    color: "#6b5e52",
    marginBottom: 16,
  },
  giftFooter: {
    borderTop: "1px solid #ede4d8",
    paddingTop: 14,
  },
  giftLink: {
    fontSize: 14,
    fontWeight: 600,
    color: "#a07d55",
    textDecoration: "none",
    transition: "opacity 0.2s ease",
  },
  resultsActions: {
    textAlign: "center",
    marginTop: 40,
    padding: "32px 0",
    borderTop: "1px solid #e8ddd0",
  },
  resultsQuestion: {
    fontSize: 15,
    color: "#9a8b7a",
    marginBottom: 16,
  },
  startOverButton: {
    fontFamily: "'Nunito', sans-serif",
    fontSize: 14,
    fontWeight: 600,
    color: "#a07d55",
    background: "transparent",
    border: "1.5px solid #ddd2c4",
    borderRadius: 10,
    padding: "10px 24px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  footer: {
    textAlign: "center",
    marginTop: 64,
    paddingTop: 24,
    animation: "fadeUp 0.8s ease 0.4s both",
  },
  footerText: {
    fontSize: 14,
    color: "#c4b5a3",
    fontStyle: "italic",
    letterSpacing: "0.01em",
  },
};
