const translations = {
  en: {
    dashboard: 'Dashboard',
    trips: 'My Trips',
    expenses: 'Expenses',
    chat: 'Group Chat',
    explore: 'Explore Karnataka',
    profile: 'Profile',
    welcome: 'Welcome to RoamMate 🌍',
    search: 'Search...',
    language: 'Language',
  },
  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    trips: 'ನನ್ನ ಪ್ರವಾಸಗಳು',
    expenses: 'ಖರ್ಚುಗಳು',
    chat: 'ಗುಂಪು ಚಾಟ್',
    explore: 'ಕರ್ನಾಟಕ ಅನ್ವೇಷಿಸಿ',
    profile: 'ಪ್ರೊಫೈಲ್',
    welcome: 'ಟ್ರಿಪ್‌ಸಿಂಕ್ AI ಗೆ ಸ್ವಾಗತ',
    search: 'ಹುಡುಕಿ...',
    language: 'ಭಾಷೆ',
  },
  hi: {
    dashboard: 'डैशबोर्ड',
    trips: 'मेरी यात्राएं',
    expenses: 'खर्च',
    chat: 'ग्रुप चैट',
    explore: 'कर्नाटक खोजें',
    profile: 'प्रोफाइल',
    welcome: 'ट्रिपसिंक AI में आपका स्वागत है',
    search: 'खोजें...',
    language: 'भाषा',
  },
  es: {
    dashboard: 'Panel de Control',
    trips: 'Mis Viajes',
    expenses: 'Gastos Compartidos',
    chat: 'Chat Grupal',
    explore: 'Explorar Karnataka',
    profile: 'Perfil de Usuario',
    welcome: 'Bienvenido a RoamMate 🌍',
    search: 'Buscar...',
    language: 'Idioma',
  },
  fr: {
    dashboard: 'Tableau de bord',
    trips: 'Mes Voyages',
    expenses: 'Dépenses',
    chat: 'Discussion de Groupe',
    explore: 'Explorer le Karnataka',
    profile: 'Profil',
    welcome: 'Bienvenue sur RoamMate 🌍',
    search: 'Rechercher...',
    language: 'Langue',
  },
};

export function getTranslation(lang = 'en', key = '') {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}

export default translations;
