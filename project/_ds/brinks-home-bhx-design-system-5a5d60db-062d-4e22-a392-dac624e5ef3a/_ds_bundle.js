/* @ds-bundle: {"format":4,"namespace":"BrinksHomeBHXDesignSystem_5a5d60","components":[{"name":"Banner","sourcePath":"components/core/Banner.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"LayeredHeading","sourcePath":"components/core/LayeredHeading.jsx"},{"name":"Logo","sourcePath":"components/core/Logo.jsx"},{"name":"Section","sourcePath":"components/core/Section.jsx"},{"name":"Steps","sourcePath":"components/core/Steps.jsx"},{"name":"Accordion","sourcePath":"components/feedback/Accordion.jsx"},{"name":"Modal","sourcePath":"components/feedback/Modal.jsx"},{"name":"Checkbox","sourcePath":"components/forms/Checkbox.jsx"},{"name":"Field","sourcePath":"components/forms/Field.jsx"},{"name":"FileUpload","sourcePath":"components/forms/FileUpload.jsx"},{"name":"Input","sourcePath":"components/forms/Input.jsx"},{"name":"Select","sourcePath":"components/forms/Select.jsx"},{"name":"Footer","sourcePath":"components/navigation/Footer.jsx"},{"name":"NavBar","sourcePath":"components/navigation/NavBar.jsx"},{"name":"Tabs","sourcePath":"components/navigation/Tabs.jsx"}],"sourceHashes":{"components/core/Banner.jsx":"7202b89280ab","components/core/Button.jsx":"7161070db5d5","components/core/Card.jsx":"a41879743bfe","components/core/Icon.jsx":"5f36c0c1fcd5","components/core/LayeredHeading.jsx":"0dc2334c87ea","components/core/Logo.jsx":"e0c06bd3491d","components/core/Section.jsx":"780e9f606958","components/core/Steps.jsx":"9177bbd7c400","components/feedback/Accordion.jsx":"9a52f389067f","components/feedback/Modal.jsx":"17dac78fb760","components/forms/Checkbox.jsx":"1cb86408218b","components/forms/Field.jsx":"8d2905d38688","components/forms/FileUpload.jsx":"78f2037945ac","components/forms/Input.jsx":"0d115aa28b7c","components/forms/Select.jsx":"c44a62dd287d","components/navigation/Footer.jsx":"1d308549824e","components/navigation/NavBar.jsx":"b7a5545527dc","components/navigation/Tabs.jsx":"f432612a6b22","ui_kits/bhx/BlogScreen.jsx":"2ca84b1bdeda","ui_kits/bhx/DealerProgramScreen.jsx":"3fd2c2237c7d","ui_kits/bhx/HomeScreen.jsx":"45895c5e95f4","ui_kits/bhx/Shared.jsx":"20c534865a1d","ui_kits/bhx/data.js":"a61084681d3e"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.BrinksHomeBHXDesignSystem_5a5d60 = window.BrinksHomeBHXDesignSystem_5a5d60 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Banner.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Full-width attention strip above or between sections. */
function Banner({
  tone = "lightblue",
  icon,
  children,
  style
}) {
  const bg = tone === "scrim" ? "var(--overlay-scrim)" : tone === "blue" ? "var(--surface-inverse)" : "var(--surface-accent)";
  return /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: bg,
      color: "var(--text-inverse)",
      padding: "var(--space-3) var(--space-4)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "var(--space-2)",
      textAlign: "center",
      ...style
    }
  }, icon && /*#__PURE__*/React.createElement("img", {
    src: A(icon),
    alt: "",
    "aria-hidden": "true",
    style: {
      width: "1.5rem",
      height: "1.5rem"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h4-size)",
      lineHeight: 1.5,
      fontWeight: "var(--fw-bold)",
      margin: 0
    }
  }, children));
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Banner.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;
const PALETTE = {
  cta: {
    bg: "var(--color-cta)",
    hover: "var(--color-cta-hover)",
    fg: "#fff",
    border: "var(--color-cta)"
  },
  primary: {
    bg: "var(--color-primary)",
    hover: "#0A1B24",
    fg: "#fff",
    border: "var(--color-primary)"
  },
  blueNav: {
    bg: "var(--bhs-blue-2)",
    hover: "var(--bhs-blue-6)",
    fg: "#fff",
    border: "var(--bhs-blue-2)"
  },
  outlineWhite: {
    bg: "transparent",
    hover: "rgba(255,255,255,.12)",
    fg: "#fff",
    border: "#fff"
  },
  outlineDark: {
    bg: "transparent",
    hover: "rgba(15,40,53,.08)",
    fg: "var(--color-primary)",
    border: "var(--color-primary)"
  }
};
const SIZES = {
  sm: {
    padding: "0.222rem 0.833rem",
    fontSize: "0.8099rem"
  },
  md: {
    padding: "0.556rem 1.333rem",
    fontSize: "1.11rem"
  },
  lg: {
    padding: "0.778rem 2.389rem",
    fontSize: "1.11rem",
    minWidth: "189px"
  }
};

/** Primary action button. Mirrors .btn / .btn-ctagreen from bhs-shared-assets. */
function Button({
  variant = "cta",
  size = "md",
  icon,
  iconRight = false,
  block = false,
  disabled = false,
  type = "button",
  onClick,
  children,
  style
}) {
  const p = PALETTE[variant] || PALETTE.cta;
  const s = SIZES[size] || SIZES.md;
  const [hover, setHover] = React.useState(false);
  const glyph = icon ? /*#__PURE__*/React.createElement("img", {
    src: A(icon),
    alt: "",
    "aria-hidden": "true",
    style: {
      width: "1.5rem",
      height: "1.5rem",
      flexShrink: 0
    }
  }) : null;
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    disabled: disabled,
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: block ? "flex" : "inline-flex",
      width: block ? "100%" : "auto",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      lineHeight: 1.618,
      whiteSpace: "nowrap",
      cursor: disabled ? "not-allowed" : "pointer",
      color: p.fg,
      backgroundColor: hover && !disabled ? p.hover : p.bg,
      border: "var(--border-width-btn) solid " + (hover && !disabled ? p.hover : p.border),
      borderRadius: "var(--radius-btn)",
      opacity: disabled ? 0.5 : 1,
      transition: "background-color var(--duration) var(--ease-out), border-color var(--duration) var(--ease-out)",
      ...s,
      ...style
    }
  }, !iconRight && glyph, /*#__PURE__*/React.createElement("span", null, children), iconRight && glyph);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
/** Image-over-copy card used for program tiles, partner bios and blog teasers. */
function Card({
  image,
  imageAlt = "",
  eyebrow,
  title,
  body,
  footer,
  hoverLift = true,
  bordered = false,
  onClick,
  style
}) {
  const [hover, setHover] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => setHover(false),
    style: {
      display: "flex",
      flexDirection: "column",
      backgroundColor: "var(--surface-card)",
      border: bordered ? "1px solid var(--border-hairline)" : "none",
      borderRadius: "var(--radius-lg)",
      overflow: "hidden",
      boxShadow: hover && hoverLift ? "var(--shadow-card-hover)" : "var(--shadow-card)",
      transform: hover && hoverLift ? "var(--card-hover-lift)" : "none",
      transition: "var(--transition-card)",
      cursor: onClick ? "pointer" : "default",
      ...style
    }
  }, image && /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: imageAlt,
    style: {
      width: "100%",
      height: 190,
      objectFit: "cover",
      display: "block"
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-3) var(--space-4) var(--space-4)",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-2)",
      flex: 1
    }
  }, eyebrow && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h6-size)",
      fontWeight: "var(--fw-semibold)",
      textTransform: "uppercase",
      letterSpacing: "var(--caps-letter-spacing)",
      color: "var(--color-accent)"
    }
  }, eyebrow), title && /*#__PURE__*/React.createElement("h5", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h5-size)",
      lineHeight: "var(--h5-line)",
      fontWeight: "var(--h5-weight)",
      color: "var(--text-heading)"
    }
  }, title), body && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      lineHeight: "var(--text-line)",
      color: "var(--text-body)"
    }
  }, body), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: "auto",
      paddingTop: "var(--space-3)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Renders a brand SVG asset at a token icon size. */
