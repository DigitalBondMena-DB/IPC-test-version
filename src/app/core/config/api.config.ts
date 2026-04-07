export const API_CONFIG = {
  BASE_URL: 'https://ipc.mshmohm.com/api/admin/',
  ENDPOINTS: {
    LOGIN: 'login',
    HOME: 'home',
    CATEGORIES: 'categories',
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
        SUPER_ADMIN: 'ministry',
        GOVERNORATES: 'governorate',
        SECTORS: 'medical_area',
        HOSPITAL: 'hospital',
        AUTHORITY: 'authority',
        FACILITIES: 'authority',
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
