(function () {
  const SELECTOR_ROOT = "[data-cci-nice-menu-hook]";
  const SELECTOR_TOGGLE = "[data-submenu-toggle]";
  const OPEN_DELAY = 130;
  const CLOSE_DELAY = 340;
  const DEFAULT_MOBILE_BREAKPOINT = 768;
  const TABLET_MAX_WIDTH = 1199;
  const DROPDOWN_VIEWPORT_GAP = 16;
  const CONTENT_TYPES = [
    "cci-nice-menu-type-product-tile",
    "cci-nice-menu-type-banner",
    "cci-nice-menu-type-video",
    "cci-nice-menu-type-image",
    "cci-nice-menu-type-html",
    "cci-nice-menu-type-rich-text",
    "cci-nice-menu-type-text",
    "cci-nice-menu-type-hook",
  ];

  const getMobileBreakpoint = (menu) => {
    const breakpoint = Number.parseInt(menu && menu.getAttribute("data-mobile-breakpoint"), 10);
    return Number.isFinite(breakpoint) && breakpoint > 0 ? breakpoint : DEFAULT_MOBILE_BREAKPOINT;
  };
  const isDesktop = (menu) => window.matchMedia(`(min-width: ${getMobileBreakpoint(menu) + 1}px)`).matches;
  const isMobile = (menu) => !isDesktop(menu);
  const getOpenMode = (menu) => menu && menu.getAttribute("data-open-on") === "hover" ? "hover" : "click";
  const getViewportMode = (menu) => {
    if (!menu) {
      return "desktop";
    }

    if (window.innerWidth <= getMobileBreakpoint(menu)) {
      return "mobile";
    }

    return window.innerWidth <= TABLET_MAX_WIDTH ? "tablet" : "desktop";
  };
  const syncViewportClasses = (menu) => {
    if (!menu) {
      return;
    }

    const mode = getViewportMode(menu);
    menu.classList.toggle("cci-nice-menu-viewport-mobile", mode === "mobile");
    menu.classList.toggle("cci-nice-menu-viewport-tablet", mode === "tablet");
    menu.classList.toggle("cci-nice-menu-viewport-desktop", mode === "desktop");
  };

  const directChild = (element, className) => {
    if (!element) {
      return null;
    }

    return Array.from(element.children).find((child) => child.classList && child.classList.contains(className)) || null;
  };

  const directRow = (item) => directChild(item, "cci-nice-menu-row");
  const directSubmenu = (item) => directChild(item, "cci-nice-menu-submenu");
  const directToggle = (item) => {
    const row = directRow(item);
    return row ? row.querySelector(SELECTOR_TOGGLE) : null;
  };
  const findControllerList = (controller) => {
    if (!controller) {
      return null;
    }

    return controller.querySelector(":scope > .cci-nice-menu-list > .cci-nice-menu-structure-block > .cci-nice-menu-list")
      || controller.querySelector(":scope > .cci-nice-menu-list > .cci-nice-menu-showcase-tabs-block > .cci-nice-menu-list")
      || controller.querySelector(":scope > .cci-nice-menu-list");
  };

  const isContentItem = (item) => CONTENT_TYPES.some((className) => item.classList.contains(className));
  const isControllerItem = (item) => item.classList
    && item.classList.contains("cci-nice-menu-item")
    && !isContentItem(item)
    && !!directSubmenu(item);
  const isPersistentControllerItem = (item) => item.classList
    && item.classList.contains("cci-nice-menu-controller-item")
    && !!item.closest(".cci-nice-menu-role-tabs, .cci-nice-menu-role-rail");
  const isLiveCategoryTreeItem = (item) => !!(item
    && item.classList
    && item.classList.contains("cci-nice-menu-item")
    && item.closest(".cci-nice-menu-live-category-tree"));
  const isLiveCategoryNode = (item) => !!(item
    && item.classList
    && (item.classList.contains("cci-nice-menu-type-category")
      || item.classList.contains("cci-nice-menu-type-category-tree")));
  const isLiveCategoryRootCardItem = (item) => {
    const tree = item && item.closest ? item.closest(".cci-nice-menu-live-category-tree") : null;
    const rootSubmenu = tree ? directSubmenu(tree) : null;
    const rootList = rootSubmenu ? directChild(rootSubmenu, "cci-nice-menu-list") : null;

    return !!(item && rootList && item.parentElement === rootList);
  };
  const isVisible = (element) => !!(element && (element.offsetWidth || element.offsetHeight || element.getClientRects().length));
  const findMenuRoot = (scope) => {
    if (!scope) {
      return null;
    }
    if (scope.matches && scope.matches(".cci-nice-menu-root")) {
      return scope;
    }
    if (scope.closest) {
      const closestRoot = scope.closest(".cci-nice-menu-root");
      if (closestRoot) {
        return closestRoot;
      }
    }

    return scope.querySelector ? scope.querySelector(".cci-nice-menu-root") : null;
  };
  const findController = (target) => {
    if (!target || !target.closest) {
      return null;
    }

    return target.matches && target.matches(".cci-nice-menu-role-tabs, .cci-nice-menu-role-rail")
      ? target
      : target.closest(".cci-nice-menu-role-tabs, .cci-nice-menu-role-rail");
  };
  const syncControllerHeight = (controller) => {
    if (!controller) {
      return;
    }

    const controllerList = findControllerList(controller);
    const activeItem = controllerList
      ? controllerList.querySelector(":scope > .cci-nice-menu-item.cci-nice-menu-open, :scope > .cci-nice-menu-item.cci-nice-menu-active")
      : null;
    const submenu = activeItem ? directSubmenu(activeItem) : null;

    if (!submenu || !isVisible(submenu)) {
      controller.style.removeProperty("--cci-nice-menu-active-panel-height");
      return;
    }

    const controllerListRect = controllerList.getBoundingClientRect();
    const submenuRect = submenu.getBoundingClientRect();
    const panelHeight = Math.ceil(Math.max(
      submenu.scrollHeight || 0,
      submenu.offsetHeight || 0,
      submenuRect.bottom - controllerListRect.top
    ));
    if (panelHeight > 0) {
      controller.style.setProperty("--cci-nice-menu-active-panel-height", `${panelHeight}px`);
    }
  };
  const syncControllerHeights = (scope) => {
    const controllers = new Set();
    const ownController = findController(scope);

    if (ownController) {
      controllers.add(ownController);
    }
    if (scope && scope.querySelectorAll) {
      scope.querySelectorAll(".cci-nice-menu-role-tabs, .cci-nice-menu-role-rail").forEach((controller) => controllers.add(controller));
    }

    controllers.forEach(syncControllerHeight);
  };
  const scheduleControllerHeightSync = (scope) => {
    window.requestAnimationFrame(() => syncControllerHeights(scope));
  };
  const syncTopDropdownViewport = (item) => {
    const submenu = directSubmenu(item);
    if (!submenu || !item || !item.parentElement || !item.parentElement.classList.contains("cci-nice-menu-level-0")) {
      return;
    }

    const rect = submenu.getBoundingClientRect();
    const availableHeight = Math.floor(window.innerHeight - rect.top - DROPDOWN_VIEWPORT_GAP);
    if (!Number.isFinite(availableHeight) || availableHeight <= 0) {
      submenu.style.removeProperty("--cci-nice-menu-dropdown-max-height");
      return;
    }

    submenu.style.setProperty("--cci-nice-menu-dropdown-max-height", `${Math.max(120, availableHeight)}px`);
  };
  const syncMobileMenuViewport = (menu) => {
    if (!menu) {
      return;
    }

    if (!isMobile(menu) || !menu.classList.contains("cci-nice-menu-state-open")) {
      menu.style.removeProperty("--cci-nice-menu-mobile-menu-max-height");
      return;
    }

    const level = menu.querySelector(":scope > .cci-nice-menu-list.cci-nice-menu-level-0");
    const rectSource = level || menu;
    const rect = rectSource.getBoundingClientRect();
    const viewportHeight = window.visualViewport && Number.isFinite(window.visualViewport.height)
      ? window.visualViewport.height
      : window.innerHeight;
    const availableHeight = Math.floor(viewportHeight - rect.top - DROPDOWN_VIEWPORT_GAP);
    if (!Number.isFinite(availableHeight) || availableHeight <= 0) {
      menu.style.removeProperty("--cci-nice-menu-mobile-menu-max-height");
      return;
    }

    menu.style.setProperty("--cci-nice-menu-mobile-menu-max-height", `${Math.max(180, availableHeight)}px`);
  };
  const setLiveCategoryTreeItemOpen = (item, isOpen) => {
    const submenu = directSubmenu(item);
    const toggle = directToggle(item);

    if (!submenu) {
      return;
    }

    item.classList.toggle("cci-nice-menu-open", isOpen);
    item.classList.toggle("cci-nice-menu-active", isOpen);
    submenu.classList.toggle("open", isOpen);

    if (toggle) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      toggle.setAttribute("aria-label", isOpen ? "Collapse category" : "Expand category");
      toggle.setAttribute("title", isOpen ? "Collapse category" : "Expand category");
    }

    scheduleControllerHeightSync(item);
  };
  const initLiveCategoryTrees = (root) => {
    root.querySelectorAll(".cci-nice-menu-live-category-tree").forEach((tree) => {
      const rootSubmenu = directSubmenu(tree);
      const rootList = rootSubmenu ? directChild(rootSubmenu, "cci-nice-menu-list") : null;
      if (tree.dataset.ccinmTreeInitialized === "1") {
        return;
      }

      const categoryItems = new Set([
        tree,
        ...tree.querySelectorAll(".cci-nice-menu-type-category, .cci-nice-menu-type-category-tree"),
      ]);

      categoryItems.forEach((item) => {
        if (!isLiveCategoryNode(item) || !directSubmenu(item)) {
          return;
        }

        const isRootItem = item.parentElement === rootList;
        setLiveCategoryTreeItemOpen(item, item === tree || isRootItem);
      });
      tree.dataset.ccinmTreeInitialized = "1";
    });
  };

  const findTopLevelItem = (element) => {
    let item = element.closest(".cci-nice-menu-item");
    while (item && item.parentElement && !item.parentElement.classList.contains("cci-nice-menu-level-0")) {
      item = item.parentElement.closest(".cci-nice-menu-item");
    }

    return item && item.parentElement && item.parentElement.classList.contains("cci-nice-menu-level-0") ? item : null;
  };

  const youtubeAccepted = () => Boolean(window.CookieConsent && window.CookieConsent.acceptedCategory('external') && window.CookieConsent.acceptedService('youtube', 'external'));
  const youtubeNeedsConsent = (src) => Boolean(window.cciCookieConsentConfig && /^https:\/\/www\.youtube-nocookie\.com\/embed\//.test(src));
  const refreshYoutubeConsent = () => {
    document.querySelectorAll('[data-video-consent="youtube"] .cci-nice-menu-video-consent-message').forEach(message => { message.hidden = youtubeAccepted(); });
    document.querySelectorAll('iframe[data-video-consent="youtube"]').forEach((iframe) => {
      if (!youtubeAccepted()) iframe.replaceWith(createVideoPlaceholder({ src: iframe.dataset.videoSrc, title: iframe.dataset.videoTitle, poster: iframe.dataset.videoPoster, autoplay: false, consentLabel: iframe.dataset.videoConsentLabel }));
    });
  };
  ['cc:onConsent', 'cc:onChange', 'cc:onReady'].forEach(name => window.addEventListener(name, refreshYoutubeConsent));

  const createVideoPlaceholder = ({ src, title, poster, autoplay, consentLabel }) => {
    const placeholder = document.createElement("button");
    placeholder.type = "button";
    placeholder.className = "cci-nice-menu-video-placeholder";
    placeholder.setAttribute("data-video-src", src || "");
    placeholder.setAttribute("data-video-title", title || "Video");
    placeholder.setAttribute("aria-label", title || "Play video");
    if (poster) {
      placeholder.setAttribute("data-video-poster", poster);
      const image = document.createElement("img");
      image.className = "cci-nice-menu-video-poster";
      image.src = poster;
      image.alt = "";
      image.loading = "lazy";
      placeholder.appendChild(image);
    }
    if (autoplay) {
      placeholder.setAttribute("data-video-autoplay", "1");
    }

    if (youtubeNeedsConsent(src)) placeholder.dataset.videoConsent = 'youtube';
    const play = document.createElement("span");
    play.className = "cci-nice-menu-video-play";
    play.setAttribute("aria-hidden", "true");
    placeholder.appendChild(play);

    if (youtubeNeedsConsent(src)) {
      const label = consentLabel || document.querySelector('[data-video-consent-label]')?.getAttribute('data-video-consent-label') || '';
      placeholder.dataset.videoConsentLabel = label;
      if (label) {
        const message = document.createElement('span');
        message.className = 'cci-nice-menu-video-consent-message';
        message.textContent = label;
        message.hidden = youtubeAccepted();
        placeholder.appendChild(message);
      }
    }
    bindVideoPlaceholder(placeholder);
    return placeholder;
  };

  const loadVideoPlaceholder = (placeholder, lockTopLevelItem = false) => {
    const src = placeholder.getAttribute("data-video-src") || "";
    if (!src) {
      return null;
    }

    if ((placeholder.dataset.videoConsent === 'youtube' || youtubeNeedsConsent(src)) && !youtubeAccepted()) {
      if (lockTopLevelItem && window.CookieConsent) window.CookieConsent.showPreferences();
      return null;
    }
    const iframe = document.createElement("iframe");
    if (youtubeNeedsConsent(src)) iframe.dataset.videoConsent = 'youtube';
    iframe.className = "cci-nice-menu-video-embed";
    iframe.src = src;
    iframe.title = placeholder.getAttribute("data-video-title") || placeholder.getAttribute("aria-label") || "Video";
    iframe.loading = "eager";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.dataset.videoConsentLabel = placeholder.dataset.videoConsentLabel || '';
    iframe.dataset.videoSrc = src;
    iframe.dataset.videoTitle = iframe.title;
    iframe.dataset.videoPoster = placeholder.getAttribute("data-video-poster") || "";
    if (placeholder.getAttribute("data-video-autoplay") === "1") {
      iframe.dataset.videoAutoplay = "1";
    }

    const frame = placeholder.closest(".cci-nice-menu-video-frame");
    if (frame) {
      const poster = placeholder.getAttribute("data-video-poster") || "";
      if (poster) {
        frame.style.setProperty("--cci-nice-menu-video-poster", `url("${poster.replace(/"/g, "%22")}")`);
      }
      frame.classList.add("cci-nice-menu-video-loading");
      frame.classList.remove("cci-nice-menu-video-loaded");
      const revealDelay = placeholder.getAttribute("data-video-autoplay") === "1" ? 2200 : 180;
      const revealIframe = () => {
        window.setTimeout(() => frame.classList.add("cci-nice-menu-video-loaded"), revealDelay);
      };
      iframe.addEventListener("load", revealIframe, { once: true });
      window.setTimeout(() => frame.classList.add("cci-nice-menu-video-loaded"), revealDelay + 4500);
    }
    if (lockTopLevelItem) {
      const topItem = findTopLevelItem(placeholder);
      if (topItem) {
        topItem.classList.add("cci-nice-menu-video-locked");
      }
    }

    placeholder.replaceWith(iframe);
    return iframe;
  };

  function bindVideoPlaceholder(placeholder) {
    if (!placeholder || placeholder.dataset.ccinmVideoBound === "1") {
      return;
    }

    placeholder.dataset.ccinmVideoBound = "1";
    placeholder.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      loadVideoPlaceholder(placeholder, true);
    });
  }

  const loadMapPlaceholder = (placeholder) => {
    const src = placeholder.getAttribute("data-map-src") || "";
    if (!src || placeholder.dataset.ccinmMapLoaded === "1") {
      return null;
    }

    placeholder.dataset.ccinmMapLoaded = "1";
    const iframe = document.createElement("iframe");
    iframe.className = "cci-nice-menu-map-embed";
    iframe.src = src;
    iframe.title = placeholder.getAttribute("data-map-title") || placeholder.getAttribute("aria-label") || "Map";
    iframe.loading = "lazy";
    iframe.referrerPolicy = "no-referrer-when-downgrade";
    placeholder.replaceWith(iframe);
    const controller = findController(iframe);
    if (controller) {
      scheduleControllerHeightSync(controller);
    }
    return iframe;
  };

  const shouldAutoLoadMap = (placeholder) => placeholder
    && placeholder.getAttribute("data-map-autoload") === "1";

  const bindMapPlaceholder = (placeholder) => {
    if (!placeholder || placeholder.dataset.ccinmMapBound === "1") {
      return;
    }

    placeholder.dataset.ccinmMapBound = "1";
    placeholder.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      loadMapPlaceholder(placeholder);
    });
  };

  const loadVisibleMaps = (scope) => {
    if (!scope || !isVisible(scope)) {
      return;
    }

    scope.querySelectorAll(".cci-nice-menu-map-placeholder[data-map-src]").forEach((placeholder) => {
      if (shouldAutoLoadMap(placeholder) && isVisible(placeholder)) {
        loadMapPlaceholder(placeholder);
      }
    });
  };

  const startAutoplayVideos = (scope) => {
    if (!scope || !isVisible(scope)) {
      return;
    }

    scope.querySelectorAll(".cci-nice-menu-video-placeholder[data-video-autoplay='1'][data-video-src]").forEach((placeholder) => {
      if (isVisible(placeholder)) {
        loadVideoPlaceholder(placeholder);
      }
    });

    scope.querySelectorAll("video.cci-nice-menu-video-file[data-video-autoplay='1']").forEach((video) => {
      if (!isVisible(video)) {
        return;
      }

      video.muted = true;
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    });
  };

  const stopAutoplayVideos = (scope) => {
    if (!scope) {
      return;
    }

    scope.querySelectorAll("iframe.cci-nice-menu-video-embed[data-video-autoplay='1']").forEach((iframe) => {
      const frame = iframe.closest(".cci-nice-menu-video-frame");
      if (frame) {
        frame.classList.remove("cci-nice-menu-video-loading");
        frame.classList.remove("cci-nice-menu-video-loaded");
        frame.style.removeProperty("--cci-nice-menu-video-poster");
      }
      iframe.replaceWith(createVideoPlaceholder({
        src: iframe.dataset.videoSrc || iframe.src || "",
        title: iframe.dataset.videoTitle || iframe.title || "Video",
        poster: iframe.dataset.videoPoster || "",
        autoplay: true,
      }));
    });

    scope.querySelectorAll("video.cci-nice-menu-video-file[data-video-autoplay='1']").forEach((video) => {
      video.pause();
      video.currentTime = 0;
    });
  };

  const parseCarouselOptions = (element) => {
    try {
      return JSON.parse(element.getAttribute("data-cci-nice-menu-carousel-options") || "{}");
    } catch (error) {
      return {};
    }
  };

  let owlCarouselLoadPromise = null;
  const getOwlCarouselScriptSrc = () => {
    const script = document.querySelector('script[src*="/owlcarousel/owl.carousel.min.js"]');
    if (script && script.src) {
      return script.src;
    }

    const stylesheet = document.querySelector('link[href*="/owlcarousel/assets/owl.carousel.min.css"]');
    if (stylesheet && stylesheet.href) {
      return stylesheet.href.replace("/assets/owl.carousel.min.css", "/owl.carousel.min.js");
    }

    return "";
  };

  const ensureOwlCarouselPlugin = () => {
    const $ = window.jQuery || window.$;
    if ($ && $.fn && typeof $.fn.owlCarousel === "function") {
      return Promise.resolve(true);
    }

    const src = getOwlCarouselScriptSrc();
    if (!$ || !$.fn || !src) {
      return Promise.resolve(false);
    }

    if (owlCarouselLoadPromise) {
      return owlCarouselLoadPromise;
    }

    owlCarouselLoadPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = src;
      script.async = false;
      script.onload = () => {
        const currentJquery = window.jQuery || window.$;
        resolve(Boolean(currentJquery && currentJquery.fn && currentJquery.fn.owlCarousel));
      };
      script.onerror = () => resolve(false);
      document.head.appendChild(script);
    });

    return owlCarouselLoadPromise;
  };

  const initOwlCarousels = (root) => {
    if (!root || !root.querySelectorAll) {
      return;
    }

    const tracks = Array.from(root.querySelectorAll('[data-cci-nice-menu-carousel="owl"]')).filter(isVisible);
    if (!tracks.length) {
      return;
    }

    const $ = window.jQuery || window.$;
    if (!$ || !$.fn || typeof $.fn.owlCarousel !== "function") {
      tracks.forEach((track) => {
        if (track.dataset.ccinmCarouselReady !== "owl") {
          track.dataset.ccinmCarouselReady = "pending";
          track.classList.remove("cci-nice-menu-state-carousel-fallback");
          track.classList.add("cci-nice-menu-state-carousel-pending");
        }
      });

      ensureOwlCarouselPlugin().then((loaded) => {
        if (loaded) {
          window.requestAnimationFrame(() => initOwlCarousels(root));
          return;
        }

        tracks.forEach((track) => {
          if (track.dataset.ccinmCarouselReady !== "owl") {
            track.dataset.ccinmCarouselReady = "fallback";
            track.classList.remove("cci-nice-menu-state-carousel-pending");
            track.classList.add("cci-nice-menu-state-carousel-fallback");
          }
        });
      });
      return;
    }

    tracks.forEach((track) => {

      if (track.dataset.ccinmCarouselReady === "owl") {
        $(track).trigger("refresh.owl.carousel");
        scheduleControllerHeightSync(track.closest(".cci-nice-menu-submenu, .cci-nice-menu-root") || track);
        return;
      }

      const options = Object.assign({
        navText: [
          '<span class="cci-nice-menu-carousel-arrow cci-nice-menu-carousel-arrow-prev" aria-hidden="true"></span>',
          '<span class="cci-nice-menu-carousel-arrow cci-nice-menu-carousel-arrow-next" aria-hidden="true"></span>',
        ],
      }, parseCarouselOptions(track));

      track.classList.remove("cci-nice-menu-state-carousel-fallback");
      track.classList.remove("cci-nice-menu-state-carousel-pending");
      track.classList.add("owl-carousel");
      $(track).owlCarousel(options);
      track.dataset.ccinmCarouselReady = "owl";
      track.classList.add("cci-nice-menu-state-owl-ready");
      scheduleControllerHeightSync(track.closest(".cci-nice-menu-submenu, .cci-nice-menu-root") || track);
    });
  };

  const setOpen = (item, isOpen) => {
    const submenu = directSubmenu(item);
    const toggle = directToggle(item);

    if (!submenu) {
      return;
    }

    item.classList.toggle("cci-nice-menu-open", isOpen);
    item.classList.toggle("cci-nice-menu-hover", isOpen);
    item.classList.toggle("cci-nice-menu-active", isOpen);
    submenu.classList.toggle("open", isOpen);

    if (toggle) {
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    if (isOpen) {
      window.requestAnimationFrame(() => {
        initLiveCategoryTrees(submenu);
        initOwlCarousels(submenu);
        startAutoplayVideos(submenu);
        loadVisibleMaps(submenu);
        syncTopDropdownViewport(item);
        syncControllerHeights(item);
      });
    } else {
      stopAutoplayVideos(submenu);
      submenu.style.removeProperty("--cci-nice-menu-dropdown-shift");
      submenu.style.removeProperty("--cci-nice-menu-dropdown-max-height");
      item.classList.remove("cci-nice-menu-flyout-left");
      item.classList.remove("cci-nice-menu-video-locked");
    }
  };

  const closeItem = (item) => {
    item.querySelectorAll(":scope .cci-nice-menu-item.cci-nice-menu-open").forEach((child) => {
      if (child !== item) {
        if (isLiveCategoryTreeItem(child)) {
          return;
        }
        setOpen(child, false);
      }
    });
    setOpen(item, false);
  };

  const closeDirectSiblings = (item) => {
    const list = item.parentElement;
    if (!list || !list.classList.contains("cci-nice-menu-list")) {
      return;
    }

    Array.from(list.children).forEach((sibling) => {
      if (sibling !== item && sibling.classList && sibling.classList.contains("cci-nice-menu-item")) {
        closeItem(sibling);
      }
    });
  };

  const alignTopDropdown = (item) => {
    const submenu = directSubmenu(item);
    if (!submenu || !item.parentElement || !item.parentElement.classList.contains("cci-nice-menu-level-0")) {
      return;
    }

    submenu.style.setProperty("--cci-nice-menu-dropdown-shift", "0px");

    const margin = 24;
    const rect = submenu.getBoundingClientRect();
    let shift = 0;

    if (rect.left < margin) {
      shift = margin - rect.left;
    }

    if (rect.right + shift > window.innerWidth - margin) {
      shift += (window.innerWidth - margin) - (rect.right + shift);
    }

    submenu.style.setProperty("--cci-nice-menu-dropdown-shift", Math.round(shift) + "px");
    syncTopDropdownViewport(item);
  };

  const alignFlyout = (item) => {
    const submenu = directSubmenu(item);
    if (!submenu || !submenu.classList.contains("cci-nice-menu-submenu-nested")) {
      return;
    }

    item.classList.remove("cci-nice-menu-flyout-left");

    const margin = 24;
    const rect = submenu.getBoundingClientRect();
    if (rect.right > window.innerWidth - margin) {
      item.classList.add("cci-nice-menu-flyout-left");
    }
  };

  const openItem = (item) => {
    if (!item || isContentItem(item)) {
      return;
    }

    closeDirectSiblings(item);
    setOpen(item, true);

    window.requestAnimationFrame(() => {
      alignTopDropdown(item);
      alignFlyout(item);
      openDefaultControllerPanels(item);
      syncControllerHeights(item);
    });
  };

  const markControllerItems = (root) => {
    root.querySelectorAll(".cci-nice-menu-role-tabs, .cci-nice-menu-role-rail").forEach((controller) => {
      const controllerList = findControllerList(controller);
      if (!controllerList) {
        return;
      }

      Array.from(controllerList.children).forEach((item) => {
        if (!item.classList || !item.classList.contains("cci-nice-menu-item")) {
          return;
        }

        item.classList.toggle("cci-nice-menu-controller-item", isControllerItem(item));
      });
    });
  };

  const openDefaultControllerPanels = (scope) => {
    const menu = findMenuRoot(scope);
    if (menu && isMobile(menu)) {
      syncControllerHeights(scope);
      return;
    }

    scope.querySelectorAll(".cci-nice-menu-role-tabs, .cci-nice-menu-role-rail").forEach((controller) => {
      const controllerList = findControllerList(controller);
      if (!controllerList || controllerList.querySelector(":scope > .cci-nice-menu-item.cci-nice-menu-open")) {
        return;
      }

      const firstItem = Array.from(controllerList.children).find((item) => isControllerItem(item));
      if (firstItem) {
        openItem(firstItem);
      } else {
        syncControllerHeight(controller);
      }
    });
  };

  const initSubmenus = (root) => {
    const menu = root.querySelector(".cci-nice-menu-root") || root;
    const openMode = getOpenMode(menu);
    const timers = new WeakMap();

    syncViewportClasses(menu);
    markControllerItems(root);
    initLiveCategoryTrees(root);

    const clearTimer = (item) => {
      const timer = timers.get(item);
      if (timer) {
        window.clearTimeout(timer);
        timers.delete(item);
      }
    };

    const schedule = (item, callback, delay) => {
      clearTimer(item);
      timers.set(item, window.setTimeout(() => {
        timers.delete(item);
        callback();
      }, delay));
    };

    const toggleItem = (item) => {
      if (!item || isLiveCategoryTreeItem(item)) {
        return;
      }

      if (item.classList.contains("cci-nice-menu-open")) {
        if (isPersistentControllerItem(item) && isDesktop(menu)) {
          clearTimer(item);
          return;
        }
        closeItem(item);
      } else {
        openItem(item);
      }
    };

    const shouldToggleFromRowClick = (event, row, item) => {
      if (!row || !item || !directSubmenu(item) || isContentItem(item) || isLiveCategoryTreeItem(item)) {
        return false;
      }

      if (event.target.closest(SELECTOR_TOGGLE)) {
        return false;
      }

      if (event.target.closest("button, input, textarea, select, option, label")) {
        return false;
      }

      const link = event.target.closest("a.cci-nice-menu-link[href]");
      return !(link && row.contains(link) && link.getAttribute("href") !== "#");
    };

    root.addEventListener("click", (event) => {
      const row = event.target.closest(".cci-nice-menu-live-category-tree .cci-nice-menu-item.cci-nice-menu-has-children > .cci-nice-menu-row");
      if (!row || !root.contains(row)) {
        return;
      }

      const item = row.closest(".cci-nice-menu-item");
      if (!isLiveCategoryTreeItem(item) || !isLiveCategoryNode(item) || isLiveCategoryRootCardItem(item)) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();
      setLiveCategoryTreeItemOpen(item, !item.classList.contains("cci-nice-menu-open"));
    }, true);

    root.querySelectorAll(".cci-nice-menu-item").forEach((item) => {
      const submenu = directSubmenu(item);
      if (!submenu || isContentItem(item)) {
        return;
      }
      if (isLiveCategoryTreeItem(item)) {
        return;
      }

      item.addEventListener("pointerenter", () => {
        if (!isDesktop(menu) || openMode !== "hover") {
          return;
        }
        schedule(item, () => openItem(item), OPEN_DELAY);
      });

      item.addEventListener("pointerleave", (event) => {
        if (!isDesktop(menu) || openMode !== "hover") {
          return;
        }

        if (isPersistentControllerItem(item)) {
          clearTimer(item);
          return;
        }

        if (item.classList.contains("cci-nice-menu-video-locked")) {
          return;
        }

        if (event.relatedTarget && item.contains(event.relatedTarget)) {
          return;
        }
        schedule(item, () => closeItem(item), CLOSE_DELAY);
      });

      submenu.addEventListener("pointerenter", () => {
        if (!isDesktop(menu) || openMode !== "hover") {
          return;
        }
        clearTimer(item);
        openItem(item);
      });

      submenu.addEventListener("pointerleave", (event) => {
        if (!isDesktop(menu) || openMode !== "hover") {
          return;
        }

        if (isPersistentControllerItem(item)) {
          clearTimer(item);
          return;
        }

        if (item.classList.contains("cci-nice-menu-video-locked")) {
          return;
        }

        if (event.relatedTarget && item.contains(event.relatedTarget)) {
          return;
        }
        schedule(item, () => closeItem(item), CLOSE_DELAY);
      });
    });

    root.querySelectorAll(SELECTOR_TOGGLE).forEach((toggle) => {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const item = toggle.closest(".cci-nice-menu-item");
        if (!item) {
          return;
        }

        if (isLiveCategoryTreeItem(item)) {
          return;
        }

        toggleItem(item);
      });
    });

    root.addEventListener("load", (event) => {
      const controller = findController(event.target);
      if (controller) {
        scheduleControllerHeightSync(controller);
      }
    }, true);

    menu.addEventListener("click", (event) => {
      const row = event.target.closest(".cci-nice-menu-item.cci-nice-menu-has-children > .cci-nice-menu-row");
      const rowItem = row && menu.contains(row) ? row.closest(".cci-nice-menu-item") : null;
      if (shouldToggleFromRowClick(event, row, rowItem)) {
        event.preventDefault();
        toggleItem(rowItem);
        return;
      }

      const link = event.target.closest(".cci-nice-menu-link");
      if (!link || link.getAttribute("href") !== "#") {
        return;
      }

      const item = link.closest(".cci-nice-menu-item");
      if (!item || !directSubmenu(item)) {
        return;
      }

      event.preventDefault();
      if (isLiveCategoryTreeItem(item)) {
        if (!isLiveCategoryRootCardItem(item)) {
          setLiveCategoryTreeItemOpen(item, !item.classList.contains("cci-nice-menu-open"));
        }
        return;
      }

      toggleItem(item);
    });

    document.addEventListener("click", (event) => {
      if (root.contains(event.target)) {
        return;
      }

      root.querySelectorAll(".cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-open").forEach(closeItem);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") {
        return;
      }

      root.querySelectorAll(".cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-open").forEach(closeItem);
    });

    window.addEventListener("resize", () => {
      syncViewportClasses(menu);
      syncMobileMenuViewport(menu);
      if (isMobile(menu)) {
        root.querySelectorAll(".cci-nice-menu-role-tabs .cci-nice-menu-controller-item.cci-nice-menu-open, .cci-nice-menu-role-rail .cci-nice-menu-controller-item.cci-nice-menu-open").forEach(closeItem);
      }
      root.querySelectorAll(".cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-open").forEach((item) => {
        alignTopDropdown(item);
        syncTopDropdownViewport(item);
      });
      root.querySelectorAll(".cci-nice-menu-submenu-nested.open").forEach((submenu) => alignFlyout(submenu.closest(".cci-nice-menu-item")));
      syncControllerHeights(root);
    });
    window.addEventListener("scroll", () => {
      root.querySelectorAll(".cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-open").forEach(syncTopDropdownViewport);
      syncMobileMenuViewport(menu);
    }, { passive: true });

    openDefaultControllerPanels(root);
    scheduleControllerHeightSync(root);
  };

  const initMobile = (root) => {
    const menu = root.querySelector(".cci-nice-menu-root");
    if (!menu) {
      return;
    }

    const standaloneToggle = menu.querySelector(":scope > .cci-nice-menu-mobile-toggle[data-mobile-menu-toggle]");
    const controller = !standaloneToggle
      ? menu.querySelector(".cci-nice-menu-level-0 > .cci-nice-menu-item:not(.cci-nice-menu-hidden-mobile)") || menu.querySelector(".cci-nice-menu-level-0 > .cci-nice-menu-item")
      : null;
    const controllerRow = directRow(controller);
    const mobileToggle = standaloneToggle || controllerRow;

    if (!mobileToggle) {
      return;
    }

    const controllerToggle = controller ? directToggle(controller) || controllerRow.querySelector(".cci-nice-menu-link") : null;
    if (controller && controllerRow) {
      controller.classList.add("cci-nice-menu-mobile-controller");
      controllerRow.setAttribute("data-mobile-menu-toggle", "true");
    }

    const sync = () => {
      const isOpen = menu.classList.contains("cci-nice-menu-state-open");
      if (standaloneToggle) {
        standaloneToggle.classList.toggle("cci-nice-menu-state-active", isOpen);
        standaloneToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
      if (controller) {
        controller.classList.toggle("cci-nice-menu-mobile-menu-open", isOpen);
      }
      if (controllerToggle) {
        controllerToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
      }
    };

    const setMobileMenuOpen = (isOpen) => {
      menu.classList.toggle("cci-nice-menu-state-open", isOpen);
      if (isOpen) {
        root.querySelectorAll(".cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-open").forEach(closeItem);
        syncMobileMenuViewport(menu);
      } else {
        root.querySelectorAll(".cci-nice-menu-level-0 > .cci-nice-menu-item.cci-nice-menu-open").forEach(closeItem);
        menu.style.removeProperty("--cci-nice-menu-mobile-menu-max-height");
      }
      sync();
    };

    if (standaloneToggle) {
      standaloneToggle.addEventListener("click", (event) => {
        if (!isMobile(menu)) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        setMobileMenuOpen(!menu.classList.contains("cci-nice-menu-state-open"));
      });
    } else if (controller && controllerRow) {
      controllerRow.addEventListener("click", (event) => {
        if (!isMobile(menu)) {
          return;
        }

        if (!menu.classList.contains("cci-nice-menu-state-open")) {
          event.preventDefault();
          event.stopPropagation();
          setMobileMenuOpen(true);
          return;
        }

        if (event.target.closest(SELECTOR_TOGGLE) || event.target.closest(".cci-nice-menu-link")) {
          return;
        }

        event.preventDefault();
        event.stopPropagation();
        setOpen(controller, !controller.classList.contains("cci-nice-menu-open"));
      }, true);
    }

    window.addEventListener("resize", () => {
      if (isDesktop(menu) && menu.classList.contains("cci-nice-menu-state-open")) {
        setMobileMenuOpen(false);
      } else {
        syncMobileMenuViewport(menu);
      }
    });
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", () => syncMobileMenuViewport(menu));
      window.visualViewport.addEventListener("scroll", () => syncMobileMenuViewport(menu));
    }

    sync();
  };

  const initVideos = (root) => {
    root.querySelectorAll(".cci-nice-menu-video-placeholder[data-video-src]").forEach((placeholder) => {
      bindVideoPlaceholder(placeholder);
    });
  };

  const initMaps = (root) => {
    const placeholders = Array.from(root.querySelectorAll(".cci-nice-menu-map-placeholder[data-map-src]"));
    if (!placeholders.length) {
      return;
    }

    placeholders.forEach(bindMapPlaceholder);

    const autoLoadPlaceholders = placeholders.filter(shouldAutoLoadMap);

    if (!autoLoadPlaceholders.length || !("IntersectionObserver" in window)) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting || !isVisible(entry.target)) {
          return;
        }

        observer.unobserve(entry.target);
        loadMapPlaceholder(entry.target);
      });
    }, { rootMargin: "120px" });

    autoLoadPlaceholders.forEach((placeholder) => observer.observe(placeholder));
  };

  document.querySelectorAll(SELECTOR_ROOT).forEach((root) => {
    initSubmenus(root);
    initMobile(root);
    initVideos(root);
    initMaps(root);
    initOwlCarousels(root);
  });
})();
