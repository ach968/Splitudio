"use client";

// CHATGPT AHHH CODE


import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";

interface KnobProps {
  value: number;
  onChange: (newValue: number) => void;
  size?: number; // in pixels, default to 100
  className?: string
}

export default function Knob({ className, value, onChange, size = 100 }: KnobProps) {
  const knobRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  // Define the angular range for the knob (in degrees)
  const minAngle = -45;
  const maxAngle = 225;
  // Map value (0 to 1) to an angle
  const angle = minAngle + (maxAngle - minAngle) * value;

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragging || !knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const radians = Math.atan2(dy, dx);
    let deg = radians * (180 / Math.PI);
    // Adjust so that 0° is at the top of the knob
    deg = deg + 90;
    // Clamp the degree value to our defined range
    if (deg < minAngle) deg = minAngle;
    if (deg > maxAngle) deg = maxAngle;
    // Convert angle back to a value between 0 and 1.
    const newValue = (deg - minAngle) / (maxAngle - minAngle);
    console.log(newValue)
    onChange(newValue);
  };

  const handleMouseUp = () => {
    setDragging(false);
  };

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging]);

  return (
    <div
      ref={knobRef}
      onMouseDown={handleMouseDown}
      className={twMerge("bg-gray-700 rounded-full flex items-center justify-center cursor-pointer select-none", className)}
      style={{ width: size, height: size, position: "relative" }}
    >
      {/* Knob indicator */}
      <div
      className="rounded-full bg-white"
        style={{
          width: size / 6,
          height: size / 2.5,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: `translate(-50%, -100%) rotate(${angle}deg) `,
          transformOrigin: "50% 100%",
        }}
      />
      {/* <div
      style={{
        width: size / 8,
        height: size / 2,
        background: "#333",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -100%) rotate(${angle}deg) `,
        transformOrigin: "50% 100%",
        borderRadius: "2px",
      }}></div> */}
    </div>
  );
}
