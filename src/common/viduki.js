// Copyright (C) 2017-2026 Smart code 203358507
// Viduki streaming API bridge — ID resolution, URL generation, fallback logic

/**
 * Vimeus (Spanish/Latino) embed credentials and base URL.
 * view_key is required on every embed URL (already embedded).
 * Base API key (server-only, not used for embeds): ak_GVz08Xc5uTD5sGvSSgBpyd25hPvWoMgW
 */
const VIMEUS_BASE = 'https://vimeus.com';
const VIMEUS_VIEW_KEY = '_Oz-KvhGJdSuWSjhsNpGYZSqca9Ss5BzQUBjb8iV1uI';

/**
 * All supported Viduki APIs
 */
const SCREENSCAPE_BASE = 'https://screenscape.me/embed';

const VIDUKI_APIS = [
    { id: 1, name: 'Multi Server', desc: 'Multiple servers for best compatibility' },
    { id: 2, name: 'Multi Language', desc: 'Multiple audio languages' },
    { id: 3, name: 'Multi Embeds', desc: 'Multiple embed sources' },
    { id: 4, name: 'Premium', desc: 'Premium HD quality' },
    { id: 5, name: 'Vimeus Español', desc: 'Spanish / Latino dubs (Vimeus)' },
    { id: 6, name: 'Screenscape', desc: 'Screenscape.me — multi-language embed' },
];

/** Backup API servers (S7–S13) — accessed via the Backup Servers dropdown in the nav */
const VIDUKI_BACKUP_APIS = [
    { id: 7, name: 'VidRock', desc: 'Quality Video Embedding (VidRock)', domain: 'vidrock.ru', icon: '🎬' },
    { id: 8, name: 'VIDEASY', desc: 'Fast Player & Anime Embeds (VIDEASY)', domain: 'player.videasy.net', icon: '⚡' },
    { id: 9, name: 'VidAPI', desc: 'HD Video Player (vaplayer.ru)', domain: 'vaplayer.ru', icon: '🚀' },
    { id: 10, name: 'VidApi QZZ', desc: 'Multi-Skin Player (vidapi.qzz.io)', domain: 'vidapi.qzz.io', icon: '💎' },
    { id: 11, name: 'VidSrc', desc: 'Free Embed Player (vidsrcme.ru)', domain: 'vidsrcme.ru', icon: '🌐' },
    { id: 12, name: 'VidSrc SBS', desc: 'VidSrc SBS Embed Player (vidsrc.sbs)', domain: 'vidsrc.sbs', icon: '🔥' },
    { id: 13, name: 'CineSrc', desc: 'CineSrc Player (cinesrc.st)', domain: 'cinesrc.st', icon: '🍿' },
];

/**
 * Determine the next fallback API id, or null if all exhausted.
 */
function getNextFallbackApi(currentApiId) {
    const allApis = [...VIDUKI_APIS, ...VIDUKI_BACKUP_APIS];
    const idx = allApis.findIndex((a) => a.id === currentApiId);
    if (idx !== -1 && idx < allApis.length - 1) {
        return allApis[idx + 1].id;
    }
    return null;
}

/**
 * Extract a usable media ID (TMDB or IMDB) and resolve the media type.
 * Priority: TMDB numeric id from the id param, then IMDB tt-prefixed id,
 * then fall back to the raw id string.
 *
 * @param {Object} opts
 * @param {string} opts.type   - Stremio meta type: 'movie' | 'series'
 * @param {string} opts.id     - Raw meta id (may be tmdb:12345 or tt0000001 or plain number)
 * @param {string} opts.videoId - Video ID for series episodes (e.g. series:tt:S01E01 or "seriesId:season:episode")
 * @param {Object} [opts.video] - Video object with .season / .episode fields
 * @returns {{ mediaType: string, mediaId: string|null, season: number|null, episode: number|null }}
 */
