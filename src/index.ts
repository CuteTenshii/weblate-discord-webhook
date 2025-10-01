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
    const baseUrl = 'https://translate.miwa.lol';
    const embed: DiscordEmbed = {
      author: body.author ? {
        name: body.author,
        url: `${baseUrl}/users/${body.author}`,
        icon_url: `${baseUrl}/avatar/128/${body.author}.png`,
      } : undefined,
      title: body.action,
      url: `${baseUrl}${body.url}`,
      timestamp: body.timestamp,
      color: 0x00FF00,
      footer: {
        text: makeFooterText(body),
      },
    }

    if (body.action === 'Repository notification received') {
      embed.color = 0xFFFF00;
      embed.description = `A repository notification was received from ${body.user ? `[${body.user}](${baseUrl}/users/${body.user})` : 'unknown'}.`;
    } else if (body.action === 'Repository rebased') {
      embed.color = 0xFFA500;
      embed.description = `The repository was rebased by ${body.user ? `[${body.user}](${baseUrl}/users/${body.user})` : 'unknown'}.`;
    } else if (body.action === 'String added in the repository') {
      embed.color = 0x0000FF;
      embed.description = `A new string was added by ${body.author ? `[${body.author}](${baseUrl}/users/${body.author})` : 'unknown'}.`;
      embed.fields = [{ name: 'String', value: body.target?.[0] || 'N/A' }];
    } else if (body.action === 'String updated in the repository') {
      embed.color = 0x0000FF;
      embed.description = `A string was updated by ${body.author ? `[${body.author}](${baseUrl}/users/${body.author})` : 'unknown'}.`;
      embed.fields = [
        { name: 'Old String', value: body.source ? body.source[0] || 'N/A' : 'N/A' },
        { name: 'New String', value: body.target ? body.target[0] || 'N/A' : 'N/A' },
      ];
    } else if (body.action === 'Changes committed') {
      embed.color = 0x00FFFF;
      embed.description = `Changes were committed by ${body.author ? `[${body.author}](${baseUrl}/users/${body.author})` : 'unknown'}.`;
    }

    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: '```json\n' + JSON.stringify(body, null, 2) + '\n```',
        embeds: [embed],
        username: 'Weblate',
        avatar_url: 'https://weblate.org/static/weblate-128.png',
      }),
    });

    return new Response(null, { status: 204 });
  }
} satisfies ExportedHandler<Env>;

function makeFooterText(body: Push): string {
  if (body.project && body.component) {
    return `${body.project} / ${body.component}`;
  } else if (body.project) {
    return body.project;
  } else {
    return `Change ID: ${body.change_id}`;
  }
}