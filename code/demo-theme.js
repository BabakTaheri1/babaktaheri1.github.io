(() => {
  "use strict";
  const root = document.documentElement;
  const system = matchMedia("(prefers-color-scheme: dark)");
  const valid = (value) => ["light", "dark", "system"].includes(value);
  let setting = "system";
  try {
    const site = localStorage.getItem("theme");
    const legacy = localStorage.getItem("gridOpsTheme");
    setting = valid(site) ? site : valid(legacy) ? legacy : "system";
  } catch (_) {}

  const colors = {};
  const keys = [
    "bg",
    "surface",
    "raised",
    "ink",
    "muted",
    "faint",
    "line",
    "grid",
    "accent",
    "accent-soft",
    "blue",
    "green",
    "amber",
    "orange",
    "purple",
    "red",
  ];
  function refreshColors() {
    const style = getComputedStyle(root);
    keys.forEach((key) => {
      const value = style.getPropertyValue("--demo-" + key).trim();
      // The production CSS compressor can turn #ffffff into #fff.
      // Canvas alpha suffixes require the full six-digit form.
      colors[key] = /^#[a-f\d]{3}$/i.test(value)
        ? "#" +
          value
            .slice(1)
            .split("")
            .map((digit) => digit + digit)
            .join("")
        : value;
    });
  }
  function label() {
    document.querySelectorAll("[data-demo-theme], #themeButton").forEach((button) => {
      const next = root.dataset.theme === "dark" ? "light" : "dark";
      button.textContent = next === "dark" ? "Dark theme" : "Light theme";
      button.setAttribute("aria-label", "Switch to " + next + " theme");
    });
  }
  function apply(notify = true) {
    root.dataset.theme = setting === "system" ? (system.matches ? "dark" : "light") : setting;
    root.dataset.themeSetting = setting;
    refreshColors();
    label();
    if (notify) document.dispatchEvent(new CustomEvent("demothemechange", { detail: { theme: root.dataset.theme } }));
  }
  function toggle() {
    setting = root.dataset.theme === "dark" ? "light" : "dark";
    try {
      localStorage.setItem("theme", setting);
    } catch (_) {}
    apply();
  }
  function alpha(key, opacity) {
    const hex = colors[key];
    return (
      hex +
      Math.round(Math.max(0, Math.min(1, opacity)) * 255)
        .toString(16)
        .padStart(2, "0")
    );
  }
  // The renderers read this cached palette, avoiding style queries on each frame.
  window.DemoTheme = { colors, alpha, toggle, refreshColors };
  apply(false);
  document.addEventListener("DOMContentLoaded", () => {
    refreshColors();
    label();
    document.querySelectorAll("[data-demo-theme], #themeButton").forEach((button) => button.addEventListener("click", toggle));
  });
  system.addEventListener("change", () => {
    if (setting === "system") apply();
  });
  window.addEventListener("storage", (event) => {
    if (event.key !== "theme" && event.key !== null) return;
    setting = valid(event.newValue) ? event.newValue : "system";
    apply();
  });
})();
