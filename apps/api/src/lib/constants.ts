export const TRADES = [
  'General Contractor',
  'Electrician',
  'Plumber',
  'Carpenter',
  'Painter',
  'HVAC',
  'Landscaper',
  'Roofer',
  'Mason',
  'Flooring Specialist',
  'Welder',
  'Handyman',
  'Mechanic',
  'Cleaner',
  'Mover',
  'Baker',
  'Nanny',
  'Chef',
  'Tutor',
  'Driver',
  'Pet Sitter',
  'Event Planner',
  'Photographer'
] as const;

export type Trade = typeof TRADES[number];
