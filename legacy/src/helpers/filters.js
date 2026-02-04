import urlParse from 'url-parse';

export const dateHeaderFilter = value => new Date(value).toLocaleString();

export const parseUrlFilter = value => urlParse(value).host;

export const prettyFilter = value => {
  let json;
  try {
    json = JSON.stringify(JSON.parse(value), null, 2);
  } catch (e) {
    json = value;
  }
  return json;
};

// Export all filters as default object for convenience
export default {
  dateHeader: dateHeaderFilter,
  parseUrl: parseUrlFilter,
  pretty: prettyFilter,
};
