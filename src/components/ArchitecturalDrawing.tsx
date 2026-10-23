/** Construction graphique décorative : aucune cote ni dimension de projet. */
export function ArchitecturalDrawing({ className = '' }: { className?: string }) {
  return <svg className={`architectural-drawing ${className}`} viewBox="0 0 800 700" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
    <g className="drawing-guides">
      <path d="M68 38V658M732 38V658M28 92H772M28 610H772M400 18V674" />
      <path d="M58 82l20 20m-20 0 20-20M722 82l20 20m-20 0 20-20M58 600l20 20m-20 0 20-20M722 600l20 20m-20 0 20-20" />
      <path d="M48 350H752" strokeDasharray="5 9" />
    </g>
    <g className="drawing-contours">
      <circle className="drawing-circle" cx="400" cy="350" r="294" pathLength="1" />
      <path className="drawing-outline" d="M106 610V350a294 294 0 0 1 588 0v260H106Z" pathLength="1" />
      <path d="M385 350h30m-15-15v30M68 58H732M68 48v20m664-20v20" />
    </g>
  </svg>;
}
