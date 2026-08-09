'use client';

// Ports #fx-loader from base.html + the loader block in fexo.js: waits for
// the window `load` event (or immediately if it already fired before this
// mounted), then fades out after 900ms.

import { useEffect, useState } from 'react';

export default function Loader() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const reveal = () => {
      timer = setTimeout(() => setLoaded(true), 900);
    };
    if (document.readyState === 'complete') {
      reveal();
    } else {
      window.addEventListener('load', reveal);
    }
    return () => {
      window.removeEventListener('load', reveal);
      clearTimeout(timer);
    };
  }, []);

  return (
    <div id="fx-loader" className={loaded ? 'fx-loaded' : ''}>
      <div className="fx-loader-logo">FEXO</div>
    </div>
  );
}
