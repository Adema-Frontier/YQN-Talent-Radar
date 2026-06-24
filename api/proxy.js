export default async function handler(req, res) {
  // Allow CORS from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { channel } = req.query;

  if (!channel) {
    return res.status(400).json({ error: 'Channel parameter required' });
  }

  // Validate channel name (alphanumeric, underscores, hyphens only)
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(channel)) {
    return res.status(400).json({ error: 'Invalid channel name' });
  }

  try {
    const url = `https://t.me/s/${channel}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Telegram returned ${response.status}` });
    }

    const html = await response.text();
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).send(html);

  } catch (error) {
    console.error(`Proxy error for channel ${channel}:`, error.message);
    return res.status(500).json({ error: error.message });
  }
}
