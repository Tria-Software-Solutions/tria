// Abstract geometric SVG shapes for the premium aesthetic
// No cartoons, only clean geometry

export const GridPattern = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern
        id="grid"
        width="60"
        height="60"
        patternUnits="userSpaceOnUse"
      >
        <path
          d="M 60 0 L 0 0 0 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.15"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

export const DiagonalLines = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    width="100%"
    height="100%"
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    <defs>
      <pattern
        id="diagonal"
        width="40"
        height="40"
        patternUnits="userSpaceOnUse"
        patternTransform="rotate(45)"
      >
        <line
          x1="0"
          y1="0"
          x2="0"
          y2="40"
          stroke="currentColor"
          strokeWidth="0.5"
          opacity="0.1"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#diagonal)" />
  </svg>
);

export const GeometricCircle = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="100"
      cy="100"
      r="80"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.2"
    />
    <circle
      cx="100"
      cy="100"
      r="60"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.15"
    />
    <circle
      cx="100"
      cy="100"
      r="40"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.1"
    />
  </svg>
);

export const DataFlowLines = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 400 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Horizontal data flow lines */}
    {[0, 1, 2, 3, 4].map((i) => (
      <g key={i} opacity={0.15 - i * 0.02}>
        <path
          d={`M 0 ${50 + i * 50} Q 100 ${40 + i * 50} 200 ${50 + i * 50} T 400 ${50 + i * 50}`}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        />
        <circle cx={50 + i * 80} cy={50 + i * 50} r="2" fill="currentColor" />
        <circle cx={150 + i * 60} cy={50 + i * 50} r="2" fill="currentColor" />
      </g>
    ))}
  </svg>
);

export const HexagonGrid = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 300 260"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <polygon
        id="hex"
        points="25,0 50,14.4 50,43.3 25,57.7 0,43.3 0,14.4"
      />
    </defs>
    {[0, 1, 2, 3].map((row) =>
      [0, 1, 2, 3, 4].map((col) => {
        const x = col * 55 + (row % 2) * 27.5;
        const y = row * 48;
        return (
          <use
            key={`${row}-${col}`}
            href="#hex"
            x={x}
            y={y}
            stroke="currentColor"
            strokeWidth="0.5"
            fill="none"
            opacity={0.1 + (Math.random() * 0.1)}
          />
        );
      })
    )}
  </svg>
);

export const ProcessingIndicator = ({ className = '' }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 120 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Minimal processing rings */}
    <circle
      cx="60"
      cy="60"
      r="50"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.2"
      strokeDasharray="4 4"
    />
    <circle
      cx="60"
      cy="60"
      r="35"
      stroke="currentColor"
      strokeWidth="1"
      opacity="0.3"
    />
    <circle
      cx="60"
      cy="60"
      r="20"
      fill="currentColor"
      opacity="0.1"
    />
    <circle
      cx="60"
      cy="60"
      r="8"
      fill="currentColor"
      opacity="0.8"
    />
  </svg>
);
