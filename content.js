(() => {
  "use strict";

  const REWIND_SECONDS = 1;
  const BUTTON_SELECTOR = [
    '[data-testid*="skip-back" i]',
    '[data-testid*="rewind" i]',
    '[data-testid*="backward" i]',
    'button[aria-label*="back" i][aria-label*="second" i]',
    'button[title*="back" i][title*="second" i]'
  ].join(", ");

  function getActiveMedia() {
    const media = [...document.querySelectorAll("audio, video")];
    return media.find((element) => !element.paused && Number.isFinite(element.duration)) ||
      media.find((element) => Number.isFinite(element.duration)) ||
      null;
  }

  function rewindOneSecond() {
    const media = getActiveMedia();
    if (!media) return false;

    // Spotify owns playback state, but seeking the underlying media element is
    // reflected by its player just like a normal seek operation.
    media.currentTime = Math.max(0, media.currentTime - REWIND_SECONDS);
    return true;
  }

  function isRewindButton(element) {
    const button = element.closest?.(BUTTON_SELECTOR);
    if (!button) return false;

    const testId = button.getAttribute("data-testid") || "";
    const label = [
      button.getAttribute("aria-label"),
      button.getAttribute("title"),
      button.textContent
    ].filter(Boolean).join(" ").toLowerCase();

    // Stable test IDs work regardless of Spotify's UI language. The label
    // fallback supports the currently exposed English accessibility strings.
    return /(?:skip-back|rewind|backward)/i.test(testId) ||
      /(?:back|rewind).{0,20}(?:second|sec)/i.test(label);
  }

  function handleRewindClick(event) {
    if (!isRewindButton(event.target)) return;

    // Do not let Spotify's original handler apply its 15-second seek.
    event.preventDefault();
    event.stopImmediatePropagation();
    rewindOneSecond();
  }

  document.addEventListener("click", handleRewindClick, true);

  // Keep the accessible tooltip truthful when Spotify renders or replaces
  // controls during navigation. This is cosmetic; matching does not rely on it.
  function relabelControls() {
    document.querySelectorAll('[data-testid*="skip-back" i], [data-testid*="rewind" i], [data-testid*="backward" i]')
      .forEach((button) => {
        const ariaLabel = button.getAttribute("aria-label");
        if (ariaLabel && /15\s*(seconds?|secs?)/i.test(ariaLabel)) {
          button.setAttribute("aria-label", ariaLabel.replace(/15\s*(seconds?|secs?)/i, "1 second"));
        }
        const title = button.getAttribute("title");
        if (title && /15\s*(seconds?|secs?)/i.test(title)) {
          button.setAttribute("title", title.replace(/15\s*(seconds?|secs?)/i, "1 second"));
        }
      });
  }

  const observer = new MutationObserver(relabelControls);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  relabelControls();
})();
