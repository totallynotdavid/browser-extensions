import type { Browser } from "wxt/browser";

type ResourceType = `${Browser.declarativeNetRequest.ResourceType}`;

export type RuleSpec = {
  requestDomains: readonly string[];
  urlFilter?: string;
  resourceTypes: readonly ResourceType[];
};

export type RulesBySite = Readonly<Record<string, readonly RuleSpec[]>>;

const PIANO_EXECUTE_PATH = "/xbuilder/experience/execute^";
const ARC_ENGINE_PATH = "/pf/dist/engine/react.js^";

export const RULES_BY_SITE: RulesBySite = {
  "diariocorreo.pe": [
    {
      requestDomains: ["cdn.tinypass.com"],
      resourceTypes: ["script"],
    },
    {
      requestDomains: ["piano.io"],
      urlFilter: PIANO_EXECUTE_PATH,
      resourceTypes: ["script", "xmlhttprequest"],
    },
    {
      requestDomains: ["diariocorreo.pe"],
      urlFilter: ARC_ENGINE_PATH,
      resourceTypes: ["script"],
    },
  ],
  "elcomercio.pe": [
    {
      requestDomains: ["cdn.tinypass.com"],
      resourceTypes: ["script"],
    },
    {
      requestDomains: ["piano.io"],
      urlFilter: PIANO_EXECUTE_PATH,
      resourceTypes: ["script", "xmlhttprequest"],
    },
    {
      requestDomains: ["elcomercio.pe"],
      urlFilter: ARC_ENGINE_PATH,
      resourceTypes: ["script"],
    },
  ],
  "gestion.pe": [
    {
      requestDomains: ["cdn.tinypass.com"],
      resourceTypes: ["script"],
    },
    {
      requestDomains: ["piano.io"],
      urlFilter: PIANO_EXECUTE_PATH,
      resourceTypes: ["script", "xmlhttprequest"],
    },
    {
      requestDomains: ["gestion.pe"],
      urlFilter: ARC_ENGINE_PATH,
      resourceTypes: ["script"],
    },
  ],
};

export function buildSessionRules(
  rulesBySite: RulesBySite = RULES_BY_SITE,
): Browser.declarativeNetRequest.Rule[] {
  let id = 0;
  return Object.entries(rulesBySite).flatMap(([site, specs]) =>
    specs.map((spec) => ({
      id: ++id,
      priority: 1,
      action: { type: "block" },
      condition: {
        initiatorDomains: [site],
        requestDomains: [...spec.requestDomains],
        ...(spec.urlFilter ? { urlFilter: spec.urlFilter } : {}),
        resourceTypes: [...spec.resourceTypes],
      },
    })),
  );
}
