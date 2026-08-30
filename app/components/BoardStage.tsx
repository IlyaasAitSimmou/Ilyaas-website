"use client";

/**
 * Client boundary for the 3D viewer.
 *
 * three.js plus the board geometry is by far the heaviest thing on the page, so
 * it is code-split and mounted client-side only. The rest of the hero — headline
 * and featured projects — renders and is readable before any of this arrives.
 */

import dynamic from "next/dynamic";

const FlightComputerViewer = dynamic(() => import("./FlightComputerViewer"), {
  ssr: false,
  loading: () => <div aria-hidden="true" />,
});

export default function BoardStage() {
  return <FlightComputerViewer />;
}