function parseVidukiMedia({ type, id, videoId, video }) {
    // ── Resolve media ID ─────────────────────────────────────────────────
    let mediaId = null;

    if (typeof id === 'string') {
        // "tmdb:12345" → "12345"
        if (/^tmdb:/i.test(id)) {
            mediaId = id.replace(/^tmdb:/i, '');
        }
        // "tt1234567" → keep as-is (IMDB id)
        else if (/^tt\d+$/i.test(id)) {
            mediaId = id;
        }
        // plain numeric string
        else if (/^\d+$/.test(id)) {
            mediaId = id;
        }
        // "series_id:season:episode" pattern – extract the base
        else {
            // Strip any leading stremio prefix like "kitsu:" "mal:" etc.
            const colonParts = id.split(':');
            const last = colonParts[colonParts.length - 1];
            if (/^tt\d+/i.test(last)) {
                mediaId = last;
            } else if (/^\d+$/.test(last)) {
                mediaId = last;
            } else {
                // Leave null — this ID cannot be used with Viduki
                mediaId = null;
            }
        }
    }

    // ── Resolve season / episode ─────────────────────────────────────────
    let season = null;
    let episode = null;

    // Prefer the explicit video object (most reliable)
    if (video && typeof video.season === 'number' && typeof video.episode === 'number') {
        season = video.season;
        episode = video.episode;
    } else if (typeof videoId === 'string') {
        // Common Stremio pattern:  "seriesId:season:episode"
        const parts = videoId.split(':');
        if (parts.length >= 3) {
            const s = parseInt(parts[parts.length - 2], 10);
            const e = parseInt(parts[parts.length - 1], 10);
            if (!isNaN(s) && !isNaN(e)) {
                season = s;
                episode = e;
            }
        }

        // Also try "SxxExx" style
        const seMatch = videoId.match(/[Ss](\d+)[Ee](\d+)/);
        if (seMatch) {
            season = parseInt(seMatch[1], 10);
            episode = parseInt(seMatch[2], 10);
        }
    }

    // ── Resolve media type ────────────────────────────────────────────────
    const mediaType = (type === 'series' || (season !== null && episode !== null)) ? 'tv' : 'movie';

    return { mediaType, mediaId, season, episode };
}

/**
 * Build a Viduki embed URL.
 *
 * @param {Object} opts
 * @param {number} opts.api      - API number (1–11).
 * @param {string} opts.mediaType - 'movie' | 'tv'
 * @param {string} opts.mediaId  - TMDB or IMDB id (tt-prefixed or numeric)
 * @param {string} [opts.tmdbId] - Numeric TMDB ID if resolved from IMDB ID
 * @param {number} [opts.season]
 * @param {number} [opts.episode]
 * @param {string} [opts.color]  - Hex color without '#'
 */
