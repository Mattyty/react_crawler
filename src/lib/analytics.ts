// PostHog analytics configuration.
//
// The project API key is a client-side ingestion key (safe to ship in the app
// bundle). Region is EU.
export const POSTHOG_API_KEY = 'phc_qGs8YxA6qcGCKMi73SmxbPccoPkkerFsaQnQvUg34ZDZ';
export const POSTHOG_HOST = 'https://eu.i.posthog.com';

// Central list of custom event names so they stay consistent across the app.
export const AnalyticsEvents = {
  personaSelected: 'persona_selected',
  citySelected: 'city_selected',
  venueCardClicked: 'venue_card_clicked',
  getDirectionsClicked: 'get_directions_clicked',
  outboundLinkClicked: 'outbound_link_clicked',
  filterToggled: 'filter_toggled',
} as const;
