import type { Media } from "../../types/project";

type MediaSectionProps = {
  media: Media[];
};

export function MediaSection({ media }: MediaSectionProps) {
  return (
    <section>
      <h2>Media</h2>
      {media.length === 0 ? (
        <p>No project media available.</p>
      ) : (
        <div className="media-list">
          {media.map((item) => (
            <article key={item.id} className="media-item">
              <p>{item.category}</p>
              {item.type === "IMAGE" && (
                <img
                  src={item.url}
                  alt={item.altText ?? `${item.category} media`}
                />
              )}
              {item.type === "DOCUMENT" && (
                <a href={item.url} target="_blank" rel="noreferrer">
                  Open document
                </a>
              )}
              {item.type === "VIDEO" && (
                <video controls src={item.url} aria-label={item.category} />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
