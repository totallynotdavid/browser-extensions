import { describe, expect, it } from "vitest";
import type { Browser } from "wxt/browser";

import { buildSessionRules, RULES_BY_SITE } from "../src/rules";

type Rule = Browser.declarativeNetRequest.Rule;
type ResourceType = `${Browser.declarativeNetRequest.ResourceType}`;

type Request = {
  url: string;
  initiator: string;
  type: ResourceType;
};

const SITES = [
  {
    domain: "diariocorreo.pe",
    article: "https://www.diariocorreo.pe/lima/una-noticia-123456/",
    engine: "https://www.diariocorreo.pe/pf/dist/engine/react.js",
  },
  {
    domain: "elcomercio.pe",
    article: "https://elcomercio.pe/lima/una-noticia-123456/",
    engine: "https://elcomercio.pe/pf/dist/engine/react.js?v=1",
  },
  {
    domain: "gestion.pe",
    article: "https://gestion.pe/economia/una-noticia-123456/",
    engine: "https://gestion.pe/pf/dist/engine/react.js#build",
  },
] as const;

function hostMatches(hostname: string, domains: readonly string[] = []) {
  return domains.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
  );
}

function urlFilterMatches(url: string, filter: string) {
  if (!filter.endsWith("^")) return url.includes(filter);

  const needle = filter.slice(0, -1);
  const start = url.indexOf(needle);
  if (start === -1) return false;

  const end = start + needle.length;
  return end === url.length || /[^A-Za-z0-9_\-.%]/.test(url.charAt(end));
}

function matches(rule: Rule, request: Request) {
  const condition = rule.condition;
  const url = new URL(request.url);
  const initiator = new URL(request.initiator);

  return (
    rule.action.type === "block" &&
    hostMatches(initiator.hostname, condition.initiatorDomains) &&
    hostMatches(url.hostname, condition.requestDomains) &&
    (condition.resourceTypes?.includes(request.type) ?? false) &&
    (!condition.urlFilter || urlFilterMatches(request.url, condition.urlFilter))
  );
}

function matchingRules(request: Request, rules: Rule[] = buildSessionRules()) {
  return rules.filter((rule) => matches(rule, request));
}

describe("session rules", () => {
  it("covers exactly the three Grupo El Comercio sites", () => {
    expect(Object.keys(RULES_BY_SITE).sort()).toEqual([
      "diariocorreo.pe",
      "elcomercio.pe",
      "gestion.pe",
    ]);
    expect(buildSessionRules()).toHaveLength(9);
  });

  it.each(SITES)(
    "blocks the Piano script and execution requests initiated by $domain",
    ({ domain, article }) => {
      const initiator = article;

      expect(
        matchingRules({
          url: "https://cdn.tinypass.com/tinypass.min.js",
          initiator,
          type: "script",
        }),
      ).toHaveLength(1);

      for (const type of ["script", "xmlhttprequest"] as const) {
        expect(
          matchingRules({
            url: "https://experience.piano.io/xbuilder/experience/execute?aid=example",
            initiator,
            type,
          }),
          `${type} on ${domain}`,
        ).toHaveLength(1);
      }
    },
  );

  it.each(SITES)(
    "blocks the Arc engine on $domain when initiated by that site",
    ({ article, engine }) => {
      expect(
        matchingRules({ url: engine, initiator: article, type: "script" }),
      ).toHaveLength(1);
    },
  );

  it.each([
    {
      name: "the Piano script is requested as an image",
      request: {
        url: "https://cdn.tinypass.com/tinypass.min.js",
        initiator: "https://gestion.pe/economia/una-noticia-123456/",
        type: "image" as const,
      },
    },
    {
      name: "the Piano execution is initiated by another site",
      request: {
        url: "https://experience.piano.io/xbuilder/experience/execute?aid=example",
        initiator: "https://example.com/",
        type: "xmlhttprequest" as const,
      },
    },
    {
      name: "the Piano path continues after execute",
      request: {
        url: "https://experience.piano.io/xbuilder/experience/executevil?aid=example",
        initiator: "https://gestion.pe/economia/una-noticia-123456/",
        type: "xmlhttprequest" as const,
      },
    },
    {
      name: "the Arc engine is requested from another domain",
      request: {
        url: "https://example.com/pf/dist/engine/react.js",
        initiator: "https://gestion.pe/economia/una-noticia-123456/",
        type: "script" as const,
      },
    },
    {
      name: "the Arc engine path continues after react.js",
      request: {
        url: "https://gestion.pe/pf/dist/engine/react.jsx",
        initiator: "https://gestion.pe/economia/una-noticia-123456/",
        type: "script" as const,
      },
    },
  ])("does not block when $name", ({ request }) => {
    expect(matchingRules(request)).toHaveLength(0);
  });

  it("turns an added site into rules without code changes", () => {
    const rules = buildSessionRules({
      "example.com": [
        {
          requestDomains: ["cdn.tinypass.com"],
          resourceTypes: ["script"],
        },
      ],
    });

    expect(
      matchingRules(
        {
          url: "https://cdn.tinypass.com/tinypass.min.js",
          initiator: "https://www.example.com/news/story",
          type: "script",
        },
        rules,
      ),
    ).toHaveLength(1);
  });

  it("produces valid declarativeNetRequest rules", () => {
    const rules = buildSessionRules();
    const validResourceTypes = new Set<ResourceType>([
      "main_frame",
      "sub_frame",
      "stylesheet",
      "script",
      "image",
      "font",
      "object",
      "xmlhttprequest",
      "ping",
      "csp_report",
      "media",
      "websocket",
      "webtransport",
      "webbundle",
      "other",
    ]);

    expect(new Set(rules.map((rule) => rule.id)).size).toBe(rules.length);

    for (const rule of rules) {
      expect(Number.isInteger(rule.id)).toBe(true);
      expect(rule.id).toBeGreaterThanOrEqual(1);
      expect(rule.priority).toBe(1);
      expect(rule.action).toEqual({ type: "block" });

      const { condition } = rule;
      expect(condition.initiatorDomains).toHaveLength(1);
      expect(condition.requestDomains?.length).toBeGreaterThanOrEqual(1);
      expect(condition.resourceTypes?.length).toBeGreaterThanOrEqual(1);
      expect(condition.urlFilter && condition.regexFilter).toBeFalsy();

      for (const domain of [
        ...(condition.initiatorDomains ?? []),
        ...(condition.requestDomains ?? []),
      ]) {
        expect(domain).toBe(domain.toLowerCase());
        expect(domain).toMatch(/^[a-z0-9.-]+$/);
      }

      for (const type of condition.resourceTypes ?? []) {
        expect(validResourceTypes.has(type)).toBe(true);
      }
    }

    const urlFilters = rules
      .map((rule) => rule.condition.urlFilter)
      .filter((urlFilter) => urlFilter !== undefined);
    expect(urlFilters).toHaveLength(6);

    for (const urlFilter of urlFilters) {
      expect([...urlFilter].every((char) => char.charCodeAt(0) < 128)).toBe(
        true,
      );
      expect(urlFilter).not.toBe("");
    }
  });
});
