# Weblate to Discord Webhook

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/CuteTenshii/weblate-discord-webhook)

A Cloudflare Worker that sends Weblate webhooks to Discord webhooks. It's like a proxy that translates Weblate's webhook format into Discord's webhook format.

## Abuse Prevention

To prevent abuse, this worker:
- Checks the `User-Agent` header to ensure requests come from Weblate.
- Checks the presence of the `Webhook-Id` and `Webhook-Timestamp` headers.
  The `Webhook-Signature` header may be empty, it depends if you set a secret in the Webhooks addon.

Webhook validation is not yet implemented.

## Handled Events

Currently, the worker handles the following Weblate events:
- Repository notification received
- String added in the repository
- String updated in the repository
- Changes committed

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for details.