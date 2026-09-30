/**
 * Safely opens external URLs on both Web and Android APK / WebView environments.
 * Ensures government websites open in the native Chrome / System Browser
 * so PDFs, cookies, SSL certificates, and e-services function properly.
 */
export const openExternalUrl = (url: string) => {
  if (!url) return;

  let targetUrl = url.trim();

  // Fix expired/outdated SSL domains (e.g. www.nidw.gov.bd -> services.nidw.gov.bd/nid-pub/)
  if (targetUrl.includes('nidw.gov.bd') && !targetUrl.includes('services.nidw.gov.bd')) {
    targetUrl = 'https://services.nidw.gov.bd/nid-pub/';
  } else if (targetUrl.includes('www.epassport.gov.bd')) {
    targetUrl = targetUrl.replace('www.epassport.gov.bd', 'epassport.gov.bd');
  } else if (targetUrl.includes('www.police.gov.bd')) {
    targetUrl = targetUrl.replace('www.police.gov.bd', 'police.gov.bd');
  } else if (targetUrl.includes('www.health.gov.bd')) {
    targetUrl = targetUrl.replace('www.health.gov.bd', 'health.gov.bd');
  } else if (targetUrl.includes('www.supremecourt.gov.bd')) {
    targetUrl = targetUrl.replace('www.supremecourt.gov.bd', 'supremecourt.gov.bd');
  } else if (targetUrl.includes('www.upension.gov.bd')) {
    targetUrl = targetUrl.replace('www.upension.gov.bd', 'upension.gov.bd');
  } else if (targetUrl.includes('www.mygov.bd')) {
    targetUrl = targetUrl.replace('www.mygov.bd', 'mygov.bd');
  }

  if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
    targetUrl = 'https://' + targetUrl;
  }

  try {
    // 1. Check if running inside Capacitor native app
    if ((window as any).Capacitor?.isNativePlatform?.() && (window as any).Capacitor?.Plugins?.Browser) {
      (window as any).Capacitor.Plugins.Browser.open({ url: targetUrl });
      return;
    }

    // 2. Try window.open with '_system' (Android native browser intent target)
    const opened = window.open(targetUrl, '_system');

    // 3. Fallback if window.open returns null or fails
    if (!opened || opened.closed || typeof opened.closed === 'undefined') {
      const a = document.createElement('a');
      a.href = targetUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  } catch (err) {
    console.error('Error opening external URL:', err);
    window.location.href = targetUrl;
  }
};