function getVidukiUrl({ api = 1, mediaType, mediaId, tmdbId, season, episode, color = '8a5cf6' }) {
    if (!mediaId) return null;
    const isTv = mediaType === 'tv' || (season !== null && episode !== null);
    const targetId = tmdbId || mediaId;

    // ── API 5: Vimeus Español ──────────────────────────────────────────
    if (api === 5) {
        const isImdb = /^tt\d+$/i.test(String(mediaId));
        const idParam = isImdb
            ? `imdb=${encodeURIComponent(String(mediaId))}`
            : `tmdb=${encodeURIComponent(String(mediaId))}`;

        const endpoint = isTv ? '/e/serie' : '/e/movie';
        const qs = [`view_key=${encodeURIComponent(VIMEUS_VIEW_KEY)}`, idParam];

        if (isTv) {
            if (typeof season === 'number' && !isNaN(season)) qs.push(`se=${season}`);
            if (typeof episode === 'number' && !isNaN(episode)) qs.push(`ep=${episode}`);
        }

        return `${VIMEUS_BASE}${endpoint}?${qs.join('&')}`;
    }

    // ── API 6: Screenscape ─────────────────────────────────────────────
    if (api === 6) {
        const isImdb = /^tt\d+$/i.test(String(mediaId));
        const idParam = isImdb
            ? `imdb=${encodeURIComponent(String(mediaId))}`
            : `tmdb=${encodeURIComponent(String(mediaId))}`;

        const qs = [idParam, `type=${isTv ? 'tv' : 'movie'}`];

        if (isTv) {
            if (typeof season === 'number' && !isNaN(season)) qs.push(`s=${season}`);
            if (typeof episode === 'number' && !isNaN(episode)) qs.push(`e=${episode}`);
        }

        return `${SCREENSCAPE_BASE}?${qs.join('&')}`;
    }

    // ── API 7: VidRock ────────────────────────────────────────────────
    if (api === 7) {
        if (isTv && season !== null && episode !== null) {
            return `https://vidrock.ru/tv/${mediaId}/${season}/${episode}`;
        }
        return `https://vidrock.ru/movie/${mediaId}`;
    }

    // ── API 8: VIDEASY ────────────────────────────────────────────────
    if (api === 8) {
        const colorParam = `?color=${color}&nextEpisode=true&autoplayNextEpisode=true&episodeSelector=true&overlay=true`;
        if (isTv && season !== null && episode !== null) {
            return `https://player.videasy.net/tv/${targetId}/${season}/${episode}${colorParam}`;
        }
        return `https://player.videasy.net/movie/${targetId}${colorParam}`;
    }

    // ── API 9: VidAPI (vaplayer.ru) ───────────────────────────────────
    if (api === 9) {
        const colorParam = `?primaryColor=${color}`;
        if (isTv && season !== null && episode !== null) {
            return `https://vaplayer.ru/embed/tv/${mediaId}/${season}/${episode}${colorParam}`;
        }
        return `https://vaplayer.ru/embed/movie/${mediaId}${colorParam}`;
    }

    // ── API 10: VidApi QZZ ───────────────────────────────────────────
    if (api === 10) {
        const colorParam = `?primaryColor=${color}&player=plus`;
        if (isTv && season !== null && episode !== null) {
            return `https://vidapi.qzz.io/tv/${mediaId}/${season}/${episode}${colorParam}`;
        }
        return `https://vidapi.qzz.io/movie/${mediaId}${colorParam}`;
    }

    // ── API 11: VidSrc ────────────────────────────────────────────────
    if (api === 11) {
        if (isTv && season !== null && episode !== null) {
            return `https://vidsrcme.ru/embed/tv/${mediaId}/${season}/${episode}`;
        }
        return `https://vidsrcme.ru/embed/movie/${mediaId}`;
    }

    // ── API 12: VidSrc SBS ────────────────────────────────────────────
    if (api === 12) {
        if (isTv && season !== null && episode !== null) {
            return `https://vidsrc.sbs/embed/tv/${targetId}/${season}/${episode}`;
        }
        return `https://vidsrc.sbs/embed/movie/${targetId}`;
    }

    // ── API 13: CineSrc ───────────────────────────────────────────────
    if (api === 13) {
        const colorParam = `?color=%23${color}&autoplay=true&autonext=true&autoskip=true`;
        if (isTv && season !== null && episode !== null) {
            return `https://cinesrc.st/embed/tv/${targetId}${colorParam}&s=${season}&e=${episode}`;
        }
        return `https://cinesrc.st/embed/movie/${targetId}${colorParam}`;
    }

    // ── APIs 1–4: standard viduki.net layout ───────────────────────────
    const base = `https://viduki.net/${api}`;
    const colorParam = `?color=${color}`;

    if (isTv && season !== null && episode !== null) {
        return `${base}/tv/${mediaId}/${season}/${episode}${colorParam}`;
    }
    return `${base}/movie/${mediaId}${colorParam}`;
}

module.exports = {
    VIDUKI_APIS,
    VIDUKI_BACKUP_APIS,
    parseVidukiMedia,
    getVidukiUrl,
    getNextFallbackApi,
};
