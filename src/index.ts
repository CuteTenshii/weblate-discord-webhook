const weblateUserAgent = /^Weblate\/[\d.]+$/;

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method !== 'POST') return new Response(null, { status: 405 });

    const userAgent = request.headers.get('user-agent') || '';
    const webhookId = request.headers.get('webhook-id') || '';
    const webhookSignature = request.headers.get('webhook-signature') || '';
    const webhookTimestamp = request.headers.get('webhook-timestamp') || '';

    // Check if the request is from Weblate
    if (
      !weblateUserAgent.test(userAgent) || !webhookId || !webhookTimestamp
    ) return new Response(null, { status: 403 });

    const now = Math.floor(Date.now() / 1000);
    const timestamp = parseInt(webhookTimestamp, 10);
    // Reject if the timestamp is more than 5 minutes from now
    if (isNaN(timestamp) || Math.abs(now - timestamp) > 300)
      return new Response(null, { status: 403 });

    const webhookUrl = env.WEBHOOK_URL;
    if (!webhookUrl) return new Response('WEBHOOK_URL is not set', { status: 500 });

    const body = await request.json() as Push;
    console.log(
      'Received push event:',
      JSON.stringify(body, null, 2),
    );
    const baseUrl = 'https://translate.miwa.lol';
    const payload = {
      content: '```json\n' + JSON.stringify(body, null, 2) + '\n```',
      embeds: [{
        author: {
          name: body.author || 'Unknown',
          url: `${baseUrl}/users/${body.author || 'unknown'}`,
          icon_url: `${baseUrl}/avatar/128/${body.author || 'unknown'}.png`,
        },
        title: `Change ${body.change_id} - ${body.action}`,
        url: `${baseUrl}/changes/${body.change_id}`,
        description: `A change was made by ${body.author || 'unknown'}.`,
        timestamp: body.timestamp,
        color: 0x00FF00,
      }]
    };
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    return new Response(null, { status: 204 });
  }
} satisfies ExportedHandler<Env>;