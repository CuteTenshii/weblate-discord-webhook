# Weblate to Discord Webhook

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/CuteTenshii/weblate-discord-webhook)

A Cloudflare Worker that sends Weblate webhooks to Discord webhooks. It's like a proxy that translates Weblate's webhook format into Discord's webhook format.

## Abuse Prevention

To prevent abuse, this worker:
- Checks the `User-Agent` header to ensure requests come from Weblate.

Webhook validation is not yet implemented.

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for details.