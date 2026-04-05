import { useState } from "react";
import { calculateNatalChart, type NatalChartResult } from "@/lib/natalChart";
import NatalChartWheel from "@/components/NatalChartWheel";

const NatalTest = () => {
  const [birthDate, setBirthDate] = useState("1990-06-15");
  const [birthTime, setBirthTime] = useState("14:30");
  const [birthCity, setBirthCity] = useState("Tel Aviv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<NatalChartResult | null>(null);

  const handleSubmit = async () => {
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const chart = await calculateNatalChart({
        birthDate,
        birthTime,
        birthPlace: birthCity,
      });
      setResult(chart);
    } catch (e: any) {
      setError(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div dir="rtl" style={{ background: "#0a0a1a", color: "#e0d8c8", minHeight: "100vh", padding: 24, fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: 28, marginBottom: 16 }}>🔭 בדיקת מנוע מפת לידה</h1>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16 }}>
        <label>
          תאריך לידה
          <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
            style={{ display: "block", padding: 8, background: "#1a1a2e", color: "#fff", border: "1px solid #444", borderRadius: 6, direction: "ltr" }} />
        </label>
        <label>
          שעת לידה
          <input type="time" value={birthTime} onChange={e => setBirthTime(e.target.value)}
            style={{ display: "block", padding: 8, background: "#1a1a2e", color: "#fff", border: "1px solid #444", borderRadius: 6, direction: "ltr" }} />
        </label>
        <label>
          עיר לידה
          <input type="text" value={birthCity} onChange={e => setBirthCity(e.target.value)}
            style={{ display: "block", padding: 8, background: "#1a1a2e", color: "#fff", border: "1px solid #444", borderRadius: 6, direction: "ltr" }} />
        </label>
      </div>

      <button onClick={handleSubmit} disabled={loading}
        style={{ padding: "10px 32px", background: "#c8a84e", color: "#0a0a1a", fontWeight: "bold", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 16 }}>
        {loading ? "מחשב..." : "חשב מפת לידה"}
      </button>

      {error && (
        <div style={{ marginTop: 16, padding: 16, background: "#3a1010", border: "1px solid #f44", borderRadius: 8 }}>
          <strong>שגיאה:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{ marginTop: 24 }}>
          {/* ── Layer 2: Visible Chart Wheel ── */}
          <h2 style={{ fontSize: 22, marginBottom: 8, color: "#c8a84e" }}>גלגל מפת הלידה</h2>
          <div style={{ background: "#12122a", borderRadius: 12, padding: 16, display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <NatalChartWheel
              planetPositions={result.planetPositions}
              ascendantAngle={result.ascendantAngle}
              size={Math.min(420, window.innerWidth - 80)}
            />
          </div>

          {/* ── Layer 1: Raw Debug Data ── */}
          <h2 style={{ fontSize: 22, marginBottom: 8, color: "#c8a84e" }}>נתוני חישוב גולמיים</h2>

          <div style={{ background: "#12122a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <h3 style={{ color: "#aaa", marginBottom: 8 }}>📍 מיקום</h3>
            <p>{result.location.name} — lat: {result.location.latitude.toFixed(4)}, lon: {result.location.longitude.toFixed(4)}</p>
            <p>timezone: {result.location.timezone}</p>
          </div>

          <div style={{ background: "#12122a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <h3 style={{ color: "#aaa", marginBottom: 8 }}>☀️ סיכום מהיר</h3>
            <p>מזל שמש: {result.sunSign.hebrewName} {result.sunSign.symbol}</p>
            <p>מזל עולה: {result.risingSign.hebrewName} {result.risingSign.symbol}</p>
            <p>מזל ירח: {result.moonSign}</p>
            <p>זווית אופק: {result.ascendantAngle.toFixed(2)}°</p>
          </div>

          <div style={{ background: "#12122a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
            <h3 style={{ color: "#aaa", marginBottom: 8 }}>🪐 מיקומי כוכבים</h3>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #333", textAlign: "right" }}>
                  <th style={{ padding: 6 }}>כוכב</th>
                  <th style={{ padding: 6 }}>מזל</th>
                  <th style={{ padding: 6 }}>מעלה</th>
                  <th style={{ padding: 6 }}>בית</th>
                  <th style={{ padding: 6 }}>מעלה מוחלטת</th>
                </tr>
              </thead>
              <tbody>
                {result.planetPlacements.map(p => (
                  <tr key={p.key} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: 6 }}>{p.symbol} {p.name}</td>
                    <td style={{ padding: 6 }}>{p.sign}</td>
                    <td style={{ padding: 6 }}>{p.degree}°</td>
                    <td style={{ padding: 6 }}>{p.house}</td>
                    <td style={{ padding: 6, direction: "ltr" }}>{p.absoluteDegree.toFixed(2)}°</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {result.houseCusps.length > 0 && (
            <div style={{ background: "#12122a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h3 style={{ color: "#aaa", marginBottom: 8 }}>🏠 פתחי בתים</h3>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #333", textAlign: "right" }}>
                    <th style={{ padding: 6 }}>בית</th>
                    <th style={{ padding: 6 }}>מזל</th>
                    <th style={{ padding: 6 }}>מעלה</th>
                  </tr>
                </thead>
                <tbody>
                  {result.houseCusps.map(h => (
                    <tr key={h.house} style={{ borderBottom: "1px solid #222" }}>
                      <td style={{ padding: 6 }}>{h.house}</td>
                      <td style={{ padding: 6 }}>{h.sign}</td>
                      <td style={{ padding: 6 }}>{h.degree}°</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {result.aspects.length > 0 && (
            <div style={{ background: "#12122a", borderRadius: 8, padding: 16, marginBottom: 16 }}>
              <h3 style={{ color: "#aaa", marginBottom: 8 }}>🔗 היבטים</h3>
              {result.aspects.map((a, i) => (
                <p key={i} style={{ margin: "4px 0" }}>{a.label} (orb: {a.orb}°)</p>
              ))}
            </div>
          )}

          <div style={{ background: "#12122a", borderRadius: 8, padding: 16 }}>
            <h3 style={{ color: "#aaa", marginBottom: 8 }}>🔥 יסודות דומיננטיים</h3>
            {result.dominantElements.map(e => (
              <p key={e.element}>{e.element}: {e.count} כוכבים</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default NatalTest;
