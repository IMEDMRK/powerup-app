import Script from "next/script";

export default function PagePixels({ page }: { page: any }) {
  if (!page) return null;

  const rawMetaPixels = page.metaPixelIds ? page.metaPixelIds.split(',') : [];
  const metaPixels = Array.from(new Set(rawMetaPixels.map((p:string) => p.trim()).filter(Boolean)));

  const rawTiktokPixels = page.tiktokPixelIds ? page.tiktokPixelIds.split(',') : [];
  const tiktokPixels = Array.from(new Set(rawTiktokPixels.map((p:string) => p.trim()).filter(Boolean)));

  if (metaPixels.length === 0 && tiktokPixels.length === 0) return null;

  return (
    <>
      {/* Meta Pixel for Page */}
      {metaPixels.length > 0 && (
        <Script id={`meta-pixel-page-${page.id}`} strategy="afterInteractive">
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

      {/* TikTok Pixel for Page */}
      {tiktokPixels.length > 0 && (
        <Script id={`tiktok-pixel-page-${page.id}`} strategy="afterInteractive">
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
