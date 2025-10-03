const weblateUserAgent = /^Weblate\/[\d.]+$/;
const languageMap: Record<string, string> = {
  en: 'English',
  en_US: 'English (US)',
  en_GB: 'English (UK)',
  fr: 'French',
  fr_FR: 'French (France)',
  fr_CA: 'French (Canada)',
  de: 'German',
  es: 'Spanish',
  it: 'Italian',
  pt: 'Portuguese',
  ru: 'Russian',
  zh: 'Chinese',
  ja: 'Japanese',
  ko: 'Korean',
  ar: 'Arabic',
  hi: 'Hindi',
  sv: 'Swedish',
  nl: 'Dutch',
  pl: 'Polish',
  tr: 'Turkish',
  vi: 'Vietnamese',
  id: 'Indonesian',
  th: 'Thai',
  cs: 'Czech',
  ro: 'Romanian',
  hu: 'Hungarian',
  fi: 'Finnish',
  no: 'Norwegian',
  da: 'Danish',
  el: 'Greek',
  he: 'Hebrew',
  uk: 'Ukrainian',
  sr: 'Serbian',
  hr: 'Croatian',
  sk: 'Slovak',
  bg: 'Bulgarian',
  lt: 'Lithuanian',
  lv: 'Latvian',
  et: 'Estonian',
  sl: 'Slovenian',
  zh_TW: 'Chinese (Taiwan)',
  zh_CN: 'Chinese (China)',
  zh_Hans: 'Chinese (Simplified)',
  zh_Hant: 'Chinese (Traditional)',
};
const code = (s: string) => '```\n' + s + '\n```';

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

    const webhookUrl = env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) throw new Error('"DISCORD_WEBHOOK_URL" is not set in environment variables');
    let baseUrl = env.WEBLATE_BASE_URL;
    if (!baseUrl) throw new Error('"WEBLATE_BASE_URL" is not set in environment variables');
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://'))
      throw new Error('"WEBLATE_BASE_URL" must start with "http://" or "https://"');
    if (baseUrl.endsWith('/')) baseUrl = baseUrl.slice(0, -1);

    const body = await request.json() as Push;
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
      embed.fields = [
        { name: 'String', value: body.source?.[0] ? code(body.source[0]) : '*N/A*' },
        { name: 'Language', value: body.translation ? (languageMap[body.translation] || body.translation) : '*N/A*' },
      ];
    } else if (body.action === 'String updated in the repository') {
      embed.color = 0x0000FF;
      const author = body.author ?
        `[${body.author}](${baseUrl}/users/${body.author})` :
        (body.user ? `[${body.user}](${baseUrl}/users/${body.user})` : 'unknown');
      embed.description = `A string was updated by ${author}.`;
      embed.fields = [
        { name: 'Language', value: body.translation ? (languageMap[body.translation] || body.translation) : '*N/A*' },
        {name: 'Old String', value: body.old?.[0] ? code(body.old[0]) || '*N/A*' : '*N/A*'},
        {name: 'New String', value: body.target?.[0] ? code(body.target[0]) || '*N/A*' : '*N/A*'},
      ];
    } else if (body.action === 'Source string changed') {
      embed.color = 0x0000FF;
      const author = body.author ?
        `[${body.author}](${baseUrl}/users/${body.author})` :
        (body.user ? `[${body.user}](${baseUrl}/users/${body.user})` : 'unknown');
      embed.description = `A source string was changed by ${author}.`;
      embed.fields = [
        { name: 'Language', value: body.translation ? (languageMap[body.translation] || body.translation) : '*N/A*' },
        {name: 'Old String', value: body.old?.[0] ? code(body.old[0]) || '*N/A*' : '*N/A*'},
        {name: 'New String', value: body.target?.[0] ? code(body.target[0]) || '*N/A*' : '*N/A*'},
      ];
    } else if (body.action === 'Translation changed') {
      embed.color = 0x00FF00;
      embed.description = `A translation was changed by ${body.author ? `[${body.author}](${baseUrl}/users/${body.author})` : 'unknown'}.`;
      embed.fields = [
        {name: 'Old Translation', value: body.old?.[0] ? code(body.old[0]) || '*N/A*' : '*N/A*'},
        {name: 'New Translation', value: body.target?.[0] ? code(body.target[0]) || '*N/A*' : '*N/A*'},
      ];
    } else if (body.action === 'Suggestion removed') {
      embed.color = 0xFF0000;
      embed.description = `A suggestion was removed by ${body.author ? `[${body.author}](${baseUrl}/users/${body.author})` : 'unknown'}.`;
      embed.fields = [
        {name: 'Removed Translation', value: body.old?.[0] ? code(body.old[0]) || '*N/A*' : '*N/A*'},
        {name: 'Current Suggestion', value: body.source?.[0] ? code(body.source[0]) || '*N/A*' : '*N/A*'},
      ];
    } else if (body.action === 'Changes committed') {
      embed.color = 0x00FFFF;
      embed.description = `Changes for language **${body.translation ? (languageMap[body.translation] || body.translation) : 'N/A'}** were committed.`;
    } else if (body.action === 'Add-on configuration changed') {
      embed.color = 0x800080;
      const addon = body.target?.[0] ? body.target[0] : 'an add-on';
      embed.description = `The configuration of the ${addon} add-on was changed.`;
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