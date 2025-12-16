export function initCookies() {
  const cookieAlert = document.querySelector(".most-cookie");
  const acceptButton = document.querySelector(".most-cookie__accept");
  if (!cookieAlert || !acceptButton) return;

  const cookieName = "mostCookiesAccepted";

  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24*60*60*1000);
    const cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = cookie;
  }

  function getCookie(name) {
    const encodedName = encodeURIComponent(name) + "=";
    const cookies = document.cookie.split('; ');
    for (const c of cookies) {
      if (c.indexOf(encodedName) === 0) return decodeURIComponent(c.substring(encodedName.length));
    }
    return null;
  }

  if (!getCookie(cookieName)) {
    cookieAlert.classList.add('show');
  }

  acceptButton.addEventListener('click', () => {
    setCookie(cookieName, 'true', 365);
    cookieAlert.classList.remove('show');
  });
}
