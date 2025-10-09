# MagicalCX Chat Widget Integration Guide

Easily add a chat widget to your website with just a single script tag.

## Quick Start

Add the following script tag to your website's HTML:

```html
<script src="https://your-domain.com/api/widget/YOUR_AGENT_ID" async></script>
```

Replace `YOUR_AGENT_ID` with your actual agent ID and `your-domain.com` with your MagicalCX domain.

## Automatic Configuration

The widget automatically uses your agent's configuration including:

- Primary brand color
- Chat assistant name
- Bot icon/avatar
- Greeting messages
- Knowledge base content
- Workflow settings

No additional configuration is needed - just use your agent ID in the URL!

## Advanced Usage

### JavaScript API

The widget exposes a global API for programmatic control:

```javascript
// Open the chat widget
SuperCXWidget.open();

// Close the chat widget
SuperCXWidget.close();

// Toggle the chat widget
SuperCXWidget.toggle();

// Check if widget is open
if (SuperCXWidget.isOpen()) {
  console.log("Widget is currently open");
}
```

### Custom Styling

The widget automatically inherits your agent's customization settings, but you can override styles if needed:

```css
/* Customize widget button */
.supercx-widget-button {
  bottom: 30px !important;
  right: 30px !important;
}

/* Customize modal size on desktop */
@media (min-width: 768px) {
  .supercx-widget-modal {
    width: 450px !important;
    height: 650px !important;
  }
}
```

## Features

- **Responsive Design**: Automatically adapts to mobile and desktop
- **Customizable**: Matches your brand colors and styling
- **Accessible**: Built with accessibility in mind
- **Fast Loading**: Minimal impact on your website performance
- **Cross-browser**: Works on all modern browsers

## Mobile Experience

On mobile devices (screen width < 480px), the widget automatically:

- Opens in fullscreen mode for better usability
- Prevents background scrolling when open
- Optimizes touch interactions

## Security & Privacy

- All conversations are securely encrypted
- No data is stored in cookies or local storage by the widget
- Compliant with modern privacy standards
- CORS-enabled for secure cross-origin communication

## Troubleshooting

### Widget not appearing

1. Check that the script is loading without errors in browser console
2. Verify your agent ID is correct
3. Ensure your domain is whitelisted (if applicable)

### Styling issues

1. Check for CSS conflicts with your existing styles
2. Use more specific CSS selectors if needed
3. Use `!important` sparingly for critical overrides

### Performance concerns

1. The widget script is optimized and loads asynchronously
2. Chat interface loads only when user opens the widget
3. Consider loading the script after your main content

## Support

For technical support or feature requests, please contact your MagicalCX administrator.

---

_This widget is powered by MagicalCX - Advanced conversational AI platform._
