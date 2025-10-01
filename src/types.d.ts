interface Push {
  change_id: number;
  action: string;
  url: string;
  // ISO formatted timestamp
  timestamp: string;
  // Author username (this can be different from user for example when accepting suggestions)
  author: string;
  user: string;
  project: string;
  component: string;
  source?: string[];
  target?: string[];
}

interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  timestamp?: string; // ISO8601 timestamp
  color?: number; // decimal
  footer?: {
    text: string;
  };
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
  };
  fields?: { name: string; value: string; inline?: boolean }[];
}