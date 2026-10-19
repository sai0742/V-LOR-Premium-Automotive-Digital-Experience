/**
 * Global SVG filter definitions for the sketch-to-render image shader:
 * a Laplacian edge extraction (feConvolveMatrix) recoloured to charcoal and
 * warped by fractal noise so the overlay reads as hand-drawn pencil lines.
 */
export default function SvgDefs() {
  return (
    <svg className="svg-defs" aria-hidden="true" focusable="false">
      <defs>
        <filter
          id="velore-pencil"
          x="-4%"
          y="-4%"
          width="108%"
          height="108%"
          colorInterpolationFilters="sRGB"
        >
          <feConvolveMatrix
            order="3"
            kernelMatrix="-1 -1 -1 -1 8 -1 -1 -1 -1"
            preserveAlpha="false"
            edgeMode="duplicate"
            in="SourceGraphic"
            result="edges"
          />
          <feColorMatrix
            in="edges"
            type="matrix"
            values="0 0 0 0 0.102  0 0 0 0 0.094  0 0 0 0 0.090  0.34 0.34 0.34 0 0"
            result="ink"
          />
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.045"
            numOctaves="2"
            seed="7"
            result="warp"
          />
          <feDisplacementMap
            in="ink"
            in2="warp"
            scale="3.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
