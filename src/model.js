export const STORAGE_KEY = "raul-torres-ahorro-v1";
export const emptyState = () => ({ category: "", days: {} });
export const money = (value) =>
  new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(value);
export function parseAmount(value) {
  const input = String(value).trim();
  // MXN uses commas for thousands and a point for decimals. Reject ambiguous
  // comma decimals and malformed grouping instead of silently changing values.
  if (!/^\$?\s*(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(input))
    throw new Error(
      "Escribe un importe válido, por ejemplo 1000 o $1,000.00, con hasta dos decimales.",
    );
  const normalized = input.replace(/[$,\s]/g, "");
  const cents = Math.round(Number(normalized) * 100);
  if (!Number.isSafeInteger(cents) || cents > 10000000000)
    throw new Error("El importe máximo por día es $100,000,000 MXN.");
  return cents;
}
export function restore(raw) {
  if (!raw) return emptyState();
  const data = JSON.parse(raw);
  if (
    !data ||
    typeof data.category !== "string" ||
    !data.days ||
    typeof data.days !== "object" ||
    Array.isArray(data.days)
  )
    throw new Error("Datos inválidos");
  const days = {};
  for (const [day, record] of Object.entries(data.days)) {
    if (
      !/^(?:[1-9]|[12]\d|30)$/.test(day) ||
      !record ||
      typeof record.note !== "string" ||
      typeof record.completed !== "boolean" ||
      !Number.isSafeInteger(record.cents) ||
      record.cents < 0 ||
      record.cents > 10000000000
    )
      throw new Error("Registro inválido");
    days[day] = {
      note: record.note.slice(0, 1000),
      cents: record.cents,
      completed: record.completed,
    };
  }
  return { category: data.category.slice(0, 120), days };
}
export function summarize(days) {
  const records = Object.values(days);
  const totalCents = records.reduce((sum, day) => sum + day.cents, 0);
  const completed = records.filter((day) => day.completed).length;
  return {
    totalCents,
    completed,
    registered: records.length,
    percent: Math.round((completed / 30) * 100),
    average: records.length ? totalCents / records.length / 100 : 0,
  };
}
export function motivation(completed) {
  if (completed === 30)
    return "¡Reto completado! Ahora sabes que ahorrar no siempre significa ganar más, sino decidir mejor qué hacer con lo que ya ganas.";
  if (completed >= 15)
    return "Ya llevas medio camino. ¿Te das cuenta de cuánto puedes conservar?";
  if (completed >= 7)
    return "Una semana tomando mejores decisiones. Así empiezan los grandes cambios.";
  if (completed >= 1)
    return "¡Bien hecho! Hoy demostraste que puedes decidir antes de gastar.";
  return "No necesitas hacerlo perfecto. Solo dar el primer paso.";
}
