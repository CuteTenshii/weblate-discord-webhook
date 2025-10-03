# Weblate to Discord Webhook

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/CuteTenshii/weblate-discord-webhook)

A Cloudflare Worker that sends Weblate webhooks to Discord webhooks. It's like a proxy that translates Weblate's webhook format into Discord's webhook format.

## How to Use

1. Deploy the Cloudflare Worker using the button above or manually.
2. Set the following environment variables in your Cloudflare Worker:
   - `DISCORD_WEBHOOK_URL`: The URL of your Discord webhook.
   - `WEBLATE_BASE_URL`: The base URL of your Weblate instance (e.g., `https://weblate.example.com`).
3. In your Weblate instance, go to the project or instance settings and go to the Add-ons section.
4. Enable the "Webhooks" add-on and configure it to point to your Cloudflare Worker URL, and select the events you want to be notified about.
   Optionally, set a secret in the Webhooks add-on for added security.

## Handled Events

Currently, the worker handles the following Weblate events:
- Repository notification received
- Repository rebased
- String added in the repository
- String updated in the repository
- Translation changed
- Suggestion removed
- Changes committed
- Add-on configuration changed

## Abuse Prevention

To prevent abuse, this worker:
- Checks the `User-Agent` header to ensure requests come from Weblate.
- Checks the presence of the `Webhook-Id` and `Webhook-Timestamp` headers.
  The `Webhook-Signature` header may be empty, it depends if you set a secret in the Webhooks addon.

Webhook validation is not yet implemented.

## License

This project is licensed under the MIT License. See the [LICENSE.txt](LICENSE.txt) file for details.