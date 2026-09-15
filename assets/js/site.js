(function(){
  const CTA_SELECTOR = [
    '[data-design-role="cta"]',
    '.button-primary','.btn-primary','.opp-cta','.svp-hero-button','.formsenderCSS_button','.spp-cta','.pit-glass-cta','.pp-flip-cta','.btn-flip','.btn-flipFake',
    '.fsp-result a[data-fsp-cta]',
    'a[class*="__cta"]','button[class*="__cta"]','a[class*="-cta"]','button[class*="-cta"]','a[class*="_cta"]','button[class*="_cta"]',
    'a[class*="call-to-action"]','button[class*="call-to-action"]'
  ].join(',');
  function buttonEffect(){return cssVar(document.documentElement,'--action-button-effect','depth')||'depth'}
  function buttonClickEffect(){return cssVar(document.documentElement,'--action-button-click-effect','press')||'press'}
  function decorateCTA(el){
    if(!(el instanceof Element))return;
    el.classList.add('imobify-design-cta');
    el.dataset.imobifyEffect=buttonEffect();
  }
  function parseColor(value){
    const raw=String(value||'').trim();
    let m=raw.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if(m){let hex=m[1];if(hex.length===3)hex=hex.split('').map(c=>c+c).join('');return {r:parseInt(hex.slice(0,2),16),g:parseInt(hex.slice(2,4),16),b:parseInt(hex.slice(4,6),16)}}
    m=raw.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/i);
    if(m)return {r:+m[1],g:+m[2],b:+m[3]};
    return null;
  }
  function hex(rgb){const h=v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0');return '#'+h(rgb.r)+h(rgb.g)+h(rgb.b)}
  function lum(value){const rgb=parseColor(value);if(!rgb)return null;const c=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)};return c(rgb.r)*.2126+c(rgb.g)*.7152+c(rgb.b)*.0722}
  function ratio(a,b){const x=lum(a),y=lum(b);if(x==null||y==null)return 1;return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
  function mix(a,b,t){const x=parseColor(a),y=parseColor(b);if(!x||!y)return a;t=Math.max(0,Math.min(1,Number(t)||0));return hex({r:x.r+(y.r-x.r)*t,g:x.g+(y.g-x.g)*t,b:x.b+(y.b-x.b)*t})}
  function safest(background){return ratio('#ffffff',background)>=ratio('#000000',background)?'#ffffff':'#000000'}
  function ensureContrast(preferred,background,minimum){
    minimum=Number(minimum)||4.5;
    if(!parseColor(preferred)||!parseColor(background)||ratio(preferred,background)>=minimum)return preferred;
    const target=safest(background);
    for(let step=1;step<=20;step++){const candidate=mix(preferred,target,step/20);if(ratio(candidate,background)>=minimum)return candidate}
    return target;
  }
  function cssVar(el,name,fallback=''){return (getComputedStyle(el).getPropertyValue(name)||fallback).trim()}
  function contrastEnabled(){return cssVar(document.documentElement,'--contrast-enabled','1')!=='0'}
  function contrastMinimum(){return Number(cssVar(document.documentElement,'--contrast-min','4.5'))||4.5}
  function setSafe(el,name,preferred,background){if(!el||!contrastEnabled())return;el.style.setProperty(name,ensureContrast(preferred,background,contrastMinimum()))}
  function applyDesignSemantics(root){
    const scope=root&&root.querySelectorAll?root:document;
    const pluginRoots=[];
    if(scope instanceof Element){
      const owner=scope.closest('[data-plugin]');
      if(owner)pluginRoots.push(owner);
    }
    if(scope.querySelectorAll)scope.querySelectorAll('[data-plugin]').forEach(el=>pluginRoots.push(el));
    [...new Set(pluginRoots)].forEach(function(plugin){
      plugin.querySelectorAll('h1,h2,h3,h4,h5,h6,[data-design-role=\"title\"]').forEach(function(el){
        el.classList.add('imobify-design-title');
      });
      plugin.querySelectorAll('.hero-copy,.svp-hero-subtitle,[class$=\"__subtitle\"],[class$=\"-subtitle\"],[class$=\"_subtitle\"],[class$=\"__subheading\"],[class$=\"-subheading\"],[class$=\"_subheading\"],[data-design-role=\"subtitle\"]').forEach(function(el){
        el.classList.add('imobify-design-subtitle');
      });
      plugin.querySelectorAll('h1,h2').forEach(function(heading){
        const next=heading.nextElementSibling;
        if(next&&next.matches('p:not(.eyebrow):not(.legal)'))next.classList.add('imobify-design-subtitle');
      });
      plugin.querySelectorAll(CTA_SELECTOR).forEach(decorateCTA);
      plugin.querySelectorAll('.bbp[data-project-profile=\"true\"] .bbp__cta').forEach(decorateCTA);
    });
  }

  function applyContrastGuards(root){
    if(!contrastEnabled())return;
    const scope=root&&root.querySelectorAll?root:document;
    const include=(selector)=>{const out=[];if(scope instanceof Element&&scope.matches(selector))out.push(scope);scope.querySelectorAll(selector).forEach(el=>out.push(el));return out};

    include('.pit-section').forEach(el=>{
      const accent=cssVar(el,'--pit-accent',cssVar(document.documentElement,'--primary','#16a34a'));
      const surface=cssVar(document.documentElement,'--surface','#ffffff');
      setSafe(el,'--pit-accent-on-surface',accent,surface);
      setSafe(el,'--pit-accent-contrast',safest(accent),accent);
    });

    include('.iwfp-widget').forEach(el=>{
      const bg=cssVar(el,'--iwfp-bg','#25d366');
      setSafe(el,'--iwfp-icon-safe',cssVar(el,'--iwfp-icon','#ffffff'),bg);
      setSafe(el,'--iwfp-text-safe',cssVar(el,'--iwfp-text','#ffffff'),bg);
    });

    include('.imobify-menu-pro').forEach(el=>{
      const text=cssVar(el,'--imp-text','#ffffff'),accent=cssVar(el,'--imp-accent','#d4af37');
      const bg=cssVar(el,'--imp-bg','#0a1628'),scroll=cssVar(el,'--imp-bg-scroll',bg),mobile=cssVar(el,'--imp-mobile-bg',bg);
      setSafe(el,'--imp-text-safe',text,bg);setSafe(el,'--imp-text-scroll-safe',text,scroll);setSafe(el,'--imp-text-mobile-safe',text,mobile);
      setSafe(el,'--imp-accent-safe',accent,bg);setSafe(el,'--imp-accent-scroll-safe',accent,scroll);setSafe(el,'--imp-accent-mobile-safe',accent,mobile);
      setSafe(el,'--imp-accent-contrast',safest(accent),accent);
    });
  }

  function clearButtonMotion(el){if(!el)return;el.style.removeProperty('--imobify-button-x');el.style.removeProperty('--imobify-button-y')}
  document.addEventListener('pointermove',function(event){
    const el=event.target.closest?.('.imobify-design-cta');
    if(!el||buttonEffect()!=='magnetic'||matchMedia('(prefers-reduced-motion: reduce)').matches||!matchMedia('(pointer:fine)').matches)return;
    const rect=el.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const x=((event.clientX-rect.left)/rect.width-.5)*10;
    const y=((event.clientY-rect.top)/rect.height-.5)*8;
    el.style.setProperty('--imobify-button-x',x.toFixed(2)+'px');
    el.style.setProperty('--imobify-button-y',y.toFixed(2)+'px');
  },{passive:true});
  document.addEventListener('pointerout',function(event){
    const el=event.target.closest?.('.imobify-design-cta');
    if(el&&!el.contains(event.relatedTarget))clearButtonMotion(el);
  },{passive:true});
  document.addEventListener('click',function(event){
    const el=event.target.closest?.('.imobify-design-cta');
    if(!el||el.matches('[disabled],[aria-disabled="true"]'))return;
    const mode=buttonClickEffect();
    if(mode==='ripple'){
      const rect=el.getBoundingClientRect();
      const ripple=document.createElement('span');
      ripple.className='imobify-button-ripple';
      const restorePosition=getComputedStyle(el).position==='static';
      if(restorePosition)el.style.position='relative';
      el.classList.add('imobify-ripple-active');
      const cx=Number.isFinite(event.clientX)&&event.clientX!==0?event.clientX-rect.left:rect.width/2;
      const cy=Number.isFinite(event.clientY)&&event.clientY!==0?event.clientY-rect.top:rect.height/2;
      ripple.style.left=cx+'px'; ripple.style.top=cy+'px';
      el.appendChild(ripple);setTimeout(()=>{ripple.remove();el.classList.remove('imobify-ripple-active');if(restorePosition)el.style.removeProperty('position')},650);
    }else if(mode==='bounce'||mode==='flash'){
      const cls=mode==='bounce'?'imobify-button-click-bounce':'imobify-button-click-flash';
      el.classList.remove(cls);void el.offsetWidth;el.classList.add(cls);setTimeout(()=>el.classList.remove(cls),430);
    }
  });

  document.addEventListener('click',function(event){
    if(event.__imobifyFloatingHandled)return;
    const link=event.target.closest?.('[href^="#"]');
    if(!link)return;
    const href=String(link.getAttribute('href')||'').trim();
    if(!href||href==='#')return;
    const floating=window.ImobifyFloating?.get?.(href);
    if(floating){
      event.preventDefault();
      window.ImobifyFloating.open(href,link);
      return;
    }
    let target=null;
    try{target=document.querySelector(href)}catch(_error){return}
    if(target){event.preventDefault();target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});}
  });
  window.Imobify={
    track:function(name,data){
      window.dataLayer=window.dataLayer||[];
      window.dataLayer.push({event:name,...(data||{})});
    },
    contrastRatio:ratio,
    ensureContrast:ensureContrast,
    applyContrastGuards:applyContrastGuards,
    applyDesignSemantics:applyDesignSemantics,
    registerCTA:function(el){decorateCTA(el);return el},
    refreshDesign:function(root){applyDesignSemantics(root||document);applyContrastGuards(root||document)}
  };
  const scan=()=>{applyDesignSemantics(document);applyContrastGuards(document)};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',scan);else scan();
  new MutationObserver(function(mutations){
    mutations.forEach(function(mutation){mutation.addedNodes.forEach(function(node){if(node instanceof Element){applyDesignSemantics(node);applyContrastGuards(node)}})});
  }).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-design-role']});
})();


(function () {
  "use strict";

  const SELECTOR = '[data-plugin="parallax"] .svp-root';
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const bool = (value) => String(value).toLowerCase() === "true";
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;

  function normalizeMediaSource(value) {
    const source = String(value || "").trim();
    if (!source) return "";
    try {
      const url = new URL(source, document.baseURI);
      if (url.hostname.toLowerCase() === "github.com") {
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 5 && (parts[2] === "raw" || parts[2] === "blob")) {
          const [owner, repo, , ...rest] = parts;
          if (owner && repo && rest.length) return `https://raw.githubusercontent.com/${owner}/${repo}/${rest.join("/")}${url.search || ""}`;
        }
      }
    } catch (_) {}
    return source;
  }

  function mediaMime(source) {
    const raw = String(source || "");
    const data = /^data:(video\/[^;,]+)/i.exec(raw);
    if (data) return data[1].toLowerCase();
    const clean = raw.split(/[?#]/)[0].toLowerCase();
    if (clean.endsWith(".webm")) return "video/webm";
    if (clean.endsWith(".mp4") || clean.endsWith(".m4v")) return "video/mp4";
    if (clean.endsWith(".mov")) return "video/quicktime";
    if (clean.endsWith(".ogv") || clean.endsWith(".ogg")) return "video/ogg";
    return "";
  }

  function mediaDuration(video) {
    const direct = Number(video?.duration);
    if (Number.isFinite(direct) && direct > 0) return direct;
    try {
      if (video?.seekable?.length) {
        const end = Number(video.seekable.end(video.seekable.length - 1));
        if (Number.isFinite(end) && end > 0) return end;
      }
    } catch (_) {}
    try {
      if (video?.buffered?.length) {
        const end = Number(video.buffered.end(video.buffered.length - 1));
        if (Number.isFinite(end) && end > 0) return end;
      }
    } catch (_) {}
    return 0;
  }

  function safeJSON(raw, fallback) {
    try { return JSON.parse(raw || ""); } catch (error) { console.warn("[Parallax] JSON inválido:", error); return fallback; }
  }

  function escapeHTML(value) {
    const node = document.createElement("div");
    node.textContent = String(value == null ? "" : value);
    return node.innerHTML;
  }

  function iconMarkup(value) {
    const raw = String(value == null ? "" : value).trim();
    if (!raw) return "";
    if (/^(?:fa[bsrltd]?\s+)?fa-[a-z0-9-]+(?:\s+fa-[a-z0-9-]+)*$/i.test(raw)) return `<i class="${escapeHTML(raw)}" aria-hidden="true"></i>`;
    return `<span aria-hidden="true">${escapeHTML(raw)}</span>`;
  }

  function parsePausePoints(raw) {
    return String(raw || "").split(/\n|,/).map((line) => {
      const [at, duration] = line.trim().split(":").map(Number);
      return Number.isFinite(at) && Number.isFinite(duration) && duration > 0 ? { at, duration } : null;
    }).filter(Boolean).sort((a, b) => a.at - b.at);
  }

  function parseBezier(raw, fallback = [0.42, 0, 0.58, 1]) {
    const values = String(raw || "").split(/[;,\s]+/).map(Number).filter(Number.isFinite);
    if (values.length !== 4) return fallback.slice();
    let [x1, y1, x2, y2] = values;
    x1 = clamp(x1, 0, 1); x2 = clamp(x2, 0, 1);
    y1 = clamp(y1, 0, 1); y2 = clamp(y2, 0, 1);
    if (x2 < x1) [x1, x2] = [x2, x1];
    if (y2 < y1) [y1, y2] = [y2, y1];
    return [x1, y1, x2, y2];
  }

  function bezierEase(progress, curve) {
    const x = clamp(progress, 0, 1);
    const [x1, y1, x2, y2] = curve;
    const sample = (t, a1, a2) => {
      const inv = 1 - t;
      return 3 * inv * inv * t * a1 + 3 * inv * t * t * a2 + t * t * t;
    };
    const derivative = (t, a1, a2) => {
      const inv = 1 - t;
      return 3 * inv * inv * a1 + 6 * inv * t * (a2 - a1) + 3 * t * t * (1 - a2);
    };

    let t = x;
    for (let i = 0; i < 6; i += 1) {
      const dx = sample(t, x1, x2) - x;
      const d = derivative(t, x1, x2);
      if (Math.abs(dx) < 1e-6 || Math.abs(d) < 1e-6) break;
      t = clamp(t - dx / d, 0, 1);
    }
    let low = 0, high = 1;
    for (let i = 0; i < 10; i += 1) {
      const sx = sample(t, x1, x2);
      if (Math.abs(sx - x) < 1e-6) break;
      if (sx < x) low = t; else high = t;
      t = (low + high) * 0.5;
    }
    return clamp(sample(t, y1, y2), 0, 1);
  }

  function buildVelocityLUT(curve, decelerating = false, steps = 180) {
    const values = new Float64Array(steps + 1);
    const area = new Float64Array(steps + 1);
    for (let i = 0; i <= steps; i += 1) {
      const u = i / steps;
      const eased = bezierEase(u, curve);
      values[i] = decelerating ? 1 - eased : eased;
      if (i > 0) area[i] = area[i - 1] + (values[i - 1] + values[i]) * 0.5 / steps;
    }
    return { steps, values, area, total: Math.max(1e-5, area[steps]) };
  }

  function velocityAreaAt(lut, progress) {
    const u = clamp(progress, 0, 1);
    const position = u * lut.steps;
    const i = Math.min(lut.steps - 1, Math.floor(position));
    const f = position - i;
    return lut.area[i] + (lut.area[i + 1] - lut.area[i]) * f;
  }

  function buildHero(point, index) {
    const article = document.createElement("article");
    const position = point.position || "center";
    const animation = point.animation || "fade";
    const align = ["left", "center", "right"].includes(point.align) ? point.align : "left";
    article.className = `svp-hero svp-align-${align}`;
    article.dataset.pointIndex = String(index);
    article.dataset.position = position;
    article.dataset.animation = animation;
    article.style.setProperty("--svp-width", `${number(point.width, 620)}px`);
    article.style.setProperty("--svp-opacity", String(clamp(number(point.opacity, 1), 0.1, 1)));
    article.setAttribute("aria-hidden", "true");
    if (bool(point.hideOnMobile)) article.classList.add("svp-hide-mobile");

    const parts = [];
    if (point.eyebrow || point.badge) parts.push(`<p class="svp-hero-eyebrow">${escapeHTML(point.eyebrow || point.badge)}</p>`);
    if (point.image) parts.push(`<img class="svp-hero-image" src="${escapeHTML(point.image)}" alt="${escapeHTML(point.imageAlt || "")}" loading="lazy">`);
    if (point.title) parts.push(`<h2 class="svp-hero-title">${escapeHTML(point.title)}</h2>`);
    if (point.subtitle) parts.push(`<p class="svp-hero-subtitle">${escapeHTML(point.subtitle)}</p>`);
    if (point.text) parts.push(`<p class="svp-hero-text">${escapeHTML(point.text)}</p>`);
    if (point.buttonText && point.buttonLink) parts.push(`<a class="svp-hero-button" href="${escapeHTML(point.buttonLink)}"${/^https?:/i.test(point.buttonLink) ? ' target="_blank" rel="noopener"' : ""}>${point.icon ? `${iconMarkup(point.icon)} ` : ""}${escapeHTML(point.buttonText)}</a>`);
    article.innerHTML = parts.join("");
    return article;
  }

  function init(root) {
    if (root.dataset.ready === "true") return;
    root.dataset.ready = "true";

    const video = root.querySelector(".svp-video");
    const sticky = root.querySelector(".svp-sticky");
    const poster = root.querySelector(".svp-poster");
    const loading = root.querySelector(".svp-loading");
    const percent = root.querySelector(".svp-loading-percent");
    const loadingLabel = root.querySelector(".svp-loading-label");
    const errorBox = root.querySelector(".svp-error");
    const contentLayer = root.querySelector(".svp-content-layer");
    const progressBar = root.querySelector(".svp-progress span");
    const hint = root.querySelector(".svp-scroll-hint");
    const hintLabel = root.querySelector(".svp-scroll-hint-label");
    const chaptersNav = root.querySelector(".svp-chapters");
    const debug = root.querySelector(".svp-debug-time");
    const skipButton = root.querySelector(".svp-skip");
    const restartButton = root.querySelector(".svp-restart");
    const soundButton = root.querySelector(".svp-sound");

    const config = {
      src: root.dataset.videoSrc || "",
      poster: root.dataset.poster || "",
      start: Math.max(0, number(root.dataset.startTime, 0)),
      end: Math.max(0.1, number(root.dataset.endTime, 30)),
      mediaDuration: Math.max(0, number(root.dataset.videoDuration, 0)),
      endAuto: root.dataset.endTimeAuto == null || root.dataset.endTimeAuto === "" ? true : bool(root.dataset.endTimeAuto),
      scrollHeight: Math.max(1500, number(root.dataset.scrollHeight, 8000)),
      smoothing: clamp(number(root.dataset.smoothing, 0.12), 0.01, 1),
      epsilon: clamp(number(root.dataset.timeEpsilon, 0.025), 0.005, 1),
      interactionMode: String(root.dataset.interactionMode || "cinematic").toLowerCase() === "continuous" ? "continuous" : "cinematic",
      autoStart: bool(root.dataset.autoStart),
      autoStartDelay: clamp(number(root.dataset.autoStartDelay, 1), 0, 30),
      cinematicDurationMs: clamp(number(root.dataset.cinematicDurationMs, 2600), 0, 10000),
      cinematicAccelMs: clamp(root.dataset.cinematicAccelMs ? number(root.dataset.cinematicAccelMs, 700) : number(root.dataset.cinematicRamp, 0.8) * 1000, 80, 5000),
      cinematicDecelMs: clamp(root.dataset.cinematicDecelMs ? number(root.dataset.cinematicDecelMs, 1100) : number(root.dataset.cinematicRamp, 0.8) * 1000, 80, 5000),
      cinematicAccelCurve: parseBezier(root.dataset.cinematicAccelCurve, [0.42, 0, 0.58, 1]),
      cinematicDecelCurve: parseBezier(root.dataset.cinematicDecelCurve, [0.42, 0, 0.58, 1]),
      cinematicSpeed: clamp(number(root.dataset.cinematicSpeed, 1), 0.35, 3),
      cinematicMaxRate: clamp(number(root.dataset.cinematicMaxRate, 2), 1, 4),
      timelineFps: clamp(Math.round(number(root.dataset.timelineFps, 30)), 1, 120),
      timelineSnap: root.dataset.timelineSnap == null ? true : bool(root.dataset.timelineSnap),
      wheelThreshold: clamp(number(root.dataset.wheelThreshold, 42), 8, 180),
      gestureCooldown: clamp(number(root.dataset.gestureCooldown, 180), 0, 1200),
      reverse: String(root.dataset.direction || "forward").toLowerCase() === "reverse",
      preload: root.dataset.preload || "auto",
      fit: root.dataset.fit || "cover",
      x: clamp(number(root.dataset.positionX, 50), 0, 100),
      y: clamp(number(root.dataset.positionY, 50), 0, 100),
      scaleDesktop: clamp(number(root.dataset.scaleDesktop, 1), 1, 2.5),
      mobileX: clamp(number(root.dataset.mobilePositionX, 50), 0, 100),
      mobileY: clamp(number(root.dataset.mobilePositionY, 50), 0, 100),
      scaleMobile: clamp(number(root.dataset.scaleMobile, 1.08), 1, 3),
      disableOnMobile: bool(root.dataset.disableMobile),
      mobileBreakpoint: clamp(number(root.dataset.mobileBreakpoint, 767), 320, 1200),
      overlayColor: root.dataset.overlayColor || "#000000",
      overlayOpacity: clamp(number(root.dataset.overlayOpacity, 30), 0, 100),
      points: safeJSON(root.dataset.heroPoints, []),
      pauses: parsePausePoints(root.dataset.pausePoints)
    };

    /* loadedmetadata é a fonte definitiva. Antes dele, duração persistida e chaves
       evitam comprimir pontos de vídeos longos no fallback de 30 segundos. */
    if (config.endAuto) {
      const pointHint = Array.isArray(config.points) ? config.points.reduce((max, point) => Math.max(max, number(point?.startTime, 0), number(point?.endTime, 0)), 0) : 0;
      config.end = Math.max(config.end, config.mediaDuration, pointHint, config.start + 0.1);
    }
    if (config.end <= config.start) config.end = config.start + 1;
    config.accelLUT = buildVelocityLUT(config.cinematicAccelCurve, false);
    config.decelLUT = buildVelocityLUT(config.cinematicDecelCurve, true);
    root.style.setProperty("--svp-scroll-height", `${config.scrollHeight}px`);
    root.style.setProperty("--svp-fit", config.fit);
    root.style.setProperty("--svp-x", `${config.x}%`);
    root.style.setProperty("--svp-y", `${config.y}%`);
    root.style.setProperty("--svp-scale", config.scaleDesktop);
    root.style.setProperty("--svp-mobile-x", `${config.mobileX}%`);
    root.style.setProperty("--svp-mobile-y", `${config.mobileY}%`);
    root.style.setProperty("--svp-mobile-scale", config.scaleMobile);
    const mobileQuery = window.matchMedia(`(max-width: ${config.mobileBreakpoint}px)`);
    const syncMobileVisibility = () => {
      const isMobile = mobileQuery.matches;
      root.classList.toggle("svp-is-mobile", isMobile);
      root.classList.toggle("svp-mobile-disabled", config.disableOnMobile && isMobile);
      if (hintLabel) hintLabel.textContent = isMobile ? "Deslize para cima" : "Rolar para explorar";
    };
    syncMobileVisibility();
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", syncMobileVisibility);
    const rgb = /^#([\da-f]{6})$/i.exec(config.overlayColor);
    const overlay = rgb ? `${parseInt(rgb[1].slice(0,2),16)},${parseInt(rgb[1].slice(2,4),16)},${parseInt(rgb[1].slice(4,6),16)}` : "0,0,0";
    root.style.setProperty("--svp-overlay", `rgba(${overlay},${config.overlayOpacity / 100})`);

    const controlFlags = {
      progress: root.dataset.showProgress,
      hint: root.dataset.showScrollHint,
      skip: root.dataset.showSkip,
      restart: root.dataset.showRestart,
      sound: root.dataset.showSound,
      chapters: root.dataset.showChapters
    };
    Object.entries(controlFlags).forEach(([name, value]) => {
      if (bool(value)) root.classList.add(`svp-show-${name}`);
    });
    if (bool(root.dataset.debugTime)) root.classList.add("svp-debug");

    /* A ordem cronológica é a fonte de verdade do runtime. O Inspector pode manter
       qualquer ordem no JSON, mas a execução entre várias chaves nunca depende dela. */
    const snapRuntimeTime = (value) => {
      const raw = Math.max(0, number(value, config.start));
      return config.timelineSnap ? Math.max(0, Math.round(raw * config.timelineFps) / config.timelineFps) : raw;
    };
    const points = (Array.isArray(config.points) ? config.points.filter((p) => p && Number.isFinite(Number(p.startTime))) : [])
      .map((point) => {
        const normalized = { ...point };
        normalized.startTime = snapRuntimeTime(point.startTime);
        const fallbackEnd = normalized.startTime + 4;
        normalized.endTime = Number.isFinite(Number(point.endTime)) ? Math.max(normalized.startTime, number(point.endTime, fallbackEnd)) : fallbackEnd;
        return normalized;
      })
      .sort((a, b) => number(a.startTime, 0) - number(b.startTime, 0) || String(a.id || "").localeCompare(String(b.id || "")));
    const heroElements = points.map((point, index) => {
      const hero = buildHero(point, index);
      contentLayer.appendChild(hero);
      return hero;
    });
    const chapterButtons = points.map((point, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "svp-chapter";
      button.title = point.title || `Capítulo ${index + 1}`;
      button.setAttribute("aria-label", button.title);
      button.addEventListener("click", () => scrollToTime(number(point.startTime, config.start)));
      chaptersNav.appendChild(button);
      return button;
    });

    /* Ajuste tipográfico real ao frame. Não existe overflow:auto no banner: a fonte,
       padding, gaps, imagem e botão encolhem em conjunto até caber no viewport atual. */
    let heroFitRaf = 0;
    let heroResizeObserver = null;
    function heroBaseMetrics() {
      const w = Math.max(240, sticky?.clientWidth || window.innerWidth || 1280);
      const h = Math.max(180, sticky?.clientHeight || window.innerHeight || 720);
      const mobile = w <= config.mobileBreakpoint;
      return {
        mobile,
        pad: clamp(w * (mobile ? 0.045 : 0.024), mobile ? 12 : 18, mobile ? 24 : 38),
        gap: clamp(h * 0.018, 7, 14),
        eyebrow: clamp(w * (mobile ? 0.028 : 0.008), 9, mobile ? 13 : 14),
        title: clamp(w * (mobile ? 0.082 : 0.042), mobile ? 24 : 30, mobile ? 54 : 86),
        subtitle: clamp(w * (mobile ? 0.041 : 0.015), 13, mobile ? 20 : 23),
        text: clamp(w * (mobile ? 0.034 : 0.0125), 12.5, mobile ? 18 : 19),
        button: clamp(w * (mobile ? 0.032 : 0.011), 11, 16),
        buttonHeight: clamp(h * 0.065, 36, 48),
        imageHeight: clamp(h * 0.21, 72, 160),
        maxHeight: Math.max(120, h - (mobile ? 132 : 72))
      };
    }
    function applyHeroFit(hero, metrics, scale) {
      const px = (value, min = 1) => `${Math.max(min, value * scale).toFixed(2)}px`;
      hero.style.setProperty("--svp-card-pad", px(metrics.pad, 6));
      hero.style.setProperty("--svp-card-gap", px(metrics.gap, 4));
      hero.style.setProperty("--svp-eyebrow-size", px(metrics.eyebrow, 7));
      hero.style.setProperty("--svp-title-size", px(metrics.title, 10));
      hero.style.setProperty("--svp-subtitle-size", px(metrics.subtitle, 8));
      hero.style.setProperty("--svp-text-size", px(metrics.text, 8));
      hero.style.setProperty("--svp-button-size", px(metrics.button, 8));
      hero.style.setProperty("--svp-button-height", px(metrics.buttonHeight, 28));
      hero.style.setProperty("--svp-image-height", px(metrics.imageHeight, 42));
      hero.style.setProperty("--svp-card-max-h", `${metrics.maxHeight.toFixed(1)}px`);
      hero.dataset.fitScale = scale.toFixed(3);
    }
    function fitHero(hero) {
      if (!hero || !sticky) return;
      const metrics = heroBaseMetrics();
      let scale = 1;
      applyHeroFit(hero, metrics, scale);
      for (let i = 0; i < 7; i += 1) {
        const ch = Math.max(1, hero.clientHeight), sh = Math.max(1, hero.scrollHeight);
        const cw = Math.max(1, hero.clientWidth), sw = Math.max(1, hero.scrollWidth);
        if (sh <= ch + 1 && sw <= cw + 1) break;
        const ratio = Math.min(ch / sh, cw / sw, 0.985);
        const next = clamp(scale * ratio * 0.965, 0.14, 1);
        if (Math.abs(next - scale) < 0.004) { scale = next; applyHeroFit(hero, metrics, scale); break; }
        scale = next;
        applyHeroFit(hero, metrics, scale);
      }
    }
    function fitHeroes() {
      heroFitRaf = 0;
      heroElements.forEach(fitHero);
    }
    function scheduleHeroFit() {
      if (heroFitRaf) return;
      heroFitRaf = requestAnimationFrame(fitHeroes);
    }
    heroElements.forEach((hero) => hero.querySelectorAll("img").forEach((img) => img.addEventListener("load", scheduleHeroFit, { once: true })));
    if ("ResizeObserver" in window && sticky) {
      heroResizeObserver = new ResizeObserver(scheduleHeroFit);
      heroResizeObserver.observe(sticky);
    } else {
      window.addEventListener("resize", scheduleHeroFit, { passive: true });
    }
    if (document.fonts?.ready) document.fonts.ready.then(scheduleHeroFit).catch(() => {});
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", scheduleHeroFit);
    scheduleHeroFit();

    let targetTime = config.reverse ? config.end : config.start;
    let displayTime = targetTime;
    let duration = config.end;
    let metadataReady = false;
    let frameReady = false;
    let videoReady = false;
    let pendingSeek = null;
    let lastSeekAt = 0;
    let rafId = 0;
    let destroyed = false;
    let sectionVisible = true;
    let visibilityObserver = null;
    let lastDebugLabel = "";
    let lastProgressScale = -1;
    let lastHintOpacity = "";
    let cinematicAnimating = false;
    let cinematicRafId = 0;
    let cinematicFrameMode = "raf";
    let cinematicTime = null;
    let cinematicNative = false;
    let cinematicToken = 0;
    let lastPlaybackRate = 1;
    let wheelAccum = 0;
    let wheelQuietTimer = 0;
    let gestureArmed = true;
    let autoStartTimer = 0;
    let autoStartScheduled = false;
    let autoStartDone = false;
    let userInteracted = false;
    let touchStartY = null;
    let cinematicHandoffDirection = 0;
    let exitBoundaryState = 0;
    let parkedAtTimelineStart = false;

    function effectiveProgress(rawProgress) {
      if (!config.pauses.length) return rawProgress;
      const segment = config.end - config.start;
      const baseScroll = config.scrollHeight - window.innerHeight;
      const extra = config.pauses.reduce((sum, pause) => sum + pause.duration * 250, 0);
      const virtual = rawProgress * (baseScroll + extra);
      let consumed = 0;
      for (const pause of config.pauses) {
        const p = clamp((pause.at - config.start) / segment, 0, 1);
        const before = p * baseScroll + consumed;
        const hold = pause.duration * 250;
        if (virtual < before) return clamp((virtual - consumed) / baseScroll, 0, 1);
        if (virtual <= before + hold) return p;
        consumed += hold;
      }
      return clamp((virtual - consumed) / baseScroll, 0, 1);
    }

    function inverseEffectiveProgress(mappedProgress) {
      const target = clamp(mappedProgress, 0, 1);
      if (!config.pauses.length) return target;
      let lo = 0;
      let hi = 1;
      for (let i = 0; i < 30; i += 1) {
        const mid = (lo + hi) / 2;
        if (effectiveProgress(mid) < target) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2;
    }

    function getScrollProgress() {
      const rect = root.getBoundingClientRect();
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      return clamp(-rect.top / travel, 0, 1);
    }

    function rawProgressForTime(time) {
      const mapped = clamp((time - config.start) / Math.max(0.001, config.end - config.start), 0, 1);
      const directed = inverseEffectiveProgress(mapped);
      return config.reverse ? 1 - directed : directed;
    }

    function scrollToProgress(progress, behavior = "smooth") {
      const rootTop = window.scrollY + root.getBoundingClientRect().top;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      window.scrollTo({ top: rootTop + clamp(progress, 0, 1) * travel, behavior });
    }

    function boundaryTimeForPageDirection(direction) {
      if (direction > 0) return config.reverse ? config.start : config.end;
      return config.reverse ? config.end : config.start;
    }

    function isAtPageBoundary(direction, time = displayTime) {
      const tolerance = Math.max(0.04, 0.8 / Math.max(1, config.timelineFps));
      return Math.abs(number(time, boundaryTimeForPageDirection(direction)) - boundaryTimeForPageDirection(direction)) <= tolerance;
    }

    function resetGestureCapture() {
      if (wheelQuietTimer) { clearTimeout(wheelQuietTimer); wheelQuietTimer = 0; }
      wheelAccum = 0;
      gestureArmed = true;
    }

    function handoffPastStickyBoundary(direction) {
      if (!direction) return;
      const rootTop = window.scrollY + root.getBoundingClientRect().top;
      const travel = Math.max(1, root.offsetHeight - window.innerHeight);
      /* O sticky ainda é considerado ativo exatamente em 0%/100%. Avançar 8 px
         coloca a viewport inequivocamente fora da área capturada e permite que a
         inércia restante de wheel/trackpad/touch continue na página seguinte. */
      const edge = direction > 0 ? rootTop + travel + 8 : rootTop - 8;
      exitBoundaryState = direction;
      root.dataset.exitState = direction > 0 ? "after" : "before";
      resetGestureCapture();
      try { window.scrollTo({ top: Math.max(0, edge), behavior: "auto" }); } catch (_) { window.scrollTo(0, Math.max(0, edge)); }
    }

    function cancelCinematicAnimation() {
      cinematicToken += 1;
      if (cinematicRafId) {
        try {
          if (cinematicFrameMode === "video" && typeof video.cancelVideoFrameCallback === "function") video.cancelVideoFrameCallback(cinematicRafId);
          else cancelAnimationFrame(cinematicRafId);
        } catch (_) {}
      }
      cinematicRafId = 0;
      cinematicFrameMode = "raf";
      cinematicAnimating = false;
      cinematicTime = null;
      pendingSeek = null;
      cinematicHandoffDirection = 0;
      if (cinematicNative) {
        try { video.pause(); } catch (_) {}
      }
      cinematicNative = false;
      lastPlaybackRate = 1;
      try { video.playbackRate = 1; } catch (_) {}
    }

    function getCinematicStops() {
      const stops = [config.start];
      points.forEach((point) => {
        const at = number(point.startTime, config.start);
        if (at < config.start - 0.001 || at > config.end + 0.001) return;
        stops.push(clamp(at, config.start, config.end));
      });
      stops.push(config.end);
      return stops
        .sort((a, b) => a - b)
        .filter((value, index, list) => index === 0 || Math.abs(value - list[index - 1]) > 0.02);
    }

    function nextStopTime(direction, fromTime = displayTime) {
      const stops = getCinematicStops();
      const epsilon = 0.035;
      if (direction > 0) return stops.find((time) => time > fromTime + epsilon) ?? null;
      for (let i = stops.length - 1; i >= 0; i -= 1) {
        if (stops[i] < fromTime - epsilon) return stops[i];
      }
      return null;
    }

    function firstContentStop() {
      const stops = points
        .map((point) => number(point.startTime, config.start))
        .filter((time) => time >= config.start - 0.001 && time <= config.end + 0.001)
        .map((time) => clamp(time, config.start, config.end))
        .sort((a, b) => a - b);
      if (!stops.length) return null;
      return config.reverse ? stops[stops.length - 1] : stops[0];
    }

    function pointForTarget(targetTime) {
      return points.find((point) => Math.abs(number(point.startTime, config.start) - targetTime) <= 0.035) || null;
    }

    function transitionDurationMsForTarget(targetTime) {
      const match = pointForTarget(targetTime);
      const custom = match ? number(match.transitionMs, 0) : 0;
      return custom > 0 ? clamp(custom, 150, 20000) : config.cinematicDurationMs;
    }

    function cinematicProfile(distance, targetTime) {
      const d = Math.max(0, distance);
      const arrivalPoint = pointForTarget(targetTime);
      const pointDecelMs = arrivalPoint ? number(arrivalPoint.decelMs, 0) : 0;
      let accel = Math.max(0.08, config.cinematicAccelMs / 1000);
      let decel = Math.max(0.08, (pointDecelMs > 0 ? pointDecelMs : config.cinematicDecelMs) / 1000);
      const accelArea = config.accelLUT.total;
      const decelArea = config.decelLUT.total;
      const maxRate = Math.max(1, config.cinematicMaxRate);
      const requestedDurationMs = transitionDurationMsForTarget(targetTime);

      if (requestedDurationMs > 0) {
        const requestedTotal = Math.max(0.15, requestedDurationMs / 1000);
        const ramps = accel + decel;
        if (ramps > requestedTotal) {
          const scale = requestedTotal / ramps;
          accel *= scale;
          decel *= scale;
        }
        let cruiseTime = Math.max(0, requestedTotal - accel - decel);
        const unitDistance = Math.max(1e-5, accel * accelArea + cruiseTime + decel * decelArea);
        let peak = d / unitDistance;
        let total = requestedTotal;
        let stretched = false;

        /* Se a duração pedida exigir velocidade alta demais, manter o tempo exato
           provocaria descarte de frames. Priorizamos fluidez e alongamos somente o
           necessário, preservando as rampas de aceleração/desaceleração. */
        if (peak > maxRate) {
          peak = maxRate;
          const rampDistance = peak * (accel * accelArea + decel * decelArea);
          cruiseTime = Math.max(0, (d - rampDistance) / peak);
          total = accel + cruiseTime + decel;
          stretched = true;
        }
        return { accel, decel, cruiseTime, peak, total, requestedTotal, stretched, accelArea, decelArea };
      }

      const peakLimit = Math.min(config.cinematicSpeed, maxRate);
      const rampDistance = peakLimit * (accel * accelArea + decel * decelArea);
      if (d <= rampDistance) {
        const unitDistance = Math.max(1e-5, accel * accelArea + decel * decelArea);
        const peak = Math.min(maxRate, d / unitDistance);
        return { accel, decel, cruiseTime: 0, peak, total: accel + decel, requestedTotal: 0, stretched: false, accelArea, decelArea };
      }
      const cruiseTime = (d - rampDistance) / peakLimit;
      return { accel, decel, cruiseTime, peak: peakLimit, total: accel + cruiseTime + decel, requestedTotal: 0, stretched: false, accelArea, decelArea };
    }

    function cinematicDistanceAt(elapsed, profile) {
      const { accel, decel, cruiseTime, peak, total, accelArea } = profile;
      const t = clamp(elapsed, 0, total);
      const accelDistance = peak * accel * accelArea;
      if (t <= accel) {
        return peak * accel * velocityAreaAt(config.accelLUT, t / accel);
      }
      if (t <= accel + cruiseTime) {
        return accelDistance + peak * (t - accel);
      }
      const q = decel > 0 ? (t - accel - cruiseTime) / decel : 1;
      const decelDistance = peak * decel * velocityAreaAt(config.decelLUT, q);
      return accelDistance + peak * cruiseTime + decelDistance;
    }

    function cinematicVelocityAt(elapsed, profile) {
      const { accel, decel, cruiseTime, peak, total } = profile;
      const t = clamp(elapsed, 0, total);
      if (t <= accel) return peak * bezierEase(accel > 0 ? t / accel : 1, config.cinematicAccelCurve);
      if (t <= accel + cruiseTime) return peak;
      const q = decel > 0 ? (t - accel - cruiseTime) / decel : 1;
      return peak * (1 - bezierEase(q, config.cinematicDecelCurve));
    }

    function finishCinematic(target, token) {
      if (destroyed || token !== cinematicToken) return;
      try { video.pause(); } catch (_) {}
      try { video.playbackRate = 1; } catch (_) {}
      lastPlaybackRate = 1;
      cinematicNative = false;
      cinematicAnimating = false;
      cinematicRafId = 0;
      targetTime = displayTime = target;
      cinematicTime = target;
      pendingSeek = null;
      /* Uma única correção final substitui dezenas de seeks durante a reprodução. */
      if (videoReady && Math.abs(video.currentTime - target) > 0.006) {
        try { video.currentTime = target; } catch (_) {}
      }
      scrollToProgress(rawProgressForTime(target), "auto");
      updatePoints(target);
      const handoffDirection = cinematicHandoffDirection;
      if (handoffDirection < 0 && isAtPageBoundary(-1, target)) parkAtTimelineStart(target);
      else if (!isAtPageBoundary(-1, target)) releaseTimelineStartPark();
      cinematicHandoffDirection = 0;
      if (handoffDirection && isAtPageBoundary(handoffDirection, target)) {
        handoffPastStickyBoundary(handoffDirection);
      } else {
        exitBoundaryState = 0;
        root.dataset.exitState = "inside";
      }
      window.setTimeout(() => { if (!cinematicAnimating && token === cinematicToken) cinematicTime = null; }, 60);
    }

    function runSeekTransition(from, target, profile, direction, distance, token) {
      const startedAt = performance.now();
      cinematicNative = false;
      cinematicFrameMode = "raf";
      const tick = (now) => {
        if (destroyed || !cinematicAnimating || token !== cinematicToken) return;
        const elapsed = (now - startedAt) / 1000;
        const travelled = Math.min(distance, cinematicDistanceAt(elapsed, profile));
        const current = clamp(from + direction * travelled, config.start, config.end);
        cinematicTime = current;
        targetTime = displayTime = current;
        /* O scroll físico não acompanha cada frame. window.scrollTo() durante a
           reprodução força layout/paint e compete com o decoder. A posição da
           página é sincronizada somente na chegada à chave. */
        if (elapsed >= profile.total || travelled >= distance - 0.0005) {
          finishCinematic(target, token);
          return;
        }
        cinematicRafId = requestAnimationFrame(tick);
      };
      cinematicRafId = requestAnimationFrame(tick);
    }

    function runNativeForwardTransition(from, target, profile, distance, token) {
      let startedAt = 0;
      let lastRateAt = 0;
      let startGuardTimer = 0;
      let lastQualityAt = 0;
      let qualityTotal = 0;
      let qualityDropped = 0;
      let adaptiveRateCap = config.cinematicMaxRate;
      let smoothedRate = 1;
      cinematicNative = true;
      pendingSeek = null;

      /* Playback muito lento parece travamento porque o navegador precisa repetir
         frames do arquivo. Mantemos movimento perceptualmente contínuo e fazemos
         a parada limpa somente ao chegar à chave. */
      const nativeRateFloor = mobileQuery.matches ? 0.62 : 0.55;

      const frameTolerance = Math.max(0.004, 0.55 / Math.max(1, config.timelineFps));
      const scheduleTick = (tick) => {
        if (typeof video.requestVideoFrameCallback === "function") {
          cinematicFrameMode = "video";
          cinematicRafId = video.requestVideoFrameCallback(tick);
        } else {
          cinematicFrameMode = "raf";
          cinematicRafId = requestAnimationFrame((now) => tick(now, null));
        }
      };

      const beginPlayback = () => {
        if (startGuardTimer) { clearTimeout(startGuardTimer); startGuardTimer = 0; }
        if (destroyed || !cinematicAnimating || token !== cinematicToken) return;
        try {
          const initialVelocity = cinematicVelocityAt(0.001, profile) || nativeRateFloor;
          video.playbackRate = clamp(initialVelocity, nativeRateFloor, adaptiveRateCap);
        } catch (_) {}
        lastPlaybackRate = video.playbackRate || nativeRateFloor;
        smoothedRate = lastPlaybackRate;
        if (typeof video.getVideoPlaybackQuality === "function") {
          try {
            const q = video.getVideoPlaybackQuality();
            qualityTotal = number(q.totalVideoFrames, 0);
            qualityDropped = number(q.droppedVideoFrames, 0);
          } catch (_) {}
        }

        const tick = (now, metadata) => {
          if (destroyed || !cinematicAnimating || token !== cinematicToken) return;
          const elapsed = Math.max(0, (now - startedAt) / 1000);
          const curveElapsed = Math.min(elapsed, profile.total);
          const desiredTravel = Math.min(distance, cinematicDistanceAt(curveElapsed, profile));
          const desiredTime = Math.min(target, from + desiredTravel);
          const mediaTime = metadata && Number.isFinite(metadata.mediaTime) ? metadata.mediaTime : number(video.currentTime, desiredTime);
          const actualTime = clamp(mediaTime, from, Math.max(from, target));
          const remaining = target - actualTime;

          cinematicTime = actualTime;
          targetTime = displayTime = actualTime;

          /* O scroll físico fica estacionado durante a tomada. Atualizá-lo a cada
             callback de vídeo causava reflow e microtravadas, sobretudo no mobile. */

          /* Só declaramos chegada quando o decoder realmente apresentou o frame da
             chave (ou chegou a menos de meio frame). Isso elimina correções visíveis
             antecipadas em transições com vários pontos. */
          if (remaining <= frameTolerance || mediaTime >= target) {
            finishCinematic(target, token);
            return;
          }

          let baseRate;
          if (elapsed < profile.total) baseRate = cinematicVelocityAt(curveElapsed, profile);
          else baseRate = Math.max(nativeRateFloor, remaining / 0.18);

          /* Controle adaptativo: se o decoder começar a descartar frames, reduzimos
             gradualmente o teto da etapa. Quando estabiliza, o teto se recupera. */
          if (typeof video.getVideoPlaybackQuality === "function" && now - lastQualityAt >= 450) {
            lastQualityAt = now;
            try {
              const q = video.getVideoPlaybackQuality();
              const total = number(q.totalVideoFrames, qualityTotal);
              const dropped = number(q.droppedVideoFrames, qualityDropped);
              const totalDelta = Math.max(0, total - qualityTotal);
              const dropDelta = Math.max(0, dropped - qualityDropped);
              qualityTotal = total;
              qualityDropped = dropped;
              if (totalDelta >= 8) {
                const ratio = dropDelta / totalDelta;
                if (ratio >= 0.08) adaptiveRateCap = Math.max(1, adaptiveRateCap - 0.18);
                else if (ratio <= 0.01) adaptiveRateCap = Math.min(config.cinematicMaxRate, adaptiveRateCap + 0.05);
              }
            } catch (_) {}
          }

          const drift = desiredTime - actualTime;
          const terminalWindow = Math.max(frameTolerance * 3, nativeRateFloor * 0.11);
          const minRate = remaining <= terminalWindow ? 0.22 : nativeRateFloor;
          const desiredRate = clamp(baseRate + drift * 1.15, minRate, adaptiveRateCap);

          /* Alterar playbackRate dezenas de vezes por segundo pode produzir jitter
             no próprio pipeline de mídia. Aplicamos low-pass e atualizamos em ritmo
             mais baixo, suficiente para uma rampa visualmente contínua. */
          smoothedRate += (desiredRate - smoothedRate) * 0.42;
          const correctedRate = clamp(smoothedRate, minRate, adaptiveRateCap);
          if (now - lastRateAt >= 72 && Math.abs(correctedRate - lastPlaybackRate) >= 0.035) {
            try { video.playbackRate = correctedRate; lastPlaybackRate = correctedRate; lastRateAt = now; } catch (_) {}
          }

          const hardTimeout = profile.total + Math.max(1.2, profile.total * 0.75);
          if (elapsed >= hardTimeout) {
            finishCinematic(target, token);
            return;
          }
          scheduleTick(tick);
        };

        const playPromise = video.play();
        if (playPromise && typeof playPromise.then === "function") {
          playPromise.then(() => {
            if (destroyed || !cinematicAnimating || token !== cinematicToken) return;
            startedAt = performance.now();
            scheduleTick(tick);
          }).catch(() => {
            cinematicNative = false;
            cinematicFrameMode = "raf";
            runSeekTransition(from, target, profile, 1, distance, token);
          });
        } else {
          startedAt = performance.now();
          scheduleTick(tick);
        }
      };

      /* Nunca iniciamos play() enquanto o navegador ainda está buscando a chave
         anterior. Com muitos pontos, esse era um dos principais motivos de saltos. */
      const needsPositioning = Math.abs(number(video.currentTime, from) - from) > frameTolerance * 1.5;
      if (needsPositioning) {
        try { video.pause(); video.currentTime = from; } catch (_) {}
        const onSeeked = () => beginPlayback();
        video.addEventListener("seeked", onSeeked, { once: true });
        startGuardTimer = window.setTimeout(() => {
          try { video.removeEventListener("seeked", onSeeked); } catch (_) {}
          beginPlayback();
        }, 320);
      } else beginPlayback();
    }

    function animateToTime(time, options = {}) {
      const target = clamp(number(time, config.start), config.start, Math.min(config.end, duration || config.end));
      const currentVideoTime = videoReady && Number.isFinite(video.currentTime) ? video.currentTime : displayTime;
      const from = clamp(Math.abs(currentVideoTime - displayTime) < 0.35 ? currentVideoTime : displayTime, config.start, Math.min(config.end, duration || config.end));
      cancelCinematicAnimation();
      cinematicHandoffDirection = Number(options.handoffDirection) || 0;
      exitBoundaryState = 0;
      root.dataset.exitState = "inside";

      const distance = Math.abs(target - from);
      const pageStart = boundaryTimeForPageDirection(-1);
      const movingAwayFromStart = Math.abs(from - pageStart) <= Math.max(0.04, 0.8 / Math.max(1, config.timelineFps)) && Math.abs(target - pageStart) > 0.035;
      if (movingAwayFromStart) releaseTimelineStartPark();
      if (distance < 0.015) {
        targetTime = displayTime = target;
        cinematicTime = null;
        if (videoReady && Math.abs(video.currentTime - target) > 0.006) { try { video.currentTime = target; } catch (_) {} }
        scrollToProgress(rawProgressForTime(target), "auto");
        updatePoints(target);
        const handoffDirection = cinematicHandoffDirection;
        cinematicHandoffDirection = 0;
        if (handoffDirection < 0 && isAtPageBoundary(-1, target)) parkAtTimelineStart(target);
        if (handoffDirection && isAtPageBoundary(handoffDirection, target)) handoffPastStickyBoundary(handoffDirection);
        return false;
      }

      const direction = target > from ? 1 : -1;
      const profile = cinematicProfile(distance, target);
      const token = ++cinematicToken;
      cinematicAnimating = true;
      cinematicTime = from;
      updatePoints(from); /* oculta imediatamente o banner da chave de origem */

      /* Avanço normal usa reprodução real. Reverso mantém fallback por seek porque
         HTMLVideoElement não oferece playbackRate negativo de forma interoperável. */
      if (direction > 0 && videoReady) runNativeForwardTransition(from, target, profile, distance, token);
      else runSeekTransition(from, target, profile, direction, distance, token);
      return true;
    }

    function scrollToTime(time) {
      if (config.interactionMode === "cinematic") return animateToTime(time);
      const linear = clamp((time - config.start) / (config.end - config.start), 0, 1);
      scrollToProgress(config.reverse ? 1 - linear : linear);
      return true;
    }

    function isSectionActive() {
      const rect = root.getBoundingClientRect();
      return rect.top <= 2 && rect.bottom >= window.innerHeight - 2;
    }

    function cancelAutoStart(markInteraction = false) {
      if (autoStartTimer) clearTimeout(autoStartTimer);
      autoStartTimer = 0;
      autoStartScheduled = false;
      if (markInteraction) userInteracted = true;
    }

    function parkAtTimelineStart(time = displayTime) {
      const pageStart = boundaryTimeForPageDirection(-1);
      const tolerance = Math.max(0.04, 0.8 / Math.max(1, config.timelineFps));
      if (Math.abs(number(time, pageStart) - pageStart) > tolerance) return false;
      cancelAutoStart(true);
      autoStartDone = true;
      parkedAtTimelineStart = true;
      root.dataset.parkedStart = "true";
      targetTime = displayTime = pageStart;
      cinematicTime = null;
      pendingSeek = null;
      try { video.pause(); video.playbackRate = 1; } catch (_) {}
      if (videoReady && Math.abs(number(video.currentTime, pageStart) - pageStart) > 0.006) {
        try { video.currentTime = pageStart; } catch (_) {}
      }
      updatePoints(pageStart);
      return true;
    }

    function releaseTimelineStartPark() {
      if (!parkedAtTimelineStart) return;
      parkedAtTimelineStart = false;
      root.dataset.parkedStart = "false";
    }

    function maybeScheduleAutoStart() {
      if (config.interactionMode !== "cinematic" || !config.autoStart || autoStartDone || autoStartScheduled || userInteracted || parkedAtTimelineStart || !videoReady || !isSectionActive()) return;
      autoStartScheduled = true;
      autoStartTimer = window.setTimeout(() => {
        autoStartTimer = 0;
        autoStartScheduled = false;
        if (destroyed || userInteracted || !isSectionActive()) return;
        const target = firstContentStop();
        autoStartDone = true;
        const initial = config.reverse ? config.end : config.start;
        if (target == null || Math.abs(target - initial) <= 0.035) return;
        animateToTime(target);
      }, config.autoStartDelay * 1000);
    }

    function timeDirectionForGesture(direction) {
      return config.reverse ? -direction : direction;
    }

    function goToStep(direction) {
      if (direction > 0) releaseTimelineStartPark();
      const target = nextStopTime(timeDirectionForGesture(direction), displayTime);
      if (target == null) {
        if (isAtPageBoundary(direction, displayTime)) handoffPastStickyBoundary(direction);
        return false;
      }
      const terminal = Math.abs(target - boundaryTimeForPageDirection(direction)) <= Math.max(0.035, 0.8 / Math.max(1, config.timelineFps));
      return animateToTime(target, { handoffDirection: terminal ? direction : 0 });
    }

    function updatePoints(time) {
      let current = -1;
      if (config.interactionMode === "cinematic") {
        /* No modo cinematográfico o banner pertence à CHAVE, não a um intervalo.
           Durante A→B todos ficam ocultos; ao pausar em B aparece somente o banner B. */
        if (!cinematicAnimating) {
          const tolerance = Math.max(0.018, 0.65 / Math.max(1, config.timelineFps));
          let bestDistance = Infinity;
          points.forEach((point, index) => {
            const distance = Math.abs(number(point.startTime, config.start) - time);
            if (distance <= tolerance && distance < bestDistance) {
              bestDistance = distance;
              current = index;
            }
          });
        }
      } else {
        /* Compatibilidade: no modo contínuo startTime/endTime seguem sendo a janela
           visual do card. */
        points.forEach((point, index) => {
          if (time >= Number(point.startTime) && time <= Number(point.endTime)) current = index;
        });
      }

      points.forEach((point, index) => {
        const active = index === current;
        const hero = heroElements[index];
        const changed = hero.classList.contains("svp-active") !== active;
        if (changed) hero.classList.toggle("svp-active", active);
        const ariaHidden = String(!active);
        if (hero.getAttribute("aria-hidden") !== ariaHidden) hero.setAttribute("aria-hidden", ariaHidden);
        if (active && changed) fitHero(hero);
      });
      const cardStandby = config.interactionMode === "cinematic" && !cinematicAnimating && current >= 0;
      root.dataset.cardStandby = cardStandby ? "true" : "false";
      root.classList.toggle("svp-card-standby", cardStandby);
      if (hint) hint.classList.toggle("svp-card-standby-hint", cardStandby);

      chapterButtons.forEach((button, index) => {
        const active = index === current;
        if (button.classList.contains("svp-current") !== active) button.classList.toggle("svp-current", active);
      });
      root.dataset.activePoint = current >= 0 ? String(points[current].id || current) : "";
      root.classList.toggle("svp-in-transition", cinematicAnimating);
    }

    function applyPointBoomerang(baseTime) {
      /*
       * v1.4 — boomerangue independente do intervalo visual do Hero.
       * - boomerangAtTime: segundo exato onde o loop começa.
       * - boomerangSpan: tamanho do trecho A→B em segundos do vídeo.
       * - boomerangDuration: janela, em segundos da linha de tempo, reservada ao loop.
       * - boomerangCycles: quantidade de idas/voltas dentro da janela.
       * O movimento continua totalmente determinístico pelo scroll: não há autoplay escondido.
       */
      const point = points.find((item) => {
        if (!bool(item.boomerang)) return false;
        const at = number(item.boomerangAtTime, number(item.startTime, config.start));
        const hold = Math.max(0.1, number(item.boomerangDuration, Math.max(1, number(item.boomerangSeconds, 1.5) * 2)));
        return baseTime >= at && baseTime <= at + hold;
      });
      if (!point) return baseTime;

      const at = clamp(number(point.boomerangAtTime, number(point.startTime, config.start)), config.start, config.end);
      const maxSpan = Math.max(0.05, config.end - at);
      const span = clamp(number(point.boomerangSpan, number(point.boomerangSeconds, 1.5)), 0.05, maxSpan);
      const hold = Math.max(0.1, number(point.boomerangDuration, Math.max(span * 2, 1)));
      const cycles = clamp(Math.round(number(point.boomerangCycles, number(point.boomerangRepeats, 2))), 1, 30);
      const local = clamp((baseTime - at) / hold, 0, 1);
      const phase = local * cycles * 2;
      const cycle = phase % 2;
      const triangle = cycle <= 1 ? cycle : 2 - cycle;
      return clamp(at + triangle * span, config.start, config.end);
    }

    function frame() {
      rafId = 0;
      if (destroyed) return;
      if (document.hidden || (!sectionVisible && !cinematicAnimating)) return;

      /* Durante uma tomada cinematográfica, ler getBoundingClientRect() em todo
         RAF força layout sem necessidade. O tempo do vídeo já é a fonte da verdade. */
      const raw = (config.interactionMode === "cinematic" && cinematicAnimating)
        ? rawProgressForTime(displayTime)
        : getScrollProgress();
      if (exitBoundaryState && isSectionActive()) {
        exitBoundaryState = 0;
        root.dataset.exitState = "inside";
      }

      if (cinematicAnimating && cinematicNative && videoReady) {
        cinematicTime = clamp(number(video.currentTime, displayTime), config.start, Math.min(config.end, duration));
        targetTime = displayTime = cinematicTime;
      } else if (cinematicAnimating && cinematicTime != null) {
        targetTime = displayTime = cinematicTime;
      } else if (config.interactionMode === "continuous") {
        const mapped = effectiveProgress(config.reverse ? 1 - raw : raw);
        const linearTime = config.start + mapped * (config.end - config.start);
        targetTime = applyPointBoomerang(linearTime);
        displayTime += (targetTime - displayTime) * config.smoothing;
        if (Math.abs(targetTime - displayTime) < 0.001) displayTime = targetTime;
      } else {
        /* Cinematográfico: a posição física do scroll NÃO recalcula o tempo do vídeo.
           A chave atual fica travada até um gesto solicitar a próxima transição. */
        targetTime = displayTime;
      }

      if (videoReady && !cinematicNative && Math.abs(video.currentTime - displayTime) >= config.epsilon) {
        const desired = clamp(displayTime, config.start, Math.min(config.end, duration));
        const now = performance.now();
        /*
         * Limita seeks para não saturar o decoder. O valor mais recente substitui
         * qualquer seek pendente; não existe fila de frames atrasados.
         */
        const seekInterval = cinematicAnimating ? 42 : 50;
        pendingSeek = desired;
        if (!video.seeking && now - lastSeekAt >= seekInterval) {
          const nextSeek = pendingSeek;
          pendingSeek = null;
          lastSeekAt = now;
          try {
            if (!cinematicAnimating && typeof video.fastSeek === "function" && Math.abs(video.currentTime - nextSeek) > 0.22) video.fastSeek(nextSeek);
            else video.currentTime = nextSeek;
          } catch (_) { pendingSeek = nextSeek; }
        }
      } else if (videoReady && Math.abs(video.currentTime - displayTime) < config.epsilon) {
        pendingSeek = null;
      }

      updatePoints(displayTime);
      const mediaProgress = clamp((displayTime - config.start) / Math.max(0.001, config.end - config.start), 0, 1);
      const visibleProgress = config.interactionMode === "cinematic" ? mediaProgress : raw;
      if (Math.abs(visibleProgress - lastProgressScale) >= 0.0015) {
        progressBar.style.transform = `scaleX(${visibleProgress})`;
        lastProgressScale = visibleProgress;
      }
      if (hint) {
        const cardStandby = root.dataset.cardStandby === "true";
        /* Em modo cinematográfico o hint pertence ao estado de espera do card.
           Ele some durante a transição e volta sempre que uma chave/card fica parado. */
        const shouldShowHint = cardStandby || visibleProgress <= 0.035;
        const hintOpacity = shouldShowHint ? (cardStandby ? ".96" : ".8") : "0";
        if (hintOpacity !== lastHintOpacity) { hint.style.opacity = hintOpacity; lastHintOpacity = hintOpacity; }
      }
      const debugLabel = `${displayTime.toFixed(2)} s`;
      if (debugLabel !== lastDebugLabel) {
        debug.textContent = debugLabel;
        lastDebugLabel = debugLabel;
      }
      maybeScheduleAutoStart();
      rafId = requestAnimationFrame(frame);
    }

    let seekableWaitStarted = 0;
    function updateReadyState() {
      if (!metadataReady || !frameReady) return;
      /* Alguns MP4/WebM expõem duration antes de seekable. Damos uma pequena
         janela para o índice chegar, mas não bloqueamos indefinidamente a prévia. */
      if (!video.seekable || video.seekable.length === 0) {
        if (!seekableWaitStarted) seekableWaitStarted = performance.now();
        if (performance.now() - seekableWaitStarted < 1800) {
          loadingLabel.textContent = "Preparando navegação por frames…";
          window.setTimeout(updateReadyState, 120);
          return;
        }
      }
      if (videoReady) return;
      videoReady = true;
      root.classList.add("svp-video-ready", "svp-loaded");
      const initial = clamp(config.reverse ? config.end : config.start, 0, duration);
      try { video.currentTime = initial; } catch (_) {}
      loadingLabel.textContent = "Experiência pronta";
      percent.textContent = "100%";
      errorBox.hidden = true;
    }

    function notifyHostMetadata() {
      if (window.parent === window) return;
      const section = root.closest("[data-section-id]");
      const sectionId = section?.dataset.sectionId || root.dataset.sectionId || "";
      const detail = { sectionId, duration, startTime: config.start, endTime: config.end, endTimeAuto: config.endAuto };
      /* postMessage funciona mesmo quando a prévia está em sandbox sem allow-same-origin. */
      try { window.parent.postMessage({ type:"parallax-metadata", detail }, "*"); } catch (_) {}
      /* Compatibilidade com hosts antigos que permitiam acesso direto ao documento pai. */
      try { window.parent.document.dispatchEvent(new window.parent.CustomEvent("svp:metadata", { detail })); } catch (_) {}
    }

    function onMetadata() {
      const detectedDuration = mediaDuration(video);
      duration = detectedDuration || Math.max(config.end, config.mediaDuration);
      config.mediaDuration = detectedDuration || config.mediaDuration;
      const minGap = Math.max(0.01, 1 / Math.max(1, config.timelineFps));
      config.start = clamp(config.start, 0, Math.max(0, duration - minGap));
      config.end = config.endAuto
        ? duration
        : clamp(config.end, Math.min(duration, config.start + minGap), duration);
      if (config.end <= config.start) config.end = Math.min(duration, config.start + minGap);
      root.dataset.videoDuration = String(duration);
      root.dataset.startTime = String(config.start);
      root.dataset.endTime = String(config.end);
      if (!cinematicAnimating) { targetTime = displayTime = config.reverse ? config.end : config.start; cinematicTime = null; }
      chapterButtons.forEach((button,index)=>{const at=number(points[index]?.startTime,-1);button.hidden=at<config.start-0.001||at>config.end+0.001});
      if (detectedDuration > 0) notifyHostMetadata();
      metadataReady = detectedDuration > 0;
      loadingLabel.textContent = "Carregando primeiro frame…";
      /* Um play/pause silencioso após gesto não é necessário na maioria dos browsers,
         mas ajuda WebKit a inicializar o pipeline de decodificação. */
      const prime = video.play();
      if (prime && typeof prime.then === "function") {
        prime.then(() => { video.pause(); }).catch(() => {});
      }
      updateReadyState();
    }

    function onFrameReady() {
      frameReady = true;
      if (!metadataReady) {
        const lateDuration = mediaDuration(video);
        if (lateDuration > 0) onMetadata();
      }
      loadingLabel.textContent = "Preparando navegação por frames…";
      updateReadyState();
    }

    function fail() {
      if (root.dataset.mediaFailed === "true") return;
      root.dataset.mediaFailed = "true";
      root.classList.add("svp-loaded");
      errorBox.hidden = false;
      const source = config.src || "(não informado)";
      const mediaError = video.error;
      const code = mediaError ? mediaError.code : 0;
      const reason = ({1:"carregamento interrompido",2:"erro de rede",3:"erro de decodificação/codec",4:"formato ou fonte não suportada"})[code] || "fonte indisponível";
      errorBox.textContent = `Vídeo indisponível (${reason}). Fonte: ${source}`;
      loadingLabel.textContent = "Usando imagem de fallback";
      console.error("[Parallax] Falha de mídia", { source, code, networkState: video.networkState, readyState: video.readyState, error: mediaError });
    }

    function updateBuffered() {
      if (!video.duration || !video.buffered.length) return;
      const buffered = video.buffered.end(video.buffered.length - 1);
      percent.textContent = `${Math.round(clamp(buffered / video.duration, 0, 1) * 100)}%`;
    }

    function flushPendingSeek() {
      /* O próximo RAF consome apenas o seek mais recente, respeitando o limite de taxa. */
      if (destroyed || pendingSeek == null || !videoReady || document.hidden || !sectionVisible) return;
      if (!rafId) rafId = requestAnimationFrame(frame);
    }

    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = config.preload;
    video.poster = config.poster;
    let sourceNode = null;
    if (config.src) {
      /* Normaliza links raw/blob do GitHub e informa o MIME pelo sufixo. Isso evita
         depender do redirect/MIME genérico do host para arquivos MP4/WebM. */
      const resolvedSource = normalizeMediaSource(config.src);
      sourceNode = document.createElement("source");
      sourceNode.src = resolvedSource;
      const mime = mediaMime(resolvedSource);
      if (mime) sourceNode.type = mime;
      sourceNode.addEventListener("error", fail, { once: true });
      video.replaceChildren(sourceNode);
      video.addEventListener("loadedmetadata", onMetadata, { once: true });
      video.addEventListener("durationchange", () => { if (!metadataReady && mediaDuration(video) > 0) onMetadata(); });
      video.addEventListener("loadeddata", onFrameReady, { once: true });
      video.addEventListener("canplay", onFrameReady, { once: true });
      video.addEventListener("seeked", flushPendingSeek);
      video.addEventListener("progress", updateBuffered);
      video.addEventListener("error", fail, { once: true });
      video.load();
      window.setTimeout(() => {
        if (!videoReady && (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE || video.error)) fail();
      }, 6000);
    } else {
      fail();
    }

    function normalizedWheelDelta(event) {
      const scale = event.deltaMode === 1 ? 16 : (event.deltaMode === 2 ? window.innerHeight : 1);
      return event.deltaY * scale;
    }

    function armGestureAfterQuiet() {
      if (wheelQuietTimer) clearTimeout(wheelQuietTimer);
      wheelQuietTimer = window.setTimeout(() => {
        gestureArmed = true;
        wheelAccum = 0;
      }, config.gestureCooldown);
    }

    function onWheel(event) {
      if (config.interactionMode !== "cinematic" || (config.disableOnMobile && mobileQuery.matches) || !isSectionActive()) return;
      const delta = normalizedWheelDelta(event);
      if (Math.abs(delta) < 0.01) return;
      const direction = delta > 0 ? 1 : -1;
      const candidate = nextStopTime(timeDirectionForGesture(direction), displayTime);

      /* No início/fim não capturamos o gesto. Além disso, empurramos a viewport
         alguns pixels para fora do sticky para que trackpads com inércia não fiquem
         oscilando exatamente no limite da seção. */
      if (candidate == null && !cinematicAnimating) {
        if (direction < 0 && isAtPageBoundary(direction, displayTime)) parkAtTimelineStart(displayTime);
        if (isAtPageBoundary(direction, displayTime)) handoffPastStickyBoundary(direction);
        return;
      }

      event.preventDefault();
      cancelAutoStart(true);
      armGestureAfterQuiet();
      if (cinematicAnimating || !gestureArmed) return;

      wheelAccum += delta;
      if (Math.abs(wheelAccum) < config.wheelThreshold) return;
      const stepDirection = wheelAccum > 0 ? 1 : -1;
      wheelAccum = 0;
      gestureArmed = false;
      goToStep(stepDirection);
    }

    function onTouchStart(event) {
      if (config.interactionMode !== "cinematic" || !isSectionActive() || !event.touches?.length) return;
      touchStartY = event.touches[0].clientY;
      cancelAutoStart(true);
    }

    function onTouchMove(event) {
      if (config.interactionMode !== "cinematic" || touchStartY == null || !isSectionActive() || !event.touches?.length) return;
      const delta = touchStartY - event.touches[0].clientY;
      const direction = delta >= 0 ? 1 : -1;
      if (cinematicAnimating || nextStopTime(timeDirectionForGesture(direction), displayTime) != null) event.preventDefault();
    }

    function onTouchEnd(event) {
      if (config.interactionMode !== "cinematic" || touchStartY == null || !isSectionActive()) { touchStartY = null; return; }
      const endY = event.changedTouches?.[0]?.clientY;
      if (!Number.isFinite(endY)) { touchStartY = null; return; }
      const delta = touchStartY - endY;
      touchStartY = null;
      if (Math.abs(delta) < 34 || cinematicAnimating || !gestureArmed) return;
      const direction = delta > 0 ? 1 : -1;
      if (nextStopTime(timeDirectionForGesture(direction), displayTime) == null) {
        if (direction < 0 && isAtPageBoundary(direction, displayTime)) parkAtTimelineStart(displayTime);
        if (isAtPageBoundary(direction, displayTime)) handoffPastStickyBoundary(direction);
        return;
      }
      gestureArmed = false;
      armGestureAfterQuiet();
      goToStep(direction);
    }

    function onKeyDown(event) {
      if (!root.matches(":hover") && !root.contains(document.activeElement) && !isSectionActive()) return;
      if (config.interactionMode === "cinematic") {
        if (["ArrowDown", "PageDown"].includes(event.key)) {
          if (nextStopTime(timeDirectionForGesture(1), displayTime) != null) { event.preventDefault(); cancelAutoStart(true); goToStep(1); }
          else if (isAtPageBoundary(1, displayTime)) handoffPastStickyBoundary(1);
          return;
        }
        if (["ArrowUp", "PageUp"].includes(event.key)) {
          if (nextStopTime(timeDirectionForGesture(-1), displayTime) != null) { event.preventDefault(); cancelAutoStart(true); goToStep(-1); }
          else if (isAtPageBoundary(-1, displayTime)) handoffPastStickyBoundary(-1);
          return;
        }
        if (event.key === "Home") { event.preventDefault(); cancelAutoStart(true); animateToTime(config.start, { handoffDirection: -1 }); return; }
        if (event.key === "End") { event.preventDefault(); cancelAutoStart(true); animateToTime(config.end); return; }
      }
      if (["ArrowDown", "PageDown"].includes(event.key)) { event.preventDefault(); scrollToProgress(getScrollProgress() + 0.08); }
      if (["ArrowUp", "PageUp"].includes(event.key)) { event.preventDefault(); scrollToProgress(getScrollProgress() - 0.08); }
      if (event.key === "Home") { event.preventDefault(); scrollToProgress(0); }
      if (event.key === "End") { event.preventDefault(); scrollToProgress(1); }
    }

    skipButton.addEventListener("click", () => {
      cancelAutoStart(true); cancelCinematicAnimation();
      const t = config.reverse ? config.start : config.end;
      targetTime = displayTime = t; cinematicTime = null;
      try { video.pause(); video.currentTime = t; } catch (_) {}
      scrollToProgress(1, "auto"); updatePoints(t);
      handoffPastStickyBoundary(1);
    });
    restartButton.addEventListener("click", () => {
      cancelAutoStart(true); cancelCinematicAnimation();
      const t = config.reverse ? config.end : config.start;
      targetTime = displayTime = t; cinematicTime = null;
      try { video.pause(); video.currentTime = t; } catch (_) {}
      scrollToProgress(0); updatePoints(t);
      parkAtTimelineStart(t);
    });
    soundButton.addEventListener("click", async () => {
      video.muted = !video.muted;
      soundButton.textContent = video.muted ? "Som" : "Mudo";
      soundButton.setAttribute("aria-label", video.muted ? "Ativar som" : "Desativar som");
      if (!video.muted) { try { await video.play(); video.pause(); } catch (_) { video.muted = true; } }
    });

    window.addEventListener("wheel", onWheel, { passive: false });
    root.addEventListener("touchstart", onTouchStart, { passive: true });
    root.addEventListener("touchmove", onTouchMove, { passive: false });
    root.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("keydown", onKeyDown);

    const onVisibilityChange = () => {
      if (document.hidden && cinematicAnimating) {
        const t = clamp(number(video.currentTime, displayTime), config.start, Math.min(config.end, duration || config.end));
        cancelCinematicAnimation();
        targetTime = displayTime = t;
        updatePoints(t);
        return;
      }
      if (!document.hidden && sectionVisible && !destroyed && !rafId) rafId = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    if ("IntersectionObserver" in window) {
      visibilityObserver = new IntersectionObserver((entries) => {
        sectionVisible = entries.some((entry) => entry.isIntersecting);
        if (sectionVisible && !document.hidden && !destroyed && !rafId) rafId = requestAnimationFrame(frame);
      }, { rootMargin: "240px 0px" });
      visibilityObserver.observe(root);
    }

    updatePoints(displayTime);
    rafId = requestAnimationFrame(frame);
    root._svpAPI = {
      previewTime(time) {
        cancelCinematicAnimation();
        try { video.pause(); video.playbackRate = 1; } catch (_) {}
        /* Scrub do editor usa o vídeo completo para permitir escolher novos IN/OUT. */
        const fullEnd = Math.max(0, duration || config.mediaDuration || config.end);
        const t = clamp(number(time, config.start), 0, fullEnd);
        targetTime = displayTime = t;
        try { video.currentTime = t; } catch (_) {}
        updatePoints(t);
        debug.textContent = `${t.toFixed(2)} s`;
      },
      scrollToTime,
      next() { return goToStep(1); },
      previous() { return goToStep(-1); },
      getTime() { return displayTime; },
      getDuration() { return duration || config.mediaDuration || config.end; },
      getRange() { return { start: config.start, end: config.end }; }
    };
    const onHostPreviewMessage = (event) => {
      const data = event?.data;
      if (!data || data.type !== "parallax-preview-time") return;
      const section = root.closest("[data-section-id]");
      const sectionId = section?.dataset.sectionId || root.dataset.sectionId || "";
      if (data.sectionId && sectionId && String(data.sectionId) !== String(sectionId)) return;
      root._svpAPI?.previewTime?.(data.time);
    };
    window.addEventListener("message", onHostPreviewMessage);
    root._svpDestroy = () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      cancelCinematicAnimation();
      cancelAutoStart(false);
      if (wheelQuietTimer) clearTimeout(wheelQuietTimer);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("message", onHostPreviewMessage);
      root.removeEventListener("touchstart", onTouchStart);
      root.removeEventListener("touchmove", onTouchMove);
      root.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      visibilityObserver?.disconnect();
      heroResizeObserver?.disconnect?.();
      if (heroFitRaf) cancelAnimationFrame(heroFitRaf);
      window.removeEventListener("resize", scheduleHeroFit);
      if (mobileQuery.removeEventListener) {
        mobileQuery.removeEventListener("change", syncMobileVisibility);
        mobileQuery.removeEventListener("change", scheduleHeroFit);
      }
      video.pause();
      video.removeAttribute("src");
      if (sourceNode) sourceNode.remove();
      video.load();
      delete root._svpAPI;
    };
  }


  function boot() { document.querySelectorAll(SELECTOR).forEach(init); }
  /* A prévia do framework é recriada como documento completo. Um MutationObserver
     global aqui era desnecessário e podia ser acionado pelo próprio HUD a cada frame. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true }); else boot();
})();


(function () {
  'use strict';

  var GOOGLE_FONTS = new Set(['Inter','Montserrat','Poppins','Manrope','Josefin Sans','Raleway','Roboto','Lato','Oswald','Playfair Display']);

  function bool(value) { return value === true || value === 'true' || value === '1'; }
  function cssFont(value) { return String(value || '').replace(/[;{}]/g, '').trim(); }

  function loadFont(name) {
    if (!GOOGLE_FONTS.has(name)) return;
    var id = 'imobify-menu-font-' + name.toLowerCase().replace(/\s+/g, '-');
    if (document.getElementById(id)) return;
    var link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=' + encodeURIComponent(name).replace(/%20/g, '+') + ':wght@400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }

  function parseItems(text) {
    return String(text || '').split(/\r?\n/).map(function (line) {
      var clean = line.trim();
      if (!clean) return null;
      var splitAt = clean.indexOf('|');
      if (splitAt < 0) return { label: clean, href: '#' };
      return { label: clean.slice(0, splitAt).trim(), href: clean.slice(splitAt + 1).trim() || '#' };
    }).filter(Boolean);
  }

  function setFont(nav) {
    var node = nav.querySelector('.imobify-menu-pro__font');
    var selected = node ? node.dataset.font : 'Perfil do projeto';
    var custom = node ? cssFont(node.dataset.customFont) : '';
    var family;
    if (selected === 'Perfil do projeto') family = 'var(--body)';
    else if (selected === 'Sistema') family = '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    else if (selected === 'Personalizada' && custom) family = custom;
    else {
      loadFont(selected);
      family = '"' + selected + '", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
    }
    nav.style.setProperty('--imp-font', family);
  }

  function buildLinks(nav) {
    var source = nav.querySelector('.imobify-menu-pro__source');
    var list = nav.querySelector('.imobify-menu-pro__links');
    if (!list) return;
    list.textContent = '';
    parseItems(source ? source.value || source.textContent : '').forEach(function (item) {
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.textContent = item.label;
      a.href = item.href;
      li.appendChild(a);
      list.appendChild(li);
    });
  }

  function updateMobileRule(nav) {
    var bp = Math.max(320, Math.min(1600, Number(nav.dataset.mobileBreakpoint) || 768));
    var id = 'imobify-menu-pro-breakpoint';
    var style = document.getElementById(id);
    if (!style) {
      style = document.createElement('style');
      style.id = id;
      document.head.appendChild(style);
    }
    style.textContent = '@media (max-width:' + bp + 'px){.imobify-menu-pro__toggle{display:block!important}.imobify-menu-pro__panel{position:fixed}.imobify-menu-pro__links{flex-direction:column;align-items:stretch}}';
  }

  function init(nav) {
    if (!nav || nav.dataset.ready === 'true') return;
    nav.dataset.ready = 'true';

    var section = nav.closest('[data-section-id]');
    var instanceId = section ? section.getAttribute('data-section-id') : ('menu-' + Math.random().toString(36).slice(2));
    nav.dataset.instanceId = instanceId;

    document.querySelectorAll('.imobify-menu-pro[data-instance-id="' + CSS.escape(instanceId) + '"]').forEach(function (old) {
      if (old !== nav) old.remove();
    });

    buildLinks(nav);
    setFont(nav);
    updateMobileRule(nav);

    if (nav.parentElement !== document.body) document.body.appendChild(nav);
    if (section) {
      section.style.minHeight = '0';
      section.style.height = '0';
      section.style.padding = '0';
      section.style.margin = '0';
      section.style.overflow = 'visible';
    }

    var toggle = nav.querySelector('.imobify-menu-pro__toggle');
    var links = nav.querySelector('.imobify-menu-pro__links');
    var lastY = window.scrollY;
    var ticking = false;

    function close() {
      nav.classList.remove('is-open');
      if (toggle) toggle.setAttribute('aria-expanded', 'false');
      document.documentElement.classList.remove('imobify-menu-open');
    }

    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop || 0;
      var threshold = Number(nav.dataset.scrollThreshold) || 0;
      var active = y > threshold;
      nav.classList.toggle('is-scrolled', active);
      if (nav.dataset.scrollEffect === 'ocultar ao descer' && active) {
        nav.classList.toggle('is-hidden-scroll', y > lastY && y - lastY > 2 && !nav.classList.contains('is-open'));
      } else nav.classList.remove('is-hidden-scroll');
      lastY = y;
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
    }, { passive: true });
    onScroll();

    if (toggle) toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    if (links) links.addEventListener('click', function (event) {
      var anchor = event.target.closest('a');
      if (!anchor) return;
      var href = anchor.getAttribute('href') || '';
      if (bool(nav.dataset.closeOnClick)) close();
      if (!bool(nav.dataset.smoothScroll) || href.charAt(0) !== '#' || href === '#') return;
      var target;
      try { target = document.querySelector(href); } catch (_) { target = null; }
      if (!target) return;
      event.preventDefault();
      var menuHeight = nav.getBoundingClientRect().height;
      var offset = nav.dataset.position === 'topo' ? menuHeight + 8 : 8;
      var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });

    document.addEventListener('click', function (event) {
      if (nav.classList.contains('is-open') && !nav.contains(event.target)) close();
    });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') close(); });
  }

  function scan(root) {
    (root || document).querySelectorAll('.imobify-menu-pro:not([data-ready="true"])').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { scan(document); });
  else scan(document);

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (!(node instanceof Element)) return;
        if (node.matches('.imobify-menu-pro')) init(node);
        scan(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();


(function () {
  "use strict";

  const PLUGIN_ID = "anti-ia-copy-policy";
  const POLICY_NODE_ID = "imobify-anti-ai-policy";
  const JSONLD_ID = "imobify-anti-ai-rights-jsonld";
  const META_ATTR = "data-imobify-anti-ai";

  function toBoolean(value) {
    return String(value).toLowerCase() === "true";
  }

  function clean(value) {
    return String(value || "").trim();
  }

  function setMeta(name, content) {
    let meta = document.head.querySelector(`meta[name="${name}"][${META_ATTR}]`);

    if (!content) {
      if (meta) meta.remove();
      return;
    }

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = name;
      meta.setAttribute(META_ATTR, "true");
      document.head.appendChild(meta);
    }

    meta.content = content;
  }

  function removeGeneratedMetadata() {
    document.head
      .querySelectorAll(`[${META_ATTR}]`)
      .forEach((element) => element.remove());

    document.getElementById(JSONLD_ID)?.remove();
    document.getElementById(POLICY_NODE_ID)?.remove();
  }

  function buildPolicy(config) {
    const restrictions = [];

    if (config.blockReproduction) {
      restrictions.push("cópia, reprodução, redistribuição, adaptação e criação de obras derivadas");
    }

    if (config.blockTraining) {
      restrictions.push("treinamento, ajuste, avaliação, mineração ou alimentação de sistemas de inteligência artificial");
    }

    if (config.blockSummarization) {
      restrictions.push("resumo automatizado ou reformulação substancial por sistemas de inteligência artificial");
    }

    const restrictionText = restrictions.length
      ? `Não autorizado para ${restrictions.join("; ")} sem autorização expressa do titular.`
      : "Uso sujeito aos direitos autorais e às condições declaradas pelo titular.";

    return [
      config.directive,
      restrictionText,
      config.owner ? `Titular: ${config.owner}.` : "",
      config.siteName ? `Obra/site: ${config.siteName}.` : "",
      config.copyrightYear ? `Ano: ${config.copyrightYear}.` : "",
      config.licenseUrl ? `Termos de uso: ${config.licenseUrl}.` : "",
      config.contactUrl ? `Contato para licenciamento: ${config.contactUrl}.` : ""
    ].filter(Boolean).join(" ");
  }

  function injectPolicy(config) {
    removeGeneratedMetadata();

    const policy = buildPolicy(config);
    const copyrightNotice = [
      config.copyrightYear ? `© ${config.copyrightYear}` : "©",
      config.owner || config.siteName || "Todos os direitos reservados"
    ].join(" ");

    const policyNode = document.createElement("aside");
    policyNode.id = POLICY_NODE_ID;
    policyNode.className = "aicp-machine-policy";
    policyNode.setAttribute("aria-hidden", "true");
    policyNode.setAttribute("data-ai-usage-policy", config.blockTraining ? "no-training" : "restricted");
    policyNode.setAttribute("data-content-license", config.licenseUrl || "all-rights-reserved");
    policyNode.textContent = policy;
    document.body.appendChild(policyNode);

    setMeta("copyright", copyrightNotice);
    setMeta("rights", policy);
    setMeta("ai-usage-policy", config.blockTraining ? "no-training" : "restricted-use");
    setMeta("content-license", config.licenseUrl || "all-rights-reserved");

    if (config.addNoAiMeta) {
      setMeta("robots", "noai, noimageai");
      setMeta("googlebot", "noai, noimageai");
    }

    if (config.addJsonLd) {
      const data = {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "name": config.siteName || document.title || "Conteúdo protegido",
        "copyrightNotice": copyrightNotice,
        "copyrightYear": config.copyrightYear || undefined,
        "copyrightHolder": config.owner
          ? { "@type": "Person", "name": config.owner }
          : undefined,
        "license": config.licenseUrl || undefined,
        "usageInfo": config.licenseUrl || config.contactUrl || undefined,
        "description": policy
      };

      Object.keys(data).forEach((key) => {
        if (data[key] === undefined || data[key] === "") delete data[key];
      });

      const script = document.createElement("script");
      script.id = JSONLD_ID;
      script.type = "application/ld+json";
      script.setAttribute(META_ATTR, "true");
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    }
  }

  function readConfig(root) {
    const source = root.querySelector(".aicp-config");
    if (!source) return null;

    return {
      owner: clean(source.dataset.owner),
      siteName: clean(source.dataset.siteName),
      copyrightYear: clean(source.dataset.year),
      contactUrl: clean(source.dataset.contactUrl),
      licenseUrl: clean(source.dataset.licenseUrl),
      blockTraining: toBoolean(source.dataset.blockTraining),
      blockReproduction: toBoolean(source.dataset.blockReproduction),
      blockSummarization: toBoolean(source.dataset.blockSummarization),
      addNoAiMeta: toBoolean(source.dataset.addNoaiMeta),
      addJsonLd: toBoolean(source.dataset.addJsonld),
      directive: clean(source.querySelector(".aicp-directive-source")?.textContent)
    };
  }

  function initialize() {
    const instances = Array.from(document.querySelectorAll(`[data-plugin="${PLUGIN_ID}"]`));
    if (!instances.length) return;

    /* A última instância configurada prevalece para evitar metadados duplicados. */
    const config = readConfig(instances[instances.length - 1]);
    if (config) injectPolicy(config);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();


(function () {
  "use strict";

  const POSITION_MAP = {
    "Inferior direita": "bottom-right",
    "Inferior esquerda": "bottom-left",
    "Superior direita": "top-right",
    "Superior esquerda": "top-left"
  };

  function asBoolean(value) {
    return String(value).toLowerCase() === "true" || value === "1";
  }

  function sanitizePhone(value) {
    return String(value || "").replace(/\D+/g, "");
  }

  function safeEncodedMessage(message, mode) {
    const text = String(message || "").trim();
    if (!text) return "";

    if (mode === "Mensagem já codificada") {
      try {
        return encodeURIComponent(decodeURIComponent(text));
      } catch (_) {
        return text;
      }
    }

    return encodeURIComponent(text);
  }

  function moveToViewportRoot(widget) {
    if (!(widget instanceof HTMLElement)) return;

    /*
     * Um elemento position:fixed pode deixar de usar a viewport quando algum
     * ancestral possui transform, filter, perspective, contain ou animações de
     * reveal. O Imobify envolve as seções em elementos desse tipo.
     *
     * Por isso o widget é movido para document.body. Assim ele fica visível
     * desde o carregamento e não depende da posição da seção na página.
     */
    if (widget.parentElement !== document.body) {
      widget.dataset.iwfpOriginalParent = "section";
      document.body.appendChild(widget);
    }
  }

  function configureWidget(widget) {
    if (!(widget instanceof HTMLElement)) return;

    moveToViewportRoot(widget);

    const button = widget.querySelector(".iwfp-button");
    if (!(button instanceof HTMLAnchorElement)) return;

    const phone = sanitizePhone(widget.dataset.phone);
    const encodedMessage = safeEncodedMessage(
      widget.dataset.message,
      widget.dataset.urlEncoding
    );

    const url = phone
      ? `https://wa.me/${phone}${encodedMessage ? `?text=${encodedMessage}` : ""}`
      : "#";

    widget.dataset.corner = POSITION_MAP[widget.dataset.position] || "bottom-right";
    widget.dataset.label = String(asBoolean(widget.dataset.showLabel));
    widget.dataset.pulse = String(asBoolean(widget.dataset.pulse));
    widget.dataset.bubble = String(asBoolean(widget.dataset.showHoverBubble));
    widget.dataset.hoverPhoto = String(Boolean(String(widget.dataset.hoverImage || "").trim()));

    widget.style.setProperty(
      "--iwfp-offset-x",
      `${Math.max(0, Number(widget.dataset.offsetX) || 0)}px`
    );
    widget.style.setProperty(
      "--iwfp-offset-y",
      `${Math.max(0, Number(widget.dataset.offsetY) || 0)}px`
    );
    widget.style.setProperty(
      "--iwfp-size",
      `${Math.max(44, Number(widget.dataset.buttonSize) || 58)}px`
    );

    button.href = url;

    if (asBoolean(widget.dataset.openNewTab)) {
      button.target = "_blank";
      button.rel = "noopener noreferrer";
    } else {
      button.removeAttribute("target");
      button.removeAttribute("rel");
    }

    button.setAttribute("aria-disabled", phone ? "false" : "true");

    if (!button.dataset.iwfpClickBound) {
      button.addEventListener("click", function (event) {
        if (!sanitizePhone(widget.dataset.phone)) {
          event.preventDefault();
        }
      });
      button.dataset.iwfpClickBound = "true";
    }

    widget.dataset.iwfpReady = "true";
  }

  function initializeAll(root) {
    const scope = root instanceof Element || root instanceof Document ? root : document;

    if (scope instanceof Element && scope.matches(".iwfp-widget")) {
      configureWidget(scope);
    }

    scope.querySelectorAll(".iwfp-widget").forEach(configureWidget);
  }

  function start() {
    initializeAll(document);

    const observer = new MutationObserver(function (mutations) {
      for (const mutation of mutations) {
        if (mutation.type === "attributes") {
          const target = mutation.target;
          if (target instanceof HTMLElement && target.matches(".iwfp-widget")) {
            configureWidget(target);
          }
          continue;
        }

        for (const node of mutation.addedNodes) {
          if (!(node instanceof Element)) continue;
          initializeAll(node);
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "data-phone",
        "data-message",
        "data-url-encoding",
        "data-position",
        "data-offset-x",
        "data-offset-y",
        "data-button-size",
        "data-show-label",
        "data-pulse",
        "data-show-hover-bubble",
        "data-hover-image",
        "data-open-new-tab"
      ]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();


(function(){
  // O Segmento é estrutural. A composição dos slots é feita pelo renderer do Studio.
})();


(function(){
  function init(){
    document.querySelectorAll('[data-plugin="gallery-big-four"]:not([data-ready])').forEach(function(root){
      root.dataset.ready='true';
      var items=root.querySelectorAll('.pp-big-four-item');
      items.forEach(function(item,index){
        item.setAttribute('role','button');
        item.setAttribute('aria-label',item.querySelector('strong')?.textContent||('Imagem '+(index+1)));
        function activate(){items.forEach(function(other){if(other!==item)other.classList.remove('is-active')});item.classList.toggle('is-active');}
        item.addEventListener('click',activate);
        item.addEventListener('keydown',function(event){if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();}});
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();


(function(){
  document.querySelectorAll('[data-plugin="button-single"] .ibs-button').forEach(function(button){
    if(button.getAttribute('target')==='_blank') button.setAttribute('rel','noopener noreferrer');
    if(!button.textContent.trim()) button.setAttribute('aria-disabled','true');
  });
})();


(function () {
  function esc(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeHref(value) {
    var raw = String(value || '').trim();
    if (/^#[A-Za-z][\w:.-]*$/.test(raw)) return raw;
    if (/^(?:\/|\.\/|\.\.\/)(?!\/)/.test(raw)) return raw;
    if (/^(?:https?:|mailto:|tel:)/i.test(raw)) return raw;
    return '#';
  }

  function safeImage(value) {
    var raw = String(value || '').trim();
    if (/^data:image\/(?:avif|gif|jpeg|png|svg\+xml|webp);/i.test(raw)) return raw;
    if (/^(?:https?:)?\/\//i.test(raw)) return raw;
    if (/^(?:\/|\.\/|\.\.\/)(?!\/)/.test(raw)) return raw;
    if (/^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.~%+@()-]+)+(?:\?[A-Za-z0-9_.~!$&'()*+,;=:@%/?-]*)?$/.test(raw)) return raw;
    return '';
  }

  function normalizeSlide(item, index) {
    item = item && typeof item === 'object' ? item : {};
    return {
      id: String(item.id || ('slide-' + (index + 1))),
      image: String(item.image || ''),
      imageAlt: String(item.imageAlt || item.title || ''),
      eyebrow: String(item.eyebrow || ''),
      title: String(item.title || ''),
      text: String(item.text || item.copy || ''),
      showButton: item.showButton !== false && String(item.showButton).toLowerCase() !== 'false',
      buttonText: String(item.buttonText || item.cta || ''),
      buttonLink: String(item.buttonLink || item.link || '#')
    };
  }

  function legacySlides(slider) {
    var items = [];
    for (var n = 1; n <= 3; n += 1) {
      var image = slider.dataset['image' + n] || '';
      var title = slider.dataset['title' + n] || '';
      var eyebrow = slider.dataset['eyebrow' + n] || '';
      var text = slider.dataset['copy' + n] || '';
      var cta = slider.dataset['cta' + n] || '';
      var link = slider.dataset['link' + n] || '#';
      if (!image && !title && !eyebrow && !text && !cta) continue;
      items.push(normalizeSlide({ id:'slide-' + n, image:image, imageAlt:title, eyebrow:eyebrow, title:title, text:text, showButton:Boolean(cta), buttonText:cta, buttonLink:link }, items.length));
    }
    return items;
  }

  function readSlides(slider) {
    try {
      var parsed = JSON.parse(slider.dataset.slides || '[]');
      if (Array.isArray(parsed) && parsed.length) return parsed.map(normalizeSlide);
    } catch (_) {}
    return legacySlides(slider);
  }

  function slideMarkup(item, index) {
    var image = safeImage(item.image);
    var button = item.showButton && item.buttonText.trim()
      ? '<a class="button button-primary" href="' + esc(safeHref(item.buttonLink)) + '">' + esc(item.buttonText) + '</a>'
      : '';
    var eyebrow = item.eyebrow.trim() ? '<p class="eyebrow">' + esc(item.eyebrow) + '</p>' : '';
    var title = item.title.trim() ? '<h2>' + esc(item.title) + '</h2>' : '';
    var text = item.text.trim() ? '<p>' + esc(item.text) + '</p>' : '';
    var img = image ? '<img src="' + esc(image) + '" alt="' + esc(item.imageAlt || item.title) + '"' + (index ? ' loading="lazy"' : '') + ' decoding="async">' : '';
    return '<article class="property-slide' + (index === 0 ? ' is-active' : '') + '" data-slide-index="' + index + '" aria-hidden="' + (index === 0 ? 'false' : 'true') + '">' + img + '<div class="property-slide-shade"></div><div class="property-slide-content">' + eyebrow + title + text + button + '</div></article>';
  }

  function renderSlides(slider) {
    var items = readSlides(slider);
    var track = slider.querySelector('.property-slider-track');
    var dots = slider.querySelector('.property-slider-dots');
    if (track) track.innerHTML = items.map(slideMarkup).join('');
    if (dots) dots.innerHTML = items.map(function (_, index) {
      return '<button type="button" data-slider-dot="' + index + '" class="' + (index === 0 ? 'is-active' : '') + '" aria-label="Ir para slide ' + (index + 1) + '" aria-selected="' + (index === 0 ? 'true' : 'false') + '"></button>';
    }).join('');
    slider.dataset.slideCount = String(items.length);
  }

  function init(root) {
    if (root.dataset.sliderReady === 'true') return;
    root.dataset.sliderReady = 'true';
    var slider = root.matches('.property-slider') ? root : (root.querySelector(':scope > .property-slider') || root);
    renderSlides(slider);
    var slides = Array.from(slider.querySelectorAll('.property-slide'));
    var dots = Array.from(slider.querySelectorAll('[data-slider-dot]'));
    var index = 0;
    var timer = 0;
    var interval = Math.max(2500, Number(slider.dataset.interval) || 5500);
    var autoplay = slider.dataset.autoplay === 'true' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var startX = null;
    slider.style.setProperty('--slider-duration', interval + 'ms');

    function show(next, userAction) {
      if (!slides.length) return;
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        var active = position === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === index);
        dot.setAttribute('aria-selected', position === index ? 'true' : 'false');
      });
      if (userAction) restart();
    }

    function schedule() {
      window.clearTimeout(timer);
      slider.classList.remove('is-running');
      if (!autoplay || slides.length < 2 || document.hidden) return;
      void slider.offsetWidth;
      slider.classList.add('is-running');
      timer = window.setTimeout(function () { show(index + 1); schedule(); }, interval);
    }

    function restart() { schedule(); }
    slider.querySelector('[data-slider-prev]')?.addEventListener('click', function () { show(index - 1, true); });
    slider.querySelector('[data-slider-next]')?.addEventListener('click', function () { show(index + 1, true); });
    dots.forEach(function (dot) { dot.addEventListener('click', function () { show(Number(dot.dataset.sliderDot), true); }); });
    slider.addEventListener('keydown', function (event) {
      if (event.key === 'ArrowLeft') show(index - 1, true);
      if (event.key === 'ArrowRight') show(index + 1, true);
    });
    slider.addEventListener('pointerdown', function (event) { startX = event.clientX; });
    slider.addEventListener('pointerup', function (event) {
      if (startX == null) return;
      var distance = event.clientX - startX;
      startX = null;
      if (Math.abs(distance) > 50) show(index + (distance < 0 ? 1 : -1), true);
    });
    slider.addEventListener('mouseenter', function () { window.clearTimeout(timer); slider.classList.remove('is-running'); });
    slider.addEventListener('mouseleave', schedule);
    document.addEventListener('visibilitychange', schedule);
    show(0);
    schedule();
  }

  function boot() { document.querySelectorAll('[data-plugin="property-slider"]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();


(function(){
  "use strict";
  const SELECTOR='[data-plugin="magazine-text-pro"] .mtp-root';
  function init(scope=document){
    scope.querySelectorAll(SELECTOR).forEach((root)=>{
      if(root.dataset.mtpReady==='true') return;
      root.dataset.mtpReady='true';
      const img=root.querySelector('.mtp-image');
      if(img){
        const sync=()=>root.classList.toggle('mtp-image-unavailable',!img.currentSrc&&!img.getAttribute('src'));
        img.addEventListener('error',()=>root.classList.add('mtp-image-error'),{once:true});
        img.addEventListener('load',()=>root.classList.remove('mtp-image-error'));
        sync();
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>init(),{once:true});
  else init();
})();


(function(){})();


(function(){})();


(function(){
  "use strict";
  const ROOT_SELECTOR='[data-plugin="youtube"] .ytp-root';
  const OBSERVED_ATTRIBUTES=[
    'data-video-id','data-autoplay','data-controls','data-muted','data-loop','data-start','data-end',
    'data-fullscreen','data-keyboard-controls','data-plays-inline','data-captions','data-captions-language',
    'data-interface-language','data-related-videos','data-privacy-enhanced','data-lazy-load'
  ];
  const truthy=(value)=>value===true||value==='true'||value===1||value==='1';
  const seconds=(value)=>Math.max(0,Math.floor(Number(value)||0));

  function normalizeVideoId(value){
    const raw=String(value||'').trim();
    if(/^[A-Za-z0-9_-]{11}$/.test(raw))return raw;

    // Também aceita o conteúdo de src/href ou um iframe copiado do YouTube.
    const embedded=raw.match(/(?:youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
    if(embedded)return embedded[1];
    const watch=raw.match(/(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/watch[^\s"']*[?&]v=([A-Za-z0-9_-]{11})(?:[&#\"'\s]|$)/i);
    if(watch)return watch[1];

    let candidate=raw;
    if(/^www\./i.test(candidate))candidate=`https://${candidate}`;
    try{
      const url=new URL(candidate);
      const host=url.hostname.toLowerCase().replace(/^www\./,'');
      const isShort=host==='youtu.be';
      const isYouTube=host==='youtube.com'||host.endsWith('.youtube.com')||host==='youtube-nocookie.com'||host.endsWith('.youtube-nocookie.com');
      if(!isShort&&!isYouTube)return '';
      let id=isShort?url.pathname.split('/').filter(Boolean)[0]:url.searchParams.get('v');
      if(!id&&isYouTube){
        const parts=url.pathname.split('/').filter(Boolean);
        if(['embed','shorts','live','v'].includes(parts[0]))id=parts[1];
      }
      return /^[A-Za-z0-9_-]{11}$/.test(id||'')?id:'';
    }catch(_){
      return '';
    }
  }

  function sync(root){
    const frame=root.querySelector('.ytp-frame');
    if(!frame)return;
    const id=normalizeVideoId(root.dataset.videoId);
    if(!id){
      root.dataset.playerState='invalid';
      frame.removeAttribute('src');
      return;
    }

    const autoplay=truthy(root.dataset.autoplay);
    const controls=truthy(root.dataset.controls);
    const muted=truthy(root.dataset.muted);
    const loop=truthy(root.dataset.loop);
    const fullscreen=truthy(root.dataset.fullscreen);
    const params=new URLSearchParams();
    if(!String(frame.getAttribute('title')||'').trim())frame.setAttribute('title','Vídeo incorporado do YouTube');
    params.set('autoplay',autoplay?'1':'0');
    params.set('controls',controls?'1':'0');
    params.set('playsinline',truthy(root.dataset.playsInline)?'1':'0');
    params.set('disablekb',truthy(root.dataset.keyboardControls)?'0':'1');
    params.set('fs',fullscreen?'1':'0');
    params.set('rel',truthy(root.dataset.relatedVideos)?'1':'0');
    params.set('hl',root.dataset.interfaceLanguage||'pt-BR');
    if(muted)params.set('mute','1');
    if(loop){
      params.set('loop','1');
      params.set('playlist',id);
    }
    const start=seconds(root.dataset.start);
    const end=seconds(root.dataset.end);
    if(start)params.set('start',String(start));
    if(end&&end>start)params.set('end',String(end));
    if(truthy(root.dataset.captions)){
      params.set('cc_load_policy','1');
      params.set('cc_lang_pref',root.dataset.captionsLanguage||'pt');
    }

    const host=truthy(root.dataset.privacyEnhanced)?'www.youtube-nocookie.com':'www.youtube.com';
    const source=`https://${host}/embed/${id}?${params.toString()}`;
    if(frame.getAttribute('src')!==source)frame.setAttribute('src',source);
    frame.setAttribute('loading',autoplay||!truthy(root.dataset.lazyLoad)?'eager':'lazy');
    const permissions=['accelerometer','autoplay','clipboard-write','encrypted-media','gyroscope','picture-in-picture','web-share'];
    if(fullscreen){
      permissions.push('fullscreen');
      frame.setAttribute('allowfullscreen','');
    }else frame.removeAttribute('allowfullscreen');
    frame.setAttribute('allow',permissions.join('; '));
    root.dataset.playerState='ready';
  }

  function init(scope=document){
    if(typeof Element!=='undefined'&&scope instanceof Element&&scope.matches?.(ROOT_SELECTOR))sync(scope);
    scope.querySelectorAll?.(ROOT_SELECTOR).forEach(sync);
  }

  function rootFromMutationTarget(target){
    if(typeof Element==='undefined'||!(target instanceof Element))return null;
    if(target.matches?.(ROOT_SELECTOR))return target;
    return target.closest?.(ROOT_SELECTOR)||null;
  }

  const observer=typeof MutationObserver!=='undefined'?new MutationObserver((mutations)=>{
    const roots=new Set();
    mutations.forEach((mutation)=>{
      const direct=rootFromMutationTarget(mutation.target);
      if(direct)roots.add(direct);
      mutation.addedNodes?.forEach((node)=>{
        if(!(node instanceof Element))return;
        if(node.matches?.(ROOT_SELECTOR))roots.add(node);
        node.querySelectorAll?.(ROOT_SELECTOR).forEach((root)=>roots.add(root));
      });
    });
    roots.forEach(sync);
  }):null;

  function start(){
    init();
    if(observer&&document.documentElement)observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:OBSERVED_ATTRIBUTES});
  }

  if(typeof window!=='undefined')window.ImobifyYouTube={normalizeVideoId,sync,refresh:init};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();


(function(){
  'use strict';

  function decodeHtml(value){
    return String(value || '').replace(/&amp;/gi, '&').trim();
  }

  function extractIframeSrc(value){
    var text = decodeHtml(value);
    var match = text.match(/<iframe[\s\S]*?\bsrc\s*=\s*["']([^"']+)["']/i);
    return match && match[1] ? decodeHtml(match[1]) : text;
  }

  function safeUrl(value){
    var text = extractIframeSrc(value);
    if (!/^https?:\/\//i.test(text)) return '';
    try { return new URL(text); } catch (e) { return ''; }
  }

  function embedFromUrl(value, address){
    var parsed = safeUrl(value);
    var fallback = String(address || '').trim();

    if (parsed) {
      var host = parsed.hostname.toLowerCase();
      var isGoogle = host === 'google.com' || host.endsWith('.google.com') || host === 'maps.google.com' || host === 'maps.app.goo.gl';

      if (isGoogle) {
        if (/\/maps\/embed/i.test(parsed.pathname) || parsed.searchParams.get('output') === 'embed') {
          return parsed.href;
        }

        var q = parsed.searchParams.get('q') || parsed.searchParams.get('query') || parsed.searchParams.get('ll');
        if (q) {
          return 'https://www.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed';
        }

        var coords = parsed.href.match(/@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/);
        if (coords) {
          return 'https://www.google.com/maps?q=' + encodeURIComponent(coords[1] + ',' + coords[2]) + '&output=embed';
        }
      }
    }

    if (fallback) {
      return 'https://www.google.com/maps?q=' + encodeURIComponent(fallback) + '&output=embed';
    }

    return '';
  }

  function renderMap(section){
    if (!section) return;

    var map = section.querySelector('.location-map');
    if (!map) return;

    var link = map.querySelector('a');
    var addressNode = section.querySelector('.location-layout .address');
    var address = addressNode ? addressNode.textContent.trim() : '';
    var source = link ? (link.getAttribute('href') || '') : '';
    var src = embedFromUrl(source, address);
    if (!src) return;

    var frame = map.querySelector('iframe.location-map-frame');
    if (!frame) {
      frame = document.createElement('iframe');
      frame.className = 'location-map-frame';
      frame.setAttribute('title', 'Localização no Google Maps');
      frame.setAttribute('loading', 'lazy');
      frame.setAttribute('allowfullscreen', '');
      frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      map.insertBefore(frame, map.firstChild);
    }

    if (frame.getAttribute('src') !== src) frame.setAttribute('src', src);
    if (window.__IMOBIFY_EDITOR__) frame.style.pointerEvents = 'none';
    map.classList.add('has-google-map');
  }

  function enhancePlaces(section){
    section.querySelectorAll('.location-places li').forEach(function(item){
      if (item.querySelector('strong')) return;
      var raw = (item.textContent || '').trim();
      var separator = raw.indexOf('|');
      if (separator < 0) return;
      var time = raw.slice(0, separator).trim();
      var place = raw.slice(separator + 1).trim();
      item.textContent = '';
      var strong = document.createElement('strong');
      var span = document.createElement('span');
      strong.textContent = time;
      span.textContent = place;
      item.append(strong, span);
    });
  }

  function boot(scope){
    var root = scope && scope.querySelectorAll ? scope : document;
    root.querySelectorAll('.location-section').forEach(function(section){
      enhancePlaces(section);
      renderMap(section);
    });
  }

  function start(){
    boot(document);
    if (!document.documentElement) return;
    new MutationObserver(function(mutations){
      var needsRender = mutations.some(function(mutation){ return mutation.addedNodes && mutation.addedNodes.length; });
      if (needsRender) boot(document);
    }).observe(document.documentElement, {childList:true, subtree:true});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();


/* @preserve
 * Leaflet 1.9.4, a JS library for interactive maps. https://leafletjs.com
 * (c) 2010-2023 Vladimir Agafonkin, (c) 2010-2011 CloudMade
 */
!function(t,e){"object"==typeof exports&&"undefined"!=typeof module?e(exports):"function"==typeof define&&define.amd?define(["exports"],e):e((t="undefined"!=typeof globalThis?globalThis:t||self).leaflet={})}(this,function(t){"use strict";function l(t){for(var e,i,n=1,o=arguments.length;n<o;n++)for(e in i=arguments[n])t[e]=i[e];return t}var R=Object.create||function(t){return N.prototype=t,new N};function N(){}function a(t,e){var i,n=Array.prototype.slice;return t.bind?t.bind.apply(t,n.call(arguments,1)):(i=n.call(arguments,2),function(){return t.apply(e,i.length?i.concat(n.call(arguments)):arguments)})}var D=0;function h(t){return"_leaflet_id"in t||(t._leaflet_id=++D),t._leaflet_id}function j(t,e,i){var n,o,s=function(){n=!1,o&&(r.apply(i,o),o=!1)},r=function(){n?o=arguments:(t.apply(i,arguments),setTimeout(s,e),n=!0)};return r}function H(t,e,i){var n=e[1],e=e[0],o=n-e;return t===n&&i?t:((t-e)%o+o)%o+e}function u(){return!1}function i(t,e){return!1===e?t:(e=Math.pow(10,void 0===e?6:e),Math.round(t*e)/e)}function W(t){return t.trim?t.trim():t.replace(/^\s+|\s+$/g,"")}function F(t){return W(t).split(/\s+/)}function c(t,e){for(var i in Object.prototype.hasOwnProperty.call(t,"options")||(t.options=t.options?R(t.options):{}),e)t.options[i]=e[i];return t.options}function U(t,e,i){var n,o=[];for(n in t)o.push(encodeURIComponent(i?n.toUpperCase():n)+"="+encodeURIComponent(t[n]));return(e&&-1!==e.indexOf("?")?"&":"?")+o.join("&")}var V=/\{ *([\w_ -]+) *\}/g;function q(t,i){return t.replace(V,function(t,e){e=i[e];if(void 0===e)throw new Error("No value provided for variable "+t);return e="function"==typeof e?e(i):e})}var d=Array.isArray||function(t){return"[object Array]"===Object.prototype.toString.call(t)};function G(t,e){for(var i=0;i<t.length;i++)if(t[i]===e)return i;return-1}var K="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";function Y(t){return window["webkit"+t]||window["moz"+t]||window["ms"+t]}var X=0;function J(t){var e=+new Date,i=Math.max(0,16-(e-X));return X=e+i,window.setTimeout(t,i)}var $=window.requestAnimationFrame||Y("RequestAnimationFrame")||J,Q=window.cancelAnimationFrame||Y("CancelAnimationFrame")||Y("CancelRequestAnimationFrame")||function(t){window.clearTimeout(t)};function x(t,e,i){if(!i||$!==J)return $.call(window,a(t,e));t.call(e)}function r(t){t&&Q.call(window,t)}var tt={__proto__:null,extend:l,create:R,bind:a,get lastId(){return D},stamp:h,throttle:j,wrapNum:H,falseFn:u,formatNum:i,trim:W,splitWords:F,setOptions:c,getParamString:U,template:q,isArray:d,indexOf:G,emptyImageUrl:K,requestFn:$,cancelFn:Q,requestAnimFrame:x,cancelAnimFrame:r};function et(){}et.extend=function(t){function e(){c(this),this.initialize&&this.initialize.apply(this,arguments),this.callInitHooks()}var i,n=e.__super__=this.prototype,o=R(n);for(i in(o.constructor=e).prototype=o,this)Object.prototype.hasOwnProperty.call(this,i)&&"prototype"!==i&&"__super__"!==i&&(e[i]=this[i]);if(t.statics&&l(e,t.statics),t.includes){var s=t.includes;if("undefined"!=typeof L&&L&&L.Mixin){s=d(s)?s:[s];for(var r=0;r<s.length;r++)s[r]===L.Mixin.Events&&console.warn("Deprecated include of L.Mixin.Events: this property will be removed in future releases, please inherit from L.Evented instead.",(new Error).stack)}l.apply(null,[o].concat(t.includes))}return l(o,t),delete o.statics,delete o.includes,o.options&&(o.options=n.options?R(n.options):{},l(o.options,t.options)),o._initHooks=[],o.callInitHooks=function(){if(!this._initHooksCalled){n.callInitHooks&&n.callInitHooks.call(this),this._initHooksCalled=!0;for(var t=0,e=o._initHooks.length;t<e;t++)o._initHooks[t].call(this)}},e},et.include=function(t){var e=this.prototype.options;return l(this.prototype,t),t.options&&(this.prototype.options=e,this.mergeOptions(t.options)),this},et.mergeOptions=function(t){return l(this.prototype.options,t),this},et.addInitHook=function(t){var e=Array.prototype.slice.call(arguments,1),i="function"==typeof t?t:function(){this[t].apply(this,e)};return this.prototype._initHooks=this.prototype._initHooks||[],this.prototype._initHooks.push(i),this};var e={on:function(t,e,i){if("object"==typeof t)for(var n in t)this._on(n,t[n],e);else for(var o=0,s=(t=F(t)).length;o<s;o++)this._on(t[o],e,i);return this},off:function(t,e,i){if(arguments.length)if("object"==typeof t)for(var n in t)this._off(n,t[n],e);else{t=F(t);for(var o=1===arguments.length,s=0,r=t.length;s<r;s++)o?this._off(t[s]):this._off(t[s],e,i)}else delete this._events;return this},_on:function(t,e,i,n){"function"!=typeof e?console.warn("wrong listener type: "+typeof e):!1===this._listens(t,e,i)&&(e={fn:e,ctx:i=i===this?void 0:i},n&&(e.once=!0),this._events=this._events||{},this._events[t]=this._events[t]||[],this._events[t].push(e))},_off:function(t,e,i){var n,o,s;if(this._events&&(n=this._events[t]))if(1===arguments.length){if(this._firingCount)for(o=0,s=n.length;o<s;o++)n[o].fn=u;delete this._events[t]}else"function"!=typeof e?console.warn("wrong listener type: "+typeof e):!1!==(e=this._listens(t,e,i))&&(i=n[e],this._firingCount&&(i.fn=u,this._events[t]=n=n.slice()),n.splice(e,1))},fire:function(t,e,i){if(this.listens(t,i)){var n=l({},e,{type:t,target:this,sourceTarget:e&&e.sourceTarget||this});if(this._events){var o=this._events[t];if(o){this._firingCount=this._firingCount+1||1;for(var s=0,r=o.length;s<r;s++){var a=o[s],h=a.fn;a.once&&this.off(t,h,a.ctx),h.call(a.ctx||this,n)}this._firingCount--}}i&&this._propagateEvent(n)}return this},listens:function(t,e,i,n){"string"!=typeof t&&console.warn('"string" type argument expected');var o=e,s=("function"!=typeof e&&(n=!!e,i=o=void 0),this._events&&this._events[t]);if(s&&s.length&&!1!==this._listens(t,o,i))return!0;if(n)for(var r in this._eventParents)if(this._eventParents[r].listens(t,e,i,n))return!0;return!1},_listens:function(t,e,i){if(this._events){var n=this._events[t]||[];if(!e)return!!n.length;i===this&&(i=void 0);for(var o=0,s=n.length;o<s;o++)if(n[o].fn===e&&n[o].ctx===i)return o}return!1},once:function(t,e,i){if("object"==typeof t)for(var n in t)this._on(n,t[n],e,!0);else for(var o=0,s=(t=F(t)).length;o<s;o++)this._on(t[o],e,i,!0);return this},addEventParent:function(t){return this._eventParents=this._eventParents||{},this._eventParents[h(t)]=t,this},removeEventParent:function(t){return this._eventParents&&delete this._eventParents[h(t)],this},_propagateEvent:function(t){for(var e in this._eventParents)this._eventParents[e].fire(t.type,l({layer:t.target,propagatedFrom:t.target},t),!0)}},it=(e.addEventListener=e.on,e.removeEventListener=e.clearAllEventListeners=e.off,e.addOneTimeEventListener=e.once,e.fireEvent=e.fire,e.hasEventListeners=e.listens,et.extend(e));function p(t,e,i){this.x=i?Math.round(t):t,this.y=i?Math.round(e):e}var nt=Math.trunc||function(t){return 0<t?Math.floor(t):Math.ceil(t)};function m(t,e,i){return t instanceof p?t:d(t)?new p(t[0],t[1]):null==t?t:"object"==typeof t&&"x"in t&&"y"in t?new p(t.x,t.y):new p(t,e,i)}function f(t,e){if(t)for(var i=e?[t,e]:t,n=0,o=i.length;n<o;n++)this.extend(i[n])}function _(t,e){return!t||t instanceof f?t:new f(t,e)}function s(t,e){if(t)for(var i=e?[t,e]:t,n=0,o=i.length;n<o;n++)this.extend(i[n])}function g(t,e){return t instanceof s?t:new s(t,e)}function v(t,e,i){if(isNaN(t)||isNaN(e))throw new Error("Invalid LatLng object: ("+t+", "+e+")");this.lat=+t,this.lng=+e,void 0!==i&&(this.alt=+i)}function w(t,e,i){return t instanceof v?t:d(t)&&"object"!=typeof t[0]?3===t.length?new v(t[0],t[1],t[2]):2===t.length?new v(t[0],t[1]):null:null==t?t:"object"==typeof t&&"lat"in t?new v(t.lat,"lng"in t?t.lng:t.lon,t.alt):void 0===e?null:new v(t,e,i)}p.prototype={clone:function(){return new p(this.x,this.y)},add:function(t){return this.clone()._add(m(t))},_add:function(t){return this.x+=t.x,this.y+=t.y,this},subtract:function(t){return this.clone()._subtract(m(t))},_subtract:function(t){return this.x-=t.x,this.y-=t.y,this},divideBy:function(t){return this.clone()._divideBy(t)},_divideBy:function(t){return this.x/=t,this.y/=t,this},multiplyBy:function(t){return this.clone()._multiplyBy(t)},_multiplyBy:function(t){return this.x*=t,this.y*=t,this},scaleBy:function(t){return new p(this.x*t.x,this.y*t.y)},unscaleBy:function(t){return new p(this.x/t.x,this.y/t.y)},round:function(){return this.clone()._round()},_round:function(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this},floor:function(){return this.clone()._floor()},_floor:function(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this},ceil:function(){return this.clone()._ceil()},_ceil:function(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this},trunc:function(){return this.clone()._trunc()},_trunc:function(){return this.x=nt(this.x),this.y=nt(this.y),this},distanceTo:function(t){var e=(t=m(t)).x-this.x,t=t.y-this.y;return Math.sqrt(e*e+t*t)},equals:function(t){return(t=m(t)).x===this.x&&t.y===this.y},contains:function(t){return t=m(t),Math.abs(t.x)<=Math.abs(this.x)&&Math.abs(t.y)<=Math.abs(this.y)},toString:function(){return"Point("+i(this.x)+", "+i(this.y)+")"}},f.prototype={extend:function(t){var e,i;if(t){if(t instanceof p||"number"==typeof t[0]||"x"in t)e=i=m(t);else if(e=(t=_(t)).min,i=t.max,!e||!i)return this;this.min||this.max?(this.min.x=Math.min(e.x,this.min.x),this.max.x=Math.max(i.x,this.max.x),this.min.y=Math.min(e.y,this.min.y),this.max.y=Math.max(i.y,this.max.y)):(this.min=e.clone(),this.max=i.clone())}return this},getCenter:function(t){return m((this.min.x+this.max.x)/2,(this.min.y+this.max.y)/2,t)},getBottomLeft:function(){return m(this.min.x,this.max.y)},getTopRight:function(){return m(this.max.x,this.min.y)},getTopLeft:function(){return this.min},getBottomRight:function(){return this.max},getSize:function(){return this.max.subtract(this.min)},contains:function(t){var e,i;return(t=("number"==typeof t[0]||t instanceof p?m:_)(t))instanceof f?(e=t.min,i=t.max):e=i=t,e.x>=this.min.x&&i.x<=this.max.x&&e.y>=this.min.y&&i.y<=this.max.y},intersects:function(t){t=_(t);var e=this.min,i=this.max,n=t.min,t=t.max,o=t.x>=e.x&&n.x<=i.x,t=t.y>=e.y&&n.y<=i.y;return o&&t},overlaps:function(t){t=_(t);var e=this.min,i=this.max,n=t.min,t=t.max,o=t.x>e.x&&n.x<i.x,t=t.y>e.y&&n.y<i.y;return o&&t},isValid:function(){return!(!this.min||!this.max)},pad:function(t){var e=this.min,i=this.max,n=Math.abs(e.x-i.x)*t,t=Math.abs(e.y-i.y)*t;return _(m(e.x-n,e.y-t),m(i.x+n,i.y+t))},equals:function(t){return!!t&&(t=_(t),this.min.equals(t.getTopLeft())&&this.max.equals(t.getBottomRight()))}},s.prototype={extend:function(t){var e,i,n=this._southWest,o=this._northEast;if(t instanceof v)i=e=t;else{if(!(t instanceof s))return t?this.extend(w(t)||g(t)):this;if(e=t._southWest,i=t._northEast,!e||!i)return this}return n||o?(n.lat=Math.min(e.lat,n.lat),n.lng=Math.min(e.lng,n.lng),o.lat=Math.max(i.lat,o.lat),o.lng=Math.max(i.lng,o.lng)):(this._southWest=new v(e.lat,e.lng),this._northEast=new v(i.lat,i.lng)),this},pad:function(t){var e=this._southWest,i=this._northEast,n=Math.abs(e.lat-i.lat)*t,t=Math.abs(e.lng-i.lng)*t;return new s(new v(e.lat-n,e.lng-t),new v(i.lat+n,i.lng+t))},getCenter:function(){return new v((this._southWest.lat+this._northEast.lat)/2,(this._southWest.lng+this._northEast.lng)/2)},getSouthWest:function(){return this._southWest},getNorthEast:function(){return this._northEast},getNorthWest:function(){return new v(this.getNorth(),this.getWest())},getSouthEast:function(){return new v(this.getSouth(),this.getEast())},getWest:function(){return this._southWest.lng},getSouth:function(){return this._southWest.lat},getEast:function(){return this._northEast.lng},getNorth:function(){return this._northEast.lat},contains:function(t){t=("number"==typeof t[0]||t instanceof v||"lat"in t?w:g)(t);var e,i,n=this._southWest,o=this._northEast;return t instanceof s?(e=t.getSouthWest(),i=t.getNorthEast()):e=i=t,e.lat>=n.lat&&i.lat<=o.lat&&e.lng>=n.lng&&i.lng<=o.lng},intersects:function(t){t=g(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),t=t.getNorthEast(),o=t.lat>=e.lat&&n.lat<=i.lat,t=t.lng>=e.lng&&n.lng<=i.lng;return o&&t},overlaps:function(t){t=g(t);var e=this._southWest,i=this._northEast,n=t.getSouthWest(),t=t.getNorthEast(),o=t.lat>e.lat&&n.lat<i.lat,t=t.lng>e.lng&&n.lng<i.lng;return o&&t},toBBoxString:function(){return[this.getWest(),this.getSouth(),this.getEast(),this.getNorth()].join(",")},equals:function(t,e){return!!t&&(t=g(t),this._southWest.equals(t.getSouthWest(),e)&&this._northEast.equals(t.getNorthEast(),e))},isValid:function(){return!(!this._southWest||!this._northEast)}};var ot={latLngToPoint:function(t,e){t=this.projection.project(t),e=this.scale(e);return this.transformation._transform(t,e)},pointToLatLng:function(t,e){e=this.scale(e),t=this.transformation.untransform(t,e);return this.projection.unproject(t)},project:function(t){return this.projection.project(t)},unproject:function(t){return this.projection.unproject(t)},scale:function(t){return 256*Math.pow(2,t)},zoom:function(t){return Math.log(t/256)/Math.LN2},getProjectedBounds:function(t){var e;return this.infinite?null:(e=this.projection.bounds,t=this.scale(t),new f(this.transformation.transform(e.min,t),this.transformation.transform(e.max,t)))},infinite:!(v.prototype={equals:function(t,e){return!!t&&(t=w(t),Math.max(Math.abs(this.lat-t.lat),Math.abs(this.lng-t.lng))<=(void 0===e?1e-9:e))},toString:function(t){return"LatLng("+i(this.lat,t)+", "+i(this.lng,t)+")"},distanceTo:function(t){return st.distance(this,w(t))},wrap:function(){return st.wrapLatLng(this)},toBounds:function(t){var t=180*t/40075017,e=t/Math.cos(Math.PI/180*this.lat);return g([this.lat-t,this.lng-e],[this.lat+t,this.lng+e])},clone:function(){return new v(this.lat,this.lng,this.alt)}}),wrapLatLng:function(t){var e=this.wrapLng?H(t.lng,this.wrapLng,!0):t.lng;return new v(this.wrapLat?H(t.lat,this.wrapLat,!0):t.lat,e,t.alt)},wrapLatLngBounds:function(t){var e=t.getCenter(),i=this.wrapLatLng(e),n=e.lat-i.lat,e=e.lng-i.lng;return 0==n&&0==e?t:(i=t.getSouthWest(),t=t.getNorthEast(),new s(new v(i.lat-n,i.lng-e),new v(t.lat-n,t.lng-e)))}},st=l({},ot,{wrapLng:[-180,180],R:6371e3,distance:function(t,e){var i=Math.PI/180,n=t.lat*i,o=e.lat*i,s=Math.sin((e.lat-t.lat)*i/2),e=Math.sin((e.lng-t.lng)*i/2),t=s*s+Math.cos(n)*Math.cos(o)*e*e,i=2*Math.atan2(Math.sqrt(t),Math.sqrt(1-t));return this.R*i}}),rt=6378137,rt={R:rt,MAX_LATITUDE:85.0511287798,project:function(t){var e=Math.PI/180,i=this.MAX_LATITUDE,i=Math.max(Math.min(i,t.lat),-i),i=Math.sin(i*e);return new p(this.R*t.lng*e,this.R*Math.log((1+i)/(1-i))/2)},unproject:function(t){var e=180/Math.PI;return new v((2*Math.atan(Math.exp(t.y/this.R))-Math.PI/2)*e,t.x*e/this.R)},bounds:new f([-(rt=rt*Math.PI),-rt],[rt,rt])};function at(t,e,i,n){d(t)?(this._a=t[0],this._b=t[1],this._c=t[2],this._d=t[3]):(this._a=t,this._b=e,this._c=i,this._d=n)}function ht(t,e,i,n){return new at(t,e,i,n)}at.prototype={transform:function(t,e){return this._transform(t.clone(),e)},_transform:function(t,e){return t.x=(e=e||1)*(this._a*t.x+this._b),t.y=e*(this._c*t.y+this._d),t},untransform:function(t,e){return new p((t.x/(e=e||1)-this._b)/this._a,(t.y/e-this._d)/this._c)}};var lt=l({},st,{code:"EPSG:3857",projection:rt,transformation:ht(lt=.5/(Math.PI*rt.R),.5,-lt,.5)}),ut=l({},lt,{code:"EPSG:900913"});function ct(t){return document.createElementNS("http://www.w3.org/2000/svg",t)}function dt(t,e){for(var i,n,o,s,r="",a=0,h=t.length;a<h;a++){for(i=0,n=(o=t[a]).length;i<n;i++)r+=(i?"L":"M")+(s=o[i]).x+" "+s.y;r+=e?b.svg?"z":"x":""}return r||"M0 0"}var _t=document.documentElement.style,pt="ActiveXObject"in window,mt=pt&&!document.addEventListener,n="msLaunchUri"in navigator&&!("documentMode"in document),ft=y("webkit"),gt=y("android"),vt=y("android 2")||y("android 3"),yt=parseInt(/WebKit\/([0-9]+)|$/.exec(navigator.userAgent)[1],10),yt=gt&&y("Google")&&yt<537&&!("AudioNode"in window),xt=!!window.opera,wt=!n&&y("chrome"),bt=y("gecko")&&!ft&&!xt&&!pt,Pt=!wt&&y("safari"),Lt=y("phantom"),o="OTransition"in _t,Tt=0===navigator.platform.indexOf("Win"),Mt=pt&&"transition"in _t,zt="WebKitCSSMatrix"in window&&"m11"in new window.WebKitCSSMatrix&&!vt,_t="MozPerspective"in _t,Ct=!window.L_DISABLE_3D&&(Mt||zt||_t)&&!o&&!Lt,Zt="undefined"!=typeof orientation||y("mobile"),St=Zt&&ft,Et=Zt&&zt,kt=!window.PointerEvent&&window.MSPointerEvent,Ot=!(!window.PointerEvent&&!kt),At="ontouchstart"in window||!!window.TouchEvent,Bt=!window.L_NO_TOUCH&&(At||Ot),It=Zt&&xt,Rt=Zt&&bt,Nt=1<(window.devicePixelRatio||window.screen.deviceXDPI/window.screen.logicalXDPI),Dt=function(){var t=!1;try{var e=Object.defineProperty({},"passive",{get:function(){t=!0}});window.addEventListener("testPassiveEventSupport",u,e),window.removeEventListener("testPassiveEventSupport",u,e)}catch(t){}return t}(),jt=!!document.createElement("canvas").getContext,Ht=!(!document.createElementNS||!ct("svg").createSVGRect),Wt=!!Ht&&((Wt=document.createElement("div")).innerHTML="<svg/>","http://www.w3.org/2000/svg"===(Wt.firstChild&&Wt.firstChild.namespaceURI));function y(t){return 0<=navigator.userAgent.toLowerCase().indexOf(t)}var b={ie:pt,ielt9:mt,edge:n,webkit:ft,android:gt,android23:vt,androidStock:yt,opera:xt,chrome:wt,gecko:bt,safari:Pt,phantom:Lt,opera12:o,win:Tt,ie3d:Mt,webkit3d:zt,gecko3d:_t,any3d:Ct,mobile:Zt,mobileWebkit:St,mobileWebkit3d:Et,msPointer:kt,pointer:Ot,touch:Bt,touchNative:At,mobileOpera:It,mobileGecko:Rt,retina:Nt,passiveEvents:Dt,canvas:jt,svg:Ht,vml:!Ht&&function(){try{var t=document.createElement("div"),e=(t.innerHTML='<v:shape adj="1"/>',t.firstChild);return e.style.behavior="url(#default#VML)",e&&"object"==typeof e.adj}catch(t){return!1}}(),inlineSvg:Wt,mac:0===navigator.platform.indexOf("Mac"),linux:0===navigator.platform.indexOf("Linux")},Ft=b.msPointer?"MSPointerDown":"pointerdown",Ut=b.msPointer?"MSPointerMove":"pointermove",Vt=b.msPointer?"MSPointerUp":"pointerup",qt=b.msPointer?"MSPointerCancel":"pointercancel",Gt={touchstart:Ft,touchmove:Ut,touchend:Vt,touchcancel:qt},Kt={touchstart:function(t,e){e.MSPOINTER_TYPE_TOUCH&&e.pointerType===e.MSPOINTER_TYPE_TOUCH&&O(e);ee(t,e)},touchmove:ee,touchend:ee,touchcancel:ee},Yt={},Xt=!1;function Jt(t,e,i){return"touchstart"!==e||Xt||(document.addEventListener(Ft,$t,!0),document.addEventListener(Ut,Qt,!0),document.addEventListener(Vt,te,!0),document.addEventListener(qt,te,!0),Xt=!0),Kt[e]?(i=Kt[e].bind(this,i),t.addEventListener(Gt[e],i,!1),i):(console.warn("wrong event specified:",e),u)}function $t(t){Yt[t.pointerId]=t}function Qt(t){Yt[t.pointerId]&&(Yt[t.pointerId]=t)}function te(t){delete Yt[t.pointerId]}function ee(t,e){if(e.pointerType!==(e.MSPOINTER_TYPE_MOUSE||"mouse")){for(var i in e.touches=[],Yt)e.touches.push(Yt[i]);e.changedTouches=[e],t(e)}}var ie=200;function ne(t,i){t.addEventListener("dblclick",i);var n,o=0;function e(t){var e;1!==t.detail?n=t.detail:"mouse"===t.pointerType||t.sourceCapabilities&&!t.sourceCapabilities.firesTouchEvents||((e=Ne(t)).some(function(t){return t instanceof HTMLLabelElement&&t.attributes.for})&&!e.some(function(t){return t instanceof HTMLInputElement||t instanceof HTMLSelectElement})||((e=Date.now())-o<=ie?2===++n&&i(function(t){var e,i,n={};for(i in t)e=t[i],n[i]=e&&e.bind?e.bind(t):e;return(t=n).type="dblclick",n.detail=2,n.isTrusted=!1,n._simulated=!0,n}(t)):n=1,o=e))}return t.addEventListener("click",e),{dblclick:i,simDblclick:e}}var oe,se,re,ae,he,le,ue=we(["transform","webkitTransform","OTransform","MozTransform","msTransform"]),ce=we(["webkitTransition","transition","OTransition","MozTransition","msTransition"]),de="webkitTransition"===ce||"OTransition"===ce?ce+"End":"transitionend";function _e(t){return"string"==typeof t?document.getElementById(t):t}function pe(t,e){var i=t.style[e]||t.currentStyle&&t.currentStyle[e];return"auto"===(i=i&&"auto"!==i||!document.defaultView?i:(t=document.defaultView.getComputedStyle(t,null))?t[e]:null)?null:i}function P(t,e,i){t=document.createElement(t);return t.className=e||"",i&&i.appendChild(t),t}function T(t){var e=t.parentNode;e&&e.removeChild(t)}function me(t){for(;t.firstChild;)t.removeChild(t.firstChild)}function fe(t){var e=t.parentNode;e&&e.lastChild!==t&&e.appendChild(t)}function ge(t){var e=t.parentNode;e&&e.firstChild!==t&&e.insertBefore(t,e.firstChild)}function ve(t,e){return void 0!==t.classList?t.classList.contains(e):0<(t=xe(t)).length&&new RegExp("(^|\\s)"+e+"(\\s|$)").test(t)}function M(t,e){var i;if(void 0!==t.classList)for(var n=F(e),o=0,s=n.length;o<s;o++)t.classList.add(n[o]);else ve(t,e)||ye(t,((i=xe(t))?i+" ":"")+e)}function z(t,e){void 0!==t.classList?t.classList.remove(e):ye(t,W((" "+xe(t)+" ").replace(" "+e+" "," ")))}function ye(t,e){void 0===t.className.baseVal?t.className=e:t.className.baseVal=e}function xe(t){return void 0===(t=t.correspondingElement?t.correspondingElement:t).className.baseVal?t.className:t.className.baseVal}function C(t,e){if("opacity"in t.style)t.style.opacity=e;else if("filter"in t.style){var i=!1,n="DXImageTransform.Microsoft.Alpha";try{i=t.filters.item(n)}catch(t){if(1===e)return}e=Math.round(100*e),i?(i.Enabled=100!==e,i.Opacity=e):t.style.filter+=" progid:"+n+"(opacity="+e+")"}}function we(t){for(var e=document.documentElement.style,i=0;i<t.length;i++)if(t[i]in e)return t[i];return!1}function be(t,e,i){e=e||new p(0,0);t.style[ue]=(b.ie3d?"translate("+e.x+"px,"+e.y+"px)":"translate3d("+e.x+"px,"+e.y+"px,0)")+(i?" scale("+i+")":"")}function Z(t,e){t._leaflet_pos=e,b.any3d?be(t,e):(t.style.left=e.x+"px",t.style.top=e.y+"px")}function Pe(t){return t._leaflet_pos||new p(0,0)}function Le(){S(window,"dragstart",O)}function Te(){k(window,"dragstart",O)}function Me(t){for(;-1===t.tabIndex;)t=t.parentNode;t.style&&(ze(),le=(he=t).style.outlineStyle,t.style.outlineStyle="none",S(window,"keydown",ze))}function ze(){he&&(he.style.outlineStyle=le,le=he=void 0,k(window,"keydown",ze))}function Ce(t){for(;!((t=t.parentNode).offsetWidth&&t.offsetHeight||t===document.body););return t}function Ze(t){var e=t.getBoundingClientRect();return{x:e.width/t.offsetWidth||1,y:e.height/t.offsetHeight||1,boundingClientRect:e}}ae="onselectstart"in document?(re=function(){S(window,"selectstart",O)},function(){k(window,"selectstart",O)}):(se=we(["userSelect","WebkitUserSelect","OUserSelect","MozUserSelect","msUserSelect"]),re=function(){var t;se&&(t=document.documentElement.style,oe=t[se],t[se]="none")},function(){se&&(document.documentElement.style[se]=oe,oe=void 0)});pt={__proto__:null,TRANSFORM:ue,TRANSITION:ce,TRANSITION_END:de,get:_e,getStyle:pe,create:P,remove:T,empty:me,toFront:fe,toBack:ge,hasClass:ve,addClass:M,removeClass:z,setClass:ye,getClass:xe,setOpacity:C,testProp:we,setTransform:be,setPosition:Z,getPosition:Pe,get disableTextSelection(){return re},get enableTextSelection(){return ae},disableImageDrag:Le,enableImageDrag:Te,preventOutline:Me,restoreOutline:ze,getSizedParentNode:Ce,getScale:Ze};function S(t,e,i,n){if(e&&"object"==typeof e)for(var o in e)ke(t,o,e[o],i);else for(var s=0,r=(e=F(e)).length;s<r;s++)ke(t,e[s],i,n);return this}var E="_leaflet_events";function k(t,e,i,n){if(1===arguments.length)Se(t),delete t[E];else if(e&&"object"==typeof e)for(var o in e)Oe(t,o,e[o],i);else if(e=F(e),2===arguments.length)Se(t,function(t){return-1!==G(e,t)});else for(var s=0,r=e.length;s<r;s++)Oe(t,e[s],i,n);return this}function Se(t,e){for(var i in t[E]){var n=i.split(/\d/)[0];e&&!e(n)||Oe(t,n,null,null,i)}}var Ee={mouseenter:"mouseover",mouseleave:"mouseout",wheel:!("onwheel"in window)&&"mousewheel"};function ke(e,t,i,n){var o,s,r=t+h(i)+(n?"_"+h(n):"");e[E]&&e[E][r]||(s=o=function(t){return i.call(n||e,t||window.event)},!b.touchNative&&b.pointer&&0===t.indexOf("touch")?o=Jt(e,t,o):b.touch&&"dblclick"===t?o=ne(e,o):"addEventListener"in e?"touchstart"===t||"touchmove"===t||"wheel"===t||"mousewheel"===t?e.addEventListener(Ee[t]||t,o,!!b.passiveEvents&&{passive:!1}):"mouseenter"===t||"mouseleave"===t?e.addEventListener(Ee[t],o=function(t){t=t||window.event,We(e,t)&&s(t)},!1):e.addEventListener(t,s,!1):e.attachEvent("on"+t,o),e[E]=e[E]||{},e[E][r]=o)}function Oe(t,e,i,n,o){o=o||e+h(i)+(n?"_"+h(n):"");var s,r,i=t[E]&&t[E][o];i&&(!b.touchNative&&b.pointer&&0===e.indexOf("touch")?(n=t,r=i,Gt[s=e]?n.removeEventListener(Gt[s],r,!1):console.warn("wrong event specified:",s)):b.touch&&"dblclick"===e?(n=i,(r=t).removeEventListener("dblclick",n.dblclick),r.removeEventListener("click",n.simDblclick)):"removeEventListener"in t?t.removeEventListener(Ee[e]||e,i,!1):t.detachEvent("on"+e,i),t[E][o]=null)}function Ae(t){return t.stopPropagation?t.stopPropagation():t.originalEvent?t.originalEvent._stopped=!0:t.cancelBubble=!0,this}function Be(t){return ke(t,"wheel",Ae),this}function Ie(t){return S(t,"mousedown touchstart dblclick contextmenu",Ae),t._leaflet_disable_click=!0,this}function O(t){return t.preventDefault?t.preventDefault():t.returnValue=!1,this}function Re(t){return O(t),Ae(t),this}function Ne(t){if(t.composedPath)return t.composedPath();for(var e=[],i=t.target;i;)e.push(i),i=i.parentNode;return e}function De(t,e){var i,n;return e?(n=(i=Ze(e)).boundingClientRect,new p((t.clientX-n.left)/i.x-e.clientLeft,(t.clientY-n.top)/i.y-e.clientTop)):new p(t.clientX,t.clientY)}var je=b.linux&&b.chrome?window.devicePixelRatio:b.mac?3*window.devicePixelRatio:0<window.devicePixelRatio?2*window.devicePixelRatio:1;function He(t){return b.edge?t.wheelDeltaY/2:t.deltaY&&0===t.deltaMode?-t.deltaY/je:t.deltaY&&1===t.deltaMode?20*-t.deltaY:t.deltaY&&2===t.deltaMode?60*-t.deltaY:t.deltaX||t.deltaZ?0:t.wheelDelta?(t.wheelDeltaY||t.wheelDelta)/2:t.detail&&Math.abs(t.detail)<32765?20*-t.detail:t.detail?t.detail/-32765*60:0}function We(t,e){var i=e.relatedTarget;if(!i)return!0;try{for(;i&&i!==t;)i=i.parentNode}catch(t){return!1}return i!==t}var mt={__proto__:null,on:S,off:k,stopPropagation:Ae,disableScrollPropagation:Be,disableClickPropagation:Ie,preventDefault:O,stop:Re,getPropagationPath:Ne,getMousePosition:De,getWheelDelta:He,isExternalTarget:We,addListener:S,removeListener:k},Fe=it.extend({run:function(t,e,i,n){this.stop(),this._el=t,this._inProgress=!0,this._duration=i||.25,this._easeOutPower=1/Math.max(n||.5,.2),this._startPos=Pe(t),this._offset=e.subtract(this._startPos),this._startTime=+new Date,this.fire("start"),this._animate()},stop:function(){this._inProgress&&(this._step(!0),this._complete())},_animate:function(){this._animId=x(this._animate,this),this._step()},_step:function(t){var e=+new Date-this._startTime,i=1e3*this._duration;e<i?this._runFrame(this._easeOut(e/i),t):(this._runFrame(1),this._complete())},_runFrame:function(t,e){t=this._startPos.add(this._offset.multiplyBy(t));e&&t._round(),Z(this._el,t),this.fire("step")},_complete:function(){r(this._animId),this._inProgress=!1,this.fire("end")},_easeOut:function(t){return 1-Math.pow(1-t,this._easeOutPower)}}),A=it.extend({options:{crs:lt,center:void 0,zoom:void 0,minZoom:void 0,maxZoom:void 0,layers:[],maxBounds:void 0,renderer:void 0,zoomAnimation:!0,zoomAnimationThreshold:4,fadeAnimation:!0,markerZoomAnimation:!0,transform3DLimit:8388608,zoomSnap:1,zoomDelta:1,trackResize:!0},initialize:function(t,e){e=c(this,e),this._handlers=[],this._layers={},this._zoomBoundLayers={},this._sizeChanged=!0,this._initContainer(t),this._initLayout(),this._onResize=a(this._onResize,this),this._initEvents(),e.maxBounds&&this.setMaxBounds(e.maxBounds),void 0!==e.zoom&&(this._zoom=this._limitZoom(e.zoom)),e.center&&void 0!==e.zoom&&this.setView(w(e.center),e.zoom,{reset:!0}),this.callInitHooks(),this._zoomAnimated=ce&&b.any3d&&!b.mobileOpera&&this.options.zoomAnimation,this._zoomAnimated&&(this._createAnimProxy(),S(this._proxy,de,this._catchTransitionEnd,this)),this._addLayers(this.options.layers)},setView:function(t,e,i){if((e=void 0===e?this._zoom:this._limitZoom(e),t=this._limitCenter(w(t),e,this.options.maxBounds),i=i||{},this._stop(),this._loaded&&!i.reset&&!0!==i)&&(void 0!==i.animate&&(i.zoom=l({animate:i.animate},i.zoom),i.pan=l({animate:i.animate,duration:i.duration},i.pan)),this._zoom!==e?this._tryAnimatedZoom&&this._tryAnimatedZoom(t,e,i.zoom):this._tryAnimatedPan(t,i.pan)))return clearTimeout(this._sizeTimer),this;return this._resetView(t,e,i.pan&&i.pan.noMoveStart),this},setZoom:function(t,e){return this._loaded?this.setView(this.getCenter(),t,{zoom:e}):(this._zoom=t,this)},zoomIn:function(t,e){return t=t||(b.any3d?this.options.zoomDelta:1),this.setZoom(this._zoom+t,e)},zoomOut:function(t,e){return t=t||(b.any3d?this.options.zoomDelta:1),this.setZoom(this._zoom-t,e)},setZoomAround:function(t,e,i){var n=this.getZoomScale(e),o=this.getSize().divideBy(2),t=(t instanceof p?t:this.latLngToContainerPoint(t)).subtract(o).multiplyBy(1-1/n),n=this.containerPointToLatLng(o.add(t));return this.setView(n,e,{zoom:i})},_getBoundsCenterZoom:function(t,e){e=e||{},t=t.getBounds?t.getBounds():g(t);var i=m(e.paddingTopLeft||e.padding||[0,0]),n=m(e.paddingBottomRight||e.padding||[0,0]),o=this.getBoundsZoom(t,!1,i.add(n));return(o="number"==typeof e.maxZoom?Math.min(e.maxZoom,o):o)===1/0?{center:t.getCenter(),zoom:o}:(e=n.subtract(i).divideBy(2),n=this.project(t.getSouthWest(),o),i=this.project(t.getNorthEast(),o),{center:this.unproject(n.add(i).divideBy(2).add(e),o),zoom:o})},fitBounds:function(t,e){if((t=g(t)).isValid())return t=this._getBoundsCenterZoom(t,e),this.setView(t.center,t.zoom,e);throw new Error("Bounds are not valid.")},fitWorld:function(t){return this.fitBounds([[-90,-180],[90,180]],t)},panTo:function(t,e){return this.setView(t,this._zoom,{pan:e})},panBy:function(t,e){var i;return e=e||{},(t=m(t).round()).x||t.y?(!0===e.animate||this.getSize().contains(t)?(this._panAnim||(this._panAnim=new Fe,this._panAnim.on({step:this._onPanTransitionStep,end:this._onPanTransitionEnd},this)),e.noMoveStart||this.fire("movestart"),!1!==e.animate?(M(this._mapPane,"leaflet-pan-anim"),i=this._getMapPanePos().subtract(t).round(),this._panAnim.run(this._mapPane,i,e.duration||.25,e.easeLinearity)):(this._rawPanBy(t),this.fire("move").fire("moveend"))):this._resetView(this.unproject(this.project(this.getCenter()).add(t)),this.getZoom()),this):this.fire("moveend")},flyTo:function(n,o,t){if(!1===(t=t||{}).animate||!b.any3d)return this.setView(n,o,t);this._stop();var s=this.project(this.getCenter()),r=this.project(n),e=this.getSize(),a=this._zoom,h=(n=w(n),o=void 0===o?a:o,Math.max(e.x,e.y)),i=h*this.getZoomScale(a,o),l=r.distanceTo(s)||1,u=1.42,c=u*u;function d(t){t=(i*i-h*h+(t?-1:1)*c*c*l*l)/(2*(t?i:h)*c*l),t=Math.sqrt(t*t+1)-t;return t<1e-9?-18:Math.log(t)}function _(t){return(Math.exp(t)-Math.exp(-t))/2}function p(t){return(Math.exp(t)+Math.exp(-t))/2}var m=d(0);function f(t){return h*(p(m)*(_(t=m+u*t)/p(t))-_(m))/c}var g=Date.now(),v=(d(1)-m)/u,y=t.duration?1e3*t.duration:1e3*v*.8;return this._moveStart(!0,t.noMoveStart),function t(){var e=(Date.now()-g)/y,i=(1-Math.pow(1-e,1.5))*v;e<=1?(this._flyToFrame=x(t,this),this._move(this.unproject(s.add(r.subtract(s).multiplyBy(f(i)/l)),a),this.getScaleZoom(h/(e=i,h*(p(m)/p(m+u*e))),a),{flyTo:!0})):this._move(n,o)._moveEnd(!0)}.call(this),this},flyToBounds:function(t,e){t=this._getBoundsCenterZoom(t,e);return this.flyTo(t.center,t.zoom,e)},setMaxBounds:function(t){return t=g(t),this.listens("moveend",this._panInsideMaxBounds)&&this.off("moveend",this._panInsideMaxBounds),t.isValid()?(this.options.maxBounds=t,this._loaded&&this._panInsideMaxBounds(),this.on("moveend",this._panInsideMaxBounds)):(this.options.maxBounds=null,this)},setMinZoom:function(t){var e=this.options.minZoom;return this.options.minZoom=t,this._loaded&&e!==t&&(this.fire("zoomlevelschange"),this.getZoom()<this.options.minZoom)?this.setZoom(t):this},setMaxZoom:function(t){var e=this.options.maxZoom;return this.options.maxZoom=t,this._loaded&&e!==t&&(this.fire("zoomlevelschange"),this.getZoom()>this.options.maxZoom)?this.setZoom(t):this},panInsideBounds:function(t,e){this._enforcingBounds=!0;var i=this.getCenter(),t=this._limitCenter(i,this._zoom,g(t));return i.equals(t)||this.panTo(t,e),this._enforcingBounds=!1,this},panInside:function(t,e){var i=m((e=e||{}).paddingTopLeft||e.padding||[0,0]),n=m(e.paddingBottomRight||e.padding||[0,0]),o=this.project(this.getCenter()),t=this.project(t),s=this.getPixelBounds(),i=_([s.min.add(i),s.max.subtract(n)]),s=i.getSize();return i.contains(t)||(this._enforcingBounds=!0,n=t.subtract(i.getCenter()),i=i.extend(t).getSize().subtract(s),o.x+=n.x<0?-i.x:i.x,o.y+=n.y<0?-i.y:i.y,this.panTo(this.unproject(o),e),this._enforcingBounds=!1),this},invalidateSize:function(t){if(!this._loaded)return this;t=l({animate:!1,pan:!0},!0===t?{animate:!0}:t);var e=this.getSize(),i=(this._sizeChanged=!0,this._lastCenter=null,this.getSize()),n=e.divideBy(2).round(),o=i.divideBy(2).round(),n=n.subtract(o);return n.x||n.y?(t.animate&&t.pan?this.panBy(n):(t.pan&&this._rawPanBy(n),this.fire("move"),t.debounceMoveend?(clearTimeout(this._sizeTimer),this._sizeTimer=setTimeout(a(this.fire,this,"moveend"),200)):this.fire("moveend")),this.fire("resize",{oldSize:e,newSize:i})):this},stop:function(){return this.setZoom(this._limitZoom(this._zoom)),this.options.zoomSnap||this.fire("viewreset"),this._stop()},locate:function(t){var e,i;return t=this._locateOptions=l({timeout:1e4,watch:!1},t),"geolocation"in navigator?(e=a(this._handleGeolocationResponse,this),i=a(this._handleGeolocationError,this),t.watch?this._locationWatchId=navigator.geolocation.watchPosition(e,i,t):navigator.geolocation.getCurrentPosition(e,i,t)):this._handleGeolocationError({code:0,message:"Geolocation not supported."}),this},stopLocate:function(){return navigator.geolocation&&navigator.geolocation.clearWatch&&navigator.geolocation.clearWatch(this._locationWatchId),this._locateOptions&&(this._locateOptions.setView=!1),this},_handleGeolocationError:function(t){var e;this._container._leaflet_id&&(e=t.code,t=t.message||(1===e?"permission denied":2===e?"position unavailable":"timeout"),this._locateOptions.setView&&!this._loaded&&this.fitWorld(),this.fire("locationerror",{code:e,message:"Geolocation error: "+t+"."}))},_handleGeolocationResponse:function(t){if(this._container._leaflet_id){var e,i,n=new v(t.coords.latitude,t.coords.longitude),o=n.toBounds(2*t.coords.accuracy),s=this._locateOptions,r=(s.setView&&(e=this.getBoundsZoom(o),this.setView(n,s.maxZoom?Math.min(e,s.maxZoom):e)),{latlng:n,bounds:o,timestamp:t.timestamp});for(i in t.coords)"number"==typeof t.coords[i]&&(r[i]=t.coords[i]);this.fire("locationfound",r)}},addHandler:function(t,e){return e&&(e=this[t]=new e(this),this._handlers.push(e),this.options[t]&&e.enable()),this},remove:function(){if(this._initEvents(!0),this.options.maxBounds&&this.off("moveend",this._panInsideMaxBounds),this._containerId!==this._container._leaflet_id)throw new Error("Map container is being reused by another instance");try{delete this._container._leaflet_id,delete this._containerId}catch(t){this._container._leaflet_id=void 0,this._containerId=void 0}for(var t in void 0!==this._locationWatchId&&this.stopLocate(),this._stop(),T(this._mapPane),this._clearControlPos&&this._clearControlPos(),this._resizeRequest&&(r(this._resizeRequest),this._resizeRequest=null),this._clearHandlers(),this._loaded&&this.fire("unload"),this._layers)this._layers[t].remove();for(t in this._panes)T(this._panes[t]);return this._layers=[],this._panes=[],delete this._mapPane,delete this._renderer,this},createPane:function(t,e){e=P("div","leaflet-pane"+(t?" leaflet-"+t.replace("Pane","")+"-pane":""),e||this._mapPane);return t&&(this._panes[t]=e),e},getCenter:function(){return this._checkIfLoaded(),this._lastCenter&&!this._moved()?this._lastCenter.clone():this.layerPointToLatLng(this._getCenterLayerPoint())},getZoom:function(){return this._zoom},getBounds:function(){var t=this.getPixelBounds();return new s(this.unproject(t.getBottomLeft()),this.unproject(t.getTopRight()))},getMinZoom:function(){return void 0===this.options.minZoom?this._layersMinZoom||0:this.options.minZoom},getMaxZoom:function(){return void 0===this.options.maxZoom?void 0===this._layersMaxZoom?1/0:this._layersMaxZoom:this.options.maxZoom},getBoundsZoom:function(t,e,i){t=g(t),i=m(i||[0,0]);var n=this.getZoom()||0,o=this.getMinZoom(),s=this.getMaxZoom(),r=t.getNorthWest(),t=t.getSouthEast(),i=this.getSize().subtract(i),t=_(this.project(t,n),this.project(r,n)).getSize(),r=b.any3d?this.options.zoomSnap:1,a=i.x/t.x,i=i.y/t.y,t=e?Math.max(a,i):Math.min(a,i),n=this.getScaleZoom(t,n);return r&&(n=Math.round(n/(r/100))*(r/100),n=e?Math.ceil(n/r)*r:Math.floor(n/r)*r),Math.max(o,Math.min(s,n))},getSize:function(){return this._size&&!this._sizeChanged||(this._size=new p(this._container.clientWidth||0,this._container.clientHeight||0),this._sizeChanged=!1),this._size.clone()},getPixelBounds:function(t,e){t=this._getTopLeftPoint(t,e);return new f(t,t.add(this.getSize()))},getPixelOrigin:function(){return this._checkIfLoaded(),this._pixelOrigin},getPixelWorldBounds:function(t){return this.options.crs.getProjectedBounds(void 0===t?this.getZoom():t)},getPane:function(t){return"string"==typeof t?this._panes[t]:t},getPanes:function(){return this._panes},getContainer:function(){return this._container},getZoomScale:function(t,e){var i=this.options.crs;return e=void 0===e?this._zoom:e,i.scale(t)/i.scale(e)},getScaleZoom:function(t,e){var i=this.options.crs,t=(e=void 0===e?this._zoom:e,i.zoom(t*i.scale(e)));return isNaN(t)?1/0:t},project:function(t,e){return e=void 0===e?this._zoom:e,this.options.crs.latLngToPoint(w(t),e)},unproject:function(t,e){return e=void 0===e?this._zoom:e,this.options.crs.pointToLatLng(m(t),e)},layerPointToLatLng:function(t){t=m(t).add(this.getPixelOrigin());return this.unproject(t)},latLngToLayerPoint:function(t){return this.project(w(t))._round()._subtract(this.getPixelOrigin())},wrapLatLng:function(t){return this.options.crs.wrapLatLng(w(t))},wrapLatLngBounds:function(t){return this.options.crs.wrapLatLngBounds(g(t))},distance:function(t,e){return this.options.crs.distance(w(t),w(e))},containerPointToLayerPoint:function(t){return m(t).subtract(this._getMapPanePos())},layerPointToContainerPoint:function(t){return m(t).add(this._getMapPanePos())},containerPointToLatLng:function(t){t=this.containerPointToLayerPoint(m(t));return this.layerPointToLatLng(t)},latLngToContainerPoint:function(t){return this.layerPointToContainerPoint(this.latLngToLayerPoint(w(t)))},mouseEventToContainerPoint:function(t){return De(t,this._container)},mouseEventToLayerPoint:function(t){return this.containerPointToLayerPoint(this.mouseEventToContainerPoint(t))},mouseEventToLatLng:function(t){return this.layerPointToLatLng(this.mouseEventToLayerPoint(t))},_initContainer:function(t){t=this._container=_e(t);if(!t)throw new Error("Map container not found.");if(t._leaflet_id)throw new Error("Map container is already initialized.");S(t,"scroll",this._onScroll,this),this._containerId=h(t)},_initLayout:function(){var t=this._container,e=(this._fadeAnimated=this.options.fadeAnimation&&b.any3d,M(t,"leaflet-container"+(b.touch?" leaflet-touch":"")+(b.retina?" leaflet-retina":"")+(b.ielt9?" leaflet-oldie":"")+(b.safari?" leaflet-safari":"")+(this._fadeAnimated?" leaflet-fade-anim":"")),pe(t,"position"));"absolute"!==e&&"relative"!==e&&"fixed"!==e&&"sticky"!==e&&(t.style.position="relative"),this._initPanes(),this._initControlPos&&this._initControlPos()},_initPanes:function(){var t=this._panes={};this._paneRenderers={},this._mapPane=this.createPane("mapPane",this._container),Z(this._mapPane,new p(0,0)),this.createPane("tilePane"),this.createPane("overlayPane"),this.createPane("shadowPane"),this.createPane("markerPane"),this.createPane("tooltipPane"),this.createPane("popupPane"),this.options.markerZoomAnimation||(M(t.markerPane,"leaflet-zoom-hide"),M(t.shadowPane,"leaflet-zoom-hide"))},_resetView:function(t,e,i){Z(this._mapPane,new p(0,0));var n=!this._loaded,o=(this._loaded=!0,e=this._limitZoom(e),this.fire("viewprereset"),this._zoom!==e);this._moveStart(o,i)._move(t,e)._moveEnd(o),this.fire("viewreset"),n&&this.fire("load")},_moveStart:function(t,e){return t&&this.fire("zoomstart"),e||this.fire("movestart"),this},_move:function(t,e,i,n){void 0===e&&(e=this._zoom);var o=this._zoom!==e;return this._zoom=e,this._lastCenter=t,this._pixelOrigin=this._getNewPixelOrigin(t),n?i&&i.pinch&&this.fire("zoom",i):((o||i&&i.pinch)&&this.fire("zoom",i),this.fire("move",i)),this},_moveEnd:function(t){return t&&this.fire("zoomend"),this.fire("moveend")},_stop:function(){return r(this._flyToFrame),this._panAnim&&this._panAnim.stop(),this},_rawPanBy:function(t){Z(this._mapPane,this._getMapPanePos().subtract(t))},_getZoomSpan:function(){return this.getMaxZoom()-this.getMinZoom()},_panInsideMaxBounds:function(){this._enforcingBounds||this.panInsideBounds(this.options.maxBounds)},_checkIfLoaded:function(){if(!this._loaded)throw new Error("Set map center and zoom first.")},_initEvents:function(t){this._targets={};var e=t?k:S;e((this._targets[h(this._container)]=this)._container,"click dblclick mousedown mouseup mouseover mouseout mousemove contextmenu keypress keydown keyup",this._handleDOMEvent,this),this.options.trackResize&&e(window,"resize",this._onResize,this),b.any3d&&this.options.transform3DLimit&&(t?this.off:this.on).call(this,"moveend",this._onMoveEnd)},_onResize:function(){r(this._resizeRequest),this._resizeRequest=x(function(){this.invalidateSize({debounceMoveend:!0})},this)},_onScroll:function(){this._container.scrollTop=0,this._container.scrollLeft=0},_onMoveEnd:function(){var t=this._getMapPanePos();Math.max(Math.abs(t.x),Math.abs(t.y))>=this.options.transform3DLimit&&this._resetView(this.getCenter(),this.getZoom())},_findEventTargets:function(t,e){for(var i,n=[],o="mouseout"===e||"mouseover"===e,s=t.target||t.srcElement,r=!1;s;){if((i=this._targets[h(s)])&&("click"===e||"preclick"===e)&&this._draggableMoved(i)){r=!0;break}if(i&&i.listens(e,!0)){if(o&&!We(s,t))break;if(n.push(i),o)break}if(s===this._container)break;s=s.parentNode}return n=n.length||r||o||!this.listens(e,!0)?n:[this]},_isClickDisabled:function(t){for(;t&&t!==this._container;){if(t._leaflet_disable_click)return!0;t=t.parentNode}},_handleDOMEvent:function(t){var e,i=t.target||t.srcElement;!this._loaded||i._leaflet_disable_events||"click"===t.type&&this._isClickDisabled(i)||("mousedown"===(e=t.type)&&Me(i),this._fireDOMEvent(t,e))},_mouseEvents:["click","dblclick","mouseover","mouseout","contextmenu"],_fireDOMEvent:function(t,e,i){"click"===t.type&&((a=l({},t)).type="preclick",this._fireDOMEvent(a,a.type,i));var n=this._findEventTargets(t,e);if(i){for(var o=[],s=0;s<i.length;s++)i[s].listens(e,!0)&&o.push(i[s]);n=o.concat(n)}if(n.length){"contextmenu"===e&&O(t);var r,a=n[0],h={originalEvent:t};for("keypress"!==t.type&&"keydown"!==t.type&&"keyup"!==t.type&&(r=a.getLatLng&&(!a._radius||a._radius<=10),h.containerPoint=r?this.latLngToContainerPoint(a.getLatLng()):this.mouseEventToContainerPoint(t),h.layerPoint=this.containerPointToLayerPoint(h.containerPoint),h.latlng=r?a.getLatLng():this.layerPointToLatLng(h.layerPoint)),s=0;s<n.length;s++)if(n[s].fire(e,h,!0),h.originalEvent._stopped||!1===n[s].options.bubblingMouseEvents&&-1!==G(this._mouseEvents,e))return}},_draggableMoved:function(t){return(t=t.dragging&&t.dragging.enabled()?t:this).dragging&&t.dragging.moved()||this.boxZoom&&this.boxZoom.moved()},_clearHandlers:function(){for(var t=0,e=this._handlers.length;t<e;t++)this._handlers[t].disable()},whenReady:function(t,e){return this._loaded?t.call(e||this,{target:this}):this.on("load",t,e),this},_getMapPanePos:function(){return Pe(this._mapPane)||new p(0,0)},_moved:function(){var t=this._getMapPanePos();return t&&!t.equals([0,0])},_getTopLeftPoint:function(t,e){return(t&&void 0!==e?this._getNewPixelOrigin(t,e):this.getPixelOrigin()).subtract(this._getMapPanePos())},_getNewPixelOrigin:function(t,e){var i=this.getSize()._divideBy(2);return this.project(t,e)._subtract(i)._add(this._getMapPanePos())._round()},_latLngToNewLayerPoint:function(t,e,i){i=this._getNewPixelOrigin(i,e);return this.project(t,e)._subtract(i)},_latLngBoundsToNewLayerBounds:function(t,e,i){i=this._getNewPixelOrigin(i,e);return _([this.project(t.getSouthWest(),e)._subtract(i),this.project(t.getNorthWest(),e)._subtract(i),this.project(t.getSouthEast(),e)._subtract(i),this.project(t.getNorthEast(),e)._subtract(i)])},_getCenterLayerPoint:function(){return this.containerPointToLayerPoint(this.getSize()._divideBy(2))},_getCenterOffset:function(t){return this.latLngToLayerPoint(t).subtract(this._getCenterLayerPoint())},_limitCenter:function(t,e,i){var n,o;return!i||(n=this.project(t,e),o=this.getSize().divideBy(2),o=new f(n.subtract(o),n.add(o)),o=this._getBoundsOffset(o,i,e),Math.abs(o.x)<=1&&Math.abs(o.y)<=1)?t:this.unproject(n.add(o),e)},_limitOffset:function(t,e){var i;return e?(i=new f((i=this.getPixelBounds()).min.add(t),i.max.add(t)),t.add(this._getBoundsOffset(i,e))):t},_getBoundsOffset:function(t,e,i){e=_(this.project(e.getNorthEast(),i),this.project(e.getSouthWest(),i)),i=e.min.subtract(t.min),e=e.max.subtract(t.max);return new p(this._rebound(i.x,-e.x),this._rebound(i.y,-e.y))},_rebound:function(t,e){return 0<t+e?Math.round(t-e)/2:Math.max(0,Math.ceil(t))-Math.max(0,Math.floor(e))},_limitZoom:function(t){var e=this.getMinZoom(),i=this.getMaxZoom(),n=b.any3d?this.options.zoomSnap:1;return n&&(t=Math.round(t/n)*n),Math.max(e,Math.min(i,t))},_onPanTransitionStep:function(){this.fire("move")},_onPanTransitionEnd:function(){z(this._mapPane,"leaflet-pan-anim"),this.fire("moveend")},_tryAnimatedPan:function(t,e){t=this._getCenterOffset(t)._trunc();return!(!0!==(e&&e.animate)&&!this.getSize().contains(t))&&(this.panBy(t,e),!0)},_createAnimProxy:function(){var t=this._proxy=P("div","leaflet-proxy leaflet-zoom-animated");this._panes.mapPane.appendChild(t),this.on("zoomanim",function(t){var e=ue,i=this._proxy.style[e];be(this._proxy,this.project(t.center,t.zoom),this.getZoomScale(t.zoom,1)),i===this._proxy.style[e]&&this._animatingZoom&&this._onZoomTransitionEnd()},this),this.on("load moveend",this._animMoveEnd,this),this._on("unload",this._destroyAnimProxy,this)},_destroyAnimProxy:function(){T(this._proxy),this.off("load moveend",this._animMoveEnd,this),delete this._proxy},_animMoveEnd:function(){var t=this.getCenter(),e=this.getZoom();be(this._proxy,this.project(t,e),this.getZoomScale(e,1))},_catchTransitionEnd:function(t){this._animatingZoom&&0<=t.propertyName.indexOf("transform")&&this._onZoomTransitionEnd()},_nothingToAnimate:function(){return!this._container.getElementsByClassName("leaflet-zoom-animated").length},_tryAnimatedZoom:function(t,e,i){if(!this._animatingZoom){if(i=i||{},!this._zoomAnimated||!1===i.animate||this._nothingToAnimate()||Math.abs(e-this._zoom)>this.options.zoomAnimationThreshold)return!1;var n=this.getZoomScale(e),n=this._getCenterOffset(t)._divideBy(1-1/n);if(!0!==i.animate&&!this.getSize().contains(n))return!1;x(function(){this._moveStart(!0,i.noMoveStart||!1)._animateZoom(t,e,!0)},this)}return!0},_animateZoom:function(t,e,i,n){this._mapPane&&(i&&(this._animatingZoom=!0,this._animateToCenter=t,this._animateToZoom=e,M(this._mapPane,"leaflet-zoom-anim")),this.fire("zoomanim",{center:t,zoom:e,noUpdate:n}),this._tempFireZoomEvent||(this._tempFireZoomEvent=this._zoom!==this._animateToZoom),this._move(this._animateToCenter,this._animateToZoom,void 0,!0),setTimeout(a(this._onZoomTransitionEnd,this),250))},_onZoomTransitionEnd:function(){this._animatingZoom&&(this._mapPane&&z(this._mapPane,"leaflet-zoom-anim"),this._animatingZoom=!1,this._move(this._animateToCenter,this._animateToZoom,void 0,!0),this._tempFireZoomEvent&&this.fire("zoom"),delete this._tempFireZoomEvent,this.fire("move"),this._moveEnd(!0))}});function Ue(t){return new B(t)}var B=et.extend({options:{position:"topright"},initialize:function(t){c(this,t)},getPosition:function(){return this.options.position},setPosition:function(t){var e=this._map;return e&&e.removeControl(this),this.options.position=t,e&&e.addControl(this),this},getContainer:function(){return this._container},addTo:function(t){this.remove(),this._map=t;var e=this._container=this.onAdd(t),i=this.getPosition(),t=t._controlCorners[i];return M(e,"leaflet-control"),-1!==i.indexOf("bottom")?t.insertBefore(e,t.firstChild):t.appendChild(e),this._map.on("unload",this.remove,this),this},remove:function(){return this._map&&(T(this._container),this.onRemove&&this.onRemove(this._map),this._map.off("unload",this.remove,this),this._map=null),this},_refocusOnMap:function(t){this._map&&t&&0<t.screenX&&0<t.screenY&&this._map.getContainer().focus()}}),Ve=(A.include({addControl:function(t){return t.addTo(this),this},removeControl:function(t){return t.remove(),this},_initControlPos:function(){var i=this._controlCorners={},n="leaflet-",o=this._controlContainer=P("div",n+"control-container",this._container);function t(t,e){i[t+e]=P("div",n+t+" "+n+e,o)}t("top","left"),t("top","right"),t("bottom","left"),t("bottom","right")},_clearControlPos:function(){for(var t in this._controlCorners)T(this._controlCorners[t]);T(this._controlContainer),delete this._controlCorners,delete this._controlContainer}}),B.extend({options:{collapsed:!0,position:"topright",autoZIndex:!0,hideSingleBase:!1,sortLayers:!1,sortFunction:function(t,e,i,n){return i<n?-1:n<i?1:0}},initialize:function(t,e,i){for(var n in c(this,i),this._layerControlInputs=[],this._layers=[],this._lastZIndex=0,this._handlingClick=!1,this._preventClick=!1,t)this._addLayer(t[n],n);for(n in e)this._addLayer(e[n],n,!0)},onAdd:function(t){this._initLayout(),this._update(),(this._map=t).on("zoomend",this._checkDisabledLayers,this);for(var e=0;e<this._layers.length;e++)this._layers[e].layer.on("add remove",this._onLayerChange,this);return this._container},addTo:function(t){return B.prototype.addTo.call(this,t),this._expandIfNotCollapsed()},onRemove:function(){this._map.off("zoomend",this._checkDisabledLayers,this);for(var t=0;t<this._layers.length;t++)this._layers[t].layer.off("add remove",this._onLayerChange,this)},addBaseLayer:function(t,e){return this._addLayer(t,e),this._map?this._update():this},addOverlay:function(t,e){return this._addLayer(t,e,!0),this._map?this._update():this},removeLayer:function(t){t.off("add remove",this._onLayerChange,this);t=this._getLayer(h(t));return t&&this._layers.splice(this._layers.indexOf(t),1),this._map?this._update():this},expand:function(){M(this._container,"leaflet-control-layers-expanded"),this._section.style.height=null;var t=this._map.getSize().y-(this._container.offsetTop+50);return t<this._section.clientHeight?(M(this._section,"leaflet-control-layers-scrollbar"),this._section.style.height=t+"px"):z(this._section,"leaflet-control-layers-scrollbar"),this._checkDisabledLayers(),this},collapse:function(){return z(this._container,"leaflet-control-layers-expanded"),this},_initLayout:function(){var t="leaflet-control-layers",e=this._container=P("div",t),i=this.options.collapsed,n=(e.setAttribute("aria-haspopup",!0),Ie(e),Be(e),this._section=P("section",t+"-list")),o=(i&&(this._map.on("click",this.collapse,this),S(e,{mouseenter:this._expandSafely,mouseleave:this.collapse},this)),this._layersLink=P("a",t+"-toggle",e));o.href="#",o.title="Layers",o.setAttribute("role","button"),S(o,{keydown:function(t){13===t.keyCode&&this._expandSafely()},click:function(t){O(t),this._expandSafely()}},this),i||this.expand(),this._baseLayersList=P("div",t+"-base",n),this._separator=P("div",t+"-separator",n),this._overlaysList=P("div",t+"-overlays",n),e.appendChild(n)},_getLayer:function(t){for(var e=0;e<this._layers.length;e++)if(this._layers[e]&&h(this._layers[e].layer)===t)return this._layers[e]},_addLayer:function(t,e,i){this._map&&t.on("add remove",this._onLayerChange,this),this._layers.push({layer:t,name:e,overlay:i}),this.options.sortLayers&&this._layers.sort(a(function(t,e){return this.options.sortFunction(t.layer,e.layer,t.name,e.name)},this)),this.options.autoZIndex&&t.setZIndex&&(this._lastZIndex++,t.setZIndex(this._lastZIndex)),this._expandIfNotCollapsed()},_update:function(){if(this._container){me(this._baseLayersList),me(this._overlaysList),this._layerControlInputs=[];for(var t,e,i,n=0,o=0;o<this._layers.length;o++)i=this._layers[o],this._addItem(i),e=e||i.overlay,t=t||!i.overlay,n+=i.overlay?0:1;this.options.hideSingleBase&&(this._baseLayersList.style.display=(t=t&&1<n)?"":"none"),this._separator.style.display=e&&t?"":"none"}return this},_onLayerChange:function(t){this._handlingClick||this._update();var e=this._getLayer(h(t.target)),t=e.overlay?"add"===t.type?"overlayadd":"overlayremove":"add"===t.type?"baselayerchange":null;t&&this._map.fire(t,e)},_createRadioElement:function(t,e){t='<input type="radio" class="leaflet-control-layers-selector" name="'+t+'"'+(e?' checked="checked"':"")+"/>",e=document.createElement("div");return e.innerHTML=t,e.firstChild},_addItem:function(t){var e,i=document.createElement("label"),n=this._map.hasLayer(t.layer),n=(t.overlay?((e=document.createElement("input")).type="checkbox",e.className="leaflet-control-layers-selector",e.defaultChecked=n):e=this._createRadioElement("leaflet-base-layers_"+h(this),n),this._layerControlInputs.push(e),e.layerId=h(t.layer),S(e,"click",this._onInputClick,this),document.createElement("span")),o=(n.innerHTML=" "+t.name,document.createElement("span"));return i.appendChild(o),o.appendChild(e),o.appendChild(n),(t.overlay?this._overlaysList:this._baseLayersList).appendChild(i),this._checkDisabledLayers(),i},_onInputClick:function(){if(!this._preventClick){var t,e,i=this._layerControlInputs,n=[],o=[];this._handlingClick=!0;for(var s=i.length-1;0<=s;s--)t=i[s],e=this._getLayer(t.layerId).layer,t.checked?n.push(e):t.checked||o.push(e);for(s=0;s<o.length;s++)this._map.hasLayer(o[s])&&this._map.removeLayer(o[s]);for(s=0;s<n.length;s++)this._map.hasLayer(n[s])||this._map.addLayer(n[s]);this._handlingClick=!1,this._refocusOnMap()}},_checkDisabledLayers:function(){for(var t,e,i=this._layerControlInputs,n=this._map.getZoom(),o=i.length-1;0<=o;o--)t=i[o],e=this._getLayer(t.layerId).layer,t.disabled=void 0!==e.options.minZoom&&n<e.options.minZoom||void 0!==e.options.maxZoom&&n>e.options.maxZoom},_expandIfNotCollapsed:function(){return this._map&&!this.options.collapsed&&this.expand(),this},_expandSafely:function(){var t=this._section,e=(this._preventClick=!0,S(t,"click",O),this.expand(),this);setTimeout(function(){k(t,"click",O),e._preventClick=!1})}})),qe=B.extend({options:{position:"topleft",zoomInText:'<span aria-hidden="true">+</span>',zoomInTitle:"Zoom in",zoomOutText:'<span aria-hidden="true">&#x2212;</span>',zoomOutTitle:"Zoom out"},onAdd:function(t){var e="leaflet-control-zoom",i=P("div",e+" leaflet-bar"),n=this.options;return this._zoomInButton=this._createButton(n.zoomInText,n.zoomInTitle,e+"-in",i,this._zoomIn),this._zoomOutButton=this._createButton(n.zoomOutText,n.zoomOutTitle,e+"-out",i,this._zoomOut),this._updateDisabled(),t.on("zoomend zoomlevelschange",this._updateDisabled,this),i},onRemove:function(t){t.off("zoomend zoomlevelschange",this._updateDisabled,this)},disable:function(){return this._disabled=!0,this._updateDisabled(),this},enable:function(){return this._disabled=!1,this._updateDisabled(),this},_zoomIn:function(t){!this._disabled&&this._map._zoom<this._map.getMaxZoom()&&this._map.zoomIn(this._map.options.zoomDelta*(t.shiftKey?3:1))},_zoomOut:function(t){!this._disabled&&this._map._zoom>this._map.getMinZoom()&&this._map.zoomOut(this._map.options.zoomDelta*(t.shiftKey?3:1))},_createButton:function(t,e,i,n,o){i=P("a",i,n);return i.innerHTML=t,i.href="#",i.title=e,i.setAttribute("role","button"),i.setAttribute("aria-label",e),Ie(i),S(i,"click",Re),S(i,"click",o,this),S(i,"click",this._refocusOnMap,this),i},_updateDisabled:function(){var t=this._map,e="leaflet-disabled";z(this._zoomInButton,e),z(this._zoomOutButton,e),this._zoomInButton.setAttribute("aria-disabled","false"),this._zoomOutButton.setAttribute("aria-disabled","false"),!this._disabled&&t._zoom!==t.getMinZoom()||(M(this._zoomOutButton,e),this._zoomOutButton.setAttribute("aria-disabled","true")),!this._disabled&&t._zoom!==t.getMaxZoom()||(M(this._zoomInButton,e),this._zoomInButton.setAttribute("aria-disabled","true"))}}),Ge=(A.mergeOptions({zoomControl:!0}),A.addInitHook(function(){this.options.zoomControl&&(this.zoomControl=new qe,this.addControl(this.zoomControl))}),B.extend({options:{position:"bottomleft",maxWidth:100,metric:!0,imperial:!0},onAdd:function(t){var e="leaflet-control-scale",i=P("div",e),n=this.options;return this._addScales(n,e+"-line",i),t.on(n.updateWhenIdle?"moveend":"move",this._update,this),t.whenReady(this._update,this),i},onRemove:function(t){t.off(this.options.updateWhenIdle?"moveend":"move",this._update,this)},_addScales:function(t,e,i){t.metric&&(this._mScale=P("div",e,i)),t.imperial&&(this._iScale=P("div",e,i))},_update:function(){var t=this._map,e=t.getSize().y/2,t=t.distance(t.containerPointToLatLng([0,e]),t.containerPointToLatLng([this.options.maxWidth,e]));this._updateScales(t)},_updateScales:function(t){this.options.metric&&t&&this._updateMetric(t),this.options.imperial&&t&&this._updateImperial(t)},_updateMetric:function(t){var e=this._getRoundNum(t);this._updateScale(this._mScale,e<1e3?e+" m":e/1e3+" km",e/t)},_updateImperial:function(t){var e,i,t=3.2808399*t;5280<t?(i=this._getRoundNum(e=t/5280),this._updateScale(this._iScale,i+" mi",i/e)):(i=this._getRoundNum(t),this._updateScale(this._iScale,i+" ft",i/t))},_updateScale:function(t,e,i){t.style.width=Math.round(this.options.maxWidth*i)+"px",t.innerHTML=e},_getRoundNum:function(t){var e=Math.pow(10,(Math.floor(t)+"").length-1),t=t/e;return e*(t=10<=t?10:5<=t?5:3<=t?3:2<=t?2:1)}})),Ke=B.extend({options:{position:"bottomright",prefix:'<a href="https://newedition.com.br" title="Roberto Fettuccia">'+"Roberto Fettuccia</a>"},initialize:function(t){c(this,t),this._attributions={}},onAdd:function(t){for(var e in(t.attributionControl=this)._container=P("div","leaflet-control-attribution"),Ie(this._container),t._layers)t._layers[e].getAttribution&&this.addAttribution(t._layers[e].getAttribution());return this._update(),t.on("layeradd",this._addAttribution,this),this._container},onRemove:function(t){t.off("layeradd",this._addAttribution,this)},_addAttribution:function(t){t.layer.getAttribution&&(this.addAttribution(t.layer.getAttribution()),t.layer.once("remove",function(){this.removeAttribution(t.layer.getAttribution())},this))},setPrefix:function(t){return this.options.prefix=t,this._update(),this},addAttribution:function(t){return t&&(this._attributions[t]||(this._attributions[t]=0),this._attributions[t]++,this._update()),this},removeAttribution:function(t){return t&&this._attributions[t]&&(this._attributions[t]--,this._update()),this},_update:function(){if(this._map){var t,e=[];for(t in this._attributions)this._attributions[t]&&e.push(t);var i=[];this.options.prefix&&i.push(this.options.prefix),e.length&&i.push(e.join(", ")),this._container.innerHTML=i.join(' <span aria-hidden="true">|</span> ')}}}),n=(A.mergeOptions({attributionControl:!0}),A.addInitHook(function(){this.options.attributionControl&&(new Ke).addTo(this)}),B.Layers=Ve,B.Zoom=qe,B.Scale=Ge,B.Attribution=Ke,Ue.layers=function(t,e,i){return new Ve(t,e,i)},Ue.zoom=function(t){return new qe(t)},Ue.scale=function(t){return new Ge(t)},Ue.attribution=function(t){return new Ke(t)},et.extend({initialize:function(t){this._map=t},enable:function(){return this._enabled||(this._enabled=!0,this.addHooks()),this},disable:function(){return this._enabled&&(this._enabled=!1,this.removeHooks()),this},enabled:function(){return!!this._enabled}})),ft=(n.addTo=function(t,e){return t.addHandler(e,this),this},{Events:e}),Ye=b.touch?"touchstart mousedown":"mousedown",Xe=it.extend({options:{clickTolerance:3},initialize:function(t,e,i,n){c(this,n),this._element=t,this._dragStartTarget=e||t,this._preventOutline=i},enable:function(){this._enabled||(S(this._dragStartTarget,Ye,this._onDown,this),this._enabled=!0)},disable:function(){this._enabled&&(Xe._dragging===this&&this.finishDrag(!0),k(this._dragStartTarget,Ye,this._onDown,this),this._enabled=!1,this._moved=!1)},_onDown:function(t){var e,i;this._enabled&&(this._moved=!1,ve(this._element,"leaflet-zoom-anim")||(t.touches&&1!==t.touches.length?Xe._dragging===this&&this.finishDrag():Xe._dragging||t.shiftKey||1!==t.which&&1!==t.button&&!t.touches||((Xe._dragging=this)._preventOutline&&Me(this._element),Le(),re(),this._moving||(this.fire("down"),i=t.touches?t.touches[0]:t,e=Ce(this._element),this._startPoint=new p(i.clientX,i.clientY),this._startPos=Pe(this._element),this._parentScale=Ze(e),i="mousedown"===t.type,S(document,i?"mousemove":"touchmove",this._onMove,this),S(document,i?"mouseup":"touchend touchcancel",this._onUp,this)))))},_onMove:function(t){var e;this._enabled&&(t.touches&&1<t.touches.length?this._moved=!0:!(e=new p((e=t.touches&&1===t.touches.length?t.touches[0]:t).clientX,e.clientY)._subtract(this._startPoint)).x&&!e.y||Math.abs(e.x)+Math.abs(e.y)<this.options.clickTolerance||(e.x/=this._parentScale.x,e.y/=this._parentScale.y,O(t),this._moved||(this.fire("dragstart"),this._moved=!0,M(document.body,"leaflet-dragging"),this._lastTarget=t.target||t.srcElement,window.SVGElementInstance&&this._lastTarget instanceof window.SVGElementInstance&&(this._lastTarget=this._lastTarget.correspondingUseElement),M(this._lastTarget,"leaflet-drag-target")),this._newPos=this._startPos.add(e),this._moving=!0,this._lastEvent=t,this._updatePosition()))},_updatePosition:function(){var t={originalEvent:this._lastEvent};this.fire("predrag",t),Z(this._element,this._newPos),this.fire("drag",t)},_onUp:function(){this._enabled&&this.finishDrag()},finishDrag:function(t){z(document.body,"leaflet-dragging"),this._lastTarget&&(z(this._lastTarget,"leaflet-drag-target"),this._lastTarget=null),k(document,"mousemove touchmove",this._onMove,this),k(document,"mouseup touchend touchcancel",this._onUp,this),Te(),ae();var e=this._moved&&this._moving;this._moving=!1,Xe._dragging=!1,e&&this.fire("dragend",{noInertia:t,distance:this._newPos.distanceTo(this._startPos)})}});function Je(t,e,i){for(var n,o,s,r,a,h,l,u=[1,4,2,8],c=0,d=t.length;c<d;c++)t[c]._code=si(t[c],e);for(s=0;s<4;s++){for(h=u[s],n=[],c=0,o=(d=t.length)-1;c<d;o=c++)r=t[c],a=t[o],r._code&h?a._code&h||((l=oi(a,r,h,e,i))._code=si(l,e),n.push(l)):(a._code&h&&((l=oi(a,r,h,e,i))._code=si(l,e),n.push(l)),n.push(r));t=n}return t}function $e(t,e){var i,n,o,s,r,a,h;if(!t||0===t.length)throw new Error("latlngs not passed");I(t)||(console.warn("latlngs are not flat! Only the first ring will be used"),t=t[0]);for(var l=w([0,0]),u=g(t),c=(u.getNorthWest().distanceTo(u.getSouthWest())*u.getNorthEast().distanceTo(u.getNorthWest())<1700&&(l=Qe(t)),t.length),d=[],_=0;_<c;_++){var p=w(t[_]);d.push(e.project(w([p.lat-l.lat,p.lng-l.lng])))}for(_=r=a=h=0,i=c-1;_<c;i=_++)n=d[_],o=d[i],s=n.y*o.x-o.y*n.x,a+=(n.x+o.x)*s,h+=(n.y+o.y)*s,r+=3*s;u=0===r?d[0]:[a/r,h/r],u=e.unproject(m(u));return w([u.lat+l.lat,u.lng+l.lng])}function Qe(t){for(var e=0,i=0,n=0,o=0;o<t.length;o++){var s=w(t[o]);e+=s.lat,i+=s.lng,n++}return w([e/n,i/n])}var ti,gt={__proto__:null,clipPolygon:Je,polygonCenter:$e,centroid:Qe};function ei(t,e){if(e&&t.length){var i=t=function(t,e){for(var i=[t[0]],n=1,o=0,s=t.length;n<s;n++)(function(t,e){var i=e.x-t.x,e=e.y-t.y;return i*i+e*e})(t[n],t[o])>e&&(i.push(t[n]),o=n);o<s-1&&i.push(t[s-1]);return i}(t,e=e*e),n=i.length,o=new(typeof Uint8Array!=void 0+""?Uint8Array:Array)(n);o[0]=o[n-1]=1,function t(e,i,n,o,s){var r,a,h,l=0;for(a=o+1;a<=s-1;a++)h=ri(e[a],e[o],e[s],!0),l<h&&(r=a,l=h);n<l&&(i[r]=1,t(e,i,n,o,r),t(e,i,n,r,s))}(i,o,e,0,n-1);var s,r=[];for(s=0;s<n;s++)o[s]&&r.push(i[s]);return r}return t.slice()}function ii(t,e,i){return Math.sqrt(ri(t,e,i,!0))}function ni(t,e,i,n,o){var s,r,a,h=n?ti:si(t,i),l=si(e,i);for(ti=l;;){if(!(h|l))return[t,e];if(h&l)return!1;a=si(r=oi(t,e,s=h||l,i,o),i),s===h?(t=r,h=a):(e=r,l=a)}}function oi(t,e,i,n,o){var s,r,a=e.x-t.x,e=e.y-t.y,h=n.min,n=n.max;return 8&i?(s=t.x+a*(n.y-t.y)/e,r=n.y):4&i?(s=t.x+a*(h.y-t.y)/e,r=h.y):2&i?(s=n.x,r=t.y+e*(n.x-t.x)/a):1&i&&(s=h.x,r=t.y+e*(h.x-t.x)/a),new p(s,r,o)}function si(t,e){var i=0;return t.x<e.min.x?i|=1:t.x>e.max.x&&(i|=2),t.y<e.min.y?i|=4:t.y>e.max.y&&(i|=8),i}function ri(t,e,i,n){var o=e.x,e=e.y,s=i.x-o,r=i.y-e,a=s*s+r*r;return 0<a&&(1<(a=((t.x-o)*s+(t.y-e)*r)/a)?(o=i.x,e=i.y):0<a&&(o+=s*a,e+=r*a)),s=t.x-o,r=t.y-e,n?s*s+r*r:new p(o,e)}function I(t){return!d(t[0])||"object"!=typeof t[0][0]&&void 0!==t[0][0]}function ai(t){return console.warn("Deprecated use of _flat, please use L.LineUtil.isFlat instead."),I(t)}function hi(t,e){var i,n,o,s,r,a;if(!t||0===t.length)throw new Error("latlngs not passed");I(t)||(console.warn("latlngs are not flat! Only the first ring will be used"),t=t[0]);for(var h=w([0,0]),l=g(t),u=(l.getNorthWest().distanceTo(l.getSouthWest())*l.getNorthEast().distanceTo(l.getNorthWest())<1700&&(h=Qe(t)),t.length),c=[],d=0;d<u;d++){var _=w(t[d]);c.push(e.project(w([_.lat-h.lat,_.lng-h.lng])))}for(i=d=0;d<u-1;d++)i+=c[d].distanceTo(c[d+1])/2;if(0===i)a=c[0];else for(n=d=0;d<u-1;d++)if(o=c[d],s=c[d+1],i<(n+=r=o.distanceTo(s))){a=[s.x-(r=(n-i)/r)*(s.x-o.x),s.y-r*(s.y-o.y)];break}l=e.unproject(m(a));return w([l.lat+h.lat,l.lng+h.lng])}var vt={__proto__:null,simplify:ei,pointToSegmentDistance:ii,closestPointOnSegment:function(t,e,i){return ri(t,e,i)},clipSegment:ni,_getEdgeIntersection:oi,_getBitCode:si,_sqClosestPointOnSegment:ri,isFlat:I,_flat:ai,polylineCenter:hi},yt={project:function(t){return new p(t.lng,t.lat)},unproject:function(t){return new v(t.y,t.x)},bounds:new f([-180,-90],[180,90])},xt={R:6378137,R_MINOR:6356752.314245179,bounds:new f([-20037508.34279,-15496570.73972],[20037508.34279,18764656.23138]),project:function(t){var e=Math.PI/180,i=this.R,n=t.lat*e,o=this.R_MINOR/i,o=Math.sqrt(1-o*o),s=o*Math.sin(n),s=Math.tan(Math.PI/4-n/2)/Math.pow((1-s)/(1+s),o/2),n=-i*Math.log(Math.max(s,1e-10));return new p(t.lng*e*i,n)},unproject:function(t){for(var e,i=180/Math.PI,n=this.R,o=this.R_MINOR/n,s=Math.sqrt(1-o*o),r=Math.exp(-t.y/n),a=Math.PI/2-2*Math.atan(r),h=0,l=.1;h<15&&1e-7<Math.abs(l);h++)e=s*Math.sin(a),e=Math.pow((1-e)/(1+e),s/2),a+=l=Math.PI/2-2*Math.atan(r*e)-a;return new v(a*i,t.x*i/n)}},wt={__proto__:null,LonLat:yt,Mercator:xt,SphericalMercator:rt},Pt=l({},st,{code:"EPSG:3395",projection:xt,transformation:ht(bt=.5/(Math.PI*xt.R),.5,-bt,.5)}),li=l({},st,{code:"EPSG:4326",projection:yt,transformation:ht(1/180,1,-1/180,.5)}),Lt=l({},ot,{projection:yt,transformation:ht(1,0,-1,0),scale:function(t){return Math.pow(2,t)},zoom:function(t){return Math.log(t)/Math.LN2},distance:function(t,e){var i=e.lng-t.lng,e=e.lat-t.lat;return Math.sqrt(i*i+e*e)},infinite:!0}),o=(ot.Earth=st,ot.EPSG3395=Pt,ot.EPSG3857=lt,ot.EPSG900913=ut,ot.EPSG4326=li,ot.Simple=Lt,it.extend({options:{pane:"overlayPane",attribution:null,bubblingMouseEvents:!0},addTo:function(t){return t.addLayer(this),this},remove:function(){return this.removeFrom(this._map||this._mapToAdd)},removeFrom:function(t){return t&&t.removeLayer(this),this},getPane:function(t){return this._map.getPane(t?this.options[t]||t:this.options.pane)},addInteractiveTarget:function(t){return this._map._targets[h(t)]=this},removeInteractiveTarget:function(t){return delete this._map._targets[h(t)],this},getAttribution:function(){return this.options.attribution},_layerAdd:function(t){var e,i=t.target;i.hasLayer(this)&&(this._map=i,this._zoomAnimated=i._zoomAnimated,this.getEvents&&(e=this.getEvents(),i.on(e,this),this.once("remove",function(){i.off(e,this)},this)),this.onAdd(i),this.fire("add"),i.fire("layeradd",{layer:this}))}})),ui=(A.include({addLayer:function(t){var e;if(t._layerAdd)return e=h(t),this._layers[e]||((this._layers[e]=t)._mapToAdd=this,t.beforeAdd&&t.beforeAdd(this),this.whenReady(t._layerAdd,t)),this;throw new Error("The provided object is not a Layer.")},removeLayer:function(t){var e=h(t);return this._layers[e]&&(this._loaded&&t.onRemove(this),delete this._layers[e],this._loaded&&(this.fire("layerremove",{layer:t}),t.fire("remove")),t._map=t._mapToAdd=null),this},hasLayer:function(t){return h(t)in this._layers},eachLayer:function(t,e){for(var i in this._layers)t.call(e,this._layers[i]);return this},_addLayers:function(t){for(var e=0,i=(t=t?d(t)?t:[t]:[]).length;e<i;e++)this.addLayer(t[e])},_addZoomLimit:function(t){isNaN(t.options.maxZoom)&&isNaN(t.options.minZoom)||(this._zoomBoundLayers[h(t)]=t,this._updateZoomLevels())},_removeZoomLimit:function(t){t=h(t);this._zoomBoundLayers[t]&&(delete this._zoomBoundLayers[t],this._updateZoomLevels())},_updateZoomLevels:function(){var t,e=1/0,i=-1/0,n=this._getZoomSpan();for(t in this._zoomBoundLayers)var o=this._zoomBoundLayers[t].options,e=void 0===o.minZoom?e:Math.min(e,o.minZoom),i=void 0===o.maxZoom?i:Math.max(i,o.maxZoom);this._layersMaxZoom=i===-1/0?void 0:i,this._layersMinZoom=e===1/0?void 0:e,n!==this._getZoomSpan()&&this.fire("zoomlevelschange"),void 0===this.options.maxZoom&&this._layersMaxZoom&&this.getZoom()>this._layersMaxZoom&&this.setZoom(this._layersMaxZoom),void 0===this.options.minZoom&&this._layersMinZoom&&this.getZoom()<this._layersMinZoom&&this.setZoom(this._layersMinZoom)}}),o.extend({initialize:function(t,e){var i,n;if(c(this,e),this._layers={},t)for(i=0,n=t.length;i<n;i++)this.addLayer(t[i])},addLayer:function(t){var e=this.getLayerId(t);return this._layers[e]=t,this._map&&this._map.addLayer(t),this},removeLayer:function(t){t=t in this._layers?t:this.getLayerId(t);return this._map&&this._layers[t]&&this._map.removeLayer(this._layers[t]),delete this._layers[t],this},hasLayer:function(t){return("number"==typeof t?t:this.getLayerId(t))in this._layers},clearLayers:function(){return this.eachLayer(this.removeLayer,this)},invoke:function(t){var e,i,n=Array.prototype.slice.call(arguments,1);for(e in this._layers)(i=this._layers[e])[t]&&i[t].apply(i,n);return this},onAdd:function(t){this.eachLayer(t.addLayer,t)},onRemove:function(t){this.eachLayer(t.removeLayer,t)},eachLayer:function(t,e){for(var i in this._layers)t.call(e,this._layers[i]);return this},getLayer:function(t){return this._layers[t]},getLayers:function(){var t=[];return this.eachLayer(t.push,t),t},setZIndex:function(t){return this.invoke("setZIndex",t)},getLayerId:h})),ci=ui.extend({addLayer:function(t){return this.hasLayer(t)?this:(t.addEventParent(this),ui.prototype.addLayer.call(this,t),this.fire("layeradd",{layer:t}))},removeLayer:function(t){return this.hasLayer(t)?((t=t in this._layers?this._layers[t]:t).removeEventParent(this),ui.prototype.removeLayer.call(this,t),this.fire("layerremove",{layer:t})):this},setStyle:function(t){return this.invoke("setStyle",t)},bringToFront:function(){return this.invoke("bringToFront")},bringToBack:function(){return this.invoke("bringToBack")},getBounds:function(){var t,e=new s;for(t in this._layers){var i=this._layers[t];e.extend(i.getBounds?i.getBounds():i.getLatLng())}return e}}),di=et.extend({options:{popupAnchor:[0,0],tooltipAnchor:[0,0],crossOrigin:!1},initialize:function(t){c(this,t)},createIcon:function(t){return this._createIcon("icon",t)},createShadow:function(t){return this._createIcon("shadow",t)},_createIcon:function(t,e){var i=this._getIconUrl(t);if(i)return i=this._createImg(i,e&&"IMG"===e.tagName?e:null),this._setIconStyles(i,t),!this.options.crossOrigin&&""!==this.options.crossOrigin||(i.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),i;if("icon"===t)throw new Error("iconUrl not set in Icon options (see the docs).");return null},_setIconStyles:function(t,e){var i=this.options,n=i[e+"Size"],n=m(n="number"==typeof n?[n,n]:n),o=m("shadow"===e&&i.shadowAnchor||i.iconAnchor||n&&n.divideBy(2,!0));t.className="leaflet-marker-"+e+" "+(i.className||""),o&&(t.style.marginLeft=-o.x+"px",t.style.marginTop=-o.y+"px"),n&&(t.style.width=n.x+"px",t.style.height=n.y+"px")},_createImg:function(t,e){return(e=e||document.createElement("img")).src=t,e},_getIconUrl:function(t){return b.retina&&this.options[t+"RetinaUrl"]||this.options[t+"Url"]}});var _i=di.extend({options:{iconUrl:"marker-icon.png",iconRetinaUrl:"marker-icon-2x.png",shadowUrl:"marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],tooltipAnchor:[16,-28],shadowSize:[41,41]},_getIconUrl:function(t){return"string"!=typeof _i.imagePath&&(_i.imagePath=this._detectIconPath()),(this.options.imagePath||_i.imagePath)+di.prototype._getIconUrl.call(this,t)},_stripUrl:function(t){function e(t,e,i){return(e=e.exec(t))&&e[i]}return(t=e(t,/^url\((['"])?(.+)\1\)$/,2))&&e(t,/^(.*)marker-icon\.png$/,1)},_detectIconPath:function(){var t=P("div","leaflet-default-icon-path",document.body),e=pe(t,"background-image")||pe(t,"backgroundImage");return document.body.removeChild(t),(e=this._stripUrl(e))?e:(t=document.querySelector('link[href$="leaflet.css"]'))?t.href.substring(0,t.href.length-"leaflet.css".length-1):""}}),pi=n.extend({initialize:function(t){this._marker=t},addHooks:function(){var t=this._marker._icon;this._draggable||(this._draggable=new Xe(t,t,!0)),this._draggable.on({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).enable(),M(t,"leaflet-marker-draggable")},removeHooks:function(){this._draggable.off({dragstart:this._onDragStart,predrag:this._onPreDrag,drag:this._onDrag,dragend:this._onDragEnd},this).disable(),this._marker._icon&&z(this._marker._icon,"leaflet-marker-draggable")},moved:function(){return this._draggable&&this._draggable._moved},_adjustPan:function(t){var e=this._marker,i=e._map,n=this._marker.options.autoPanSpeed,o=this._marker.options.autoPanPadding,s=Pe(e._icon),r=i.getPixelBounds(),a=i.getPixelOrigin(),a=_(r.min._subtract(a).add(o),r.max._subtract(a).subtract(o));a.contains(s)||(o=m((Math.max(a.max.x,s.x)-a.max.x)/(r.max.x-a.max.x)-(Math.min(a.min.x,s.x)-a.min.x)/(r.min.x-a.min.x),(Math.max(a.max.y,s.y)-a.max.y)/(r.max.y-a.max.y)-(Math.min(a.min.y,s.y)-a.min.y)/(r.min.y-a.min.y)).multiplyBy(n),i.panBy(o,{animate:!1}),this._draggable._newPos._add(o),this._draggable._startPos._add(o),Z(e._icon,this._draggable._newPos),this._onDrag(t),this._panRequest=x(this._adjustPan.bind(this,t)))},_onDragStart:function(){this._oldLatLng=this._marker.getLatLng(),this._marker.closePopup&&this._marker.closePopup(),this._marker.fire("movestart").fire("dragstart")},_onPreDrag:function(t){this._marker.options.autoPan&&(r(this._panRequest),this._panRequest=x(this._adjustPan.bind(this,t)))},_onDrag:function(t){var e=this._marker,i=e._shadow,n=Pe(e._icon),o=e._map.layerPointToLatLng(n);i&&Z(i,n),e._latlng=o,t.latlng=o,t.oldLatLng=this._oldLatLng,e.fire("move",t).fire("drag",t)},_onDragEnd:function(t){r(this._panRequest),delete this._oldLatLng,this._marker.fire("moveend").fire("dragend",t)}}),mi=o.extend({options:{icon:new _i,interactive:!0,keyboard:!0,title:"",alt:"Marker",zIndexOffset:0,opacity:1,riseOnHover:!1,riseOffset:250,pane:"markerPane",shadowPane:"shadowPane",bubblingMouseEvents:!1,autoPanOnFocus:!0,draggable:!1,autoPan:!1,autoPanPadding:[50,50],autoPanSpeed:10},initialize:function(t,e){c(this,e),this._latlng=w(t)},onAdd:function(t){this._zoomAnimated=this._zoomAnimated&&t.options.markerZoomAnimation,this._zoomAnimated&&t.on("zoomanim",this._animateZoom,this),this._initIcon(),this.update()},onRemove:function(t){this.dragging&&this.dragging.enabled()&&(this.options.draggable=!0,this.dragging.removeHooks()),delete this.dragging,this._zoomAnimated&&t.off("zoomanim",this._animateZoom,this),this._removeIcon(),this._removeShadow()},getEvents:function(){return{zoom:this.update,viewreset:this.update}},getLatLng:function(){return this._latlng},setLatLng:function(t){var e=this._latlng;return this._latlng=w(t),this.update(),this.fire("move",{oldLatLng:e,latlng:this._latlng})},setZIndexOffset:function(t){return this.options.zIndexOffset=t,this.update()},getIcon:function(){return this.options.icon},setIcon:function(t){return this.options.icon=t,this._map&&(this._initIcon(),this.update()),this._popup&&this.bindPopup(this._popup,this._popup.options),this},getElement:function(){return this._icon},update:function(){var t;return this._icon&&this._map&&(t=this._map.latLngToLayerPoint(this._latlng).round(),this._setPos(t)),this},_initIcon:function(){var t=this.options,e="leaflet-zoom-"+(this._zoomAnimated?"animated":"hide"),i=t.icon.createIcon(this._icon),n=!1,i=(i!==this._icon&&(this._icon&&this._removeIcon(),n=!0,t.title&&(i.title=t.title),"IMG"===i.tagName&&(i.alt=t.alt||"")),M(i,e),t.keyboard&&(i.tabIndex="0",i.setAttribute("role","button")),this._icon=i,t.riseOnHover&&this.on({mouseover:this._bringToFront,mouseout:this._resetZIndex}),this.options.autoPanOnFocus&&S(i,"focus",this._panOnFocus,this),t.icon.createShadow(this._shadow)),o=!1;i!==this._shadow&&(this._removeShadow(),o=!0),i&&(M(i,e),i.alt=""),this._shadow=i,t.opacity<1&&this._updateOpacity(),n&&this.getPane().appendChild(this._icon),this._initInteraction(),i&&o&&this.getPane(t.shadowPane).appendChild(this._shadow)},_removeIcon:function(){this.options.riseOnHover&&this.off({mouseover:this._bringToFront,mouseout:this._resetZIndex}),this.options.autoPanOnFocus&&k(this._icon,"focus",this._panOnFocus,this),T(this._icon),this.removeInteractiveTarget(this._icon),this._icon=null},_removeShadow:function(){this._shadow&&T(this._shadow),this._shadow=null},_setPos:function(t){this._icon&&Z(this._icon,t),this._shadow&&Z(this._shadow,t),this._zIndex=t.y+this.options.zIndexOffset,this._resetZIndex()},_updateZIndex:function(t){this._icon&&(this._icon.style.zIndex=this._zIndex+t)},_animateZoom:function(t){t=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center).round();this._setPos(t)},_initInteraction:function(){var t;this.options.interactive&&(M(this._icon,"leaflet-interactive"),this.addInteractiveTarget(this._icon),pi&&(t=this.options.draggable,this.dragging&&(t=this.dragging.enabled(),this.dragging.disable()),this.dragging=new pi(this),t&&this.dragging.enable()))},setOpacity:function(t){return this.options.opacity=t,this._map&&this._updateOpacity(),this},_updateOpacity:function(){var t=this.options.opacity;this._icon&&C(this._icon,t),this._shadow&&C(this._shadow,t)},_bringToFront:function(){this._updateZIndex(this.options.riseOffset)},_resetZIndex:function(){this._updateZIndex(0)},_panOnFocus:function(){var t,e,i=this._map;i&&(t=(e=this.options.icon.options).iconSize?m(e.iconSize):m(0,0),e=e.iconAnchor?m(e.iconAnchor):m(0,0),i.panInside(this._latlng,{paddingTopLeft:e,paddingBottomRight:t.subtract(e)}))},_getPopupAnchor:function(){return this.options.icon.options.popupAnchor},_getTooltipAnchor:function(){return this.options.icon.options.tooltipAnchor}});var fi=o.extend({options:{stroke:!0,color:"#3388ff",weight:3,opacity:1,lineCap:"round",lineJoin:"round",dashArray:null,dashOffset:null,fill:!1,fillColor:null,fillOpacity:.2,fillRule:"evenodd",interactive:!0,bubblingMouseEvents:!0},beforeAdd:function(t){this._renderer=t.getRenderer(this)},onAdd:function(){this._renderer._initPath(this),this._reset(),this._renderer._addPath(this)},onRemove:function(){this._renderer._removePath(this)},redraw:function(){return this._map&&this._renderer._updatePath(this),this},setStyle:function(t){return c(this,t),this._renderer&&(this._renderer._updateStyle(this),this.options.stroke&&t&&Object.prototype.hasOwnProperty.call(t,"weight")&&this._updateBounds()),this},bringToFront:function(){return this._renderer&&this._renderer._bringToFront(this),this},bringToBack:function(){return this._renderer&&this._renderer._bringToBack(this),this},getElement:function(){return this._path},_reset:function(){this._project(),this._update()},_clickTolerance:function(){return(this.options.stroke?this.options.weight/2:0)+(this._renderer.options.tolerance||0)}}),gi=fi.extend({options:{fill:!0,radius:10},initialize:function(t,e){c(this,e),this._latlng=w(t),this._radius=this.options.radius},setLatLng:function(t){var e=this._latlng;return this._latlng=w(t),this.redraw(),this.fire("move",{oldLatLng:e,latlng:this._latlng})},getLatLng:function(){return this._latlng},setRadius:function(t){return this.options.radius=this._radius=t,this.redraw()},getRadius:function(){return this._radius},setStyle:function(t){var e=t&&t.radius||this._radius;return fi.prototype.setStyle.call(this,t),this.setRadius(e),this},_project:function(){this._point=this._map.latLngToLayerPoint(this._latlng),this._updateBounds()},_updateBounds:function(){var t=this._radius,e=this._radiusY||t,i=this._clickTolerance(),t=[t+i,e+i];this._pxBounds=new f(this._point.subtract(t),this._point.add(t))},_update:function(){this._map&&this._updatePath()},_updatePath:function(){this._renderer._updateCircle(this)},_empty:function(){return this._radius&&!this._renderer._bounds.intersects(this._pxBounds)},_containsPoint:function(t){return t.distanceTo(this._point)<=this._radius+this._clickTolerance()}});var vi=gi.extend({initialize:function(t,e,i){if(c(this,e="number"==typeof e?l({},i,{radius:e}):e),this._latlng=w(t),isNaN(this.options.radius))throw new Error("Circle radius cannot be NaN");this._mRadius=this.options.radius},setRadius:function(t){return this._mRadius=t,this.redraw()},getRadius:function(){return this._mRadius},getBounds:function(){var t=[this._radius,this._radiusY||this._radius];return new s(this._map.layerPointToLatLng(this._point.subtract(t)),this._map.layerPointToLatLng(this._point.add(t)))},setStyle:fi.prototype.setStyle,_project:function(){var t,e,i,n,o,s=this._latlng.lng,r=this._latlng.lat,a=this._map,h=a.options.crs;h.distance===st.distance?(n=Math.PI/180,o=this._mRadius/st.R/n,t=a.project([r+o,s]),e=a.project([r-o,s]),e=t.add(e).divideBy(2),i=a.unproject(e).lat,n=Math.acos((Math.cos(o*n)-Math.sin(r*n)*Math.sin(i*n))/(Math.cos(r*n)*Math.cos(i*n)))/n,!isNaN(n)&&0!==n||(n=o/Math.cos(Math.PI/180*r)),this._point=e.subtract(a.getPixelOrigin()),this._radius=isNaN(n)?0:e.x-a.project([i,s-n]).x,this._radiusY=e.y-t.y):(o=h.unproject(h.project(this._latlng).subtract([this._mRadius,0])),this._point=a.latLngToLayerPoint(this._latlng),this._radius=this._point.x-a.latLngToLayerPoint(o).x),this._updateBounds()}});var yi=fi.extend({options:{smoothFactor:1,noClip:!1},initialize:function(t,e){c(this,e),this._setLatLngs(t)},getLatLngs:function(){return this._latlngs},setLatLngs:function(t){return this._setLatLngs(t),this.redraw()},isEmpty:function(){return!this._latlngs.length},closestLayerPoint:function(t){for(var e=1/0,i=null,n=ri,o=0,s=this._parts.length;o<s;o++)for(var r=this._parts[o],a=1,h=r.length;a<h;a++){var l,u,c=n(t,l=r[a-1],u=r[a],!0);c<e&&(e=c,i=n(t,l,u))}return i&&(i.distance=Math.sqrt(e)),i},getCenter:function(){if(this._map)return hi(this._defaultShape(),this._map.options.crs);throw new Error("Must add layer to map before using getCenter()")},getBounds:function(){return this._bounds},addLatLng:function(t,e){return e=e||this._defaultShape(),t=w(t),e.push(t),this._bounds.extend(t),this.redraw()},_setLatLngs:function(t){this._bounds=new s,this._latlngs=this._convertLatLngs(t)},_defaultShape:function(){return I(this._latlngs)?this._latlngs:this._latlngs[0]},_convertLatLngs:function(t){for(var e=[],i=I(t),n=0,o=t.length;n<o;n++)i?(e[n]=w(t[n]),this._bounds.extend(e[n])):e[n]=this._convertLatLngs(t[n]);return e},_project:function(){var t=new f;this._rings=[],this._projectLatlngs(this._latlngs,this._rings,t),this._bounds.isValid()&&t.isValid()&&(this._rawPxBounds=t,this._updateBounds())},_updateBounds:function(){var t=this._clickTolerance(),t=new p(t,t);this._rawPxBounds&&(this._pxBounds=new f([this._rawPxBounds.min.subtract(t),this._rawPxBounds.max.add(t)]))},_projectLatlngs:function(t,e,i){var n,o,s=t[0]instanceof v,r=t.length;if(s){for(o=[],n=0;n<r;n++)o[n]=this._map.latLngToLayerPoint(t[n]),i.extend(o[n]);e.push(o)}else for(n=0;n<r;n++)this._projectLatlngs(t[n],e,i)},_clipPoints:function(){var t=this._renderer._bounds;if(this._parts=[],this._pxBounds&&this._pxBounds.intersects(t))if(this.options.noClip)this._parts=this._rings;else for(var e,i,n,o,s=this._parts,r=0,a=0,h=this._rings.length;r<h;r++)for(e=0,i=(o=this._rings[r]).length;e<i-1;e++)(n=ni(o[e],o[e+1],t,e,!0))&&(s[a]=s[a]||[],s[a].push(n[0]),n[1]===o[e+1]&&e!==i-2||(s[a].push(n[1]),a++))},_simplifyPoints:function(){for(var t=this._parts,e=this.options.smoothFactor,i=0,n=t.length;i<n;i++)t[i]=ei(t[i],e)},_update:function(){this._map&&(this._clipPoints(),this._simplifyPoints(),this._updatePath())},_updatePath:function(){this._renderer._updatePoly(this)},_containsPoint:function(t,e){var i,n,o,s,r,a,h=this._clickTolerance();if(this._pxBounds&&this._pxBounds.contains(t))for(i=0,s=this._parts.length;i<s;i++)for(n=0,o=(r=(a=this._parts[i]).length)-1;n<r;o=n++)if((e||0!==n)&&ii(t,a[o],a[n])<=h)return!0;return!1}});yi._flat=ai;var xi=yi.extend({options:{fill:!0},isEmpty:function(){return!this._latlngs.length||!this._latlngs[0].length},getCenter:function(){if(this._map)return $e(this._defaultShape(),this._map.options.crs);throw new Error("Must add layer to map before using getCenter()")},_convertLatLngs:function(t){var t=yi.prototype._convertLatLngs.call(this,t),e=t.length;return 2<=e&&t[0]instanceof v&&t[0].equals(t[e-1])&&t.pop(),t},_setLatLngs:function(t){yi.prototype._setLatLngs.call(this,t),I(this._latlngs)&&(this._latlngs=[this._latlngs])},_defaultShape:function(){return(I(this._latlngs[0])?this._latlngs:this._latlngs[0])[0]},_clipPoints:function(){var t=this._renderer._bounds,e=this.options.weight,e=new p(e,e),t=new f(t.min.subtract(e),t.max.add(e));if(this._parts=[],this._pxBounds&&this._pxBounds.intersects(t))if(this.options.noClip)this._parts=this._rings;else for(var i,n=0,o=this._rings.length;n<o;n++)(i=Je(this._rings[n],t,!0)).length&&this._parts.push(i)},_updatePath:function(){this._renderer._updatePoly(this,!0)},_containsPoint:function(t){var e,i,n,o,s,r,a,h,l=!1;if(!this._pxBounds||!this._pxBounds.contains(t))return!1;for(o=0,a=this._parts.length;o<a;o++)for(s=0,r=(h=(e=this._parts[o]).length)-1;s<h;r=s++)i=e[s],n=e[r],i.y>t.y!=n.y>t.y&&t.x<(n.x-i.x)*(t.y-i.y)/(n.y-i.y)+i.x&&(l=!l);return l||yi.prototype._containsPoint.call(this,t,!0)}});var wi=ci.extend({initialize:function(t,e){c(this,e),this._layers={},t&&this.addData(t)},addData:function(t){var e,i,n,o=d(t)?t:t.features;if(o){for(e=0,i=o.length;e<i;e++)((n=o[e]).geometries||n.geometry||n.features||n.coordinates)&&this.addData(n);return this}var s,r=this.options;return(!r.filter||r.filter(t))&&(s=bi(t,r))?(s.feature=Zi(t),s.defaultOptions=s.options,this.resetStyle(s),r.onEachFeature&&r.onEachFeature(t,s),this.addLayer(s)):this},resetStyle:function(t){return void 0===t?this.eachLayer(this.resetStyle,this):(t.options=l({},t.defaultOptions),this._setLayerStyle(t,this.options.style),this)},setStyle:function(e){return this.eachLayer(function(t){this._setLayerStyle(t,e)},this)},_setLayerStyle:function(t,e){t.setStyle&&("function"==typeof e&&(e=e(t.feature)),t.setStyle(e))}});function bi(t,e){var i,n,o,s,r="Feature"===t.type?t.geometry:t,a=r?r.coordinates:null,h=[],l=e&&e.pointToLayer,u=e&&e.coordsToLatLng||Li;if(!a&&!r)return null;switch(r.type){case"Point":return Pi(l,t,i=u(a),e);case"MultiPoint":for(o=0,s=a.length;o<s;o++)i=u(a[o]),h.push(Pi(l,t,i,e));return new ci(h);case"LineString":case"MultiLineString":return n=Ti(a,"LineString"===r.type?0:1,u),new yi(n,e);case"Polygon":case"MultiPolygon":return n=Ti(a,"Polygon"===r.type?1:2,u),new xi(n,e);case"GeometryCollection":for(o=0,s=r.geometries.length;o<s;o++){var c=bi({geometry:r.geometries[o],type:"Feature",properties:t.properties},e);c&&h.push(c)}return new ci(h);case"FeatureCollection":for(o=0,s=r.features.length;o<s;o++){var d=bi(r.features[o],e);d&&h.push(d)}return new ci(h);default:throw new Error("Invalid GeoJSON object.")}}function Pi(t,e,i,n){return t?t(e,i):new mi(i,n&&n.markersInheritOptions&&n)}function Li(t){return new v(t[1],t[0],t[2])}function Ti(t,e,i){for(var n,o=[],s=0,r=t.length;s<r;s++)n=e?Ti(t[s],e-1,i):(i||Li)(t[s]),o.push(n);return o}function Mi(t,e){return void 0!==(t=w(t)).alt?[i(t.lng,e),i(t.lat,e),i(t.alt,e)]:[i(t.lng,e),i(t.lat,e)]}function zi(t,e,i,n){for(var o=[],s=0,r=t.length;s<r;s++)o.push(e?zi(t[s],I(t[s])?0:e-1,i,n):Mi(t[s],n));return!e&&i&&0<o.length&&o.push(o[0].slice()),o}function Ci(t,e){return t.feature?l({},t.feature,{geometry:e}):Zi(e)}function Zi(t){return"Feature"===t.type||"FeatureCollection"===t.type?t:{type:"Feature",properties:{},geometry:t}}Tt={toGeoJSON:function(t){return Ci(this,{type:"Point",coordinates:Mi(this.getLatLng(),t)})}};function Si(t,e){return new wi(t,e)}mi.include(Tt),vi.include(Tt),gi.include(Tt),yi.include({toGeoJSON:function(t){var e=!I(this._latlngs);return Ci(this,{type:(e?"Multi":"")+"LineString",coordinates:zi(this._latlngs,e?1:0,!1,t)})}}),xi.include({toGeoJSON:function(t){var e=!I(this._latlngs),i=e&&!I(this._latlngs[0]),t=zi(this._latlngs,i?2:e?1:0,!0,t);return Ci(this,{type:(i?"Multi":"")+"Polygon",coordinates:t=e?t:[t]})}}),ui.include({toMultiPoint:function(e){var i=[];return this.eachLayer(function(t){i.push(t.toGeoJSON(e).geometry.coordinates)}),Ci(this,{type:"MultiPoint",coordinates:i})},toGeoJSON:function(e){var i,n,t=this.feature&&this.feature.geometry&&this.feature.geometry.type;return"MultiPoint"===t?this.toMultiPoint(e):(i="GeometryCollection"===t,n=[],this.eachLayer(function(t){t.toGeoJSON&&(t=t.toGeoJSON(e),i?n.push(t.geometry):"FeatureCollection"===(t=Zi(t)).type?n.push.apply(n,t.features):n.push(t))}),i?Ci(this,{geometries:n,type:"GeometryCollection"}):{type:"FeatureCollection",features:n})}});var Mt=Si,Ei=o.extend({options:{opacity:1,alt:"",interactive:!1,crossOrigin:!1,errorOverlayUrl:"",zIndex:1,className:""},initialize:function(t,e,i){this._url=t,this._bounds=g(e),c(this,i)},onAdd:function(){this._image||(this._initImage(),this.options.opacity<1&&this._updateOpacity()),this.options.interactive&&(M(this._image,"leaflet-interactive"),this.addInteractiveTarget(this._image)),this.getPane().appendChild(this._image),this._reset()},onRemove:function(){T(this._image),this.options.interactive&&this.removeInteractiveTarget(this._image)},setOpacity:function(t){return this.options.opacity=t,this._image&&this._updateOpacity(),this},setStyle:function(t){return t.opacity&&this.setOpacity(t.opacity),this},bringToFront:function(){return this._map&&fe(this._image),this},bringToBack:function(){return this._map&&ge(this._image),this},setUrl:function(t){return this._url=t,this._image&&(this._image.src=t),this},setBounds:function(t){return this._bounds=g(t),this._map&&this._reset(),this},getEvents:function(){var t={zoom:this._reset,viewreset:this._reset};return this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},getBounds:function(){return this._bounds},getElement:function(){return this._image},_initImage:function(){var t="IMG"===this._url.tagName,e=this._image=t?this._url:P("img");M(e,"leaflet-image-layer"),this._zoomAnimated&&M(e,"leaflet-zoom-animated"),this.options.className&&M(e,this.options.className),e.onselectstart=u,e.onmousemove=u,e.onload=a(this.fire,this,"load"),e.onerror=a(this._overlayOnError,this,"error"),!this.options.crossOrigin&&""!==this.options.crossOrigin||(e.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),this.options.zIndex&&this._updateZIndex(),t?this._url=e.src:(e.src=this._url,e.alt=this.options.alt)},_animateZoom:function(t){var e=this._map.getZoomScale(t.zoom),t=this._map._latLngBoundsToNewLayerBounds(this._bounds,t.zoom,t.center).min;be(this._image,t,e)},_reset:function(){var t=this._image,e=new f(this._map.latLngToLayerPoint(this._bounds.getNorthWest()),this._map.latLngToLayerPoint(this._bounds.getSouthEast())),i=e.getSize();Z(t,e.min),t.style.width=i.x+"px",t.style.height=i.y+"px"},_updateOpacity:function(){C(this._image,this.options.opacity)},_updateZIndex:function(){this._image&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._image.style.zIndex=this.options.zIndex)},_overlayOnError:function(){this.fire("error");var t=this.options.errorOverlayUrl;t&&this._url!==t&&(this._url=t,this._image.src=t)},getCenter:function(){return this._bounds.getCenter()}}),ki=Ei.extend({options:{autoplay:!0,loop:!0,keepAspectRatio:!0,muted:!1,playsInline:!0},_initImage:function(){var t="VIDEO"===this._url.tagName,e=this._image=t?this._url:P("video");if(M(e,"leaflet-image-layer"),this._zoomAnimated&&M(e,"leaflet-zoom-animated"),this.options.className&&M(e,this.options.className),e.onselectstart=u,e.onmousemove=u,e.onloadeddata=a(this.fire,this,"load"),t){for(var i=e.getElementsByTagName("source"),n=[],o=0;o<i.length;o++)n.push(i[o].src);this._url=0<i.length?n:[e.src]}else{d(this._url)||(this._url=[this._url]),!this.options.keepAspectRatio&&Object.prototype.hasOwnProperty.call(e.style,"objectFit")&&(e.style.objectFit="fill"),e.autoplay=!!this.options.autoplay,e.loop=!!this.options.loop,e.muted=!!this.options.muted,e.playsInline=!!this.options.playsInline;for(var s=0;s<this._url.length;s++){var r=P("source");r.src=this._url[s],e.appendChild(r)}}}});var Oi=Ei.extend({_initImage:function(){var t=this._image=this._url;M(t,"leaflet-image-layer"),this._zoomAnimated&&M(t,"leaflet-zoom-animated"),this.options.className&&M(t,this.options.className),t.onselectstart=u,t.onmousemove=u}});var Ai=o.extend({options:{interactive:!1,offset:[0,0],className:"",pane:void 0,content:""},initialize:function(t,e){t&&(t instanceof v||d(t))?(this._latlng=w(t),c(this,e)):(c(this,t),this._source=e),this.options.content&&(this._content=this.options.content)},openOn:function(t){return(t=arguments.length?t:this._source._map).hasLayer(this)||t.addLayer(this),this},close:function(){return this._map&&this._map.removeLayer(this),this},toggle:function(t){return this._map?this.close():(arguments.length?this._source=t:t=this._source,this._prepareOpen(),this.openOn(t._map)),this},onAdd:function(t){this._zoomAnimated=t._zoomAnimated,this._container||this._initLayout(),t._fadeAnimated&&C(this._container,0),clearTimeout(this._removeTimeout),this.getPane().appendChild(this._container),this.update(),t._fadeAnimated&&C(this._container,1),this.bringToFront(),this.options.interactive&&(M(this._container,"leaflet-interactive"),this.addInteractiveTarget(this._container))},onRemove:function(t){t._fadeAnimated?(C(this._container,0),this._removeTimeout=setTimeout(a(T,void 0,this._container),200)):T(this._container),this.options.interactive&&(z(this._container,"leaflet-interactive"),this.removeInteractiveTarget(this._container))},getLatLng:function(){return this._latlng},setLatLng:function(t){return this._latlng=w(t),this._map&&(this._updatePosition(),this._adjustPan()),this},getContent:function(){return this._content},setContent:function(t){return this._content=t,this.update(),this},getElement:function(){return this._container},update:function(){this._map&&(this._container.style.visibility="hidden",this._updateContent(),this._updateLayout(),this._updatePosition(),this._container.style.visibility="",this._adjustPan())},getEvents:function(){var t={zoom:this._updatePosition,viewreset:this._updatePosition};return this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},isOpen:function(){return!!this._map&&this._map.hasLayer(this)},bringToFront:function(){return this._map&&fe(this._container),this},bringToBack:function(){return this._map&&ge(this._container),this},_prepareOpen:function(t){if(!(i=this._source)._map)return!1;if(i instanceof ci){var e,i=null,n=this._source._layers;for(e in n)if(n[e]._map){i=n[e];break}if(!i)return!1;this._source=i}if(!t)if(i.getCenter)t=i.getCenter();else if(i.getLatLng)t=i.getLatLng();else{if(!i.getBounds)throw new Error("Unable to get source layer LatLng.");t=i.getBounds().getCenter()}return this.setLatLng(t),this._map&&this.update(),!0},_updateContent:function(){if(this._content){var t=this._contentNode,e="function"==typeof this._content?this._content(this._source||this):this._content;if("string"==typeof e)t.innerHTML=e;else{for(;t.hasChildNodes();)t.removeChild(t.firstChild);t.appendChild(e)}this.fire("contentupdate")}},_updatePosition:function(){var t,e,i;this._map&&(e=this._map.latLngToLayerPoint(this._latlng),t=m(this.options.offset),i=this._getAnchor(),this._zoomAnimated?Z(this._container,e.add(i)):t=t.add(e).add(i),e=this._containerBottom=-t.y,i=this._containerLeft=-Math.round(this._containerWidth/2)+t.x,this._container.style.bottom=e+"px",this._container.style.left=i+"px")},_getAnchor:function(){return[0,0]}}),Bi=(A.include({_initOverlay:function(t,e,i,n){var o=e;return o instanceof t||(o=new t(n).setContent(e)),i&&o.setLatLng(i),o}}),o.include({_initOverlay:function(t,e,i,n){var o=i;return o instanceof t?(c(o,n),o._source=this):(o=e&&!n?e:new t(n,this)).setContent(i),o}}),Ai.extend({options:{pane:"popupPane",offset:[0,7],maxWidth:300,minWidth:50,maxHeight:null,autoPan:!0,autoPanPaddingTopLeft:null,autoPanPaddingBottomRight:null,autoPanPadding:[5,5],keepInView:!1,closeButton:!0,autoClose:!0,closeOnEscapeKey:!0,className:""},openOn:function(t){return!(t=arguments.length?t:this._source._map).hasLayer(this)&&t._popup&&t._popup.options.autoClose&&t.removeLayer(t._popup),t._popup=this,Ai.prototype.openOn.call(this,t)},onAdd:function(t){Ai.prototype.onAdd.call(this,t),t.fire("popupopen",{popup:this}),this._source&&(this._source.fire("popupopen",{popup:this},!0),this._source instanceof fi||this._source.on("preclick",Ae))},onRemove:function(t){Ai.prototype.onRemove.call(this,t),t.fire("popupclose",{popup:this}),this._source&&(this._source.fire("popupclose",{popup:this},!0),this._source instanceof fi||this._source.off("preclick",Ae))},getEvents:function(){var t=Ai.prototype.getEvents.call(this);return(void 0!==this.options.closeOnClick?this.options.closeOnClick:this._map.options.closePopupOnClick)&&(t.preclick=this.close),this.options.keepInView&&(t.moveend=this._adjustPan),t},_initLayout:function(){var t="leaflet-popup",e=this._container=P("div",t+" "+(this.options.className||"")+" leaflet-zoom-animated"),i=this._wrapper=P("div",t+"-content-wrapper",e);this._contentNode=P("div",t+"-content",i),Ie(e),Be(this._contentNode),S(e,"contextmenu",Ae),this._tipContainer=P("div",t+"-tip-container",e),this._tip=P("div",t+"-tip",this._tipContainer),this.options.closeButton&&((i=this._closeButton=P("a",t+"-close-button",e)).setAttribute("role","button"),i.setAttribute("aria-label","Close popup"),i.href="#close",i.innerHTML='<span aria-hidden="true">&#215;</span>',S(i,"click",function(t){O(t),this.close()},this))},_updateLayout:function(){var t=this._contentNode,e=t.style,i=(e.width="",e.whiteSpace="nowrap",t.offsetWidth),i=Math.min(i,this.options.maxWidth),i=(i=Math.max(i,this.options.minWidth),e.width=i+1+"px",e.whiteSpace="",e.height="",t.offsetHeight),n=this.options.maxHeight,o="leaflet-popup-scrolled";(n&&n<i?(e.height=n+"px",M):z)(t,o),this._containerWidth=this._container.offsetWidth},_animateZoom:function(t){var t=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center),e=this._getAnchor();Z(this._container,t.add(e))},_adjustPan:function(){var t,e,i,n,o,s,r,a;this.options.autoPan&&(this._map._panAnim&&this._map._panAnim.stop(),this._autopanning?this._autopanning=!1:(t=this._map,e=parseInt(pe(this._container,"marginBottom"),10)||0,e=this._container.offsetHeight+e,a=this._containerWidth,(i=new p(this._containerLeft,-e-this._containerBottom))._add(Pe(this._container)),i=t.layerPointToContainerPoint(i),o=m(this.options.autoPanPadding),n=m(this.options.autoPanPaddingTopLeft||o),o=m(this.options.autoPanPaddingBottomRight||o),s=t.getSize(),r=0,i.x+a+o.x>s.x&&(r=i.x+a-s.x+o.x),i.x-r-n.x<(a=0)&&(r=i.x-n.x),i.y+e+o.y>s.y&&(a=i.y+e-s.y+o.y),i.y-a-n.y<0&&(a=i.y-n.y),(r||a)&&(this.options.keepInView&&(this._autopanning=!0),t.fire("autopanstart").panBy([r,a]))))},_getAnchor:function(){return m(this._source&&this._source._getPopupAnchor?this._source._getPopupAnchor():[0,0])}})),Ii=(A.mergeOptions({closePopupOnClick:!0}),A.include({openPopup:function(t,e,i){return this._initOverlay(Bi,t,e,i).openOn(this),this},closePopup:function(t){return(t=arguments.length?t:this._popup)&&t.close(),this}}),o.include({bindPopup:function(t,e){return this._popup=this._initOverlay(Bi,this._popup,t,e),this._popupHandlersAdded||(this.on({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!0),this},unbindPopup:function(){return this._popup&&(this.off({click:this._openPopup,keypress:this._onKeyPress,remove:this.closePopup,move:this._movePopup}),this._popupHandlersAdded=!1,this._popup=null),this},openPopup:function(t){return this._popup&&(this instanceof ci||(this._popup._source=this),this._popup._prepareOpen(t||this._latlng)&&this._popup.openOn(this._map)),this},closePopup:function(){return this._popup&&this._popup.close(),this},togglePopup:function(){return this._popup&&this._popup.toggle(this),this},isPopupOpen:function(){return!!this._popup&&this._popup.isOpen()},setPopupContent:function(t){return this._popup&&this._popup.setContent(t),this},getPopup:function(){return this._popup},_openPopup:function(t){var e;this._popup&&this._map&&(Re(t),e=t.layer||t.target,this._popup._source!==e||e instanceof fi?(this._popup._source=e,this.openPopup(t.latlng)):this._map.hasLayer(this._popup)?this.closePopup():this.openPopup(t.latlng))},_movePopup:function(t){this._popup.setLatLng(t.latlng)},_onKeyPress:function(t){13===t.originalEvent.keyCode&&this._openPopup(t)}}),Ai.extend({options:{pane:"tooltipPane",offset:[0,0],direction:"auto",permanent:!1,sticky:!1,opacity:.9},onAdd:function(t){Ai.prototype.onAdd.call(this,t),this.setOpacity(this.options.opacity),t.fire("tooltipopen",{tooltip:this}),this._source&&(this.addEventParent(this._source),this._source.fire("tooltipopen",{tooltip:this},!0))},onRemove:function(t){Ai.prototype.onRemove.call(this,t),t.fire("tooltipclose",{tooltip:this}),this._source&&(this.removeEventParent(this._source),this._source.fire("tooltipclose",{tooltip:this},!0))},getEvents:function(){var t=Ai.prototype.getEvents.call(this);return this.options.permanent||(t.preclick=this.close),t},_initLayout:function(){var t="leaflet-tooltip "+(this.options.className||"")+" leaflet-zoom-"+(this._zoomAnimated?"animated":"hide");this._contentNode=this._container=P("div",t),this._container.setAttribute("role","tooltip"),this._container.setAttribute("id","leaflet-tooltip-"+h(this))},_updateLayout:function(){},_adjustPan:function(){},_setPosition:function(t){var e,i=this._map,n=this._container,o=i.latLngToContainerPoint(i.getCenter()),i=i.layerPointToContainerPoint(t),s=this.options.direction,r=n.offsetWidth,a=n.offsetHeight,h=m(this.options.offset),l=this._getAnchor(),i="top"===s?(e=r/2,a):"bottom"===s?(e=r/2,0):(e="center"===s?r/2:"right"===s?0:"left"===s?r:i.x<o.x?(s="right",0):(s="left",r+2*(h.x+l.x)),a/2);t=t.subtract(m(e,i,!0)).add(h).add(l),z(n,"leaflet-tooltip-right"),z(n,"leaflet-tooltip-left"),z(n,"leaflet-tooltip-top"),z(n,"leaflet-tooltip-bottom"),M(n,"leaflet-tooltip-"+s),Z(n,t)},_updatePosition:function(){var t=this._map.latLngToLayerPoint(this._latlng);this._setPosition(t)},setOpacity:function(t){this.options.opacity=t,this._container&&C(this._container,t)},_animateZoom:function(t){t=this._map._latLngToNewLayerPoint(this._latlng,t.zoom,t.center);this._setPosition(t)},_getAnchor:function(){return m(this._source&&this._source._getTooltipAnchor&&!this.options.sticky?this._source._getTooltipAnchor():[0,0])}})),Ri=(A.include({openTooltip:function(t,e,i){return this._initOverlay(Ii,t,e,i).openOn(this),this},closeTooltip:function(t){return t.close(),this}}),o.include({bindTooltip:function(t,e){return this._tooltip&&this.isTooltipOpen()&&this.unbindTooltip(),this._tooltip=this._initOverlay(Ii,this._tooltip,t,e),this._initTooltipInteractions(),this._tooltip.options.permanent&&this._map&&this._map.hasLayer(this)&&this.openTooltip(),this},unbindTooltip:function(){return this._tooltip&&(this._initTooltipInteractions(!0),this.closeTooltip(),this._tooltip=null),this},_initTooltipInteractions:function(t){var e,i;!t&&this._tooltipHandlersAdded||(e=t?"off":"on",i={remove:this.closeTooltip,move:this._moveTooltip},this._tooltip.options.permanent?i.add=this._openTooltip:(i.mouseover=this._openTooltip,i.mouseout=this.closeTooltip,i.click=this._openTooltip,this._map?this._addFocusListeners():i.add=this._addFocusListeners),this._tooltip.options.sticky&&(i.mousemove=this._moveTooltip),this[e](i),this._tooltipHandlersAdded=!t)},openTooltip:function(t){return this._tooltip&&(this instanceof ci||(this._tooltip._source=this),this._tooltip._prepareOpen(t)&&(this._tooltip.openOn(this._map),this.getElement?this._setAriaDescribedByOnLayer(this):this.eachLayer&&this.eachLayer(this._setAriaDescribedByOnLayer,this))),this},closeTooltip:function(){if(this._tooltip)return this._tooltip.close()},toggleTooltip:function(){return this._tooltip&&this._tooltip.toggle(this),this},isTooltipOpen:function(){return this._tooltip.isOpen()},setTooltipContent:function(t){return this._tooltip&&this._tooltip.setContent(t),this},getTooltip:function(){return this._tooltip},_addFocusListeners:function(){this.getElement?this._addFocusListenersOnLayer(this):this.eachLayer&&this.eachLayer(this._addFocusListenersOnLayer,this)},_addFocusListenersOnLayer:function(t){var e="function"==typeof t.getElement&&t.getElement();e&&(S(e,"focus",function(){this._tooltip._source=t,this.openTooltip()},this),S(e,"blur",this.closeTooltip,this))},_setAriaDescribedByOnLayer:function(t){t="function"==typeof t.getElement&&t.getElement();t&&t.setAttribute("aria-describedby",this._tooltip._container.id)},_openTooltip:function(t){var e;this._tooltip&&this._map&&(this._map.dragging&&this._map.dragging.moving()&&!this._openOnceFlag?(this._openOnceFlag=!0,(e=this)._map.once("moveend",function(){e._openOnceFlag=!1,e._openTooltip(t)})):(this._tooltip._source=t.layer||t.target,this.openTooltip(this._tooltip.options.sticky?t.latlng:void 0)))},_moveTooltip:function(t){var e=t.latlng;this._tooltip.options.sticky&&t.originalEvent&&(t=this._map.mouseEventToContainerPoint(t.originalEvent),t=this._map.containerPointToLayerPoint(t),e=this._map.layerPointToLatLng(t)),this._tooltip.setLatLng(e)}}),di.extend({options:{iconSize:[12,12],html:!1,bgPos:null,className:"leaflet-div-icon"},createIcon:function(t){var t=t&&"DIV"===t.tagName?t:document.createElement("div"),e=this.options;return e.html instanceof Element?(me(t),t.appendChild(e.html)):t.innerHTML=!1!==e.html?e.html:"",e.bgPos&&(e=m(e.bgPos),t.style.backgroundPosition=-e.x+"px "+-e.y+"px"),this._setIconStyles(t,"icon"),t},createShadow:function(){return null}}));di.Default=_i;var Ni=o.extend({options:{tileSize:256,opacity:1,updateWhenIdle:b.mobile,updateWhenZooming:!0,updateInterval:200,zIndex:1,bounds:null,minZoom:0,maxZoom:void 0,maxNativeZoom:void 0,minNativeZoom:void 0,noWrap:!1,pane:"tilePane",className:"",keepBuffer:2},initialize:function(t){c(this,t)},onAdd:function(){this._initContainer(),this._levels={},this._tiles={},this._resetView()},beforeAdd:function(t){t._addZoomLimit(this)},onRemove:function(t){this._removeAllTiles(),T(this._container),t._removeZoomLimit(this),this._container=null,this._tileZoom=void 0},bringToFront:function(){return this._map&&(fe(this._container),this._setAutoZIndex(Math.max)),this},bringToBack:function(){return this._map&&(ge(this._container),this._setAutoZIndex(Math.min)),this},getContainer:function(){return this._container},setOpacity:function(t){return this.options.opacity=t,this._updateOpacity(),this},setZIndex:function(t){return this.options.zIndex=t,this._updateZIndex(),this},isLoading:function(){return this._loading},redraw:function(){var t;return this._map&&(this._removeAllTiles(),(t=this._clampZoom(this._map.getZoom()))!==this._tileZoom&&(this._tileZoom=t,this._updateLevels()),this._update()),this},getEvents:function(){var t={viewprereset:this._invalidateAll,viewreset:this._resetView,zoom:this._resetView,moveend:this._onMoveEnd};return this.options.updateWhenIdle||(this._onMove||(this._onMove=j(this._onMoveEnd,this.options.updateInterval,this)),t.move=this._onMove),this._zoomAnimated&&(t.zoomanim=this._animateZoom),t},createTile:function(){return document.createElement("div")},getTileSize:function(){var t=this.options.tileSize;return t instanceof p?t:new p(t,t)},_updateZIndex:function(){this._container&&void 0!==this.options.zIndex&&null!==this.options.zIndex&&(this._container.style.zIndex=this.options.zIndex)},_setAutoZIndex:function(t){for(var e,i=this.getPane().children,n=-t(-1/0,1/0),o=0,s=i.length;o<s;o++)e=i[o].style.zIndex,i[o]!==this._container&&e&&(n=t(n,+e));isFinite(n)&&(this.options.zIndex=n+t(-1,1),this._updateZIndex())},_updateOpacity:function(){if(this._map&&!b.ielt9){C(this._container,this.options.opacity);var t,e=+new Date,i=!1,n=!1;for(t in this._tiles){var o,s=this._tiles[t];s.current&&s.loaded&&(o=Math.min(1,(e-s.loaded)/200),C(s.el,o),o<1?i=!0:(s.active?n=!0:this._onOpaqueTile(s),s.active=!0))}n&&!this._noPrune&&this._pruneTiles(),i&&(r(this._fadeFrame),this._fadeFrame=x(this._updateOpacity,this))}},_onOpaqueTile:u,_initContainer:function(){this._container||(this._container=P("div","leaflet-layer "+(this.options.className||"")),this._updateZIndex(),this.options.opacity<1&&this._updateOpacity(),this.getPane().appendChild(this._container))},_updateLevels:function(){var t=this._tileZoom,e=this.options.maxZoom;if(void 0!==t){for(var i in this._levels)i=Number(i),this._levels[i].el.children.length||i===t?(this._levels[i].el.style.zIndex=e-Math.abs(t-i),this._onUpdateLevel(i)):(T(this._levels[i].el),this._removeTilesAtZoom(i),this._onRemoveLevel(i),delete this._levels[i]);var n=this._levels[t],o=this._map;return n||((n=this._levels[t]={}).el=P("div","leaflet-tile-container leaflet-zoom-animated",this._container),n.el.style.zIndex=e,n.origin=o.project(o.unproject(o.getPixelOrigin()),t).round(),n.zoom=t,this._setZoomTransform(n,o.getCenter(),o.getZoom()),u(n.el.offsetWidth),this._onCreateLevel(n)),this._level=n}},_onUpdateLevel:u,_onRemoveLevel:u,_onCreateLevel:u,_pruneTiles:function(){if(this._map){var t,e,i,n=this._map.getZoom();if(n>this.options.maxZoom||n<this.options.minZoom)this._removeAllTiles();else{for(t in this._tiles)(i=this._tiles[t]).retain=i.current;for(t in this._tiles)(i=this._tiles[t]).current&&!i.active&&(e=i.coords,this._retainParent(e.x,e.y,e.z,e.z-5)||this._retainChildren(e.x,e.y,e.z,e.z+2));for(t in this._tiles)this._tiles[t].retain||this._removeTile(t)}}},_removeTilesAtZoom:function(t){for(var e in this._tiles)this._tiles[e].coords.z===t&&this._removeTile(e)},_removeAllTiles:function(){for(var t in this._tiles)this._removeTile(t)},_invalidateAll:function(){for(var t in this._levels)T(this._levels[t].el),this._onRemoveLevel(Number(t)),delete this._levels[t];this._removeAllTiles(),this._tileZoom=void 0},_retainParent:function(t,e,i,n){var t=Math.floor(t/2),e=Math.floor(e/2),i=i-1,o=new p(+t,+e),o=(o.z=i,this._tileCoordsToKey(o)),o=this._tiles[o];return o&&o.active?o.retain=!0:(o&&o.loaded&&(o.retain=!0),n<i&&this._retainParent(t,e,i,n))},_retainChildren:function(t,e,i,n){for(var o=2*t;o<2*t+2;o++)for(var s=2*e;s<2*e+2;s++){var r=new p(o,s),r=(r.z=i+1,this._tileCoordsToKey(r)),r=this._tiles[r];r&&r.active?r.retain=!0:(r&&r.loaded&&(r.retain=!0),i+1<n&&this._retainChildren(o,s,i+1,n))}},_resetView:function(t){t=t&&(t.pinch||t.flyTo);this._setView(this._map.getCenter(),this._map.getZoom(),t,t)},_animateZoom:function(t){this._setView(t.center,t.zoom,!0,t.noUpdate)},_clampZoom:function(t){var e=this.options;return void 0!==e.minNativeZoom&&t<e.minNativeZoom?e.minNativeZoom:void 0!==e.maxNativeZoom&&e.maxNativeZoom<t?e.maxNativeZoom:t},_setView:function(t,e,i,n){var o=Math.round(e),o=void 0!==this.options.maxZoom&&o>this.options.maxZoom||void 0!==this.options.minZoom&&o<this.options.minZoom?void 0:this._clampZoom(o),s=this.options.updateWhenZooming&&o!==this._tileZoom;n&&!s||(this._tileZoom=o,this._abortLoading&&this._abortLoading(),this._updateLevels(),this._resetGrid(),void 0!==o&&this._update(t),i||this._pruneTiles(),this._noPrune=!!i),this._setZoomTransforms(t,e)},_setZoomTransforms:function(t,e){for(var i in this._levels)this._setZoomTransform(this._levels[i],t,e)},_setZoomTransform:function(t,e,i){var n=this._map.getZoomScale(i,t.zoom),e=t.origin.multiplyBy(n).subtract(this._map._getNewPixelOrigin(e,i)).round();b.any3d?be(t.el,e,n):Z(t.el,e)},_resetGrid:function(){var t=this._map,e=t.options.crs,i=this._tileSize=this.getTileSize(),n=this._tileZoom,o=this._map.getPixelWorldBounds(this._tileZoom);o&&(this._globalTileRange=this._pxBoundsToTileRange(o)),this._wrapX=e.wrapLng&&!this.options.noWrap&&[Math.floor(t.project([0,e.wrapLng[0]],n).x/i.x),Math.ceil(t.project([0,e.wrapLng[1]],n).x/i.y)],this._wrapY=e.wrapLat&&!this.options.noWrap&&[Math.floor(t.project([e.wrapLat[0],0],n).y/i.x),Math.ceil(t.project([e.wrapLat[1],0],n).y/i.y)]},_onMoveEnd:function(){this._map&&!this._map._animatingZoom&&this._update()},_getTiledPixelBounds:function(t){var e=this._map,i=e._animatingZoom?Math.max(e._animateToZoom,e.getZoom()):e.getZoom(),i=e.getZoomScale(i,this._tileZoom),t=e.project(t,this._tileZoom).floor(),e=e.getSize().divideBy(2*i);return new f(t.subtract(e),t.add(e))},_update:function(t){var e=this._map;if(e){var i=this._clampZoom(e.getZoom());if(void 0===t&&(t=e.getCenter()),void 0!==this._tileZoom){var n,e=this._getTiledPixelBounds(t),o=this._pxBoundsToTileRange(e),s=o.getCenter(),r=[],e=this.options.keepBuffer,a=new f(o.getBottomLeft().subtract([e,-e]),o.getTopRight().add([e,-e]));if(!(isFinite(o.min.x)&&isFinite(o.min.y)&&isFinite(o.max.x)&&isFinite(o.max.y)))throw new Error("Attempted to load an infinite number of tiles");for(n in this._tiles){var h=this._tiles[n].coords;h.z===this._tileZoom&&a.contains(new p(h.x,h.y))||(this._tiles[n].current=!1)}if(1<Math.abs(i-this._tileZoom))this._setView(t,i);else{for(var l=o.min.y;l<=o.max.y;l++)for(var u=o.min.x;u<=o.max.x;u++){var c,d=new p(u,l);d.z=this._tileZoom,this._isValidTile(d)&&((c=this._tiles[this._tileCoordsToKey(d)])?c.current=!0:r.push(d))}if(r.sort(function(t,e){return t.distanceTo(s)-e.distanceTo(s)}),0!==r.length){this._loading||(this._loading=!0,this.fire("loading"));for(var _=document.createDocumentFragment(),u=0;u<r.length;u++)this._addTile(r[u],_);this._level.el.appendChild(_)}}}}},_isValidTile:function(t){var e=this._map.options.crs;if(!e.infinite){var i=this._globalTileRange;if(!e.wrapLng&&(t.x<i.min.x||t.x>i.max.x)||!e.wrapLat&&(t.y<i.min.y||t.y>i.max.y))return!1}return!this.options.bounds||(e=this._tileCoordsToBounds(t),g(this.options.bounds).overlaps(e))},_keyToBounds:function(t){return this._tileCoordsToBounds(this._keyToTileCoords(t))},_tileCoordsToNwSe:function(t){var e=this._map,i=this.getTileSize(),n=t.scaleBy(i),i=n.add(i);return[e.unproject(n,t.z),e.unproject(i,t.z)]},_tileCoordsToBounds:function(t){t=this._tileCoordsToNwSe(t),t=new s(t[0],t[1]);return t=this.options.noWrap?t:this._map.wrapLatLngBounds(t)},_tileCoordsToKey:function(t){return t.x+":"+t.y+":"+t.z},_keyToTileCoords:function(t){var t=t.split(":"),e=new p(+t[0],+t[1]);return e.z=+t[2],e},_removeTile:function(t){var e=this._tiles[t];e&&(T(e.el),delete this._tiles[t],this.fire("tileunload",{tile:e.el,coords:this._keyToTileCoords(t)}))},_initTile:function(t){M(t,"leaflet-tile");var e=this.getTileSize();t.style.width=e.x+"px",t.style.height=e.y+"px",t.onselectstart=u,t.onmousemove=u,b.ielt9&&this.options.opacity<1&&C(t,this.options.opacity)},_addTile:function(t,e){var i=this._getTilePos(t),n=this._tileCoordsToKey(t),o=this.createTile(this._wrapCoords(t),a(this._tileReady,this,t));this._initTile(o),this.createTile.length<2&&x(a(this._tileReady,this,t,null,o)),Z(o,i),this._tiles[n]={el:o,coords:t,current:!0},e.appendChild(o),this.fire("tileloadstart",{tile:o,coords:t})},_tileReady:function(t,e,i){e&&this.fire("tileerror",{error:e,tile:i,coords:t});var n=this._tileCoordsToKey(t);(i=this._tiles[n])&&(i.loaded=+new Date,this._map._fadeAnimated?(C(i.el,0),r(this._fadeFrame),this._fadeFrame=x(this._updateOpacity,this)):(i.active=!0,this._pruneTiles()),e||(M(i.el,"leaflet-tile-loaded"),this.fire("tileload",{tile:i.el,coords:t})),this._noTilesToLoad()&&(this._loading=!1,this.fire("load"),b.ielt9||!this._map._fadeAnimated?x(this._pruneTiles,this):setTimeout(a(this._pruneTiles,this),250)))},_getTilePos:function(t){return t.scaleBy(this.getTileSize()).subtract(this._level.origin)},_wrapCoords:function(t){var e=new p(this._wrapX?H(t.x,this._wrapX):t.x,this._wrapY?H(t.y,this._wrapY):t.y);return e.z=t.z,e},_pxBoundsToTileRange:function(t){var e=this.getTileSize();return new f(t.min.unscaleBy(e).floor(),t.max.unscaleBy(e).ceil().subtract([1,1]))},_noTilesToLoad:function(){for(var t in this._tiles)if(!this._tiles[t].loaded)return!1;return!0}});var Di=Ni.extend({options:{minZoom:0,maxZoom:18,subdomains:"abc",errorTileUrl:"",zoomOffset:0,tms:!1,zoomReverse:!1,detectRetina:!1,crossOrigin:!1,referrerPolicy:!1},initialize:function(t,e){this._url=t,(e=c(this,e)).detectRetina&&b.retina&&0<e.maxZoom?(e.tileSize=Math.floor(e.tileSize/2),e.zoomReverse?(e.zoomOffset--,e.minZoom=Math.min(e.maxZoom,e.minZoom+1)):(e.zoomOffset++,e.maxZoom=Math.max(e.minZoom,e.maxZoom-1)),e.minZoom=Math.max(0,e.minZoom)):e.zoomReverse?e.minZoom=Math.min(e.maxZoom,e.minZoom):e.maxZoom=Math.max(e.minZoom,e.maxZoom),"string"==typeof e.subdomains&&(e.subdomains=e.subdomains.split("")),this.on("tileunload",this._onTileRemove)},setUrl:function(t,e){return this._url===t&&void 0===e&&(e=!0),this._url=t,e||this.redraw(),this},createTile:function(t,e){var i=document.createElement("img");return S(i,"load",a(this._tileOnLoad,this,e,i)),S(i,"error",a(this._tileOnError,this,e,i)),!this.options.crossOrigin&&""!==this.options.crossOrigin||(i.crossOrigin=!0===this.options.crossOrigin?"":this.options.crossOrigin),"string"==typeof this.options.referrerPolicy&&(i.referrerPolicy=this.options.referrerPolicy),i.alt="",i.src=this.getTileUrl(t),i},getTileUrl:function(t){var e={r:b.retina?"@2x":"",s:this._getSubdomain(t),x:t.x,y:t.y,z:this._getZoomForUrl()};return this._map&&!this._map.options.crs.infinite&&(t=this._globalTileRange.max.y-t.y,this.options.tms&&(e.y=t),e["-y"]=t),q(this._url,l(e,this.options))},_tileOnLoad:function(t,e){b.ielt9?setTimeout(a(t,this,null,e),0):t(null,e)},_tileOnError:function(t,e,i){var n=this.options.errorTileUrl;n&&e.getAttribute("src")!==n&&(e.src=n),t(i,e)},_onTileRemove:function(t){t.tile.onload=null},_getZoomForUrl:function(){var t=this._tileZoom,e=this.options.maxZoom;return(t=this.options.zoomReverse?e-t:t)+this.options.zoomOffset},_getSubdomain:function(t){t=Math.abs(t.x+t.y)%this.options.subdomains.length;return this.options.subdomains[t]},_abortLoading:function(){var t,e,i;for(t in this._tiles)this._tiles[t].coords.z!==this._tileZoom&&((i=this._tiles[t].el).onload=u,i.onerror=u,i.complete||(i.src=K,e=this._tiles[t].coords,T(i),delete this._tiles[t],this.fire("tileabort",{tile:i,coords:e})))},_removeTile:function(t){var e=this._tiles[t];if(e)return e.el.setAttribute("src",K),Ni.prototype._removeTile.call(this,t)},_tileReady:function(t,e,i){if(this._map&&(!i||i.getAttribute("src")!==K))return Ni.prototype._tileReady.call(this,t,e,i)}});function ji(t,e){return new Di(t,e)}var Hi=Di.extend({defaultWmsParams:{service:"WMS",request:"GetMap",layers:"",styles:"",format:"image/jpeg",transparent:!1,version:"1.1.1"},options:{crs:null,uppercase:!1},initialize:function(t,e){this._url=t;var i,n=l({},this.defaultWmsParams);for(i in e)i in this.options||(n[i]=e[i]);var t=(e=c(this,e)).detectRetina&&b.retina?2:1,o=this.getTileSize();n.width=o.x*t,n.height=o.y*t,this.wmsParams=n},onAdd:function(t){this._crs=this.options.crs||t.options.crs,this._wmsVersion=parseFloat(this.wmsParams.version);var e=1.3<=this._wmsVersion?"crs":"srs";this.wmsParams[e]=this._crs.code,Di.prototype.onAdd.call(this,t)},getTileUrl:function(t){var e=this._tileCoordsToNwSe(t),i=this._crs,i=_(i.project(e[0]),i.project(e[1])),e=i.min,i=i.max,e=(1.3<=this._wmsVersion&&this._crs===li?[e.y,e.x,i.y,i.x]:[e.x,e.y,i.x,i.y]).join(","),i=Di.prototype.getTileUrl.call(this,t);return i+U(this.wmsParams,i,this.options.uppercase)+(this.options.uppercase?"&BBOX=":"&bbox=")+e},setParams:function(t,e){return l(this.wmsParams,t),e||this.redraw(),this}});Di.WMS=Hi,ji.wms=function(t,e){return new Hi(t,e)};var Wi=o.extend({options:{padding:.1},initialize:function(t){c(this,t),h(this),this._layers=this._layers||{}},onAdd:function(){this._container||(this._initContainer(),M(this._container,"leaflet-zoom-animated")),this.getPane().appendChild(this._container),this._update(),this.on("update",this._updatePaths,this)},onRemove:function(){this.off("update",this._updatePaths,this),this._destroyContainer()},getEvents:function(){var t={viewreset:this._reset,zoom:this._onZoom,moveend:this._update,zoomend:this._onZoomEnd};return this._zoomAnimated&&(t.zoomanim=this._onAnimZoom),t},_onAnimZoom:function(t){this._updateTransform(t.center,t.zoom)},_onZoom:function(){this._updateTransform(this._map.getCenter(),this._map.getZoom())},_updateTransform:function(t,e){var i=this._map.getZoomScale(e,this._zoom),n=this._map.getSize().multiplyBy(.5+this.options.padding),o=this._map.project(this._center,e),n=n.multiplyBy(-i).add(o).subtract(this._map._getNewPixelOrigin(t,e));b.any3d?be(this._container,n,i):Z(this._container,n)},_reset:function(){for(var t in this._update(),this._updateTransform(this._center,this._zoom),this._layers)this._layers[t]._reset()},_onZoomEnd:function(){for(var t in this._layers)this._layers[t]._project()},_updatePaths:function(){for(var t in this._layers)this._layers[t]._update()},_update:function(){var t=this.options.padding,e=this._map.getSize(),i=this._map.containerPointToLayerPoint(e.multiplyBy(-t)).round();this._bounds=new f(i,i.add(e.multiplyBy(1+2*t)).round()),this._center=this._map.getCenter(),this._zoom=this._map.getZoom()}}),Fi=Wi.extend({options:{tolerance:0},getEvents:function(){var t=Wi.prototype.getEvents.call(this);return t.viewprereset=this._onViewPreReset,t},_onViewPreReset:function(){this._postponeUpdatePaths=!0},onAdd:function(){Wi.prototype.onAdd.call(this),this._draw()},_initContainer:function(){var t=this._container=document.createElement("canvas");S(t,"mousemove",this._onMouseMove,this),S(t,"click dblclick mousedown mouseup contextmenu",this._onClick,this),S(t,"mouseout",this._handleMouseOut,this),t._leaflet_disable_events=!0,this._ctx=t.getContext("2d")},_destroyContainer:function(){r(this._redrawRequest),delete this._ctx,T(this._container),k(this._container),delete this._container},_updatePaths:function(){if(!this._postponeUpdatePaths){for(var t in this._redrawBounds=null,this._layers)this._layers[t]._update();this._redraw()}},_update:function(){var t,e,i,n;this._map._animatingZoom&&this._bounds||(Wi.prototype._update.call(this),t=this._bounds,e=this._container,i=t.getSize(),n=b.retina?2:1,Z(e,t.min),e.width=n*i.x,e.height=n*i.y,e.style.width=i.x+"px",e.style.height=i.y+"px",b.retina&&this._ctx.scale(2,2),this._ctx.translate(-t.min.x,-t.min.y),this.fire("update"))},_reset:function(){Wi.prototype._reset.call(this),this._postponeUpdatePaths&&(this._postponeUpdatePaths=!1,this._updatePaths())},_initPath:function(t){this._updateDashArray(t);t=(this._layers[h(t)]=t)._order={layer:t,prev:this._drawLast,next:null};this._drawLast&&(this._drawLast.next=t),this._drawLast=t,this._drawFirst=this._drawFirst||this._drawLast},_addPath:function(t){this._requestRedraw(t)},_removePath:function(t){var e=t._order,i=e.next,e=e.prev;i?i.prev=e:this._drawLast=e,e?e.next=i:this._drawFirst=i,delete t._order,delete this._layers[h(t)],this._requestRedraw(t)},_updatePath:function(t){this._extendRedrawBounds(t),t._project(),t._update(),this._requestRedraw(t)},_updateStyle:function(t){this._updateDashArray(t),this._requestRedraw(t)},_updateDashArray:function(t){if("string"==typeof t.options.dashArray){for(var e,i=t.options.dashArray.split(/[, ]+/),n=[],o=0;o<i.length;o++){if(e=Number(i[o]),isNaN(e))return;n.push(e)}t.options._dashArray=n}else t.options._dashArray=t.options.dashArray},_requestRedraw:function(t){this._map&&(this._extendRedrawBounds(t),this._redrawRequest=this._redrawRequest||x(this._redraw,this))},_extendRedrawBounds:function(t){var e;t._pxBounds&&(e=(t.options.weight||0)+1,this._redrawBounds=this._redrawBounds||new f,this._redrawBounds.extend(t._pxBounds.min.subtract([e,e])),this._redrawBounds.extend(t._pxBounds.max.add([e,e])))},_redraw:function(){this._redrawRequest=null,this._redrawBounds&&(this._redrawBounds.min._floor(),this._redrawBounds.max._ceil()),this._clear(),this._draw(),this._redrawBounds=null},_clear:function(){var t,e=this._redrawBounds;e?(t=e.getSize(),this._ctx.clearRect(e.min.x,e.min.y,t.x,t.y)):(this._ctx.save(),this._ctx.setTransform(1,0,0,1,0,0),this._ctx.clearRect(0,0,this._container.width,this._container.height),this._ctx.restore())},_draw:function(){var t,e,i=this._redrawBounds;this._ctx.save(),i&&(e=i.getSize(),this._ctx.beginPath(),this._ctx.rect(i.min.x,i.min.y,e.x,e.y),this._ctx.clip()),this._drawing=!0;for(var n=this._drawFirst;n;n=n.next)t=n.layer,(!i||t._pxBounds&&t._pxBounds.intersects(i))&&t._updatePath();this._drawing=!1,this._ctx.restore()},_updatePoly:function(t,e){if(this._drawing){var i,n,o,s,r=t._parts,a=r.length,h=this._ctx;if(a){for(h.beginPath(),i=0;i<a;i++){for(n=0,o=r[i].length;n<o;n++)s=r[i][n],h[n?"lineTo":"moveTo"](s.x,s.y);e&&h.closePath()}this._fillStroke(h,t)}}},_updateCircle:function(t){var e,i,n,o;this._drawing&&!t._empty()&&(e=t._point,i=this._ctx,n=Math.max(Math.round(t._radius),1),1!=(o=(Math.max(Math.round(t._radiusY),1)||n)/n)&&(i.save(),i.scale(1,o)),i.beginPath(),i.arc(e.x,e.y/o,n,0,2*Math.PI,!1),1!=o&&i.restore(),this._fillStroke(i,t))},_fillStroke:function(t,e){var i=e.options;i.fill&&(t.globalAlpha=i.fillOpacity,t.fillStyle=i.fillColor||i.color,t.fill(i.fillRule||"evenodd")),i.stroke&&0!==i.weight&&(t.setLineDash&&t.setLineDash(e.options&&e.options._dashArray||[]),t.globalAlpha=i.opacity,t.lineWidth=i.weight,t.strokeStyle=i.color,t.lineCap=i.lineCap,t.lineJoin=i.lineJoin,t.stroke())},_onClick:function(t){for(var e,i,n=this._map.mouseEventToLayerPoint(t),o=this._drawFirst;o;o=o.next)(e=o.layer).options.interactive&&e._containsPoint(n)&&(("click"===t.type||"preclick"===t.type)&&this._map._draggableMoved(e)||(i=e));this._fireEvent(!!i&&[i],t)},_onMouseMove:function(t){var e;!this._map||this._map.dragging.moving()||this._map._animatingZoom||(e=this._map.mouseEventToLayerPoint(t),this._handleMouseHover(t,e))},_handleMouseOut:function(t){var e=this._hoveredLayer;e&&(z(this._container,"leaflet-interactive"),this._fireEvent([e],t,"mouseout"),this._hoveredLayer=null,this._mouseHoverThrottled=!1)},_handleMouseHover:function(t,e){if(!this._mouseHoverThrottled){for(var i,n,o=this._drawFirst;o;o=o.next)(i=o.layer).options.interactive&&i._containsPoint(e)&&(n=i);n!==this._hoveredLayer&&(this._handleMouseOut(t),n&&(M(this._container,"leaflet-interactive"),this._fireEvent([n],t,"mouseover"),this._hoveredLayer=n)),this._fireEvent(!!this._hoveredLayer&&[this._hoveredLayer],t),this._mouseHoverThrottled=!0,setTimeout(a(function(){this._mouseHoverThrottled=!1},this),32)}},_fireEvent:function(t,e,i){this._map._fireDOMEvent(e,i||e.type,t)},_bringToFront:function(t){var e,i,n=t._order;n&&(e=n.next,i=n.prev,e&&((e.prev=i)?i.next=e:e&&(this._drawFirst=e),n.prev=this._drawLast,(this._drawLast.next=n).next=null,this._drawLast=n,this._requestRedraw(t)))},_bringToBack:function(t){var e,i,n=t._order;n&&(e=n.next,(i=n.prev)&&((i.next=e)?e.prev=i:i&&(this._drawLast=i),n.prev=null,n.next=this._drawFirst,this._drawFirst.prev=n,this._drawFirst=n,this._requestRedraw(t)))}});function Ui(t){return b.canvas?new Fi(t):null}var Vi=function(){try{return document.namespaces.add("lvml","urn:schemas-microsoft-com:vml"),function(t){return document.createElement("<lvml:"+t+' class="lvml">')}}catch(t){}return function(t){return document.createElement("<"+t+' xmlns="urn:schemas-microsoft.com:vml" class="lvml">')}}(),zt={_initContainer:function(){this._container=P("div","leaflet-vml-container")},_update:function(){this._map._animatingZoom||(Wi.prototype._update.call(this),this.fire("update"))},_initPath:function(t){var e=t._container=Vi("shape");M(e,"leaflet-vml-shape "+(this.options.className||"")),e.coordsize="1 1",t._path=Vi("path"),e.appendChild(t._path),this._updateStyle(t),this._layers[h(t)]=t},_addPath:function(t){var e=t._container;this._container.appendChild(e),t.options.interactive&&t.addInteractiveTarget(e)},_removePath:function(t){var e=t._container;T(e),t.removeInteractiveTarget(e),delete this._layers[h(t)]},_updateStyle:function(t){var e=t._stroke,i=t._fill,n=t.options,o=t._container;o.stroked=!!n.stroke,o.filled=!!n.fill,n.stroke?(e=e||(t._stroke=Vi("stroke")),o.appendChild(e),e.weight=n.weight+"px",e.color=n.color,e.opacity=n.opacity,n.dashArray?e.dashStyle=d(n.dashArray)?n.dashArray.join(" "):n.dashArray.replace(/( *, *)/g," "):e.dashStyle="",e.endcap=n.lineCap.replace("butt","flat"),e.joinstyle=n.lineJoin):e&&(o.removeChild(e),t._stroke=null),n.fill?(i=i||(t._fill=Vi("fill")),o.appendChild(i),i.color=n.fillColor||n.color,i.opacity=n.fillOpacity):i&&(o.removeChild(i),t._fill=null)},_updateCircle:function(t){var e=t._point.round(),i=Math.round(t._radius),n=Math.round(t._radiusY||i);this._setPath(t,t._empty()?"M0 0":"AL "+e.x+","+e.y+" "+i+","+n+" 0,23592600")},_setPath:function(t,e){t._path.v=e},_bringToFront:function(t){fe(t._container)},_bringToBack:function(t){ge(t._container)}},qi=b.vml?Vi:ct,Gi=Wi.extend({_initContainer:function(){this._container=qi("svg"),this._container.setAttribute("pointer-events","none"),this._rootGroup=qi("g"),this._container.appendChild(this._rootGroup)},_destroyContainer:function(){T(this._container),k(this._container),delete this._container,delete this._rootGroup,delete this._svgSize},_update:function(){var t,e,i;this._map._animatingZoom&&this._bounds||(Wi.prototype._update.call(this),e=(t=this._bounds).getSize(),i=this._container,this._svgSize&&this._svgSize.equals(e)||(this._svgSize=e,i.setAttribute("width",e.x),i.setAttribute("height",e.y)),Z(i,t.min),i.setAttribute("viewBox",[t.min.x,t.min.y,e.x,e.y].join(" ")),this.fire("update"))},_initPath:function(t){var e=t._path=qi("path");t.options.className&&M(e,t.options.className),t.options.interactive&&M(e,"leaflet-interactive"),this._updateStyle(t),this._layers[h(t)]=t},_addPath:function(t){this._rootGroup||this._initContainer(),this._rootGroup.appendChild(t._path),t.addInteractiveTarget(t._path)},_removePath:function(t){T(t._path),t.removeInteractiveTarget(t._path),delete this._layers[h(t)]},_updatePath:function(t){t._project(),t._update()},_updateStyle:function(t){var e=t._path,t=t.options;e&&(t.stroke?(e.setAttribute("stroke",t.color),e.setAttribute("stroke-opacity",t.opacity),e.setAttribute("stroke-width",t.weight),e.setAttribute("stroke-linecap",t.lineCap),e.setAttribute("stroke-linejoin",t.lineJoin),t.dashArray?e.setAttribute("stroke-dasharray",t.dashArray):e.removeAttribute("stroke-dasharray"),t.dashOffset?e.setAttribute("stroke-dashoffset",t.dashOffset):e.removeAttribute("stroke-dashoffset")):e.setAttribute("stroke","none"),t.fill?(e.setAttribute("fill",t.fillColor||t.color),e.setAttribute("fill-opacity",t.fillOpacity),e.setAttribute("fill-rule",t.fillRule||"evenodd")):e.setAttribute("fill","none"))},_updatePoly:function(t,e){this._setPath(t,dt(t._parts,e))},_updateCircle:function(t){var e=t._point,i=Math.max(Math.round(t._radius),1),n="a"+i+","+(Math.max(Math.round(t._radiusY),1)||i)+" 0 1,0 ",e=t._empty()?"M0 0":"M"+(e.x-i)+","+e.y+n+2*i+",0 "+n+2*-i+",0 ";this._setPath(t,e)},_setPath:function(t,e){t._path.setAttribute("d",e)},_bringToFront:function(t){fe(t._path)},_bringToBack:function(t){ge(t._path)}});function Ki(t){return b.svg||b.vml?new Gi(t):null}b.vml&&Gi.include(zt),A.include({getRenderer:function(t){t=(t=t.options.renderer||this._getPaneRenderer(t.options.pane)||this.options.renderer||this._renderer)||(this._renderer=this._createRenderer());return this.hasLayer(t)||this.addLayer(t),t},_getPaneRenderer:function(t){var e;return"overlayPane"!==t&&void 0!==t&&(void 0===(e=this._paneRenderers[t])&&(e=this._createRenderer({pane:t}),this._paneRenderers[t]=e),e)},_createRenderer:function(t){return this.options.preferCanvas&&Ui(t)||Ki(t)}});var Yi=xi.extend({initialize:function(t,e){xi.prototype.initialize.call(this,this._boundsToLatLngs(t),e)},setBounds:function(t){return this.setLatLngs(this._boundsToLatLngs(t))},_boundsToLatLngs:function(t){return[(t=g(t)).getSouthWest(),t.getNorthWest(),t.getNorthEast(),t.getSouthEast()]}});Gi.create=qi,Gi.pointsToPath=dt,wi.geometryToLayer=bi,wi.coordsToLatLng=Li,wi.coordsToLatLngs=Ti,wi.latLngToCoords=Mi,wi.latLngsToCoords=zi,wi.getFeature=Ci,wi.asFeature=Zi,A.mergeOptions({boxZoom:!0});var _t=n.extend({initialize:function(t){this._map=t,this._container=t._container,this._pane=t._panes.overlayPane,this._resetStateTimeout=0,t.on("unload",this._destroy,this)},addHooks:function(){S(this._container,"mousedown",this._onMouseDown,this)},removeHooks:function(){k(this._container,"mousedown",this._onMouseDown,this)},moved:function(){return this._moved},_destroy:function(){T(this._pane),delete this._pane},_resetState:function(){this._resetStateTimeout=0,this._moved=!1},_clearDeferredResetState:function(){0!==this._resetStateTimeout&&(clearTimeout(this._resetStateTimeout),this._resetStateTimeout=0)},_onMouseDown:function(t){if(!t.shiftKey||1!==t.which&&1!==t.button)return!1;this._clearDeferredResetState(),this._resetState(),re(),Le(),this._startPoint=this._map.mouseEventToContainerPoint(t),S(document,{contextmenu:Re,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseMove:function(t){this._moved||(this._moved=!0,this._box=P("div","leaflet-zoom-box",this._container),M(this._container,"leaflet-crosshair"),this._map.fire("boxzoomstart")),this._point=this._map.mouseEventToContainerPoint(t);var t=new f(this._point,this._startPoint),e=t.getSize();Z(this._box,t.min),this._box.style.width=e.x+"px",this._box.style.height=e.y+"px"},_finish:function(){this._moved&&(T(this._box),z(this._container,"leaflet-crosshair")),ae(),Te(),k(document,{contextmenu:Re,mousemove:this._onMouseMove,mouseup:this._onMouseUp,keydown:this._onKeyDown},this)},_onMouseUp:function(t){1!==t.which&&1!==t.button||(this._finish(),this._moved&&(this._clearDeferredResetState(),this._resetStateTimeout=setTimeout(a(this._resetState,this),0),t=new s(this._map.containerPointToLatLng(this._startPoint),this._map.containerPointToLatLng(this._point)),this._map.fitBounds(t).fire("boxzoomend",{boxZoomBounds:t})))},_onKeyDown:function(t){27===t.keyCode&&(this._finish(),this._clearDeferredResetState(),this._resetState())}}),Ct=(A.addInitHook("addHandler","boxZoom",_t),A.mergeOptions({doubleClickZoom:!0}),n.extend({addHooks:function(){this._map.on("dblclick",this._onDoubleClick,this)},removeHooks:function(){this._map.off("dblclick",this._onDoubleClick,this)},_onDoubleClick:function(t){var e=this._map,i=e.getZoom(),n=e.options.zoomDelta,i=t.originalEvent.shiftKey?i-n:i+n;"center"===e.options.doubleClickZoom?e.setZoom(i):e.setZoomAround(t.containerPoint,i)}})),Zt=(A.addInitHook("addHandler","doubleClickZoom",Ct),A.mergeOptions({dragging:!0,inertia:!0,inertiaDeceleration:3400,inertiaMaxSpeed:1/0,easeLinearity:.2,worldCopyJump:!1,maxBoundsViscosity:0}),n.extend({addHooks:function(){var t;this._draggable||(t=this._map,this._draggable=new Xe(t._mapPane,t._container),this._draggable.on({dragstart:this._onDragStart,drag:this._onDrag,dragend:this._onDragEnd},this),this._draggable.on("predrag",this._onPreDragLimit,this),t.options.worldCopyJump&&(this._draggable.on("predrag",this._onPreDragWrap,this),t.on("zoomend",this._onZoomEnd,this),t.whenReady(this._onZoomEnd,this))),M(this._map._container,"leaflet-grab leaflet-touch-drag"),this._draggable.enable(),this._positions=[],this._times=[]},removeHooks:function(){z(this._map._container,"leaflet-grab"),z(this._map._container,"leaflet-touch-drag"),this._draggable.disable()},moved:function(){return this._draggable&&this._draggable._moved},moving:function(){return this._draggable&&this._draggable._moving},_onDragStart:function(){var t,e=this._map;e._stop(),this._map.options.maxBounds&&this._map.options.maxBoundsViscosity?(t=g(this._map.options.maxBounds),this._offsetLimit=_(this._map.latLngToContainerPoint(t.getNorthWest()).multiplyBy(-1),this._map.latLngToContainerPoint(t.getSouthEast()).multiplyBy(-1).add(this._map.getSize())),this._viscosity=Math.min(1,Math.max(0,this._map.options.maxBoundsViscosity))):this._offsetLimit=null,e.fire("movestart").fire("dragstart"),e.options.inertia&&(this._positions=[],this._times=[])},_onDrag:function(t){var e,i;this._map.options.inertia&&(e=this._lastTime=+new Date,i=this._lastPos=this._draggable._absPos||this._draggable._newPos,this._positions.push(i),this._times.push(e),this._prunePositions(e)),this._map.fire("move",t).fire("drag",t)},_prunePositions:function(t){for(;1<this._positions.length&&50<t-this._times[0];)this._positions.shift(),this._times.shift()},_onZoomEnd:function(){var t=this._map.getSize().divideBy(2),e=this._map.latLngToLayerPoint([0,0]);this._initialWorldOffset=e.subtract(t).x,this._worldWidth=this._map.getPixelWorldBounds().getSize().x},_viscousLimit:function(t,e){return t-(t-e)*this._viscosity},_onPreDragLimit:function(){var t,e;this._viscosity&&this._offsetLimit&&(t=this._draggable._newPos.subtract(this._draggable._startPos),e=this._offsetLimit,t.x<e.min.x&&(t.x=this._viscousLimit(t.x,e.min.x)),t.y<e.min.y&&(t.y=this._viscousLimit(t.y,e.min.y)),t.x>e.max.x&&(t.x=this._viscousLimit(t.x,e.max.x)),t.y>e.max.y&&(t.y=this._viscousLimit(t.y,e.max.y)),this._draggable._newPos=this._draggable._startPos.add(t))},_onPreDragWrap:function(){var t=this._worldWidth,e=Math.round(t/2),i=this._initialWorldOffset,n=this._draggable._newPos.x,o=(n-e+i)%t+e-i,n=(n+e+i)%t-e-i,t=Math.abs(o+i)<Math.abs(n+i)?o:n;this._draggable._absPos=this._draggable._newPos.clone(),this._draggable._newPos.x=t},_onDragEnd:function(t){var e,i,n,o,s=this._map,r=s.options,a=!r.inertia||t.noInertia||this._times.length<2;s.fire("dragend",t),!a&&(this._prunePositions(+new Date),t=this._lastPos.subtract(this._positions[0]),a=(this._lastTime-this._times[0])/1e3,e=r.easeLinearity,a=(t=t.multiplyBy(e/a)).distanceTo([0,0]),i=Math.min(r.inertiaMaxSpeed,a),t=t.multiplyBy(i/a),n=i/(r.inertiaDeceleration*e),(o=t.multiplyBy(-n/2).round()).x||o.y)?(o=s._limitOffset(o,s.options.maxBounds),x(function(){s.panBy(o,{duration:n,easeLinearity:e,noMoveStart:!0,animate:!0})})):s.fire("moveend")}})),St=(A.addInitHook("addHandler","dragging",Zt),A.mergeOptions({keyboard:!0,keyboardPanDelta:80}),n.extend({keyCodes:{left:[37],right:[39],down:[40],up:[38],zoomIn:[187,107,61,171],zoomOut:[189,109,54,173]},initialize:function(t){this._map=t,this._setPanDelta(t.options.keyboardPanDelta),this._setZoomDelta(t.options.zoomDelta)},addHooks:function(){var t=this._map._container;t.tabIndex<=0&&(t.tabIndex="0"),S(t,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.on({focus:this._addHooks,blur:this._removeHooks},this)},removeHooks:function(){this._removeHooks(),k(this._map._container,{focus:this._onFocus,blur:this._onBlur,mousedown:this._onMouseDown},this),this._map.off({focus:this._addHooks,blur:this._removeHooks},this)},_onMouseDown:function(){var t,e,i;this._focused||(i=document.body,t=document.documentElement,e=i.scrollTop||t.scrollTop,i=i.scrollLeft||t.scrollLeft,this._map._container.focus(),window.scrollTo(i,e))},_onFocus:function(){this._focused=!0,this._map.fire("focus")},_onBlur:function(){this._focused=!1,this._map.fire("blur")},_setPanDelta:function(t){for(var e=this._panKeys={},i=this.keyCodes,n=0,o=i.left.length;n<o;n++)e[i.left[n]]=[-1*t,0];for(n=0,o=i.right.length;n<o;n++)e[i.right[n]]=[t,0];for(n=0,o=i.down.length;n<o;n++)e[i.down[n]]=[0,t];for(n=0,o=i.up.length;n<o;n++)e[i.up[n]]=[0,-1*t]},_setZoomDelta:function(t){for(var e=this._zoomKeys={},i=this.keyCodes,n=0,o=i.zoomIn.length;n<o;n++)e[i.zoomIn[n]]=t;for(n=0,o=i.zoomOut.length;n<o;n++)e[i.zoomOut[n]]=-t},_addHooks:function(){S(document,"keydown",this._onKeyDown,this)},_removeHooks:function(){k(document,"keydown",this._onKeyDown,this)},_onKeyDown:function(t){if(!(t.altKey||t.ctrlKey||t.metaKey)){var e,i,n=t.keyCode,o=this._map;if(n in this._panKeys)o._panAnim&&o._panAnim._inProgress||(i=this._panKeys[n],t.shiftKey&&(i=m(i).multiplyBy(3)),o.options.maxBounds&&(i=o._limitOffset(m(i),o.options.maxBounds)),o.options.worldCopyJump?(e=o.wrapLatLng(o.unproject(o.project(o.getCenter()).add(i))),o.panTo(e)):o.panBy(i));else if(n in this._zoomKeys)o.setZoom(o.getZoom()+(t.shiftKey?3:1)*this._zoomKeys[n]);else{if(27!==n||!o._popup||!o._popup.options.closeOnEscapeKey)return;o.closePopup()}Re(t)}}})),Et=(A.addInitHook("addHandler","keyboard",St),A.mergeOptions({scrollWheelZoom:!0,wheelDebounceTime:40,wheelPxPerZoomLevel:60}),n.extend({addHooks:function(){S(this._map._container,"wheel",this._onWheelScroll,this),this._delta=0},removeHooks:function(){k(this._map._container,"wheel",this._onWheelScroll,this)},_onWheelScroll:function(t){var e=He(t),i=this._map.options.wheelDebounceTime,e=(this._delta+=e,this._lastMousePos=this._map.mouseEventToContainerPoint(t),this._startTime||(this._startTime=+new Date),Math.max(i-(+new Date-this._startTime),0));clearTimeout(this._timer),this._timer=setTimeout(a(this._performZoom,this),e),Re(t)},_performZoom:function(){var t=this._map,e=t.getZoom(),i=this._map.options.zoomSnap||0,n=(t._stop(),this._delta/(4*this._map.options.wheelPxPerZoomLevel)),n=4*Math.log(2/(1+Math.exp(-Math.abs(n))))/Math.LN2,i=i?Math.ceil(n/i)*i:n,n=t._limitZoom(e+(0<this._delta?i:-i))-e;this._delta=0,this._startTime=null,n&&("center"===t.options.scrollWheelZoom?t.setZoom(e+n):t.setZoomAround(this._lastMousePos,e+n))}})),kt=(A.addInitHook("addHandler","scrollWheelZoom",Et),A.mergeOptions({tapHold:b.touchNative&&b.safari&&b.mobile,tapTolerance:15}),n.extend({addHooks:function(){S(this._map._container,"touchstart",this._onDown,this)},removeHooks:function(){k(this._map._container,"touchstart",this._onDown,this)},_onDown:function(t){var e;clearTimeout(this._holdTimeout),1===t.touches.length&&(e=t.touches[0],this._startPos=this._newPos=new p(e.clientX,e.clientY),this._holdTimeout=setTimeout(a(function(){this._cancel(),this._isTapValid()&&(S(document,"touchend",O),S(document,"touchend touchcancel",this._cancelClickPrevent),this._simulateEvent("contextmenu",e))},this),600),S(document,"touchend touchcancel contextmenu",this._cancel,this),S(document,"touchmove",this._onMove,this))},_cancelClickPrevent:function t(){k(document,"touchend",O),k(document,"touchend touchcancel",t)},_cancel:function(){clearTimeout(this._holdTimeout),k(document,"touchend touchcancel contextmenu",this._cancel,this),k(document,"touchmove",this._onMove,this)},_onMove:function(t){t=t.touches[0];this._newPos=new p(t.clientX,t.clientY)},_isTapValid:function(){return this._newPos.distanceTo(this._startPos)<=this._map.options.tapTolerance},_simulateEvent:function(t,e){t=new MouseEvent(t,{bubbles:!0,cancelable:!0,view:window,screenX:e.screenX,screenY:e.screenY,clientX:e.clientX,clientY:e.clientY});t._simulated=!0,e.target.dispatchEvent(t)}})),Ot=(A.addInitHook("addHandler","tapHold",kt),A.mergeOptions({touchZoom:b.touch,bounceAtZoomLimits:!0}),n.extend({addHooks:function(){M(this._map._container,"leaflet-touch-zoom"),S(this._map._container,"touchstart",this._onTouchStart,this)},removeHooks:function(){z(this._map._container,"leaflet-touch-zoom"),k(this._map._container,"touchstart",this._onTouchStart,this)},_onTouchStart:function(t){var e,i,n=this._map;!t.touches||2!==t.touches.length||n._animatingZoom||this._zooming||(e=n.mouseEventToContainerPoint(t.touches[0]),i=n.mouseEventToContainerPoint(t.touches[1]),this._centerPoint=n.getSize()._divideBy(2),this._startLatLng=n.containerPointToLatLng(this._centerPoint),"center"!==n.options.touchZoom&&(this._pinchStartLatLng=n.containerPointToLatLng(e.add(i)._divideBy(2))),this._startDist=e.distanceTo(i),this._startZoom=n.getZoom(),this._moved=!1,this._zooming=!0,n._stop(),S(document,"touchmove",this._onTouchMove,this),S(document,"touchend touchcancel",this._onTouchEnd,this),O(t))},_onTouchMove:function(t){if(t.touches&&2===t.touches.length&&this._zooming){var e=this._map,i=e.mouseEventToContainerPoint(t.touches[0]),n=e.mouseEventToContainerPoint(t.touches[1]),o=i.distanceTo(n)/this._startDist;if(this._zoom=e.getScaleZoom(o,this._startZoom),!e.options.bounceAtZoomLimits&&(this._zoom<e.getMinZoom()&&o<1||this._zoom>e.getMaxZoom()&&1<o)&&(this._zoom=e._limitZoom(this._zoom)),"center"===e.options.touchZoom){if(this._center=this._startLatLng,1==o)return}else{i=i._add(n)._divideBy(2)._subtract(this._centerPoint);if(1==o&&0===i.x&&0===i.y)return;this._center=e.unproject(e.project(this._pinchStartLatLng,this._zoom).subtract(i),this._zoom)}this._moved||(e._moveStart(!0,!1),this._moved=!0),r(this._animRequest);n=a(e._move,e,this._center,this._zoom,{pinch:!0,round:!1},void 0);this._animRequest=x(n,this,!0),O(t)}},_onTouchEnd:function(){this._moved&&this._zooming?(this._zooming=!1,r(this._animRequest),k(document,"touchmove",this._onTouchMove,this),k(document,"touchend touchcancel",this._onTouchEnd,this),this._map.options.zoomAnimation?this._map._animateZoom(this._center,this._map._limitZoom(this._zoom),!0,this._map.options.zoomSnap):this._map._resetView(this._center,this._map._limitZoom(this._zoom))):this._zooming=!1}})),Xi=(A.addInitHook("addHandler","touchZoom",Ot),A.BoxZoom=_t,A.DoubleClickZoom=Ct,A.Drag=Zt,A.Keyboard=St,A.ScrollWheelZoom=Et,A.TapHold=kt,A.TouchZoom=Ot,t.Bounds=f,t.Browser=b,t.CRS=ot,t.Canvas=Fi,t.Circle=vi,t.CircleMarker=gi,t.Class=et,t.Control=B,t.DivIcon=Ri,t.DivOverlay=Ai,t.DomEvent=mt,t.DomUtil=pt,t.Draggable=Xe,t.Evented=it,t.FeatureGroup=ci,t.GeoJSON=wi,t.GridLayer=Ni,t.Handler=n,t.Icon=di,t.ImageOverlay=Ei,t.LatLng=v,t.LatLngBounds=s,t.Layer=o,t.LayerGroup=ui,t.LineUtil=vt,t.Map=A,t.Marker=mi,t.Mixin=ft,t.Path=fi,t.Point=p,t.PolyUtil=gt,t.Polygon=xi,t.Polyline=yi,t.Popup=Bi,t.PosAnimation=Fe,t.Projection=wt,t.Rectangle=Yi,t.Renderer=Wi,t.SVG=Gi,t.SVGOverlay=Oi,t.TileLayer=Di,t.Tooltip=Ii,t.Transformation=at,t.Util=tt,t.VideoOverlay=ki,t.bind=a,t.bounds=_,t.canvas=Ui,t.circle=function(t,e,i){return new vi(t,e,i)},t.circleMarker=function(t,e){return new gi(t,e)},t.control=Ue,t.divIcon=function(t){return new Ri(t)},t.extend=l,t.featureGroup=function(t,e){return new ci(t,e)},t.geoJSON=Si,t.geoJson=Mt,t.gridLayer=function(t){return new Ni(t)},t.icon=function(t){return new di(t)},t.imageOverlay=function(t,e,i){return new Ei(t,e,i)},t.latLng=w,t.latLngBounds=g,t.layerGroup=function(t,e){return new ui(t,e)},t.map=function(t,e){return new A(t,e)},t.marker=function(t,e){return new mi(t,e)},t.point=m,t.polygon=function(t,e){return new xi(t,e)},t.polyline=function(t,e){return new yi(t,e)},t.popup=function(t,e){return new Bi(t,e)},t.rectangle=function(t,e){return new Yi(t,e)},t.setOptions=c,t.stamp=h,t.svg=Ki,t.svgOverlay=function(t,e,i){return new Oi(t,e,i)},t.tileLayer=ji,t.tooltip=function(t,e){return new Ii(t,e)},t.transformation=ht,t.version="1.9.4",t.videoOverlay=function(t,e,i){return new ki(t,e,i)},window.L);t.noConflict=function(){return window.L=Xi,this},window.L=t});
//# sourceMappingURL=leaflet.js.map


(function(){
  'use strict';

  const bool = (value, fallback=false) => {
    if (value == null || value === '') return fallback;
    return String(value).toLowerCase() === 'true' || String(value) === '1';
  };

  const num = (value, fallback) => {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
  };

  const cleanBasePath = (value) => {
    const path = String(value || 'tiles').trim() || 'tiles';
    return path.replace(/\/+$/, '');
  };

  const joinPath = (base, file) => {
    const right = String(file || '').trim().replace(/^\/+/, '');
    return right ? `${cleanBasePath(base)}/${right}` : cleanBasePath(base);
  };

  function readXmlNumber(xml, names, fallback){
    for (const name of names) {
      const el = xml.querySelector(name);
      if (!el) continue;
      const value = Number(String(el.textContent || '').trim());
      if (Number.isFinite(value)) return value;
    }
    return fallback;
  }

  function readXmlText(xml, names, fallback=''){
    for (const name of names) {
      const el = xml.querySelector(name);
      if (!el) continue;
      const value = String(el.textContent || '').trim();
      if (value) return value;
    }
    return fallback;
  }

  async function loadTileConfig(root, showStatus){
    const tilesPath = cleanBasePath(root.dataset.tilesPath || 'tiles');
    const xmlFile = String(root.dataset.tilesXml || 'tiles.xml').trim() || 'tiles.xml';
    const xmlUrl = joinPath(tilesPath, xmlFile);

    const fallback = {
      source: 'fallback',
      xmlUrl,
      tilesPath,
      tileSize: Math.max(1, num(root.dataset.fallbackTileSize, 256)),
      originalWidth: Math.max(1, num(root.dataset.fallbackOriginalWidth, 5938)),
      originalHeight: Math.max(1, num(root.dataset.fallbackOriginalHeight, 3677)),
      minZoom: num(root.dataset.fallbackMinZoom, 0),
      maxZoom: num(root.dataset.fallbackMaxZoom, 3),
      zoomSnap: Math.max(.01, num(root.dataset.zoomSnap, .25)),
      tilePattern: String(root.dataset.tilePattern || '{z}/{x}/{y}.webp').trim() || '{z}/{x}/{y}.webp'
    };
    fallback.maxZoom = Math.max(fallback.minZoom, fallback.maxZoom);

    showStatus(`Lendo configuração: ${xmlUrl}`, 0);

    try {
      const response = await fetch(xmlUrl, { cache: 'no-cache' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const text = await response.text();
      const xml = new DOMParser().parseFromString(text, 'application/xml');
      if (xml.querySelector('parsererror')) throw new Error('XML inválido');

      const tileSize = Math.max(1, readXmlNumber(xml, ['tileSize', 'TileSize'], fallback.tileSize));
      const originalWidth = readXmlNumber(xml, ['originalWidth', 'OriginalWidth', 'width', 'Width'], 0);
      const originalHeight = readXmlNumber(xml, ['originalHeight', 'OriginalHeight', 'height', 'Height'], 0);
      const minZoom = readXmlNumber(xml, ['minZoom', 'MinZoom'], fallback.minZoom);
      const maxZoom = readXmlNumber(xml, ['maxZoom', 'MaxZoom'], NaN);
      const zoomSnap = Math.max(.01, readXmlNumber(xml, ['zoomSnap', 'ZoomSnap'], fallback.zoomSnap));

      if (!(originalWidth > 0) || !(originalHeight > 0)) {
        throw new Error('originalWidth/originalHeight ausentes ou inválidos');
      }
      if (!Number.isFinite(maxZoom)) {
        throw new Error('maxZoom ausente ou inválido');
      }

      // O projeto original usa {z}/{x}/{y}.webp. Se o XML trouxer um padrão,
      // ele pode substituir o padrão configurado no inspetor.
      const xmlPattern = readXmlText(xml, ['tilePattern', 'TilePattern', 'tileUrl', 'TileUrl'], '');
      const tilePattern = xmlPattern || fallback.tilePattern;

      const config = {
        source: 'xml',
        xmlUrl,
        tilesPath,
        tileSize,
        originalWidth,
        originalHeight,
        minZoom,
        maxZoom: Math.max(minZoom, maxZoom),
        zoomSnap,
        tilePattern
      };

      root.dataset.itpConfigSource = 'xml';
      root.dataset.itpResolvedMaxZoom = String(config.maxZoom);
      root.dataset.itpResolvedSize = `${config.originalWidth}x${config.originalHeight}`;
      showStatus(`tiles.xml carregado · ${config.originalWidth}×${config.originalHeight} · zoom ${config.minZoom}–${config.maxZoom}`, 2400);
      return config;
    } catch (error) {
      root.dataset.itpConfigSource = 'fallback';
      root.dataset.itpResolvedMaxZoom = String(fallback.maxZoom);
      root.dataset.itpResolvedSize = `${fallback.originalWidth}x${fallback.originalHeight}`;
      showStatus(`Não foi possível ler ${xmlUrl}. Usando fallback.`, 6500);
      console.warn('[Implantação Tiles Pro] Falha ao carregar tiles.xml:', error);
      return fallback;
    }
  }

  function createMap(root, mapEl, config, showStatus){
    const { tileSize, originalWidth: width, originalHeight: height, minZoom, maxZoom, zoomSnap } = config;
    const tileUrl = joinPath(config.tilesPath, config.tilePattern);
    const mobileGuard = bool(root.dataset.mobileGuard, true);
    const scrollWheel = bool(root.dataset.scrollWheel, false);
    const doubleClick = bool(root.dataset.doubleClick, true);
    const lockBounds = bool(root.dataset.lockBounds, true);
    const coarseMobile = window.matchMedia && window.matchMedia('(max-width:720px) and (pointer:coarse)').matches;

    const map = L.map(mapEl, {
      crs: L.CRS.Simple,
      minZoom,
      maxZoom,
      zoomSnap,
      zoomDelta: Math.max(.25, zoomSnap),
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: scrollWheel,
      doubleClickZoom: doubleClick,
      dragging: !(coarseMobile && mobileGuard),
      touchZoom: !(coarseMobile && mobileGuard),
      inertia: true,
      inertiaDeceleration: 3000,
      keyboard: true
    });

    // Mantém a matemática do projeto original: unproject usa o maxZoom lido do XML.
    const southWest = map.unproject([0, height], maxZoom);
    const northEast = map.unproject([width, 0], maxZoom);
    const bounds = new L.LatLngBounds(southWest, northEast);

    const layer = L.tileLayer(tileUrl, {
      tileSize,
      minZoom,
      maxZoom,
      noWrap: true,
      bounds,
      keepBuffer: 3,
      updateWhenIdle: true,
      updateWhenZooming: false
    }).addTo(map);

    let tileErrorShown = false;
    layer.on('tileerror', function(){
      if (tileErrorShown) return;
      tileErrorShown = true;
      showStatus(`Tile não encontrado. Verifique: ${tileUrl}`, 7000);
    });

    const fit = () => {
      map.invalidateSize(false);
      map.fitBounds(bounds, { animate:false, padding:[0,0] });
      if (lockBounds) map.setMaxBounds(bounds.pad(.04));
    };

    map.whenReady(fit);
    setTimeout(fit, 80);

    const zoomIn = root.querySelector('.itp-zoom-in');
    const zoomOut = root.querySelector('.itp-zoom-out');
    const fitBtn = root.querySelector('.itp-fit');
    if (zoomIn) zoomIn.addEventListener('click', () => map.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => map.zoomOut());
    if (fitBtn) fitBtn.addEventListener('click', fit);

    const guard = root.querySelector('.itp-mobile-guard');
    if (guard && coarseMobile && mobileGuard) {
      guard.addEventListener('click', function(){
        root.classList.add('is-mobile-active');
        map.dragging.enable();
        if (map.touchZoom) map.touchZoom.enable();
        map.invalidateSize(false);
      }, {once:true});
    } else {
      root.classList.add('is-mobile-active');
    }

    if (window.ResizeObserver) {
      const ro = new ResizeObserver(() => map.invalidateSize(false));
      ro.observe(mapEl);
      root._itpResizeObserver = ro;
    } else {
      window.addEventListener('resize', () => map.invalidateSize(false), {passive:true});
    }

    root._itpMap = map;
    root._itpBounds = bounds;
    root._itpTileConfig = config;
  }

  async function init(root){
    if (!root || root.dataset.itpReady === '1' || root.dataset.itpLoading === '1') return;
    const mapEl = root.querySelector('.itp-map');
    if (!mapEl || !window.L) return;
    root.dataset.itpLoading = '1';

    const status = root.querySelector('.itp-status');
    let statusTimer = 0;
    const showStatus = (message, timeout=3200) => {
      if (!status) return;
      status.textContent = message;
      status.classList.add('is-visible');
      clearTimeout(statusTimer);
      if (timeout) statusTimer = setTimeout(() => status.classList.remove('is-visible'), timeout);
    };

    try {
      const config = await loadTileConfig(root, showStatus);
      createMap(root, mapEl, config, showStatus);
      root.dataset.itpReady = '1';
    } catch (error) {
      console.error('[Implantação Tiles Pro] Erro ao inicializar:', error);
      showStatus('Não foi possível inicializar a implantação.', 7000);
    } finally {
      delete root.dataset.itpLoading;
    }
  }

  function scan(){
    document.querySelectorAll('[data-plugin="implantacao-tiles-pro"] .itp-root').forEach(init);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', scan, {once:true});
  else scan();

  if (window.MutationObserver) {
    const observer = new MutationObserver(scan);
    observer.observe(document.documentElement, {childList:true, subtree:true});
  }
})();


(function(){document.querySelectorAll('[data-plugin="faq"] details').forEach(item=>item.addEventListener('toggle',()=>{if(item.open)window.Imobify&&Imobify.track('faq_open',{question:item.querySelector('summary').textContent.replace('+','').trim()});}));})();


(function(){})();


/**
 * ================================================================
 * notify-send.js v1.2.0 - Sistema de Notificações e Alertas
 * ================================================================
 */

(function() {
    'use strict';
    
    // ============================================================
    // CONFIGURAÇÕES
    // ============================================================
    
    const CONFIG = {
        notificationDuration: 5000,
        alertDefaultAvatar: 'fa-info-circle',
        alertTypes: {
            success: { icon: 'fa-check-circle', color: '#27ae60', title: 'Sucesso' },
            error: { icon: 'fa-times-circle', color: '#e74c3c', title: 'Erro' },
            warning: { icon: 'fa-exclamation-triangle', color: '#f39c12', title: 'Atenção' },
            info: { icon: 'fa-info-circle', color: '#3498db', title: 'Informação' },
            question: { icon: 'fa-question-circle', color: '#9b59b6', title: 'Pergunta' }
        },
        defaultMessages: {
            success: { title: 'Sucesso!', message: 'Operação realizada com sucesso.' },
            error: { title: 'Erro!', message: 'Ocorreu um erro. Tente novamente.' },
            warning: { title: 'Atenção!', message: 'Verifique as informações antes de continuar.' },
            info: { title: 'Informação', message: 'Aguarde enquanto processamos sua solicitação.' }
        },
        icons: {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        },
        defaultAvatar: 'fa-bell'
    };
    
    // ============================================================
    // CRIAÇÃO DOS CONTAINERS
    // ============================================================
    
    function createContainers() {
        // Container de Notificações
        if (!document.getElementById('ns-notification-container')) {
            const container = document.createElement('div');
            container.id = 'ns-notification-container';
            container.className = 'ns-notification-container';
            document.body.appendChild(container);
        }
        
        // Modal Overlay
        if (!document.getElementById('ns-modal-overlay')) {
            const modalOverlay = document.createElement('div');
            modalOverlay.id = 'ns-modal-overlay';
            modalOverlay.className = 'ns-modal-overlay';
            modalOverlay.innerHTML = `
                <div class="ns-modal">
                    <div class="ns-modal-avatar-container" style="text-align: center; margin-bottom: 15px; display: none;">
                        <div class="ns-modal-avatar" style="width: 80px; height: 80px; border-radius: 50%; margin: 0 auto; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                            <i class="fas fa-info-circle" style="font-size: 48px; color: white;"></i>
                        </div>
                    </div>
                    <div class="ns-modal-icon" style="text-align: center; font-size: 50px; margin-bottom: 20px;">
                        <i class="fas fa-info-circle"></i>
                    </div>
                    <h2 class="ns-modal-title">Título</h2>
                    <p class="ns-modal-message">Mensagem</p>
                    <div class="ns-modal-buttons">
                        <button class="ns-modal-button confirm" style="background: #3498db; padding: 12px 28px; border: none; border-radius: 10px; font-weight: 600; cursor: pointer; color: white;">OK</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modalOverlay);
        }
        
        // Toast
        if (!document.getElementById('ns-toast')) {
            const toast = document.createElement('div');
            toast.id = 'ns-toast';
            toast.className = 'ns-toast';
            document.body.appendChild(toast);
        }
    }
    
    // ============================================================
    // FUNÇÃO PRINCIPAL: ALERT COM AVATAR
    // ============================================================
    
    window.notify_Send_alert = function(message, type = 'info', title = '', avatar = '') {
        return new Promise((resolve) => {
            const modalOverlay = document.getElementById('ns-modal-overlay');
            if (!modalOverlay) {
                console.error('notify_Send: Modal overlay não encontrado');
                resolve();
                return;
            }
            
            const modal = modalOverlay.querySelector('.ns-modal');
            const modalTitle = modal.querySelector('.ns-modal-title');
            const modalMessage = modal.querySelector('.ns-modal-message');
            const confirmBtn = modal.querySelector('.ns-modal-button.confirm');
            const modalIcon = modal.querySelector('.ns-modal-icon');
            const modalIconI = modal.querySelector('.ns-modal-icon i');
            const avatarContainer = modal.querySelector('.ns-modal-avatar-container');
            const avatarDiv = modal.querySelector('.ns-modal-avatar');
            
            // Configurar tipo
            const typeConfig = CONFIG.alertTypes[type] || CONFIG.alertTypes.info;
            const finalTitle = title || typeConfig.title;
            
            // Atualizar conteúdo
            modalTitle.textContent = finalTitle;
            modalMessage.textContent = message || 'Mensagem';
            confirmBtn.textContent = 'OK';
            confirmBtn.style.background = typeConfig.color;
            
            // Configurar avatar
            if (avatar) {
                // Mostrar container de avatar, esconder ícone padrão
                avatarContainer.style.display = 'block';
                modalIcon.style.display = 'none';
                
                // Configurar avatar
                if (avatar.match(/^(https?:\/\/|data:image|\/)/i) || avatar.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
                    // É URL de imagem
                    avatarDiv.innerHTML = `<img src="${avatar}" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;">`;
                } else if (avatar.startsWith('fa-')) {
                    // É ícone Font Awesome
                    avatarDiv.innerHTML = `<i class="fas ${avatar}" style="font-size: 48px; color: white;"></i>`;
                } else {
                    // Fallback
                    avatarDiv.innerHTML = `<i class="fas ${CONFIG.alertDefaultAvatar}" style="font-size: 48px; color: white;"></i>`;
                }
            } else {
                // Sem avatar, mostrar ícone padrão do tipo
                avatarContainer.style.display = 'none';
                modalIcon.style.display = 'block';
                if (modalIconI) {
                    modalIconI.className = `fas ${typeConfig.icon}`;
                    modalIconI.style.color = typeConfig.color;
                }
            }
            
            // Função para fechar
            function closeModal() {
                modalOverlay.classList.remove('show');
                resolve();
            }
            
            // Remover listener antigo e adicionar novo
            const newConfirmBtn = confirmBtn.cloneNode(true);
            confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
            
            newConfirmBtn.addEventListener('click', closeModal);
            
            // Fechar ao clicar fora
            modalOverlay.onclick = function(e) {
                if (e.target === modalOverlay) {
                    closeModal();
                }
            };
            
            // Mostrar modal
            modalOverlay.classList.add('show');
        });
    };
    
    // ============================================================
    // SOBRESCREVER ALERT NATIVO
    // ============================================================
    
    let alertOverridden = false;
    let originalAlert = null;
    
    window.notify_Send_override_alert = function(enable = true, defaultAvatar = '') {
        if (enable && !alertOverridden) {
            // Salvar referência do alert original
            originalAlert = window.alert;
            
            // Substituir
            window.alert = function(message) {
                window.notify_Send_alert(message, 'info', 'Aviso', defaultAvatar);
            };
            alertOverridden = true;
            console.log('✅ Alert nativo substituído pelo notify_Send_alert');
        } else if (!enable && alertOverridden) {
            // Restaurar alert original
            window.alert = originalAlert;
            alertOverridden = false;
            console.log('✅ Alert nativo restaurado');
        }
    };
    
    // ============================================================
    // FUNÇÕES DE NOTIFICAÇÃO
    // ============================================================
    
    function getAvatarHTML(avatar) {
        if (!avatar) {
            return `<div class="ns-notification-avatar"><i class="fas ${CONFIG.defaultAvatar}"></i></div>`;
        }
        
        if (avatar.match(/^(https?:\/\/|data:image|\/)/i) || avatar.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return `<div class="ns-notification-avatar"><img src="${avatar}" alt="Avatar" onerror="this.parentElement.innerHTML='<i class=\'fas fa-user-circle\'></i>'"></div>`;
        }
        
        if (avatar.startsWith('fa-')) {
            return `<div class="ns-notification-avatar"><i class="fas ${avatar}"></i></div>`;
        }
        
        return `<div class="ns-notification-avatar"><i class="fas fa-user-circle"></i></div>`;
    }
    
    function closeNotification(notificationElement) {
        if (!notificationElement || !notificationElement.parentElement) return;
        notificationElement.classList.remove('show');
        notificationElement.classList.add('hide');
        setTimeout(() => {
            if (notificationElement.parentElement) {
                notificationElement.parentElement.removeChild(notificationElement);
            }
        }, 400);
    }
    
    window.notify_Send_notification = function(type, message = '', title = '', avatar = '') {
        const validTypes = ['success', 'error', 'warning', 'info'];
        if (!validTypes.includes(type)) {
            console.warn(`notify_Send: Tipo inválido "${type}". Usando "info".`);
            type = 'info';
        }
        
        const finalTitle = title || CONFIG.defaultMessages[type].title;
        const finalMessage = message || CONFIG.defaultMessages[type].message;
        
        const notification = document.createElement('div');
        notification.className = `ns-notification ${type}`;
        
        const avatarHTML = getAvatarHTML(avatar);
        const iconHTML = !avatar ? `<i class="fas ${CONFIG.icons[type]} ns-notification-icon"></i>` : '';
        
        notification.innerHTML = `
            ${avatarHTML}
            ${iconHTML}
            <div class="ns-notification-content">
                <div class="ns-notification-title">${escapeHtml(finalTitle)}</div>
                <div class="ns-notification-message">${escapeHtml(finalMessage)}</div>
            </div>
            <button class="ns-notification-close" onclick="notify_Send_close_notification(this.parentElement)">
                <i class="fas fa-times"></i>
            </button>
            <div class="ns-notification-progress"></div>
        `;
        
        const container = document.getElementById('ns-notification-container');
        if (container) {
            container.appendChild(notification);
        } else {
            console.error('notify_Send: Container de notificações não encontrado');
            return;
        }
        
        setTimeout(() => {
            notification.classList.add('show');
            const progressBar = notification.querySelector('.ns-notification-progress');
            if (progressBar) {
                setTimeout(() => {
                    progressBar.style.transform = 'scaleX(0)';
                }, 50);
            }
        }, 10);
        
        const timeoutId = setTimeout(() => {
            if (notification.parentElement) {
                closeNotification(notification);
            }
        }, CONFIG.notificationDuration);
        
        notification.dataset.timeoutId = timeoutId;
    };
    
    window.notify_Send_close_notification = function(notificationElement) {
        if (notificationElement && notificationElement.dataset.timeoutId) {
            clearTimeout(parseInt(notificationElement.dataset.timeoutId));
        }
        closeNotification(notificationElement);
    };
    
    window.notify_Send_close_all = function() {
        const container = document.getElementById('ns-notification-container');
        if (container) {
            const notifications = container.querySelectorAll('.ns-notification');
            notifications.forEach(notification => {
                closeNotification(notification);
            });
        }
    };
    
    window.notify_Send_toast = function(message, duration = 3000) {
        const toast = document.getElementById('ns-toast');
        if (!toast) {
            console.error('notify_Send: Toast element não encontrado');
            return;
        }
        toast.textContent = message || 'Notificação';
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, duration);
    };
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // Inicialização
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createContainers);
    } else {
        createContainers();
    }
    
    console.log('🎉 notify-send.js carregado com sucesso!');
    console.log('📌 Funções disponíveis:');
    console.log('   - notify_Send_alert()');
    console.log('   - notify_Send_notification()');
    console.log('   - notify_Send_modal()');
    console.log('   - notify_Send_toast()');
    console.log('   - notify_Send_override_alert()');
    
})();

/**
 * formsenderJS.Plugin - Formulário de contato com validação e integração com notify-send
 * 
 * Uso:
 * new formsenderJS.Plugin('#meu-formulario', {
 *   produto: 'The Garden - New Edition',
 *   endpoint: 'https://script.google.com/macros/s/.../exec',
 *   textoBotao: 'Enviar Mensagem'
 * });
 */
(function() {
    'use strict';

    window.formsenderJS = window.formsenderJS || {};

    class FormPlugin {
        constructor(selector, options = {}) {
            // Container
            this.container = document.querySelector(selector);
            if (!this.container) {
                console.error(`[formsenderJS] Elemento "${selector}" não encontrado.`);
                throw new Error(`Elemento "${selector}" não encontrado.`);
            }

            // Opções padrão
            const defaults = {
                produto: 'The Garden - New Edition',
                endpoint: '',                    // obrigatório
                textoBotao: 'Enviar Mensagem',
                mostrarMensagem: true,
                mostrarCheckboxes: false,
                mostrarDataNasc: false,
                notificacao: null,               // função personalizada (tipo, mensagem, titulo)
                onSuccess: null,
                onError: null
            };
            this.opts = { ...defaults, ...options };

            if (!this.opts.endpoint) {
                throw new Error('[formsenderJS] A opção "endpoint" é obrigatória.');
            }

            // Gera ID único
            this.uid = 'fs-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6);

            // Constrói o HTML
            this.buildForm();

            // Inicializa eventos
            this.initEvents();

            console.log('[formsenderJS] Plugin inicializado com sucesso!');
        }

        // ---------- Monta o formulário (com prefixo CSS) ----------
        buildForm() {
            const uid = this.uid;
            const opts = this.opts;
            const css = 'formsenderCSS_';

            const hiddenFields = `
                <input type="hidden" name="produto" value="${opts.produto.replace(/"/g, '&quot;')}">
                <input type="hidden" name="dataHora" id="dataHora_${uid}">
            `;

            const nascimentoHtml = opts.mostrarDataNasc ? `
                <div class="${css}field">
                    <label for="nascimento_${uid}" class="${css}label">Data de Nascimento</label>
                    <input type="date" id="nascimento_${uid}" name="nascimento" class="${css}input">
                </div>
            ` : `
                <input type="date" name="nascimento" style="display:none;">
            `;

            const checkboxesHtml = opts.mostrarCheckboxes ? `
                <div class="${css}field">
                    <label class="${css}label">Informações Adicionais</label>
                    <div class="${css}checkbox-group">
                        <label class="${css}checkbox">
                            <input type="checkbox" name="anosCtps" value="X"> 3 Anos de carteira assinada?
                        </label>
                        <label class="${css}checkbox">
                            <input type="checkbox" name="fatorsocial" value="X"> Possui cônjuge ou dependente(a)
                        </label>
                        <label class="${css}checkbox">
                            <input type="checkbox" name="imovelnome" value="X"> Possui imóvel no nome?
                        </label>
                    </div>
                </div>
            ` : '';

            const mensagemHtml = opts.mostrarMensagem ? `
                <div class="${css}field">
                    <label for="msg_${uid}" class="${css}label">Mensagem</label>
                    <textarea id="msg_${uid}" name="msg" rows="4" class="${css}input ${css}textarea"></textarea>
                </div>
            ` : '';

            const formHtml = `
                <form id="form_${uid}" class="${css}form" novalidate>
                    ${hiddenFields}
                    <div class="${css}field">
                        <label for="nome_${uid}" class="${css}label">Nome Completo *</label>
                        <input type="text" id="nome_${uid}" name="nome" required class="${css}input">
                    </div>
                    <div class="${css}row">
                        <div class="${css}col">
                            <label for="email_${uid}" class="${css}label">E-mail *</label>
                            <input type="email" id="email_${uid}" name="email" required class="${css}input">
                        </div>
                        <div class="${css}col">
                            <label for="telefone_${uid}" class="${css}label">Telefone *</label>
                            <input type="tel" id="telefone_${uid}" name="telefone" required class="${css}input">
                        </div>
                    </div>
                    ${nascimentoHtml}
                    ${checkboxesHtml}
                    ${mensagemHtml}
                    <button type="submit" id="submit_${uid}" class="${css}button">${opts.textoBotao}</button>
                    <div id="resposta_${uid}" class="${css}resposta"></div>
                </form>
            `;

            this.container.innerHTML = formHtml;

            // Referências
            this.form = document.getElementById(`form_${uid}`);
            this.submitBtn = document.getElementById(`submit_${uid}`);
            this.resposta = document.getElementById(`resposta_${uid}`);
            this.dataHoraInput = document.getElementById(`dataHora_${uid}`);
        }

        // ---------- Eventos ----------
        initEvents() {
            // Máscara de telefone
            const telInput = this.form.querySelector('input[name="telefone"]');
            if (telInput) {
                telInput.addEventListener('input', (e) => {
                    let value = e.target.value.replace(/\D/g, '');
                    if (value.length > 11) value = value.substring(0, 11);
                    if (value.length > 0) {
                        value = value.replace(/^(\d{0,2})(\d{0,5})(\d{0,4}).*/, '($1) $2-$3');
                    }
                    e.target.value = value;
                });
            }

            // Validação de data
            const dateInput = this.form.querySelector('input[type="date"]');
            if (dateInput && this.opts.mostrarDataNasc) {
                dateInput.addEventListener('change', (e) => {
                    const selected = new Date(e.target.value);
                    const today = new Date();
                    if (selected > today) {
                        this.mostrarNotificacao('error', 'Data de nascimento não pode ser no futuro', 'Erro!');
                        e.target.value = '';
                    }
                });
            }

            // Envio
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // ---------- VALIDAÇÃO MANUAL DOS CAMPOS OBRIGATÓRIOS ----------
        validarCampos() {
            // Define quais campos são obrigatórios conforme as opções
            const obrigatorios = ['nome', 'email', 'telefone'];
            
            // Se quiser tornar a data obrigatória, descomente a linha abaixo:
            // if (this.opts.mostrarDataNasc) obrigatorios.push('nascimento');

            let valido = true;
            const css = 'formsenderCSS_';

            for (const campo of obrigatorios) {
                const input = this.form.querySelector(`[name="${campo}"]`);
                if (input) {
                    // Remove espaços e verifica se está vazio
                    if (!input.value.trim()) {
                        input.classList.add(`${css}input_error`);
                        valido = false;
                    } else {
                        input.classList.remove(`${css}input_error`);
                    }
                }
            }
            return valido;
        }

        // ---------- Envio com validação ----------
        handleSubmit(e) {
            e.preventDefault();

            // 1. VALIDA OS CAMPOS
            if (!this.validarCampos()) {
                this.mostrarNotificacao('error', 'Preencha todos os campos obrigatórios.', 'Atenção!');
                return; // Não envia
            }

            // 2. DESABILITA BOTÃO
            this.submitBtn.disabled = true;
            const originalText = this.submitBtn.textContent;
            this.submitBtn.textContent = 'Enviando...';

            // 3. PREENCHE DATA/HORA
            if (this.dataHoraInput) {
                this.dataHoraInput.value = new Date().toLocaleString('pt-BR');
            }

            const formData = new FormData(this.form);

            // 4. ENVIA
            fetch(this.opts.endpoint, {
                method: 'POST',
                body: formData,
            })
                .then(response => response.text())
                .then(msg => {
                    this.resposta.innerText = msg;
                    this.resposta.className = 'formsenderCSS_resposta formsenderCSS_success';
                    this.mostrarNotificacao('success', 'Mensagem enviada com sucesso!', 'Sucesso!');
                    this.form.reset();
                    if (this.opts.onSuccess) this.opts.onSuccess(msg);
                })
                .catch(err => {
                    this.resposta.innerText = 'Erro ao enviar dados. Por favor, tente novamente.';
                    this.resposta.className = 'formsenderCSS_resposta formsenderCSS_error';
                    this.mostrarNotificacao('error', 'Erro no envio. Tente novamente.', 'Erro!');
                    console.error(err);
                    if (this.opts.onError) this.opts.onError(err);
                })
                .finally(() => {
                    this.submitBtn.disabled = false;
                    this.submitBtn.textContent = originalText;
                    setTimeout(() => {
                        this.resposta.innerText = '';
                        this.resposta.className = 'formsenderCSS_resposta';
                    }, 3000);
                });
        }

        // ---------- Sistema de notificação (integrado ao notify-send) ----------
        mostrarNotificacao(tipo, mensagem, titulo) {
            // 1. Se o usuário forneceu uma função personalizada, usa ela
            if (typeof this.opts.notificacao === 'function') {
                this.opts.notificacao(tipo, mensagem, titulo);
                return;
            }

            // 2. Se o notify-send estiver disponível, usa-o
            if (typeof window.notify_Send_notification === 'function') {
                const avatar = (tipo === 'success')
                    ? 'https://randomuser.me/api/portraits/men/32.jpg'
                    : 'fas fa-exclamation-triangle';
                window.notify_Send_notification(tipo, mensagem, titulo, avatar);
                return;
            }

            // 3. Fallback para showfeedview_notification
            if (typeof window.showfeedview_notification === 'function') {
                window.showfeedview_notification(tipo, mensagem, titulo);
                return;
            }

            // 4. Último recurso: alert simples
            alert(`${titulo}: ${mensagem}`);
        }
    }

    // Exporta a classe no namespace
    window.formsenderJS.Plugin = FormPlugin;

    //console.log(' formsenderJS.Plugin carregado com sucesso!');
    //console.log(' Uso: new formsenderJS.Plugin("#seletor", { ... });');
})();

(function () {
  'use strict';

  function enabled(value) {
    return value === 'true' || value === '1' || value === 'on';
  }


  function applyPossibilitySummary(mount, explicitSummary) {
    var summary = String(explicitSummary || '');
    if (!summary) { try { summary = sessionStorage.getItem('imobify:possibility-path-summary') || ''; } catch (_) {} }
    if (!summary) return;
    var form = mount && mount.querySelector('form');
    if (!form) return;
    var msg = form.querySelector('textarea[name="msg"]');
    if (msg && !msg.value.trim()) msg.value = summary;
    var hidden = form.querySelector('input[name="diagnosticoPossibilidade"]');
    if (!hidden) { hidden = document.createElement('input'); hidden.type = 'hidden'; hidden.name = 'diagnosticoPossibilidade'; form.appendChild(hidden); }
    hidden.value = summary;
  }

  function initialize() {
    document.querySelectorAll('[data-plugin="form-sender-v4"] .formsenderV4_mount:not([data-initialized])').forEach(function (mount, index) {
      mount.dataset.initialized = 'true';
      mount.id = mount.id || 'formsender-v4-' + Date.now() + '-' + index + '-' + Math.random().toString(36).slice(2, 7);

      if (!window.formsenderJS || typeof window.formsenderJS.Plugin !== 'function') {
        mount.innerHTML = '<p>Não foi possível inicializar o Form.v4.</p>';
        return;
      }

      var endpoint = (mount.dataset.endpoint || '').trim();
      if (!endpoint) {
        mount.innerHTML = '<p>Configure o endpoint do Form.v4 no editor.</p>';
        return;
      }

      if (window.__IMOBIFY_EDITOR__) {
        mount.addEventListener('submit', function (event) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }, true);
      }

      try {
        var instance = new window.formsenderJS.Plugin('#' + mount.id, {
          produto: mount.dataset.product || 'The Garden - New Edition',
          endpoint: endpoint,
          textoBotao: mount.dataset.buttonText || 'Enviar Mensagem',
          mostrarMensagem: enabled(mount.dataset.showMessage),
          mostrarCheckboxes: enabled(mount.dataset.showCheckboxes),
          mostrarDataNasc: enabled(mount.dataset.showBirthdate),
          notificacao: function (type, message, title) {
            if (type === 'success') return;
            if (typeof window.notify_Send_notification === 'function') {
              window.notify_Send_notification(type, message, title, 'fas fa-exclamation-triangle');
            } else {
              window.alert(title + ': ' + message);
            }
          },
          onSuccess: function () {
            if (typeof window.notify_Send_notification === 'function') {
              window.notify_Send_notification(
                'success',
                mount.dataset.successMessage || 'Nosso consultor entrará em contato!',
                mount.dataset.successTitle || 'Fique atento',
                mount.dataset.successAvatar || ''
              );
            }
          },
          onError: function (error) {
            console.warn('[Form.v4]', error);
          }
        });
        mount.formsenderV4 = instance;
        applyPossibilitySummary(mount);
      } catch (error) {
        console.error('[Form.v4]', error);
        mount.innerHTML = '<p>Erro ao carregar o formulário: ' + String(error.message || error) + '</p>';
      }
    });
  }

  window.addEventListener('imobify:possibility-path-complete', function (event) { document.querySelectorAll('[data-plugin="form-sender-v4"] .formsenderV4_mount').forEach(function (mount) { applyPossibilitySummary(mount, event.detail && event.detail.summary); }); });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
  else initialize();
})();


(function(){
  'use strict';
  function installFallback(image){
    if(image.dataset.footerIconFallback==='true')return;
    image.dataset.footerIconFallback='true';
    image.addEventListener('error',()=>{
      const fallback=document.createElement('i');
      fallback.className='fa-solid fa-link';
      fallback.setAttribute('aria-hidden','true');
      image.replaceWith(fallback);
    },{once:true});
  }
  function init(scope=document){
    scope.querySelectorAll('[data-plugin="footer"] .footer-social-icon img').forEach(installFallback);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>init(),{once:true});
  else init();
})();


(function(){if(!('IntersectionObserver'in window)||matchMedia('(prefers-reduced-motion: reduce)').matches)return;document.documentElement.classList.add('reveal-ready');const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.08});document.querySelectorAll('.section-shell:not([data-plugin="parallax"]):not([data-plugin="scrollytelling-video-pro"])').forEach(section=>observer.observe(section));})();


(function(){const triggers=document.querySelectorAll('[data-lightbox-src]');if(!triggers.length)return;const box=document.createElement('div');box.className='imobify-lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.innerHTML='<button aria-label="Fechar">×</button><img alt="Imagem ampliada">';document.body.append(box);const close=()=>{box.classList.remove('is-open');document.body.classList.remove('no-scroll');};triggers.forEach(trigger=>trigger.addEventListener('click',()=>{box.querySelector('img').src=trigger.dataset.lightboxSrc;box.classList.add('is-open');document.body.classList.add('no-scroll');box.querySelector('button').focus();}));box.addEventListener('click',event=>{if(event.target===box||event.target.tagName==='BUTTON')close();});addEventListener('keydown',event=>{if(event.key==='Escape')close();});})();


(function () {
  "use strict";

  const ROOT_CLASS = "imobify-content-protection";
  const READY_ATTRIBUTE = "data-content-protection-ready";

  function isEditableElement(element) {
    if (!(element instanceof Element)) {
      return false;
    }

    return Boolean(
      element.closest(
        'input, textarea, select, [contenteditable="true"], [data-allow-copy]'
      )
    );
  }

  function blockEvent(event) {
    if (isEditableElement(event.target)) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
  }

  function blockKeyboardShortcuts(event) {
    const key = String(event.key || "").toLowerCase();
    const ctrlOrCommand = event.ctrlKey || event.metaKey;

    if (isEditableElement(event.target)) {
      return;
    }

    const blockedShortcut =
      event.key === "F12" ||
      (ctrlOrCommand && key === "c") ||
      (ctrlOrCommand && key === "x") ||
      (ctrlOrCommand && key === "u") ||
      (event.ctrlKey && event.shiftKey && ["i", "j", "c"].includes(key)) ||
      (event.metaKey && event.altKey && ["i", "j", "c"].includes(key));

    if (!blockedShortcut) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();
  }

  function initialize() {
    const html = document.documentElement;

    if (html.hasAttribute(READY_ATTRIBUTE)) {
      return;
    }

    html.setAttribute(READY_ATTRIBUTE, "true");
    html.classList.add(ROOT_CLASS);

    document.addEventListener("contextmenu", blockEvent, true);
    document.addEventListener("selectstart", blockEvent, true);
    document.addEventListener("copy", blockEvent, true);
    document.addEventListener("cut", blockEvent, true);
    document.addEventListener("keydown", blockKeyboardShortcuts, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, {
      once: true
    });
  } else {
    initialize();
  }
})();
