"use client";

import { useEffect, useState } from "react";

import { getCustomerMenu } from "@/lib/customer-commerce";
import {
  ORDERING_MENU_HREF,
  publishedMenuChapters,
  publishedMenuFooterHref,
} from "@/lib/published-menu-cards";
import { DIRECT_ORDERING_BRAND_ID } from "@/shared/customer-menu/constants";

const INITIAL_LINKS = [
  { label: "Boba drinks", href: ORDERING_MENU_HREF, disabled: false },
  { label: "K-Street", href: ORDERING_MENU_HREF, disabled: false },
  { label: "Beary sweet", href: ORDERING_MENU_HREF, disabled: false },
  { label: "Vegan / gluten", href: ORDERING_MENU_HREF, disabled: true },
] as const;

export function FooterMenuLinks(props: { listClassName: string; linkClassName: string }) {
  const [hrefs, setHrefs] = useState({
    bar: ORDERING_MENU_HREF,
    plates: ORDERING_MENU_HREF,
    sweet: ORDERING_MENU_HREF,
  });

  useEffect(() => {
    let cancelled = false;
    void getCustomerMenu({ brandId: DIRECT_ORDERING_BRAND_ID })
      .then((result) => {
        if (cancelled || !result.ok) return;
        const chapters = publishedMenuChapters(result.data.menu);
        setHrefs({
          bar: publishedMenuFooterHref(chapters, "bar"),
          plates: publishedMenuFooterHref(chapters, "plates"),
          sweet: publishedMenuFooterHref(chapters, "sweet"),
        });
      })
      .catch(() => {
        // Keep the ordering Menu destination when the published read fails.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const links = [
    { label: INITIAL_LINKS[0].label, href: hrefs.bar, disabled: false },
    { label: INITIAL_LINKS[1].label, href: hrefs.plates, disabled: false },
    { label: INITIAL_LINKS[2].label, href: hrefs.sweet, disabled: false },
    INITIAL_LINKS[3],
  ];

  return (
    <ul className={props.listClassName}>
      {links.map((link) => (
        <li key={link.label}>
          {link.disabled ? (
            <span
              role="link"
              aria-disabled="true"
              className={`${props.linkClassName} opacity-40 pointer-events-none`}
            >
              {link.label}
            </span>
          ) : (
            <a href={link.href} className={props.linkClassName}>
              {link.label}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
