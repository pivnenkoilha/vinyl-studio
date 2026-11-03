"use strict";

(() => {
  const root = document.documentElement;
  const menuButton = document.querySelector(".site-header__menu");
  const navigation = document.querySelector(".site-header__nav");
  const mobileQuery = window.matchMedia("(max-width: 700px)");

  root.classList.add("page--enhanced");

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
    const activateTab = (index, focus = false) => {
      tabs.forEach((tab, current) => {
        const active = current === index;
        tab.setAttribute("aria-selected", String(active));
        tab.tabIndex = active ? 0 : -1;
        tab.classList.toggle("service-tabs__tab--active", active);
        panels[current].hidden = !active;
      });
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
    activateTab(0);
  }
})();
