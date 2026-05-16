import { useEffect, useRef, useState } from "react";
import { siteConfig } from "./config/siteConfig.js";

const isExternalUrl = (url) => /^https?:\/\//i.test(url);
const isInactiveUrl = (url) => !url || url === "#";

const getYoutubeId = (urlString = "") => {
  try {
    const url = new URL(urlString);
    const host = url.hostname.replace(/^www\./, "");

    if (host === "youtu.be") {
      return url.pathname.split("/").filter(Boolean)[0] || "";
    }

    if (host.endsWith("youtube.com")) {
      const watchId = url.searchParams.get("v");
      if (watchId) return watchId;

      const parts = url.pathname.split("/").filter(Boolean);
      const markerIndex = parts.findIndex((part) =>
        ["embed", "shorts", "live"].includes(part),
      );

      if (markerIndex >= 0) return parts[markerIndex + 1] || "";
    }
  } catch {
    return "";
  }

  return "";
};

const getYoutubeWatchUrl = (urlString = "") => {
  const youtubeId = getYoutubeId(urlString);
  return youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : urlString;
};

const getYoutubeThumbnailUrl = (urlString = "") => {
  const youtubeId = getYoutubeId(urlString);
  return youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : "";
};

function App() {
  const navItems = [
    { href: "#merch", label: siteConfig.merch.title },
    { href: "#partners", label: siteConfig.partnersSection.title },
    { href: "#content", label: siteConfig.contentSection.title },
    { href: "#accomplishments", label: siteConfig.accomplishmentsSection.title },
  ];

  return (
    <div className="site-shell">

      <header className="site-header">
        <div className="marquee" role="presentation">
          <div className="marquee-track">
            <span>{siteConfig.brand.marquee}</span>
            <span>{siteConfig.brand.marquee}</span>
          </div>
        </div>

        <div className="header-main">
          <a className="logo-link" href="#top" aria-label={siteConfig.brand.name}>
            <img
              className="site-logo"
              src={siteConfig.brand.logoSrc}
              alt={siteConfig.brand.logoAlt}
            />
          </a>
          <ThemeSongPlayer config={siteConfig.themeSong} />
        </div>

        <nav className="site-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      <main id="top">
        <Hero />

        <div className="hero-grid">
          <Dancer config={siteConfig.dancer} />
          <MerchSection config={siteConfig.merch} />
        </div>

        <PartnersSection config={siteConfig.partnersSection} />
        <ContentSection config={siteConfig.contentSection} />
        <AccomplishmentsSection config={siteConfig.accomplishmentsSection} />
      </main>

      <Footer config={siteConfig.footer} />
    </div>
  );
}

function ThemeSongPlayer({ config }) {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const hasSong = Boolean(config.src);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.muted = isMuted;
    audioRef.current.loop = config.loop;
  }, [config.loop, isMuted]);

  const handleMuteToggle = async () => {
    if (!hasSong || !audioRef.current) return;

    const nextMuted = !isMuted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted) {
      try {
        await audioRef.current.play();
        setHasError(false);
      } catch {
        audioRef.current.muted = true;
        setIsMuted(true);
        setHasError(true);
      }
      return;
    }

    setHasError(false);
  };

  const buttonLabel = isMuted ? "Unmute" : "Mute";

  return (
    <div className="theme-player" aria-label={config.title}>
      <audio
        ref={audioRef}
        src={config.src || undefined}
        preload="auto"
        autoPlay={hasSong}
        muted={isMuted}
        loop={config.loop}
      />
      <span className="theme-title">{config.title}</span>
      <div className="theme-controls">
        <button type="button" onClick={handleMuteToggle} disabled={!hasSong}>
          {buttonLabel}
        </button>
      </div>
      {hasError ? <span className="theme-error">blocked by browser</span> : null}
    </div>
  );
}

function Hero() {
  const { hero } = siteConfig;

  return (
    <section className="hero-panel" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="blink-badge">{hero.badge}</p>
        <h1 id="hero-title">{hero.headline}</h1>
        <p>{hero.subhead}</p>
      </div>
      {/* <div className="ticker-board" aria-label="Site notices">
        {hero.tickerItems.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div> */}
    </section>
  );
}

