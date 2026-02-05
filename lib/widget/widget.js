(function () {
  "use strict";

  // Widget configuration
  //   const WIDGET_CONFIG = {
  //     baseUrl: window.location.origin,
  //     agentId: null,
  //     customization: {
  //       primaryColor: "#1e40ff",
  //       name: "Chat Assistant",
  //       botIcon:
  //         "https://firebasestorage.googleapis.com/v0/b/algotify-972f2.firebasestorage.app/o/face-avatar-2%2Favatar-1.png?alt=media&token=...",
  //     },
  //   };

  // Widget state
  let isOpen = false;
  let widgetContainer = null;
  let chatModal = null;
  let chatIframe = null;
  let starterBubble = null;
  let pendingStarterMessage = null;
  let chatReady = false;
  let starterBubbleTimeoutId = null;
  let isStarterBubbleDismissed = false;
  const starterBubbleSessionKey = "magicalcx_starter_bubble_shown";

  function hasShownStarterBubble() {
    try {
      return sessionStorage.getItem(starterBubbleSessionKey) === "1";
    } catch (error) {
      return false;
    }
  }

  function setStarterBubbleShown() {
    try {
      sessionStorage.setItem(starterBubbleSessionKey, "1");
    } catch (error) {}
  }

  // Extract configuration from script tag
  function getWidgetConfig() {
    // Use injected config if available (when served via API)
    if (window.MAGICALCX_AGENT_CONFIG) {
      console.log(
        "MagicalCX Widget: Using injected config",
        window.MAGICALCX_AGENT_CONFIG
      );
      return window.MAGICALCX_AGENT_CONFIG;
    }

    // If no injected config, return default (this shouldn't happen in production)
    console.warn("MagicalCX Widget: No configuration found, using defaults");
    console.warn(
      "Available window properties:",
      Object.keys(window).filter((k) => k.includes("MAGICALCX"))
    );
    // return WIDGET_CONFIG;
  }

  // Create widget styles
  function createStyles() {
    if (document.getElementById("magicalcx-widget-styles")) return;

    const config = getWidgetConfig();
    const styles = document.createElement("style");
    styles.id = "magicalcx-widget-styles";
    styles.textContent = `
      /* Widget Button */
      .magicalcx-widget-button {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: ${config.customization.primaryColor};
        border: none;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 9999;
        isolation: isolate;
        --magicalcx-glow-color: ${config.customization.primaryColor};
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        transition: all 0.3s ease;
        user-select: none;
        overflow: visible;
      }

      .magicalcx-widget-button img {
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .magicalcx-widget-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      }

      .magicalcx-widget-button.open {
        background: #6b7280;
        transform: rotate(45deg);
      }

      .magicalcx-widget-button.open img {
        display: none;
      }

      .magicalcx-widget-button.open::before {
        content: '✕';
        font-size: 20px;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .magicalcx-widget-button.glow {
        animation: magicalcx-glow 2.6s ease-out 1;
      }

      @keyframes magicalcx-glow {
        0% {
        transform: scale(1.4);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
            0 0 0 0
              color-mix(in srgb, var(--magicalcx-glow-color) 55%, transparent);
        }
        10% {
          transform: scale(1);
        }
        55% {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
            0 0 0 14px
              color-mix(in srgb, var(--magicalcx-glow-color) 0%, transparent);
        }
        100% {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2),
            0 0 0 18px
              color-mix(in srgb, var(--magicalcx-glow-color) 0%, transparent);
        }
      }

      .magicalcx-widget-bubble {
        position: fixed;
        bottom: 86px;
        right: 20px;
        max-width: 280px;
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        justify-content: flex-end;
        z-index: 9999;
        opacity: 0;
        transform: translateY(6px);
        pointer-events: none;
        transition: all 0.2s ease;
      }

      .magicalcx-widget-bubble.open {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
      }

      .magicalcx-widget-bubble button {
        appearance: none;
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: white;
        color: rgba(15, 23, 42, 0.9);
        padding: 8px 12px;
        font-size: 13px;
        line-height: 1.2;
        border-radius: 999px;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap;
      }

      .magicalcx-widget-bubble button:hover {
        background: ${config.customization.primaryColor};
        color: white;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
      }

      .magicalcx-widget-bubble button:active {
        transform: scale(0.97);
      }

      .magicalcx-widget-bubble .magicalcx-widget-bubble-close {
        position: absolute;
        top: -10px;
        right: -2px;
        width: 22px;
        height: 22px;
        padding: 0;
        border-radius: 999px;
        border: 1px solid rgba(15, 23, 42, 0.12);
        background: white;
        color: rgba(15, 23, 42, 0.7);
        font-size: 14px;
        line-height: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.08);
        opacity: 1;
        pointer-events: auto;
        transition: all 0.15s ease;
      }

      .magicalcx-widget-bubble .magicalcx-widget-bubble-close:hover {
        background: #f3f4f6;
        color: rgba(15, 23, 42, 0.9);
        box-shadow: 0 6px 16px rgba(15, 23, 42, 0.12);
      }

      /* Widget Modal */
      .magicalcx-widget-modal {
        position: fixed;
        bottom: 80px;
        right: 20px;
        width: 400px;
        height: 85vh;
        max-height: 824px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
        z-index: 9998;
        overflow: hidden;
        transition: all 0.3s ease;
        transform: scale(0.8) translateY(20px);
        opacity: 0;
        pointer-events: none;
      }

      .magicalcx-widget-modal.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      .magicalcx-widget-modal iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      }

      /* Tablet/iPad responsiveness (768px - 1024px) */
      @media (max-width: 1024px) and (min-width: 768px) {
        .magicalcx-widget-modal {
          width: 90%;
          max-width: 500px;
          height: 80vh;
          max-height: 700px;
          top: calc(10vh + env(safe-area-inset-top, 0px));
          bottom: auto;
          right: 5%;
        }

        .magicalcx-widget-button {
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          font-size: 26px;
        }
      }

      /* Mobile responsiveness - full screen takeover (≤767px) */
      @media (max-width: 767px) {
        .magicalcx-widget-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          height: -webkit-fill-available;
          max-height: 100vh;
          max-height: 100dvh;
          max-height: -webkit-fill-available;
          border-radius: 0;
          transform: translateY(100%);
        }

        .magicalcx-widget-modal.open {
          transform: translateY(0);
        }

        .magicalcx-widget-modal iframe {
          height: 100vh;
          height: 100dvh;
          height: -webkit-fill-available;
          border-radius: 0;
        }

        .magicalcx-widget-button {
          bottom: 18px;
          right: 18px;
          width: 55px;
          height: 55px;
        }

        .magicalcx-widget-button.open {
          display: none;
        }

        .magicalcx-widget-bubble {
          bottom: 86px;
          right: 18px;
          max-width: 240px;
        }

        .magicalcx-widget-bubble button {
          font-size: 16px;
        }
      }

      /* Portrait orientation adjustments for tablets only (768px+) */
      @media (max-width: 1024px) and (min-width: 768px) and (orientation: portrait) {
        .magicalcx-widget-modal {
          height: 70vh;
          max-height: 600px;
          top: calc(15vh + env(safe-area-inset-top, 0px));
        }
      }

      /* Landscape orientation adjustments for tablets */
      @media (max-width: 1024px) and (min-width: 768px) and (orientation: landscape) {
        .magicalcx-widget-modal {
          width: 85%;
          max-width: 480px;
          height: 85vh;
          max-height: 550px;
          top: calc(7vh + env(safe-area-inset-top, 0px));
        }
      }

    `;
    document.head.appendChild(styles);
  }

  // Create widget button
  function createWidgetButton() {
    const config = getWidgetConfig();
    const button = document.createElement("button");
    button.className = "magicalcx-widget-button";
    button.classList.add("glow");



    // Check if botIcon is a URL or emoji/text
    const botIcon = config.customization.botIcon;
    console.log("MagicalCX Widget: Bot icon value:", botIcon);
    console.log("MagicalCX Widget: Bot icon type:", typeof botIcon);
    console.log(
      "MagicalCX Widget: Bot icon starts with http:",
      botIcon && botIcon.startsWith("http")
    );

    if (
      botIcon &&
      (botIcon.startsWith("http") ||
        botIcon.startsWith("data:") ||
        botIcon.startsWith("/"))
    ) {
      // It's an image URL
      console.log("MagicalCX Widget: Creating image element for bot icon");
      const img = document.createElement("img");
      img.src = botIcon;
      img.alt = "Chat bot icon";
      // img.style.width = "42px";
      // img.style.height = "42px";
      // img.style.borderRadius = "4px";
      img.style.width = "100%";
      img.style.height = "100%";
      img.style.borderRadius = "50%";
      img.style.objectFit = "cover";

      // Fallback if image fails to load
      img.onerror = function () {
        console.error("MagicalCX Widget: Image failed to load:", botIcon);
        button.innerHTML = "💬";
      };

      img.onload = function () {
        console.log("MagicalCX Widget: Image loaded successfully:", botIcon);
      };

      // Clear any existing content before adding image
      button.innerHTML = "";
      button.appendChild(img);
    } else {
      // It's an emoji or text
      console.log(
        "MagicalCX Widget: Using text/emoji for bot icon:",
        botIcon
      );
      button.innerHTML = botIcon || "💬";
    }

    button.setAttribute("aria-label", `Open ${config.customization.name} chat`);
    button.setAttribute("title", `Chat with ${config.customization.name}`);

    button.addEventListener("click", toggleWidget);
    button.addEventListener("animationend", function (event) {
      if (event.animationName === "magicalcx-glow") {
        button.classList.remove("glow");
      }
    });

    return button;
  }

  function createStarterBubble() {
    const config = getWidgetConfig();
    const starterMessages = config?.customization?.starterMessages || [];
    const starterMessagesEnabled =
      config?.customization?.starterMessagesEnabled !== false;
    if (
      !starterMessagesEnabled ||
      !starterMessages.length ||
      hasShownStarterBubble()
    )
      return null;
    const bubble = document.createElement("div");
    bubble.className = "magicalcx-widget-bubble";
    bubble.setAttribute("role", "group");
    bubble.setAttribute("aria-label", "Quick message suggestions");
    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "magicalcx-widget-bubble-close";
    closeButton.setAttribute("aria-label", "Hide quick suggestions");
    closeButton.textContent = "×";
    closeButton.addEventListener("click", function () {
      isStarterBubbleDismissed = true;
      clearStarterBubbleTimeout();
      hideStarterBubble();
    });
    bubble.appendChild(closeButton);
    starterMessages.slice(0, 3).forEach((message) => {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = message;
      chip.setAttribute("aria-label", `Send message: ${message}`);
      chip.addEventListener("click", function () {
        if (!message?.trim()) return;
        hideStarterBubble();
        openWidget();
        sendStarterMessage(message);
      });
      bubble.appendChild(chip);
    });
    return bubble;
  }

  function showStarterBubble() {
    if (!starterBubble || isOpen || isStarterBubbleDismissed) return;
    setStarterBubbleShown();
    starterBubble.classList.add("open");
  }

  function hideStarterBubble() {
    if (!starterBubble) return;
    starterBubble.classList.remove("open");
  }

  function clearStarterBubbleTimeout() {
    if (!starterBubbleTimeoutId) return;
    window.clearTimeout(starterBubbleTimeoutId);
    starterBubbleTimeoutId = null;
  }

  // Create chat modal
  function createChatModal() {
    const config = getWidgetConfig();
    const modal = document.createElement("div");
    modal.className = "magicalcx-widget-modal";

    return modal;
  }

  // Create chat iframe
  function createChatIframe() {
    const config = getWidgetConfig();
    if (!config.agentId) {
      console.error("MagicalCX Widget: No agent ID provided");
      return null;
    }

    const iframe = document.createElement("iframe");
    const fromPage = encodeURIComponent(window.location.href);
    iframe.src = `${config.baseUrl}/chat/${config.agentId}?widget=true&fromPage=${fromPage}`;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("allow", "microphone; camera; clipboard-write");
    iframe.setAttribute("title", `${config.customization.name} Chat`);

    // Handle iframe load
    iframe.addEventListener("load", function () {
      console.log("MagicalCX Widget: Chat iframe loaded");
    });

    return iframe;
  }

  // Toggle widget visibility
  function toggleWidget() {
    if (!isOpen) {
      openWidget();
    } else {
      closeWidget();
    }
  }

  // Open widget
  function openWidget() {
    if (isOpen) return;

    isOpen = true;
    widgetContainer.classList.add("open");
    chatModal.classList.add("open");
    hideStarterBubble();
    clearStarterBubbleTimeout();

    // Create iframe if not exists
    if (!chatIframe) {
      chatIframe = createChatIframe();
      if (chatIframe) {
        chatModal.appendChild(chatIframe);
      }
    }

    // Prevent body scroll on mobile
    if (window.innerWidth <= 480) {
      document.body.style.overflow = "hidden";
    }
  }

  // Close widget
  function closeWidget() {
    if (!isOpen) return;

    isOpen = false;
    widgetContainer.classList.remove("open");
    chatModal.classList.remove("open");

    // Restore body scroll
    document.body.style.overflow = "";
  }

  // Handle escape key
  function handleKeyDown(event) {
    if (event.key === "Escape" && isOpen) {
      closeWidget();
    }
  }

  // Handle clicks outside modal
  function handleClickOutside(event) {
    if (
      isOpen &&
      chatModal &&
      !chatModal.contains(event.target) &&
      !widgetContainer.contains(event.target) &&
      (!starterBubble || !starterBubble.contains(event.target))
    ) {
      closeWidget();
    }
  }

  function sendStarterMessage(message) {
    if (!message?.trim()) return;
    pendingStarterMessage = message;
    if (!chatReady || !chatIframe?.contentWindow) return;
    chatIframe.contentWindow.postMessage(
      { type: "MAGICALCX_WIDGET_STARTER", text: message },
      "*"
    );
    pendingStarterMessage = null;
  }

  // Handle messages from iframe
  function handleMessage(event) {
    if (event.data.type === "MAGICALCX_WIDGET_CLOSE") {
      closeWidget();
    } else if (event.data.type === "MAGICALCX_WIDGET_READY") {
      console.log("MagicalCX Widget chat interface ready");
      chatReady = true;
      if (pendingStarterMessage) {
        sendStarterMessage(pendingStarterMessage);
      }
    }
  }

  // Initialize widget
  function initWidget() {
    const config = getWidgetConfig();
    console.log("Magical CX Widget: Full config object:", config);

    if (!config.agentId) {
      console.error("Magical CX Widget: Missing required agent ID");
      console.error("Config object:", config);
      return;
    }

    console.log("Magical CX Widget: Bot icon URL:", config.customization.botIcon);
    console.log(
      "Magical CX Widget: Primary color:",
      config.customization.primaryColor
    );

    // Create styles
    createStyles();

    // Create widget elements
    widgetContainer = createWidgetButton();
    chatModal = createChatModal();
    starterBubble = createStarterBubble();

    // Add to DOM
    document.body.appendChild(widgetContainer);
    document.body.appendChild(chatModal);
    if (starterBubble) {
      document.body.appendChild(starterBubble);
      starterBubbleTimeoutId = window.setTimeout(showStarterBubble, 4000);
    }

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("message", handleMessage);

    console.log("Magical CX Widget initialized for agent:", config.agentId);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }

  // Expose global API
  window.MagicalCXWidget = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    isOpen: function () {
      return isOpen;
    },
  };
})();
