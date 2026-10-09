import { showShortcuts } from "../../src/settings";

const checkbox = document.querySelector<HTMLInputElement>("#show-shortcuts");
if (!checkbox) throw new Error("popup is missing #show-shortcuts");

checkbox.checked = await showShortcuts.getValue();
checkbox.addEventListener("change", () => {
  void showShortcuts.setValue(checkbox.checked);
});
