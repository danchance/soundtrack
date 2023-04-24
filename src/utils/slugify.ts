/**
 * Slugify a string. Formats a string to be used in a URL.
 * @example slugify('Hello World') => hello-world
 * @param input
 * @returns
 */
const slugify = (input: string): string => {
  return input
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

export default slugify;
