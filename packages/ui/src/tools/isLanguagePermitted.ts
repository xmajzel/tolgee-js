export const isLanguagePermitted = (
  language: string,
  permittedLanguages: number[] | undefined,
  allLanguages?: any[]
) => {
  if (!permittedLanguages?.length) {
    return true;
  }
  const languageId = allLanguages?.find((l) => l.tag === language)?.id;
  return permittedLanguages.includes(languageId as number);
};