function Icon({
  name,
  set = "ui",
  size = 3,
  alt = "",
  style
}) {
  const px = {
    1: "0.75em",
    2: "1rem",
    3: "1.5rem",
    4: "2rem",
    5: "2.5rem",
    6: "3rem",
    7: "4rem",
    8: "5rem"
  }[size] || size;
  return /*#__PURE__*/React.createElement("img", {
    src: A("assets/icons/" + set + "/" + name + ".svg"),
    alt: alt,
    "aria-hidden": alt ? undefined : "true",
    style: {
      width: px,
      height: px,
      display: "inline-block",
      verticalAlign: "middle",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/LayeredHeading.jsx
try { (() => {
/** Two-line stacked heading: a smaller top line over a larger caps line. */
function LayeredHeading({
  lineOne,
  lineTwo,
  as = "h2",
  tone = "dark",
  align = "left",
  style
}) {
  const Tag = as;
  const color = tone === "light" ? "var(--text-inverse)" : "var(--text-heading)";
  return /*#__PURE__*/React.createElement(Tag, {
    style: {
      display: "flex",
      flexDirection: "column",
      lineHeight: 1,
      margin: 0,
      textAlign: align,
      color: color,
      fontFamily: "var(--font-heading)",
      letterSpacing: "var(--caps-letter-spacing)",
      textTransform: "uppercase",
      fontWeight: "var(--caps-weight)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--h3-size)",
      lineHeight: 1,
      marginBottom: 0
    }
  }, lineOne), /*#__PURE__*/React.createElement("span", {
    style: {
      fontSize: "var(--h2-size)",
      lineHeight: 1
    }
  }, lineTwo));
}
Object.assign(__ds_scope, { LayeredHeading });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/LayeredHeading.jsx", error: String((e && e.message) || e) }); }

// components/core/Logo.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Brinks Home™ primary wordmark. Never redraw it — these are the shipped SVGs. */
function Logo({
  tone = "white",
  width = 240,
  style
}) {
  const src = tone === "blue" ? "assets/logos/BH_primary_blue_TM.svg" : "assets/logos/BH_primary_white_TM.svg";
  if (tone === "shield") return /*#__PURE__*/React.createElement("img", {
    src: A("assets/logos/BrinksShield.svg"),
    alt: "Brinks Home",
    style: {
      width: width,
      height: "auto",
      display: "block",
      ...style
    }
  });
  return /*#__PURE__*/React.createElement("img", {
    src: A(src),
    alt: "Brinks Home",
    style: {
      width: width,
      height: "auto",
      display: "block",
      ...style
    }
  });
}
Object.assign(__ds_scope, { Logo });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Logo.jsx", error: String((e && e.message) || e) }); }

// components/core/Section.jsx
try { (() => {
/** Page section wrapper: vertical rhythm, max-width container, optional background image + scrim. */
function Section({
  background = "white",
  bgImage,
  scrim = false,
  containerWidth = 1366,
  padded = true,
  children,
  style
}) {
  const backgrounds = {
    white: "var(--surface-page)",
    blue: "var(--surface-inverse)",
    lightblue: "var(--surface-accent)",
    warmgray: "var(--surface-muted)",
    footer: "var(--surface-footer)"
  };
  const dark = background === "blue" || background === "lightblue" || background === "footer" || !!bgImage;
  return /*#__PURE__*/React.createElement("section", {
    style: {
      backgroundColor: backgrounds[background] || background,
      backgroundImage: bgImage ? "url(" + bgImage + ")" : undefined,
      backgroundSize: "cover",
      backgroundPosition: "center",
      color: dark ? "var(--text-inverse)" : "var(--text-body)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: scrim ? "var(--overlay-scrim)" : "transparent"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: containerWidth,
      margin: "0 auto",
      padding: padded ? "var(--section-padding-y-md) var(--container-gutter-lg)" : 0
    }
  }, children)));
}
Object.assign(__ds_scope, { Section });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Section.jsx", error: String((e && e.message) || e) }); }

// components/core/Steps.jsx
try { (() => {
/** Numbered process steps (c-steps--ordered): dark-blue numeral discs with copy beside them. */
function Steps({
  steps = [],
  direction = "column",
  tone = "dark",
  style
}) {
  const color = tone === "light" ? "var(--text-inverse)" : "var(--text-body)";
  return /*#__PURE__*/React.createElement("ol", {
    style: {
      listStyle: "none",
      margin: 0,
      padding: 0,
      display: "flex",
      flexDirection: direction,
      gap: "var(--space-4)",
      ...style
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement("li", {
    key: i,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "flex-start",
      flex: direction === "row" ? "1 0 0" : undefined
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      flexShrink: 0,
      width: "2em",
      height: "2em",
      borderRadius: "50%",
      backgroundColor: tone === "light" ? "#fff" : "var(--color-primary)",
      color: tone === "light" ? "var(--color-primary)" : "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)"
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      lineHeight: "var(--text-line)",
      color: color
    }
  }, s))));
}
Object.assign(__ds_scope, { Steps });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Steps.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Accordion.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** FAQ accordion: question row with rotating chevron, answer revealed by a grid-row transition. */
function Accordion({
  items = [],
  defaultOpen = 0,
  style
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  return /*#__PURE__*/React.createElement("div", {
    style: style
  }, items.map((item, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      borderBottom: "2px solid var(--color-primary)",
      paddingBottom: "var(--space-2)",
      marginBottom: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    onClick: () => setOpen(open === i ? -1 : i),
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "var(--space-4)",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("h5", {
    style: {
      margin: 0,
      maxWidth: "85%",
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h5-size)",
      lineHeight: "var(--h5-line)",
      fontWeight: "var(--h5-weight)",
      color: "var(--text-heading)"
    }
  }, item.question), /*#__PURE__*/React.createElement("img", {
    src: A("assets/icons/ui/icon-chevron-down.svg"),
    alt: "",
    "aria-hidden": "true",
    style: {
      width: "1.5rem",
      height: "1.5rem",
      flexShrink: 0,
      transform: open === i ? "rotate(90deg)" : "rotate(0deg)",
      transition: "transform var(--duration)"
    }
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateRows: open === i ? "1fr" : "0fr",
      transition: "var(--transition-accordion)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      overflow: "hidden"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 0",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      lineHeight: "var(--text-line)",
      color: "var(--text-body)"
    }
  }, item.answer))))));
}
Object.assign(__ds_scope, { Accordion });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Accordion.jsx", error: String((e && e.message) || e) }); }

// components/feedback/Modal.jsx
try { (() => {
/** Centred dialog with the brand's 15px dark-blue frame. */
function Modal({
  open = true,
  title,
  subtitle,
  width = 850,
  framed = true,
  onClose,
  children,
  footer,
  style
}) {
  if (!open) return null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "fixed",
      inset: 0,
      backgroundColor: "var(--black-trans-dark)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "var(--space-3)",
      zIndex: 1050,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      backgroundColor: "#fff",
      border: framed ? "15px solid var(--color-primary)" : "none",
      borderRadius: "var(--radius-lg)",
      maxWidth: width,
      width: "100%",
      maxHeight: "90vh",
      overflowY: "auto"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "var(--space-4)",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("div", null, title && /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h2-size)",
      lineHeight: "var(--h2-line)",
      fontWeight: "var(--h2-weight)",
      color: "var(--text-heading)"
    }
  }, title), subtitle && /*#__PURE__*/React.createElement("p", {
    style: {
      margin: "var(--space-2) 0 0",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      lineHeight: "var(--text-line)",
      color: "var(--text-body)"
    }
  }, subtitle)), onClose && /*#__PURE__*/React.createElement("button", {
    onClick: onClose,
    "aria-label": "Close",
    style: {
      background: "none",
      border: "none",
      cursor: "pointer",
      fontSize: "1.6rem",
      lineHeight: 1,
      color: "var(--color-primary)"
    }
  }, "\xD7")), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 var(--space-4) var(--space-4)"
    }
  }, children), footer && /*#__PURE__*/React.createElement("div", {
    style: {
      padding: "0 var(--space-4) var(--space-4)"
    }
  }, footer)));
}
Object.assign(__ds_scope, { Modal });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/feedback/Modal.jsx", error: String((e && e.message) || e) }); }

