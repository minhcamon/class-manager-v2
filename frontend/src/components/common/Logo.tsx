import { Link } from "react-router";
import { GraduationCap } from "lucide-react";

interface LogoProps {
  /**
   * Style variant of the logo.
   * - 'graduation' (default): GraduationCap icon + ClassManager text
   * - 'c-box': Letter 'C' in a box + ClassManager text
   * - 'text-only': ClassManager text only
   */
  variant?: "graduation" | "c-box" | "text-only";

  /**
   * HTML wrapper element type.
   * - 'link' (default): react-router Link component
   * - 'anchor': Standard <a> element
   * - 'div': Standard <div> element
   */
  as?: "link" | "anchor" | "div";

  /**
   * Target URL for 'link' and 'anchor' wrappers.
   */
  to?: string;

  /**
   * Optional className for the root wrapper element.
   * If omitted, default Tailwind classes matching the design system are applied.
   */
  className?: string;

  /**
   * Optional className for the brand text span.
   */
  textClassName?: string;

  /**
   * Background color of the 'C' box in the 'c-box' variant.
   * - 'primary' (default): bg-primary
   * - 'dark': bg-zinc-950
   */
  cBoxBg?: "primary" | "dark";
}

export default function Logo({
  variant = "graduation",
  as = "link",
  to,
  className = "",
  textClassName = "",
  cBoxBg = "primary",
}: LogoProps) {
  // Determine root container CSS classes if not overridden
  const getDefaultContainerClass = () => {
    if (variant === "graduation") {
      return "flex items-center gap-3";
    }
    if (variant === "c-box") {
      return cBoxBg === "dark" 
        ? "flex items-center gap-2" 
        : "flex items-center gap-2.5 text-xl font-bold text-neutral-900 no-underline";
    }
    return "inline-block";
  };

  const containerClassName = className || getDefaultContainerClass();

  // Render the inner content of the logo
  const renderContent = () => {
    if (variant === "text-only") {
      return (
        <span className={textClassName || "text-xl font-extrabold text-[#1F6C9F] tracking-tight"}>
          ClassManager
        </span>
      );
    }

    if (variant === "c-box") {
      const bgClass = cBoxBg === "dark" ? "bg-zinc-950" : "bg-primary";
      const roundedClass = cBoxBg === "dark" ? "rounded-lg" : "rounded-[6px]";
      const innerTextClass = cBoxBg === "dark" 
        ? "text-lg font-bold text-foreground tracking-tight" 
        : "";

      return (
        <>
          <div className={`w-8 h-8 ${bgClass} ${roundedClass} flex items-center justify-center shrink-0`}>
            <span className="text-white font-extrabold text-lg">C</span>
          </div>
          <span className={textClassName || innerTextClass || "font-bold text-neutral-900 tracking-tight"}>
            ClassManager
          </span>
        </>
      );
    }

    // Default: 'graduation'
    return (
      <>
        <div className="p-2 bg-primary text-white rounded-xl shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <span className={textClassName || "font-extrabold text-neutral-900 tracking-tight text-xl"}>
          ClassManager
        </span>
      </>
    );
  };

  // Render wrapper element
  if (as === "link" && to) {
    return (
      <Link to={to} className={containerClassName}>
        {renderContent()}
      </Link>
    );
  }

  if (as === "anchor" && to) {
    return (
      <a href={to} className={containerClassName}>
        {renderContent()}
      </a>
    );
  }

  return (
    <div className={containerClassName}>
      {renderContent()}
    </div>
  );
}
