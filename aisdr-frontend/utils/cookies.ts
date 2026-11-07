// utils/cookies.ts
export const setCookie = (name: string, value: string, days: number = 1) => {
    try {
        
   
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
   } catch (error) {
    console.error('Error setting cookie:', error);
    }
};

export const getCookie = (name: string) => {
  const cookieName = `${name}=`;
  console.log(cookieName,'cookieName');
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookieArray = decodedCookie.split(';');
  
  for (let i = 0; i < cookieArray.length; i++) {
    let cookie = cookieArray[i];
    while (cookie.charAt(0) === ' ') {
      cookie = cookie.substring(1);
    }
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return '';
};
export const getCookieFromServer = (name: string, cookieHeader?: string | null) => {
  if (!cookieHeader) return '';
  
  const cookieName = `${name}=`;
  const cookies = cookieHeader.split(';');
  
  for (const cookie of cookies) {
    const trimmed = cookie.trim();
    if (trimmed.startsWith(cookieName)) {
      return trimmed.substring(cookieName.length);
    }
  }
  return '';
};
export const deleteCookie = (name: string) => {
  const hostParts = window.location.hostname.split('.');
  const domain = hostParts.length > 1 ? 
    `.${hostParts.slice(-2).join('.')}` : 
    hostParts[0];
  
  // Delete cookie with domain and path
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}; SameSite=Lax; Secure`;
  
  // Delete cookie without domain (for localhost)
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Lax; Secure`;
};