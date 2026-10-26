"use client";

/**
 * TheBar — drink-rail presentation for one published menu chapter.
 * Cards come from the customer Menu projection, not a hardcoded product list.
 */

import { PublishedMenuRail } from "@/components/PublishedMenuRail";
import type { PublishedMenuChapter } from "@/lib/published-menu-cards";

export function TheBar(props: {
  chapter: PublishedMenuChapter;
  sectionId: string;
  showChapterLabel: boolean;
}) {
  return (
    <PublishedMenuRail
      chapter={props.chapter}
      sectionId={props.sectionId}
      showChapterLabel={props.showChapterLabel}
      tone="page"
      cardType="drink"
      labelledByPrefix="bar"
    />
  );
}
