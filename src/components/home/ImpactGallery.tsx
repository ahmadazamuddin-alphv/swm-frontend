"use client";

import { useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/ui/Icons";

const slides = [
  {
    image: "/mock/gallery/dengkil-dumping.jpg",
    eyebrow: "Dengkil · Sepang",
    title: "Illegal dumping leaves a visible trail",
    body: "Community reporting helps councils see recurring hotspots before they become permanent sites.",
    source: "The Star · May 2023",
  },
  {
    image: "/mock/gallery/puchong-dumping.jpg",
    eyebrow: "Puchong · Subang Jaya",
    title: "A shared signal for a shared place",
    body: "Evidence gives residents, officers and contractors the same starting point for action.",
    source: "The Star · October 2023",
  },
  {
    image: "/mock/gallery/kapar-pothole.jpg",
    eyebrow: "Kapar · Klang",
    title: "Road damage affects every journey",
    body: "A clear location and photo make it easier to route a road complaint to the right team.",
    source: "The Star · June 2026",
  },
  {
    image: "/mock/gallery/subang-pothole.jpg",
    eyebrow: "Subang Jaya",
    title: "Follow the repair, not only the report",
    body: "Siaga keeps the public view focused on what changed after a case was raised.",
    source: "The Star · January 2026",
  },
] as const;

export function ImpactGallery() {
  const [active, setActive] = useState(0);
  const slide = slides[active];

  function move(direction: -1 | 1) {
    setActive((current) => (current + direction + slides.length) % slides.length);
  }

  return (
    <section className="mt-8 overflow-hidden rounded-[32px] border border-[#ead9b8] bg-[#fff8ea]/95 shadow-[0_18px_42px_rgba(64,35,10,0.10)] backdrop-blur sm:mt-12">
      <div className="grid lg:grid-cols-[1.18fr_0.82fr]">
        <div className="relative min-h-[300px] overflow-hidden bg-[#17100b] sm:min-h-[420px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className="absolute inset-0 h-full w-full object-cover transition-opacity duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17100b]/80 via-transparent to-[#17100b]/10" />
          <span className="absolute left-5 top-5 rounded-full bg-[#fff8ea]/90 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a91824]">
            Selangor field notes
          </span>
          <p className="absolute bottom-5 left-5 right-5 text-xs text-white/80">
            {slide.source}
          </p>
        </div>
        <div className="flex flex-col justify-between p-7 sm:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a91824]">
              {slide.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.035em] text-[#17100b] sm:text-4xl">
              {slide.title}
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#6e5c4b]">
              {slide.body}
            </p>
          </div>
          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex gap-1.5" aria-label="Gallery slides">
              {slides.map((item, index) => (
                <button
                  key={item.image}
                  type="button"
                  aria-label={`Show gallery slide ${index + 1}`}
                  aria-current={index === active ? "true" : undefined}
                  onClick={() => setActive(index)}
                  className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-[#D2222B]" : "w-2 bg-[#d8c49f] hover:bg-[#FDB915]"}`}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="button" aria-label="Previous gallery slide" onClick={() => move(-1)} className="grid size-10 place-items-center rounded-full border border-[#ead9b8] bg-white text-[#6e5c4b] hover:border-[#D2222B] hover:text-[#a91824]">
                <ArrowLeftIcon className="size-4" />
              </button>
              <button type="button" aria-label="Next gallery slide" onClick={() => move(1)} className="grid size-10 place-items-center rounded-full bg-[#D2222B] text-white shadow-[0_7px_16px_rgba(210,34,43,0.22)] hover:bg-[#a91824]">
                <ArrowRightIcon className="size-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
