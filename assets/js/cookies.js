export function initCookies() {
  const banner = document.querySelector(".most-cookie");
  const overlay = document.querySelector(".most-cookie-overlay");
  const acceptBtn = document.querySelector(".most-cookie__accept");
  const denyBtn = document.querySelector(".most-cookie__deny");

  if (!banner || !overlay || !acceptBtn || !denyBtn) {
    console.warn("Cookie elements not found");
    return;
  }

  const consent = localStorage.getItem("cookieConsent");

  if (!consent) {
    banner.style.display = "block";
    overlay.style.display = "block";
    document.body.classList.add("cookies-locked");
  }

  function closeCookies(value) {
    localStorage.setItem("cookieConsent", value);
    banner.style.display = "none";
    overlay.style.display = "none";
    document.body.classList.remove("cookies-locked");
  }

  acceptBtn.addEventListener("click", () => closeCookies("accepted"));
  denyBtn.addEventListener("click", () => closeCookies("denied"));
}
