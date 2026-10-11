import React from 'react';
const paths={
 users:<><circle cx="9" cy="8" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6M21 21v-3a6 6 0 0 0-3-5"/></>,
 orders:<><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1M9 9h6M9 13h6M9 17h4"/></>,
 operational:<><rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 10h18M9 10v10M15 10v10"/></>,
 lines:<><rect x="6" y="3" width="12" height="18" rx="2"/><path d="M10 3v4h8M9 12h6v5H9zM12 12v5"/></>,
 'operational-analysis':<><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 15v-3M12 15V8M17 15v-5"/></>,
 imports:<><path d="M12 15V3M8 7l4-4 4 4M4 14v5a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5"/></>,
 info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
 close:<path d="m6 6 12 12M18 6 6 18"/>,
 left:<path d="m14 6-6 6 6 6"/>,right:<path d="m10 6 6 6-6 6"/>,up:<path d="m6 14 6-6 6 6"/>,down:<path d="m6 10 6 6 6-6"/>
};
export function Icon({name,size=18}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">{paths[name]||paths.info}</svg>;}
