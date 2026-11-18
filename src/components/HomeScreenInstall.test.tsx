import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import HomeScreenInstall from "./HomeScreenInstall";

afterEach(() => { cleanup(); vi.restoreAllMocks(); });

it("explains how to add the site in Safari", () => {
  vi.spyOn(navigator, "userAgent", "get").mockReturnValue("iPhone Safari");
  render(<HomeScreenInstall />);
  fireEvent.click(screen.getByRole("button"));
  expect(screen.getByRole("status")).toHaveTextContent("Safari");
});

it("consumes Chrome's native prompt once and allows manual installation after dismissal", async () => {
  const matchMedia = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation(query => ({
    ...matchMedia(query), matches: query.includes("max-width"),
  }));
  const prompt = vi.fn().mockResolvedValue(undefined);
  const event = Object.assign(new Event("beforeinstallprompt", { cancelable: true }), {
    prompt, userChoice: Promise.resolve({ outcome: "dismissed" }),
  });
  window.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  render(<HomeScreenInstall />);
  const button = screen.getByRole("button");
  fireEvent.click(button);
  await waitFor(() => expect(button).toBeEnabled());
  expect(prompt).toHaveBeenCalledOnce();
  fireEvent.click(button);
  expect(screen.getByRole("status")).toHaveTextContent("Chrome");
});

it("hides the install action when launched from the home screen", () => {
  const matchMedia = window.matchMedia;
  vi.spyOn(window, "matchMedia").mockImplementation(query => ({
    ...matchMedia(query), matches: query.includes("standalone"),
  }));
  render(<HomeScreenInstall />);
  expect(screen.queryByRole("button")).toBeNull();
});
