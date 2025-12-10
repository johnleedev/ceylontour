import React, { useMemo, useRef, useState } from 'react';

type CornerKey = 'tl' | 'tr' | 'bl' | 'br';
type Line = { from: CornerKey; to: CornerKey };

export default function Test() {
  const size = 320; // square size in px

  const [selected, setSelected] = useState<CornerKey | null>(null);
  const [lines, setLines] = useState<Line[]>([]);

  const [points, setPoints] = useState<Record<CornerKey, { x: number; y: number }>>({
    tl: { x: 0, y: 0 },
    tr: { x: size, y: 0 },
    bl: { x: 0, y: size },
    br: { x: size, y: size },
  });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [draggingKey, setDraggingKey] = useState<CornerKey | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const [dragMoved, setDragMoved] = useState(false);

  const handleDotClick = (corner: CornerKey) => {
    if (selected === null) {
      // Start a new selection; clear any existing line immediately
      setSelected(corner);
      setLines([]);
      return;
    }

    if (selected === corner) {
      setSelected(null);
      return;
    }

    // Add/replace line between two different corners (only one line visible)
    setLines([{ from: selected, to: corner }]);
    setSelected(null);
  };

  const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

  const handlePointerDown = (key: CornerKey, e: React.PointerEvent) => {
    e.preventDefault();
    setDraggingKey(key);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragMoved(false);
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingKey || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, size);
    const y = clamp(e.clientY - rect.top, 0, size);

    // Detect movement beyond a small threshold to suppress click
    if (dragStartRef.current) {
      const dx = Math.abs(e.clientX - dragStartRef.current.x);
      const dy = Math.abs(e.clientY - dragStartRef.current.y);
      if (!dragMoved && (dx > 2 || dy > 2)) setDragMoved(true);
    }

    setPoints((prev) => ({ ...prev, [draggingKey]: { x, y } }));
  };

  const handlePointerUp = () => {
    setDraggingKey(null);
    dragStartRef.current = null;
    // keep dragMoved state; it will be checked by onClick once
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f7f7f8',
      }}
    >
      <div
        ref={containerRef}
        style={{ position: 'relative', width: size, height: size }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Square background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'white',
            border: '2px solid #d0d5dd',
            borderRadius: 8,
            boxShadow:
              '0 1px 2px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.04)',
          }}
        />

        {/* SVG overlay for dashed lines */}
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          {lines.map((line, idx) => (
            <line
              key={`${line.from}-${line.to}-${idx}`}
              x1={points[line.from].x}
              y1={points[line.from].y}
              x2={points[line.to].x}
              y2={points[line.to].y}
              stroke="#667085"
              strokeWidth={2}
              strokeDasharray="6 6"
            />
          ))}
        </svg>

        {/* Corner dots */}
        {(
          [
            ['tl', 0, 0],
            ['tr', size, 0],
            ['bl', 0, size],
            ['br', size, size],
          ] as Array<[CornerKey, number, number]>
        ).map(([key]) => {
          const isSelected = selected === key;
          const { x, y } = points[key];
          return (
            <button
              key={key}
              onPointerDown={(e) => handlePointerDown(key, e)}
              onClick={(e) => {
                // If the button was dragged, suppress click-to-connect
                if (dragMoved) {
                  e.preventDefault();
                  e.stopPropagation();
                  setDragMoved(false);
                  return;
                }
                handleDotClick(key);
              }}
              aria-pressed={isSelected}
              aria-label={`Corner ${key}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
                width: 16,
                height: 16,
                borderRadius: '50%',
                border: isSelected ? '3px solid #155EEF' : '2px solid #344054',
                background: isSelected ? '#EFF4FF' : '#FFFFFF',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                outline: 'none',
              }}
            />
          );
        })}
      </div>
    </div>
  );
}