import type { Review } from "@/data/reviews";

type ReviewCardProps = {
  review: Review;
  index: number;
};

const AVATAR_COLORS = ["bg-rose-profond", "bg-sauge-fonce", "bg-sauge"];

export default function ReviewCard({ review, index }: ReviewCardProps) {
  const initial = review.name.charAt(0).toUpperCase();
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <figure className="review-card flex h-full flex-col rounded-xl bg-white p-4">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-medium text-white ${avatarColor}`}
        >
          {initial}
        </span>
        <figcaption className="text-sm font-medium text-g-texte">
          {review.name}
        </figcaption>
      </div>

      <div className="mt-2 flex items-center gap-1" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="currentColor"
            className={i < review.rating ? "text-g-etoile" : "text-g-vide"}
          >
            <path d="M12 .587l3.668 7.568 8.332 1.151-6.064 5.828 1.48 8.279L12 19.771l-7.416 3.642 1.48-8.279L0 9.306l8.332-1.151z" />
          </svg>
        ))}
      </div>
      <span className="sr-only">Note : {review.rating} sur 5</span>

      <blockquote className="mt-2 whitespace-pre-line text-sm leading-relaxed text-g-texte">
        {review.text}
      </blockquote>
    </figure>
  );
}
