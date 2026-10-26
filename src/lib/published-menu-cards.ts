/**
 * Group the customer Menu read projection into marketing chapters.
 *
 * Sellable names, prices, images, and section labels come only from the
 * published projection. This module does not name categories or choose variants.
 */
import type {
  CustomerMenuItem,
  CustomerMenuProjection,
  CustomerMenuSection,
} from "@/shared/customer-menu/types";

export type PublishedMenuCard = Readonly<{
  variantId: string;
  name: string;
  description: string;
  displayPricePaise: number;
  imagePath: string | null;
}>;

export type PublishedMenuTab = Readonly<{
  id: string;
  name: string;
  cards: readonly PublishedMenuCard[];
}>;

export type PublishedMenuChapter = Readonly<{
  id: string;
  name: string;
  tabs: readonly PublishedMenuTab[];
}>;

export type PublishedMenuHeading = Readonly<{
  leading: string;
  accent: string;
  glue: boolean;
}>;

function compareSections(left: CustomerMenuSection, right: CustomerMenuSection): number {
  if (left.position !== right.position) return left.position - right.position;
  return left.id.localeCompare(right.id);
}

function toCard(item: CustomerMenuItem): PublishedMenuCard {
  return {
    variantId: item.variantId,
    name: item.name,
    description: item.description ?? "",
    displayPricePaise: item.displayPricePaise,
    imagePath: item.imagePath,
  };
}

export function publishedMenuHeading(name: string): PublishedMenuHeading {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0) return { leading: "", accent: "Menu", glue: true };
  if (parts.length === 1) return { leading: "", accent: parts[0]!, glue: true };
  return {
    leading: parts.slice(0, -1).join(" "),
    accent: parts[parts.length - 1]!,
    glue: false,
  };
}

/**
 * Brand page anchors for the first published chapters. Later chapters use the
 * published section id so footer links keep a landing spot without naming products.
 */
export function publishedMenuSectionDomId(index: number, chapterId: string): string {
  if (index === 0) return "bar";
  if (index === 1) return "plates";
  if (index === 2) return "sweet";
  return `published-menu-${chapterId}`;
}

export function publishedMenuChapters(
  menu: CustomerMenuProjection,
): readonly PublishedMenuChapter[] {
  const sections = [...menu.sections].sort(compareSections);
  const byId = new Map(sections.map((section) => [section.id, section]));

  function rootId(sectionId: string): string | null {
    let current = byId.get(sectionId);
    if (!current) return null;
    const seen = new Set<string>();
    while (current.parentSectionId && byId.has(current.parentSectionId)) {
      if (seen.has(current.id)) return current.id;
      seen.add(current.id);
      const parent = byId.get(current.parentSectionId);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }

  const roots = sections.filter((section) => rootId(section.id) === section.id);
  const itemsBySection = new Map<string, CustomerMenuItem[]>();
  const unmatched: CustomerMenuItem[] = [];
  for (const item of menu.items) {
    if (rootId(item.sectionId) === null) {
      unmatched.push(item);
      continue;
    }
    const list = itemsBySection.get(item.sectionId) ?? [];
    list.push(item);
    itemsBySection.set(item.sectionId, list);
  }

  const tabsByRoot = new Map<string, PublishedMenuTab[]>();
  for (const root of roots) tabsByRoot.set(root.id, []);
  for (const section of sections) {
    const owner = rootId(section.id);
    if (!owner) continue;
    const cards = (itemsBySection.get(section.id) ?? []).map(toCard);
    if (cards.length === 0) continue;
    tabsByRoot.get(owner)?.push({ id: section.id, name: section.name, cards });
  }

  const chapters: PublishedMenuChapter[] = [];
  for (const root of roots) {
    const tabs = tabsByRoot.get(root.id) ?? [];
    if (tabs.length === 0) continue;
    chapters.push({ id: root.id, name: root.name, tabs });
  }

  if (unmatched.length > 0) {
    const label = menu.name.trim() || "Menu";
    chapters.push({
      id: menu.menuId,
      name: label,
      tabs: [{ id: menu.menuId, name: label, cards: unmatched.map(toCard) }],
    });
  }

  return chapters;
}
