import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, font, type } from '../../theme/tokens';

// Filled when active, outline when idle — the iOS convention. The active glyph
// carries a touch more weight, so a slightly smaller size keeps its optical mass
// even with the current tab.
const tabIcon =
  (base: 'home' | 'receipt' | 'chatbubble' | 'person') =>
  ({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) =>
    <Ionicons name={focused ? base : (`${base}-outline` as const)} size={focused ? size - 1 : size} color={color} />;

export default function TabsLayout() {
  const { t, i18n } = useTranslation();
  // Tab labels are drawn by the navigator, not AppText, so the per-script font
  // and the taller line Telugu/Devanagari need are set here.
  const lang = i18n.language;
  const labelFont = lang === 'te' ? font.te : lang === 'hi' ? font.hi : font.medium;
  const labelLine = lang === 'en' ? undefined : Math.ceil(type.chip * 1.6);
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          paddingTop: 4,
          height: lang === 'en' ? undefined : 64,
        },
        tabBarLabelStyle: { fontFamily: labelFont, fontSize: type.chip, lineHeight: labelLine },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.home'), tabBarIcon: tabIcon('home') }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: t('tabs.bookings'), tabBarIcon: tabIcon('receipt') }}
      />
      <Tabs.Screen
        name="chat"
        options={{ title: t('tabs.chat'), tabBarIcon: tabIcon('chatbubble') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('person') }}
      />
    </Tabs>
  );
}
