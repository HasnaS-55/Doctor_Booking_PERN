import Book_Filter from "../components/book_filter";
import HeroBooking from "../components/hero-section";
import AboutSection from "../components/AboutSection";
import Footer from "../components/Footer";
import HexGridOverlayFilled from "../components/hexo";

export default function Home() {
  return (
    <>
      <section>
        <HeroBooking />
      </section>
      <AboutSection />
      <section
        id="doctor"
        className="relative isolate overflow-hidden bg-tree-blue text-white py-16"
      >
        <HexGridOverlayFilled
          rows={16}
          cols={8}
          size={160}
          gapX={26}
          gapY={22}
          color="#ffffff40"
          fillOpacity={0.1}
          strokeOpacity={0.18}
          className="mix-blend-soft-light"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-20 h-0"
        >
          <div className="absolute -left-24 -top-0 w-[220px] h-[120px] rounded-[999px] bg-tree-light" />
          <div className="absolute -right-24 -top-0 w-[220px] h-[120px] rounded-[999px] bg-tree-light" />
        </div>
        <Book_Filter />
      </section>
      <Footer />
    </>
  );
}
