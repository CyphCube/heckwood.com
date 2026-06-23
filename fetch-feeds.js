/**
 * fetch-feeds.js
 *
 * Fetches RSS feeds for each podcast and writes:
 *   - data/podcasts/{slug}.json        (show + episodes data)
 *   - content/podcasts/{slug}/_index.md (show content page)
 *   - content/podcasts/{slug}/{ep}.md  (episode content pages)
 *
 * Run: node fetch-feeds.js
 * Or via: npm run build
 */

import { XMLParser } from "fast-xml-parser";
import slugify from "slugify";
import fs from "fs";
import path from "path";

// ════════════════════════════════════════════════
// ★ YOUR SHOWS — add or remove podcasts here
//   name:   display name
//   author: host / producer
//   feed:   RSS feed URL
//   cat:    category slug (tech | science | news | business | crime)
//   desc:   short description for SEO (1–2 sentences)
// ════════════════════════════════════════════════
const SHOWS = [
  {
    name: "Lex Fridman Podcast",
    author: "Lex Fridman",
    feed: "https://lexfridman.com/feed/podcast/",
    cat: "tech",
    desc: "Conversations about science, technology, history, philosophy and the nature of intelligence and consciousness.",
  },
  {
    name: "Huberman Lab",
    author: "Andrew Huberman",
    feed: "https://feeds.megaphone.fm/hubermanlab",
    cat: "science",
    desc: "Dr. Andrew Huberman discusses neuroscience and science-based tools for everyday life.",
  },
  {
    name: "The Daily",
    author: "The New York Times",
    feed: "https://feeds.simplecast.com/Sl5CSM3S",
    cat: "news",
    desc: "Twenty minutes on the biggest story of the day with Times journalists, every weekday morning.",
  },
  {
    name: "How I Built This",
    author: "Guy Raz / NPR",
    feed: "https://feeds.npr.org/510313/podcast.xml",
    cat: "business",
    desc: "Guy Raz dives into the stories behind the world's best-known companies and entrepreneurs.",
  },
  {
    name: "Serial",
    author: "Serial Productions",
    feed: "https://feeds.simplecast.com/PpzWFGhg",
    cat: "crime",
    desc: "Investigative journalism on real-world cases told as gripping serialised stories.",
  },
  {
    name: "Darknet Diaries",
    author: "Jack Rhysider",
    feed: "https://feeds.megaphone.fm/darknetdiaries",
    cat: "tech",
    desc: "True stories from the dark side of the internet — hacks, breaches, and cyber crime.",
  },
  {
    name: "Radiolab",
    author: "WNYC Studios",
    feed: "https://feeds.feedburner.com/radiolab",
    cat: "science",
    desc: "Radiolab explores big questions about human experience through science, philosophy and storytelling.",
  },
  {
    name: "Planet Money",
    author: "NPR",
    feed: "https://feeds.npr.org/510289/podcast.xml",
    cat: "business",
    desc: "Planet Money explains economics and the global economy through entertaining storytelling.",
  },
  {
    name: "This American Life",
    author: "This American Life",
    feed: "https://feed.thisamericanlife.org/talpodcast",
    cat: "news",
    desc: "Weekly public radio program featuring personal essays, memoirs, documentary journalism and fiction.",
  },
  {
    name: "a16z Podcast",
    author: "Andreessen Horowitz",
    feed: "https://feeds.simplecast.com/JGE3yC0V",
    cat: "tech",
    desc: "The a16z Podcast discusses tech and culture trends with industry experts and thinkers.",
  },
  {
    name: "Hard Fork",
    author: "The New York Times",
    feed: "https://feeds.simplecast.com/6HKOhNgS",
    cat: "tech",
    desc: "Tech journalists Kevin Roose and Casey Newton make sense of the rapidly changing tech world.",
  },
  {
    name: "The Vergecast",
    author: "The Verge",
    feed: "https://feeds.megaphone.fm/vergecast",
    cat: "tech",
    desc: "The flagship podcast of The Verge on gadgets, tech and the future.",
  },
  {
    name: "Acquired",
    author: "Ben Gilbert and David Rosenthal",
    feed: "https://feeds.transistor.fm/acquired",
    cat: "tech",
    desc: "The stories and strategies behind the world's greatest companies.",
  },
  {
    name: "Lenny's Podcast",
    author: "Lenny Rachitsky",
    feed: "https://anchor.fm/s/5baf5d24/podcast/rss",
    cat: "tech",
    desc: "Interviews with world-class product leaders and growth experts.",
  },
  {
    name: "Waveform: The MKBHD Podcast",
    author: "Vox Media",
    feed: "https://feeds.megaphone.fm/STU4418364045",
    cat: "tech",
    desc: "Marques Brownlee and team on the latest in consumer tech.",
  },
  {
    name: "Hidden Brain",
    author: "Hidden Brain Media",
    feed: "https://feeds.simplecast.com/kwWc0lhf",
    cat: "science",
    desc: "Shankar Vedantam explores the unconscious patterns that drive human behavior.",
  },
  {
    name: "StarTalk Radio",
    author: "Neil deGrasse Tyson",
    feed: "https://feeds.simplecast.com/4T39_jAj",
    cat: "science",
    desc: "Neil deGrasse Tyson brings together science, pop culture and comedy.",
  },
  {
    name: "Ologies with Alie Ward",
    author: "Alie Ward",
    feed: "https://feeds.simplecast.com/FO6kxYGj",
    cat: "science",
    desc: "Comedic science interviews with experts across every -ology imaginable.",
  },
  {
    name: "Sean Carroll's Mindscape",
    author: "Sean Carroll",
    feed: "https://rss.libsyn.com/shows/604590/destinations/5264190.xml",
    cat: "science",
    desc: "Physicist Sean Carroll on science, society, philosophy and the universe.",
  },
  {
    name: "Science Vs",
    author: "Spotify Studios",
    feed: "https://feeds.megaphone.fm/sciencevs",
    cat: "science",
    desc: "Pits popular opinion against hard science on the topics that matter.",
  },
  {
    name: "Up First",
    author: "NPR",
    feed: "https://feeds.npr.org/510318/podcast.xml",
    cat: "news",
    desc: "NPR's morning news briefing: the biggest stories and ideas, in about 15 minutes.",
  },
  {
    name: "The Journal.",
    author: "The Wall Street Journal",
    feed: "https://video-api.wsj.com/podcast/rss/wsj/the-journal",
    cat: "news",
    desc: "The most important stories in business and money, weekday mornings.",
  },
  {
    name: "Global News Podcast",
    author: "BBC World Service",
    feed: "https://podcasts.files.bbci.co.uk/p02nq0gn.rss",
    cat: "news",
    desc: "The day's top international news stories from the BBC.",
  },
  {
    name: "Pod Save America",
    author: "Crooked Media",
    feed: "https://audioboom.com/channels/5166624.rss",
    cat: "news",
    desc: "A no-nonsense conversation about politics from former Obama staffers.",
  },
  {
    name: "Freakonomics Radio",
    author: "Freakonomics Radio + Stitcher",
    feed: "https://feeds.simplecast.com/Y8lFbOT4",
    cat: "business",
    desc: "Stephen Dubner explores the hidden side of everything.",
  },
  {
    name: "Masters of Scale",
    author: "WaitWhat",
    feed: "https://rss.art19.com/masters-of-scale",
    cat: "business",
    desc: "How companies grow from zero to a gazillion, told by the leaders who built them.",
  },
  {
    name: "Crime Junkie",
    author: "audiochuck",
    feed: "https://feeds.simplecast.com/qm_9xx0g",
    cat: "crime",
    desc: "Weekly true-crime stories told by host Ashley Flowers.",
  },
  {
    name: "Casefile True Crime",
    author: "Casefile Presents",
    feed: "https://feeds.acast.com/public/shows/679acff465f74095106abfaa",
    cat: "crime",
    desc: "Anonymous host narrates meticulously researched true-crime cases.",
  },
  {
    name: "My Favorite Murder",
    author: "Exactly Right",
    feed: "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/bdde8bb3-169d-43b1-91d3-b24c0047969c/f450d41f-16bc-4ecd-8f6c-b24c004796e2/podcast.rss",
    cat: "crime",
    desc: "Karen Kilgariff and Georgia Hardstark's hit true-crime comedy podcast.",
  },
  {
    name: "Morbid",
    author: "Morbid Network | Wondery",
    feed: "https://feeds.simplecast.com/ohmVlJZQ",
    cat: "crime",
    desc: "A lighthearted nightmare of true crime, hosted by Alaina and Ash.",
  },
  {
    name: "Conan O'Brien Needs a Friend",
    author: "Team Coco & Earwolf",
    feed: "https://feeds.simplecast.com/dHoohVNH",
    cat: "comedy",
    desc: "Conan O'Brien finally gives the people what they want: himself, befriending celebrities.",
  },
  {
    name: "SmartLess",
    author: "Wondery",
    feed: "https://feeds.simplecast.com/hNaFxXpO",
    cat: "comedy",
    desc: "Jason Bateman, Sean Hayes and Will Arnett surprise each other with mystery guests.",
  },
  {
    name: "This Past Weekend w/ Theo Von",
    author: "Theo Von",
    feed: "https://feeds.megaphone.fm/thispastweekend",
    cat: "comedy",
    desc: "Comedian Theo Von's weekly stream-of-consciousness conversations.",
  },
  {
    name: "Dan Carlin's Hardcore History",
    author: "Dan Carlin",
    feed: "https://feeds.feedburner.com/dancarlin/history?format=xml",
    cat: "history",
    desc: "Dan Carlin's deep, dramatic dives into pivotal moments in history.",
  },
  {
    name: "The Rest Is History",
    author: "Goalhanger",
    feed: "https://feeds.megaphone.fm/GLT4787413333",
    cat: "history",
    desc: "Tom Holland and Dominic Sandbrook on the biggest events and characters in history.",
  },
  {
    name: "Throughline",
    author: "NPR",
    feed: "https://feeds.npr.org/510333/podcast.xml",
    cat: "history",
    desc: "NPR's history podcast going back in time to understand the present.",
  },
  {
    name: "Stuff You Should Know",
    author: "iHeartPodcasts",
    feed: "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/a91018a4-ea4f-4130-bf55-ae270180c327/44710ecc-10bb-48d1-93c7-ae270180c33e/podcast.rss",
    cat: "society",
    desc: "Josh and Chuck explain how everything works, one topic at a time.",
  },
  {
    name: "99% Invisible",
    author: "SiriusXM + 99PI",
    feed: "https://feeds.simplecast.com/BqbsxVfO",
    cat: "society",
    desc: "Design and architecture stories about the unnoticed world around us.",
  },
  {
    name: "TED Talks Daily",
    author: "TED",
    feed: "https://feeds.acast.com/public/shows/67587e77c705e441797aff96",
    cat: "society",
    desc: "The latest ideas worth spreading, every weekday, from the TED stage.",
  },
  {
    name: "The Ezra Klein Show",
    author: "New York Times Opinion",
    feed: "https://feeds.simplecast.com/kEKXbjuJ",
    cat: "news",
    desc: "Ezra Klein's in-depth conversations about ideas that shape the world.",
  },
];
// ════════════════════════════════════════════════

