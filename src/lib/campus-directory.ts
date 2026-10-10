/**
 * MUJ Campus Directory & Indoor Landmark Mapping
 * Maps room numbers, building acronyms, and campus facilities
 * to locations, coordinates, and navigational directions.
 */

export interface MujCampusLocation {
  code: string;
  name: string;
  building: string;
  floor: string;
  landmarks: string;
  googleMapsQuery: string;
}

export const MUJ_CAMPUS_LOCATIONS: Record<string, MujCampusLocation> = {
  'AB1': {
    code: 'AB1',
    name: 'Academic Block 1 (Admin & Central Wings)',
    building: 'Academic Block 1',
    floor: 'Floors G to 4',
    landmarks: 'Main University Entrance, Central Atrium, Fountain Plaza',
    googleMapsQuery: 'Academic Block 1 Manipal University Jaipur'
  },
  'AB2': {
    code: 'AB2',
    name: 'Academic Block 2 (School of Computing & IT)',
    building: 'Academic Block 2',
    floor: 'Floors G to 4',
    landmarks: 'Adjacent to Student Plaza, Opposite Central Library',
    googleMapsQuery: 'Academic Block 2 Manipal University Jaipur'
  },
  'AB3': {
    code: 'AB3',
    name: 'Academic Block 3 (Engineering & Robotics Labs)',
    building: 'Academic Block 3',
    floor: 'Floors G to 5',
    landmarks: 'Near Mechanical Workshops, Maker Space, Innovation Labs',
    googleMapsQuery: 'Academic Block 3 Manipal University Jaipur'
  },
  'AUDITORIUM': {
    code: 'AUDITORIUM',
    name: 'Central University Auditorium',
    building: 'Central Complex',
    floor: 'Ground & Mezzanine',
    landmarks: 'Main Road roundabout, Opposite Food Court 1',
    googleMapsQuery: 'Central Auditorium Manipal University Jaipur'
  },
  'LIBRARY': {
    code: 'LIBRARY',
    name: 'Central Library & Reading Halls',
    building: 'Central Library Building',
    floor: 'Ground, 1st & 2nd Floor',
    landmarks: 'Behind Academic Block 1, Adjacent to Amphitheatre',
    googleMapsQuery: 'Central Library Manipal University Jaipur'
  },
  'TMA_PAI': {
    code: 'TMA_PAI',
    name: 'Dr. TMA Pai Central Amphitheatre',
    building: 'Cultural Courtyard',
    floor: 'Open-Air Ground Level',
    landmarks: 'Heart of campus between Hostels and Academic Blocks',
    googleMapsQuery: 'TMA Pai Amphitheatre Manipal University Jaipur'
  },
  'TECHNOVA': {
    code: 'TECHNOVA',
    name: 'Innovation & Incubation Center (AIC-MUJ)',
    building: 'Academic Block 3, 4th Floor',
    floor: '4th Floor, Lab 402-408',
    landmarks: 'AeroClub Drone Bay, IoT Sensor Sandbox',
    googleMapsQuery: 'AIC Manipal University Jaipur'
  },
  'FOOD_COURT': {
    code: 'FOOD_COURT',
    name: 'Student Plaza & Food Court 1 & 2',
    building: 'Campus Dining Commercial Complex',
    floor: 'Ground & 1st Floor',
    landmarks: 'Beside B1 & B2 Hostels, Subway & Nescafe Outlets',
    googleMapsQuery: 'Food Court Manipal University Jaipur'
  },
  'SPORTS_COMPLEX': {
    code: 'SPORTS_COMPLEX',
    name: 'Indoor Sports Arena & Gymnasium',
    building: 'Sports Complex',
    floor: 'Ground & 1st Floor',
    landmarks: 'Behind Cricket Grounds & Tennis Courts',
    googleMapsQuery: 'Sports Complex Manipal University Jaipur'
  }
};

/**
 * Given any raw venue string extracted from a notice,
 * matches the closest campus building, room, or landmark.
 */
export function matchCampusVenue(venueText: string | null): MujCampusLocation | null {
  if (!venueText) return null;
  const upper = venueText.toUpperCase();

  if (upper.includes('AB3') || upper.includes('AB-3') || upper.includes('ACADEMIC BLOCK 3') || upper.includes('INNOVATION') || upper.includes('MAKER')) {
    return MUJ_CAMPUS_LOCATIONS['AB3'];
  }
  if (upper.includes('AB2') || upper.includes('AB-2') || upper.includes('ACADEMIC BLOCK 2') || upper.includes('COMPUTING') || upper.includes('IT LAB')) {
    return MUJ_CAMPUS_LOCATIONS['AB2'];
  }
  if (upper.includes('AB1') || upper.includes('AB-1') || upper.includes('ACADEMIC BLOCK 1') || upper.includes('TURING') || upper.includes('ADMIN')) {
    return MUJ_CAMPUS_LOCATIONS['AB1'];
  }
  if (upper.includes('AUDI') || upper.includes('AUDITORIUM') || upper.includes('MAIN HALL')) {
    return MUJ_CAMPUS_LOCATIONS['AUDITORIUM'];
  }
  if (upper.includes('LIBRARY') || upper.includes('READING') || upper.includes('STACKS')) {
    return MUJ_CAMPUS_LOCATIONS['LIBRARY'];
  }
  if (upper.includes('AMPHITHEATRE') || upper.includes('PAI') || upper.includes('QUAD')) {
    return MUJ_CAMPUS_LOCATIONS['TMA_PAI'];
  }
  if (upper.includes('TECHNOVA') || upper.includes('INCUBAT') || upper.includes('DRONE') || upper.includes('AERO')) {
    return MUJ_CAMPUS_LOCATIONS['TECHNOVA'];
  }
  if (upper.includes('FOOD') || upper.includes('PLAZA') || upper.includes('CAFETERIA')) {
    return MUJ_CAMPUS_LOCATIONS['FOOD_COURT'];
  }
  if (upper.includes('SPORTS') || upper.includes('GYM') || upper.includes('GROUND') || upper.includes('ARENA')) {
    return MUJ_CAMPUS_LOCATIONS['SPORTS_COMPLEX'];
  }

  // Default campus fallback if generic venue
  return {
    code: 'MUJ_CAMPUS',
    name: venueText,
    building: 'Manipal University Jaipur Campus',
    floor: 'Check notice signposts upon arrival',
    landmarks: 'Dehmi Kalan, Jaipur-Ajmer Expressway, RJ 303007',
    googleMapsQuery: `Manipal University Jaipur ${venueText}`
  };
}
