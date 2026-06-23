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
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/3e/e3/9c/3ee39c89-de08-47a6-7f3d-3849cef6d255/mza_16657851278549137484.png/600x600bb.jpg",
    cat: "tech",
    desc: "Conversations about science, technology, history, philosophy and the nature of intelligence and consciousness.",
  },
  {
    name: "Huberman Lab",
    author: "Andrew Huberman",
    feed: "https://feeds.megaphone.fm/hubermanlab",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9a/d3/19/9ad31912-0b5a-a16e-2d7c-9fd074698b9c/mza_8994222203629500925.jpg/600x600bb.jpg",
    cat: "science",
    desc: "Dr. Andrew Huberman discusses neuroscience and science-based tools for everyday life.",
  },
  {
    name: "The Daily",
    author: "The New York Times",
    feed: "https://feeds.simplecast.com/Sl5CSM3S",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/ab/64/66/ab6466a9-9a7d-e20e-7a3d-bc5be37d29ce/mza_15084852813176276273.jpg/600x600bb.jpg",
    cat: "news",
    desc: "Twenty minutes on the biggest story of the day with Times journalists, every weekday morning.",
  },
  {
    name: "How I Built This",
    author: "Guy Raz / NPR",
    feed: "https://feeds.npr.org/510313/podcast.xml",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/13/78/c5/1378c503-4825-eb6d-30d3-0623392a0404/mza_16344886389678439299.jpg/600x600bb.jpg",
    cat: "business",
    desc: "Guy Raz dives into the stories behind the world's best-known companies and entrepreneurs.",
  },
  {
    name: "Serial",
    author: "Serial Productions",
    feed: "https://feeds.simplecast.com/PpzWFGhg",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9a/fb/87/9afb8760-0e05-2b3e-24a2-7e14cce74570/mza_14816055607064169808.jpg/600x600bb.jpg",
    cat: "crime",
    desc: "Investigative journalism on real-world cases told as gripping serialised stories.",
  },
  {
    name: "Darknet Diaries",
    author: "Jack Rhysider",
    feed: "https://feeds.megaphone.fm/darknetdiaries",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts122/v4/3a/80/a7/3a80a7db-5620-f77b-9935-016e61cc2fbc/mza_9399859904175514567.jpg/600x600bb.jpg",
    cat: "tech",
    desc: "True stories from the dark side of the internet — hacks, breaches, and cyber crime.",
  },
  {
    name: "Radiolab",
    author: "WNYC Studios",
    feed: "https://feeds.feedburner.com/radiolab",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/2b/b2/4d/2bb24d28-f3bb-916f-6bf3-9e125ba5219b/mza_4476298389845914795.jpg/600x600bb.jpg",
    cat: "science",
    desc: "Radiolab explores big questions about human experience through science, philosophy and storytelling.",
  },
  {
    name: "Planet Money",
    author: "NPR",
    feed: "https://feeds.npr.org/510289/podcast.xml",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/85/df/53/85df5334-0fae-28a9-2bc4-b97b81061d0e/mza_10839245066228881011.jpg/600x600bb.jpg",
    cat: "business",
    desc: "Planet Money explains economics and the global economy through entertaining storytelling.",
  },
  {
    name: "This American Life",
    author: "This American Life",
    feed: "https://feed.thisamericanlife.org/talpodcast",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/64/aa/3a/64aa3a66-a08a-947c-cf21-a5722a1b77ae/mza_11390421932467026234.png/600x600bb.jpg",
    cat: "news",
    desc: "Weekly public radio program featuring personal essays, memoirs, documentary journalism and fiction.",
  },
  {
    name: "a16z Podcast",
    author: "Andreessen Horowitz",
    feed: "https://feeds.simplecast.com/JGE3yC0V",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/3e/04/91/3e049169-5b95-784c-2197-01cfff9f41eb/mza_10026788811025472218.jpg/600x600bb.jpg",
    cat: "tech",
    desc: "The a16z Podcast discusses tech and culture trends with industry experts and thinkers.",
  },
  {
    name: "Hard Fork",
    author: "The New York Times",
    feed: "https://feeds.simplecast.com/6HKOhNgS",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/de/c5/20/dec52092-6be0-9007-875c-6aa8e690a905/mza_12490014444602578825.jpg/600x600bb.jpg",
    cat: "tech",
    desc: "Tech journalists Kevin Roose and Casey Newton make sense of the rapidly changing tech world.",
  },
  {
    name: "The Vergecast",
    author: "The Verge",
    feed: "https://feeds.megaphone.fm/vergecast",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/3b/f7/db/3bf7dbc4-b8cc-3b1f-aab3-d5efdc64b1f1/mza_12861866806353468883.jpeg/600x600bb.jpg",
    cat: "tech",
    desc: "The flagship podcast of The Verge on gadgets, tech and the future.",
  },
  {
    name: "Acquired",
    author: "Ben Gilbert and David Rosenthal",
    feed: "https://feeds.transistor.fm/acquired",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/43/c5/fb/43c5fbdf-b302-053a-2704-ba5f74322625/mza_13119989780540450831.jpg/600x600bb.jpg",
    cat: "tech",
    desc: "The stories and strategies behind the world's greatest companies.",
  },
  {
    name: "Lenny's Podcast",
    author: "Lenny Rachitsky",
    feed: "https://anchor.fm/s/5baf5d24/podcast/rss",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/a3/61/20/a3612021-22e2-bd3f-e235-d6070037e5b3/mza_4615675978652219872.jpg/600x600bb.jpg",
    cat: "tech",
    desc: "Interviews with world-class product leaders and growth experts.",
  },
  {
    name: "Waveform: The MKBHD Podcast",
    author: "Vox Media",
    feed: "https://feeds.megaphone.fm/STU4418364045",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/92/dd/8e/92dd8eed-43ec-dc47-50ae-c1ec7c0a3353/mza_3861776104886813687.jpg/600x600bb.jpg",
    cat: "tech",
    desc: "Marques Brownlee and team on the latest in consumer tech.",
  },
  {
    name: "Hidden Brain",
    author: "Hidden Brain Media",
    feed: "https://feeds.simplecast.com/kwWc0lhf",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/d9/97/f0/d997f0f5-284b-b90c-16f6-e2e675b831b3/mza_3280114077256997969.jpg/600x600bb.jpg",
    cat: "science",
    desc: "Shankar Vedantam explores the unconscious patterns that drive human behavior.",
  },
  {
    name: "StarTalk Radio",
    author: "Neil deGrasse Tyson",
    feed: "https://feeds.simplecast.com/4T39_jAj",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/d7/88/9b/d7889bab-dca5-77ba-3d0c-7fae8f16ab11/mza_8810454848871508.jpg/600x600bb.jpg",
    cat: "science",
    desc: "Neil deGrasse Tyson brings together science, pop culture and comedy.",
  },
  {
    name: "Ologies with Alie Ward",
    author: "Alie Ward",
    feed: "https://feeds.simplecast.com/FO6kxYGj",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/44/4e/42/444e42f6-1ce8-1e7b-2d50-4ed506c27004/mza_18370866018545460916.jpg/600x600bb.jpg",
    cat: "science",
    desc: "Comedic science interviews with experts across every -ology imaginable.",
  },
  {
    name: "Sean Carroll's Mindscape",
    author: "Sean Carroll",
    feed: "https://rss.libsyn.com/shows/604590/destinations/5264190.xml",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts125/v4/d3/22/95/d32295a0-f278-1807-9fde-5698c30aac30/mza_16649100911920251614.jpeg/600x600bb.jpg",
    cat: "science",
    desc: "Physicist Sean Carroll on science, society, philosophy and the universe.",
  },
  {
    name: "Science Vs",
    author: "Spotify Studios",
    feed: "https://feeds.megaphone.fm/sciencevs",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/8a/5c/e5/8a5ce5b7-aa70-b841-38dd-4e7ae572caac/mza_17212608166076908905.jpg/600x600bb.jpg",
    cat: "science",
    desc: "Pits popular opinion against hard science on the topics that matter.",
  },
  {
    name: "Up First",
    author: "NPR",
    feed: "https://feeds.npr.org/510318/podcast.xml",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/0e/35/25/0e352569-e694-81d9-ea55-5f935981c15a/mza_1788275989855583986.png/600x600bb.jpg",
    cat: "news",
    desc: "NPR's morning news briefing: the biggest stories and ideas, in about 15 minutes.",
  },
  {
    name: "The Journal.",
    author: "The Wall Street Journal",
    feed: "https://video-api.wsj.com/podcast/rss/wsj/the-journal",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/91/0e/ca/910eca32-75a3-48b6-9be7-f45799ef5f2f/mza_9869666721903280546.jpg/600x600bb.jpg",
    cat: "news",
    desc: "The most important stories in business and money, weekday mornings.",
  },
  {
    name: "Global News Podcast",
    author: "BBC World Service",
    feed: "https://podcasts.files.bbci.co.uk/p02nq0gn.rss",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/84/57/09/8457093f-677a-d6de-5666-6514cc588a7e/mza_17083078915388787537.jpg/600x600bb.jpg",
    cat: "news",
    desc: "The day's top international news stories from the BBC.",
  },
  {
    name: "Pod Save America",
    author: "Crooked Media",
    feed: "https://audioboom.com/channels/5166624.rss",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/44/dc/61/44dc6141-25e9-5bb3-e19e-a2337233d19e/mza_5506771870755587769.jpg/600x600bb.jpg",
    cat: "news",
    desc: "A no-nonsense conversation about politics from former Obama staffers.",
  },
  {
    name: "Freakonomics Radio",
    author: "Freakonomics Radio + Stitcher",
    feed: "https://feeds.simplecast.com/Y8lFbOT4",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/f7/0c/c5/f70cc540-ce36-d96f-b111-c970aad5505c/mza_17703422762227531425.jpg/600x600bb.jpg",
    cat: "business",
    desc: "Stephen Dubner explores the hidden side of everything.",
  },
  {
    name: "Masters of Scale",
    author: "WaitWhat",
    feed: "https://rss.art19.com/masters-of-scale",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/13/4b/81/134b8173-d713-cbb2-2d3b-4a8692bd87c0/mza_996010941061703843.jpeg/600x600bb.jpg",
    cat: "business",
    desc: "How companies grow from zero to a gazillion, told by the leaders who built them.",
  },
  {
    name: "Crime Junkie",
    author: "audiochuck",
    feed: "https://feeds.simplecast.com/qm_9xx0g",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/8c/35/04/8c350430-2fbf-98d0-0a25-00b76550ffeb/mza_13445204151221888086.jpg/600x600bb.jpg",
    cat: "crime",
    desc: "Weekly true-crime stories told by host Ashley Flowers.",
  },
  {
    name: "Casefile True Crime",
    author: "Casefile Presents",
    feed: "https://feeds.acast.com/public/shows/679acff465f74095106abfaa",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/32/81/a3/3281a345-6fa5-1d0d-b0bc-f02b0850a0ae/mza_17562537467118278179.jpeg/600x600bb.jpg",
    cat: "crime",
    desc: "Anonymous host narrates meticulously researched true-crime cases.",
  },
  {
    name: "My Favorite Murder",
    author: "Exactly Right",
    feed: "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/bdde8bb3-169d-43b1-91d3-b24c0047969c/f450d41f-16bc-4ecd-8f6c-b24c004796e2/podcast.rss",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/1b/80/b1/1b80b146-8608-f76f-97e7-7a2317549c35/mza_14115126871478479568.jpg/600x600bb.jpg",
    cat: "crime",
    desc: "Karen Kilgariff and Georgia Hardstark's hit true-crime comedy podcast.",
  },
  {
    name: "Morbid",
    author: "Morbid Network | Wondery",
    feed: "https://feeds.simplecast.com/ohmVlJZQ",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/a4/69/a6/a469a64c-580d-938a-53f1-893d968e1332/mza_11675757052043432554.jpg/600x600bb.jpg",
    cat: "crime",
    desc: "A lighthearted nightmare of true crime, hosted by Alaina and Ash.",
  },
  {
    name: "Conan O'Brien Needs a Friend",
    author: "Team Coco & Earwolf",
    feed: "https://feeds.simplecast.com/dHoohVNH",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/c6/02/8a/c6028ab7-bffd-db83-53e4-34a4ea9bef21/mza_16944101310108746053.jpg/600x600bb.jpg",
    cat: "comedy",
    desc: "Conan O'Brien finally gives the people what they want: himself, befriending celebrities.",
  },
  {
    name: "SmartLess",
    author: "Wondery",
    feed: "https://feeds.simplecast.com/hNaFxXpO",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/b1/93/5f/b1935f9f-35be-9144-e813-626bd8dabfb4/mza_4132654708551836825.jpg/600x600bb.jpg",
    cat: "comedy",
    desc: "Jason Bateman, Sean Hayes and Will Arnett surprise each other with mystery guests.",
  },
  {
    name: "This Past Weekend w/ Theo Von",
    author: "Theo Von",
    feed: "https://feeds.megaphone.fm/thispastweekend",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/9c/f6/5a/9cf65abb-f8db-fb7b-984f-b4276a1e8c85/mza_2107148709996282347.jpg/600x600bb.jpg",
    cat: "comedy",
    desc: "Comedian Theo Von's weekly stream-of-consciousness conversations.",
  },
  {
    name: "Dan Carlin's Hardcore History",
    author: "Dan Carlin",
    feed: "https://feeds.feedburner.com/dancarlin/history?format=xml",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts115/v4/49/b7/eb/49b7eb32-8f08-6fac-aadb-2f002131fe5f/mza_15196161972010256532.jpg/600x600bb.jpg",
    cat: "history",
    desc: "Dan Carlin's deep, dramatic dives into pivotal moments in history.",
  },
  {
    name: "The Rest Is History",
    author: "Goalhanger",
    feed: "https://feeds.megaphone.fm/GLT4787413333",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/20/ed/c7/20edc799-fdb3-e608-a164-0cdaaee63c6b/mza_16701966284979673066.jpg/600x600bb.jpg",
    cat: "history",
    desc: "Tom Holland and Dominic Sandbrook on the biggest events and characters in history.",
  },
  {
    name: "Throughline",
    author: "NPR",
    feed: "https://feeds.npr.org/510333/podcast.xml",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/da/c1/8e/dac18e58-b4c2-525a-2322-b4ec96ee5008/mza_3318470252564262999.jpg/600x600bb.jpg",
    cat: "history",
    desc: "NPR's history podcast going back in time to understand the present.",
  },
  {
    name: "Stuff You Should Know",
    author: "iHeartPodcasts",
    feed: "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/a91018a4-ea4f-4130-bf55-ae270180c327/44710ecc-10bb-48d1-93c7-ae270180c33e/podcast.rss",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/aa/82/91/aa82912f-23ee-6f6a-583c-a4e993164d0e/mza_12111158076643383507.jpg/600x600bb.jpg",
    cat: "society",
    desc: "Josh and Chuck explain how everything works, one topic at a time.",
  },
  {
    name: "99% Invisible",
    author: "SiriusXM + 99PI",
    feed: "https://feeds.simplecast.com/BqbsxVfO",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts211/v4/79/d0/35/79d035ea-9043-b43e-7380-33cd47bd968b/mza_2606971010425550919.jpg/600x600bb.jpg",
    cat: "society",
    desc: "Design and architecture stories about the unnoticed world around us.",
  },
  {
    name: "TED Talks Daily",
    author: "TED",
    feed: "https://feeds.acast.com/public/shows/67587e77c705e441797aff96",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts116/v4/2e/cf/99/2ecf996f-71f7-604f-b0a0-43116b9d6619/mza_10257768296573848480.png/600x600bb.jpg",
    cat: "society",
    desc: "The latest ideas worth spreading, every weekday, from the TED stage.",
  },
  {
    name: "The Ezra Klein Show",
    author: "New York Times Opinion",
    feed: "https://feeds.simplecast.com/kEKXbjuJ",
    art: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts221/v4/9d/ca/35/9dca35d8-e7d2-7e4f-63b5-c2ff4973a3f5/mza_16891544429738729361.jpg/600x600bb.jpg",
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
  // Prefer the hardcoded art committed in SHOWS (deterministic, no build-time
  // API dependency); fall back to an iTunes lookup, then the feed's own art.
  const feedArt = show.art || (await itunesArtwork(show.name)) || fallbackArt;
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
