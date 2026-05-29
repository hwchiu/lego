import axios from 'axios';
import * as cheerio from 'cheerio';
import { spawnSync } from 'child_process';
import * as fs from 'fs';
import { LiveContentResult } from './liveTranscriptFetcher';

/** Minimum character count to consider a transcript non-empty / non-truncated */
const MIN_TRANSCRIPT_LENGTH = 200;

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/125.0.0.0 Safari/537.36';

/**
 * Convert VTT caption text to plain text:
 * 1. Remove WEBVTT header and block sections (NOTE, STYLE, REGION)
 * 2. Remove timestamp cue lines (lines containing " --> ")
 * 3. Strip inline HTML tags
 * 4. Deduplicate adjacent identical lines (VTT repeats lines as captions progress)
 * 5. Join with spaces
 */
export function parseVttToText(vttContent: string): string {
  const lines = vttContent.split('\n');
  const textLines: string[] = [];
  let inBlock = false;

  for (const raw of lines) {
    const line = raw.trim();

    // Blank line ends any active block
    if (!line) {
      inBlock = false;
      continue;
    }

    // Skip WEBVTT identifier
    if (line.startsWith('WEBVTT')) continue;

    // Enter and skip NOTE / STYLE / REGION blocks
    if (line.startsWith('NOTE') || line.startsWith('STYLE') || line.startsWith('REGION')) {
      inBlock = true;
      continue;
    }

    if (inBlock) continue;

    // Skip timestamp cue lines
    if (line.includes(' --> ')) continue;

    // Strip inline HTML tags (e.g. <c>, <b>, <00:00:00.000>)
    const clean = line.replace(/<[^>]+>/g, '').trim();
    if (!clean) continue;

    // Deduplicate adjacent identical lines
    if (textLines.length > 0 && textLines[textLines.length - 1] === clean) continue;

    textLines.push(clean);
  }
  return textLines.join(' ');
}

// ─── Strategy 1: YouTube auto-captions via yt-dlp ───────────────────────────

function isYtDlpAvailable(): boolean {
  const result = spawnSync('yt-dlp', ['--version'], { encoding: 'utf8' });
  return result.status === 0;
}

export async function findYouTubeVideoId(_eventDate: Date): Promise<string | null> {
  try {
    const query = encodeURIComponent('Broadcom AVGO earnings call fiscal Q2 2026');
    const searchUrl = `https://www.youtube.com/results?search_query=${query}`;
    const res = await axios.get(searchUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const html: string = res.data;
    const videoIdPattern = /\/watch\?v=([\w-]{11})/g;
    let match: RegExpExecArray | null;
    while ((match = videoIdPattern.exec(html)) !== null) {
      const videoId = match[1];
      // Look for the video title nearby in the raw HTML (~200 chars context)
      const start = Math.max(0, match.index - 200);
      const end   = Math.min(html.length, match.index + 200);
      const ctx = html.slice(start, end).toLowerCase();
      if ((ctx.includes('broadcom') || ctx.includes('avgo')) && ctx.includes('earn')) {
        return videoId;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function fetchYouTubeCaptions(videoId: string): Promise<string | null> {
  const outputTemplate = `/tmp/avgo-captions-${videoId}`;
  const vttPath = `${outputTemplate}.en.vtt`;

  // Remove stale file from a previous run
  if (fs.existsSync(vttPath)) fs.unlinkSync(vttPath);

  const result = spawnSync(
    'yt-dlp',
    [
      '--write-auto-sub',
      '--sub-lang', 'en',
      '--skip-download',
      '--quiet',
      '-o', outputTemplate,
      `https://www.youtube.com/watch?v=${videoId}`,
    ],
    { timeout: 60_000 },
  );

  if (result.status !== 0 || !fs.existsSync(vttPath)) return null;

  const vttContent = fs.readFileSync(vttPath, 'utf8');
  fs.unlinkSync(vttPath);
  return parseVttToText(vttContent) || null;
}

// ─── Strategy 2: Broadcom IR Webcast ────────────────────────────────────────

async function findBroadcomWebcastUrl(_eventDate: Date): Promise<string | null> {
  try {
    const irUrl = 'https://investors.broadcom.com/events-and-presentations';
    const res = await axios.get(irUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const $ = cheerio.load(res.data);
    let webcastUrl: string | null = null;
    $('a').each((_i, el) => {
      if (webcastUrl) return;
      const href = $(el).attr('href') ?? '';
      const text = $(el).text().toLowerCase();
      if (
        (href.toLowerCase().includes('webcast') ||
          href.toLowerCase().includes('listen') ||
          text.includes('webcast') ||
          text.includes('listen live')) &&
        (text.includes('earn') || text.includes('q2') || text.includes('second quarter'))
      ) {
        webcastUrl = href.startsWith('http') ? href : `https://investors.broadcom.com${href}`;
      }
    });
    return webcastUrl;
  } catch {
    return null;
  }
}

async function fetchWebcastCaptions(webcastUrl: string): Promise<string | null> {
  try {
    const res = await axios.get(webcastUrl, {
      timeout: 15_000,
      headers: { 'User-Agent': BROWSER_UA },
    });
    const html: string = res.data;
    const $ = cheerio.load(html);

    // Try <track> elements first
    let captionUrl: string | null = null;
    $('track').each((_i, el) => {
      if (captionUrl) return;
      const src = $(el).attr('src') ?? '';
      if (src.endsWith('.vtt') || src.endsWith('.srt')) {
        captionUrl = src.startsWith('http') ? src : new URL(src, webcastUrl).href;
      }
    });

    // Fall back: scan raw HTML for .vtt/.srt URL patterns
    if (!captionUrl) {
      const captionMatch = html.match(/["'](https?:\/\/[^"']*\.(?:vtt|srt))/);
      captionUrl = captionMatch?.[1] ?? null;
    }

    if (!captionUrl) return null;

    const captionRes = await axios.get(captionUrl, { timeout: 15_000 });
    return parseVttToText(captionRes.data) || null;
  } catch {
    return null;
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export async function fetchVideoTranscript(
  eventDate: Date,
  _targetQuarter: string,
): Promise<LiveContentResult | null> {
  // Strategy 1: YouTube
  if (isYtDlpAvailable()) {
    try {
      const videoId = await findYouTubeVideoId(eventDate);
      if (videoId) {
        const text = await fetchYouTubeCaptions(videoId);
        if (text && text.length > MIN_TRANSCRIPT_LENGTH) return { content: text, source: 'YouTube' };
      }
    } catch {
      console.warn('[videoTranscriptFetcher] YouTube strategy failed');
    }
  } else {
    console.warn('[videoTranscriptFetcher] yt-dlp not found in PATH — skipping YouTube captions');
  }

  // Strategy 2: Broadcom IR Webcast
  try {
    const webcastUrl = await findBroadcomWebcastUrl(eventDate);
    if (webcastUrl) {
      const text = await fetchWebcastCaptions(webcastUrl);
      if (text && text.length > MIN_TRANSCRIPT_LENGTH) return { content: text, source: 'IR Webcast' };
    }
  } catch {
    console.warn('[videoTranscriptFetcher] IR Webcast strategy failed');
  }

  return null;
}
