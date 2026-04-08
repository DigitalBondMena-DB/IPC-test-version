export const API_CONFIG = {
  BASE_URL: 'https://ipc-v2.mshmohm.com/api/admin/',
  ENDPOINTS: {
    LOGIN: 'login',
    HOME: 'home',
    DIVISIONS: 'divisions',
    GOVERNORATES: 'governorates',
    SECTORS: 'sectors',
    AUTHORITIES: 'authorities',
    FACILITIES: 'facilitys',
    ENTITIES: {
      BASE: 'entities',
      TYPE: {
        GOVERNORATES: 'governorate',
        SECTORS: 'medical_area',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
        FACILITIES: 'authority',
      },
    },
    USERS: {
      BASE: 'users',
      TYPE: {
        SUPER_ADMIN: 'super_admin',
        GOVERNORATES: 'governorate',
        SECTORS: 'sector',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
        FACILITIES: 'facility',
      },
    },
    SURVEYS: {
      BASE: 'surveys',
      DOMAINS: 'domains',
    },
    QUESTIONS: 'questions',
    LOGIC_RULES: 'logic-rules',
  },
};
