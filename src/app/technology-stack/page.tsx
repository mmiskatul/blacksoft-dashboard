'use client';

import React, { useMemo, useRef, useState } from 'react';
import { uploadImageToCloudinary } from '../../utils/apiClient';
import {
  addTechnologyStackCard,
  deleteTechnologyStackCard,
  setTechnologyStackSettings,
  updateTechnologyStackCard,
  useTechnologyStackCards,
  useTechnologyStackSettings,
  type TechnologyStackCard,
  type TechnologyStackIconKey,
} from '../../utils/technologyStackStore';
import { useSiteConfig } from '../../utils/configStore';

// ─── SVG Icon Renderer with Official Brands ──────────────────────────────────

function renderIcon(iconKey: TechnologyStackIconKey, size = 18, title = '') {
  const norm = title.toLowerCase().trim();
  const iconProps = {
    xmlns: 'http://www.w3.org/2000/svg',
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '2',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { width: `${size}px`, height: `${size}px` },
  };

  // 1. Figma
  if (norm.includes('figma')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 2h4v8H8a4 4 0 1 1 0-8z" fill="#F24E1E"/>
        <path d="M12 2h4a4 4 0 1 1-4 4V2z" fill="#FF7262"/>
        <path d="M8 10h4v4H8a4 4 0 1 1 0-8z" fill="#A259FF"/>
        <path d="M8 18a4 4 0 0 1 4-4v4a4 4 0 1 1-8 0 4 4 0 0 1 4-4z" fill="#1ABC9C"/>
        <path d="M12 10a4 4 0 1 1 8 0 4 4 0 0 1-8 0z" fill="#0ACF83"/>
      </svg>
    );
  }

  // 2. React
  if (norm.includes('react')) {
    return (
      <svg style={iconProps.style} viewBox="-11.5 -10.23 23 20.46" xmlns="http://www.w3.org/2000/svg">
        <circle cx="0" cy="0" r="2.05" fill="#61dafb"/>
        <g stroke="#61dafb" strokeWidth="1" fill="none">
          <ellipse rx="11" ry="4.2"/>
          <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
          <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
        </g>
      </svg>
    );
  }

  // 3. Next.js
  if (norm.includes('next.js') || norm.includes('nextjs')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 180 180" xmlns="http://www.w3.org/2000/svg">
        <circle cx="90" cy="90" r="90" fill="#000"/>
        <path d="M149.5 157.5L86.1 70.3H74.1v43.4h9.6V81.3l56.2 76.9c3.5-4.3 6.7-9 9.6-14zM83.7 113.7h9.6V90l-9.6-13.1v36.8z" fill="#fff"/>
      </svg>
    );
  }

  // 4. Angular
  if (norm.includes('angular')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 250 250" xmlns="http://www.w3.org/2000/svg">
        <polygon points="125,30 125,30 125,30 31.9,63.2 46.1,186.3 125,230 125,230 125,230 203.9,186.3 218.1,63.2" fill="#DD0031"/>
        <polygon points="125,30 125,52.2 125,230 203.9,186.3 218.1,63.2" fill="#C3002F"/>
        <path d="M125,52.1L66.8,182.6h21.7l11.7-29.2h49.7l11.7,29.2h21.7L125,52.1z M113.6,135.5l11.4-28.5l11.4,28.5H113.6z" fill="#FFFFFF"/>
      </svg>
    );
  }

  // 5. Vue
  if (norm.includes('vue')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 196.32 170.02" xmlns="http://www.w3.org/2000/svg">
        <path d="M121.05,0L98.16,39.65L75.27,0H0l98.16,170.02L196.32,0H121.05z" fill="#41B883"/>
        <path d="M121.05,0L98.16,39.65L75.27,0H38.75l59.41,102.91L157.57,0H121.05z" fill="#35495E"/>
      </svg>
    );
  }

  // 6. Svelte
  if (norm.includes('svelte')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path fill="#FF3E00" d="M18.8 14.8c-.8-1.5-2-2-3-2.3l-2-.5c-.8-.2-1.3-.4-1.6-.7-.3-.3-.4-.7-.4-1.2 0-.6.2-1 .7-1.3.5-.3 1.2-.5 2-.5 1 0 1.7.2 2.2.6.5.4 1 1 1 1.8l3-.3c-.2-1.6-1-2.8-2.2-3.7C17.3 6.6 15.6 6 13.7 6c-2 0-3.6.5-4.8 1.6C7.7 8.7 7 10 7 11.8c0 1.7.6 3 1.8 3.8 1 .8 2.5 1.2 4.2 1.6l1.7.4c1 .2 1.6.5 2 .9.4.4.5 1 .5 1.7 0 .8-.4 1.5-1.1 2-.7.5-1.7.7-3 .7-1.3 0-2.3-.3-3.1-1-.8-.7-1.2-1.7-1.3-3.1l-3 .3c.2 2.2 1.1 3.8 2.7 5 1.6 1 3.7 1.6 6 1.6 2.3 0 4.2-.6 5.5-1.8 1.4-1.2 2-2.8 2-4.8 0-1.8-.7-3.2-1.9-4.2z"/>
      </svg>
    );
  }

  // 7. TypeScript
  if (norm.includes('typescript') || norm === 'ts') {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#3178c6" rx="3"/>
        <path d="M12.92 18.29c.12-.11.23-.21.31-.3s.18-.21.26-.35.15-.31.19-.51.06-.44.06-.72V8.47h2.24v8.11c0 .54-.08 1.01-.24 1.41a3.02 3.02 0 0 1-.72 1.08c-.34.31-.79.55-1.33.7s-1.17.23-1.89.23c-.76 0-1.42-.09-2-.27s-1.07-.46-1.48-.82l1.19-1.57c.28.23.6.41.94.53s.73.18 1.17.18c.55 0 .96-.08 1.25-.23s.51-.36.6-.62M18.8 6.55c.34.22.62.53.84.92s.33.87.33 1.44c0 .56-.11 1.04-.33 1.44s-.53.71-.92.93a4.01 4.01 0 0 1-1.41.33v.09c.61.1 1.1.33 1.47.7s.55.9.55 1.57c0 .65-.13 1.19-.38 1.61s-.6.76-1.04 1.01-1 .38-1.66.38c-.73 0-1.38-.13-1.94-.38s-.99-.61-1.3-.1c-.3-.49-.46-1.09-.47-1.8H15c0 .48.11.85.34 1.11s.57.39 1 .39c.39 0 .69-.09.9-.28s.32-.47.32-.85c0-.39-.12-.68-.35-.87s-.6-.28-1.12-.28h-.87v-1.88h.8c.48 0 .84-.09 1.06-.27s.33-.45.33-.81c0-.35-.1-.62-.31-.8s-.52-.27-.92-.27c-.36 0-.66.08-.9.23s-.41.38-.51.68h-2.18c.1-.82.43-1.46.99-1.92s1.33-.69 2.31-.69c.89 0 1.65.18 2.27.55z" fill="#fff"/>
      </svg>
    );
  }

  // 8. Tailwind
  if (norm.includes('tailwind')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.001 4.8c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624C13.666 10.618 15.027 12 18.001 12c3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C16.337 6.182 14.976 4.8 12.001 4.8zm-6 7.2c-3.2 0-5.2 1.6-6 4.8 1.2-1.6 2.6-2.2 4.2-1.8.913.228 1.565.89 2.288 1.624 1.177 1.194 2.538 2.576 5.512 2.576 3.2 0 5.2-1.6 6-4.8-1.2 1.6-2.6 2.2-4.2 1.8-.913-.228-1.565-.89-2.288-1.624C10.337 13.382 8.976 12 6.001 12z" fill="#06B6D4"/>
      </svg>
    );
  }

  // 9. Vite
  if (norm.includes('vite')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.85 3l-7.79 14.28L4.26 3H2l10.06 18.45L22.12 3z" fill="#BD34FE"/>
        <path d="M18.06 3l-5.75 10.53L6.56 3H2l10.06 18.45L22.12 3z" fill="#FFC517"/>
      </svg>
    );
  }

  // 10. Flutter
  if (norm.includes('flutter')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.314 0L2.3 12l3.6 3.6 14.4-14.4h-6zM20.3 12.016l-3.6-3.6-8.384 8.384 3.6 3.6L20.3 12.016z" fill="#02569B"/>
        <path d="M20.3 20.416l-3.6-3.6-4.784 4.784h7.2c.59 0 1.184-.59 1.184-1.184v-.004z" fill="#0175C2"/>
      </svg>
    );
  }

  // 11. Kotlin
  if (norm.includes('kotlin')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 24H0V0h24L12 12z" fill="url(#kotlin-grad-dash)"/>
        <defs>
          <linearGradient id="kotlin-grad-dash" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#E24429"/>
            <stop offset="10%" stopColor="#E24429"/>
            <stop offset="30%" stopColor="#AD29B6"/>
            <stop offset="70%" stopColor="#AD29B6"/>
            <stop offset="100%" stopColor="#00AEEF"/>
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // 12. Swift
  if (norm.includes('swift')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M23.125 15.65c-.218-.328-.596-.75-.953-1.077-1.157-.962-2.73-1.89-3.928-2.316.714.478 1.637 1.168 2.053 1.693-1.89-1.282-4.14-2.115-5.932-2.38.835.534 1.83 1.258 2.213 1.815-2.283-1.39-4.833-2.072-7.23-2.096 1.05.614 2.26 1.488 2.656 2.158-3.033-1.425-6.28-1.748-9.48-1.503 1.428.847 3.328 2.28 3.824 3.195-3.06-.554-6.26.152-8.324 1.764.088-.06.183-.118.272-.178.68-.456 1.8-.938 2.8-.938.887 0 1.956.452 2.766 1.055C4.2 16.942 2.2 18.942.2 21.942c1.78-.973 3.65-1.47 5.378-1.47 2.128 0 3.992.835 5.568 1.996.892.68 1.705 1.528 2.668 1.528.8 0 1.492-.57 2.092-1.353.486-.633 1.344-1.92 2.502-3.238.825-.928 2.08-2.078 3.14-2.825.592-.417 1.1-.736 1.577-.925z" fill="#FA7343"/>
      </svg>
    );
  }

  // 13. Java
  if (norm === 'java' || norm.includes('java (')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.33 16.18c0 .24-.22.44-.65.6a14.7 14.7 0 0 1-5.18.78c-2.4 0-4.66-.46-5.83-1.02a2.3 2.3 0 0 1-1.05-1.07V15.2c.45.36 1.43.68 2.94.94 1.35.23 2.9.36 4.45.36 2.09 0 4.01-.22 4.96-.54.34-.11.45-.25.43-.37-.02-.12-.22-.26-.64-.4v-.3a2.9 2.9 0 0 1 1-.7v1.89zm.41-3.2c0 .25-.26.46-.78.62a14.3 14.3 0 0 1-5.69.83c-2.58 0-4.99-.49-6.26-1.09a2.5 2.5 0 0 1-1.12-1.14v-.23c.48.38 1.54.72 3.16 1 1.45.25 3.11.38 4.77.38 2.25 0 4.31-.24 5.33-.58.37-.12.48-.27.46-.4-.02-.13-.23-.28-.69-.42v-.3a3.1 3.1 0 0 1 1.1-.74l-.38 2.07zm-1.89-6.32l-.25.5c2.3 2.1 2.35 4.67 1.05 5.56-.54.38-1.25.4-2.04.09.28.33.51.72.67 1.14.92.35 1.83.33 2.57-.18 1.88-1.29 1.76-4.64-2-7.11zm-5.06-2.5l-.25.51c1.55 1.5 2 3.5 1.25 4.54-.5.7-1.4.9-2.4.63.38.38.68.86.87 1.39 1.22.45 2.34.25 3-.62 1.13-1.5.5-4.43-2.47-6.97zM20 22a20 20 0 0 1-16 0c0-1 4-2 8-2s8 1 8 2z" fill="#007396"/>
      </svg>
    );
  }

  // 14. Node.js
  if (norm.includes('node')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7v10l9 5 9-5V7l-9-5zm7.3 14.2l-7.3 4.1-7.3-4.1V8.8l7.3-4.1 7.3 4.1v7.4z" fill="#339933"/>
      </svg>
    );
  }

  // 15. NestJS
  if (norm.includes('nest')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm8 14.5l-8 4.1-8-4.1V8.5l8-4.1 8 4.1v8z" fill="#E0234E"/>
      </svg>
    );
  }

  // 16. Express
  if (norm.includes('express')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#3c3c3c" rx="4"/>
        <text x="50%" y="62%" dominantBaseline="middle" textAnchor="middle" fontWeight="bold" fontFamily="sans-serif" fill="#fff" fontSize="10">ex</text>
      </svg>
    );
  }

  // 17. FastAPI
  if (norm.includes('fastapi')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 22h9l1-8h9L12 2z" fill="#05998B"/>
      </svg>
    );
  }

  // 18. Django
  if (norm.includes('django')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 4v14l10 4 10-4V4l-10-2zm7 14h-3v-4.5c0-.83-.67-1.5-1.5-1.5h-1v6h-3V7.5c0-.83.67-1.5 1.5-1.5h2c2.2 0 4 1.8 4 4V16z" fill="#092E20"/>
      </svg>
    );
  }

  // 19. Spring Boot
  if (norm.includes('spring')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm4.8 7.3c-.6 2-2.1 3.5-4.1 4.1A6.7 6.7 0 0 1 8.6 9.3c.6-2 2.1-3.5 4.1-4.1a6.7 6.7 0 0 1 4.1 4.1z" fill="#6DB33F"/>
      </svg>
    );
  }

  // 20. Laravel
  if (norm.includes('laravel')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4v14l8 6 8-6V2zm-4 12H8v-2h8v2zm0-4H8V8h8v2z" fill="#FF2D20"/>
      </svg>
    );
  }

  // 21. Go
  if (norm === 'go' || norm.includes('go /') || norm.includes('golang')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm0-8h-2V7h2v2zm4 8h-2v-6h2v6zm0-8h-2V7h2v2z" fill="#00ADD8"/>
      </svg>
    );
  }

  // 22. Docker
  if (norm.includes('docker')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.983 8.871h-2.111c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V9.024c0-.085-.067-.153-.153-.153zm-2.882 0H8.99c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V9.024c0-.085-.067-.153-.153-.153zm-2.882 0H6.108c-.084 0-.151.068-.151.153v2.113c0 .086.067.152.151.152h2.111c.086 0 .153-.066.153-.152V9.024c0-.085-.067-.153-.153-.153zm-2.882 0H3.227c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V9.024c0-.085-.067-.153-.153-.153zm8.646-2.882h-2.111c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V6.142c0-.085-.067-.153-.153-.153zm-2.882 0H8.99c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V6.142c0-.085-.067-.153-.153-.153zm-2.882 0H6.108c-.084 0-.151.068-.151.153v2.113c0 .086.067.152.151.152h2.111c.086 0 .153-.066.153-.152V6.142c0-.085-.067-.153-.153-.153zm5.764-2.882h-2.111c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V3.26c0-.086-.067-.153-.153-.153zm-2.882 0H8.99c-.086 0-.153.068-.153.153v2.113c0 .086.067.152.153.152h2.111c.086 0 .153-.066.153-.152V3.26c0-.086-.067-.153-.153-.153zm11.39 6.062c-.092-.12-.229-.224-.41-.314-.18-.09-.387-.13-.62-.12-.232.01-.482.072-.747.185a5.5 5.5 0 0 0-.962.535 6.046 6.046 0 0 0-.915.795 7.15 7.15 0 0 0-.756.96 8.5 8.5 0 0 0-.488 1.03l-.04.108c-.088.24-.132.482-.132.724s.044.484.132.724l.04.108a8.5 8.5 0 0 0 .488 1.03 7.15 7.15 0 0 0 .756.96 6.046 6.046 0 0 0 .915.795c.291.196.611.374.962.535.265.113.515.175.747.185a1.764 1.764 0 0 0 1.03-.434c.181-.17.318-.387.41-.652s.138-.567.138-.908V9.896c0-.341-.046-.644-.138-.908a1.772 1.772 0 0 0-.41-.652z" fill="#2496ED"/>
      </svg>
    );
  }

  // 23. Kubernetes
  if (norm.includes('kubernetes') || norm === 'k8s') {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.001 2L2 6.5v11L12.001 22L22 17.5v-11L12.001 2zm7.999 14.5l-7.999 4L4 16.5V7.5l7.999-4L20 7.5v9z" fill="#326CE5"/>
      </svg>
    );
  }

  // 24. AWS
  if (norm.includes('aws') || norm.includes('amazon')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15.5l-4-4 1.41-1.41L12 13.67l3.59-3.59L17 11.5l-4 4z" fill="#FF9900"/>
      </svg>
    );
  }

  // 25. Google Cloud
  if (norm.includes('gcp') || norm.includes('google cloud')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <polygon points="12 2 22 8 22 16 12 22 2 16 2 8" fill="#4285F4"/>
        <polygon points="12 5.5 19 9.5 19 14.5 12 18.5 5 14.5 5 9.5" fill="#34A853"/>
      </svg>
    );
  }

  // 26. Vercel
  if (norm.includes('vercel')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 116 100" xmlns="http://www.w3.org/2000/svg">
        <polygon points="57.5,0 115,100 0,100" fill="#fff"/>
      </svg>
    );
  }

  // 27. GitHub Actions
  if (norm.includes('github')) {
    return (
      <svg style={iconProps.style} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.1-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-2 1.03-2.71-.1-.25-.45-1.29.1-2.67 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.42.1 2.67.64.7 1.03 1.6 1.03 2.71 0 3.84-2.34 4.69-4.57 4.93.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" fill="#fff"/>
      </svg>
    );
  }

  // Fallback to Category Icon
  switch (iconKey) {
    case 'frontend': return <svg {...iconProps}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    case 'backend': return <svg {...iconProps}><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /><path d="M7 8l2 2-2 2" /><line x1="11" y1="10" x2="15" y2="10" /></svg>;
    case 'mobile': return <svg {...iconProps}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>;
    case 'database': return <svg {...iconProps}><ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M3 5v14a9 3 0 0 0 18 0V5" /><path d="M3 12a9 3 0 0 0 18 0" /></svg>;
    case 'cloud': return <svg {...iconProps}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>;
    case 'ai': return <svg {...iconProps}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44l-3-9.35A2.5 2.5 0 0 1 5.5 7h7" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.44l3-9.35A2.5 2.5 0 0 0 18.5 7h-7" /></svg>;
    case 'design': return <svg {...iconProps}><path d="M2 13.5V21h7.5" /><path d="M22 13.5V21h-7.5" /><path d="M12 2L2 13.5h20L12 2z" /></svg>;
    case 'devops': return <svg {...iconProps}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>;
    case 'testing': return <svg {...iconProps}><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>;
    case 'hardware': return <svg {...iconProps}><rect x="2" y="2" width="20" height="20" rx="4" /><path d="M6 10h12M10 6v12" /></svg>;
    case 'orchestration': return <svg {...iconProps}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" /><line x1="12" y1="22" x2="12" y2="12" /><line x1="22" y1="8.5" x2="12" y2="12" /><line x1="2" y1="8.5" x2="12" y2="12" /></svg>;
    case 'growth':
    default: return <svg {...iconProps}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
  }
}

