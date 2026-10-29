/** 域名、邮箱地址等 ASCII 文本按码位字典序比较；不用 localeCompare，避免标点与数字的排序随浏览器语言变化 */
export const compareText = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** 返回按字典序排好的新数组，不改动入参 */
export const sortedTexts = (list: readonly string[]): string[] => [...list].sort(compareText);