// components/forms/Checkbox.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Checkbox with dark-blue checked box and the shipped white check glyph. */
function Checkbox({
  label,
  checked,
  defaultChecked,
  disabled = false,
  onChange,
  id,
  name,
  style
}) {
  const [internal, setInternal] = React.useState(!!defaultChecked);
  const isOn = checked === undefined ? internal : checked;
  return /*#__PURE__*/React.createElement("label", {
    htmlFor: id,
    style: {
      display: "flex",
      gap: "0.75rem",
      alignItems: "flex-start",
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.5 : 1,
      marginBottom: "var(--space-2)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("input", {
    id: id,
    name: name,
    type: "checkbox",
    checked: isOn,
    disabled: disabled,
    onChange: e => {
      if (checked === undefined) setInternal(e.target.checked);
      if (onChange) onChange(e);
    },
    style: {
      position: "absolute",
      opacity: 0,
      width: 0,
      height: 0
    }
  }), /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true",
    style: {
      flexShrink: 0,
      width: "1.06rem",
      height: "1.06rem",
      marginTop: "0.2rem",
      borderRadius: "var(--radius-sm)",
      border: "2px solid " + (isOn ? "var(--color-primary)" : "#CED4DA"),
      backgroundColor: isOn ? "var(--color-primary)" : "#fff",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }
  }, isOn && /*#__PURE__*/React.createElement("img", {
    src: A("assets/icons/ui/icon-check-white.svg"),
    alt: "",
    style: {
      width: "55%",
      height: "55%"
    }
  })), /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      lineHeight: "var(--text-line)"
    }
  }, label));
}
Object.assign(__ds_scope, { Checkbox });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Checkbox.jsx", error: String((e && e.message) || e) }); }

// components/forms/Field.jsx
try { (() => {
/** Label + control + validation message wrapper. */
function Field({
  label,
  required = false,
  error,
  hint,
  htmlFor,
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "0.35rem",
      marginBottom: "var(--space-3)",
      ...style
    }
  }, label && /*#__PURE__*/React.createElement("label", {
    htmlFor: htmlFor,
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      fontWeight: "var(--fw-medium)",
      color: "inherit"
    }
  }, label, required && /*#__PURE__*/React.createElement("span", {
    "aria-hidden": "true"
  }, "*")), children, hint && !error && /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-small-size)",
      lineHeight: "var(--text-small-line)",
      opacity: 0.8
    }
  }, hint), error && /*#__PURE__*/React.createElement("span", {
    role: "alert",
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-small-size)",
      lineHeight: "var(--text-small-line)",
      color: "var(--color-danger)"
    }
  }, error));
}
Object.assign(__ds_scope, { Field });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Field.jsx", error: String((e && e.message) || e) }); }

// components/forms/FileUpload.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Drag-or-click upload well used for the Account Valuation Template. */
function FileUpload({
  heading = "Drag or click to upload file.",
  subheading = "Click to upload file",
  note = "Maximum size is 20MB.",
  fileName,
  onSelect,
  style
}) {
  const [over, setOver] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    onDragOver: e => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: e => {
      e.preventDefault();
      setOver(false);
      if (onSelect) onSelect(e);
    },
    onClick: onSelect,
    style: {
      border: "2px dashed " + (over ? "var(--color-accent)" : "#CED4DA"),
      borderRadius: "var(--radius-lg)",
      backgroundColor: over ? "rgba(30,91,113,.06)" : "#fff",
      padding: "var(--space-4)",
      textAlign: "center",
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-2)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A("assets/icons/ui/cloud-upload.svg"),
    alt: "",
    "aria-hidden": "true",
    style: {
      width: "2.5rem",
      height: "2.5rem"
    }
  }), /*#__PURE__*/React.createElement("h5", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h5-size)",
      fontWeight: "var(--h5-weight)",
      color: "var(--text-heading)"
    }
  }, fileName || heading), !fileName && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      color: "var(--text-body)"
    }
  }, subheading), note && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-small-size)",
      lineHeight: "var(--text-small-line)",
      color: "var(--text-muted)"
    }
  }, note));
}
Object.assign(__ds_scope, { FileUpload });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/FileUpload.jsx", error: String((e && e.message) || e) }); }

// components/forms/Input.jsx
try { (() => {
/** Single-line text input. */
function Input({
  type = "text",
  value,
  defaultValue,
  placeholder,
  invalid = false,
  disabled = false,
  onChange,
  id,
  name,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("input", {
    id: id,
    name: name,
    type: type,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      width: "100%",
      boxSizing: "border-box",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-normal)",
      fontSize: "var(--text-size)",
      lineHeight: 1.618,
      color: "var(--text-body)",
      backgroundColor: "#fff",
      padding: "0.5rem 0.75rem",
      borderRadius: "var(--radius)",
      border: "2px solid " + (invalid ? "var(--color-danger)" : focus ? "rgba(15,40,53,.5)" : "#CED4DA"),
      outline: "none",
      transition: "border-color var(--duration) var(--ease-out)"
    }
  });
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Input.jsx", error: String((e && e.message) || e) }); }

// components/forms/Select.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Native select styled to match Input, with the brand chevron. */
function Select({
  options = [],
  value,
  defaultValue,
  placeholder = "Select",
  invalid = false,
  disabled = false,
  onChange,
  id,
  name,
  style
}) {
  const [focus, setFocus] = React.useState(false);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: "relative",
      ...style
    }
  }, /*#__PURE__*/React.createElement("select", {
    id: id,
    name: name,
    value: value,
    defaultValue: defaultValue,
    disabled: disabled,
    onChange: onChange,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: {
      ...{
        width: "100%",
        boxSizing: "border-box",
        fontFamily: "var(--font-body)",
        fontWeight: "var(--fw-normal)",
        fontSize: "var(--text-size)",
        lineHeight: 1.618,
        color: "var(--text-body)",
        backgroundColor: "#fff",
        padding: "0.5rem 0.75rem",
        borderRadius: "var(--radius)",
        border: "2px solid " + (invalid ? "var(--color-danger)" : focus ? "rgba(15,40,53,.5)" : "#CED4DA"),
        outline: "none",
        transition: "border-color var(--duration) var(--ease-out)"
      },
      appearance: "none",
      paddingRight: "2.5rem"
    }
  }, /*#__PURE__*/React.createElement("option", {
    value: ""
  }, placeholder), options.map(o => /*#__PURE__*/React.createElement("option", {
    key: typeof o === "string" ? o : o.value,
    value: typeof o === "string" ? o : o.value
  }, typeof o === "string" ? o : o.label))), /*#__PURE__*/React.createElement("img", {
    src: A("assets/icons/ui/icon-chevron-down.svg"),
    alt: "",
    "aria-hidden": "true",
    style: {
      position: "absolute",
      right: "0.75rem",
      top: "50%",
      transform: "translateY(-50%) rotate(90deg)",
      width: "1rem",
      height: "1rem",
      pointerEvents: "none"
    }
  }));
}
Object.assign(__ds_scope, { Select });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/forms/Select.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Footer.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Minimal blue-1 footer: copyright, legal disclaimer, link row, accessibility button. */
function Footer({
  disclaimer,
  links = [{
    label: "Terms",
    href: "https://brinkshome.com/terms"
  }, {
    label: "Privacy",
    href: "https://brinkshome.com/privacy-policy"
  }, {
    label: "Licensing",
    href: "https://brinkshome.com/about-us/licensing"
  }, {
    label: "Sitemap",
    href: "https://brinkshome.com/sitemap"
  }, {
    label: "Blog",
    href: "/blog"
  }],
  year = new Date().getFullYear(),
  showAlly = true,
  style
}) {
  const small = {
    fontFamily: "var(--font-body)",
    fontSize: "var(--text-small-size)",
    lineHeight: "var(--text-small-line)",
    color: "#fff",
    margin: 0
  };
  return /*#__PURE__*/React.createElement("footer", {
    style: {
      backgroundColor: "var(--surface-footer)",
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "var(--space-4) var(--container-gutter-lg)",
      display: "flex",
      gap: "var(--space-4)",
      alignItems: "flex-start",
      flexWrap: "wrap"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: "1 1 480px",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: small
  }, "Copyright \xA9 ", year, " Brinks Home\u2122. All rights reserved. 1501 Lyndon B Johnson Fwy, Suite 700, Dallas, TX 75234"), disclaimer && /*#__PURE__*/React.createElement("p", {
    style: small
  }, disclaimer), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      flexWrap: "wrap"
    }
  }, links.map(l => /*#__PURE__*/React.createElement("a", {
    key: l.label,
    href: l.href,
    style: {
      ...small,
      textDecoration: "none"
    }
  }, l.label)))), showAlly && /*#__PURE__*/React.createElement("button", {
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.556rem 1.333rem",
      backgroundColor: "var(--color-cta)",
      border: "2px solid var(--color-cta)",
      borderRadius: "var(--radius-btn)",
      color: "#fff",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "1.11rem",
      cursor: "pointer"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A("assets/icons/ui/Wheelchair.svg"),
    alt: "",
    "aria-hidden": "true",
    style: {
      width: "1.5rem",
      height: "1.5rem"
    }
  }), "Activate Ally Toolbar")));
}
Object.assign(__ds_scope, { Footer });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Footer.jsx", error: String((e && e.message) || e) }); }

