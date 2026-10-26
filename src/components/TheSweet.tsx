"use client";

/**
 * TheSweet — polaroid presentation for one published menu chapter.
 * Every published card in the active section is shown. Nothing is sliced off
 * because of a fixed dessert count.
 */

import { useMemo, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { PolaroidCard } from "@/components/PolaroidCard";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/motion/Reveal";
import { Toggle } from "@/components/ui/Toggle";
import { formatPaise } from "@/components/ordering/format-money";
import {
  publishedMenuHeading,
  type PublishedMenuChapter,
} from "@/lib/published-menu-cards";

const STACK_TILTS = [-5, 5, -3, 4];
const ROW_TILTS = [-7, -2, 3, 7];
const ROW_NUDGES = ["mt-12", "mt-0", "mt-0", "mt-12"];

export function TheSweet(props: {
  chapter: PublishedMenuChapter;
  sectionId: string;
  showChapterLabel: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const heading = publishedMenuHeading(props.chapter.name);
  const tabs = props.chapter.tabs;
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const selectedId = tabs.some((tab) => tab.id === activeId) ? activeId : (tabs[0]?.id ?? "");

  const cards = useMemo(
    () => tabs.find((tab) => tab.id === selectedId)?.cards ?? [],
    [selectedId, tabs],
  );

  return (
    <section
      id={props.sectionId}
      className="bg-[var(--bg-section)]"
      data-testid="published-menu-chapter"
    >
      <div className="mx-auto max-w-[1340px] px-5 md:px-10 lg:px-14 py-16 md:py-24 lg:py-28">
        <SectionHead
          chapter={props.showChapterLabel ? "CHAPTER 02 · THE MENU" : undefined}
          leading={heading.leading}
          accent={heading.accent}
          glue={heading.glue}
          nowrap
          description="From the current menu."
        />

        {tabs.length > 1 ? (
          <Reveal
            as="div"
            y={16}
            role="tablist"
            aria-label={props.chapter.name}
            className="flex flex-wrap gap-2 md:gap-2.5 mb-7 md:mb-9"
          >
            {tabs.map((tab) => {
              const active = tab.id === selectedId;
              return (
                <Toggle
                  key={tab.id}
                  id={`sweet-tab-${tab.id}`}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`sweet-panel-${props.chapter.id}`}
                  selected={active}
                  onClick={() => setActiveId(tab.id)}
                >
                  {tab.name}
                </Toggle>
              );
            })}
          </Reveal>
        ) : null}

        <div
          id={`sweet-panel-${props.chapter.id}`}
          role="tabpanel"
          aria-label={props.chapter.name}
          className="xl:hidden grid grid-cols-2 justify-items-center gap-4 md:gap-8 py-6 md:py-10"
        >
          {cards.map((card, index) => (
            <div key={card.variantId} data-testid="published-menu-card" data-variant-id={card.variantId}>
              <PolaroidCard
                name={card.name}
                description={card.description}
                priceLabel={formatPaise(card.displayPricePaise)}
                tilt={reduce ? 0 : (STACK_TILTS[index % STACK_TILTS.length] ?? 0)}
                img={card.imagePath ?? undefined}
                index={index}
              />
            </div>
          ))}
        </div>

        <div className="hidden xl:flex flex-wrap justify-center items-start gap-6 2xl:gap-10 py-12">
          {cards.map((card, index) => (
            <div
              key={card.variantId}
              className={ROW_NUDGES[index % ROW_NUDGES.length]}
              data-testid="published-menu-card"
              data-variant-id={card.variantId}
            >
              <PolaroidCard
                name={card.name}
                description={card.description}
                priceLabel={formatPaise(card.displayPricePaise)}
                tilt={reduce ? 0 : (ROW_TILTS[index % ROW_TILTS.length] ?? 0)}
                img={card.imagePath ?? undefined}
                index={index}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
