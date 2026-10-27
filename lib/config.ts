/* =====================================================================
   WEDDING CONFIG — every replaceable detail lives here.
   Images: set `src` on any gallery item to a photo in /public
   (e.g. '/gallery/1.jpg'); without it an illustrated scene is drawn instead.
   ===================================================================== */
export const CONFIG = {
  // Public address of the site, used for link previews (WhatsApp, iMessage, etc.)
  siteUrl: 'https://romitayushi.in',
  couple: { a: 'Romit', b: 'Ayushi' },
  families: { a: { name: 'Romit Gupta', parents: 'S/o Ranjana & Radhey Shyam Gupta' }, b: { name: 'Ayushi Gupta', parents: 'D/o Usha Gupta & Mahaveer Prasad Gupta' } }, // shown under the names on the invitation
  hashtag: '#ROHI',
  firm: { name: 'Gujarmal Ghasiram', place: 'Clock Tower, Alwar' }, // family firm, highlighted just below the hashtag on the invitation card
  song: { youtubeId: '1LVpuWpRs3I', start: 23, title: 'Din Shagna Da · Phillauri' }, // played by the music button through a hidden YouTube player; start (seconds) skips the instrumental intro
  ganpati: { src: '/ganpatiji.webp', cutout: true }, // image of Lord Ganesha for the invitation screen (cutout: transparent PNG/WebP, shown unframed); null shows a gold Om medallion
  tagline: 'Two families, two days, one promise in the Aravalli hills.',
  timezone: 'Asia/Kolkata',
  tzLabel: 'IST',
  city: 'Alwar, Rajasthan',
  weddingDay: '2026-11-30T12:00:00+05:30', // shown as the wedding date on the invitation
  ceremony: '2026-11-30T13:15:00+05:30', // pheras — the countdown target
  heroLine: 'Join us in the Aravalli hills for haldi, music, and the seven vows.',
  farewell: "Your blessings have carried us this far. We can't wait to see you in Alwar.",
  venues: [
    {
      id: 'sagar', name: 'The Sagar Resort', address: 'Sariska Tiger Reserve Road, Kati Ghati, Alwar, Rajasthan 301001',
      note: 'All celebrations are at the resort.', scene: 'palace',
      map: 'https://www.google.com/maps/dir//Sagar+Resorts,+Kati+ghati,+Sariska+Road,+Liwari,+Rajasthan+301001/@26.9024618,75.7487774,15z/data=!4m8!4m7!1m0!1m5!1m1!1s0x39729baf8d82fa2b:0x5b123418a4d64a70!2m2!1d76.5838697!2d27.5149871', // Google Maps directions to the resort
      mapEmbed: 'https://maps.google.com/maps?q=27.5149871,76.5838697&z=14&output=embed',
    },
  ],
  events: [
    { id: 'haldi', name: 'Haldi', tagline: 'Turmeric, marigolds, and a little chaos', start: '2026-11-29T11:15:00+05:30', venue: 'sagar', icon: 'haldi' },
    { id: 'bhat', name: 'Bhat', tagline: 'The maternal family arrives with blessings and gifts', start: '2026-11-29T18:00:00+05:30', venue: 'sagar', icon: 'thali' },
    { id: 'sangeet', name: 'Sangeet', tagline: 'Two families, one dance floor', start: '2026-11-29T19:00:00+05:30', venue: 'sagar', icon: 'sangeet' },
    { id: 'lagan', name: 'Lagan', tagline: 'The auspicious hour is set', start: '2026-11-30T08:00:00+05:30', venue: 'sagar', icon: 'kalash' },
    { id: 'ghudchadi', name: 'Ghudchadi', tagline: 'The groom rides out on his ghodi', start: '2026-11-30T10:00:00+05:30', venue: 'sagar', icon: 'ghodi' },
    { id: 'phere', name: 'Phere', tagline: 'Seven vows around the sacred fire', start: '2026-11-30T13:15:00+05:30', venue: 'sagar', icon: 'mandap' },
    { id: 'reception', name: 'Reception', tagline: 'Dinner, toasts, and a last dance', start: '2026-11-30T19:00:00+05:30', venue: 'sagar', icon: 'reception' },
  ],
  gallery: [
    { title: 'The lake at dusk', span: 'big', scene: 'palace', seed: 11 },
    { title: 'Marigold mornings', span: 'tall', scene: 'roses', seed: 5 },
    { title: 'Garden lights', scene: 'lanterns', seed: 8 },
    { title: 'Moonrise over the water', scene: 'night', seed: 13 },
    { title: 'Under the mandap', span: 'wide', scene: 'mandap', seed: 6 },
    { title: 'First light', scene: 'dawn', seed: 21 },
    { title: 'Rose petals', scene: 'roses', seed: 17 },
    { title: 'The palace by night', span: 'wide', scene: 'night', seed: 4 },
    { title: 'Sangeet evening', span: 'wide', scene: 'lanterns', seed: 19 },
  ],
  travel: [
    { title: 'Getting here', icon: 'plane', items: [
      ['By air', 'Jaipur (JAI) and Delhi (DEL) are the nearest airports, each roughly 3 hours from Alwar by road.'],
      ['By rail', 'Alwar Junction is on the Delhi–Jaipur line, a short drive from the resort.'],
      ['Pickups', 'Let the family know your travel plans and we’ll arrange a car.'],
    ]},
    { title: 'Where to stay', icon: 'hotel', items: [
      ['The Sagar Resort', 'Guests stay at the venue · room details to follow'],
      ['Contact', '0144-2346378 · 7597021300 · 9460828283'],
    ]},
    { title: 'Good to know', icon: 'guide', items: [
      ['Late-November weather', 'Pleasant days and chilly evenings in the Aravallis. Bring a shawl.'],
      ['Getting around', 'Every celebration is at the resort, so there’s no travel between events.'],
    ]},
  ],
};

export type WeddingConfig = typeof CONFIG;
