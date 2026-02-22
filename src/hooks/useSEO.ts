import { useEffect } from "react";

const SITE_NAME = "Sanyi Lights Argentina";
const DEFAULT_OG_IMAGE = "/og-image.png";

function getAbsoluteUrl(path: string): string {
  if (typeof window === "undefined") return path;
  const base = window.location.origin;
  return path.startsWith("http") ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Updates document title and meta tags for SEO and social sharing.
 * Use on every page so crawlers and shares get the right title/description.
 */
export function useSEO({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  noIndex = false,
}: {
  title: string;
  description: string;
  image?: string;
  noIndex?: boolean;
}) {
  const fullTitle = title.includes(SITE_NAME) ? title : `${title} | ${SITE_NAME}`;

  useEffect(() => {
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) metaDescription.setAttribute("content", description);

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", fullTitle);

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) ogDescription.setAttribute("content", description);

    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) ogImage.setAttribute("content", getAbsoluteUrl(image));

    const twitterImage = document.querySelector('meta[name="twitter:image"]');
    if (twitterImage) twitterImage.setAttribute("content", getAbsoluteUrl(image));

    if (noIndex) {
      let metaRobots = document.querySelector('meta[name="robots"]');
      if (!metaRobots) {
        metaRobots = document.createElement("meta");
        metaRobots.setAttribute("name", "robots");
        document.head.appendChild(metaRobots);
      }
      metaRobots.setAttribute("content", "noindex, nofollow");
    } else {
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) metaRobots.remove();
    }

    return () => {
      // Restore defaults on unmount (e.g. when navigating away)
      document.title = `${SITE_NAME} - Iluminación Profesional`;
      const defaultDesc =
        "Equipos de iluminación profesional para eventos, espectáculos, TV y escenarios. Calidad premium en Argentina.";
      if (metaDescription) metaDescription.setAttribute("content", defaultDesc);
      if (ogTitle) ogTitle.setAttribute("content", `${SITE_NAME} - Iluminación Profesional`);
      if (ogDescription) ogDescription.setAttribute("content", defaultDesc);
      if (ogImage) ogImage.setAttribute("content", getAbsoluteUrl(DEFAULT_OG_IMAGE));
      if (twitterImage) twitterImage.setAttribute("content", getAbsoluteUrl(DEFAULT_OG_IMAGE));
      const metaRobots = document.querySelector('meta[name="robots"]');
      if (metaRobots) metaRobots.remove();
    };
  }, [fullTitle, description, image, noIndex]);
}
