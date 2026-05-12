/**
 * Navbar logo: Contentful field `navLogo` (single Media / Asset) on content type `homepage`,
 * resolved against the assets list from GET /assets. Falls back to local PNG.
 */
export const FALLBACK_NAV_LOGO = '/STOPLAB_LOGO-32.png';

type AssetLike = { sys: { id: string }; fields?: { file?: { url?: string } } };

export function resolveNavLogoUrl(
  homepageFields: Record<string, unknown> | undefined,
  assets: AssetLike[]
): string {
  const ref = homepageFields?.navLogo as { sys?: { id?: string } } | undefined;
  const id = ref?.sys?.id;
  if (!id || !assets?.length) return FALLBACK_NAV_LOGO;
  const asset = assets.find((a) => a.sys.id === id);
  const path = asset?.fields?.file?.url;
  if (!path) return FALLBACK_NAV_LOGO;
  return path.startsWith('http') ? path : `https:${path}`;
}
