import { defineConfig } from "wxt";

export default defineConfig({
  imports: false,
  manifest: ({ browser }) => ({
    name: "Peru Press",
    description:
      "Removes the client-side paywall on Grupo El Comercio news sites.",
    permissions: ["declarativeNetRequest"],
    host_permissions: [
      "https://*.diariocorreo.pe/*",
      "https://*.elcomercio.pe/*",
      "https://*.gestion.pe/*",
    ],
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "peru-press@totallynotdavid",
          data_collection_permissions: { required: ["none"] },
        },
      },
    }),
  }),
});
