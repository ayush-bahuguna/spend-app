import { useEffect } from "react";

/**
 * iOS Safari's `100dvh` can be miscalculated at first paint (before the
 * address-bar chrome settles) and doesn't reliably recompute when the
 * on-screen keyboard opens/closes, leaving the whole layout column short
 * until something else forces a reflow. Driving the height from JS via
 * `visualViewport`/`resize` events (which Safari does fire on those exact
 * triggers) keeps it accurate without depending on a user scroll to fix it.
 */
export function useAppHeight() {
  useEffect(() => {
    function setHeight() {
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
    }

    setHeight();
    window.addEventListener("resize", setHeight);
    window.visualViewport?.addEventListener("resize", setHeight);
    return () => {
      window.removeEventListener("resize", setHeight);
      window.visualViewport?.removeEventListener("resize", setHeight);
    };
  }, []);
}
