import React from "react";

interface ShopNextLogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const ShopNextLogo: React.FC<ShopNextLogoProps> = ({ size = "md", className = "" }) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11"
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl"
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Shopping Cart Icon with dynamic upward growth arrow swoosh */}
      <div className={`relative flex items-center justify-center shrink-0 ${iconSizes[size]}`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-sm">
          {/* Orange Shopping Bag / Cart Outline */}
          <path
            d="M22 36H78L72 82C71.5 85.5 68.5 88 65 88H35C31.5 88 28.5 85.5 28 82L22 36Z"
            fill="#FF5722"
          />
          {/* Bag Handles */}
          <path
            d="M36 36V26C36 18.268 42.268 12 50 12C57.732 12 64 18.268 64 26V36"
            stroke="#FF5722"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Cart Grid Details */}
          <circle cx="40" cy="56" r="3" fill="white" />
          <circle cx="50" cy="56" r="3" fill="white" />
          <circle cx="60" cy="56" r="3" fill="white" />
          <circle cx="45" cy="68" r="3" fill="white" />
          <circle cx="55" cy="68" r="3" fill="white" />
          {/* Cyan/Blue Dynamic Upward Arrow Swoosh */}
          <path
            d="M20 75C26 62 42 42 76 22"
            stroke="#0284C7"
            strokeWidth="9"
            strokeLinecap="round"
          />
          {/* Arrow Head */}
          <path
            d="M62 18L84 20L82 42"
            stroke="#0284C7"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div className={`font-display font-extrabold tracking-tight flex items-baseline gap-0.5 ${textSizes[size]}`}>
        <span className="text-[#FF5722]">Shop</span>
        <span className="text-[#0284C7] font-black">GO</span>
      </div>
    </div>
  );
};

export const ShopGoLogo = ShopNextLogo;