// ─── Icon Options ─────────────────────────────────────────────────────────────

const ICON_OPTIONS: Array<{ key: TechnologyStackIconKey; label: string; desc: string }> = [
  { key: 'frontend',     label: 'Frontend',     desc: 'Code / UI' },
  { key: 'backend',     label: 'Backend',      desc: 'Server / API' },
  { key: 'mobile',      label: 'Mobile',       desc: 'App / Device' },
  { key: 'database',    label: 'Database',     desc: 'Storage' },
  { key: 'cloud',       label: 'Cloud',        desc: 'Hosting' },
  { key: 'orchestration', label: 'Container',  desc: 'Docker / K8s' },
  { key: 'devops',      label: 'DevOps / CI',  desc: 'Pipeline' },
  { key: 'ai',          label: 'AI / ML',      desc: 'Intelligence' },
  { key: 'design',      label: 'Design',       desc: 'UI / UX' },
  { key: 'testing',     label: 'Testing',      desc: 'QA' },
  { key: 'hardware',    label: 'Hardware',     desc: 'GPU / Compute' },
  { key: 'growth',      label: 'Growth',       desc: 'General' },
];

// Suggested category names matching the frontend grouping
const CATEGORY_SUGGESTIONS = [
  'FIGMA',
  'FRONTEND',
  'APP',
  'BACKEND',
  'DEPLOYMENT',
];

