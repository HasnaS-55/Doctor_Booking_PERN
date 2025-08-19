import ScrollReveal from "./ScrollReveal";

export default function AboutSection() {
  return (
    <section id="about" className="relative py-2 lg:py-20">
      {/* subtle backdrop accent */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: "",
        }}
      />

      <div className="mx-auto max-w-7xl px-4">
        {/* Headline */}
        <div className="mb-8 lg:mb-12">
          <div className="leading-none">
            <span className="block text-5xl sm:text-6xl lg:text-7xl font-extrabold">
              <span className="bg-gradient-to-r from-tree-blue to-blue-400 bg-clip-text text-transparent">
                About
              </span>
              <span className="ml-3 text-tree-dark">the</span>
            </span>
            <span className="block text-4xl sm:text-5xl font-semibold text-tree-dark mt-1">
              App{" "}
              <span className="align-top text-sm text-gray-400">{`{Details}`}</span>
            </span>
          </div>
        </div>

        <div>
          <ScrollReveal
            baseOpacity={0}
            enableBlur
            blurStrength={10}
            baseRotation={5}
          >
            {`Our web app lets you browse doctors, see real-time availability, and book instantly from any device. 
          Filter by specialty, location, and language, then confirm in a few taps. Skip the phone tag and the guesswork—find the right 
          doctor and secure your time in seconds, all without stepping outside.`}
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
