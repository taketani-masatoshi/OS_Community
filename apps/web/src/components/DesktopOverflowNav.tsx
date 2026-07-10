"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { NavItem } from "@/components/SiteNav";

type Props = {
  items: NavItem[];
  moreLabel: string;
};

const NAV_GAP_PX = 20;
const MORE_BUTTON_WIDTH_PX = 34;

function countVisibleItems(widths: number[], available: number): number {
  if (widths.length === 0) return 0;

  const rowWidth = (count: number, includeMore: boolean) => {
    let used = 0;
    for (let i = 0; i < count; i++) {
      used += widths[i] + (i > 0 ? NAV_GAP_PX : 0);
    }
    if (includeMore) {
      used += (count > 0 ? NAV_GAP_PX : 0) + MORE_BUTTON_WIDTH_PX;
    }
    return used;
  };

  if (rowWidth(widths.length, false) <= available) {
    return widths.length;
  }

  for (let count = widths.length - 1; count >= 1; count--) {
    if (rowWidth(count, true) <= available) {
      return count;
    }
  }

  return 1;
}

export function DesktopOverflowNav({ items, moreLabel }: Props) {
  const containerRef = useRef<HTMLElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(items.length);
  const [moreOpen, setMoreOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null);

  const itemsKey = items.map((item) => `${item.href}\0${item.label}`).join("\n");

  const recalc = useCallback(() => {
    const container = containerRef.current;
    const measure = measureRef.current;
    if (!container || !measure) return;

    const links = measure.querySelectorAll<HTMLElement>("[data-nav-measure]");
    if (links.length === 0) return;

    const widths = Array.from(links, (el) => el.offsetWidth);
    const next = countVisibleItems(widths, container.clientWidth);

    setVisibleCount((prev) => (prev === next ? prev : next));
  }, []);

  useLayoutEffect(() => {
    recalc();
  }, [recalc, itemsKey]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let frame = 0;
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(recalc);
    });
    ro.observe(container);
    return () => {
      cancelAnimationFrame(frame);
      ro.disconnect();
    };
  }, [recalc]);

  useEffect(() => {
    setMoreOpen(false);
  }, [visibleCount, itemsKey]);

  const updateMenuPosition = useCallback(() => {
    const trigger = moreRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const menuWidth = menuRef.current?.offsetWidth ?? 176;
    const left = Math.max(8, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 8));
    setMenuPosition({ top: rect.bottom + 6, left });
  }, []);

  useLayoutEffect(() => {
    if (!moreOpen) {
      setMenuPosition(null);
      return;
    }
    updateMenuPosition();
  }, [moreOpen, updateMenuPosition, visibleCount]);

  useEffect(() => {
    if (!moreOpen) return;

    function onPointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (moreRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setMoreOpen(false);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMoreOpen(false);
      }
    }

    function onLayoutChange() {
      updateMenuPosition();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onLayoutChange);
    window.addEventListener("scroll", onLayoutChange, true);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onLayoutChange);
      window.removeEventListener("scroll", onLayoutChange, true);
    };
  }, [moreOpen, updateMenuPosition]);

  const visible = items.slice(0, visibleCount);
  const overflow = items.slice(visibleCount);

  return (
    <>
      <div ref={measureRef} className="site-nav-measure" aria-hidden="true">
        {items.map((item) => (
          <span key={item.href} data-nav-measure>
            {item.label}
          </span>
        ))}
      </div>

      <nav ref={containerRef} className="site-nav site-nav-desktop site-nav-overflow" aria-label="Main">
        {visible.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}

        {overflow.length > 0 && (
          <div className="site-nav-more" ref={moreRef}>
            <button
              type="button"
              className="site-nav-more-trigger"
              aria-expanded={moreOpen}
              aria-haspopup="menu"
              aria-label={moreLabel}
              title={moreLabel}
              onClick={() => setMoreOpen((open) => !open)}
            >
              <span className="site-nav-more-icon" aria-hidden="true">
                ···
              </span>
            </button>
          </div>
        )}
      </nav>

      {moreOpen && overflow.length > 0 && menuPosition && (
        <div
          ref={menuRef}
          className="site-nav-more-menu site-nav-more-menu-fixed"
          role="menu"
          style={{ top: menuPosition.top, left: menuPosition.left }}
        >
          {overflow.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              role="menuitem"
              onClick={() => setMoreOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
