import type { TimelineEvent } from 'a-common-lib';

/** Where messages from the contact form go. PLACEHOLDER: replace with the club's real address. */
export const CONTACT_EMAIL = 'contact@kakdwip-club.example';

/** Club house position for the map (Kakdwip, West Bengal). Adjust to the exact building. */
export const LOCATION = { lat: 21.8667, lng: 88.1833, addressKey: 'location.address' } as const;

/** PLACEHOLDER events. Texts live in app.i18n.ts; dates are ISO (yyyy-mm-dd). */
export const EVENTS: TimelineEvent[] = [
  { date: '2026-12-12', titleKey: 'events.sports.title', descriptionKey: 'events.sports.desc' },
  { date: '2027-01-23', titleKey: 'events.culture.title', descriptionKey: 'events.culture.desc' },
  { date: '2027-02-20', titleKey: 'events.health.title', descriptionKey: 'events.health.desc' },
  { date: '2027-03-14', titleKey: 'events.meet.title', descriptionKey: 'events.meet.desc' },
];

/** PLACEHOLDER hero video (public YouTube video: Blender's "Big Buck Bunny"). Replace with the club's own video id. */
export const HERO_VIDEO_ID = 'aqz-KE-bpKQ';
