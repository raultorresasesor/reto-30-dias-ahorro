import { test, expect } from "@playwright/test";
const browserErrors = new WeakMap();
test.beforeEach(async ({ page }) => {
  const errors = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 && /\.(?:js|css)(?:\?|$)/.test(response.url()))
      errors.push(`Recurso fallido: ${response.status()} ${response.url()}`);
  });
});
test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
});

async function save(page, day, amount, yes = true) {
  await page.getByRole("button", { name: `Día ${day},`, exact: false }).click();
  await page
    .getByLabel("¿Qué compra o gasto evitaste hoy?")
    .fill("Café en casa");
  await page.getByLabel("¿Cuánto dinero evitaste gastar?").fill(amount);
  await page
    .getByRole("radio", { name: yes ? "Sí" : "No", exact: true })
    .check();
  await page.getByRole("button", { name: "Guardar mi día" }).click();
}
test("calendario, validación, edición, recuperación y reinicio confirmado", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("./");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await save(page, 30, "50.25");
  await expect(page.locator(".savings-total")).toContainText("$50.25");
  await expect(
    page.getByRole("button", { name: "Día 30, completado", exact: true }),
  ).toBeVisible();
  await save(page, 2, "10", false);
  await expect(page.locator(".savings-total")).toContainText("$60.25");
  await expect(page.locator(".savings-bottom")).toContainText("$30.13");
  await save(page, 30, "20");
  await expect(page.locator(".savings-total")).toContainText("$30.00");
  await page.getByText("Elimina una categoría", { exact: true }).click();
  await page.getByLabel("¿Qué categoría vas a eliminar?").fill("Antojos");
  await page.reload();
  await expect(page.locator(".savings-total")).toContainText("$30.00");
  await page.getByText("Elimina una categoría", { exact: true }).click();
  await expect(page.getByLabel("¿Qué categoría vas a eliminar?")).toHaveValue(
    "Antojos",
  );
  await page
    .getByRole("button", { name: "Día 1, sin registrar", exact: true })
    .click();
  await page.getByLabel("¿Cuánto dinero evitaste gastar?").fill("-10");
  await page.getByRole("button", { name: "Guardar mi día" }).click();
  await expect(page.getByRole("alert")).toContainText("importe válido");
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page
    .getByRole("button", { name: "Empezar de nuevo", exact: true })
    .click();
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await expect(page.locator(".savings-total")).toContainText("$30.00");
  await page
    .getByRole("button", { name: "Empezar de nuevo", exact: true })
    .click();
  await page.getByRole("button", { name: "Sí, borrar mi progreso" }).click();
  await page.reload();
  await expect(page.locator(".savings-total")).toContainText("$0.00");
  expect(errors).toEqual([]);
});
test("30 días, imagen compartible y diseño en móvil y escritorio", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() =>
    localStorage.setItem(
      "raul-torres-ahorro-v1",
      JSON.stringify({
        category: "Antojos",
        days: Object.fromEntries(
          Array.from({ length: 30 }, (_, i) => [
            i + 1,
            { note: "NOTA PRIVADA", cents: 10000, completed: true },
          ]),
        ),
      }),
    ),
  );
  await page.reload();
  await expect(page.getByText("¡LO LOGRASTE!", { exact: true })).toBeVisible();
  await expect(page.locator(".final-total")).toContainText("$3,000.00");
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Compartir mi resultado" }).click();
  expect((await download).suggestedFilename()).toBe("mi-reto-raul-torres.png");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({ path: "/tmp/reto-desktop.png", fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "/tmp/reto-mobile.png", fullPage: true });
});
test("datos corruptos se preservan y almacenamiento bloqueado avisa", async ({
  page,
}) => {
  await page.goto("./");
  await page.evaluate(() =>
    localStorage.setItem("raul-torres-ahorro-v1", "corrupto"),
  );
  await page.reload();
  await expect(page.getByRole("alert")).toContainText("No pudimos recuperar");
  expect(
    await page.evaluate(() => localStorage.getItem("raul-torres-ahorro-v1")),
  ).toBe("corrupto");
  await page
    .getByRole("button", { name: "Empezar de nuevo", exact: true })
    .click();
  await page.getByRole("button", { name: "Sí, borrar mi progreso" }).click();
  await page.evaluate(
    () =>
      (Storage.prototype.setItem = () => {
        throw new Error("blocked");
      }),
  );
  await save(page, 1, "0");
  await expect(page.getByRole("alert")).toContainText("no permitió guardar");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Día 1, completado", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("solo en esta sesión");
});

test("día 1 con $1,000: guardar, reabrir, recargar y editar sin duplicar", async ({
  page,
}) => {
  await page.goto("./");
  await save(page, 1, "$1,000");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Día 1, completado", exact: true }),
  ).toHaveClass(/completed/);
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "3",
  );
  await expect(page.locator(".stats").first()).toContainText("1 / 30");
  await expect(page.locator(".savings-total")).toContainText("$1,000.00");
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("raul-torres-ahorro-v1")).days["1"],
    ),
  ).toEqual({ note: "Café en casa", cents: 100000, completed: true });
  await page
    .getByRole("button", { name: "Día 1, completado", exact: true })
    .click();
  await expect(
    page.getByLabel("¿Qué compra o gasto evitaste hoy?"),
  ).toHaveValue("Café en casa");
  await expect(page.getByLabel("¿Cuánto dinero evitaste gastar?")).toHaveValue(
    "1000.00",
  );
  await expect(
    page.getByRole("radio", { name: "Sí", exact: true }),
  ).toBeChecked();
  await page.getByRole("button", { name: "Guardar mi día" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.locator(".savings-total")).toContainText("$1,000.00");
  await save(page, 1, "1,250.50");
  await expect(page.locator(".savings-total")).toContainText("$1,250.50");
  await expect(page.getByRole("progressbar")).toHaveAttribute(
    "aria-valuenow",
    "3",
  );
});

test("localStorage inaccesible desde el inicio permite registrar en la sesión y avisa", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Blocked", "SecurityError");
      },
    }),
  );
  await page.goto("./");
  await expect(page.getByRole("alert")).toContainText("solo en esta sesión");
  await save(page, 1, "1000");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.locator(".savings-total")).toContainText("$1,000.00");
  await page
    .getByRole("button", { name: "Día 1, completado", exact: true })
    .click();
  await expect(page.getByLabel("¿Cuánto dinero evitaste gastar?")).toHaveValue(
    "1000.00",
  );
  await page.getByRole("button", { name: "Cancelar", exact: true }).click();
  await page.reload();
  await expect(page.locator(".savings-total")).toContainText("$0.00");
  await expect(page.getByRole("alert")).toContainText("solo en esta sesión");
});
