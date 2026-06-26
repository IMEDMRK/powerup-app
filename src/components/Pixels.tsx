import Script from "next/script";
import { GoogleAnalytics } from '@next/third-parties/google';

export default function Pixels({ settings, page }: { settings: any, page?: any }) {
  if (!settings) return null;

  // Extract and combine Meta Pixels
  const rawMetaPixels = [
    ...(settings.metaPixelId ? settings.metaPixelId.split(',') : []),
    ...(page?.metaPixelIds ? page.metaPixelIds.split(',') : [])
  ];
  const metaPixels = Array.from(new Set(rawMetaPixels.map(p => p.trim()).filter(Boolean)));

  // Extract and combine TikTok Pixels
  const rawTiktokPixels = [
    ...(settings.tiktokPixelId ? settings.tiktokPixelId.split(',') : []),
    ...(page?.tiktokPixelIds ? page.tiktokPixelIds.split(',') : [])
  ];
  const tiktokPixels = Array.from(new Set(rawTiktokPixels.map(p => p.trim()).filter(Boolean)));

  return (
    <>
      {/* Google Analytics */}
      {settings.googleAnalyticsId && (
        <GoogleAnalytics gaId={settings.googleAnalyticsId} />
      )}

      {/* Meta Pixel */}
      {metaPixels.length > 0 && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            ${metaPixels.map(id => `fbq('init', '${id}');`).join('\n            ')}
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {/* TikTok Pixel */}
      {tiktokPixels.length > 0 && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ${tiktokPixels.map(id => `ttq.load('${id}');`).join('\n              ')}
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}
