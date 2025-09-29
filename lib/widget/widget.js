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

  // Extract configuration from script tag
  function getWidgetConfig() {
    // Use injected config if available (when served via API)
    if (window.SUPERCX_AGENT_CONFIG) {
      console.log(
        "Delightfulcx Widget: Using injected config",
        window.SUPERCX_AGENT_CONFIG
      );
      return window.SUPERCX_AGENT_CONFIG;
    }

    // If no injected config, return default (this shouldn't happen in production)
    console.warn("Delightfulcx Widget: No configuration found, using defaults");
    console.warn(
      "Available window properties:",
      Object.keys(window).filter((k) => k.includes("SUPERCX"))
    );
    // return WIDGET_CONFIG;
  }

  // Create widget styles
  function createStyles() {
    if (document.getElementById("supercx-widget-styles")) return;

    const config = getWidgetConfig();
    const styles = document.createElement("style");
    styles.id = "supercx-widget-styles";
    styles.textContent = `
      /* Widget Button */
      .supercx-widget-button {
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
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        transition: all 0.3s ease;
        user-select: none;
        overflow: hidden;
      }

      .supercx-widget-button img {
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .supercx-widget-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
      }

      .supercx-widget-button.open {
        background: #6b7280;
        transform: rotate(45deg);
      }

      .supercx-widget-button.open img {
        display: none;
      }

      .supercx-widget-button.open::before {
        content: '✕';
        font-size: 20px;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
      }

      /* Widget Modal */
      .supercx-widget-modal {
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

      .supercx-widget-modal.open {
        transform: scale(1) translateY(0);
        opacity: 1;
        pointer-events: auto;
      }

      .supercx-widget-modal iframe {
        width: 100%;
        height: 100%;
        border: none;
        border-radius: 12px;
      }

      /* Mobile responsiveness */
      @media (max-width: 480px) {
        .supercx-widget-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          width: 100%;
          height: 100%;
          border-radius: 0;
          transform: translateY(100%);
        }

        .supercx-widget-modal.open {
          transform: translateY(0);
        }

        .supercx-widget-button {
          bottom: 20px;
          right: 20px;
        }
      }

    `;
    document.head.appendChild(styles);
  }

  // Create widget button
  function createWidgetButton() {
    const config = getWidgetConfig();
    const button = document.createElement("button");
    button.className = "supercx-widget-button";

    // Check if botIcon is a URL or emoji/text
    const botIcon = config.customization.botIcon;
    console.log("Delightfulcx Widget: Bot icon value:", botIcon);
    console.log("Delightfulcx Widget: Bot icon type:", typeof botIcon);
    console.log(
      "Delightfulcx Widget: Bot icon starts with http:",
      botIcon && botIcon.startsWith("http")
    );

    if (
      botIcon &&
      (botIcon.startsWith("http") ||
        botIcon.startsWith("data:") ||
        botIcon.startsWith("/"))
    ) {
      // It's an image URL
      console.log("Delightfulcx Widget: Creating image element for bot icon");
      const img = document.createElement("img");
      img.src = botIcon;
      img.alt = "Chat bot icon";
      img.style.width = "42px";
      img.style.height = "42px";
      img.style.borderRadius = "4px";
      img.style.objectFit = "cover";

      // Fallback if image fails to load
      img.onerror = function () {
        console.error("Delightfulcx Widget: Image failed to load:", botIcon);
        button.innerHTML = "💬";
      };

      img.onload = function () {
        console.log("Delightfulcx Widget: Image loaded successfully:", botIcon);
      };

      // Clear any existing content before adding image
      button.innerHTML = "";
      button.appendChild(img);
    } else {
      // It's an emoji or text
      console.log(
        "Delightfulcx Widget: Using text/emoji for bot icon:",
        botIcon
      );
      button.innerHTML = botIcon || "💬";
    }

    button.setAttribute("aria-label", `Open ${config.customization.name} chat`);
    button.setAttribute("title", `Chat with ${config.customization.name}`);

    button.addEventListener("click", toggleWidget);

    return button;
  }

  // Create chat modal
  function createChatModal() {
    const config = getWidgetConfig();
    const modal = document.createElement("div");
    modal.className = "supercx-widget-modal";

    return modal;
  }

  // Create chat iframe
  function createChatIframe() {
    const config = getWidgetConfig();
    if (!config.agentId) {
      console.error("Delightfulcx Widget: No agent ID provided");
      return null;
    }

    const iframe = document.createElement("iframe");
    iframe.src = `${config.baseUrl}/chat/${config.agentId}?widget=true`;
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("allow", "microphone; camera; clipboard-write");
    iframe.setAttribute("title", `${config.customization.name} Chat`);

    // Handle iframe load
    iframe.addEventListener("load", function () {
      console.log("Delightfulcx Widget: Chat iframe loaded");
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
      !widgetContainer.contains(event.target)
    ) {
      closeWidget();
    }
  }

  // Handle messages from iframe
  function handleMessage(event) {
    if (event.data.type === "SUPERCX_WIDGET_CLOSE") {
      closeWidget();
    } else if (event.data.type === "SUPERCX_WIDGET_READY") {
      console.log("Delightfulcx Widget chat interface ready");
    }
  }

  // Initialize widget
  function initWidget() {
    const config = getWidgetConfig();
    console.log("SuperCX Widget: Full config object:", config);

    if (!config.agentId) {
      console.error("SuperCX Widget: Missing required agent ID");
      console.error("Config object:", config);
      return;
    }

    console.log("SuperCX Widget: Bot icon URL:", config.customization.botIcon);
    console.log(
      "SuperCX Widget: Primary color:",
      config.customization.primaryColor
    );

    // Create styles
    createStyles();

    // Create widget elements
    widgetContainer = createWidgetButton();
    chatModal = createChatModal();

    // Add to DOM
    document.body.appendChild(widgetContainer);
    document.body.appendChild(chatModal);

    // Add event listeners
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("click", handleClickOutside);
    window.addEventListener("message", handleMessage);

    console.log("SuperCX Widget initialized for agent:", config.agentId);
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initWidget);
  } else {
    initWidget();
  }

  // Expose global API
  window.SuperCXWidget = {
    open: openWidget,
    close: closeWidget,
    toggle: toggleWidget,
    isOpen: function () {
      return isOpen;
    },
  };
})();
