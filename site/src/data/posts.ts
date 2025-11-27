export type PostSummary = {
  order: number;
  permalink: string;
  title: string;
  description: string;
  heroImage: string | null;
  publishedAt: string;
  readingTime: number;
  sourceUrl: string;
};

export const postsIndex: PostSummary[] = [
  {
    "order": 1,
    "permalink": "running-n8n-locally-with-ngrok",
    "title": "Running N8N Locally with Ngrok",
    "description": "Running N8N Locally with Ngrok If you've made it past the basics of N8N, this guide will show you how to run it locally and make it accessible via a public URL using a tunnel servi",
    "heroImage": "/medium-assets/01/img-01.png",
    "publishedAt": "2025-10-27T06:24:44.000Z",
    "readingTime": 2,
    "sourceUrl": "https://medium.com/@mister.funable/running-n8n-locally-with-ngrok-734af69e1530"
  },
  {
    "order": 2,
    "permalink": "how-not-to-work-with-local-files-in-n8n",
    "title": "How (Not) to Work with Local Files in N8N",
    "description": "How (Not) to Work with Local Files in N8N I was wondering if it was worth automating video uploads through n8n, so I decided to set up a quick test configuration. I used the Read/W",
    "heroImage": "/medium-assets/02/img-01.png",
    "publishedAt": "2025-11-10T16:03:26.000Z",
    "readingTime": 2,
    "sourceUrl": "https://medium.com/@mister.funable/how-not-to-work-with-local-files-in-n8n-8c4545a3f2b2"
  },
  {
    "order": 3,
    "permalink": "getting-started-with-meshtastic-on-heltec-v3-and-lilygo-t-beam",
    "title": "Getting Started with Meshtastic on Heltec V3 and LILYGO T-Beam",
    "description": "Getting Started with Meshtastic on Heltec V3 and LILYGO T Beam A friend gifted me a Heltec V3 , and it immediately pulled me into the Meshtastic rabbit hole. The idea of mesh netwo",
    "heroImage": "/medium-assets/03/img-01.png",
    "publishedAt": "2025-11-14T20:14:19.000Z",
    "readingTime": 3,
    "sourceUrl": "https://radiohackers.com/getting-started-with-meshtastic-on-heltec-v3-and-lilygo-t-beam-e287f44df7b8"
  },
  {
    "order": 4,
    "permalink": "meshtastic-questions-i-had-after-getting-started",
    "title": "Meshtastic Questions I Had After Getting Started",
    "description": "Meshtastic Questions I Had After Getting Started After flashing my first Meshtastic device, I had about a hundred questions. Here are the ones I actually figured out, organized fro",
    "heroImage": "/medium-assets/04/img-01.png",
    "publishedAt": "2025-11-14T21:19:05.000Z",
    "readingTime": 6,
    "sourceUrl": "https://medium.com/@mister.funable/meshtastic-questions-i-had-after-getting-started-b0a634a39bae"
  },
  {
    "order": 5,
    "permalink": "setting-up-a-local-meshtastic-message-forwarder",
    "title": "Setting Up a Local Meshtastic Message Forwarder",
    "description": "Setting Up a Local Meshtastic Message Forwarder After getting my Meshtastic devices running, I wanted to do more than just send messages through the app. The goal: set up a local f",
    "heroImage": "/medium-assets/05/img-01.png",
    "publishedAt": "2025-11-14T22:07:25.000Z",
    "readingTime": 6,
    "sourceUrl": "https://medium.com/@mister.funable/setting-up-a-local-meshtastic-message-forwarder-c527bca2eb0e"
  },
  {
    "order": 6,
    "permalink": "n8n-nodes-you-should-know-but-probably-dont",
    "title": "N8N Nodes You Should Know (But Probably Don’t)",
    "description": "N8N Nodes You Should Know (But Probably Don't) Everyone talks about AI agents and the amazing workflows that you can automate with N8N, which is cool. I get it. But can we talk abo",
    "heroImage": "/medium-assets/06/img-01.png",
    "publishedAt": "2025-11-16T03:17:55.000Z",
    "readingTime": 8,
    "sourceUrl": "https://medium.com/@mister.funable/n8n-nodes-you-should-know-but-probably-dont-06d61b77c457"
  },
  {
    "order": 7,
    "permalink": "sony-a6700-settings-for-unboxing-and-figure-videos",
    "title": "Sony A6700 Settings for Unboxing and Figure Videos",
    "description": "Sony A6700 Settings for Unboxing and Figure Videos I do unboxing videos and music videos of collectibles for fun. Nothing fancy, but I try to get as close as possible in quality to",
    "heroImage": "/medium-assets/07/img-01.png",
    "publishedAt": "2025-11-17T04:53:09.000Z",
    "readingTime": 7,
    "sourceUrl": "https://medium.com/@mister.funable/sony-a6700-settings-for-unboxing-and-figure-videos-4ca3ddd4ecac"
  },
  {
    "order": 8,
    "permalink": "fixing-n8n-docker-error-the-x-forwarded-for-issue-bonus",
    "title": "Fixing N8N Docker Error The X-Forwarded-For Issue + Bonus",
    "description": "Fixing N8N Docker Error: The X Forwarded For Issue + Bonus So you're running N8N locally in Docker, maybe conveniently for this post using Ngrok to expose it, and suddenly your log",
    "heroImage": "/medium-assets/08/img-01.png",
    "publishedAt": "2025-11-18T05:00:06.000Z",
    "readingTime": 4,
    "sourceUrl": "https://medium.com/@mister.funable/fixing-n8n-docker-error-the-x-forwarded-for-issue-bonus-d6924694b09a"
  },
  {
    "order": 9,
    "permalink": "getting-instagram-posts-with-n8n-the-simple-way-part-1",
    "title": "Getting Instagram Posts with N8N (The Simple Way Part 1)",
    "description": "Getting Instagram Posts with N8N (The Simple Way Part 1) So I wanted to automate sharing my Instagram posts on X through N8N. But the Meta Developer portal setup is confusing, luck",
    "heroImage": "/medium-assets/09/img-01.png",
    "publishedAt": "2025-11-18T12:03:01.000Z",
    "readingTime": 5,
    "sourceUrl": "https://medium.com/@mister.funable/getting-instagram-posts-with-n8n-the-simple-way-part-1-c66cb5217054"
  },
  {
    "order": 10,
    "permalink": "figma-body-alternatives-from-archetypes-to-art",
    "title": "Figma Body Alternatives From Archetypes to… Art",
    "description": "Figma Body Alternatives: From Archetypes to... Art Exchanging accessories between Figma figures is common. But what about swapping bodies? Are there alternatives to the standard Ar",
    "heroImage": "/medium-assets/10/img-01.png",
    "publishedAt": "2025-11-20T02:02:07.000Z",
    "readingTime": 6,
    "sourceUrl": "https://medium.com/@mister.funable/figma-body-alternatives-from-archetypes-to-art-b02c4a78390b"
  },
  {
    "order": 11,
    "permalink": "how-to-publish-your-n8n-template",
    "title": "How to Publish Your n8n Template",
    "description": "How to Publish Your n8n Template I submitted a template a few months ago (Auto Translate YouTube Video Content with Google Gemini AI) and I'm currently doing the process again for ",
    "heroImage": "/medium-assets/11/img-01.png",
    "publishedAt": "2025-11-21T06:18:40.000Z",
    "readingTime": 4,
    "sourceUrl": "https://medium.com/@mister.funable/how-to-publish-your-n8n-template-375832d8efd7"
  },
  {
    "order": 12,
    "permalink": "about-prompts-ai-and-playing-with-nanobana-pro",
    "title": "About Prompts, AI and Playing with Nanobana Pro",
    "description": "About Prompts, AI and Playing with Nanobana Pro I was writing about the design progression of the character I use to represent my stuff, but I found it more interesting to actually",
    "heroImage": "/medium-assets/12/img-01.png",
    "publishedAt": "2025-11-22T01:02:16.000Z",
    "readingTime": 3,
    "sourceUrl": "https://medium.com/@mister.funable/about-prompts-ai-and-playing-with-nanobana-pro-3737479e6f53"
  },
  {
    "order": 13,
    "permalink": "my-favorite-figmas-2025",
    "title": "My Favorite Figmas — 2025",
    "description": "My Favorite Figmas 2025 With over 160+ Figmas, of course I have some favorites. I meant to do a video about this, but if I don't... at least I have this post! You can tell a",
    "heroImage": "/medium-assets/13/img-01.png",
    "publishedAt": "2025-11-27T01:16:54.000Z",
    "readingTime": 2,
    "sourceUrl": "https://medium.com/@mister.funable/my-favorite-figmas-2025-a4dd70db6be4"
  }
];