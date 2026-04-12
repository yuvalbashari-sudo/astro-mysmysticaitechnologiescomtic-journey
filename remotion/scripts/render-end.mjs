import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
import { fileURLToPath } from "url";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "src/index.ts"), webpackOverride: c => c });
const browser = await openBrowser("chrome", { browserExecutable: process.env.PUPPETEER_EXECUTABLE_PATH ?? "/bin/chromium", chromiumOptions: { args: ["--no-sandbox","--disable-gpu","--disable-dev-shm-usage"] }, chromeMode: "chrome-for-testing" });
const composition = await selectComposition({ serveUrl: bundled, id: "promo-ad", puppeteerInstance: browser });
for (const frame of [200, 250, 295]) {
  await renderStill({ composition, serveUrl: bundled, output: `/tmp/hold-${frame}.png`, puppeteerInstance: browser, frame });
  console.log(`✅ Frame ${frame}`);
}
await browser.close({ silent: false });
