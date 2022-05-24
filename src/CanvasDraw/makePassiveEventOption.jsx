// Determines if the browser supprots passive events
let passiveSupported = false;
try {
  const options = {
    get passive() {
      passiveSupported = true;
      return false;
    }
  };
  window.addEventListener("test", options, options);
  window.removeEventListener("test", options, options);
} catch(e) {
  passiveSupported = false;
}

export default function makePassiveEventOption(passive) {
  return passiveSupported ? { passive } : passive;
}
