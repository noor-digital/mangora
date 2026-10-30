import { memo, useMemo } from 'react';
import { buildPageSvg } from '../../utils/pageArt.js';

/** One generated manga page (SVG markup comes from our own generator). */
function MangaPage({ manga, chapter, title, page, total }) {
  const svg = useMemo(
    () => buildPageSvg({ manga, chapter, title, page, total }),
    [manga, chapter, title, page, total],
  );
  return <div className="manga-page" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default memo(MangaPage);
