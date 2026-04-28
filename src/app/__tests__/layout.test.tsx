import { describe, expect, it, vi } from "vitest";
import RootLayout from "@/app/layout";

describe("RootLayout", () => {
  it("passes the generated service worker URL to SerwistProvider", () => {
    const htmlElement = RootLayout({ children: <div>App</div> });
    const bodyElement = htmlElement.props.children;
    const providerElement = bodyElement.props.children;

    expect(providerElement.props.swUrl).toBe("/sw.js");
  });
});
