"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { MenuCard, type MenuCardType } from "@/components/MenuCard";
import { SectionHead } from "@/components/SectionHead";
import { Reveal } from "@/components/motion/Reveal";
import { Toggle } from "@/components/ui/Toggle";
import { formatPaise } from "@/components/ordering/format-money";
import {
  publishedMenuHeading,
  type PublishedMenuChapter,
} from "@/lib/published-menu-cards";

export type PublishedMenuRailProps = Readonly<{
  chapter: PublishedMenuChapter;
  sectionId: string;
  showChapterLabel: boolean;
  tone: "page" | "sunken";
  cardType: Extract<MenuCardType, "drink" | "plate">;
  labelledByPrefix: string;
}>;

export function PublishedMenuRail(props: PublishedMenuRailProps) {
  const reduce = useReducedMotion() ?? false;
  const heading = publishedMenuHeading(props.chapter.name);
  const tabs = props.chapter.tabs;
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? "");
  const selectedId = tabs.some((tab) => tab.id === activeId) ? activeId : (tabs[0]?.id ?? "");

  const cards = useMemo(
    () => tabs.find((tab) => tab.id === selectedId)?.cards ?? [],
    [selectedId, tabs],
  );

  const railRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (railRef.current) railRef.current.scrollLeft = 0;
  }, [selectedId]);

  const surface =
    props.tone === "sunken" ? "bg-[var(--bg-surface-sunken)]" : "bg-[var(--bg-page)]";
  const tabId = (id: string) => `${props.labelledByPrefix}-tab-${id}`;
  const panelId = `${props.labelledByPrefix}-panel-${props.chapter.id}`;

  return (
    <section id={props.sectionId} className={surface} data-testid="published-menu-chapter">
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
                  id={tabId(tab.id)}
                  role="tab"
                  aria-selected={active}
                  aria-controls={panelId}
                  selected={active}
                  onClick={() => setActiveId(tab.id)}
                >
                  {tab.name}
                </Toggle>
              );
            })}
          </Reveal>
        ) : null}

        <div className="relative">
          <EdgeFade side="left" tone={props.tone} />
          <EdgeFade side="right" tone={props.tone} />
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedId}
              ref={railRef}
              role="tabpanel"
              id={panelId}
              aria-labelledby={tabs.length > 1 ? tabId(selectedId) : undefined}
              aria-label={tabs.length > 1 ? undefined : props.chapter.name}
              tabIndex={0}
              className={[
                "flex gap-3.5 md:gap-[18px]",
                "overflow-x-auto scroll-smooth snap-x snap-mandatory",
                "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
                "[-webkit-overflow-scrolling:touch]",
                "py-1 pb-2",
                "rounded-sm focus-ring",
              ].join(" ")}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduce ? undefined : { opacity: 0 }}
              transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
            >
              {cards.map((card, index) => {
                const node = (
                  <div
                    className="contents"
                    data-testid="published-menu-card"
                    data-variant-id={card.variantId}
                  >
                    <MenuCard
                      item={{ name: card.name, description: card.description }}
                      priceLabel={formatPaise(card.displayPricePaise)}
                      index={index}
                      type={props.cardType}
                      img={card.imagePath ?? undefined}
                    />
                  </div>
                );
                return reduce ? (
                  <div key={card.variantId} className="contents">
                    {node}
                  </div>
                ) : (
                  <motion.div
                    key={card.variantId}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      ease: [0, 0, 0.2, 1],
                      delay: Math.min(index * 0.06, 0.5),
                    }}
                    className="contents"
                  >
                    {node}
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

function EdgeFade({ side, tone }: { side: "left" | "right"; tone: "page" | "sunken" }) {
  const grad =
    tone === "sunken"
      ? side === "left"
        ? "bg-gradient-to-r from-[var(--bg-surface-sunken)] to-transparent"
        : "bg-gradient-to-l from-[var(--bg-surface-sunken)] to-transparent"
      : side === "left"
        ? "bg-gradient-to-r from-[var(--bg-page)] to-transparent"
        : "bg-gradient-to-l from-[var(--bg-page)] to-transparent";
  const pos = side === "left" ? "left-0" : "right-0";
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute top-0 bottom-2 ${pos} w-8 md:w-12 z-[3] ${grad}`}
    />
  );
}
