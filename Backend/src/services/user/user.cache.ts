import cacheTag from "../../cache/cache.tag";

export async function deleteUserCache(userId: string) {
  await cacheTag.invalidateTag(`user:${userId}`);
  await cacheTag.invalidateTag("user:list");
}
