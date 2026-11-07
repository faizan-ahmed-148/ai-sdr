export function chunk(array: any[], size: number) {
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("`size` must be a positive integer");
  }

  const result = [];

  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }

  return result;
}
