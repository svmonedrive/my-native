/**
 * The ONE thumbnail size. Cloudinary bills every distinct transformation (each different width/height),
 * so never add a size parameter or pass screen-based numbers here.
 */
const THUMB_SIZE = 400;

/**
 * Small square crop for directory cards, avatar icons and gallery-management tiles only.
 * For a full-size view (e.g. opening a member's whole gallery) use the plain `photo.url` instead:
 * serving the original is not a transformation and costs no extra credits.
 */
export const thumbUrl = (url: string): string =>
  url.replace('/upload/', `/upload/c_fill,g_auto,w_${THUMB_SIZE},h_${THUMB_SIZE},f_auto,q_auto/`);
