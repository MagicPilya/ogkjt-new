import { describe, expect, it } from "vitest";
import { normalizeStrapiUrl } from "./normalize-strapi-url";

describe("normalizeStrapiUrl", () => {
  it("removes trailing slashes for absolute URLs", () => {
    expect(normalizeStrapiUrl("https://cms.example.com///")).toBe("https://cms.example.com");
  });

  it("adds http protocol when missing", () => {
    expect(normalizeStrapiUrl("cms.example.com")).toBe("http://cms.example.com");
  });

  it("preserves protocol case-insensitively and still trims slash", () => {
    expect(normalizeStrapiUrl("HTTP://127.0.0.1:1337/")).toBe("HTTP://127.0.0.1:1337");
  });

  it("keeps semantics for empty input", () => {
    expect(normalizeStrapiUrl("")).toBe("http://");
  });
});
