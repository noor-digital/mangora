import { Star } from 'lucide-react';
import { formatRating } from '../../utils/format.js';

export default function Rating({ value, votes }) {
  return (
    <span className="rating" title={votes ? `${votes.toLocaleString('en')} votes` : undefined}>
      <Star size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
      <span>{formatRating(value)}</span>
      <span className="sr-only"> out of 5</span>
    </span>
  );
}
