import { loaderDone } from './00-loader.js';

const STORAGE_KEY = 'cookie-consent';
const SHOW_DELAY = 500; // ms after the loader has left

function readChoice() {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeChoice(choice) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // storage blocked: the banner is simply dismissed for this visit
  }
}

/** Shows the banner after the loader unless a choice was made this session; accept/reject dismiss it. */
export function init() {
  const banner = document.querySelector('#cookie-root [data-cookie-banner]');
  if (!banner || readChoice()) return;

  const choose = (choice) => {
    storeChoice(choice);
    // hand keyboard focus back to the page before the banner leaves the tab order
    if (banner.contains(document.activeElement)) {
      document.querySelector('.header-logo-item')?.focus({ preventScroll: true });
    }
    banner.classList.remove('is-visible');
  };
  banner.querySelector('[data-cookie-accept-all]')?.addEventListener('click', () => choose('accepted'));
  banner.querySelector('[data-cookie-reject-all]')?.addEventListener('click', () => choose('rejected'));
  banner.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') choose('dismissed');
  });

  loaderDone.then(() =>
    window.setTimeout(() => {
      banner.hidden = false;
      void banner.offsetWidth; // commit the hidden pose so the entrance transitions
      banner.classList.add('is-visible');
    }, SHOW_DELAY),
  );
}
