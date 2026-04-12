import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundled = await bundle({
  entryPoint: path.resolve(__dirname, "../src/index.ts"),
  webpackOverride: (config) => config,
});
const browser = await openBrowser("chrome", {
  browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: "promo-ad", puppeteerInstance: browser });

for (const frame of [0, 45, 90, 150]) {
  await renderStill({ composition, serveUrl: bundled, output: `/tmp/frame-${frame}.png`, puppeteerInstance: browser, frame });
  console.log(`✅ Frame ${frame} rendered`);
}
await browser.close({ silent: false });
