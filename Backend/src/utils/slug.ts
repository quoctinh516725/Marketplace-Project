export const generateSlug = (name: string): string => {
  const slug = name
    .toLowerCase()
    .normalize("NFD") // tách dấu khỏi chữ
    .replace(/[\u0300-\u036f]/g, "") // xoá dấu tiếng Việt
    .replace(/[^a-z0-9\s-]/g, "") // xoá ký tự đặc biệt
    .trim()
    .replace(/\s+/g, "-") // space => -
    .replace(/-+/g, "-"); // nhiều - => 1 -

  return `${slug}-${Date.now()}`;
};
