import { loaderDone } from './00-loader.js';

const STORAGE_KEY = 'cookie-consent';
const SHOW_DELAY = 500; // ms after the loader has left

function readChoice() {
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function storeChoice(choice) {
  try {
    window.localStorage.setItem(STORAGE_KEY, choice);
  } catch {
    // storage blocked: the banner is simply dismissed for this visit
  }
}

/** Shows the banner after the loader unless a choice is stored; accept/reject dismiss it for good. */
export function init() {
  const banner = document.querySelector('#cookie-root [data-cookie-banner]');
  if (!banner || readChoice()) return;

  const choose = (choice) => {
    storeChoice(choice);
    banner.classList.remove('is-visible');
  };
  banner.querySelector('[data-cookie-accept-all]')?.addEventListener('click', () => choose('accepted'));
  banner.querySelector('[data-cookie-reject-all]')?.addEventListener('click', () => choose('rejected'));

  loaderDone.then(() => window.setTimeout(() => banner.classList.add('is-visible'), SHOW_DELAY));
}
