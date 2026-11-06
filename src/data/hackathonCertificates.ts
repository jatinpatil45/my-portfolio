export type HackathonAchievementType =
  | 'Winner'
  | 'Finalist'
  | 'Runner-Up'
  | 'Participation'
  | (string & {});

export interface HackathonCertificate {
  id: string;
  hackathonName: string;
  organizer: string;
  image: string;
  alt: string;
  date: string;
  achievementType: HackathonAchievementType;
  certificateId?: string;
  credentialUrl?: string;
  description?: string;
}

/**
 * Hackathon Certificates Data
 *
 * To add a new hackathon certificate later:
 * 1. Place the certificate image inside `public/images/`
 * 2. Append a new entry to `hackathonCertificates` below.
 */
export const hackathonCertificates: HackathonCertificate[] = [
  {
    id: 'national-innovation-hackathon-2026',
    hackathonName: 'National Innovation Hackathon 2026',
    organizer:
      'AMIEE Association & CMAOI Association (in collaboration with Heritage Institute of Technology, Kolkata)',
    image: '/images/hackathon-national-innovation-2026.jpg',
    alt: 'National Innovation Hackathon 2026 Certificate of Participation for Jatin Patil',
    date: 'July 17–19, 2026',
    achievementType: 'Participation',
    certificateId: 'AMH202600484-M544',
  },
  {
    id: 'rift-26-unstop-hackathon',
    hackathonName: "RIFT '26 – Hackathon (Unstop Freedom Festival)",
    organizer: 'Physics Wallah Institute of Innovation & Unstop',
    image: '/images/hackathon-rift-26.jpg',
    alt: "RIFT '26 Hackathon Certificate of Participation for Jatin Patil",
    date: '2026',
    achievementType: 'Participation',
  },
];

export default hackathonCertificates;
