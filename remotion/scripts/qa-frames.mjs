import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const bundled = await bundle({
  entryPoint: path.resolve("/dev-server/remotion/src/index.ts"),
  webpackOverride: (config) => config,
});

const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});

const composition = await selectComposition({ serveUrl: bundled, id: "promo-ad", puppeteerInstance: browser });

for (const f of [0, 30, 75, 105, 150]) {
  await renderStill({
    composition,
    serveUrl: bundled,
    output: `/tmp/frame-${f}.png`,
    frame: f,
    puppeteerInstance: browser,
  });
  console.log(`Frame ${f} done`);
}

await browser.close({ silent: false });
