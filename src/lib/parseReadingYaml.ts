/**
 * Parser for src/data/reading.yaml.
 *
 * The file is a flat list of book entries — three or four `key: value` lines
 * each — and it stays human-append-only, so it carries no `id` fields. Astro's
 * file loader needs one per entry, so ids are derived from the title here.
 *
 * This handles the subset of YAML the file uses (a list of shallow string
 * maps, comments, optional quoting) rather than pulling in a YAML dependency.
 * Anything outside that subset throws, loudly and with a line number.
 *
 * Re-reading a book is expected, so repeated titles are not an error: the
 * earliest reading keeps the plain slug and later ones carry their finished
 * year (`the-adventures-of-huckleberry-finn`, then `...-2028`). Because the
 * plain slug belongs to the oldest entry, appending a re-read at the top of
 * the file never renames an entry that already exists.
 */
export interface ParsedBook {
  id: string;
  [field: string]: string;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Drop a trailing `# comment`, ignoring `#` inside quotes. */
function stripComment(line: string): string {
  let quote: string | null = null;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (quote) {
      if (char === quote) quote = null;
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === "#" && (i === 0 || /\s/.test(line[i - 1]))) {
      return line.slice(0, i);
    }
  }
  return line;
}

function unquote(value: string): string {
  const match = /^(["'])(.*)\1$/.exec(value);
  return match ? match[2] : value;
}

function splitPair(pair: string, lineNumber: number): [string, string] {
  // Split on the first colon only, so titles may contain colons.
  const match = /^([A-Za-z_][\w-]*):(.*)$/.exec(pair);
  if (!match) {
    throw new Error(
      `reading.yaml line ${lineNumber}: expected "key: value", got "${pair}"`,
    );
  }
  const value = unquote(match[2].trim());
  if (!value) {
    throw new Error(
      `reading.yaml line ${lineNumber}: "${match[1]}" has no value`,
    );
  }
  return [match[1], value];
}

export function parseReadingYaml(text: string): ParsedBook[] {
  const books: Record<string, string>[] = [];
  let current: Record<string, string> | undefined;

  text.split(/\r?\n/).forEach((raw, index) => {
    const lineNumber = index + 1;
    const line = stripComment(raw).trimEnd();
    if (!line.trim()) return;

    const item = /^- +(.*)$/.exec(line);
    const field = /^ {2}(\S.*)$/.exec(line);

    if (item) {
      current = {};
      books.push(current);
      const [key, value] = splitPair(item[1].trim(), lineNumber);
      current[key] = value;
    } else if (field) {
      if (!current) {
        throw new Error(
          `reading.yaml line ${lineNumber}: field before the first "- " entry`,
        );
      }
      const [key, value] = splitPair(field[1].trim(), lineNumber);
      current[key] = value;
    } else {
      throw new Error(
        `reading.yaml line ${lineNumber}: expected an entry or a field, got "${raw}"`,
      );
    }
  });

  return assignIds(books);
}

/** Slug for the earliest reading of a title; year-suffixed for later ones. */
function assignIds(books: Record<string, string>[]): ParsedBook[] {
  const byTitle = new Map<string, Record<string, string>[]>();
  books.forEach((book, index) => {
    if (!book.title) {
      throw new Error(`reading.yaml: entry ${index + 1} has no title`);
    }
    const slug = slugify(book.title);
    const group = byTitle.get(slug);
    if (group) group.push(book);
    else byTitle.set(slug, [book]);
  });

  const ids = new Map<Record<string, string>, string>();
  const taken = new Set<string>();

  for (const [slug, group] of byTitle) {
    // Oldest first, so the plain slug lands on the first time it was read.
    // An unfinished book is the one being read now, so it sorts last.
    const oldestFirst = [...group].sort((a, b) =>
      (a.finished ?? "9999").localeCompare(b.finished ?? "9999"),
    );
    oldestFirst.forEach((book, index) => {
      const suffix = book.finished ? book.finished.slice(0, 4) : "current";
      let id = index === 0 ? slug : `${slug}-${suffix}`;
      // Two readings inside one year, or a title that collides with another
      // book's suffixed id.
      for (let n = 2; taken.has(id); n++) id = `${slug}-${n}`;
      taken.add(id);
      ids.set(book, id);
    });
  }

  // Back to file order, which is the order every consumer expects.
  return books.map((book) => ({ ...book, id: ids.get(book)! }));
}
