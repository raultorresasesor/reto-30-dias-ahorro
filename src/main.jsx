import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  STORAGE_KEY,
  emptyState,
  restore,
  parseAmount,
  summarize,
  money,
  motivation,
} from "./model.js";
import "./styles.css";

function Arrow() {
  return (
    <svg
      aria-hidden="true"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <path d="M5 19 19 5M5 5h14v14" />
    </svg>
  );
}

const levels = [
  [
    "Un día sin gastar",
    "Pasa 24 horas sin realizar gastos no esenciales.",
    [
      "Come lo que ya tienes en casa.",
      "Evita compras por internet.",
      "No pidas comida a domicilio.",
      "Evita compras impulsivas.",
    ],
    "Aprender a detenerte antes de gastar.",
  ],
  [
    "Fin de semana sin gastos",
    "Organiza un fin de semana sin gastos discrecionales.",
    [
      "Prepara tus comidas en casa.",
      "Busca actividades gratuitas.",
      "Aprovecha para descansar.",
      "Convive sin necesidad de consumir.",
    ],
    "Descubrir que disfrutar no siempre requiere gastar dinero.",
  ],
  [
    "Elimina una categoría",
    "Elige un gasto no esencial que evitarás durante 30 días.",
    [
      "Café comprado fuera de casa.",
      "Comida a domicilio.",
      "Compras impulsivas.",
      "Ropa innecesaria.",
      "Antojos.",
    ],
    "Distinguir entre necesidades y hábitos.",
  ],
  [
    "Respeta tu presupuesto",
    "Mantén tus gastos dentro de los límites que hayas establecido.",
    [
      "Planifica tus compras.",
      "Evita gastar por impulso.",
      "Respeta tus límites.",
      "Revisa antes de comprar.",
    ],
    "Que tus decisiones financieras sean conscientes y no emocionales.",
  ],
  [
    "Revisa tus suscripciones",
    "Identifica cuáles realmente utilizas y cuáles podrías cancelar.",
    [
      "Plataformas de entretenimiento.",
      "Aplicaciones.",
      "Membresías.",
      "Servicios digitales.",
    ],
    "Eliminar gastos recurrentes que no aportan valor.",
  ],
];
function Modal({ children, onClose, label }) {
  const ref = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    return () => {
      if (previous?.isConnected) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-labelledby={label}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
function DayForm({ day, record, onSave, onClose }) {
  const [note, setNote] = useState(record?.note || "");
  const [amount, setAmount] = useState(
    record ? (record.cents / 100).toFixed(2) : "",
  );
  const [completed, setCompleted] = useState(
    record ? String(record.completed) : "",
  );
  const [error, setError] = useState("");
  const errorRef = useRef(null);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  function submit(e) {
    e.preventDefault();
    try {
      const cents = parseAmount(amount);
      if (!completed)
        throw new Error("Indica si cumpliste tu objetivo del día.");
      onSave({ note: note.trim(), cents, completed: completed === "true" });
    } catch (err) {
      setError(err.message);
    }
  }
  return (
    <Modal onClose={onClose} label="day-title">
      <form onSubmit={submit} noValidate>
        <span className="eyebrow">UNA DECISIÓN A LA VEZ</span>
        <h2 id="day-title">Día {day} — ¿Cómo te fue hoy?</h2>
        <p>Todo cuenta, incluso los días que se complican.</p>
        <label htmlFor="note">¿Qué compra o gasto evitaste hoy?</label>
        <textarea
          id="note"
          maxLength="1000"
          rows="3"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Por ejemplo: preparé mi café en casa"
        />
        <label htmlFor="amount">¿Cuánto dinero evitaste gastar? (MXN)</label>
        <input
          autoFocus
          id="amount"
          inputMode="decimal"
          type="text"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          aria-describedby="amount-help"
        />
        <small id="amount-help">
          Puedes registrar $0, 1000 o $1,000.00. Usa punto para los decimales.
        </small>
        <fieldset>
          <legend>¿Cumpliste tu objetivo del día?</legend>
          <div className="choices">
            {[
              ["true", "Sí"],
              ["false", "No"],
            ].map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="completed"
                  value={value}
                  checked={completed === value}
                  onChange={(e) => setCompleted(e.target.value)}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <p ref={errorRef} tabIndex={-1} className="error" role="alert">
          {error}
        </p>
        <button className="primary" type="submit">
          Guardar mi día{" "}
          <span>
            <Arrow />
          </span>
        </button>
        <button className="plain" type="button" onClick={onClose}>
          Cancelar
        </button>
      </form>
    </Modal>
  );
}
async function shareResult(total) {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const c = canvas.getContext("2d");
  c.fillStyle = "#102e42";
  c.fillRect(0, 0, 1080, 1350);
  c.strokeStyle = "#c9a86a";
  c.lineWidth = 3;
  c.strokeRect(55, 55, 970, 1240);
  c.textAlign = "center";
  c.fillStyle = "#d9bc85";
  c.font = "28px sans-serif";
  c.fillText("RETO DE AHORRO · 30 DÍAS", 540, 200);
  c.fillStyle = "#ffffff";
  c.font = "bold 82px sans-serif";
  c.fillText("¡LO LOGRÉ!", 540, 420);
  c.font = "32px sans-serif";
  c.fillText("Con pequeñas decisiones conservé", 540, 540);
  const formatted = money(total);
  c.font = `bold ${formatted.length > 16 ? 58 : 80}px sans-serif`;
  c.fillText(formatted, 540, 690, 900);
  c.fillStyle = "#d9bc85";
  c.font = "30px sans-serif";
  c.fillText("MXN · 30 días completados", 540, 770);
  c.fillStyle = "#ffffff";
  c.font = "bold 46px sans-serif";
  c.fillText("Raúl Torres", 540, 1070);
  c.font = "26px sans-serif";
  c.fillText("Crea, conserva y haz crecer tu dinero.", 540, 1130);
  const blob = await new Promise((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );
  if (!blob) throw new Error("No se pudo crear la imagen. Intenta de nuevo.");
  const file = new File([blob], "mi-reto-raul-torres.png", {
    type: "image/png",
  });
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Mi reto de ahorro · Raúl Torres",
    });
    return "Resultado compartido.";
  }
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  return "Tu imagen está lista. Revisa las descargas de tu navegador.";
}
function App() {
  const [initial] = useState(() => {
    let raw;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch {
      return {
        data: emptyState(),
        blocked: false,
        sessionOnly: true,
        warning:
          "El navegador bloqueó el almacenamiento. Puedes registrar tus días solo en esta sesión; se perderán al recargar o cerrar. Abre la aplicación en tu navegador habitual para intentar guardar tu progreso.",
      };
    }
    try {
      return {
        data: restore(raw),
        warning: "",
        blocked: false,
        sessionOnly: false,
      };
    } catch {
      return {
        data: emptyState(),
        blocked: true,
        sessionOnly: false,
        warning:
          "No pudimos recuperar tu progreso. No sobrescribiremos los datos anteriores. Puedes intentar recargar o confirmar “Empezar de nuevo”.",
      };
    }
  });
  const [data, setData] = useState(initial.data);
  const [warning, setWarning] = useState(initial.warning);
  const [blocked, setBlocked] = useState(initial.blocked);
  const [day, setDay] = useState(null);
  const [reset, setReset] = useState(false);
  const [status, setStatus] = useState("");
  const [sharing, setSharing] = useState(false);
  const stats = summarize(data.days);
  function persist(next) {
    if (blocked) {
      setStatus(
        "Primero recupera o reinicia los datos anteriores para guardar nuevos registros.",
      );
      return false;
    }
    if (initial.sessionOnly) {
      setData(next);
      return "session";
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setWarning("");
    } catch {
      setWarning(
        "El navegador no permitió guardar. Tu progreso está disponible solo en esta sesión; los cambios se perderán al recargar o cerrar.",
      );
      setData(next);
      return "session";
    }
    setData(next);
    return true;
  }
  function restart() {
    try {
      if (!initial.sessionOnly) localStorage.removeItem(STORAGE_KEY);
      setData(emptyState());
      setBlocked(false);
      setWarning(initial.sessionOnly ? initial.warning : "");
      setReset(false);
      setStatus("Listo. Un nuevo comienzo, a tu ritmo.");
    } catch {
      setWarning(
        "No se pudieron borrar los datos. Revisa los permisos de almacenamiento de tu navegador.",
      );
      setReset(false);
    }
  }
  async function share() {
    setSharing(true);
    try {
      setStatus(await shareResult(stats.totalCents / 100));
    } catch (e) {
      if (e.name !== "AbortError")
        setStatus(e.message || "No se pudo compartir. Intenta de nuevo.");
    } finally {
      setSharing(false);
    }
  }
  return (
    <>
      <header className="topbar">
        <a className="brand" href="#inicio">
          <span className="brand-mark" aria-hidden="true">
            RT<span>·</span>
          </span>
          <span>
            RAÚL TORRES<small>ASESOR PATRIMONIAL</small>
          </span>
        </a>
        <span className="top-tag">UN HÁBITO. UN CAMBIO.</span>
      </header>
      <main id="inicio">
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="dot" /> TU DINERO, TUS DECISIONES
            </span>
            <h1>
              RETO DE AHORRO
              <strong>
                30 DÍAS
                <span>
                  <Arrow />
                </span>
              </strong>
            </h1>
            <p className="byline">Por Raúl Torres</p>
            <h2>
              El dinero que no gastas <br />
              también cuenta.
            </h2>
            <p>
              Durante los próximos 30 días descubrirás cuánto puedes ahorrar
              simplemente cambiando algunas decisiones de todos los días.
            </p>
            <a className="primary hero-button" href="#calendario">
              Comenzar mi reto <span>↓</span>
            </a>
            <span className="hero-caption">
              Gratis · Sin cuentas · A tu ritmo
            </span>
          </div>
          <div className="hero-art" aria-hidden="true">
            <span className="art-caption">
              PEQUEÑAS DECISIONES
              <br />
              GRANDES CAMBIOS
            </span>
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="coin coin-back">$</div>
            <div className="coin coin-front">$</div>
            <div className="art-step step-one" />
            <div className="art-step step-two" />
            <div className="art-step step-three" />
            <span className="art-star">✦</span>
            <span className="art-bottom">EL PODER DE CONSERVAR.</span>
          </div>
        </section>
        <section className="progress-card" aria-label="Resumen de tu progreso">
          <div className="progress-heading">
            <span className="eyebrow">ASÍ VAS, PASO A PASO</span>
            <span>
              Tu progreso <b>{stats.percent}%</b>
            </span>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Reto terminado"
            aria-valuenow={stats.percent}
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <div style={{ width: `${stats.percent}%` }} />
          </div>
          <div className="stats">
            <div>
              <strong>
                {stats.completed}
                <small> / 30</small>
              </strong>
              <span>Días completados</span>
            </div>
            <div>
              <strong>
                {stats.percent}
                <small>%</small>
              </strong>
              <span>Del reto terminado</span>
            </div>
            <div>
              <strong>
                {money(stats.totalCents / 100)}
                <small> MXN</small>
              </strong>
              <span>Dinero conservado</span>
            </div>
          </div>
        </section>

        <div className="content-grid">
          <section className="levels">
            <span className="eyebrow">TU GUÍA PARA CONSERVAR</span>
            <h2>
              ¿Te atreves a completar
              <br />
              los 5 niveles?
            </h2>
            <p>
              Combínalos como quieras. No son etapas: son ideas para poner en
              práctica desde hoy.
            </p>
            <div className="level-list">
              {levels.map(([title, desc, tips, goal], i) => (
                <details key={title}>
                  <summary>
                    <span className="level-number">0{i + 1}</span>
                    <span>
                      <small>NIVEL {i + 1}</small>
                      <strong>{title}</strong>
                    </span>
                    <span className="plus" aria-hidden="true">
                      +
                    </span>
                  </summary>
                  <div className="level-body">
                    <p>{desc}</p>
                    <ul>
                      {tips.map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                    {i === 2 && (
                      <>
                        <label htmlFor="category">
                          ¿Qué categoría vas a eliminar?
                        </label>
                        <input
                          id="category"
                          maxLength="120"
                          placeholder="Por ejemplo: café fuera de casa"
                          value={data.category}
                          disabled={blocked}
                          onChange={(e) =>
                            persist({ ...data, category: e.target.value })
                          }
                        />
                        <small>Se guarda automáticamente.</small>
                      </>
                    )}
                    <p className="goal">
                      <b>Objetivo:</b> {goal}
                    </p>
                  </div>
                </details>
              ))}
            </div>
            <aside className="quote">
              <span aria-hidden="true">“</span>
              <p>Conservar también es avanzar.</p>
              <small>RAÚL TORRES</small>
            </aside>
          </section>
          <section id="calendario" className="calendar-section">
            <div className="section-heading">
              <div>
                <span className="eyebrow">UN DÍA A LA VEZ</span>
                <h2>Tus próximos 30 días</h2>
              </div>
              <span className="calendar-icon" aria-hidden="true">
                ▦
              </span>
            </div>
            <p>
              Toca un día y cuéntate cómo te fue.
              <br />
              Puedes empezar por el que quieras.
            </p>
            {warning && (
              <p className="notice" role="alert">
                {warning}
              </p>
            )}
            <p className="status" role="status">
              {status}
            </p>
            <div className="calendar">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
                const r = data.days[n];
                return (
                  <button
                    key={n}
                    disabled={blocked}
                    className={`day ${r ? (r.completed ? "completed" : "registered") : ""}`}
                    onClick={() => setDay(n)}
                    aria-label={`Día ${n}${r ? (r.completed ? ", completado" : ", registrado sin cumplir objetivo") : ", sin registrar"}`}
                  >
                    <span>{String(n).padStart(2, "0")}</span>
                    {r && (
                      <small aria-hidden="true">
                        {r.completed ? "✓" : "•"}
                      </small>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="calendar-legend">
              <span>
                <i className="legend-dot done" />
                Objetivo cumplido
              </span>
              <span>
                <i className="legend-dot saved" />
                Día registrado
              </span>
            </div>
            <div className="motivation" aria-live="polite">
              <span aria-hidden="true">✦</span>
              <p>{motivation(stats.completed)}</p>
            </div>
            <section className="savings">
              <span className="eyebrow">CADA DECISIÓN SUMA</span>
              <h3>¡Mira cuánto dinero has conservado!</h3>
              <div className="savings-total">
                {money(stats.totalCents / 100)} <small>MXN</small>
              </div>
              <p>Total acumulado en gastos que realmente evitaste.</p>
              <div className="savings-bottom">
                <div>
                  <b>{stats.completed} de 30</b>
                  <small>Días completados</small>
                </div>
                <div>
                  <b>{money(stats.average)}</b>
                  <small>Promedio por día registrado</small>
                </div>
              </div>
              <small className="disclaimer">
                {stats.registered} días registrados · No representa depósitos ni
                rendimientos de inversión.
              </small>
            </section>
          </section>
        </div>
        {stats.completed === 30 && (
          <section className="final-card">
            <span className="celebrate" aria-hidden="true">
              ✦ ✧ ✦
            </span>
            <span className="eyebrow">30 DÍAS DE MEJORES DECISIONES</span>
            <h2>¡LO LOGRASTE!</h2>
            <p>Completaste tu reto de ahorro de 30 días.</p>
            <div className="final-total">
              {money(stats.totalCents / 100)} <small>MXN</small>
            </div>
            <p>
              <b>30 días completados</b>
              <br />
              Categoría de gasto eliminada:{" "}
              {data.category || "No elegiste una categoría"}
            </p>
            <p>
              Ahora imagina lo que podrías lograr si convirtieras estas pequeñas
              decisiones en hábitos permanentes.
            </p>
            <button className="primary" onClick={share} disabled={sharing}>
              {sharing ? "Preparando imagen…" : "Compartir mi resultado"}{" "}
              <span>
                <Arrow />
              </span>
            </button>
            <small>
              La imagen solo incluye tu total, los días completados y la marca
              Raúl Torres.
            </small>
          </section>
        )}
        <section className="privacy">
          <span aria-hidden="true">◈</span>
          <p>
            Tu progreso se guarda en este navegador y dispositivo. Si borras sus
            datos o utilizas otro dispositivo, podrías perderlo.
          </p>
          <button className="plain" onClick={() => setReset(true)}>
            Empezar de nuevo
          </button>
        </section>
      </main>
      <footer>
        <div className="footer-brand">
          Raúl Torres<span>Crea, conserva y haz crecer tu dinero.</span>
        </div>
        <a
          href="https://www.instagram.com/raultorresasesor/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Sígueme para aprender a cuidar
          <br />y hacer crecer tu dinero.{" "}
          <span>
            <Arrow />
          </span>
        </a>
        <small>HECHO PARA AYUDARTE A DAR EL PRIMER PASO.</small>
      </footer>
      {day !== null && (
        <DayForm
          day={day}
          record={data.days[day]}
          onClose={() => setDay(null)}
          onSave={(record) => {
            const result = persist({
              ...data,
              days: { ...data.days, [day]: record },
            });
            if (result) {
              setDay(null);
              setStatus(
                result === "session"
                  ? "Día registrado solo en esta sesión. El navegador no permitió guardar los cambios de forma permanente."
                  : "Día guardado. Cada registro te ayuda a conocer tus decisiones.",
              );
            }
          }}
        />
      )}{" "}
      {reset && (
        <Modal onClose={() => setReset(false)} label="reset-title">
          <h2 id="reset-title">¿Empezar de nuevo?</h2>
          <p>
            Se borrarán todos tus registros y la categoría elegida de este
            navegador. Esta acción no se puede deshacer.
          </p>
          <button className="primary" onClick={restart}>
            Sí, borrar mi progreso
          </button>
          <button className="plain" onClick={() => setReset(false)}>
            Cancelar
          </button>
        </Modal>
      )}
    </>
  );
}
createRoot(document.getElementById("root")).render(<App />);
