export const API_CONFIG = {
  BASE_URL: 'https://ipc.mshmohm.com/api/admin/',
  ENDPOINTS: {
    LOGIN: 'login',
    HOME: 'home',
    CATEGORIES: 'categories',
    ENTITIES: {
      BASE: 'entities',
      TYPE: {
        HEALTH_DIRECTORATE: 'governorate',
        HEALTH_DIVISION: 'medical_area',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
      },
    },
    USERS: {
      BASE: 'users',
      TYPE: {
        SUPER_ADMIN: 'ministry',
        HEALTH_DIRECTORATE: 'governorate',
        HEALTH_DIVISION: 'medical_area',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
        AUTHORITY_HOSPITAL: 'authority_hospital',
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