// Default category ordering for grouping
const CATEGORY_ORDER = ['FIGMA', 'FRONTEND', 'APP', 'BACKEND', 'DEPLOYMENT'];

// ─── Shared Styles ────────────────────────────────────────────────────────────

const input: React.CSSProperties = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.09)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--text-main)',
  fontSize: '0.9rem',
  outline: 'none',
};

const label: React.CSSProperties = {
  display: 'block',
  marginBottom: '7px',
  fontSize: '0.78rem',
  fontWeight: 700,
  color: 'var(--text-light)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const emptyDraft = {
  title: '',
  category: '',
  description: '',
  iconKey: 'frontend' as TechnologyStackIconKey,
  imageSrc: '',
  imageAlt: '',
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TechnologyStackDashboardPage() {
  const brandName = useSiteConfig('navbar.brand');
  const cards = useTechnologyStackCards();
  const settings = useTechnologyStackSettings();

  const [draft, setDraft] = useState(emptyDraft);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [settingsDraft, setSettingsDraft] = useState(settings);
  const [settingsEditorOpen, setSettingsEditorOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [showCatSuggestions, setShowCatSuggestions] = useState(false);
  const [catInput, setCatInput] = useState('');

  const visibleCount = useMemo(() => cards.filter((c) => c.enabled).length, [cards]);
  const hiddenCount = cards.length - visibleCount;
  const selectedCard = cards.find((c) => c.id === selectedId) ?? null;

  // Unique categories present in current cards
  const existingCategories = useMemo(() => {
    const cats = new Set<string>();
    cards.forEach((c) => cats.add(c.category));
    return Array.from(cats).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
  }, [cards]);

  // Cards grouped by category for display
  const grouped = useMemo(() => {
    const filtered = filterCat === 'ALL' ? cards : cards.filter((c) => c.category === filterCat);
    const map: Record<string, TechnologyStackCard[]> = {};
    filtered.forEach((c) => {
      if (!map[c.category]) map[c.category] = [];
      map[c.category].push(c);
    });
    const sorted = Object.keys(map).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return sorted.map((cat) => ({ category: cat, cards: map[cat] }));
  }, [cards, filterCat]);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true);
    try {
      const result = await uploadImageToCloudinary(file);
      const imageUrl = result.secureUrl || result.url;
      setDraft((prev) => ({
        ...prev,
        imageSrc: imageUrl,
        imageAlt: prev.imageAlt.trim() || file.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '),
      }));
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const openCreate = () => {
    setSelectedId(null);
    setDraft(emptyDraft);
    setEditorOpen(true);
  };

  const openEdit = (card: TechnologyStackCard) => {
    setSelectedId(card.id);
    setDraft({
      title: card.title,
      category: card.category,
      description: card.description,
      iconKey: card.iconKey,
      imageSrc: card.imageSrc || '',
      imageAlt: card.imageAlt || '',
    });
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedId(null);
    setDraft(emptyDraft);
    setUploadingImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveCard = () => {
    const t = draft.title.trim();
    const cat = draft.category.trim();
    const d = draft.description.trim();
    if (!t || !cat || !d) return;
    if (selectedCard) {
      updateTechnologyStackCard(selectedCard.id, {
        title: t,
        category: cat,
        description: d,
        iconKey: draft.iconKey,
        imageSrc: draft.imageSrc,
        imageAlt: draft.imageAlt,
      });
    } else {
      addTechnologyStackCard(t, cat, d, draft.iconKey, draft.imageSrc, draft.imageAlt);
    }
    closeEditor();
  };

  const executeDelete = () => {
    if (!deleteConfirmId) return;
    deleteTechnologyStackCard(deleteConfirmId);
    setDeleteConfirmId(null);
  };

  const saveSettings = () => { setTechnologyStackSettings(settingsDraft); setSettingsEditorOpen(false); };

  const catSuggestions = useMemo(() => {
    const all = Array.from(new Set([...CATEGORY_SUGGESTIONS, ...existingCategories]));
    return all.filter((c) => c.toLowerCase().includes(catInput.toLowerCase())).slice(0, 8);
  }, [catInput, existingCategories]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <section style={{
        padding: '28px 32px',
        borderRadius: '22px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        background: 'linear-gradient(145deg, rgba(37, 99, 235, 0.12), rgba(15, 23, 42, 0.92))',
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--primary)', textTransform: 'uppercase' }}>
              {brandName} / Technology Stack
            </span>
            <h2 style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-white)', margin: '8px 0 6px' }}>
              Technology Stack Manager
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: '60ch', fontSize: '0.92rem' }}>
              Add, edit, and organise the technology cards shown on the public landing page and Technology section.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button className="btn btn-secondary" type="button" onClick={() => { setSettingsDraft(settings); setSettingsEditorOpen(true); }}>
              ✏️ Edit Section Title
            </button>
            <button className="btn btn-primary" type="button" onClick={openCreate}>
              + Add Card
            </button>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: '14px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Cards', value: cards.length },
            { label: 'Visible', value: visibleCount, color: '#34d399' },
            { label: 'Hidden', value: hiddenCount, color: '#fbbf24' },
            { label: 'Categories', value: existingCategories.length },
          ].map(({ label: l, value, color }) => (
            <div key={l} style={{ padding: '12px 18px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '2px' }}>{l}</div>
              <strong style={{ fontSize: '1.5rem', color: color ?? 'var(--text-white)' }}>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* ── Category Filter Tabs ─────────────────────────────────── */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, marginRight: '4px' }}>FILTER:</span>
        {['ALL', ...existingCategories].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setFilterCat(cat)}
            style={{
              padding: '7px 14px',
              borderRadius: '20px',
              border: filterCat === cat ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
              background: filterCat === cat ? 'rgba(99,102,241,0.18)' : 'rgba(255,255,255,0.03)',
              color: filterCat === cat ? '#a5b4fc' : 'var(--text-muted)',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {cat === 'ALL' ? `All (${cards.length})` : cat}
          </button>
        ))}
      </div>

      {/* ── Cards — Grouped by Category ─────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        {grouped.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '18px' }}>
            No cards found. Click <strong style={{ color: 'var(--primary)' }}>+ Add Card</strong> to get started.
          </div>
        )}
        {grouped.map(({ category, cards: catCards }) => (
          <div key={category}>
            {/* Category header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.18em', color: 'var(--primary)', textTransform: 'uppercase' }}>
                {category}
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{catCards.length} cards</span>
            </div>

            {/* Grid of cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {catCards.map((card) => (
                <article
                  key={card.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${card.enabled ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)'}`,
                    borderRadius: '16px',
                    padding: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px',
                    opacity: card.enabled ? 1 : 0.55,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {/* Top bar */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{
                      width: '40px', height: '40px', borderRadius: '11px',
                      display: 'grid', placeItems: 'center',
                      background: 'rgba(99,102,241,0.1)',
                      color: 'var(--primary)',
                      border: '1px solid rgba(99,102,241,0.2)',
                    }}>
                      {renderIcon(card.iconKey, 17, card.title)}
                    </div>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {/* Visibility toggle */}
                      <button type="button" title={card.enabled ? 'Hide' : 'Show'} onClick={() => updateTechnologyStackCard(card.id, { enabled: !card.enabled })}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: card.enabled ? '#34d399' : '#fbbf24', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                          {card.enabled
                            ? <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                            : <><path d="M3 3l18 18" /><path d="M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-4.42" /><path d="M9.88 5.09A11 11 0 0 1 12 4c7 0 11 8 11 8a21 21 0 0 1-4.23 5.65" /><path d="M6.61 6.61C3.2 8.76 1 12 1 12s4 8 11 8c1.4 0 2.73-.27 3.98-.74" /></>
                          }
                        </svg>
                      </button>
                      {/* Edit */}
                      <button type="button" title="Edit" onClick={() => openEdit(card)}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-white)', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                        </svg>
                      </button>
                      {/* Delete */}
                      <button type="button" title="Delete" onClick={() => setDeleteConfirmId(card.id)}
                        style={{ width: '32px', height: '32px', borderRadius: '9px', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.06)', color: '#f87171', cursor: 'pointer', display: 'grid', placeItems: 'center' }}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px' }}>
                          <path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Card content */}
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-white)', margin: '0 0 6px' }}>{card.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.55, margin: 0 }}>{card.description}</p>
                  </div>

                  {/* Status badge */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.1em',
                      padding: '3px 9px', borderRadius: '20px',
                      background: card.enabled ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
                      color: card.enabled ? '#34d399' : '#fbbf24',
                      border: `1px solid ${card.enabled ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)'}`,
                    }}>
                      {card.enabled ? '● VISIBLE' : '○ HIDDEN'}
                    </span>
                  </div>
                </article>
              ))}

              {/* Add card shortcut inside category */}
              <button
                type="button"
                onClick={() => { setDraft({ ...emptyDraft, category }); setSelectedId(null); setEditorOpen(true); }}
                style={{
                  borderRadius: '16px', border: '1px dashed rgba(99,102,241,0.3)',
                  background: 'rgba(99,102,241,0.04)', color: 'var(--primary)',
                  padding: '18px', cursor: 'pointer',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: '8px', minHeight: '140px', fontSize: '0.88rem', fontWeight: 700,
                  transition: 'all 0.2s',
                }}
              >
                <span style={{ fontSize: '24px' }}>+</span>
                Add to {category}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────── */}
      {editorOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2000, padding: '20px' }}
          onClick={closeEditor}
        >
          <div
            role="dialog" aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(860px, 100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)', background: 'linear-gradient(180deg, rgba(14,22,40,0.99), rgba(8,13,24,0.99))', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '22px', maxHeight: '90vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>
                  {selectedCard ? '✏️ Edit Card' : '➕ Add New Tech Card'}
                </h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '5px' }}>
                  {selectedCard ? `Editing: ${selectedCard.title}` : 'This card will appear in the Technology Stack section on the landing page.'}
                </p>
              </div>
              <button className="btn btn-secondary" type="button" onClick={closeEditor} style={{ flexShrink: 0 }}>✕ Close</button>
            </div>

            {/* Title + Category row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <span style={label}>Technology Name *</span>
                <input style={input} type="text" placeholder="e.g. React.js" value={draft.title}
                  onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))} />
              </div>
              <div style={{ position: 'relative' }}>
                <span style={label}>Category *</span>
                <input style={input} type="text" placeholder="e.g. FRONTEND FRAMEWORK"
                  value={draft.category}
                  onChange={(e) => { setDraft((p) => ({ ...p, category: e.target.value })); setCatInput(e.target.value); setShowCatSuggestions(true); }}
                  onFocus={() => { setCatInput(draft.category); setShowCatSuggestions(true); }}
                  onBlur={() => setTimeout(() => setShowCatSuggestions(false), 150)}
                />
                {showCatSuggestions && catSuggestions.length > 0 && (
                  <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(12,19,33,0.98)', boxShadow: '0 12px 40px rgba(0,0,0,0.5)', overflow: 'hidden' }}>
                    {catSuggestions.map((s) => (
                      <button key={s} type="button"
                        onMouseDown={() => { setDraft((p) => ({ ...p, category: s })); setShowCatSuggestions(false); }}
                        style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', background: 'none', border: 'none', color: 'var(--text-main)', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Brand Logo Image */}
            <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>
              <span style={label}>Custom Official Brand Logo (Optional)</span>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0 0 12px' }}>
                Type a popular technology name to auto-resolve the official brand logo, or upload a custom SVG/PNG below.
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '60px', height: '60px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)', display: 'grid', placeItems: 'center', overflow: 'hidden'
                }}>
                  {draft.imageSrc ? (
                    <img src={draft.imageSrc} alt="Custom Logo Preview" style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '6px' }} />
                  ) : (
                    <div style={{ fontSize: '1.25rem' }}>✨</div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="btn btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={uploadingImage} style={{ padding: '8px 16px', fontSize: '0.82rem' }}>
                      {uploadingImage ? 'Uploading...' : 'Upload SVG / PNG'}
                    </button>
                    {draft.imageSrc && (
                      <button type="button" className="btn btn-secondary" onClick={() => setDraft(p => ({ ...p, imageSrc: '', imageAlt: '' }))} style={{ padding: '8px 16px', fontSize: '0.82rem', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
                        Clear
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <span style={label}>Description *</span>
              <textarea style={{ ...input, resize: 'vertical' }} rows={4}
                placeholder="Describe what this technology does and why you use it..."
                value={draft.description}
                onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))} />
            </div>

            {/* Icon Picker */}
            <div>
              <span style={label}>Icon / Category Type</span>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {ICON_OPTIONS.map((opt) => {
                  const active = draft.iconKey === opt.key;
                  return (
                    <button key={opt.key} type="button" onClick={() => setDraft((p) => ({ ...p, iconKey: opt.key }))}
                      style={{
                        padding: '12px 10px', borderRadius: '12px', cursor: 'pointer',
                        border: active ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                        background: active ? 'rgba(99,102,241,0.16)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#a5b4fc' : 'var(--text-muted)',
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transition: 'all 0.2s',
                      }}>
                      <span style={{ color: active ? '#a5b4fc' : 'var(--text-muted)' }}>{renderIcon(opt.key, 16, draft.title)}</span>
                      <div style={{ textAlign: 'left' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>{opt.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '18px' }}>
              <button className="btn btn-primary" type="button" onClick={saveCard}
                style={{ opacity: (!draft.title.trim() || !draft.category.trim() || !draft.description.trim()) ? 0.5 : 1 }}>
                {selectedCard ? '✓ Save Changes' : '+ Add Card'}
              </button>
              <button className="btn btn-secondary" type="button" onClick={closeEditor}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ───────────────────────────────────────── */}
      {settingsEditorOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(2,6,23,0.78)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'grid', placeItems: 'center', zIndex: 2100, padding: '20px' }}
          onClick={() => setSettingsEditorOpen(false)}>
          <div role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}
            style={{ width: 'min(680px,100%)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.09)', background: 'linear-gradient(180deg, rgba(14,22,40,0.99), rgba(8,13,24,0.99))', boxShadow: '0 40px 100px rgba(0,0,0,0.6)', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-white)', margin: 0 }}>✏️ Edit Section Title</h3>
              <button className="btn btn-secondary" type="button" onClick={() => setSettingsEditorOpen(false)}>✕ Close</button>
            </div>
            <div>
              <span style={label}>Section Title</span>
              <input style={input} type="text" value={settingsDraft.sectionTitle}
                onChange={(e) => setSettingsDraft((p) => ({ ...p, sectionTitle: e.target.value }))}
                placeholder="Our Technology Stack" />
            </div>
            <div>
              <span style={label}>Section Subtitle</span>
              <textarea style={{ ...input, resize: 'vertical' }} rows={3} value={settingsDraft.sectionSubtitle}
                onChange={(e) => setSettingsDraft((p) => ({ ...p, sectionSubtitle: e.target.value }))}
                placeholder="Built on battle-tested frameworks..." />
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" type="button" onClick={saveSettings}>✓ Save</button>
              <button className="btn btn-secondary" type="button" onClick={() => setSettingsEditorOpen(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────── */}
      {deleteConfirmId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,6,12,0.82)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', display: 'grid', placeItems: 'center', zIndex: 3000, padding: '20px' }}>
          <div style={{ width: 'min(400px,100%)', background: 'rgba(12,19,33,0.97)', border: '1px solid rgba(239,68,68,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', padding: '32px', textAlign: 'center', borderRadius: '20px' }}>
            <div style={{ fontSize: '36px', marginBottom: '14px' }}>⚠️</div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '10px' }}>Delete this card?</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
              This will permanently remove the card from both the dashboard and the public site. This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button type="button" onClick={() => setDeleteConfirmId(null)}
                style={{ padding: '10px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-muted)', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button type="button" onClick={executeDelete}
                style={{ padding: '10px 22px', borderRadius: '10px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', boxShadow: '0 4px 18px rgba(239,68,68,0.4)' }}>
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
