type Props = {
  className?: string;
  alt?: string;
};

/**
 * The WorkNest logo lockup (emblem + wordmark) served from `public/logo.png`.
 * Sizing is controlled per context through the `.brand-logo` CSS class.
 */
export function BrandLogo({ className = "", alt = "WorkNest" }: Props) {
  return (
    <img
      className={`brand-logo ${className}`.trim()}
      src="/logo.png"
      alt={alt}
      draggable={false}
    />
  );
}
