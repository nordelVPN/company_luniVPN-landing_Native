function publicConfig(env = process.env) {
  const mode = (env.DATA_MODE || 'live').toLowerCase();
  if (mode !== 'live' && mode !== 'demo') throw new Error(`Unsupported DATA_MODE: ${mode}`);
  const raw = env.BASE_PATH || '/';
  if (!raw.startsWith('/') || raw.includes('?') || raw.includes('#') || raw.includes('..') || raw.includes('\\')) {
    throw new Error('BASE_PATH must be an absolute path without query or traversal');
  }
  const basePath = `/${raw.split('/').filter(Boolean).join('/')}`.replace(/\/$/, '') + '/';
  const appEnv = env.APP_ENV || 'local';
  const siteUrl = env.PUBLIC_SITE_URL || '';
  if (siteUrl && (!/^https:\/\//.test(siteUrl) || new URL(siteUrl).pathname !== '/')) {
    throw new Error('PUBLIC_SITE_URL must be an HTTPS origin');
  }
  const wishlistTelegramUrl = (env.PUBLIC_WISHLIST_TELEGRAM_URL || '').trim();
  if (wishlistTelegramUrl) {
    let parsed;
    try {
      parsed = new URL(wishlistTelegramUrl);
    } catch {
      throw new Error('PUBLIC_WISHLIST_TELEGRAM_URL must be a valid URL');
    }
    if (parsed.protocol !== 'https:' || parsed.hostname !== 't.me' || parsed.pathname.length < 2) {
      throw new Error('PUBLIC_WISHLIST_TELEGRAM_URL must be an https://t.me/<bot> link');
    }
  }
  return { mode, basePath, appEnv, siteUrl, wishlistTelegramUrl };
}

module.exports = { publicConfig };
