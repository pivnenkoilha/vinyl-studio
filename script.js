"use strict";

(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector(".site-header__menu");
  const navigation = document.querySelector(".site-header__nav");
  const mobileQuery = window.matchMedia("(max-width: 700px)");
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeAnimations = new Set();
  let tabAnimations = [];

  const playMotion = (element, frames, options) => {
    if (!element || motionQuery.matches || typeof element.animate !== "function") return null;
    const animation = element.animate(frames, options);
    activeAnimations.add(animation);
    const release = () => activeAnimations.delete(animation);
    animation.finished.then(release, release);
    return animation;
  };

  root.classList.add("page--enhanced");
  root.classList.toggle("page--motion", !motionQuery.matches);

  if (menuButton && navigation) {
    menuButton.hidden = false;

    const setMenu = (open, returnFocus = false) => {
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      menuButton.classList.toggle("site-header__menu--open", open);
      navigation.classList.toggle("site-header__nav--open", open);
      if (returnFocus) menuButton.focus({ preventScroll: true });
    };

    menuButton.addEventListener("click", () => {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });

    navigation.addEventListener("click", (event) => {
      if (event.target.closest("a")) setMenu(false);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        setMenu(false, true);
      }
    });

    document.addEventListener("click", (event) => {
      if (!event.target.closest(".site-header")) setMenu(false);
    });

    const resetMenuOnResize = () => {
      setMenu(false);
      menuButton.hidden = !mobileQuery.matches;
    };

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", resetMenuOnResize);
    } else {
      mobileQuery.addListener(resetMenuOnResize);
    }

    resetMenuOnResize();
  }

  const tablist = document.querySelector(".service-tabs__list");
  const tabs = Array.from(document.querySelectorAll(".service-tabs__tab"));
  const panels = tabs.map((tab) => document.getElementById(tab.getAttribute("aria-controls")));

  if (tablist && tabs.length && panels.every(Boolean)) {
    let currentIndex = -1;
    const activateTab = (index, focus = false, animate = true) => {
      if (currentIndex === index) {
        if (focus) tabs[index].focus({ preventScroll: true });
        return;
      }
      tabAnimations.forEach((animation) => animation.cancel());
      tabAnimations = [];
      tabs.forEach((tab, current) => {
        const active = current === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle("service-tabs__tab--active", active);
        panels[current].hidden = !active;
      });
      currentIndex = index;
      if (animate) {
        const panel = panels[index];
        tabAnimations = [
          playMotion(panel.querySelector(".service-panel__image"), [
            { opacity: 0.65, transform: "scale(1.035)" },
            { opacity: 1, transform: "scale(1)" }
          ], { duration: 520, easing: "cubic-bezier(.2,.7,.2,1)" }),
          playMotion(panel.querySelector(".service-panel__content"), [
            { opacity: 0, transform: "translateY(12px)" },
            { opacity: 1, transform: "translateY(0)" }
          ], { duration: 360, easing: "cubic-bezier(.2,.7,.2,1)" })
        ].filter(Boolean);
      }
      if (focus) tabs[index].focus({ preventScroll: true });
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activateTab(index));
      tab.addEventListener("keydown", (event) => {
        let next;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        if (event.key === "Home") next = 0;
        if (event.key === "End") next = tabs.length - 1;
        if (next === undefined) return;
        event.preventDefault();
        activateTab(next, true);
      });
    });
    activateTab(0, false, false);
  }

  const header = document.querySelector(".site-header");
  let scrollFramePending = false;
  const updateHeader = () => {
    scrollFramePending = false;
    if (!header) return;
    const distance = root.scrollHeight - window.innerHeight;
    const progress = distance > 0 ? window.scrollY / distance : 0;
    header.classList.toggle("site-header--scrolled", window.scrollY > 24);
    header.style.setProperty("--scroll-progress", String(Math.max(0, Math.min(1, progress))));
  };
  const requestHeaderUpdate = () => {
    if (scrollFramePending) return;
    scrollFramePending = true;
    window.requestAnimationFrame(updateHeader);
  };
  window.addEventListener("scroll", requestHeaderUpdate, { passive: true });
  window.addEventListener("resize", requestHeaderUpdate, { passive: true });
  updateHeader();

  let revealObserver = null;
  const revealTargets = document.querySelectorAll([
    ".section-heading", ".service-tabs__list", ".approach__visual",
    ".approach__content", ".review-card", ".reviews__footer",
    ".contact-band__inner", ".faq__intro", ".faq__list",
    ".contacts__content", ".location-card"
  ].join(","));

  if (!motionQuery.matches && "IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        element.classList.add("motion-reveal--visible");
        revealObserver.unobserve(element);
        const siblings = element.parentElement.classList.contains("reviews__grid")
          ? Array.from(element.parentElement.children) : [];
        const delay = Math.max(0, siblings.indexOf(element)) * 65;
        playMotion(element, [
          { opacity: 0, transform: "translateY(22px)" },
          { opacity: 1, transform: "translateY(0)" }
        ], { duration: 650, delay, easing: "cubic-bezier(.2,.7,.2,1)", fill: "backwards" });
      });
    }, { threshold: 0.06, rootMargin: "0px 0px 28px 0px" });

    revealTargets.forEach((element) => {
      element.classList.add("motion-reveal");
      revealObserver.observe(element);
    });
  }

  document.querySelectorAll(".faq-item").forEach((item) => {
    item.addEventListener("toggle", () => {
      requestHeaderUpdate();
      if (!item.open) return;
      playMotion(item.querySelector(".faq-item__answer"), [
        { opacity: 0, transform: "translateY(-5px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 260, easing: "ease-out" });
    });
  });

  const syncMotionPreference = () => {
    root.classList.toggle("page--motion", !motionQuery.matches);
    if (!motionQuery.matches) return;
    if (revealObserver) revealObserver.disconnect();
    activeAnimations.forEach((animation) => animation.cancel());
    activeAnimations.clear();
  };
  if (typeof motionQuery.addEventListener === "function") {
    motionQuery.addEventListener("change", syncMotionPreference);
  } else {
    motionQuery.addListener(syncMotionPreference);
  }
})();
