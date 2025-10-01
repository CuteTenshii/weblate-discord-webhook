// https://docs.weblate.org/en/weblate-5.13.3/admin/addons.html#addon-weblate-webhook-webhook
type ChangeEvent = '';

interface Push {
  change_id: number;
  action: ChangeEvent;
  // ISO formatted timestamp
  timestamp: string;
  // Author username (this can be different from user for example when accepting suggestions)
  author: string;
}