// Placeholder videos from Wikimedia Commons (free licences — credit shown in
// the viewer). Streamed straight from Wikimedia's own transcoded copies, so
// nothing heavy lives in the repo. Swap for your own footage when you have it.
export type VideoTag = "flight" | "school" | "hotel" | "camping" | "trekking" | "adventure" | "travel" | "bir";

export type MediaVideo = {
  id: string;
  /** "reel" = vertical 9:16, "video" = landscape. */
  kind: "reel" | "video";
  tags: VideoTag[];
  label: string;
  width: number;
  height: number;
  duration: number;
  poster: string;
  /** Small (≈480p) WebM — used for the card preview. */
  preview: string;
  /** Biggest sensible WebM (≤1080p) — used in the full-screen viewer. */
  hd: string;
  /** H.264 fallback for browsers without WebM. */
  mp4: string | null;
  credit: string;
  page: string;
};

export const MEDIA_VIDEOS: MediaVideo[] = [
  {
    "id": "shishiku-glide",
    "kind": "reel",
    "tags": [
      "flight",
      "school"
    ],
    "label": "Cloud-top glide",
    "width": 720,
    "height": 1280,
    "duration": 24,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Paragliding_on_Shishiku_Plateau_%28Video%29.webm/500px--Paragliding_on_Shishiku_Plateau_%28Video%29.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Paragliding_on_Shishiku_Plateau_%28Video%29.webm/Paragliding_on_Shishiku_Plateau_%28Video%29.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/3/35/Paragliding_on_Shishiku_Plateau_%28Video%29.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Paragliding_on_Shishiku_Plateau_%28Video%29.webm/Paragliding_on_Shishiku_Plateau_%28Video%29.webm.360p.mpeg4.mov",
    "credit": "Yoshi Canopus · CC0",
    "page": "https://commons.wikimedia.org/wiki/File:Paragliding_on_Shishiku_Plateau_(Video).webm"
  },
  {
    "id": "kullu-bike",
    "kind": "reel",
    "tags": [
      "adventure"
    ],
    "label": "Mountain biking, Kullu",
    "width": 1080,
    "height": 1920,
    "duration": 43,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/1f/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm/960px--Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1f/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1f/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/1f/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm/Mountain_Biking_in_Kullu%2C_Himachal_Pradesh.webm.360p.mpeg4.mov",
    "credit": "Madhrakangri · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Mountain_Biking_in_Kullu,_Himachal_Pradesh.webm"
  },
  {
    "id": "sundarnagar-road",
    "kind": "reel",
    "tags": [
      "travel"
    ],
    "label": "Himachal road view",
    "width": 1080,
    "height": 1920,
    "duration": 19,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/dd/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm/960px--Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/dd/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/dd/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/dd/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm/Roadside_view_near_Sundarnagar%2C_Himachal_Pradesh%2C_India.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Roadside_view_near_Sundarnagar,_Himachal_Pradesh,_India.webm"
  },
  {
    "id": "snowfall",
    "kind": "reel",
    "tags": [
      "bir",
      "trekking"
    ],
    "label": "First snowfall",
    "width": 480,
    "height": 848,
    "duration": 15,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9d/Snowfall_in_himachal.webm/330px--Snowfall_in_himachal.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9d/Snowfall_in_himachal.webm/Snowfall_in_himachal.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/9/9d/Snowfall_in_himachal.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/9d/Snowfall_in_himachal.webm/Snowfall_in_himachal.webm.360p.mpeg4.mov",
    "credit": "Himalayaforall · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Snowfall_in_himachal.webm"
  },
  {
    "id": "landscape-reel",
    "kind": "reel",
    "tags": [
      "bir",
      "trekking",
      "hotel"
    ],
    "label": "Valley views",
    "width": 478,
    "height": 850,
    "duration": 15,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Natural_landscape_%28Himachal_Pradesh%29.webm/330px--Natural_landscape_%28Himachal_Pradesh%29.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ca/Natural_landscape_%28Himachal_Pradesh%29.webm/Natural_landscape_%28Himachal_Pradesh%29.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/c/ca/Natural_landscape_%28Himachal_Pradesh%29.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ca/Natural_landscape_%28Himachal_Pradesh%29.webm/Natural_landscape_%28Himachal_Pradesh%29.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Natural_landscape_(Himachal_Pradesh).webm"
  },
  {
    "id": "shimla-snow",
    "kind": "reel",
    "tags": [
      "travel",
      "bir"
    ],
    "label": "Snow on the road",
    "width": 1080,
    "height": 1920,
    "duration": 33,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5f/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm/960px--Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5f/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5f/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5f/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm/Cars_stuck_in_snowfall_at_Summer_Hill%2C_Shimla%2C_Himachal_Pradesh%2C_2026.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Cars_stuck_in_snowfall_at_Summer_Hill,_Shimla,_Himachal_Pradesh,_2026.webm"
  },
  {
    "id": "bharmour-snow",
    "kind": "reel",
    "tags": [
      "bir",
      "hotel"
    ],
    "label": "Village in snow",
    "width": 480,
    "height": 864,
    "duration": 13,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/17/Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm/330px--Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/17/Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm/Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/1/17/Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/1/17/Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm/Heavy_Snowfall_in_a_Village_in_Bharmour_Region%2C_Chamba_District%2C_Himachal_Pradesh.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Heavy_Snowfall_in_a_Village_in_Bharmour_Region,_Chamba_District,_Himachal_Pradesh.webm"
  },
  {
    "id": "goats",
    "kind": "reel",
    "tags": [
      "trekking",
      "camping",
      "bir"
    ],
    "label": "Trail friends",
    "width": 464,
    "height": 832,
    "duration": 10,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/27/Two_Baby_Goats_in_Himalaya.webm/330px--Two_Baby_Goats_in_Himalaya.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/27/Two_Baby_Goats_in_Himalaya.webm/Two_Baby_Goats_in_Himalaya.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/2/27/Two_Baby_Goats_in_Himalaya.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/2/27/Two_Baby_Goats_in_Himalaya.webm/Two_Baby_Goats_in_Himalaya.webm.360p.mpeg4.mov",
    "credit": "Diikshachauhan3147 · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Two_Baby_Goats_in_Himalaya.webm"
  },
  {
    "id": "palanquin",
    "kind": "reel",
    "tags": [
      "bir"
    ],
    "label": "Village festival",
    "width": 1080,
    "height": 1920,
    "duration": 11,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Ritual_Procession_of_Deity%27s_Palanquin.webm/960px--Ritual_Procession_of_Deity%27s_Palanquin.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Ritual_Procession_of_Deity%27s_Palanquin.webm/Ritual_Procession_of_Deity%27s_Palanquin.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Ritual_Procession_of_Deity%27s_Palanquin.webm/Ritual_Procession_of_Deity%27s_Palanquin.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Ritual_Procession_of_Deity%27s_Palanquin.webm/Ritual_Procession_of_Deity%27s_Palanquin.webm.360p.mpeg4.mov",
    "credit": "Hippiefromhills · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Ritual_Procession_of_Deity%27s_Palanquin.webm"
  },
  {
    "id": "devta",
    "kind": "reel",
    "tags": [
      "bir",
      "hotel"
    ],
    "label": "Local culture",
    "width": 360,
    "height": 640,
    "duration": 13,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6c/Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm/330px--Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm/Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/6/6c/Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6c/Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm/Devta_Balak_Maheshwar%2C_Kullu%2C_Himachal_Pradesh.webm.360p.mpeg4.mov",
    "credit": "Kartiktiktik · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Devta_Balak_Maheshwar,_Kullu,_Himachal_Pradesh.webm"
  },
  {
    "id": "billing-glide",
    "kind": "video",
    "tags": [
      "flight",
      "school"
    ],
    "label": "Paragliding at Billing",
    "width": 848,
    "height": 478,
    "duration": 17,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Paragliding_at_Billing%2C_Kangra.webm/500px--Paragliding_at_Billing%2C_Kangra.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/b/b0/Paragliding_at_Billing%2C_Kangra.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/b/b0/Paragliding_at_Billing%2C_Kangra.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Paragliding_at_Billing%2C_Kangra.webm/Paragliding_at_Billing%2C_Kangra.webm.360p.mpeg4.mov",
    "credit": "Meerah Dhiman · CC BY 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Paragliding_at_Billing,_Kangra.webm"
  },
  {
    "id": "billing-view",
    "kind": "video",
    "tags": [
      "flight",
      "bir",
      "school"
    ],
    "label": "Billing, Kangra",
    "width": 848,
    "height": 478,
    "duration": 13,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/78/Billing%2C_Kangra.webm/500px--Billing%2C_Kangra.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/7/78/Billing%2C_Kangra.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/7/78/Billing%2C_Kangra.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/78/Billing%2C_Kangra.webm/Billing%2C_Kangra.webm.360p.mpeg4.mov",
    "credit": "Meerah Dhiman · CC BY 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Billing,_Kangra.webm"
  },
  {
    "id": "paragliding-india",
    "kind": "video",
    "tags": [
      "flight",
      "school",
      "adventure"
    ],
    "label": "Paragliding in India",
    "width": 1920,
    "height": 1080,
    "duration": 113,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Choose_Your_Own_Adventure_-_Paragliding_-_India.webm/960px--Choose_Your_Own_Adventure_-_Paragliding_-_India.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Choose_Your_Own_Adventure_-_Paragliding_-_India.webm/Choose_Your_Own_Adventure_-_Paragliding_-_India.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/6/68/Choose_Your_Own_Adventure_-_Paragliding_-_India.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/68/Choose_Your_Own_Adventure_-_Paragliding_-_India.webm/Choose_Your_Own_Adventure_-_Paragliding_-_India.webm.360p.mpeg4.mov",
    "credit": "Incredible India · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Choose_Your_Own_Adventure_-_Paragliding_-_India.webm"
  },
  {
    "id": "vol-parapente",
    "kind": "video",
    "tags": [
      "flight",
      "school"
    ],
    "label": "A flight in the sky",
    "width": 960,
    "height": 540,
    "duration": 38,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cf/Vol_en_parapente.webm/960px--Vol_en_parapente.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cf/Vol_en_parapente.webm/Vol_en_parapente.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/c/cf/Vol_en_parapente.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cf/Vol_en_parapente.webm/Vol_en_parapente.webm.360p.mpeg4.mov",
    "credit": "Nicolas Vigier · CC0",
    "page": "https://commons.wikimedia.org/wiki/File:Vol_en_parapente.webm"
  },
  {
    "id": "smooth-line",
    "kind": "video",
    "tags": [
      "school",
      "flight"
    ],
    "label": "Smooth line flying",
    "width": 1920,
    "height": 1080,
    "duration": 86,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bb/Smooth_line_-_Paragliding_Proximity_Flying.webm/960px--Smooth_line_-_Paragliding_Proximity_Flying.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bb/Smooth_line_-_Paragliding_Proximity_Flying.webm/Smooth_line_-_Paragliding_Proximity_Flying.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/b/bb/Smooth_line_-_Paragliding_Proximity_Flying.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/bb/Smooth_line_-_Paragliding_Proximity_Flying.webm/Smooth_line_-_Paragliding_Proximity_Flying.webm.360p.mpeg4.mov",
    "credit": "ChooksProd · CC BY 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Smooth_line_-_Paragliding_Proximity_Flying.webm"
  },
  {
    "id": "giri-bonfire",
    "kind": "video",
    "tags": [
      "camping",
      "hotel"
    ],
    "label": "Campfire evening",
    "width": 1280,
    "height": 720,
    "duration": 135,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/35/Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm/960px--Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm/Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/3/35/Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/35/Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm/Bonfire_at_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm.360p.mpeg4.mov",
    "credit": "Subhashish Panigrahi · CC BY-SA 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Bonfire_at_Giri_Camp,_Himachal_Pradesh,_India.webm"
  },
  {
    "id": "giri-stream",
    "kind": "video",
    "tags": [
      "camping",
      "hotel"
    ],
    "label": "By the stream",
    "width": 640,
    "height": 480,
    "duration": 19,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/38/Streamwater_flourmill%2C_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm/500px--Streamwater_flourmill%2C_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/3/38/Streamwater_flourmill%2C_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/3/38/Streamwater_flourmill%2C_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/3/38/Streamwater_flourmill%2C_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm/Streamwater_flourmill%2C_Giri_Camp%2C_Himachal_Pradesh%2C_India.webm.360p.mpeg4.mov",
    "credit": "Subhashish Panigrahi · CC BY-SA 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Streamwater_flourmill,_Giri_Camp,_Himachal_Pradesh,_India.webm"
  },
  {
    "id": "kullu-village",
    "kind": "video",
    "tags": [
      "hotel",
      "bir",
      "camping"
    ],
    "label": "Village life, Kullu",
    "width": 1920,
    "height": 1080,
    "duration": 56,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/73/Village_Life_kullu_Himachal_Pradesh.webm/960px--Village_Life_kullu_Himachal_Pradesh.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/73/Village_Life_kullu_Himachal_Pradesh.webm/Village_Life_kullu_Himachal_Pradesh.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/7/73/Village_Life_kullu_Himachal_Pradesh.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/7/73/Village_Life_kullu_Himachal_Pradesh.webm/Village_Life_kullu_Himachal_Pradesh.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Village_Life_kullu_Himachal_Pradesh.webm"
  },
  {
    "id": "deodar-meadow",
    "kind": "video",
    "tags": [
      "trekking",
      "hotel",
      "camping"
    ],
    "label": "Deodar meadow",
    "width": 1920,
    "height": 1080,
    "duration": 27,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/80/Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm/960px--Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/80/Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm/Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/8/80/Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/8/80/Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm/Meadow_and_Temple_of_Shree_Nag_%28Deity%29_Amid_Deodar_Forest.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Meadow_and_Temple_of_Shree_Nag_(Deity)_Amid_Deodar_Forest.webm"
  },
  {
    "id": "bouldering",
    "kind": "video",
    "tags": [
      "adventure",
      "trekking"
    ],
    "label": "Bouldering, Spiti",
    "width": 1280,
    "height": 720,
    "duration": 305,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/90/Bouldering_in_Chhatru_Chotadara%28India%29.webm/960px--Bouldering_in_Chhatru_Chotadara%28India%29.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/90/Bouldering_in_Chhatru_Chotadara%28India%29.webm/Bouldering_in_Chhatru_Chotadara%28India%29.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/9/90/Bouldering_in_Chhatru_Chotadara%28India%29.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/9/90/Bouldering_in_Chhatru_Chotadara%28India%29.webm/Bouldering_in_Chhatru_Chotadara%28India%29.webm.360p.mpeg4.mov",
    "credit": "vipin lal · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Bouldering_in_Chhatru_Chotadara(India).webm"
  },
  {
    "id": "rohtang",
    "kind": "video",
    "tags": [
      "travel",
      "adventure"
    ],
    "label": "Road to Rohtang",
    "width": 1920,
    "height": 1080,
    "duration": 31,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4e/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm/960px--Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4e/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/4/4e/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4e/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm.360p.mpeg4.mov",
    "credit": "Yann Forget · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Road_to_Rohtang_pass_on_the_Manali-Leh_Highway.webm"
  },
  {
    "id": "rohtang-2",
    "kind": "video",
    "tags": [
      "travel"
    ],
    "label": "Mountain highway",
    "width": 1920,
    "height": 1080,
    "duration": 21,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm/960px--Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a2/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/a/a2/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/a2/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_2.webm.360p.mpeg4.mov",
    "credit": "Yann Forget · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Road_to_Rohtang_pass_on_the_Manali-Leh_Highway,_2.webm"
  },
  {
    "id": "manali-cycling",
    "kind": "video",
    "tags": [
      "adventure",
      "travel"
    ],
    "label": "Cycling the highway",
    "width": 1920,
    "height": 1080,
    "duration": 6,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Cycling_on_the_Manali-Leh_Highway.webm/960px--Cycling_on_the_Manali-Leh_Highway.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4a/Cycling_on_the_Manali-Leh_Highway.webm/Cycling_on_the_Manali-Leh_Highway.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/4/4a/Cycling_on_the_Manali-Leh_Highway.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4a/Cycling_on_the_Manali-Leh_Highway.webm/Cycling_on_the_Manali-Leh_Highway.webm.360p.mpeg4.mov",
    "credit": "Yann Forget · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Cycling_on_the_Manali-Leh_Highway.webm"
  },
  {
    "id": "ebc-trek",
    "kind": "video",
    "tags": [
      "trekking",
      "camping"
    ],
    "label": "Himalayan trek",
    "width": 1920,
    "height": 1080,
    "duration": 238,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm/960px--The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cc/The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm/The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/c/cc/The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/cc/The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm/The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm.360p.mpeg4.mov",
    "credit": "Amit Haware · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:The_Himalayan_-_Mt.Everest_Base_Camp_trek_HD_Time_Lapse.webm"
  },
  {
    "id": "banjar",
    "kind": "video",
    "tags": [
      "bir",
      "trekking"
    ],
    "label": "Banjar valley",
    "width": 848,
    "height": 478,
    "duration": 4,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Banjar_Valley.webm/500px--Banjar_Valley.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Banjar_Valley.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/b/ba/Banjar_Valley.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/Banjar_Valley.webm/Banjar_Valley.webm.360p.mpeg4.mov",
    "credit": "Meerah Dhiman · CC BY 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Banjar_Valley.webm"
  },
  {
    "id": "snow-leopard",
    "kind": "video",
    "tags": [
      "bir"
    ],
    "label": "Wildlife of the Himalaya",
    "width": 1280,
    "height": 720,
    "duration": 83,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/06/Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm/960px--Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/06/Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm/Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/0/06/Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm?utm_source=commons.wikimedia.org&utm_campaign=api&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/06/Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm/Snow_leopard_family%2C_Spiti%2C_Himachal_Pradesh%2C_India.webm.360p.mpeg4.mov",
    "credit": "Rishi Sharma, Nature Conservation Foundation, India (uploaded by Matthias Fiechter) · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Snow_leopard_family,_Spiti,_Himachal_Pradesh,_India.webm"
  },
  {
    "id": "tandem-biplace",
    "kind": "video",
    "tags": [
      "flight"
    ],
    "label": "Tandem flight",
    "width": 1920,
    "height": 1080,
    "duration": 63,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/93_RAM_-_Vol_en_parapente_biplace.webm/960px--93_RAM_-_Vol_en_parapente_biplace.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/93_RAM_-_Vol_en_parapente_biplace.webm/93_RAM_-_Vol_en_parapente_biplace.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/93_RAM_-_Vol_en_parapente_biplace.webm/93_RAM_-_Vol_en_parapente_biplace.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/93_RAM_-_Vol_en_parapente_biplace.webm/93_RAM_-_Vol_en_parapente_biplace.webm.360p.mpeg4.mov",
    "credit": "93 RAM · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:93_RAM_-_Vol_en_parapente_biplace.webm"
  },
  {
    "id": "tandem-golte",
    "kind": "video",
    "tags": [
      "flight",
      "adventure"
    ],
    "label": "Tandem over the ridge",
    "width": 3840,
    "height": 2160,
    "duration": 61,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm/960px--Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b9/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b9/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b9/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm/Fly_Golte%2C_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm.360p.mpeg4.mov",
    "credit": "Nejc Sedovnik · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Fly_Golte,_fly_Slovenia_-_paragliding_tandem_Slovenia_5.webm"
  },
  {
    "id": "fpv-glide",
    "kind": "video",
    "tags": [
      "flight",
      "adventure"
    ],
    "label": "Drone's-eye glide",
    "width": 3840,
    "height": 2160,
    "duration": 59,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm/960px--Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ca/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ca/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/c/ca/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm/Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm.360p.mpeg4.mov",
    "credit": "SE FPV · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Paragliding_above_Madeira_Portugal_as_viewed_from_FPV_drone.webm"
  },
  {
    "id": "ridge-soar",
    "kind": "video",
    "tags": [
      "flight",
      "school"
    ],
    "label": "Ridge soaring",
    "width": 1280,
    "height": 720,
    "duration": 22,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6b/Black%27s_Beach.webm/960px--Black%27s_Beach.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6b/Black%27s_Beach.webm/Black%27s_Beach.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/6/6b/Black%27s_Beach.webm?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/6b/Black%27s_Beach.webm/Black%27s_Beach.webm.360p.mpeg4.mov",
    "credit": "@PeterChenW · CC BY 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Black%27s_Beach.webm"
  },
  {
    "id": "launch-practice",
    "kind": "video",
    "tags": [
      "school"
    ],
    "label": "Launch practice",
    "width": 640,
    "height": 480,
    "duration": 60,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b9/Paraglider_launch_Mam_Tor.webm/500px--Paraglider_launch_Mam_Tor.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b9/Paraglider_launch_Mam_Tor.webm/Paraglider_launch_Mam_Tor.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/b/b9/Paraglider_launch_Mam_Tor.webm?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b9/Paraglider_launch_Mam_Tor.webm/Paraglider_launch_Mam_Tor.webm.360p.mpeg4.mov",
    "credit": "Chris Veness · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Paraglider_launch_Mam_Tor.webm"
  },
  {
    "id": "pomjan",
    "kind": "video",
    "tags": [
      "school",
      "flight"
    ],
    "label": "Evening flight",
    "width": 1920,
    "height": 1080,
    "duration": 78,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/af/Paragliding_in_Pomjan_by_Koper.webm/960px--Paragliding_in_Pomjan_by_Koper.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Paragliding_in_Pomjan_by_Koper.webm/Paragliding_in_Pomjan_by_Koper.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Paragliding_in_Pomjan_by_Koper.webm/Paragliding_in_Pomjan_by_Koper.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/af/Paragliding_in_Pomjan_by_Koper.webm/Paragliding_in_Pomjan_by_Koper.webm.360p.mpeg4.mov",
    "credit": "Áron Csendes · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Paragliding_in_Pomjan_by_Koper.webm"
  },
  {
    "id": "hike-fly",
    "kind": "video",
    "tags": [
      "school",
      "adventure",
      "trekking"
    ],
    "label": "Hike & fly",
    "width": 3840,
    "height": 1634,
    "duration": 32,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4a/Hike%26fly_Alps_2024.webm/960px--Hike%26fly_Alps_2024.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4a/Hike%26fly_Alps_2024.webm/Hike%26fly_Alps_2024.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4a/Hike%26fly_Alps_2024.webm/Hike%26fly_Alps_2024.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/4/4a/Hike%26fly_Alps_2024.webm/Hike%26fly_Alps_2024.webm.360p.mpeg4.mov",
    "credit": "Nejc Sedovnik · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Hike%26fly_Alps_2024.webm"
  },
  {
    "id": "rafting",
    "kind": "video",
    "tags": [
      "adventure"
    ],
    "label": "River rafting",
    "width": 1920,
    "height": 1080,
    "duration": 23,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/02/Rogue_River_rafting_%2822717455715%29.webm/960px--Rogue_River_rafting_%2822717455715%29.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/02/Rogue_River_rafting_%2822717455715%29.webm/Rogue_River_rafting_%2822717455715%29.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/02/Rogue_River_rafting_%2822717455715%29.webm/Rogue_River_rafting_%2822717455715%29.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/02/Rogue_River_rafting_%2822717455715%29.webm/Rogue_River_rafting_%2822717455715%29.webm.360p.mpeg4.mov",
    "credit": "BLM Oregon & Washington · Public domain",
    "page": "https://commons.wikimedia.org/wiki/File:Rogue_River_rafting_(22717455715).webm"
  },
  {
    "id": "rafting-2",
    "kind": "video",
    "tags": [
      "adventure"
    ],
    "label": "Whitewater run",
    "width": 1920,
    "height": 1080,
    "duration": 30,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/ba/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm/960px--Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/ba/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm/Rafting_the_Rogue_Wild_%26_Scenic_River_%2834874594925%29.webm.360p.mpeg4.mov",
    "credit": "BLM Oregon & Washington · Public domain",
    "page": "https://commons.wikimedia.org/wiki/File:Rafting_the_Rogue_Wild_%26_Scenic_River_(34874594925).webm"
  },
  {
    "id": "manali-keylong",
    "kind": "video",
    "tags": [
      "travel",
      "adventure"
    ],
    "label": "Manali to Keylong by bike",
    "width": 1920,
    "height": 1080,
    "duration": 86,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0f/Manali-_KeyLong_on_bike%2C_2012.webm/960px--Manali-_KeyLong_on_bike%2C_2012.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0f/Manali-_KeyLong_on_bike%2C_2012.webm/Manali-_KeyLong_on_bike%2C_2012.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0f/Manali-_KeyLong_on_bike%2C_2012.webm/Manali-_KeyLong_on_bike%2C_2012.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0f/Manali-_KeyLong_on_bike%2C_2012.webm/Manali-_KeyLong_on_bike%2C_2012.webm.360p.mpeg4.mov",
    "credit": "Hai Long Nguyen · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Manali-_KeyLong_on_bike,_2012.webm"
  },
  {
    "id": "rohtang-4",
    "kind": "video",
    "tags": [
      "travel"
    ],
    "label": "Mountain highway",
    "width": 1920,
    "height": 1080,
    "duration": 78,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm/960px--Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/d/da/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm/Road_to_Rohtang_pass_on_the_Manali-Leh_Highway%2C_4_stabilized.webm.360p.mpeg4.mov",
    "credit": "Yann Forget · CC BY 3.0",
    "page": "https://commons.wikimedia.org/wiki/File:Road_to_Rohtang_pass_on_the_Manali-Leh_Highway,_4_stabilized.webm"
  },
  {
    "id": "natti",
    "kind": "video",
    "tags": [
      "bir",
      "hotel"
    ],
    "label": "Pahari Natti dance",
    "width": 3840,
    "height": 2160,
    "duration": 34,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/66/Folk_Dance_Natti.webm/960px--Folk_Dance_Natti.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/66/Folk_Dance_Natti.webm/Folk_Dance_Natti.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/66/Folk_Dance_Natti.webm/Folk_Dance_Natti.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/6/66/Folk_Dance_Natti.webm/Folk_Dance_Natti.webm.360p.mpeg4.mov",
    "credit": "Hippiefromhills · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Folk_Dance_Natti.webm"
  },
  {
    "id": "campfire-night",
    "kind": "video",
    "tags": [
      "camping",
      "hotel"
    ],
    "label": "Campfire at night",
    "width": 1280,
    "height": 720,
    "duration": 30,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/aa/Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm/960px--Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/aa/Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm/Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/a/aa/Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm?utm_source=commons.wikimedia.org&utm_campaign=imageinfo&utm_content=original",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/aa/Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm/Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm.360p.mpeg4.mov",
    "credit": "Virginia State Parks · CC BY 2.0",
    "page": "https://commons.wikimedia.org/wiki/File:Campfire_at_night_-_Claytor_Lake_State_Park_-_video.webm"
  },
  {
    "id": "campfire-reel",
    "kind": "reel",
    "tags": [
      "camping",
      "hotel"
    ],
    "label": "Campfire glow",
    "width": 608,
    "height": 1080,
    "duration": 11,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/ab/Campfire_Video_1.webm/500px--Campfire_Video_1.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ab/Campfire_Video_1.webm/Campfire_Video_1.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ab/Campfire_Video_1.webm/Campfire_Video_1.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/a/ab/Campfire_Video_1.webm/Campfire_Video_1.webm.360p.mpeg4.mov",
    "credit": "Virginia State Parks · CC BY 2.0",
    "page": "https://commons.wikimedia.org/wiki/File:Campfire_Video_1.webm"
  },
  {
    "id": "campfire-reel-2",
    "kind": "reel",
    "tags": [
      "camping"
    ],
    "label": "Fireside",
    "width": 608,
    "height": 1080,
    "duration": 11,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0a/Campfire_video_2.webm/500px--Campfire_video_2.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0a/Campfire_video_2.webm/Campfire_video_2.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0a/Campfire_video_2.webm/Campfire_video_2.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0a/Campfire_video_2.webm/Campfire_video_2.webm.360p.mpeg4.mov",
    "credit": "Virginia State Parks · CC BY 2.0",
    "page": "https://commons.wikimedia.org/wiki/File:Campfire_video_2.webm"
  },
  {
    "id": "monastery-day",
    "kind": "reel",
    "tags": [
      "bir",
      "travel",
      "hotel"
    ],
    "label": "Monastery celebrations",
    "width": 822,
    "height": 1920,
    "duration": 19,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm/500px--Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5c/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5c/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/5/5c/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm/Guru_Padmasambhava_Day_Celebrations%2C_Dorje_Drak_Monastery%2C_Panthaghati%2C_Shimla%2C_Himachal_Pradesh%2C_India.webm.360p.mpeg4.mov",
    "credit": "Himalayan Bits · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Guru_Padmasambhava_Day_Celebrations,_Dorje_Drak_Monastery,_Panthaghati,_Shimla,_Himachal_Pradesh,_India.webm"
  },
  {
    "id": "basgo-winter",
    "kind": "reel",
    "tags": [
      "travel",
      "trekking"
    ],
    "label": "Winter monastery view",
    "width": 1080,
    "height": 1920,
    "duration": 8,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0c/Winter_View_of_the_Basgo_Castle_and_Monastery.webm/500px--Winter_View_of_the_Basgo_Castle_and_Monastery.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0c/Winter_View_of_the_Basgo_Castle_and_Monastery.webm/Winter_View_of_the_Basgo_Castle_and_Monastery.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0c/Winter_View_of_the_Basgo_Castle_and_Monastery.webm/Winter_View_of_the_Basgo_Castle_and_Monastery.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/0/0c/Winter_View_of_the_Basgo_Castle_and_Monastery.webm/Winter_View_of_the_Basgo_Castle_and_Monastery.webm.360p.mpeg4.mov",
    "credit": "Stanzin1945 · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Winter_View_of_the_Basgo_Castle_and_Monastery.webm"
  },
  {
    "id": "copper-pot",
    "kind": "reel",
    "tags": [
      "hotel"
    ],
    "label": "Pahari kitchen",
    "width": 1080,
    "height": 1920,
    "duration": 22,
    "poster": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b0/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm/500px--Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm.jpg?utm_source=commons.wikimedia.org&utm_campaign=imageinfo",
    "preview": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm.480p.vp9.webm",
    "hd": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm.1080p.vp9.webm",
    "mp4": "https://upload.wikimedia.org/wikipedia/commons/transcoded/b/b0/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm/Copper_water_pot_with_paraat_lid_%28Himachal_Pradesh%29.webm.360p.mpeg4.mov",
    "credit": "Rajani Gairshail · CC BY-SA 4.0",
    "page": "https://commons.wikimedia.org/wiki/File:Copper_water_pot_with_paraat_lid_(Himachal_Pradesh).webm"
  }
];
