import React, { useEffect, useState } from "react";
import PillNav from "./nav";
import HexGridOverlayFilled from "./hexo";
import { Stethoscope } from "lucide-react";
import { Link } from "react-router-dom";
import CircularText from "./CircularRotatingText";

export default function HeroBooking() {
  const [activeHref, setActiveHref] = useState("#home");

  const items = [
    { label: "HOME", href: "#home" },
    { label: "ABOUT", href: "#about" },
    { label: "BOOK", href: "#doctor" },
  ];
  const mobileExtra = [
    { label: "REGISTER", href: "/register" },
    { label: "LOG IN", href: "/login" },
  ];

  const handleItemClick = (href) => {
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setActiveHref(href);
    }
  };

  useEffect(() => {
    const ids = items.map((i) => i.href.replace("#", ""));
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveHref(`#${visible.target.id}`);
      },
      { threshold: [0.55] }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <>
      {/* ========= MOBILE-ONLY HERO ========= */}
      <section className="lg:hidden w-full relative px-4 pt-4 pb-24">
        <div className="flex items-center justify-between">
          <PillNav
            items={items}
            mobileExtraItems={mobileExtra} // mobile adds Register/Login
            inline 
            activeHref={activeHref}
            onItemClick={handleItemClick}
            className="custom-nav"
            ease="power2.easeOut"
            baseColor="#246AFE"
            pillColor="#fff"
            hoveredPillTextColor="#fff"
            pillTextColor="#246AFE"
          />
        </div>

        {/* headline */}
        <div className="mt-6">
          <h1 className="font-semibold text-tree-dark leading-[0.9] tracking-tight text-[44px] xs:text-[52px]">
            B<span className="text-tree-blue">oo</span>k Online Now!
            <br />
            See a Doctor Fast
          </h1>
        </div>

        {/* metrics */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="text-tree-blue text-3xl font-semibold">10+</div>
            <div className="text-[11px] leading-4 text-tree-dark/70">
              <span className="font-medium">years</span>
              <br />
              of experience
            </div>
          </div>
          <div className="text-center">
            <div className="text-tree-blue text-3xl font-semibold">20+</div>
            <div className="text-[11px] leading-4 text-tree-dark/70">
              <span className="font-medium">highly qualified</span>
              <br />
              doctors
            </div>
          </div>
          <div className="text-center">
            <div className="text-tree-blue text-3xl font-semibold">100%</div>
            <div className="text-[11px] leading-4 text-tree-dark/70">
              <span className="font-medium">digital</span>
              <br />
              diagnostics
            </div>
          </div>
        </div>

        {/* visual area */}
        <div className="relative mt-5">
          <div className="absolute right-0 top-6 w-2/4 h-2/4 bg-tree-blue rounded-3xl" />
          <img
            src="/doc.png"
            alt="Doctor"
            className="relative z-10 w-full max-w-[260px] mx-auto object-contain"
          />
        </div>

        {/* bottom CTA fixed within hero */}
        <div className="z-50 w-full max-w-md">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("doctor");
              if (el)
                el.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
            className="group relative w-full h-14 rounded-full pl-6 pr-16 text-white font-medium
                       bg-gradient-to-r from-blue-500 to-blue-700 shadow-[0_12px_28px_rgba(37,99,235,.35)]
                       ring-1 ring-white/10 hover:to-blue-800 transition-colors"
          >
            Find Doctor
            <span
              className="absolute right-1.5 top-1/2 -translate-y-1/2 grid place-items-center
                             w-11 h-11 rounded-full bg-white text-blue-600 ring-1 ring-blue-300 shadow-md
                             transition-transform duration-300 group-hover:translate-x-1"
            >
              <Stethoscope className="w-5 h-5" strokeWidth={2} />
            </span>
          </button>
        </div>
      </section>

      {/* ========= DESKTOP/LAPTOP HERO (unchanged layout) ========= */}
      <section
        id="home"
        aria-label="Book a doctor appointment"
        className="hidden lg:flex w-full h-screen flex-col p-5"
      >
        <div className="w-full h-full  justify-center items-center  flex rounded-2xl">
          <div className="w-1/2 h-full bg-white/30 relative flex flex-col justify-end p-5 rounded-2xl ">
            <div className="flex justify-between">
              <PillNav
                items={items} 
                activeHref={activeHref}
                onItemClick={handleItemClick}
                className="custom-nav"
                ease="power2.easeOut"
                baseColor="#246AFE"
                pillColor="#fff"
                hoveredPillTextColor="#fff"
                pillTextColor="#246AFE"
              />
            </div>

            <div className="pointer-events-none absolute bottom-0 z-[20] h-[85%] w-[200%] bg-[url('/doc.png')] bg-no-repeat bg-contain bg-center overflow-hidden" />
            <div className="absolute bottom-80 left-210 z-[20] px-8 py-2 rounded-full text-lg font-medium text-neutral-900 bg-[#ffffff10] backdrop-blur-sm ring-1 ring-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              Professional
            </div>
            <div className="absolute bottom-60 left-90 z-[20] px-8 py-2 rounded-full text-lg font-medium text-neutral-900 bg-[#ffffff10] backdrop-blur-sm ring-1 ring-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              100% Digital
            </div>
            <div className="absolute bottom-20 left-230 z-[20] px-8 py-2 w-2/9 rounded-full text-lg font-medium text-neutral-900 bg-[#ffffff10] backdrop-blur-sm ring-1 ring-white/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
              No Delays
            </div>

            <div className="flex h-4/6 flex-col justify-between w-full gap-4.5 z-[30]">
              <div>
                <h1 className="text-6xl font-semibold text-tree-dark">
                  B<span className="text-tree-blue">oo</span>k Online Now!
                </h1>
                <div className="flex w-full gap-4.5 items-end">
                  <h2 className="text-6xl font-semibold text-tree-dark">
                    See a Doctor Fast
                  </h2>
                </div>
                <button
                  type="button"
                  aria-label="Find Doctor"
                  onClick={() => {
                    const el = document.getElementById("doctor");
                    if (el)
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                  }}
                  className="w-1/2 mt-7 group relative cursor-pointer inline-flex items-center h-12 rounded-full pl-6 pr-16 text-white font-medium bg-gradient-to-l from-white-900 via-blue-400 to-blue-600 shadow-[0_10px_24px_rgba(37,99,235,.35)] ring-1 ring-inset ring-white/10 overflow-hidden select-none transition-colors duration-300 hover:to-blue-700"
                >
                  <span className="drop-shadow-sm">Find Doctor</span>
                  <span className="pointer-events-none absolute inset-y-0 right-11 w-16 " />
                  <span className="absolute right-1.5 grid place-items-center w-10 h-10 rounded-full bg-white text-blue-600 ring-1 ring-blue-300 shadow-md transition-transform duration-300 group-hover:translate-x-1">
                    <Stethoscope className="w-5 h-5" strokeWidth={2} />
                  </span>
                </button>
              </div>

              <div className="w-2/3 flex-col p-4 bg-white rounded-2xl">
                <div className="w-full flex items-center justify-between">
                  <h6>Results we are pround of</h6>
                  <div className="w-[80px] h-[10px] bg-tree-blue rounded-2xl" />
                </div>
                <div className="flex w-full justify-around items-center mt-5">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <h6 className="text-5xl text-tree-blue font-semibold">
                      5+
                    </h6>
                    <p className="text-tree-dark text-lg">Fields</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <h6 className="text-5xl text-tree-blue font-semibold">
                      20+
                    </h6>
                    <p className="text-tree-dark text-lg">Doctors</p>
                  </div>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <h6 className="text-5xl text-tree-blue font-semibold">
                      100%
                    </h6>
                    <p className="text-tree-dark text-lg">Digital</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="w-1/2 h-full flex flex-col items-center justify-between z-[10] bg-tree-blue rounded-2xl overflow-hidden p-5">
            
            <HexGridOverlayFilled
              rows={6}
              cols={8}
              size={160}
              gapX={26}
              gapY={22}
              color="#ffffff30"
              fillOpacity={0.1}
              strokeOpacity={0.18}
              className="mix-blend-soft-light pointer-events-none"
            />
            <div className="w-full  flex  justify-end  gap-2">
              <Link
                to="/register"
                aria-label="register"
                className="w-[100px] mt-7 group  relative inline-flex items-center justify-center h-8 rounded-full text-tree-dark font-medium bg-white shadow-[0_10px_24px_rgba(37,99,235,.35)] ring-1 ring-inset ring-white/10 overflow-hidden select-none transition-colors duration-300 hover:to-blue-700"
              >
                <span className="drop-shadow-sm">Register</span>
                <span className="pointer-events-none absolute inset-y-0 right-11 w-16" />
              </Link>
              <Link
                to="/login"
                aria-label="Log in"
                className="w-[100px]  mt-7 group relative inline-flex items-center justify-center h-8 rounded-full text-tree-dark font-medium bg-white shadow-[0_10px_24px_rgba(37,99,235,.35)] ring-1 ring-inset ring-white/10 overflow-hidden select-none transition-colors duration-300 hover:to-blue-700"
              >
                <span className="drop-shadow-sm">Log In</span>
                <span className="pointer-events-none absolute inset-y-0 right-11 w-16" />
              </Link>
            </div>
            <div className="flex flex-col w-4/8 h-[50%] text-white justify-center items-center gap-3">
              <span className="font-semibold text-4xl">
                Check real-time availability
              </span>
              <p>
                Skip the phone calls and crowded waiting rooms. Find & book an
                appointment with your preferred doctor is fast, easy. Choose the
                perfect slot, and confirm instantly—all from home.
              </p>
            </div>
            <div className="w-full flex items-end justify-end -mb-15 mt-30">
              <CircularText
                segments={["Book", "Checkups", "Follow-ups"]}
                separator={"   •   "}
                size={140}
                fontSize={16}
                className="text-white"
                speedClass="animate-[spin_10s_linear_infinite]"
                clockwise
              />
            </div>
            <div />
          </div>
        </div>
      </section>
    </>
  );
}
