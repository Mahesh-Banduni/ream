// const PIXABAY_AUDIO_API = "https://pixabay.com/api/audio/";

// export interface BackgroundMusicTrack {
//   id: string | number;
//   name: string;
//   style?: string;
//   tags?: string[];
//   url: string;
//   preview?: string;
//   duration?: number;
//   source: string;
// }

// const CURATED_BG_MUSIC: BackgroundMusicTrack[] = [
//   {
//     id: "bgm-lofi-chill",
//     name: "Lo-Fi Chill & Relaxing Beat",
//     style: "Lo-Fi / Chill",
//     tags: ["lo-fi", "lofi", "chill", "relaxing", "study", "casual", "ambient", "soft"],
//     url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Piano_Lo-Fi_Beat.mp3",
//     preview: "https://upload.wikimedia.org/wikipedia/commons/6/65/Piano_Lo-Fi_Beat.mp3",
//     duration: 120,
//     source: "CURATED_ROYALTY_FREE",
//   },
//   {
//     id: "bgm-upbeat-synth",
//     name: "Upbeat Corporate Tech Synth",
//     style: "Upbeat / Tech",
//     tags: ["upbeat", "synth", "tech", "technology", "modern", "energetic", "corporate", "coding", "growth"],
//     url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Electronic_Beat.mp3",
//     preview: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Electronic_Beat.mp3",
//     duration: 140,
//     source: "CURATED_ROYALTY_FREE",
//   },
//   {
//     id: "bgm-corporate-inspire",
//     name: "Inspiring Business & Innovation",
//     style: "Professional / Inspiring",
//     tags: ["professional", "business", "inspiring", "educational", "motivational", "clean", "minimal"],
//     url: "https://upload.wikimedia.org/wikipedia/commons/6/65/Piano_Lo-Fi_Beat.mp3",
//     preview: "https://upload.wikimedia.org/wikipedia/commons/6/65/Piano_Lo-Fi_Beat.mp3",
//     duration: 150,
//     source: "CURATED_ROYALTY_FREE",
//   },
//   {
//     id: "bgm-energetic-fun",
//     name: "Funny & Upbeat Dynamic Groove",
//     style: "Funny / Energetic",
//     tags: ["funny", "humorous", "witty", "playful", "fun", "dynamic", "groove", "viral", "tips"],
//     url: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Electronic_Beat.mp3",
//     preview: "https://upload.wikimedia.org/wikipedia/commons/3/34/Sound_Effect_-_Electronic_Beat.mp3",
//     duration: 110,
//     source: "CURATED_ROYALTY_FREE",
//   },
// ];

// export async function searchPixabayMusic(query: string) {
//   try {
//     const apiKey = process.env.PIXABAY_API_KEY;
//     if (!apiKey) {
//       return [];
//     }

//     const url =
//       `${PIXABAY_AUDIO_API}?key=${apiKey}` +
//       `&q=${encodeURIComponent(query)}` +
//       `&per_page=5`;

//     const res = await fetch(url, {
//       headers: {
//         "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//         "Accept": "application/json",
//       },
//     });

//     if (!res.ok) {
//       console.warn("Pixabay Audio API returned status:", res.status, res.statusText);
//       return [];
//     }

//     const data = await res.json();
//     if (!data || !Array.isArray(data.hits)) {
//       return [];
//     }

//     return data.hits.map((track: any) => ({
//       id: track.id,
//       name: track.tags,
//       duration: track.duration,
//       preview: track.audio || track.previewURL || track.audioURL,
//       url: track.audio || track.previewURL || track.audioURL,
//       user: track.user,
//       userImage: track.userImageURL,
//       downloads: track.downloads,
//       likes: track.likes,
//       source: "PIXABAY",
//     }));
//   } catch (error) {
//     console.warn("Pixabay audio search skipped:", error);
//     return [];
//   }
// }

// export async function findBackgroundMusic(query: string) {
//   let tracks = await searchPixabayMusic(query);

//   if (tracks && tracks.length > 0) {
//     const selected = tracks[Math.floor(Math.random() * tracks.length)];
//     return {
//       source: "PIXABAY",
//       music: selected,
//     };
//   }

//   // Fallback to curated royalty-free tracks matching style keywords
//   const normalizedQuery = (query || "").toLowerCase();
//   const queryWords = normalizedQuery.split(/\s+/).filter(Boolean);

//   const matched = CURATED_BG_MUSIC.filter((track) =>
//     track.tags?.some((tag) =>
//       queryWords.some((word) => word.includes(tag) || tag.includes(word))
//     )
//   );

//   const pool = matched.length > 0 ? matched : CURATED_BG_MUSIC;
//   const selected = pool[Math.floor(Math.random() * pool.length)];

//   return {
//     source: selected.source,
//     music: selected,
//   };
// }

const FREESOUND_API = "https://freesound.org/apiv2/search/text/";
const JAMENDO_API = "https://api.jamendo.com/v3.0/tracks";

export async function searchFreesound(query: string) {
  try {
    const apiKey = process.env.FREESOUND_API_KEY;

    if (!apiKey) return [];

    const url =
      `${FREESOUND_API}?query=${encodeURIComponent(query + " instrumental")}` +
      `&fields=id,name,duration,previews,username,license` +
      `&page_size=5` +
      `&sort=score` +
      `&token=${apiKey}`;

    const res = await fetch(url);

    if (!res.ok) {
      console.warn("Freesound API:", res.status);
      return [];
    }

    const data = await res.json();

    return data.results.map((sound: any) => ({
      id: sound.id,
      name: sound.name,
      duration: sound.duration,
      url:
        sound.previews?.["preview-hq-mp3"] ??
        sound.previews?.["preview-lq-mp3"],
      artist: sound.username,
      license: sound.license,
      source: "FREESOUND",
    }));
  } catch (err) {
    console.warn(err);
    return [];
  }
}

export async function searchJamendoMusic(query: string) {
  try {
    const clientId = process.env.JAMENDO_CLIENT_ID;

    if (!clientId) return [];

    const url =
      `${JAMENDO_API}?client_id=${clientId}` +
      `&format=json` +
      `&limit=5` +
      `&search=${encodeURIComponent(query)}` +
      `&include=musicinfo`;

    const res = await fetch(url);

    if (!res.ok) {
      console.warn("Jamendo API:", res.status);
      return [];
    }

    const data = await res.json();

    return data.results.map((track: any) => ({
      id: track.id,
      name: track.name,
      duration: track.duration,
      url: track.audio,
      preview: track.audiodownload,
      artist: track.artist_name,
      source: "JAMENDO",
    }));
  } catch (err) {
    console.warn(err);
    return [];
  }
}

export async function findBackgroundMusic(query: string) {
  // Try Freesound first
  const freesoundTracks = await searchFreesound(query);

  if (freesoundTracks.length > 0) {
    return {
      source: "FREESOUND",
      music:
        freesoundTracks[
          Math.floor(Math.random() * freesoundTracks.length)
        ],
    };
  }

  console.log("No Freesound results. Falling back to Jamendo...");

  // Fallback to Jamendo
  const jamendoTracks = await searchJamendoMusic(query);

  if (jamendoTracks.length > 0) {
    return {
      source: "JAMENDO",
      music:
        jamendoTracks[
          Math.floor(Math.random() * jamendoTracks.length)
        ],
    };
  }

  return null;
}