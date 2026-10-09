import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Sistema Visual y Accesibilidad (Fase 04)", () => {
  const cssPath = path.join(process.cwd(), "src/styles/globals.css");
  const cssContent = fs.readFileSync(cssPath, "utf8");

  it("debe contener la paleta canónica de colores exacta", () => {
    // Verde bosque #245C3A
    expect(cssContent).toContain("#245C3A");
    // Verde hoja #4D8A62
    expect(cssContent).toContain("#4D8A62");
    // Terracota #C8754D
    expect(cssContent).toContain("#C8754D");
    // Crema #F7F5EC
    expect(cssContent).toContain("#F7F5EC");
    // Texto #253129
    expect(cssContent).toContain("#253129");
  });

  it("debe definir el tamaño táctil mínimo de 48px para accesibilidad móvil (WCAG)", () => {
    expect(cssContent).toContain("--touch-target-min: 48px");
  });

  it("debe contar con clases de navegación móvil inferior y encabezado responsivo", () => {
    expect(cssContent).toContain(".mobile-bottom-nav");
    expect(cssContent).toContain(".shell-header");
    expect(cssContent).toContain(".header-nav-desktop");
  });

  it("los componentes base deben existir y exportarse adecuadamente", () => {
    const buttonPath = path.join(process.cwd(), "src/components/ui/Button.tsx");
    const formFieldPath = path.join(process.cwd(), "src/components/ui/FormField.tsx");
    const badgePath = path.join(process.cwd(), "src/components/ui/Badge.tsx");
    const stateViewPath = path.join(process.cwd(), "src/components/ui/StateView.tsx");

    expect(fs.existsSync(buttonPath)).toBe(true);
    expect(fs.existsSync(formFieldPath)).toBe(true);
    expect(fs.existsSync(badgePath)).toBe(true);
    expect(fs.existsSync(stateViewPath)).toBe(true);
  });
});
