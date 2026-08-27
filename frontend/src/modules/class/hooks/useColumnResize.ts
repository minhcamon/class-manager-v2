import { useState, useCallback, useRef, useEffect } from "react";

interface UseColumnResizeOptions {
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  storageKey?: string;
}

export function useColumnResize({
  defaultWidth = 240,
  minWidth = 140,
  maxWidth = 360,
  storageKey = "cm_matrix_name_col_width",
}: UseColumnResizeOptions = {}) {
  const [colWidth, setColWidth] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed >= minWidth && parsed <= maxWidth) {
          return parsed;
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return defaultWidth;
  });

  const [isResizing, setIsResizing] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(colWidth);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const delta = e.clientX - startXRef.current;
      const nextWidth = Math.min(maxWidth, Math.max(minWidth, startWidthRef.current + delta));
      setColWidth(nextWidth);
    },
    [minWidth, maxWidth]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  }, [handleMouseMove]);

  const startResizing = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);
      startXRef.current = e.clientX;
      startWidthRef.current = colWidth;

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    },
    [colWidth, handleMouseMove, handleMouseUp]
  );

  // Sync to localStorage on width changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, String(colWidth));
    } catch {
      // Ignore localStorage errors
    }
  }, [colWidth, storageKey]);

  // Clean up listeners if unmounted during resize
  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  return {
    colWidth,
    isResizing,
    startResizing,
  };
}
