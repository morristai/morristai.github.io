// Collapse long code blocks on single-post pages.
// Scope: only .single .content (article body), not home/list pages.
// Behavior:
//   - Code blocks with > COLLAPSE_THRESHOLD lines get collapsed on load.
//   - Preview shows PREVIEW_LINES lines, hard-cut with a fade-out mask.
//   - An Expand button toggles between expanded/collapsed.
// Hooks into the DoIt theme's existing .code-block markup; CSS in
// assets/css/_custom.scss handles the visual clipping via .cc-collapsed.

(function () {
  var COLLAPSE_THRESHOLD = 15;
  var PREVIEW_LINES = 8;

  function countLines(chroma) {
    var text = chroma.textContent || "";
    // Trim trailing newline so a block ending with "\n" isn't over-counted.
    if (text.charAt(text.length - 1) === "\n") {
      text = text.slice(0, -1);
    }
    return text.split("\n").length;
  }

  function labelFor(isCollapsed) {
    return isCollapsed ? "Expand" : "Collapse";
  }

  function initBlock(codeBlock) {
    var chroma = codeBlock.querySelector("code.chroma");
    if (!chroma) return;
    if (countLines(chroma) <= COLLAPSE_THRESHOLD) return;

    // The theme auto-closes blocks over params.code.maxShownLines (default 50)
    // via .is-closed, which collapses code.chroma to max-height:0 through a
    // Tailwind utility. Force .is-open so our own preview height wins.
    codeBlock.classList.remove("is-closed");
    codeBlock.classList.add("is-open");

    codeBlock.classList.add("cc-collapsible", "cc-collapsed");

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "cc-toggle";
    toggle.textContent = labelFor(true);
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", function () {
      var collapsed = codeBlock.classList.toggle("cc-collapsed");
      toggle.textContent = labelFor(collapsed);
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });

    codeBlock.appendChild(toggle);
  }

  function init() {
    var scope = document.querySelector(".single .content");
    if (!scope) return;
    scope.querySelectorAll(".code-block").forEach(initBlock);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
