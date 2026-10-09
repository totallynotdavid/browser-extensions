import { storage } from "wxt/utils/storage";

export const showShortcuts = storage.defineItem<boolean>(
  "local:showShortcuts",
  {
    fallback: true,
  },
);