function Dancer({ config }) {
  const floorRef = useRef(null);
  const rigRef = useRef(null);
  const frameRef = useRef(0);
  const positionRef = useRef({ x: 36, y: 34 });
  const dragRef = useRef({
    active: false,
    offsetX: 0,
    offsetY: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    vx: 0,
    vy: 0,
  });
  const [position, setPosition] = useState(positionRef.current);
  const [isDragging, setIsDragging] = useState(false);
  const [ragdoll, setRagdoll] = useState(0);
  const [spin, setSpin] = useState(0);

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const setSafePosition = (nextPosition) => {
    positionRef.current = nextPosition;
    setPosition(nextPosition);
  };

  const getBounds = () => {
    const floor = floorRef.current?.getBoundingClientRect();
    const rig = rigRef.current?.getBoundingClientRect();

    if (!floor || !rig) {
      return { minX: 0, minY: 0, maxX: 360, maxY: 260 };
    }

    return {
      minX: 0,
      minY: 0,
      maxX: Math.max(0, floor.width - rig.width),
      maxY: Math.max(0, floor.height - rig.height),
    };
  };

  const clampPosition = (x, y) => {
    const bounds = getBounds();
    return {
      x: Math.min(bounds.maxX, Math.max(bounds.minX, x)),
      y: Math.min(bounds.maxY, Math.max(bounds.minY, y)),
    };
  };

  const startThrow = (velocityX, velocityY) => {
    cancelAnimationFrame(frameRef.current);

    const bounds = getBounds();
    let x = positionRef.current.x;
    let y = positionRef.current.y;
    let vx = velocityX;
    let vy = velocityY;
    let lastTime = performance.now();

    setRagdoll(Math.min(1, Math.hypot(vx, vy) / 28));

    const tick = (now) => {
      const dt = Math.min(34, now - lastTime) / 16;
      lastTime = now;

      x += vx * dt;
      y += vy * dt;
      vy += 0.42 * dt;
      vx *= 0.94;
      vy *= 0.95;

      if (x <= bounds.minX || x >= bounds.maxX) {
        vx *= -0.58;
        x = Math.min(bounds.maxX, Math.max(bounds.minX, x));
      }

      if (y <= bounds.minY || y >= bounds.maxY) {
        vy *= -0.48;
        y = Math.min(bounds.maxY, Math.max(bounds.minY, y));
      }

      setSpin((current) => current + vx * 0.34);
      setSafePosition({ x, y });

      if (Math.hypot(vx, vy) > 0.45 || y < bounds.maxY - 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setRagdoll(0);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
  };

  const handlePointerDown = (event) => {
    const floor = floorRef.current?.getBoundingClientRect();
    if (!floor) return;

    cancelAnimationFrame(frameRef.current);
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      active: true,
      offsetX: event.clientX - floor.left - positionRef.current.x,
      offsetY: event.clientY - floor.top - positionRef.current.y,
      lastX: event.clientX,
      lastY: event.clientY,
      lastTime: performance.now(),
      vx: 0,
      vy: 0,
    };
    setRagdoll(0);
    setIsDragging(true);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;
    const floor = floorRef.current?.getBoundingClientRect();
    if (!floor) return;

    const now = performance.now();
    const elapsed = Math.max(1, now - dragRef.current.lastTime);
    const next = clampPosition(
      event.clientX - floor.left - dragRef.current.offsetX,
      event.clientY - floor.top - dragRef.current.offsetY,
    );

    dragRef.current.vx = ((event.clientX - dragRef.current.lastX) / elapsed) * 16;
    dragRef.current.vy = ((event.clientY - dragRef.current.lastY) / elapsed) * 16;
    dragRef.current.lastX = event.clientX;
    dragRef.current.lastY = event.clientY;
    dragRef.current.lastTime = now;
    setSpin((current) => current + dragRef.current.vx * 0.08);
    setSafePosition(next);
  };

  const handlePointerUp = (event) => {
    if (!dragRef.current.active) return;
    dragRef.current.active = false;
    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    startThrow(dragRef.current.vx, dragRef.current.vy);
  };

  const handleDoubleClick = () => {
    startThrow(9 + Math.random() * 8, -14 - Math.random() * 9);
  };

  const className = [
    "dancer-rig",
    isDragging ? "is-dragging" : "",
    ragdoll > 0 ? "is-ragdolling" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="window-panel dancer-panel" aria-labelledby="dancer-title">
      <div className="window-titlebar">
        <span id="dancer-title">{config.label}</span>
        <span aria-hidden="true"></span>
      </div>
      <div className="dance-floor" ref={floorRef}>
        <div
          ref={rigRef}
          className={className}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onDoubleClick={handleDoubleClick}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) rotate(${spin}deg)`,
            "--ragdoll": ragdoll,
          }}
          role="button"
          tabIndex={0}
          aria-label={config.instruction}
          title={config.instruction}
        >
          <div className="dancer-shadow" />
          <div className="dancer-body">
            <img className="dancer-head" src={config.headSrc} alt={config.headAlt} />
            <div className="torso" />
            <div className="arm arm-left" />
            <div className="arm arm-right" />
            <div className="leg leg-left" />
            <div className="leg leg-right" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MerchSection({ config }) {
  return (
    <section className="window-panel merch-panel" id="merch" aria-labelledby="merch-title">
      <div className="window-titlebar">
        <span>{config.eyebrow}</span>
        <span aria-hidden="true"></span>
      </div>
      <div className="merch-layout">
        <div className="merch-image-wrap">
          <img src={config.imageSrc} alt={config.imageAlt} />
        </div>
        <div className="merch-copy">
          <h2 id="merch-title">{config.title}</h2>
          <p>{config.description}</p>
          <SmartLink className="primary-cta" href={config.url}>
            {config.buttonText}
          </SmartLink>
        </div>
      </div>
    </section>
  );
}

function PartnersSection({ config }) {
  return (
    <section className="section-block" id="partners" aria-labelledby="partners-title">
      <SectionHeading title={config.title} subtitle={config.subtitle} />
      <div className="partner-scroll" aria-label={config.title}>
        {config.partners.map((partner) => (
          <article className="partner-card" key={partner.name}>
            <img src={partner.imageSrc} alt={partner.imageAlt} />
            <div>
              <h3>{partner.name}</h3>
              <p>{partner.subtitle}</p>
            </div>
            <SocialLinks links={partner.links} />
          </article>
        ))}
      </div>
    </section>
  );
}

function ContentSection({ config }) {
  return (
    <section className="section-block" id="content" aria-labelledby="content-title">
      <SectionHeading title={config.title} subtitle={config.subtitle} />
      <div className="video-scroll" aria-label={config.title}>
        {config.videos.map((video) => {
          const videoUrl = video.youtubeUrl;
          const watchUrl = getYoutubeWatchUrl(videoUrl);
          const thumbnailUrl = video.thumbnailSrc || getYoutubeThumbnailUrl(videoUrl);

          return (
            <article className="video-card" key={`${video.channel}-${video.title}`}>
              <SmartLink className="video-thumb-link" href={watchUrl}>
                <div className="video-frame">
                  {thumbnailUrl ? (
                    <img src={thumbnailUrl} alt="" loading="lazy" />
                  ) : (
                    <span className="video-fallback">VIDEO</span>
                  )}
                </div>
                <div className="video-copy">
                  <h3>{video.title}</h3>
                  <p>{video.channel}</p>
                  <span className="watch-label">Watch on YouTube</span>
                </div>
              </SmartLink>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function AccomplishmentsSection({ config }) {
  return (
    <section
      className="section-block accomplishments-section"
      id="accomplishments"
      aria-labelledby="accomplishments-title"
    >
      <SectionHeading title={config.title} subtitle={config.subtitle} />
      <div className="accomplishment-list">
        {config.accomplishments.map((item) => (
          <article className="accomplishment-card" key={`${item.tag}-${item.title}`}>
            <div className="accomplishment-stamp">{item.tag}</div>
            <div className="accomplishment-copy">
              <h3>{item.title}</h3>
              <p className="accomplishment-people">{item.people}</p>
              <p>{item.description}</p>
              <SocialLinks links={item.links} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function SectionHeading({ title, subtitle }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function SocialLinks({ links = [] }) {
  if (!links.length) return null;

  return (
    <div className="link-row">
      {links.map((link) => (
        <SmartLink key={`${link.label}-${link.url}`} href={link.url}>
          {link.label}
        </SmartLink>
      ))}
    </div>
  );
}

function SmartLink({ href, className = "", children }) {
  const inactive = isInactiveUrl(href);
  const external = !inactive && isExternalUrl(href);

  return (
    <a
      className={[className, inactive ? "inactive-link" : ""].filter(Boolean).join(" ")}
      href={href || "#"}
      aria-disabled={inactive ? "true" : undefined}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      onClick={(event) => {
        if (inactive) event.preventDefault();
      }}
    >
      {children}
    </a>
  );
}

function Footer({ config }) {
  return (
    <footer className="site-footer">
      <div></div>
      <div className="footer-links">
        {config.links.map((link) => (
          <SmartLink key={`${link.label}-${link.url}`} href={link.url}>
            {link.label}
          </SmartLink>
        ))}
      </div>
    </footer>
  );
}

export default App;
