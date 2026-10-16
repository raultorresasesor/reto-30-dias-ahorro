import test from "node:test";
import assert from "node:assert/strict";
import {
  parseAmount,
  restore,
  summarize,
  emptyState,
  motivation,
} from "../src/model.js";
test("valida pesos y calcula centavos sin errores de suma decimal", () => {
  assert.equal(parseAmount("0.29"), 29);
  assert.equal(parseAmount("0"), 0);
  for (const value of [
    "-1",
    "NaN",
    "Infinity",
    "",
    "1.234",
    "1e3",
    "1,50",
    "100000001",
  ])
    assert.throws(() => parseAmount(value));
});
test("editar sustituye el importe; días sin objetivo cuentan en ahorro y promedio", () => {
  const days = {
    30: { note: "café", cents: 2990, completed: true },
    4: { note: "", cents: 1010, completed: false },
  };
  assert.deepEqual(summarize(days), {
    totalCents: 4000,
    completed: 1,
    registered: 2,
    percent: 3,
    average: 20,
  });
  days[30] = { ...days[30], cents: 1000 };
  assert.equal(summarize(days).totalCents, 2010);
  assert.deepEqual(restore(JSON.stringify({ category: "Café", days })), {
    category: "Café",
    days,
  });
});
test("recuperación segura y resumen de 30 días", () => {
  assert.deepEqual(restore(null), emptyState());
  assert.throws(() => restore("{"));
  assert.throws(() =>
    restore(
      JSON.stringify({
        category: "",
        days: { 31: { cents: 0, note: "", completed: true } },
      }),
    ),
  );
  assert.throws(() =>
    restore(
      JSON.stringify({
        category: "",
        days: { 1: { cents: -1, note: "", completed: true } },
      }),
    ),
  );
  const days = Object.fromEntries(
    Array.from({ length: 30 }, (_, i) => [
      i + 1,
      { cents: 100, completed: true, note: "" },
    ]),
  );
  assert.equal(summarize(days).percent, 100);
  assert.equal(summarize(days).totalCents, 3000);
  for (const n of [0, 1, 7, 15, 30]) assert.ok(motivation(n).length > 10);
});

test("acepta importes MXN con miles y rechaza separadores ambiguos", () => {
  for (const input of ["1000", "1,000", "$1,000", " $ 1,000.00 "])
    assert.equal(parseAmount(input), 100000);
  assert.equal(parseAmount("$1,250.50"), 125050);
  for (const input of [
    "1,00",
    "1,50",
    "1,000,00",
    "$-1",
    "1,,000",
    "1.000,00",
    "0x10",
    "1,000.001",
  ])
    assert.throws(() => parseAmount(input));
});
