export async function searchPexels(query: string) {
    const res = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3`,
        {
            headers: {
                Authorization: process.env.PEXELS_API_KEY!,
            },
        }
    );

    if (!res.ok) return [];

    const data = await res.json();

    return data.photos.map((photo: any) => ({
        id: photo.id,
        url: photo.src.large2x,
        thumbnail: photo.src.medium,
        width: photo.width,
        height: photo.height,
    }));
}

const API = "https://pixabay.com/api/";

export async function searchPixabay(query: string) {
    const url =
        `${API}?key=${process.env.PIXABAY_API_KEY}`+`&q=${encodeURIComponent(query)}`+"&image_type=photo" +"&per_page=3";

    const res = await fetch(url);
    console.log("Url: ",url);

    if (!res.ok) {
        console.error(res.status, await res.text());
        return [];
    }

    const data = await res.json();
    console.log("Data: ",data)

    return data.hits.map((img: any) => ({
        id: img.id,
        url: img.largeImageURL,
        thumbnail: img.previewURL,
        width: img.imageWidth,
        height: img.imageHeight,
    }));
}

// services/unsplash.ts

const UNSPLASH_API = "https://api.unsplash.com/search/photos";

export async function searchUnsplash(query: string) {
  const res = await fetch(
    `${UNSPLASH_API}?query=${encodeURIComponent(query)}&per_page=3&orientation=portrait`,
    {
      headers: {
        Authorization: `Client-ID ${process.env.UNSPLASH_API_ACCESS_KEY}`,
        "Accept-Version": "v1",
      },
    }
  );

  if (!res.ok) {
    console.error("Unsplash API error:", await res.text());
    return [];
  }

  const data = await res.json();

  return data.results.map((photo: any) => ({
    id: photo.id,
    url: photo.urls.full,
    thumbnail: photo.urls.small,
    width: photo.width,
    height: photo.height,
    photographer: photo.user.name,
    photographerUrl: photo.user.links.html,
    source: "UNSPLASH",
  }));
}

export async function findImage(query: string) {
    // Try Unsplash first
    let images = await searchUnsplash(query);

    if (images.length > 0) {
        return {
            source: "UNSPLASH",
            image: images[0],
        };
    }

    // Fallback to Pixabay
    images = await searchPixabay(query);

    if (images.length > 0) {
        return {
            source: "PIXABAY",
            image: images[0],
        };
    }

    return null;
}