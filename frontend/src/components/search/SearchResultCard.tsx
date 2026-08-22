import { Link } from "react-router-dom";
import type { SearchResult } from "../../types/search";

type SearchResultCardProps = {
  result: SearchResult;
};

export function SearchResultCard({ result }: SearchResultCardProps) {
  const projectPath = `/${result.developer.slug}/${result.project.location.slug}/${result.project.slug}`;

  return (
    <article className="property-search-result">
      <h3>{result.project.name}</h3>
      <p>Developer: {result.developer.name}</p>
      <p>Location: {result.project.location.name}</p>
      <p>Project status: {result.project.status}</p>
      <h4>Matching configuration: {result.configuration.name}</h4>
      <p>BHK: {result.configuration.bhk}</p>
      <p>Carpet area: {result.configuration.carpetArea} sq ft</p>
      <p>Price from (paise): {result.configuration.priceFrom}</p>
      <p>Availability: {result.configuration.availabilityStatus}</p>
      <Link to={projectPath}>View project</Link>
    </article>
  );
}
