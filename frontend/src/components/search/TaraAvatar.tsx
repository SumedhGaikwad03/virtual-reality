/*
 * PURPOSE:
 * Reusable visual avatar component for Tara (Property Discovery Advisor).
 *
 * FLOW:
 * Assistant Presentation Flow: AssistantHeader / ConversationMessages / Overlay -> TaraAvatar.
 *
 * RESPONSIBILITY:
 * Renders Tara's calm, architectural visual token with responsive size presets and custom image support.
 */

type TaraAvatarProps = {
  size?: "sm" | "md" | "lg";
  className?: string;
  src?: string;
  alt?: string;
};

export function TaraAvatar({
  size = "md",
  className = "",
  src,
  alt = "Tara · Property Discovery Advisor",
}: TaraAvatarProps) {
  const sizeClasses = {
    sm: "tara-avatar--sm",
    md: "tara-avatar--md",
    lg: "tara-avatar--lg",
  };

  if (src) {
    return (
      <div className={`tara-avatar ${sizeClasses[size]} ${className}`} aria-label={alt}>
        <img src={src} alt={alt} className="tara-avatar-img" />
      </div>
    );
  }

  return (
    <div
      className={`tara-avatar ${sizeClasses[size]} ${className}`}
      aria-label={alt}
      role="img"
    >
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="tara-avatar-svg"
      >
        <defs>
          <linearGradient id="taraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        {/* Background circle */}
        <circle cx="18" cy="18" r="18" fill="url(#taraGrad)" />
        {/* Subtle architectural arch */}
        <path
          d="M10 26V17C10 12.5817 13.5817 9 18 9C22.4183 9 26 12.5817 26 17V26"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Central warm discovery star */}
        <path
          d="M18 13.5L19.2 16.8L22.5 18L19.2 19.2L18 22.5L16.8 19.2L13.5 18L16.8 16.8L18 13.5Z"
          fill="#f8fafc"
        />
      </svg>
    </div>
  );
}
