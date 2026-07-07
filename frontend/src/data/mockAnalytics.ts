// Funnel data - each step shows starts and drop-offs
export const funnelData = [
  { step: 'Widget Start', count: 2840, color: '#2563EB' },
  { step: 'Language Select', count: 2415, color: '#3B82F6' },
  { step: 'Lead Gate', count: 1896, color: '#60A5FA' },
  { step: 'Map Drawn', count: 1342, color: '#22C55E' },
  { step: 'Materials', count: 1187, color: '#16A34A' },
  { step: 'Result View', count: 1054, color: '#15803D' },
  { step: 'Booked', count: 168, color: '#F59E0B' },
];

// Leads over time (last 30 days)
export const leadsOverTime = [
  { date: '2025-04-27', leads: 8 },
  { date: '2025-04-28', leads: 12 },
  { date: '2025-04-29', leads: 15 },
  { date: '2025-04-30', leads: 11 },
  { date: '2025-05-01', leads: 14 },
  { date: '2025-05-02', leads: 9 },
  { date: '2025-05-03', leads: 6 },
  { date: '2025-05-04', leads: 18 },
  { date: '2025-05-05', leads: 22 },
  { date: '2025-05-06', leads: 19 },
  { date: '2025-05-07', leads: 16 },
  { date: '2025-05-08', leads: 13 },
  { date: '2025-05-09', leads: 20 },
  { date: '2025-05-10', leads: 17 },
  { date: '2025-05-11', leads: 10 },
  { date: '2025-05-12', leads: 23 },
  { date: '2025-05-13', leads: 25 },
  { date: '2025-05-14', leads: 21 },
  { date: '2025-05-15', leads: 28 },
  { date: '2025-05-16', leads: 19 },
  { date: '2025-05-17', leads: 14 },
  { date: '2025-05-18', leads: 16 },
  { date: '2025-05-19', leads: 31 },
  { date: '2025-05-20', leads: 27 },
  { date: '2025-05-21', leads: 22 },
  { date: '2025-05-22', leads: 35 },
  { date: '2025-05-23', leads: 29 },
  { date: '2025-05-24', leads: 24 },
  { date: '2025-05-25', leads: 38 },
  { date: '2025-05-26', leads: 42 },
];

// Leads over time - 7 day view
export const leadsOverTime7D = [
  { date: '2025-05-20', leads: 27 },
  { date: '2025-05-21', leads: 22 },
  { date: '2025-05-22', leads: 35 },
  { date: '2025-05-23', leads: 29 },
  { date: '2025-05-24', leads: 24 },
  { date: '2025-05-25', leads: 38 },
  { date: '2025-05-26', leads: 42 },
];

// Leads over time - 90 day view
export const leadsOverTime90D = [
  { date: '2025-02-26', leads: 5 },
  { date: '2025-03-01', leads: 7 },
  { date: '2025-03-04', leads: 9 },
  { date: '2025-03-07', leads: 6 },
  { date: '2025-03-10', leads: 11 },
  { date: '2025-03-13', leads: 8 },
  { date: '2025-03-16', leads: 13 },
  { date: '2025-03-19', leads: 10 },
  { date: '2025-03-22', leads: 15 },
  { date: '2025-03-25', leads: 12 },
  { date: '2025-03-28', leads: 18 },
  { date: '2025-03-31', leads: 14 },
  { date: '2025-04-03', leads: 16 },
  { date: '2025-04-06', leads: 20 },
  { date: '2025-04-09', leads: 11 },
  { date: '2025-04-12', leads: 17 },
  { date: '2025-04-15', leads: 13 },
  { date: '2025-04-18', leads: 19 },
  { date: '2025-04-21', leads: 15 },
  { date: '2025-04-24', leads: 21 },
  { date: '2025-04-27', leads: 8 },
  { date: '2025-04-30', leads: 11 },
  { date: '2025-05-03', leads: 6 },
  { date: '2025-05-06', leads: 19 },
  { date: '2025-05-09', leads: 20 },
  { date: '2025-05-12', leads: 23 },
  { date: '2025-05-15', leads: 28 },
  { date: '2025-05-18', leads: 16 },
  { date: '2025-05-21', leads: 22 },
  { date: '2025-05-24', leads: 24 },
  { date: '2025-05-26', leads: 42 },
];

// Leads by trade
export const leadsByTrade = [
  { trade: 'Concrete', leads: 312, color: '#2563EB' },
  { trade: 'Asphalt', leads: 198, color: '#3B82F6' },
  { trade: 'Landscape', leads: 267, color: '#22C55E' },
  { trade: 'Deck', leads: 156, color: '#F59E0B' },
  { trade: 'Roofing', leads: 423, color: '#EF4444' },
  { trade: 'Fence', leads: 189, color: '#8B5CF6' },
];

// Leads by language
export const leadsByLanguage = [
  { language: 'English', leads: 892, percentage: 78 },
  { language: 'Spanish', leads: 253, percentage: 22 },
];

// Conversion rates
export const conversionMetrics = {
  widgetStartToLead: 66.8,
  leadToMapDrawn: 70.8,
  mapToResult: 78.5,
  resultToBooked: 15.9,
  overallConversion: 5.9,
};

// Recent activity (last 10 events)
export const recentActivity = [
  { id: 'evt_1', type: 'lead' as const, message: 'New lead: Maria G. - Roofing estimate $8,400-$10,200', time: '2 min ago', trade: 'roof', lang: 'es' },
  { id: 'evt_2', type: 'booked' as const, message: 'Appointment booked: James W. - Concrete patio installation', time: '15 min ago', trade: 'concrete', lang: 'en' },
  { id: 'evt_3', type: 'viewed' as const, message: 'Estimate viewed: Robert C. viewed Deck estimate $15,120', time: '32 min ago', trade: 'deck', lang: 'en' },
  { id: 'evt_4', type: 'lead' as const, message: 'New lead: Elena V. - Fence quote $3,135-$3,835', time: '45 min ago', trade: 'fence', lang: 'es' },
  { id: 'evt_5', type: 'lead' as const, message: 'New lead: David T. - Exposed Aggregate driveway $38,760', time: '1 hr ago', trade: 'concrete', lang: 'en' },
  { id: 'evt_6', type: 'booked' as const, message: 'Appointment booked: Laura M. - Landscape sod + irrigation', time: '1 hr ago', trade: 'landscape', lang: 'es' },
  { id: 'evt_7', type: 'viewed' as const, message: 'Estimate viewed: Kevin O\'Brien viewed Asphalt estimate $20,250', time: '2 hr ago', trade: 'asphalt', lang: 'en' },
  { id: 'evt_8', type: 'lead' as const, message: 'New lead: Amanda S. - Broom finish concrete $6,480', time: '2 hr ago', trade: 'concrete', lang: 'en' },
  { id: 'evt_9', type: 'viewed' as const, message: 'Estimate viewed: Michael B. re-viewed Deck estimate', time: '3 hr ago', trade: 'deck', lang: 'en' },
  { id: 'evt_10', type: 'booked' as const, message: 'Appointment booked: Richard H. - Slate tile roof $27,000', time: '4 hr ago', trade: 'roof', lang: 'en' },
];

// Stats summary
export const analyticsSummary = {
  totalWidgetStarts: 2840,
  totalLeadsGenerated: 1896,
  totalMapDrawings: 1342,
  totalEstimatesViewed: 1054,
  totalAppointmentsBooked: 168,
  avgProjectValue: 15420,
  conversionRate: 5.9,
  leadsThisWeek: 47,
  leadsLastWeek: 38,
  weekOverWeekChange: 23.7,
};
