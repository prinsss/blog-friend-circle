export interface ApiErrorResponse {
  error_message: string;
}

export interface Entry {
  id: number;
  user_id: number;
  feed_id: number;
  status: string;
  hash: string;
  title: string;
  url: string;
  comments_url: string;
  published_at: string;
  created_at: string;
  changed_at: string;
  content: string;
  author: string;
  share_code: string;
  starred: boolean;
  reading_time: number;
  enclosures: unknown[];
  feed: Feed;
  tags: string[];
}

export interface Feed {
  id: number;
  user_id: number;
  feed_url: string;
  site_url: string;
  title: string;
  checked_at: string;
  next_check_at: string;
  etag_header: string;
  last_modified_header: string;
  parsing_error_message: string;
  parsing_error_count: number;
  scraper_rules: string;
  rewrite_rules: string;
  crawler: boolean;
  blocklist_rules: string;
  keeplist_rules: string;
  urlrewrite_rules: string;
  user_agent: string;
  cookie: string;
  username: string;
  password: string;
  disabled: boolean;
  no_media_player: boolean;
  ignore_http_cache: boolean;
  allow_self_signed_certificates: boolean;
  fetch_via_proxy: boolean;
  hide_globally: boolean;
  apprise_service_urls: string;
  disable_http2: boolean;
  category: Category;
  icon: Icon;
}

export interface Category {
  id: number;
  title: string;
  user_id: number;
  hide_globally: boolean;
}

export interface Icon {
  feed_id: number;
  icon_id: number;
}
