import * as p from "@clack/prompts";
import ejs from "ejs";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { setTimeout } from "node:timers/promises";
import { fileURLToPath } from "node:url";
import color from "picocolors";

async function main() {
  console.clear();

  await setTimeout(1000);

  p.updateSettings({
    aliases: {
      w: "up",
      s: "down",
      a: "left",
      d: "right",
    },
  });

  p.intro(`${color.bgCyan(color.black(" create-app "))}`);

  const project = await p.group(
    {
      path: () =>
        p.text({
          message: "Where should we create your project?",
          placeholder: "./sparkling-solid",
          validate: (value) => {
            if (!value) return "Please enter a path.";
            if (value[0] !== ".") return "Please enter a relative path.";
          },
        }),
      type: ({ results }) =>
        p.select({
          message: `Pick a template "${results.path}"`,
          initialValue: "basic",
          maxItems: 2,
          options: [
            { value: "basic", label: "Basic" },
            { value: "coffee", label: "CoffeeScript", hint: "oh no" },
          ],
        }),
      install: () =>
        p.confirm({
          message: "Install dependencies?",
          initialValue: false,
        }),
    },
    {
      onCancel: () => {
        p.cancel("Operation cancelled.");
        process.exit(0);
      },
    }
  );

  const nextSteps = `cd ${project.path}        \n${
    project.install ? "" : "pnpm install\n"
  }pnpm dev`;

  p.note(nextSteps, "Next steps.");

  p.outro(
    `Problems? ${color.underline(color.cyan("https://example.com/issues"))}`
  );

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);

  const dest = join(process.cwd(), project.path);
  const src = join(__dirname, "templates", "basic");

  // Ensure destination exists
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }

  // Read template file as text
  const templateFile = join(src, "index.ts");
  let templateContent = readFileSync(templateFile, "utf-8");

  // Render with ejs
  const rendered = ejs.render(templateContent, { projectName: project.path });

  // Write to destination
  writeFileSync(join(dest, "index.ts"), rendered);
}

main().catch(console.error);
