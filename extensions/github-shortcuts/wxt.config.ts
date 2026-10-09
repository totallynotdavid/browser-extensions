import { defineConfig } from "wxt";

export default defineConfig({
  imports: false,
  manifest: ({ browser }) => ({
    name: "GitHub Shortcuts",
    description:
      "Shows the keyboard shortcut next to each item in GitHub's navigation menus.",
    permissions: ["storage"],
    icons: { 128: "icon.png" },
    ...(browser === "firefox" && {
      browser_specific_settings: {
        gecko: {
          id: "github-shortcuts@totallynotdavid",
          data_collection_permissions: { required: ["none"] },
        },
      },
    }),
  }),
});
