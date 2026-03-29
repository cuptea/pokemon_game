import { mountAppShell } from "./app/AppShell";

const root = document.querySelector<HTMLDivElement>("#app");

if (!root) {
  throw new Error("App root was not found.");
}

document.body.style.margin = "0";
document.body.style.background = "#08131f";
document.body.style.fontFamily = "Verdana, sans-serif";
root.style.width = "100vw";
root.style.height = "100vh";
root.style.overflow = "hidden";

mountAppShell(root);
