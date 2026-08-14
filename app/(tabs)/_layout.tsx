import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, font, type } from '../../theme/tokens';

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
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t('tabs.bookings'),
          tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: t('tabs.chat'),
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubble-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
