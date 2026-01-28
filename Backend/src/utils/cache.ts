import cacheService from "../cache/cache.service";
import cacheTag from "../cache/cache.tag";

export type FetchType<T> = () => Promise<{ data: T; tags?: string[] }>;

export const cacheAsync = async <T>(
  key: string,
  ttl: number,
  baseTags: string[],
  fetchDatabase: FetchType<T>,
): Promise<T> => {
  const cacheData = await cacheService.get<T>(key);
  if (cacheData) return cacheData;

  const { data, tags: dynamicTags = [] } = await fetchDatabase();

  const allTags = [...baseTags, ...dynamicTags];

  await cacheService.set(key, data, ttl);
  await Promise.all(allTags.map((tag) => cacheTag.add(tag, key, ttl)));
  return data;
};
