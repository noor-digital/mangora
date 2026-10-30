import { memo, useId, useMemo } from 'react';
import { buildLayers, LAYER_ORDER, ORIENT } from '../../utils/art.js';

/**
 * Procedural artwork for a series, rendered as five stacked SVG layers so the
 * hero can parallax them. The markup comes from our own generator (no user
 * input), which is why injecting it as HTML is safe here.
 */
function Art({ manga, orient = 'portrait', figure = true, className = '' }) {
  const instance = useId().replace(/[^a-zA-Z0-9]/g, '');
  const layers = useMemo(
    () =>
      buildLayers({
        scene: manga.scene,
        palette: manga.palette,
        orient,
        uid: `${manga.id}-${orient}-${instance}`,
        seed: `${manga.id}:${orient}`,
        figure,
      }),
    [manga, orient, figure, instance],
  );
  const { w, h } = ORIENT[orient];

  return (
    <div className={`art art--${orient} ${className}`} role="img" aria-label={`Artwork for ${manga.title}`}>
      {LAYER_ORDER.map((key) => (
        <svg
          key={key}
          className={`art-layer art-layer--${key}`}
          viewBox={`0 0 ${w} ${h}`}
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
          focusable="false"
          dangerouslySetInnerHTML={{ __html: layers[key] }}
        />
      ))}
    </div>
  );
}

export default memo(Art);
