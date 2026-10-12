/**
 * Pastel Theme Color Token Definitions
 */

export const THEME_CONFIGS = {
  lavender: {
    name: 'Lavender Dream',
    id: 'lavender',
    dotColor: '#C4B5FD',
    accent: '#7C3AED',
    cardBg: 'bg-[#FAF8FF]',
    cardBorder: 'border-[#E9E3FF]',
    badgeBg: 'bg-[#EDE9FE]',
    badgeText: 'text-[#6D28D9]',
    badgeBorder: 'border-[#DDD6FE]',
    btnPrimary: 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[#DDD6FE]',
    progressFill: 'bg-[#8B5CF6]',
    gradientHeader: 'from-[#FAF5FF] via-[#F3E8FF] to-[#FAF5FF]',
    bannerBg: 'bg-gradient-to-r from-[#EDE9FE]/70 to-[#FCE7F3]/70',
  },
  blush: {
    name: 'Blush Rose',
    id: 'blush',
    dotColor: '#FBCFE8',
    accent: '#DB2777',
    cardBg: 'bg-[#FFF9FA]',
    cardBorder: 'border-[#FFE4E8]',
    badgeBg: 'bg-[#FCE7F3]',
    badgeText: 'text-[#BE185D]',
    badgeBorder: 'border-[#FBCFE8]',
    btnPrimary: 'bg-[#EC4899] hover:bg-[#DB2777] text-white shadow-[#FBCFE8]',
    progressFill: 'bg-[#EC4899]',
    gradientHeader: 'from-[#FFF1F2] via-[#FCE7F3] to-[#FFF1F2]',
    bannerBg: 'bg-gradient-to-r from-[#FCE7F3]/70 to-[#FEF3C7]/70',
  },
  sage: {
    name: 'Sage Meadow',
    id: 'sage',
    dotColor: '#A7F3D0',
    accent: '#059669',
    cardBg: 'bg-[#F9FCFA]',
    cardBorder: 'border-[#E2F2E7]',
    badgeBg: 'bg-[#DCFCE7]',
    badgeText: 'text-[#15803D]',
    badgeBorder: 'border-[#BBF7D0]',
    btnPrimary: 'bg-[#10B981] hover:bg-[#059669] text-white shadow-[#A7F3D0]',
    progressFill: 'bg-[#10B981]',
    gradientHeader: 'from-[#F0FDF4] via-[#DCFCE7] to-[#F0FDF4]',
    bannerBg: 'bg-gradient-to-r from-[#DCFCE7]/70 to-[#E0F2FE]/70',
  },
  peach: {
    name: 'Peach Vanilla',
    id: 'peach',
    dotColor: '#FED7AA',
    accent: '#EA580C',
    cardBg: 'bg-[#FFFDF9]',
    cardBorder: 'border-[#FFEED8]',
    badgeBg: 'bg-[#FFEDD5]',
    badgeText: 'text-[#C2410C]',
    badgeBorder: 'border-[#FED7AA]',
    btnPrimary: 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[#FED7AA]',
    progressFill: 'bg-[#F97316]',
    gradientHeader: 'from-[#FFF7ED] via-[#FFEDD5] to-[#FFF7ED]',
    bannerBg: 'bg-gradient-to-r from-[#FFEDD5]/70 to-[#EDE9FE]/70',
  },
  sky: {
    name: 'Sky Serenade',
    id: 'sky',
    dotColor: '#BAE6FD',
    accent: '#0284C7',
    cardBg: 'bg-[#F8FCFF]',
    cardBorder: 'border-[#E0F2FE]',
    badgeBg: 'bg-[#E0F2FE]',
    badgeText: 'text-[#0369A1]',
    badgeBorder: 'border-[#BAE6FD]',
    btnPrimary: 'bg-[#0284C7] hover:bg-[#0369A1] text-white shadow-[#BAE6FD]',
    progressFill: 'bg-[#0284C7]',
    gradientHeader: 'from-[#F0F9FF] via-[#E0F2FE] to-[#F0F9FF]',
    bannerBg: 'bg-gradient-to-r from-[#E0F2FE]/70 to-[#DCFCE7]/70',
  },
};

export function getTheme(themeKey) {
  return THEME_CONFIGS[themeKey] || THEME_CONFIGS.lavender;
}

export const SUBJECT_OPTIONS = [
  'General',
  'Science',
  'Languages',
  'Technology',
  'Humanities',
  'Mathematics',
  'Medicine',
  'Business',
  'Arts',
];

export const ICON_OPTIONS = ['🌸', '🌿', '💡', '📖', '💻', '☕', '🧪', '🎨', '⭐', '🚀', '🧠', '✨'];
