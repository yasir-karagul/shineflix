const DEFAULT_EMBED_HOSTS = ["youtube.com", "youtube-nocookie.com", "youtu.be", "vimeo.com"];

/** Validate HTTPS iframe sources from known video hosts or an explicit admin-configured allowlist. */
export function isAllowedEmbedUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password) return false;
    const configured = (process.env.EMBED_ALLOWED_HOSTS ?? "")
      .split(",")
      .map(host => host.trim().toLowerCase())
      .filter(Boolean);
    const allowed = [...DEFAULT_EMBED_HOSTS, ...configured];
    const hostname = url.hostname.toLowerCase();
    return allowed.some(host => hostname === host || hostname.endsWith("." + host));
  } catch {
    return false;
  }
}
