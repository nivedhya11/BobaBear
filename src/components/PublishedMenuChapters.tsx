"use client";

import { useEffect, useState } from "react";

import { TheBar } from "@/components/TheBar";
import { ThePlates } from "@/components/ThePlates";
import { TheSweet } from "@/components/TheSweet";
import { getCustomerMenu } from "@/lib/customer-commerce";
import {
  publishedMenuChapters,
  publishedMenuSectionDomId,
  type PublishedMenuChapter,
} from "@/lib/published-menu-cards";
import { DIRECT_ORDERING_BRAND_ID } from "@/shared/customer-menu/constants";

type LoadState = "loading" | "ready" | "unavailable";

export function PublishedMenuChapters() {
  const [state, setState] = useState<LoadState>("loading");
  const [chapters, setChapters] = useState<readonly PublishedMenuChapter[]>([]);

  useEffect(() => {
    let cancelled = false;
    void getCustomerMenu({ brandId: DIRECT_ORDERING_BRAND_ID })
      .then((result) => {
        if (cancelled) return;
        if (!result.ok) {
          setChapters([]);
          setState("unavailable");
          return;
        }
        setChapters(publishedMenuChapters(result.data.menu));
        setState("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setChapters([]);
        setState("unavailable");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (state === "loading") {
    return (
      <section className="bg-[var(--bg-page)]" data-testid="published-menu-status">
        <p className="mx-auto max-w-[1340px] px-5 py-16 font-body text-[15px] text-[var(--text-secondary)]">
          Loading the menu…
        </p>
      </section>
    );
  }

  if (state === "unavailable" || chapters.length === 0) {
    return (
      <section className="bg-[var(--bg-page)]" data-testid="published-menu-status">
        <p
          role="status"
          className="mx-auto max-w-[1340px] px-5 py-16 font-body text-[15px] text-[var(--text-secondary)]"
        >
          {state === "unavailable"
            ? "The menu isn't available right now."
            : "Nothing is on the menu right now."}
        </p>
      </section>
    );
  }

  return (
    <>
      {chapters.map((chapter, index) => {
        const view = {
          chapter,
          sectionId: publishedMenuSectionDomId(index, chapter.id),
          showChapterLabel: index === 0,
        };
        const visual = index % 3;
        if (visual === 1) return <ThePlates key={chapter.id} {...view} />;
        if (visual === 2) return <TheSweet key={chapter.id} {...view} />;
        return <TheBar key={chapter.id} {...view} />;
      })}
    </>
  );
}
