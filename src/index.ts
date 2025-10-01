export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (request.method !== 'POST') {
      return new Response(null, { status: 405 });
    }

    const webhookUrl = env.WEBHOOK_URL;
    if (!webhookUrl) {
      return new Response('WEBHOOK_URL is not set', { status: 500 });
    }

    const body = await request.json() as Push;
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