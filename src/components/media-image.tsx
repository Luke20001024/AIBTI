"use client";

import { useState } from "react";
import { withBasePath } from "../domain/paths";

type MediaImageProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  fallbackLabel?: string;
};

export function MediaImage({ fallbackLabel = "图像整理中", className, alt = "", ...props }: MediaImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`media-fallback ${className ?? ""}`} role="img" aria-label={`${alt}（${fallbackLabel}）`}>
        <span>{fallbackLabel}</span>
      </div>
    );
  }

  const src = typeof props.src === "string" ? withBasePath(props.src) : props.src;
  return <img {...props} src={src} className={className} alt={alt} onError={() => setFailed(true)} />;
}
