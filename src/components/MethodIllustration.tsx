type Stage = 'quote' | 'design' | 'review' | 'works';

/** Documents et échanges illustrés ; aucun devis ou livrable client réel. */
export function MethodIllustration({ stage }: { stage: Stage }) {
  return <svg className={`method-illustration method-illustration-${stage}`} viewBox="0 0 220 160" fill="none" aria-hidden="true" focusable="false">
    <path className="method-guide" d="M10 137h200M22 13v134m176-110v110M17 21h10m-5-5v10" />
    {stage === 'quote' && <>
      <path className="method-paper-back" d="m61 14 116 8-8 125-116-8Z" />
      <path className="method-paper" d="m43 28 117-9 9 123-117 9Z" />
      <g transform="rotate(-4 105 85)"><path className="method-strong" d="M65 46h54" /><path d="M65 55h35m-35 18h7m8 0h54m-69 15h7m8 0h54m-69 15h7m8 0h36M65 118h69" /><path className="method-signature" d="m89 133 7-7-3 8 14-6-4 5 14-2" /></g>
      <path className="method-tool" d="m174 43 8 3-26 73-8 8 1-12Z" /><path d="m174 43 3-8 8 3-3 8m-33 69 7 4" />
    </>}
    {stage === 'design' && <>
      <path className="method-paper-back" d="M47 19h139v117H47Z" /><path className="method-paper" d="M34 28h140v117H34Z" />
      <path d="M43 41h38m-38 6h23M143 19v-7h29v7m-19 0v-7" />
      <path className="method-room-floor" d="m63 100 53-25 40 24-53 26Z" /><path className="method-room-wall" d="M63 100V63l53-25v37Zm53-25V38l40 24v37Z" />
      <path d="m79 80 22-11 19 11-22 11Zm0 0v9l19 11 22-11v-9m-22 11v9M131 63v15l12 7V70Z" />
      <path className="method-paper" d="M18 91h51v51H18Z" /><path d="M25 99h35v35H25Zm0 19h20v16m0-35v10m0 9h15" />
      <rect className="method-swatch-one" x="86" y="135" width="18" height="16" /><rect className="method-swatch-two" x="109" y="135" width="18" height="16" /><rect className="method-swatch-three" x="132" y="135" width="18" height="16" />
    </>}
    {stage === 'review' && <>
      <circle cx="31" cy="52" r="11" /><path d="M12 84c0-19 38-19 38 0m-25-13 6 8 6-8" />
      <circle cx="186" cy="52" r="11" /><path d="M167 84c0-19 38-19 38 0m-25-13 6 8 6-8" />
      <path className="method-dialogue" d="M61 23h70v31H96L83 64V54H61Z" /><path d="M71 33h49m-49 9h30" />
      <path className="method-paper" d="m56 80 94-8 7 70-94 8Z" /><path d="m70 92 66-5 4 43-66 5Zm1 20 26-2 2 24m-3-44 1 11m10 8 31-2" />
      <path className="method-guide" d="m46 91 16 13m105-13-18 13" />
      <circle className="method-approval" cx="154" cy="124" r="20" /><path className="method-check" d="m145 124 6 6 12-13" />
    </>}
    {stage === 'works' && <>
      <path className="method-room-floor" d="m35 112 71-34 80 40-71 34Z" /><path className="method-room-wall" d="M35 112V56l71-34v56Zm71-34V22l80 40v56Z" />
      <path d="m51 62 36-17v35L51 97Zm18-9v36m-18-9 36-17m35-19 45 22v30l-45-22Z" />
      <path className="method-strong" d="m57 111 49-24 57 29m-80 4 47-23m-23 35 47-23" />
      <path className="method-tool" d="m17 108 12-5 14 34-12 5Z" /><path d="m22 117 8-3m-4 12 8-3m-2 12 7-3" />
      <path className="method-paper" d="M163 20h26v13h-26Z" /><path d="M176 33v13h-15v21m-4 0h8v25h-8Z" />
    </>}
  </svg>;
}
