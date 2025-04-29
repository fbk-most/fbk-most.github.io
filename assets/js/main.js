// mostMaybeCookieAlert shows the cookie alert if it hasn't been shown before.
function mostMaybeCookieAlert() {
  // Get the cookie alert elements
  const cookieAlert = document.querySelector(".most-cookie-alert");
  const acceptButton = document.querySelector(".most-cookie-accept");

  // Function to set cookie with proper encoding
  function setCookie(name, value, days) {
    const encodedName = encodeURIComponent(name);
    const encodedValue = encodeURIComponent(value);
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    const cookie = [
      `${encodedName}=${encodedValue}`,
      `expires=${date.toUTCString()}`,
      "path=/",
      "SameSite=Lax",
    ].join("; ");

    document.cookie = cookie;
  }

  // Function to get cookie with proper decoding
  function getCookie(name) {
    const encodedName = encodeURIComponent(name);
    const cookies = document.cookie.split(";");

    for (const cookie of cookies) {
      const [cookieName, cookieValue] = cookie.trim().split("=");
      if (cookieName === encodedName) {
        return decodeURIComponent(cookieValue);
      }
    }

    return null;
  }

  // Define the cookie name
  const cookieName = "mostCookiesAccepted";

  // Show the alert if the cookie hasn't been set
  if (!getCookie(cookieName)) {
    cookieAlert.classList.remove("d-none");
  }

  // Handle the accept button click
  acceptButton.addEventListener("click", function () {
    setCookie(cookieName, "true", 365);
    cookieAlert.classList.add("d-none");
  });
}

// Ensure the cookie alert is shown when needed
document.addEventListener("DOMContentLoaded", mostMaybeCookieAlert);