// components/navigation/NavBar.jsx
try { (() => {
const A = p => p && !/^(https?:|\/|data:)/.test(p) ? (typeof window !== "undefined" && window.BHX_ASSET_BASE || "") + p : p;

/** Fixed dark-blue top navigation with hover dropdowns and a CTA button. */
function NavBar({
  items = [],
  cta = "Contact Us",
  ctaIcon = "assets/icons/ui/chat-bubble-outline.svg",
  activePath,
  onCta,
  sticky = false,
  style
}) {
  const [open, setOpen] = React.useState(null);
  return /*#__PURE__*/React.createElement("nav", {
    style: {
      backgroundColor: "var(--color-primary)",
      boxShadow: "var(--shadow-header)",
      minHeight: 62,
      position: sticky ? "sticky" : "relative",
      top: 0,
      zIndex: 200,
      ...style
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: "var(--container-max)",
      margin: "0 auto",
      padding: "0.5rem var(--container-gutter-lg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement("a", {
    href: "/",
    "aria-label": "Brinks Home logo",
    style: {
      lineHeight: 0,
      flexShrink: 0
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: A("assets/logos/BH_primary_white_TM.svg"),
    alt: "Brinks Home",
    style: {
      height: 31,
      width: "auto",
      display: "block"
    }
  })), /*#__PURE__*/React.createElement("ul", {
    style: {
      display: "flex",
      alignItems: "center",
      gap: "var(--space-4)",
      listStyle: "none",
      margin: 0,
      padding: 0
    }
  }, items.map(item => /*#__PURE__*/React.createElement("li", {
    key: item.label,
    style: {
      position: "relative",
      display: "flex",
      alignItems: "center"
    },
    onMouseEnter: () => setOpen(item.children ? item.label : null),
    onMouseLeave: () => setOpen(null)
  }, /*#__PURE__*/React.createElement("a", {
    href: item.href || "#",
    style: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "#fff",
      textDecoration: "none",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      lineHeight: 1.618,
      whiteSpace: "nowrap",
      cursor: "pointer",
      borderBottom: activePath && activePath === item.href ? "2px solid var(--color-accent)" : "2px solid transparent",
      paddingBottom: 2
    }
  }, item.label, item.children && /*#__PURE__*/React.createElement("span", {
    style: {
      display: "inline-block",
      transition: "var(--transition-chevron)",
      transform: open === item.label ? "rotate(180deg)" : "rotate(0deg)"
    }
  }, /*#__PURE__*/React.createElement("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "16",
    height: "16",
    fill: "currentColor",
    viewBox: "0 0 16 16"
  }, /*#__PURE__*/React.createElement("path", {
    fillRule: "evenodd",
    d: "M1.646 5.646a.5.5 0 0 1 .708 0l5.646 4.939 5.646-4.939a.5.5 0 1 1 .708.707l-6 5.25a.5.5 0 0 1-.708 0l-6-5.25a.5.5 0 0 1 0-.707z"
  })))), item.children && open === item.label && /*#__PURE__*/React.createElement("ul", {
    style: {
      position: "absolute",
      top: "100%",
      left: 0,
      zIndex: 1000,
      minWidth: "12rem",
      padding: "1rem",
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      backgroundColor: "#fff",
      border: "1px solid rgba(0,0,0,.15)",
      borderRadius: "0.25rem",
      boxShadow: "var(--shadow-dropdown)",
      listStyle: "none",
      margin: 0
    }
  }, item.children.map(child => /*#__PURE__*/React.createElement("li", {
    key: child.label
  }, /*#__PURE__*/React.createElement("a", {
    href: child.href,
    style: {
      display: "block",
      padding: "0.2rem 0",
      color: "var(--color-primary)",
      textDecoration: "none",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      borderLeft: activePath === child.href ? "4px solid var(--color-accent)" : "none",
      paddingLeft: activePath === child.href ? "0.4rem" : 0
    }
  }, child.label)))))), cta && /*#__PURE__*/React.createElement("li", null, /*#__PURE__*/React.createElement("button", {
    onClick: onCta,
    style: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.556rem 1.333rem",
      backgroundColor: "var(--color-cta)",
      border: "2px solid var(--color-cta)",
      borderRadius: "var(--radius-btn)",
      color: "#fff",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "1.11rem",
      cursor: "pointer",
      whiteSpace: "nowrap"
    }
  }, ctaIcon && /*#__PURE__*/React.createElement("img", {
    src: A(ctaIcon),
    alt: "",
    "aria-hidden": "true",
    style: {
      width: "1.5rem",
      height: "1.5rem"
    }
  }), cta)))));
}
Object.assign(__ds_scope, { NavBar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/NavBar.jsx", error: String((e && e.message) || e) }); }

// components/navigation/Tabs.jsx
try { (() => {
/** Segmented tab row: idle tabs are translucent dark blue, the active tab is solid. */
function Tabs({
  tabs = [],
  value,
  defaultValue = 0,
  onChange,
  style
}) {
  const [internal, setInternal] = React.useState(defaultValue);
  const active = value === undefined ? internal : value;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      ...style
    }
  }, tabs.map((t, i) => /*#__PURE__*/React.createElement("button", {
    key: t,
    onClick: () => {
      if (value === undefined) setInternal(i);
      if (onChange) onChange(i);
    },
    style: {
      flexGrow: 1,
      padding: "0.5rem 1rem",
      cursor: "pointer",
      fontFamily: "var(--font-body)",
      fontWeight: "var(--fw-bold)",
      fontSize: "var(--h4-size)",
      border: "1px solid var(--tab-idle-border)",
      backgroundColor: active === i ? "var(--color-primary)" : "var(--tab-idle-bg)",
      color: active === i ? "#fff" : "var(--color-primary)",
      outline: "none",
      transition: "background-color var(--duration) var(--ease-out)"
    }
  }, t)));
}
Object.assign(__ds_scope, { Tabs });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/navigation/Tabs.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bhx/BlogScreen.jsx
try { (() => {
const {
  Section,
  Card,
  Button
} = window.__BHXDS;
const {
  H2,
  P
} = window;
function BlogScreen({
  onCta
}) {
  const posts = window.BHX_POSTS;
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Section, {
    background: "blue",
    style: {
      paddingTop: 0
    }
  }, /*#__PURE__*/React.createElement(H2, {
    tone: "light",
    align: "left"
  }, "Resources"), /*#__PURE__*/React.createElement(P, {
    tone: "light",
    big: true,
    align: "left",
    style: {
      marginTop: "var(--space-2)"
    }
  }, "Insight for security and alarm business owners \u2014 funding, attrition, sales and smart home technology.")), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(2,1fr)",
      gap: "var(--space-4)"
    }
  }, posts.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    image: p.image,
    eyebrow: "Article",
    title: p.title,
    body: "A short read for owners weighing their next move with Brinks Home.",
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "outlineDark",
      size: "sm"
    }, "Read Article")
  })))), /*#__PURE__*/React.createElement(Section, {
    background: "lightblue"
  }, /*#__PURE__*/React.createElement(H2, {
    tone: "light"
  }, "Take the Next Step"), /*#__PURE__*/React.createElement(P, {
    tone: "light",
    big: true,
    style: {
      marginTop: "var(--space-3)",
      maxWidth: 760,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, "After using the Account Value Calculator, completing the Account Valuation Template is the next step in the process."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-3)",
      justifyContent: "center",
      marginTop: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    icon: "assets/icons/ui/attach-email.svg",
    onClick: onCta
  }, "Get Template"), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    icon: "assets/icons/ui/cloud-upload.svg",
    onClick: onCta
  }, "Upload Template"))));
}
window.BlogScreen = BlogScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bhx/BlogScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bhx/DealerProgramScreen.jsx
try { (() => {
const {
  Section,
  Button,
  Banner,
  Card
} = window.__BHXDS;
const {
  H2,
  P,
  Hero,
  Testimonials,
  FaqSection,
  ResourcesStrip,
  LeadForm
} = window;
function DealerProgramScreen({
  onCta,
  onOpenBlog
}) {
  const I = window.BHX_IMG;
  const benefits = [{
    title: "The Best-in-Class Option",
    body: /*#__PURE__*/React.createElement("span", null, "A trusted name for 165+ years, Brinks Home offers ", /*#__PURE__*/React.createElement("b", null, "premium products and premium protection"), ". We\u2019re dedicated to providing ", /*#__PURE__*/React.createElement("b", null, "exceptional customer care"), ", and our US-based call center achieved a 92% first-call resolution rate*.")
  }, {
    title: "Customizable Partnerships & Flexible Funding",
    body: /*#__PURE__*/React.createElement("span", null, "Enjoy ", /*#__PURE__*/React.createElement("b", null, "flexible funding with weekly payouts"), " and revenue-sharing options with high multiples. ", /*#__PURE__*/React.createElement("b", null, "Access the latest sales tools and marketing materials"), " to expand your business while tapping into a network of skilled technicians.")
  }, {
    title: "Dedicated Support Plus Compelling Incentives",
    body: /*#__PURE__*/React.createElement("span", null, "Join a ", /*#__PURE__*/React.createElement("b", null, "team committed to your success,"), " led by a support manager who\u2019ll work with you hands-on. Get ", /*#__PURE__*/React.createElement("b", null, "recognition for your hard work"), " with rewards, including coveted prizes, trips, and financial incentives.")
  }, {
    title: "Keep Control Without Interference",
    body: /*#__PURE__*/React.createElement("span", null, "By choosing Brinks Home, ", /*#__PURE__*/React.createElement("b", null, "there\u2019s plenty of opportunity"), "\u2014your leads stay yours, ", /*#__PURE__*/React.createElement("b", null, "your growth is limitless"), ", and your business remains under your control.")
  }];
  const stats = [["44", "States Where Sales Were Funded"], ["50", "Unique Dealers Funded"], ["10:1", "Ratio of Dealers to Funding Specialists"]];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    title: /*#__PURE__*/React.createElement("span", null, "Grow Your Business With Brinks Home\u2122"),
    kicker: "Your Trusted Partner for Success",
    image: I.heroDealer,
    onCta: onCta
  }), /*#__PURE__*/React.createElement(Banner, {
    icon: "assets/icons/ui/phone_white.svg"
  }, "Call Us to Become a Partner: ", /*#__PURE__*/React.createElement("a", {
    href: "tel:888.848.1446",
    style: {
      color: "#fff",
      textDecoration: "underline"
    }
  }, "888.848.1446")), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(H2, null, "Join the Brinks Home Dealer Program"), /*#__PURE__*/React.createElement(P, {
    big: true,
    style: {
      marginTop: "var(--space-3)",
      maxWidth: 900,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, "Discover the advantages of partnering with an innovative leader in home security. Our team meets you where you are, delivering expert support, tools, and incentives to scale your business and unlock revenue."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "var(--space-5)",
      marginTop: "var(--space-5)"
    }
  }, benefits.map(b => /*#__PURE__*/React.createElement("div", {
    key: b.title,
    style: {
      display: "flex",
      gap: "var(--space-3)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: "../../assets/icons/brand/bh_icons_badge_check.svg",
    alt: "",
    style: {
      width: 44,
      height: 44,
      flexShrink: 0
    }
  }), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", {
    style: {
      margin: "0 0 var(--space-2)",
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h5-size)",
      lineHeight: "var(--h5-line)",
      fontWeight: 700,
      color: "var(--text-heading)"
    }
  }, b.title), /*#__PURE__*/React.createElement(P, {
    align: "left"
  }, b.body))))), /*#__PURE__*/React.createElement(P, {
    style: {
      marginTop: "var(--space-4)",
      fontSize: "var(--text-small-size)"
    }
  }, "*As of March 2024, per Cresta analysis."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginTop: "var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    size: "lg",
    onClick: onCta
  }, "Join Us"))), /*#__PURE__*/React.createElement(Section, {
    background: "lightblue"
  }, /*#__PURE__*/React.createElement(H2, {
    tone: "light"
  }, "Funding by the Numbers"), /*#__PURE__*/React.createElement(P, {
    tone: "light",
    big: true,
    style: {
      marginTop: "var(--space-3)",
      maxWidth: 860,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, "Empowering partners to achieve success, Brinks Home delivers fast, reliable funding, ensuring that your business is as secure as the homes we protect."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-5)",
      marginTop: "var(--space-5)",
      textAlign: "center"
    }
  }, stats.map(([n, l]) => /*#__PURE__*/React.createElement("div", {
    key: l
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h1-size)",
      lineHeight: 1,
      fontWeight: 700,
      color: "#fff"
    }
  }, n), /*#__PURE__*/React.createElement(P, {
    tone: "light",
    style: {
      marginTop: "var(--space-2)"
    }
  }, l))))), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(H2, null, "Building Trust, Together"), /*#__PURE__*/React.createElement(P, {
    big: true,
    style: {
      marginTop: "var(--space-3)",
      maxWidth: 900,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, "It\u2019s not just about selling security, but fostering relationships\u2014and having fun along the way. Join a team of motivated, like-minded individuals as we host events, give awards, and celebrate wins."), /*#__PURE__*/React.createElement("img", {
    src: I.events,
    alt: "",
    style: {
      width: "100%",
      maxWidth: 900,
      display: "block",
      margin: "var(--space-4) auto 0",
      borderRadius: "var(--radius-lg)"
    }
  })), /*#__PURE__*/React.createElement(Testimonials, {
    items: [{
      logo: I.skyline,
      quote: "They provide next-level sales enablement that will allow us to scale quickly and focus on what we're good at\u2014sales!",
      name: "Edwin A.",
      company: "Skyline Security"
    }, {
      logo: I.secure,
      quote: "Leadership is not afraid to be bold and color outside the lines, allowing partners to create our own path towards success!",
      name: "Stacey C.",
      company: "Secure Home and Automation"
    }, {
      logo: I.protect,
      quote: "This program has given me, a small business owner, all the tools and resources needed to successfully compete!",
      name: "Enrique V.",
      company: "Spartan Home Security"
    }]
  }), /*#__PURE__*/React.createElement(LeadForm, {
    heading: "Get Started\\u2014Tell Us About Yourself"
  }), /*#__PURE__*/React.createElement(FaqSection, null), /*#__PURE__*/React.createElement(ResourcesStrip, {
    onOpenBlog: onOpenBlog
  }));
}
window.DealerProgramScreen = DealerProgramScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bhx/DealerProgramScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bhx/HomeScreen.jsx
try { (() => {
const {
  Section,
  Button,
  Card
} = window.__BHXDS;
const {
  H2,
  P,
  Hero,
  FeatureRow,
  Testimonials,
  Awards,
  ResourcesStrip,
  FaqSection,
  LeadForm
} = window;
function HomeScreen({
  onCta,
  onOpenBlog
}) {
  const I = window.BHX_IMG;
  const programs = [{
    image: I.dealer,
    title: "Dealer Program",
    body: "Acquire funding, effectively scale your business, and get dedicated support from a team invested in your growth."
  }, {
    image: I.direct,
    title: "Direct Program",
    body: "By aligning with a trusted name, you\u2019ll access advanced tools and products on our expansive platform."
  }, {
    image: I.sell,
    title: "Sell Accounts",
    body: "Driven by our powerful Account Value Calculator, we offer competitive pricing with quick, easy access to capital."
  }, {
    image: I.acq,
    title: "Business Acquisition",
    body: "Explore selling or divesting assets beyond accounts with customized deals and guided expertise."
  }, {
    image: I.ent,
    title: "Enterprise Program",
    body: "We partner with companies across industries to create exclusive programs and offers to expand your reach."
  }];
  return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(Hero, {
    title: /*#__PURE__*/React.createElement("span", null, "Partner With Brinks Home\u2122 for Success in Security"),
    image: I.hero,
    onCta: onCta
  }), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 900,
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)"
    }
  }, /*#__PURE__*/React.createElement(H2, null, "Secure Opportunities and Unlock Growth"), /*#__PURE__*/React.createElement(P, {
    big: true
  }, "Whether you\u2019re scaling your business or interested in selling it, Brinks Home meets you where you are. We provide flexible, innovative solutions, empowering you to generate revenue and achieve your goals."), /*#__PURE__*/React.createElement(P, {
    big: true
  }, "Backed by 165+ years of security expertise, our forward-thinking approach combines cutting-edge technology with guided support.")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(5,1fr)",
      gap: "var(--space-3)",
      marginTop: "var(--space-5)"
    }
  }, programs.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    image: p.image,
    title: p.title,
    body: p.body,
    footer: /*#__PURE__*/React.createElement(Button, {
      variant: "cta",
      size: "sm",
      onClick: onCta
    }, "Get Started")
  })))), /*#__PURE__*/React.createElement(Section, {
    background: "blue"
  }, /*#__PURE__*/React.createElement(H2, {
    tone: "light"
  }, "Working With Brinks Home is a Win/Win"), /*#__PURE__*/React.createElement(P, {
    tone: "light",
    big: true,
    style: {
      marginTop: "var(--space-3)"
    }
  }, "We ensure that our partners are set up for success and that customers are well taken care of."), /*#__PURE__*/React.createElement(FeatureRow, {
    tone: "light",
    items: [{
      image: I.phone,
      title: "Powerful Technology Platform",
      body: "Use the latest tools and software with AI-driven capabilities to enhance your skills, streamline sales, and increase efficiency."
    }, {
      image: I.list,
      title: "Dedicated Resources",
      body: "Unlock a robust library of sales and marketing materials, training programs, and more expert-developed assets and assistance."
    }, {
      image: I.headset,
      title: "Exceptional Customer Care",
      body: "At our award-winning, US-based Alarm Response Center, Support Representatives provide 24/7 protection and peace of mind."
    }]
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "center",
      marginTop: "var(--space-5)"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    size: "lg",
    onClick: onCta
  }, "Join Us"))), /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(H2, null, "About Brinks Home: A Leader in Home Security"), /*#__PURE__*/React.createElement(P, {
    big: true,
    style: {
      marginTop: "var(--space-3)",
      maxWidth: 900,
      marginLeft: "auto",
      marginRight: "auto"
    }
  }, "Brinks Home is one of the largest home security companies in North America, trusted by over 1 million people. We provide premium protection and smart home solutions with 24/7 professional monitoring."), /*#__PURE__*/React.createElement(FeatureRow, {
    items: [{
      image: I.shieldIcon,
      title: "Built on Trust",
      body: "A trusted name in security for 165 years, Brinks Home is committed to protecting homes and families. We seek excellence in setting the industry standard, ensuring that partners feel confident and customers feel secure."
    }, {
      image: I.handshakeIcon,
      title: "Award-Winning Service",
      body: "Customers can expect professional, reliable, and prompt support from our Alarm Response Center, which has a best-in-class rate of 92%* of calls being resolved without transfer."
    }, {
      image: I.headsetIcon,
      title: "Digital Innovation and AI",
      body: "We embrace new technology, leveraging generative AI, machine learning, and advanced data analytics. Our expanded virtual capabilities enhance the customer experience."
    }]
  }), /*#__PURE__*/React.createElement(P, {
    style: {
      marginTop: "var(--space-4)",
      fontSize: "var(--text-small-size)"
    }
  }, "*As of March 2024, per Cresta analysis.")), /*#__PURE__*/React.createElement(Testimonials, {
    items: [{
      logo: I.skyline,
      quote: "They provide next-level sales enablement that will allow us to scale quickly and focus on what we're good at\u2014sales!",
      name: "Edwin A.",
      company: "Skyline Security"
    }, {
      logo: I.protect,
      quote: "Brinks Home put together a unique deal structure, leveraging both their expertise in the security alarm industry and their understanding of what drives attractive economics for their partners.",
      name: "Gerard F.",
      company: "Invesco for Protect America"
    }, {
      logo: I.secure,
      quote: "Leadership is not afraid to be bold and color outside the lines, allowing partners to create our own path towards success!",
      name: "Stacey C.",
      company: "Secure Home and Automation"
    }]
  }), /*#__PURE__*/React.createElement(LeadForm, null), /*#__PURE__*/React.createElement(FaqSection, null), /*#__PURE__*/React.createElement(Awards, null), /*#__PURE__*/React.createElement(ResourcesStrip, {
    onOpenBlog: onOpenBlog
  }));
}
window.HomeScreen = HomeScreen;
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bhx/HomeScreen.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bhx/Shared.jsx
try { (() => {
const {
  Section,
  Button,
  Card,
  Accordion,
  Field,
  Input,
  Select,
  Checkbox
} = window.__BHXDS;
const H2 = ({
  children,
  tone = "dark",
  align = "center",
  style
}) => /*#__PURE__*/React.createElement("h2", {
  style: {
    margin: 0,
    textAlign: align,
    fontFamily: "var(--font-heading)",
    fontSize: "var(--h2-size)",
    lineHeight: "var(--h2-line)",
    fontWeight: 700,
    color: tone === "light" ? "#fff" : "var(--text-heading)",
    ...style
  }
}, children);
const P = ({
  children,
  big,
  tone = "dark",
  align = "center",
  style
}) => /*#__PURE__*/React.createElement("p", {
  style: {
    margin: 0,
    textAlign: align,
    fontFamily: "var(--font-body)",
    fontSize: big ? "var(--text-big-size)" : "var(--text-size)",
    lineHeight: big ? "var(--text-big-line)" : "var(--text-line)",
    color: tone === "light" ? "#fff" : "var(--text-body)",
    ...style
  }
}, children);
function Hero({
  title,
  kicker,
  image,
  cta = "Join Today",
  onCta
}) {
  return /*#__PURE__*/React.createElement("section", {
    style: {
      backgroundColor: "var(--color-primary)",
      color: "#fff"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 1366,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      alignItems: "center",
      gap: "var(--space-5)",
      padding: "var(--space-5) var(--container-gutter-lg)"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-4)",
      alignItems: "flex-start"
    }
  }, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h1-size)",
      lineHeight: "var(--h1-line)",
      fontWeight: 700
    }
  }, title), kicker && /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h3-size)",
      fontWeight: 700
    }
  }, kicker), /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    size: "lg",
    onClick: onCta
  }, cta)), /*#__PURE__*/React.createElement("img", {
    src: image,
    alt: "",
    style: {
      width: "100%",
      borderRadius: "var(--radius-lg)",
      display: "block"
    }
  })));
}
function FeatureRow({
  items,
  tone = "dark"
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: "var(--space-5)",
      marginTop: "var(--space-5)"
    }
  }, items.map(it => /*#__PURE__*/React.createElement("div", {
    key: it.title,
    style: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "var(--space-3)",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: it.image,
    alt: "",
    style: {
      height: 96,
      objectFit: "contain"
    }
  }), /*#__PURE__*/React.createElement("h4", {
    style: {
      margin: 0,
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h4-size)",
      lineHeight: "var(--h4-line)",
      fontWeight: 700,
      color: tone === "light" ? "#fff" : "var(--text-heading)"
    }
  }, it.title), /*#__PURE__*/React.createElement(P, {
    tone: tone
  }, it.body))));
}
function Testimonials({
  items
}) {
  return /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(H2, null, "What Our Partners Have to Say"), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(3,1fr)",
      gap: "var(--space-5)",
      marginTop: "var(--space-5)"
    }
  }, items.map(t => /*#__PURE__*/React.createElement("div", {
    key: t.name,
    style: {
      display: "flex",
      flexDirection: "column",
      gap: "var(--space-3)",
      alignItems: "center",
      textAlign: "center"
    }
  }, /*#__PURE__*/React.createElement("img", {
    src: t.logo,
    alt: t.company,
    style: {
      height: 46,
      objectFit: "contain"
    }
  }), /*#__PURE__*/React.createElement(P, {
    style: {
      fontStyle: "italic"
    }
  }, "\u201C", t.quote, "\u201D"), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontWeight: 700,
      fontSize: "var(--text-size)"
    }
  }, t.name), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-size)",
      color: "var(--text-muted)"
    }
  }, t.company)))));
}
function Awards() {
  const I = window.BHX_IMG;
  return /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(H2, null, "Award-Winning Home Security Services"), /*#__PURE__*/React.createElement(P, {
    style: {
      marginTop: "var(--space-3)"
    }
  }, "We're proud to be recognized for delivering a best-in-class customer experience."), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      gap: "var(--space-5)",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "var(--space-4)",
      flexWrap: "wrap"
    }
  }, [I.a1, I.a2, I.a3, I.a4, I.a5, I.a6].map((a, i) => /*#__PURE__*/React.createElement("img", {
    key: i,
    src: a,
    alt: "",
    style: {
      height: 74,
      objectFit: "contain"
    }
  }))));
}
function ResourcesStrip({
  onOpenBlog
}) {
  return /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }
  }, /*#__PURE__*/React.createElement(H2, {
    align: "left"
  }, "Resources"), /*#__PURE__*/React.createElement(Button, {
    variant: "outlineDark",
    onClick: onOpenBlog
  }, "Read Our Blog")), /*#__PURE__*/React.createElement("div", {
    style: {
      display: "grid",
      gridTemplateColumns: "repeat(4,1fr)",
      gap: "var(--space-4)",
      marginTop: "var(--space-4)"
    }
  }, window.BHX_POSTS.map(p => /*#__PURE__*/React.createElement(Card, {
    key: p.title,
    image: p.image,
    title: p.title,
    onClick: onOpenBlog
  }))));
}
function FaqSection() {
  return /*#__PURE__*/React.createElement(Section, {
    background: "white"
  }, /*#__PURE__*/React.createElement(H2, null, "Frequently Asked Questions"), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 920,
      margin: "var(--space-5) auto 0"
    }
  }, /*#__PURE__*/React.createElement(Accordion, {
    items: window.BHX_FAQ
  })));
}
function LeadForm({
  heading = "Let\u2019s Set You Up for Success",
  onSubmit
}) {
  const [done, setDone] = React.useState(false);
  if (done) return /*#__PURE__*/React.createElement(Section, {
    background: "warmgray"
  }, /*#__PURE__*/React.createElement(H2, null, "Thank You!"), /*#__PURE__*/React.createElement(P, {
    big: true,
    style: {
      marginTop: "var(--space-3)"
    }
  }, "We've received your contact information and someone from our team will reach out to you shortly."));
  return /*#__PURE__*/React.createElement(Section, {
    background: "warmgray"
  }, /*#__PURE__*/React.createElement(H2, null, heading), /*#__PURE__*/React.createElement("div", {
    style: {
      maxWidth: 860,
      margin: "var(--space-4) auto 0",
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "0 var(--space-4)"
    }
  }, /*#__PURE__*/React.createElement(Field, {
    label: "First Name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, null)), /*#__PURE__*/React.createElement(Field, {
    label: "Last Name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, null)), /*#__PURE__*/React.createElement(Field, {
    label: "Business Name",
    required: true
  }, /*#__PURE__*/React.createElement(Input, null)), /*#__PURE__*/React.createElement(Field, {
    label: "Email",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "email"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Phone",
    required: true
  }, /*#__PURE__*/React.createElement(Input, {
    type: "tel"
  })), /*#__PURE__*/React.createElement(Field, {
    label: "State",
    required: true
  }, /*#__PURE__*/React.createElement(Select, {
    options: window.BHX_STATES
  })), /*#__PURE__*/React.createElement(Field, {
    label: "Where did you hear about us?",
    style: {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement(Select, {
    options: ["Referral from a Colleague or Business Partner", "Online Search (Google, Bing)", "LinkedIn", "Meta (Facebook, Instagram)", "Industry Event or Trade Show", "Webinar", "Email Campaign", "Sales Outreach (Call, Email, LinkedIn)", "Article, Blog, or Industry Publication", "Already a Brinks Home Partner", "Previously a Brinks Home Partner", "Other"]
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1 / -1"
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: "var(--font-heading)",
      fontSize: "var(--h6-size)",
      fontWeight: 600,
      textTransform: "uppercase",
      letterSpacing: "var(--caps-letter-spacing)",
      marginBottom: "var(--space-2)"
    }
  }, "Please select all that apply:"), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Interested in Becoming an Authorized Dealer"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Interested in Becoming a Direct Representative"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Interested in Selling Alarm Accounts"
  }), /*#__PURE__*/React.createElement(Checkbox, {
    label: "Interested in Other Partnership Opportunities"
  })), /*#__PURE__*/React.createElement("p", {
    style: {
      gridColumn: "1 / -1",
      fontFamily: "var(--font-body)",
      fontSize: "var(--text-small-size)",
      lineHeight: "var(--text-small-line)",
      color: "var(--text-body)",
      margin: "var(--space-3) 0"
    }
  }, "By clicking the \u201CGet Started\u201D button, you agree that Brinks Home may contact you at the phone number and/or email address provided by you via phone calls, text messages, and/or emails, using automated technology, for sales/marketing purposes or any other informational purposes. Your information is collected and used in accordance with our Privacy Policy. Your consent is not required to purchase any products or services."), /*#__PURE__*/React.createElement("div", {
    style: {
      gridColumn: "1 / -1",
      display: "flex",
      justifyContent: "center"
    }
  }, /*#__PURE__*/React.createElement(Button, {
    variant: "cta",
    size: "lg",
    onClick: () => {
      setDone(true);
      if (onSubmit) onSubmit();
    }
  }, "Get Started"))));
}
Object.assign(window, {
  H2,
  P,
  Hero,
  FeatureRow,
  Testimonials,
  Awards,
  ResourcesStrip,
  FaqSection,
  LeadForm
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bhx/Shared.jsx", error: String((e && e.message) || e) }); }

// ui_kits/bhx/data.js
try { (() => {
window.BHX_IMG = {
  "hero": "https://images.ctfassets.net/n58cc9djl3c5/1LEILRh4H9BzaBiMs4TNXH/a764f21a1e75bd6de512eb7bd0115005/BHX_Man_on_Phone_1.webp?w=1360",
  "heroDealer": "https://images.ctfassets.net/n58cc9djl3c5/2q55msW41xIa0Jzn5hpyvw/8b423ce51ee7f5dc6c35dc7f5317d034/BHX_Man_on_Phone_1.png?w=1360",
  "dealer": "https://images.ctfassets.net/n58cc9djl3c5/7DONhOWqByxmwZhN0chwxD/0752c0ec225239d3d0b8778430275443/Dealer_Program.webp",
  "direct": "https://images.ctfassets.net/n58cc9djl3c5/2v0bJqg4DExAKj8ZpneVkl/c85d1ecf18332c0f189d804a1e3e8931/Direct_Program.webp",
  "sell": "https://images.ctfassets.net/n58cc9djl3c5/1fSUmXltTePJfQV1VvsSKO/4b3ba90d970f4c829a18668aebc8a6c7/Sell_Accounts.webp",
  "acq": "https://images.ctfassets.net/n58cc9djl3c5/2vIBu399iS1HQLaPKXAht2/9895c397d75ca28abc0e5c11745515a1/Business_Acquisition.webp",
  "ent": "https://images.ctfassets.net/n58cc9djl3c5/1fARx8NN8A63sFL5beedwR/9578de4524f5707e2fe7c8045b84ba49/Enterprise_Program.webp",
  "phone": "https://images.ctfassets.net/n58cc9djl3c5/nUWNy9GIBNiLon5OHH6t2/2a1a9d2e2cd0088dbafb4461c6965ad8/bhxPhone.png",
  "list": "https://images.ctfassets.net/n58cc9djl3c5/6vBLdJA5vf1xcBKsh3AAjg/7df66e85b4ca9d5a3b52e824144105f6/bxh-list.png",
  "headset": "https://images.ctfassets.net/n58cc9djl3c5/u4wDuP2Wrb8djtiH4tU7h/5897944810fd519bc69b06caa9dab3e9/bhx-headset.png",
  "shieldIcon": "https://images.ctfassets.net/n58cc9djl3c5/3T0vGPhACNGdBhynlFa7QO/e64ea8b956c488cf44fe7124bc4cb372/BH_icons.png",
  "handshakeIcon": "https://images.ctfassets.net/n58cc9djl3c5/1LhfUoUVtIFo8nER4eNiv6/e1b564e60605b71a5455e953dd426493/BH_icons.png",
  "headsetIcon": "https://images.ctfassets.net/n58cc9djl3c5/1pZQOU0da3KPYS4RwfzUUp/349ad9a0ab736aad984dec89622eb5c6/BH_icons.png",
  "skyline": "https://images.ctfassets.net/n58cc9djl3c5/Nu0ixNhAdEkm9EihjYwSV/9e4939b5d280d161de37bc15726e2e14/logo-1-1-.webp",
  "protect": "https://images.ctfassets.net/n58cc9djl3c5/3kkszqjDwP7ASnsIuMQVfV/c0e107adb15dc213c6f9d3dbf389c30e/logo-2-1-.webp",
  "secure": "https://images.ctfassets.net/n58cc9djl3c5/4pAjYv75aZNrc4BU6np17e/9f92547cfcfa6f12cee0d78a16829720/logo-3-1-.webp",
  "a1": "https://images.ctfassets.net/n58cc9djl3c5/1j5gZf7qJkL6nwarwAEXSH/58305c54de1f19d13c058d17912ade82/2025_readers_choice_logo_final_Desktop.webp?w=400",
  "a2": "https://images.ctfassets.net/n58cc9djl3c5/22xHWgpH6CGfRbO88M8rVw/21dd8b230fde4ca3c98f5530c277ca65/usa_today_Most_trusted_logo_desktop.webp?w=400",
  "a3": "https://images.ctfassets.net/n58cc9djl3c5/T9omhK7E1TTxbKftlIgnN/dd46e119d82c3d971764474edc697ac7/usa_today_logo_desktop.webp?w=400",
  "a4": "https://images.ctfassets.net/n58cc9djl3c5/t53fb2d7L7QwC6uP8BdcH/c92ade793b3b3a5a561a059805e86e71/TMA_Five_Diamond.webp?w=400",
  "a5": "https://images.ctfassets.net/n58cc9djl3c5/4LATmPUyWZ56NujNZv9Plf/eb94b6a18388893de82200d1563ac869/bbb.webp?w=400",
  "a6": "https://images.ctfassets.net/n58cc9djl3c5/2aRsAu3bSJTFcq1abJ1A26/74ca733f4c352aed1e31a5cde27a5789/5_start_logo_Desktop.webp?w=400",
  "b1": "https://images.ctfassets.net/n58cc9djl3c5/1Ch3HxXFx0brh0KOQ5rh25/d507a72b97335ad03a38618a5d3d6ada/Rev_share_vs_1_time_payment.webp",
  "b2": "https://images.ctfassets.net/n58cc9djl3c5/7mK4toPmHQYoNUYH0WsJd6/5085bec9d1c66f1d4a4832d3fc1c9746/Managing_Customer_Attrition_in_an_RMR_Business.webp",
  "b3": "https://images.ctfassets.net/n58cc9djl3c5/6z3ugjneDxaFZfQ5IN3GZJ/316eeafecf57755be744a854fb003b72/Closing_the_Deal_Proven_Strategies_for_Selling_Home_Security_Door_to_Door.webp",
  "b4": "https://images.ctfassets.net/n58cc9djl3c5/5QrdGdqFqcPO2fc8hio0uH/84779d907f0f7e0a6db86d9082ffef86/Top_5_Home_Automation.webp",
  "events": "https://images.ctfassets.net/n58cc9djl3c5/TROCHcwmEAg0cKE2ZK6Ou/1f83af737c79f0ebc2eb20c2044d1e15/3-people-standing-by-a-dallas-cowboys-logo-statue.webp?w=1360"
};
window.BHX_NAV = [{
  label: "Direct Program",
  href: "#/direct-program"
}, {
  label: "Dealer Program",
  href: "#/dealer-program"
}, {
  label: "Enterprise Partners",
  href: "#/enterprise-partners"
}, {
  label: "Sell Accounts",
  href: "#",
  children: [{
    label: "Sell Alarm Accounts",
    href: "#/sell-accounts"
  }, {
    label: "Sell Your Business",
    href: "#/sell-your-business"
  }, {
    label: "How Selling Works",
    href: "#/how-it-works"
  }]
}, {
  label: "Resources",
  href: "#/blog"
}];
window.BHX_STATES = ["AL", "AK", "AR", "AZ", "CA", "CO", "CT", "DC", "DE", "FL", "GA", "HI", "IA", "ID", "IL", "IN", "KS", "KY", "LA", "MA", "MD", "ME", "MI", "MN", "MO", "MS", "MT", "NC", "NE", "NH", "NJ", "NM", "NV", "NY", "ND", "OH", "OK", "OR", "PA", "RI", "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WI", "WV", "WY"];
window.BHX_FAQ = [{
  question: "What is the Brinks Home Authorized Dealer Program?",
  answer: "The Brinks Home Authorized Dealer program enables security and alarm monitoring dealers to align their business with a trusted name while maintaining their independent business. Dealers continue to service and manage their own accounts in their markets while enjoying dedicated support from Brinks Home."
}, {
  question: "What is the Brinks Home Direct Program?",
  answer: "The Brinks Home Direct program enables independent contractors and 1099 representatives to operate as Brinks Home. Direct partners have the opportunity to sell Brinks Home security products and services under our license, including conducting door-to-door sales to reach new customers."
}, {
  question: "Which Home Security Partner Program should I join? What are the differences between them?",
  answer: "Both programs offer opportunities to expand your service offerings by selling Brinks Home products and services. A key difference is that Brinks Home Authorized Dealers operate their own business and may have their own brands, while Brinks Home Direct enables selling under the Brinks Home license."
}, {
  question: "How does the process of selling accounts work?",
  answer: "It starts with using our advanced Account Value Calculator (AVC) for a fair, free estimate for your portfolio. To improve your valuation and receive a more accurate quote, request our Account Valuation Template. Fill out the template and upload it, and someone from our Acquisitions team will contact you within two business days."
}, {
  question: "Are there other partnership opportunities with Brinks Home?",
  answer: "Yes! Contact us for additional ways to partner with Brinks Home, including enterprise opportunities."
}];
window.BHX_POSTS = [{
  image: window.BHX_IMG.b1,
  title: "Choosing Between a Traditional Upfront Payment and Revenue Sharing"
}, {
  image: window.BHX_IMG.b2,
  title: "Managing Customer Attrition in an RMR Business: Effective Strategies"
}, {
  image: window.BHX_IMG.b3,
  title: "Closing the Deal: Door-to-Door Sales for Home Security"
}, {
  image: window.BHX_IMG.b4,
  title: "Top 5 Essential Smart Features for Modern Homes"
}];
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/bhx/data.js", error: String((e && e.message) || e) }); }

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.LayeredHeading = __ds_scope.LayeredHeading;

__ds_ns.Logo = __ds_scope.Logo;

__ds_ns.Section = __ds_scope.Section;

__ds_ns.Steps = __ds_scope.Steps;

__ds_ns.Accordion = __ds_scope.Accordion;

__ds_ns.Modal = __ds_scope.Modal;

__ds_ns.Checkbox = __ds_scope.Checkbox;

__ds_ns.Field = __ds_scope.Field;

__ds_ns.FileUpload = __ds_scope.FileUpload;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.Select = __ds_scope.Select;

__ds_ns.Footer = __ds_scope.Footer;

__ds_ns.NavBar = __ds_scope.NavBar;

__ds_ns.Tabs = __ds_scope.Tabs;

})();
