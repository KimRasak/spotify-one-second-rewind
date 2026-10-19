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

  function seekBy(seconds) {
    const media = getActiveMedia();
    if (!media) return false;
    const end = Number.isFinite(media.duration) ? media.duration : Infinity;
    media.currentTime = Math.min(end, Math.max(0, media.currentTime + seconds));
    return true;
  }

  function rewind() {
    return seekBy(-rewindSeconds);
  }

  function forwardTwoSeconds() {
    return seekBy(2);
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

  function handlePlayerControlClick(event) {
    const forwardButton = event.target.closest?.('[data-spotify-custom-forward="true"]');
    if (forwardButton) {
      event.preventDefault();
      event.stopImmediatePropagation();
      forwardTwoSeconds();
      return;
    }

    if (!isRewindButton(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    rewind();
  }

  document.addEventListener("click", handlePlayerControlClick, true);

  function makeRewindIcon() {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");
    svg.dataset.spotifyCustomRewindIcon = String(rewindSeconds);

    const arrow = document.createElementNS(namespace, "path");
    arrow.setAttribute("d", "M8.7 6.2V3L3.5 8.2l5.2 5.2v-3c4.7-2.1 9.3.5 9.3 5.1 0 1.3-.4 2.6-1.1 3.6");
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("stroke-linecap", "round");
    arrow.setAttribute("stroke-linejoin", "round");

    const number = document.createElementNS(namespace, "text");
    number.setAttribute("x", "13.6");
    number.setAttribute("y", "18.4");
    number.setAttribute("text-anchor", "middle");
    number.setAttribute("fill", "currentColor");
    number.setAttribute("font-size", rewindSeconds > 99 ? "6" : rewindSeconds > 9 ? "7.5" : "9");
    number.setAttribute("font-family", "Arial, sans-serif");
    number.setAttribute("font-weight", "700");
    number.textContent = String(rewindSeconds);

    svg.append(arrow, number);
    return svg;
  }

  function makeForwardIcon() {
    const namespace = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(namespace, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("aria-hidden", "true");

    const arrow = document.createElementNS(namespace, "path");
    arrow.setAttribute("d", "M15.3 6.2V3l5.2 5.2-5.2 5.2v-3C10.6 8.3 6 10.9 6 15.5c0 1.3.4 2.6 1.1 3.6");
    arrow.setAttribute("stroke", "currentColor");
    arrow.setAttribute("stroke-width", "2");
    arrow.setAttribute("stroke-linecap", "round");
    arrow.setAttribute("stroke-linejoin", "round");

    const number = document.createElementNS(namespace, "text");
    number.setAttribute("x", "10.4");
    number.setAttribute("y", "18.4");
    number.setAttribute("text-anchor", "middle");
    number.setAttribute("fill", "currentColor");
    number.setAttribute("font-size", "9");
    number.setAttribute("font-family", "Arial, sans-serif");
    number.setAttribute("font-weight", "700");
    number.textContent = "2";
    svg.append(arrow, number);
    return svg;
  }

  function addForwardButton(rewindButton) {
    const parent = rewindButton.parentElement;
    if (!parent || parent.querySelector(':scope > [data-spotify-custom-forward="true"]')) return;

    // Copy Spotify's button classes and attributes for consistent layout and
    // hover/focus styling, then replace its contents and semantics.
    const forwardButton = rewindButton.cloneNode(false);
    forwardButton.removeAttribute("id");
    forwardButton.removeAttribute("data-testid");
    forwardButton.dataset.spotifyCustomForward = "true";
    forwardButton.setAttribute("aria-label", "Forward 2 seconds");
    forwardButton.setAttribute("title", "Forward 2 seconds");
    forwardButton.append(makeForwardIcon());
    rewindButton.insertAdjacentElement("afterend", forwardButton);
  }

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

        // Spotify's usual 15-second rewind glyph is replaced with an arrow
        // that displays the user's currently selected rewind interval.
        const icon = button.querySelector("svg");
        if (icon && icon.dataset.spotifyCustomRewindIcon !== String(rewindSeconds)) {
          icon.replaceWith(makeRewindIcon());
        }
        addForwardButton(button);
      });
  }

  const observer = new MutationObserver(relabelControls);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  relabelControls();
})();
