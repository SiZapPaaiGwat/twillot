export function parseTwitterQuery(query) {
  const patterns = {
    fromUser: /from:(\S+)/,
    toUser: /to:(\S+)/,
    mention: /@(\S+)/,
    hashtag: /#(\S+)/,
    since: /since:(\d{4}-\d{2}-\d{2})/,
    until: /until:(\d{4}-\d{2}-\d{2})/,
  }

  const result = {}
  for (const [key, pattern] of Object.entries(patterns)) {
    const match = query.match(pattern)
    if (match) {
      result[key] = match[1]
    }
  }

  return result
}

const query = 'from:NASA since:2020-01-01 until:2020-01-31 #space'
const parsedQuery = parseTwitterQuery(query)
console.log(parsedQuery)
