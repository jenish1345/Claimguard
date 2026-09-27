export function Hero({ poster }: { poster: string }) {
  return (
    <>
      <div className="nvs" aria-hidden="true" />
      <canvas className="gl" />
      <img className="boot" src={poster} fetchPriority="high" alt="" aria-hidden="true" />
      <p className="boot-note" aria-hidden="true">
        The film is loading
        <b />
      </p>
      <svg className="inkdef" aria-hidden="true">
        <defs>
          <filter
            id="inkf"
            x="-18%"
            y="-30%"
            width="136%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.011 0.017"
              numOctaves={4}
              seed={9}
              result="cl"
            />
            <feColorMatrix
              in="cl"
              type="matrix"
              result="clA"
              values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
            />
            <feComponentTransfer in="clA" result="m">
              <feFuncA type="linear" slope={9} intercept={1} />
            </feComponentTransfer>
            <feDisplacementMap
              in="SourceGraphic"
              in2="cl"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="G"
              result="warp"
            />
            <feComposite in="warp" in2="m" operator="in" />
          </filter>
          <filter
            id="fqTear"
            x="-30%"
            y="-30%"
            width="160%"
            height="160%"
            colorInterpolationFilters="sRGB"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.016 0.021"
              numOctaves={3}
              seed={11}
              result="t1"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="t1"
              scale={23}
              xChannelSelector="R"
              yChannelSelector="G"
              result="d1"
            />
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.075"
              numOctaves={2}
              seed={4}
              result="t2"
            />
            <feDisplacementMap in="d1" in2="t2" scale={7} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
    </>
  );
}
