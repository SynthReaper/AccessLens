import { SamplePoster } from './types';

export const SAMPLE_POSTERS: SamplePoster[] = [
  {
    id: 'sample-tech-symposium',
    title: 'MUJ TechNova AI Symposium 2026',
    shortLabel: 'TechNova',
    subtitle: 'Annual flagship student robotics & LLM summit',
    thumbnailPath: '/samples/tech_symposium_poster.svg',
    description: 'High-density flyer announcing keynotes, robotics exhibition, registration deadline, and venue.',
    category: 'event',
    cachedResult: {
      category: 'event',
      headlineSummary: 'TechNova 2026 is an AI & Robotics symposium at Manipal University Jaipur featuring keynotes, project exhibitions, and hack demos on October 24-25, 2026.',
      keyTakeaways: [
        'Organized by School of Computing & AI Club, MUJ',
        'Dates: October 24-25, 2026 at Turing Auditorium (Academic Block 1)',
        'Free entry for students with valid campus ID; registration closes October 18',
        'Includes cash prizes up to ₹75,000 for top project tracks'
      ],
      eventDetails: {
        title: 'TechNova 2026: Multimodal Intelligence & Robotics',
        organizer: 'MUJ School of Computing & Google Developer Groups VITC/MUJ',
        venue: 'Turing Auditorium, Academic Block 1, MUJ Campus',
        date: '2026-10-24 to 2026-10-25',
        time: '09:30 AM - 05:30 PM IST',
        registrationUrlOrEmail: 'https://technova.muj.ac.in/register',
        eligibility: 'Open to all UG/PG enrolled students with valid University ID'
      },
      actionItems: [
        {
          id: 'act-1',
          description: 'Submit project abstract and team members on registration portal',
          deadline: 'October 18, 2026, 11:59 PM',
          isUrgent: true,
          targetAudience: 'Student teams (1-4 members)'
        },
        {
          id: 'act-2',
          description: 'Carry digital or physical university barcode ID card for security check-in at Block 1',
          deadline: 'October 24, 2026',
          isUrgent: false,
          targetAudience: 'All attendees'
        }
      ],
      uncertainties: [
        {
          field: 'refreshment_policy',
          reason: 'cropped',
          observation: 'Bottom right corner has a partially obscured note mentioning "Lunch coupons issued at..." but ticket details are clipped.',
          box2d: [859, 75, 920, 925]
        }
      ],
      hotspots: [
        {
          id: 'hs-title',
          label: 'Event Title',
          value: 'TechNova 2026: Multimodal Intelligence & Autonomous Robotics',
          actionType: 'copy',
          box2d: [170, 75, 260, 925],
          confidence: 'high'
        },
        {
          id: 'hs-date',
          label: 'Date & Timing',
          value: 'October 24–25, 2026 (09:30 AM – 05:30 PM IST)',
          actionType: 'calendar',
          box2d: [363, 75, 490, 475],
          confidence: 'high'
        },
        {
          id: 'hs-venue',
          label: 'Campus Venue',
          value: 'Turing Auditorium, Academic Block 1, MUJ Campus',
          actionType: 'map',
          box2d: [363, 525, 490, 925],
          confidence: 'high'
        },
        {
          id: 'hs-deadline',
          label: 'Registration Deadline',
          value: 'Abstract Submission: Oct 18, 2026 (11:59 PM)',
          actionType: 'calendar',
          box2d: [700, 75, 836, 925],
          confidence: 'high'
        },
        {
          id: 'hs-link',
          label: 'RSVP Portal',
          value: 'https://technova.muj.ac.in/register',
          actionType: 'link',
          box2d: [800, 112, 836, 600],
          confidence: 'high'
        },
        {
          id: 'hs-torn',
          label: 'Torn / Cropped Note',
          value: 'Lunch coupons issued at... [corner torn]',
          actionType: 'inspect',
          box2d: [859, 75, 920, 925],
          confidence: 'low',
          note: 'Physical corner torn off on notice board'
        }
      ],
      confidenceDisclaimer: 'Verified with high confidence from notice header and date banner. Always check technova.muj.ac.in for real-time room schedule changes.',
      modelUsed: 'gemma-4-31b-it (via Google GenAI SDK)',
      processingTimeMs: 1420,
      extractedAt: '2026-10-10T01:00:00.000Z',
      isFallbackDemo: true
    }
  },
  {
    id: 'sample-library-holiday',
    title: 'Central Library Mid-Term Schedule & Exam Overnight Access',
    shortLabel: '24/7 Library',
    subtitle: 'Urgent administrative notice from Library Committee',
    thumbnailPath: '/samples/library_notice.svg',
    description: 'Official notice detailing modified library hours, overnight study room bookings, and overdue book clearance.',
    category: 'facility_announcement',
    cachedResult: {
      category: 'facility_announcement',
      headlineSummary: 'Central Library extends operating hours to 24x7 from October 15 for Mid-Term exam prep. All overdue book penalties must be cleared by October 14.',
      keyTakeaways: [
        '24/7 Silent Reading Hall active from October 15 to October 31',
        'Book issuing counter closes at 10:00 PM daily',
        'Amnesty window: Zero fines on returns submitted before October 14, 5:00 PM',
        'Pre-booking required for Group Study Rooms via the MyMUJ Portal'
      ],
      eventDetails: {
        title: 'Mid-Term 24x7 Study Access & Overdue Return Clearance',
        organizer: 'Office of the Chief Librarian, Manipal University Jaipur',
        venue: 'Central Library (Ground & First Floor)',
        date: '2026-10-15 to 2026-10-31',
        time: '24 Hours (Reading Rooms) / 09:00 AM - 10:00 PM (Issuance)',
        registrationUrlOrEmail: 'library@jaipur.manipal.edu',
        eligibility: 'Current MUJ students, scholars, and faculty'
      },
      actionItems: [
        {
          id: 'lib-1',
          description: 'Return overdue books to claim late fine waiver during the grace period',
          deadline: 'October 14, 2026, 05:00 PM',
          isUrgent: true,
          targetAudience: 'Students with overdue library cards'
        },
        {
          id: 'lib-2',
          description: 'Reserve quiet discussion pods through the portal at least 24 hours in advance',
          deadline: undefined,
          isUrgent: false,
          targetAudience: 'Study groups'
        }
      ],
      uncertainties: [
        {
          field: 'weekend_air_conditioning',
          reason: 'ambiguous',
          observation: 'Notice states "HVAC maintenance scheduled on alternating Saturdays" without specifying which zones are impacted.',
          box2d: [827, 87, 881, 912]
        }
      ],
      hotspots: [
        {
          id: 'hs-lib-title',
          label: 'Notice Heading',
          value: 'Exam Access & Overdue Book Clearance Schedule',
          actionType: 'copy',
          box2d: [181, 62, 245, 937],
          confidence: 'high'
        },
        {
          id: 'hs-lib-hours',
          label: '24x7 Reading Access',
          value: 'Reading Halls: 24 Hours Open (Continuous)',
          actionType: 'map',
          box2d: [381, 87, 527, 912],
          confidence: 'high'
        },
        {
          id: 'hs-lib-waiver',
          label: 'Fine Waiver Cutoff',
          value: 'October 14, 2026 (05:00 PM IST)',
          actionType: 'calendar',
          box2d: [554, 87, 690, 912],
          confidence: 'high'
        },
        {
          id: 'hs-lib-ambiguous',
          label: 'Ambiguous HVAC Schedule',
          value: 'HVAC maintenance scheduled on alternating Saturdays',
          actionType: 'inspect',
          box2d: [827, 87, 881, 912],
          confidence: 'medium',
          note: 'Affected study zones unspecified'
        }
      ],
      confidenceDisclaimer: 'Administrative circular scanned with 98% text clarity. Verify seat reservations via the library desk if portal shows high traffic.',
      modelUsed: 'gemma-4-31b-it (via Google GenAI SDK)',
      processingTimeMs: 1180,
      extractedAt: '2026-10-10T01:05:00.000Z',
      isFallbackDemo: true
    }
  },
  {
    id: 'sample-club-audition',
    title: 'Aeronautics & Drone Lab Recruitment 2026',
    shortLabel: 'Drone Lab',
    subtitle: 'Core committee auditions & pilot developer recruitment',
    thumbnailPath: '/samples/drone_audition_poster.svg',
    description: 'Recruitment flyer for Aeromodelling & Autonomous Systems Club with multiple domains and interview slots.',
    category: 'recruitment_audition',
    cachedResult: {
      category: 'recruitment_audition',
      headlineSummary: 'AeroClub MUJ is recruiting 1st and 2nd year students for Firmware, CAD Mechanical, Computer Vision, and Corporate Operations domains.',
      keyTakeaways: [
        'No prior hardware experience mandatory for 1st years; training bootcamps provided',
        'Round 1: Online aptitude & interest form submission',
        'Round 2: In-person interviews on October 16 & 17 at Robotics Hangar',
        'Hands-on showcase with quadcopters & fixed-wing UAVs during interview sessions'
      ],
      eventDetails: {
        title: 'AeroClub MUJ 2026 Recruitment & Task Audition',
        organizer: 'AeroClub & Drone Technology Center, MUJ',
        venue: 'Robotics Hangar, Innovation Lab Basement',
        date: '2026-10-16 to 2026-10-17',
        time: '04:30 PM - 08:00 PM IST',
        registrationUrlOrEmail: 'forms.gle/aeroclub-muj-2026',
        eligibility: 'B.Tech / BCA / M.Tech batches (1st & 2nd year priority)'
      },
      actionItems: [
        {
          id: 'rec-1',
          description: 'Fill Google Form with domain preference (CAD, Firmware, or PR)',
          deadline: 'October 14, 2026, 08:00 PM',
          isUrgent: true,
          targetAudience: 'Applicants'
        },
        {
          id: 'rec-2',
          description: 'Bring any past GitHub repo or maker project portfolio if applying for CV / Autonomy',
          deadline: 'October 16, 2026',
          isUrgent: false,
          targetAudience: 'Software & Vision applicants'
        }
      ],
      uncertainties: [
        {
          field: 'exact_interview_slot',
          reason: 'absent',
          observation: 'Notice instructs candidates to wait for an email confirming their specific interview slot timestamp.',
          box2d: [827, 75, 900, 925]
        }
      ],
      hotspots: [
        {
          id: 'hs-aero-club',
          label: 'Club Title',
          value: 'AeroClub MUJ — Drone Dynamics & Autonomous Flight',
          actionType: 'copy',
          box2d: [120, 75, 205, 925],
          confidence: 'high'
        },
        {
          id: 'hs-aero-audition',
          label: 'Interview Slot & Venue',
          value: 'Oct 16 & 17, 2026 (4:30 PM – 8:00 PM) at Robotics Hangar',
          actionType: 'calendar',
          box2d: [518, 75, 663, 925],
          confidence: 'high'
        },
        {
          id: 'hs-aero-form',
          label: 'Registration Deadline',
          value: 'forms.gle/aeroclub-muj-2026 (Closes Oct 14, 8:00 PM)',
          actionType: 'link',
          box2d: [690, 75, 809, 925],
          confidence: 'high'
        },
        {
          id: 'hs-aero-pending',
          label: 'Pending Email Dispatches',
          value: 'Audition slot tokens dispatched to registered emails',
          actionType: 'inspect',
          box2d: [827, 75, 900, 925],
          confidence: 'medium',
          note: 'Specific slot tokens distributed via email batch'
        }
      ],
      confidenceDisclaimer: 'Extracted clearly from poster typography. Check your spam folder after filling the form for your interview token.',
      modelUsed: 'gemma-4-31b-it (via Google GenAI SDK)',
      processingTimeMs: 1310,
      extractedAt: '2026-10-10T01:10:00.000Z',
      isFallbackDemo: true
    }
  }
];
