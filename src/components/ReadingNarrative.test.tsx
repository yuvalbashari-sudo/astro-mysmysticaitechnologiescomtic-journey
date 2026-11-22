import { render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { LanguageProvider } from "@/i18n";
import ReadingNarrative from "./ReadingNarrative";

afterEach(() => localStorage.clear());

it("keeps a saved reading that begins with a heading without inventing a summary", () => {
  localStorage.setItem("astrologai_lang", "he");
  render(<LanguageProvider><ReadingNarrative text={"### קו החיים\nהקו ממשיך בקשת סביב בסיס האגודל."} /></LanguageProvider>);
  expect(screen.queryByRole("heading", { name: "התובנה המרכזית" })).toBeNull();
  expect(screen.getByText("הקו ממשיך בקשת סביב בסיס האגודל.")).toBeInTheDocument();
});

it("keeps a long unstructured saved reading complete in the full reading", () => {
  localStorage.setItem("astrologai_lang", "en");
  const text = "This saved reading has a continuous paragraph. ".repeat(15);
  render(<LanguageProvider><ReadingNarrative text={text} /></LanguageProvider>);
  expect(screen.queryByRole("heading", { name: "Your key insight" })).toBeNull();
  expect(screen.getByRole("heading", { name: "Full reading" })).toBeInTheDocument();
  expect(screen.getByText(text.trim())).toBeInTheDocument();
});

it("shows the streamed introduction and keeps it when the detailed sections arrive", () => {
  localStorage.setItem("astrologai_lang", "he");
  const view = render(<LanguageProvider><ReadingNarrative text="כדאי להתחיל בשיחה קצרה." /></LanguageProvider>);
  expect(screen.getByText("כדאי להתחיל בשיחה קצרה.")).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: "הפירוש המלא" })).toBeNull();
  view.rerender(<LanguageProvider><ReadingNarrative text={"כדאי להתחיל בשיחה קצרה.\n\n### הקלפים שלך\nהכוכב מציע להתחיל בצעד קטן."} /></LanguageProvider>);
  expect(screen.getByText("כדאי להתחיל בשיחה קצרה.")).toBeInTheDocument();
  expect(screen.getByText("הכוכב מציע להתחיל בצעד קטן.")).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "הפירוש המלא" })).toBeInTheDocument();
});
