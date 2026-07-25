// Copyright (C) 2017-2026 Smart code 203358507
// Viduki streaming API bridge — ID resolution, URL generation, fallback logic

/**
 * All supported Viduki APIs
 */
const VIDUKI_APIS = [
    { id: 1, name: 'Multi Server',   desc: 'Multiple servers for best compatibility' },
    { id: 2, name: 'Multi Language', desc: 'Multiple audio languages' },
    { id: 3, name: 'Multi Embeds',   desc: 'Multiple embed sources' },
    { id: 4, name: 'Premium',        desc: 'Premium HD quality' },
];

/**
 * Determine the next fallback API id, or null if all exhausted.
 */
function getNextFallbackApi(currentApiId) {
    const idx = VIDUKI_APIS.findIndex((a) => a.id === currentApiId);
    if (idx !== -1 && idx < VIDUKI_APIS.length - 1) {
        return VIDUKI_APIS[idx + 1].id;
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
 * @param {number} opts.api      - API number (1–4)
 * @param {string} opts.mediaType - 'movie' | 'tv'
 * @param {string} opts.mediaId  - TMDB or IMDB id
 * @param {number} [opts.season]
 * @param {number} [opts.episode]
 * @param {string} [opts.color]  - Hex color without '#' (default: '8a5cf6')
 */
function getVidukiUrl({ api = 1, mediaType, mediaId, season, episode, color = '8a5cf6' }) {
    if (!mediaId) return null;

    const base = `https://viduki.net/${api}`;
    const colorParam = `?color=${color}`;

    if (mediaType === 'tv' && season !== null && episode !== null) {
        return `${base}/tv/${mediaId}/${season}/${episode}${colorParam}`;
    }
    return `${base}/movie/${mediaId}${colorParam}`;
}

module.exports = {
    VIDUKI_APIS,
    parseVidukiMedia,
    getVidukiUrl,
    getNextFallbackApi,
};
