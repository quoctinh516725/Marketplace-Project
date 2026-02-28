export const normalizeText = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};
export const generateSlug = (name: string): string => {
  const slug = normalizeText(name);
  return `${slug}-${Date.now()}`;
};
