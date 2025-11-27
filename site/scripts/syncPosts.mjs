import { promises as fs } from 'node:fs';
import path from 'node:path';

const SITE_ROOT = new URL('..', import.meta.url).pathname;
const EXPORT_ROOT = path.resolve(SITE_ROOT, '../exports/medium_posts');
const POSTS_DIR = path.resolve(SITE_ROOT, 'src/content/posts');
const MEDIA_DEST = path.resolve(SITE_ROOT, 'public/medium-assets');
const MANIFEST_PATH = path.resolve(SITE_ROOT, 'src/data/posts.ts');

const COMMENT_REGEX = /<!--([\s\S]*?)-->/g;
const IMAGE_MARKDOWN_SOURCE = String.raw`!\[(.*?)\]\((images\/(\d{2})\/([^)]+))\)`;
const createImageRegex = () => new RegExp(IMAGE_MARKDOWN_SOURCE, 'g');

const ensureDir = (dir) => fs.mkdir(dir, { recursive: true });

const cleanDir = async (dir) => {
  await fs.rm(dir, { recursive: true, force: true });
  await ensureDir(dir);
};

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/['"“”‘’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const yamlString = (value) => JSON.stringify(value ?? '').replace(/\\n/g, '\\n');

const plainExcerpt = (markdown) => {
  const cleaned = markdown
    .replace(COMMENT_REGEX, '')
    .replace(/!\[[^\]]*]\([^)]+\)/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/[#>*_`~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const words = cleaned.split(' ').filter(Boolean).slice(0, 36);
  return words.join(' ');
};

const toReadingTime = (markdown) => {
  const words = markdown
    .replace(COMMENT_REGEX, '')
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
};

const parseFilename = (filename) => {
  const match = filename.match(/^(\d+)\s*-\s*(.+)\.md$/i);
  if (!match) {
    return { order: 999, slug: slugify(filename.replace('.md', '')), label: filename.replace('.md', '') };
  }
  const order = Number(match[1]);
  const label = match[2];
  return { order, slug: slugify(label), label };
};

const extractMetadata = (markdown) => {
  const sourceMatch = markdown.match(/<!--\s*Source:\s*(.*?)\s*-->/);
  const publishedMatch = markdown.match(/<!--\s*Published:\s*(.*?)\s*-->/);
  const imageRegex = createImageRegex();
  const firstImageMatch = imageRegex.exec(markdown);

  const sourceUrl = sourceMatch ? sourceMatch[1].trim() : '';
  const publishedAtRaw = publishedMatch ? publishedMatch[1].trim() : '';
  const publishedAt = new Date(publishedAtRaw);
  const heroImageRelative = firstImageMatch ? firstImageMatch[2].replace(/^images\//, '') : null;

  return {
    sourceUrl,
    publishedAt: Number.isNaN(publishedAt.getTime()) ? null : publishedAt,
    heroImageRelative,
  };
};

const rewriteMarkdownImages = async (markdown) => {
  const copies = new Set();
  const matches = [];
  const regex = createImageRegex();
  const replaced = markdown.replace(regex, (_whole, alt, relPath, folderNum) => {
    const cleaned = relPath.replace(/^images\//, '');
    matches.push({ folderNum });
    return `![${alt}](/medium-assets/${cleaned})`;
  });

  for (const { folderNum } of matches) {
    if (copies.has(folderNum)) continue;
    const srcDir = path.join(EXPORT_ROOT, 'images', folderNum);
    const destDir = path.join(MEDIA_DEST, folderNum);
    await ensureDir(path.dirname(destDir));
    try {
      await fs.cp(srcDir, destDir, { recursive: true });
      copies.add(folderNum);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
  }

  return replaced.replace(/(Local:\s*)(images\/(\d{2})\/[^\s]+)(\s*-->)/g, (_m, prefix, rel, _folder, suffix) => {
    const newPath = `/medium-assets/${rel.replace(/^images\//, '')}`;
    return `${prefix}${newPath}${suffix}`;
  });
};

const buildFrontmatter = (data) => {
  const lines = [
    '---',
    `title: ${yamlString(data.title)}`,
    `description: ${yamlString(data.description)}`,
    `permalink: ${yamlString(data.slug)}`,
    `order: ${data.order}`,
    `publishedAt: ${yamlString(data.publishedAt)}`,
    `readingTime: ${data.readingTime}`,
    `heroImage: ${yamlString(data.heroImage || '')}`,
    `sourceUrl: ${yamlString(data.sourceUrl)}`,
    '---',
    '',
  ];
  return lines.join('\n');
};

async function main() {
  const entries = [];

  await cleanDir(POSTS_DIR);
  await ensureDir(MEDIA_DEST);

  const files = (await fs.readdir(EXPORT_ROOT)).filter((file) => file.endsWith('.md')).sort();

  for (const file of files) {
    const sourcePath = path.join(EXPORT_ROOT, file);
    const raw = await fs.readFile(sourcePath, 'utf-8');

    const { order, slug, label } = parseFilename(file);
    const { sourceUrl, publishedAt, heroImageRelative } = extractMetadata(raw);
    const rewrittenMarkdown = await rewriteMarkdownImages(raw);

    const excerpt = plainExcerpt(rewrittenMarkdown);
    const description = excerpt.slice(0, 180);
    const readingTime = toReadingTime(rewrittenMarkdown);
    const heroImage = heroImageRelative ? `/medium-assets/${heroImageRelative}` : null;

    const frontmatter = buildFrontmatter({
      title: label,
      description,
      slug,
      order,
      publishedAt: publishedAt ? publishedAt.toISOString() : '',
      readingTime,
      heroImage,
      sourceUrl,
    });

    const destFilename = `${String(order).padStart(2, '0')}-${slug}.md`;
    await fs.writeFile(path.join(POSTS_DIR, destFilename), frontmatter + rewrittenMarkdown, 'utf-8');

    entries.push({
      order,
      permalink: slug,
      title: label,
      description,
      heroImage,
      publishedAt: publishedAt ? publishedAt.toISOString() : '',
      readingTime,
      sourceUrl,
    });
  }

  const sorted = entries.sort((a, b) => a.order - b.order);
  const manifest = `export type PostSummary = {
  order: number;
  permalink: string;
  title: string;
  description: string;
  heroImage: string | null;
  publishedAt: string;
  readingTime: number;
  sourceUrl: string;
};

export const postsIndex: PostSummary[] = ${JSON.stringify(sorted, null, 2)};`;

  await ensureDir(path.dirname(MANIFEST_PATH));
  await fs.writeFile(MANIFEST_PATH, manifest, 'utf-8');

  console.log(`Synced ${sorted.length} posts into ${POSTS_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

