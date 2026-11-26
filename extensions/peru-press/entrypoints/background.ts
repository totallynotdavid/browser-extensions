import { browser } from "wxt/browser";
import { defineBackground } from "wxt/utils/define-background";

import { buildSessionRules } from "../src/rules";

async function replaceSessionRules() {
  const existingRules = await browser.declarativeNetRequest.getSessionRules();
  await browser.declarativeNetRequest.updateSessionRules({
    removeRuleIds: existingRules.map((rule) => rule.id),
    addRules: buildSessionRules(),
  });
}

export default defineBackground(() => {
  void replaceSessionRules();
});
