const KEY = "rewindSeconds";
const DEFAULT = 1;
const input = document.querySelector("#seconds");
const status = document.querySelector("#status");
const presetButtons = [...document.querySelectorAll("[data-seconds]")];

function setActive(seconds) {
  presetButtons.forEach((button) => button.classList.toggle("active", Number(button.dataset.seconds) === seconds));
}
function save(seconds) {
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 600) {
    status.textContent = "请输入 1 到 600 之间的整数。";
    input.focus();
    return;
  }
  chrome.storage.sync.set({ [KEY]: seconds }, () => {
    input.value = seconds;
    setActive(seconds);
    status.textContent = `已设为回退 ${seconds} 秒。`;
  });
}
chrome.storage.sync.get({ [KEY]: DEFAULT }, (settings) => {
  const seconds = Number(settings[KEY]) || DEFAULT;
  input.value = seconds;
  setActive(seconds);
});
presetButtons.forEach((button) => button.addEventListener("click", () => save(Number(button.dataset.seconds))));
document.querySelector("#settings-form").addEventListener("submit", (event) => {
  event.preventDefault();
  save(Number(input.value));
});
