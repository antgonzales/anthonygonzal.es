interface Post {
  data: {
    featured: boolean;
    pubDate: Date;
  };
}

export function getFeaturedPost<T extends Post>(posts: T[]): T | undefined {
  return posts
    .filter((p) => p.data.featured)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())[0];
}
