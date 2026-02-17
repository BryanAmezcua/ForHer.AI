const DEBUG = process.env.DEBUG_PIPELINE === 'true';

export function debugLog(...args) {
  if (DEBUG) console.log(...args);
}
