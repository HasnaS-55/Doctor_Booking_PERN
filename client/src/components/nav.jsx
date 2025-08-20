import { useEffect, useRef, useState, useId } from "react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import BookDoctorLogo from "./logo";

const PillNav = ({
  items,
  mobileExtraItems = [],
  activeHref: controlledActive,
  className = "",
  ease = "power3.easeOut",
  baseColor = "#fff",
  pillColor = "#060010",
  hoveredPillTextColor = "#060010",
  pillTextColor,
  onMobileMenuClick,
  initialLoadAnimation = true,
  inline = false,
}) => {
  
  const getIsLg = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(min-width: 1024px)").matches;

  const [isLg, setIsLg] = useState(getIsLg);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const cb = (e) => setIsLg(e.matches);
    mq.addEventListener
      ? mq.addEventListener("change", cb)
      : mq.addListener(cb);
    setIsLg(mq.matches);
    return () => {
      mq.removeEventListener
        ? mq.removeEventListener("change", cb)
        : mq.removeListener(cb);
    };
  }, []);

  const effectiveBaseColor = isLg ? baseColor : "#246AFE";
  const resolvedPillTextColor = pillTextColor ?? effectiveBaseColor;

  
  const [active, setActive] = useState(
    controlledActive || items?.[0]?.href || "#home"
  );
  useEffect(() => {
    if (controlledActive) setActive(controlledActive);
  }, [controlledActive]);

  const onHashClick = (e, href) => {
    e.preventDefault();
    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
    setActive(href);
  };

  useEffect(() => {
    const hashItems = (items || []).filter((it) => it.href?.startsWith("#"));
    const targets = hashItems
      .map((it) => document.getElementById(it.href.slice(1)))
      .filter(Boolean);
    if (!targets.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (vis) setActive(`#${vis.target.id}`);
        if (window.scrollY < 10 && hashItems[0]) setActive(hashItems[0].href);
      },
      { threshold: [0.55], rootMargin: "-10% 0px -10% 0px" }
    );

    targets.forEach((t) => io.observe(t));
    const onScrollTop = () => {
      if (window.scrollY < 10 && hashItems[0]) setActive(hashItems[0].href);
    };
    window.addEventListener("scroll", onScrollTop, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScrollTop);
    };
  }, [items]);

  /* ---------- refs ---------- */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const tlRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);
  const wrapRef = useRef(null);
  const menuId = useId();

  /* ---------- layout + gsap setup ---------- */
  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;
        const pill = circle.parentElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta =
          Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });

        const label = pill.querySelector(".pill-label");
        const white = pill.querySelector(".pill-label-hover");
        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });
        tl.to(
          circle,
          { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: "auto" },
          0
        );
        if (label)
          tl.to(
            label,
            { y: -(h + 8), duration: 2, ease, overwrite: "auto" },
            0
          );
        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(
            white,
            { y: 0, opacity: 1, duration: 2, ease, overwrite: "auto" },
            0
          );
        }
        tlRefs.current[index] = tl;
      });
    };
    layout();
    const onResize = () => layout();
    window.addEventListener("resize", onResize);
    if (document.fonts?.ready)
      document.fonts.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu)
      gsap.set(menu, { visibility: "hidden", opacity: 0, scaleY: 1, y: 0 });

    if (initialLoadAnimation && !inline) {
      const navItems = navItemsRef.current;
      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: "hidden" });
        gsap.to(navItems, { width: "auto", duration: 0.6, ease });
      }
    }
    return () => window.removeEventListener("resize", onResize);
  }, [items, ease, initialLoadAnimation, inline]);

  /* ---------- open/close helpers + click-outside ---------- */
  const setMenuOpen = (open) => {
    setIsMobileMenuOpen(open);
    const menu = mobileMenuRef.current;
    if (!menu) return;
    if (open) {
      gsap.set(menu, { visibility: "visible" });
      gsap.fromTo(
        menu,
        { opacity: 0, y: 10, scaleY: 1 },
        {
          opacity: 1,
          y: 0,
          scaleY: 1,
          duration: 0.3,
          ease,
          transformOrigin: "top center",
        }
      );
    } else {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        scaleY: 1,
        duration: 0.2,
        ease,
        transformOrigin: "top center",
        onComplete: () => gsap.set(menu, { visibility: "hidden" }),
      });
    }
    onMobileMenuClick?.();
  };

  const toggleMobileMenu = () => setMenuOpen(!isMobileMenuOpen);

  // Close on click-outside & on Escape
  useEffect(() => {
    const handlePointer = (e) => {
      if (!isMobileMenuOpen) return;
      const menu = mobileMenuRef.current;
      const burger = hamburgerRef.current;
      if (!menu || !burger) return;

      const target = e.target;
      const clickedInsideMenu = menu.contains(target);
      const clickedBurger = burger.contains(target);

      // Clicking hamburger will toggle via onClick; we also close if user taps outside
      if (!clickedInsideMenu && !clickedBurger) setMenuOpen(false);
    };

    const handleEsc = (e) => {
      if (e.key === "Escape" && isMobileMenuOpen) setMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointer, true);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("pointerdown", handlePointer, true);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMobileMenuOpen]);

  /* ---------- hover tweens for desktop pills ---------- */
  const handleEnter = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: "auto",
    });
  };
  const handleLeave = (i) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: "auto",
    });
  };

 
  const isExternalLink = (href = "") =>
    href.startsWith("http://") ||
    href.startsWith("https://") ||
    href.startsWith("//") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:");
  const isRouterLink = (href) =>
    href && !isExternalLink(href) && !href.startsWith("#");
  const isHash = (href = "") => href.startsWith("#");

  const cssVars = {
    ["--base"]: effectiveBaseColor,
    ["--pill-bg"]: pillColor,
    ["--hover-text"]: hoveredPillTextColor,
    ["--pill-text"]: resolvedPillTextColor,
    ["--nav-h"]: "45px",
    ["--pill-pad-x"]: "18px",
    ["--pill-gap"]: "3px",
  };

  const isActiveHref = (href) => active === href;
  const mobileItems = [...(items || []), ...(mobileExtraItems || [])];

  return (
    <>
      {/* Fixed logo row ONLY when not inline (desktop) */}
      {!inline && (
        <div className="fixed top-10 w-full z-[1001] flex items-center">
          <BookDoctorLogo
            className="h-10 w-auto"
            textClassName="text-neutral-900 dark:text-white"
            accentClassName="text-blue-600 dark:text-blue-400"
            strokeClassName="text-neutral-900 dark:text-white"
            showTagline={false}
          />
        </div>
      )}

      <div
        ref={wrapRef}
        className={
          inline
            ? "relative z-[1001] w-full px-0"
            : "fixed top-4 left-2/6 -translate-x-1/2 z-[1001] w-full lg:w-auto px-4"
        }
      >
        <nav
          className={`w-full lg:w-max flex items-center justify-between lg:justify-start box-border py-4 lg:px-0 ${className}`}
          aria-label="Primary"
          style={cssVars}
        >
          {/* DESKTOP pills */}
          <div
            ref={navItemsRef}
            className="relative p-2 items-center rounded-full hidden lg:flex ml-2"
            style={{ height: "var(--nav-h)", background: "var(--base, #000)" }}
          >
            <ul
              role="menubar"
              className="list-none flex items-stretch m-0 h-full"
              style={{ gap: "var(--pill-gap)" }}
            >
              {items.map((item, i) => {
                const pillStyle = {
                  background: "var(--pill-bg, #fff)",
                  color: "var(--pill-text, var(--base, #000))",
                  paddingLeft: "var(--pill-pad-x)",
                  paddingRight: "var(--pill-pad-x)",
                };

                const PillContent = (
                  <>
                    <span
                      className="hover-circle absolute left-1/2 bottom-0 rounded-full z-[1] block pointer-events-none"
                      style={{
                        background: "var(--base, #000)",
                        willChange: "transform",
                      }}
                      aria-hidden="true"
                      ref={(el) => (circleRefs.current[i] = el)}
                    />
                    <span className="label-stack relative inline-block leading-[1] z-[2]">
                      <span
                        className="pill-label relative z-[2] inline-block leading-[1]"
                        style={{ willChange: "transform" }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover absolute left-0 top-0 z-[3] inline-block"
                        style={{
                          color: "var(--hover-text, #fff)",
                          willChange: "transform, opacity",
                        }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                    {isActiveHref(item.href) && (
                      <span
                        className="absolute left-1/2 -bottom-[6px] -translate-x-1/2 w-3 h-3 rounded-full z-[4]"
                        style={{ background: "var(--base, #000)" }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                );

                const basePillClasses =
                  "relative overflow-hidden inline-flex items-center justify-center h-full no-underline rounded-full box-border font-semibold text-[16px] leading-[0] uppercase tracking-[0.2px] whitespace-nowrap cursor-pointer px-0";

                const isRouter = isRouterLink(item.href);

                return (
                  <li key={item.href} role="none" className="flex h-full">
                    {isRouter ? (
                      <Link
                        role="menuitem"
                        to={item.href}
                        className={basePillClasses}
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        aria-current={
                          isActiveHref(item.href) ? "page" : undefined
                        }
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                      >
                        {PillContent}
                      </Link>
                    ) : (
                      <a
                        role="menuitem"
                        href={item.href}
                        className={basePillClasses}
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        aria-current={
                          isActiveHref(item.href) ? "page" : undefined
                        }
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                        onClick={(e) => {
                          if (isHash(item.href)) onHashClick(e, item.href);
                        }}
                      >
                        {PillContent}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* MOBILE brand + hamburger (hidden on lg) */}
          <div className="lg:hidden w-full flex justify-between items-center gap-2 ml-auto">
            <BookDoctorLogo
              className="h-10 w-auto"
              textClassName="text-neutral-900 dark:text-white"
              accentClassName="text-blue-600 dark:text-blue-400"
              strokeClassName="text-neutral-900 dark:text-white"
              showTagline={false}
            />
            <button
              ref={hamburgerRef}
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls={menuId}
              className="rounded-full border-0 flex flex-col items-center justify-center gap-1 cursor-pointer p-0"
              style={{
                width: "var(--nav-h)",
                height: "var(--nav-h)",
                background: "var(--base, #000)",
              }}
            >
              <span
                className="hamburger-line w-4 h-0.5 rounded origin-center transition-all"
                style={{ background: "var(--pill-bg, #fff)" }}
              />
              <span
                className="hamburger-line w-4 h-0.5 rounded origin-center transition-all"
                style={{ background: "var(--pill-bg, #fff)" }}
              />
            </button>
          </div>
        </nav>

        {/* MOBILE MENU */}
        <div
          id={menuId}
          ref={mobileMenuRef}
          className="lg:hidden absolute p-1 w-1/2 top-[3em] right-4 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-[998] origin-top"
          style={{
            ["--base"]: effectiveBaseColor,
            ["--pill-bg"]: pillColor,
            ["--hover-text"]: hoveredPillTextColor,
            ["--pill-text"]: resolvedPillTextColor,
            background: "var(--base, #f0f0f0)",
          }}
        >
          <ul className="list-none m-0 p-[3px] flex flex-col gap-[3px]">
            {mobileItems.map((item) => {
              const defaultStyle = { background: "#ffffff40", color: "#fff" };
              const hoverIn = (e) => {
                e.currentTarget.style.background = "#ffffff40";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateX(3px)";
              };
              const hoverOut = (e) => {
                e.currentTarget.style.background = "#ffffff40";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.transform = "translateX(0px)";
              };
              const linkClasses =
                "block py-3 px-4 text-[16px] font-medium rounded-2xl transition-all";

              const isRouter = isRouterLink(item.href);

              return (
                <li key={`${item.label}-${item.href}`}>
                  {isRouter ? (
                    <Link
                      to={item.href}
                      className={linkClasses}
                      style={defaultStyle}
                      onMouseEnter={hoverIn}
                      onMouseLeave={hoverOut}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href}
                      className={linkClasses}
                      style={defaultStyle}
                      onMouseEnter={hoverIn}
                      onMouseLeave={hoverOut}
                      onClick={(e) => {
                        if (isHash(item.href)) onHashClick(e, item.href);
                        setMenuOpen(false);
                      }}
                      aria-current={active === item.href ? "page" : undefined}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default PillNav;
