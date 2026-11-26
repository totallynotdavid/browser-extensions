import { afterEach, expect, it, vi } from "vitest";
import { fakeBrowser } from "wxt/testing/fake-browser";

import background from "../entrypoints/background";
import { buildSessionRules } from "../src/rules";

afterEach(() => {
  vi.restoreAllMocks();
  fakeBrowser.reset();
});

it("replaces the existing session rules when the background starts", async () => {
  let resolveUpdated!: () => void;
  const updated = new Promise<void>((resolve) => {
    resolveUpdated = resolve;
  });
  vi.spyOn(
    fakeBrowser.declarativeNetRequest,
    "getSessionRules",
  ).mockImplementation(() =>
    Promise.resolve([
      {
        id: 100,
        priority: 1,
        action: { type: "block" },
        condition: { urlFilter: "old-rule" },
      },
    ]),
  );
  const updateSessionRules = vi
    .spyOn(fakeBrowser.declarativeNetRequest, "updateSessionRules")
    .mockImplementation(async () => {
      resolveUpdated();
    });

  background.main();
  await updated;

  expect(updateSessionRules).toHaveBeenCalledWith({
    removeRuleIds: [100],
    addRules: buildSessionRules(),
  });
});
