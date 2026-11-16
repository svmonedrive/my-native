import type { ActionTile, InfoCard } from 'a-common-lib';

/** Where messages from the sign-up form go. PLACEHOLDER: replace with the club's real address. */
export const CONTACT_EMAIL = 'contact@namkhana-club.example';

/** Texts live in app.i18n.ts; `target` is the id of the section a tile scrolls to. */
export const ACTION_TILES: ActionTile[] = [
  { icon: '🤝', labelKey: 'tile.volunteer', textKey: 'tile.volunteer.text', target: 'contact' },
  { icon: '💝', labelKey: 'tile.contribute', textKey: 'tile.contribute.text', target: 'contact' },
  { icon: '🏠', labelKey: 'tile.join', textKey: 'tile.join.text', target: 'contact' },
  { icon: '📖', labelKey: 'tile.share', textKey: 'tile.share.text', target: 'stories' },
];

/** PLACEHOLDER partner names (translation keys). */
export const PARTNERS = ['partner.1', 'partner.2', 'partner.3', 'partner.4', 'partner.5'];

/** PLACEHOLDER stories. */
export const STORIES: InfoCard[] = [
  { titleKey: 'story.delta.title', textKey: 'story.delta.text', tagKey: 'story.delta.tag' },
  { titleKey: 'story.cup.title', textKey: 'story.cup.text', tagKey: 'story.cup.tag' },
  { titleKey: 'story.library.title', textKey: 'story.library.text', tagKey: 'story.library.tag' },
  { titleKey: 'story.health.title', textKey: 'story.health.text', tagKey: 'story.health.tag' },
  { titleKey: 'story.festival.title', textKey: 'story.festival.text', tagKey: 'story.festival.tag' },
  { titleKey: 'story.clean.title', textKey: 'story.clean.text', tagKey: 'story.clean.tag' },
];