// Cap episodes bundled per show so the build output stays well within
// Cloudflare's Worker size limit. The show page only displays the latest 60
// anyway. (Lift this once episodes move to D1 — see the refactor notes.)
const MAX_EPISODES_PER_SHOW = 75;

const parser = new XMLParser({
  processEntities: false,
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  cdataPropName: "__cdata",
  allowBooleanAttributes: true,
});

function slug(str) {
  return slugify(str, { lower: true, strict: true, trim: true }).slice(0, 80);
}

function clean(str) {
  if (!str) return "";
  return String(str)
    // Decode entities FIRST — feeds often HTML-encode markup as &lt;p&gt;, so
    // we must turn those back into real tags before stripping them below.
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&apos;/g, "'")
    .replace(/&hellip;/g, "…")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    // ...then strip all tags (whether literal or decoded from entities).
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getText(val) {
  if (!val) return "";
  if (typeof val === "string") return val;
  if (val.__cdata) return val.__cdata;
  if (val["#text"]) return val["#text"];
  return String(val);
}

function parseDuration(dur) {
  if (!dur) return null;
  const s = String(dur).trim();
  if (s.includes(":")) {
    const parts = s.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
  }
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

function fmtDuration(sec) {
  if (!sec) return "";
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s}s`;
}

async function fetchFeed(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; Podwave/1.0)",
      Accept: "application/rss+xml, application/xml, text/xml, */*",
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return res.text();
}

// Apple's podcast artwork CDN (mzstatic) is reliable and hotlink-safe, unlike
// some publisher-hosted images (which block cross-origin requests). Resolve a
// show's cover art by name via the iTunes Search API; "" if not found.
async function itunesArtwork(name) {
  try {
    const res = await fetch(
      "https://itunes.apple.com/search?entity=podcast&limit=3&term=" +
        encodeURIComponent(name),
      { signal: AbortSignal.timeout(8000) }
    );
    const data = await res.json();
    const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, "");
    const results = data.results || [];
    const m = results.find((r) => norm(r.collectionName) === norm(name)) || results[0];
    const art = m?.artworkUrl600 || m?.artworkUrl100 || "";
    return art.replace(/\/\d+x\d+bb\.(jpg|png)/, "/600x600bb.$1");
  } catch {
    return "";
  }
}

async function processShow(show) {
  const showSlug = slug(show.name);
  console.log(`\n▶ ${show.name} (${showSlug})`);

  let xml;
  try {
    xml = await fetchFeed(show.feed);
  } catch (e) {
    console.error(`  ✗ Feed fetch failed: ${e.message}`);
    return null;
  }

  let parsed;
  try {
    parsed = parser.parse(xml);
  } catch (e) {
    console.error(`  ✗ XML parse failed: ${e.message}`);
    return null;
  }

  const channel = parsed?.rss?.channel || parsed?.feed;
  if (!channel) {
    console.error(`  ✗ No channel found`);
    return null;
  }

  // Show-level metadata
  const feedTitle = clean(getText(channel.title)) || show.name;
  const feedDesc = clean(getText(channel.description || channel.subtitle)) || show.desc;
  // Prefer Apple's CDN art (reliable/hotlink-safe); fall back to the feed's own.
  const fallbackArt =
    channel["itunes:image"]?.["@_href"] ||
    channel.image?.url ||
    channel["itunes:image"] ||
    "";
  const feedArt = (await itunesArtwork(show.name)) || fallbackArt;
  const feedLink = getText(channel.link) || "";

  // Episodes
  const rawItems = Array.isArray(channel.item)
    ? channel.item
    : channel.item
    ? [channel.item]
    : [];

  const episodes = rawItems
    .map((item) => {
      const title = clean(getText(item.title || item["itunes:title"]));
      if (!title) return null;

      const epSlug = slug(title) || `episode-${Date.now()}`;
      const description =
        clean(getText(item["content:encoded"] || item.description || item["itunes:summary"])) || "";
      const shortDesc = description.slice(0, 300);
      const audioUrl =
        item.enclosure?.["@_url"] ||
        (Array.isArray(item.enclosure) ? item.enclosure[0]?.["@_url"] : "") ||
        "";
      const pubDateRaw = getText(item.pubDate || item.published || item.updated || "");
      const pubDate = pubDateRaw ? new Date(pubDateRaw).toISOString().slice(0, 10) : "";
      const durationSec = parseDuration(getText(item["itunes:duration"]));
      const duration = fmtDuration(durationSec);
      const epNum = getText(item["itunes:episode"] || "");
      const season = getText(item["itunes:season"] || "");
      const epArt =
        item["itunes:image"]?.["@_href"] || item["itunes:image"] || feedArt;

      return {
        slug: epSlug,
        title,
        description: shortDesc,
        audioUrl,
        pubDate,
        duration,
        durationSec,
        epNum,
        season,
        art: epArt || feedArt,
      };
    })
    .filter(Boolean)
    .slice(0, MAX_EPISODES_PER_SHOW);

  console.log(`  ✓ ${episodes.length} episodes`);

  // ── Write data file ──
  const dataDir = path.join("data", "podcasts");
  fs.mkdirSync(dataDir, { recursive: true });
  const dataObj = {
    slug: showSlug,
    name: show.name,
    author: show.author,
    cat: show.cat,
    feed: show.feed,
    desc: show.desc,
    feedTitle,
    feedDesc: feedDesc.slice(0, 500),
    art: feedArt,
    link: feedLink,
    episodeCount: episodes.length,
    episodes,
  };
  fs.writeFileSync(
    path.join(dataDir, `${showSlug}.json`),
    JSON.stringify(dataObj, null, 2)
  );

  console.log(`  ✓ data/podcasts/${showSlug}.json written`);
  return showSlug;
}

// Emit an ESM barrel that statically imports every show's JSON. The Next.js
// app imports this instead of reading the filesystem at runtime, so the data
// is bundled at build time and works on Cloudflare's edge runtime (no fs).
function writeBarrel(slugs) {
  const ident = (s, i) => `s${i}`;
  const imports = slugs
    .map((s, i) => `import ${ident(s, i)} from "./${s}.json";`)
    .join("\n");
  const list = slugs.map((s, i) => ident(s, i)).join(", ");
  const body = `// AUTO-GENERATED by fetch-feeds.js — do not edit.
${imports}

const ALL_SHOWS = [${list}];
export default ALL_SHOWS;
`;
  fs.writeFileSync(path.join("data", "podcasts", "_all.js"), body);
  console.log(`\n✓ Bundled ${slugs.length} shows into data/podcasts/_all.js`);
}

async function main() {
  console.log("Heckwood — fetching RSS feeds\n" + "=".repeat(40));

  const slugs = [];
  for (const show of SHOWS) {
    const s = await processShow(show);
    if (s) slugs.push(s);
  }

  writeBarrel(slugs.sort());

  console.log("=".repeat(40));
  console.log(`✓ All feeds processed (${slugs.length} shows).`);
}

main().catch(console.error);
