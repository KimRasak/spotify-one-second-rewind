(() => {
  "use strict";

  const DEFAULT_REWIND_SECONDS = 1;
  const SETTING_KEY = "rewindSeconds";
  let rewindSeconds = DEFAULT_REWIND_SECONDS;
  const BUTTON_SELECTOR = [
    '[data-testid*="skip-back" i]',
    '[data-testid*="rewind" i]',
    '[data-testid*="backward" i]',
    'button[aria-label*="back" i][aria-label*="second" i]',
    'button[title*="back" i][title*="second" i]'
  ].join(", ");

  function validSeconds(value) {
    const seconds = Number(value);
    return Number.isInteger(seconds) && seconds >= 1 && seconds <= 600
      ? seconds
      : DEFAULT_REWIND_SECONDS;
  }

  chrome.storage.sync.get({ [SETTING_KEY]: DEFAULT_REWIND_SECONDS }, (settings) => {
    rewindSeconds = validSeconds(settings[SETTING_KEY]);
    relabelControls();
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync" || !changes[SETTING_KEY]) return;
    rewindSeconds = validSeconds(changes[SETTING_KEY].newValue);
    relabelControls();
  });

  function getActiveMedia() {
    const media = [...document.querySelectorAll("audio, video")];
    return media.find((element) => !element.paused && Number.isFinite(element.duration)) ||
      media.find((element) => Number.isFinite(element.duration)) || null;
  }

  function rewind() {
    const media = getActiveMedia();
    if (!media) return false;
    media.currentTime = Math.max(0, media.currentTime - rewindSeconds);
    return true;
  }

  function isRewindButton(element) {
    const button = element.closest?.(BUTTON_SELECTOR);
    if (!button) return false;
    const testId = button.getAttribute("data-testid") || "";
    const label = [button.getAttribute("aria-label"), button.getAttribute("title"), button.textContent]
      .filter(Boolean).join(" ").toLowerCase();
    return /(?:skip-back|rewind|backward)/i.test(testId) ||
      /(?:back|rewind).{0,20}(?:second|sec)/i.test(label);
  }

  function handleRewindClick(event) {
    if (!isRewindButton(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    rewind();
  }

  document.addEventListener("click", handleRewindClick, true);

  function relabelControls() {
    const secondsLabel = `${rewindSeconds} second${rewindSeconds === 1 ? "" : "s"}`;
    document.querySelectorAll('[data-testid*="skip-back" i], [data-testid*="rewind" i], [data-testid*="backward" i]')
      .forEach((button) => {
        ["aria-label", "title"].forEach((attribute) => {
          const value = button.getAttribute(attribute);
          if (value && /\d+\s*(seconds?|secs?)/i.test(value)) {
            button.setAttribute(attribute, value.replace(/\d+\s*(seconds?|secs?)/i, secondsLabel));
          }
        });
      });
  }

  const observer = new MutationObserver(relabelControls);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  relabelControls();
})();
