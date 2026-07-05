/**
 * Encodes special characters in the password portion of a MongoDB URI.
 * e.g. Edison@3455 → Edison%403455 (the @ would otherwise break the URL)
 */
export const encodeMongoUri = (uri) => {
  if (!uri) return uri;

  const protocols = ['mongodb+srv://', 'mongodb://'];
  let protocol = '';
  let rest = uri;

  for (const p of protocols) {
    if (uri.startsWith(p)) {
      protocol = p;
      rest = uri.slice(p.length);
      break;
    }
  }

  if (!protocol) return uri;

  const atIndex = rest.lastIndexOf('@');
  if (atIndex === -1) return uri;

  const credentials = rest.slice(0, atIndex);
  const hostAndRest = rest.slice(atIndex + 1);
  const colonIndex = credentials.indexOf(':');

  if (colonIndex === -1) return uri;

  const user = credentials.slice(0, colonIndex);
  const password = credentials.slice(colonIndex + 1);

  if (!/[@#:%/?[\]]/.test(password)) return uri;

  return `${protocol}${user}:${encodeURIComponent(password)}@${hostAndRest}`;
};
