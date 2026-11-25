import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { YStack } from 'tamagui';

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView (forms, long content). Leave off for screens that render a FlatList. */
  scroll?: boolean;
  /** Pad for the status bar / notch. Use on screens without a navigation header. */
  safeTop?: boolean;
  /** Center content vertically (auth forms, empty states). */
  centered?: boolean;
};

/** Base container for every screen: themed background, padding, safe areas, keyboard handling. */
export function Screen({ children, scroll = false, safeTop = false, centered = false }: ScreenProps) {
  const insets = useSafeAreaInsets();

  const content = (
    <YStack
      flex={1}
      gap="4"
      padding="4"
      paddingTop={safeTop ? insets.top + 16 : undefined}
      paddingBottom={insets.bottom + 16}
      justifyContent={centered ? 'center' : 'flex-start'}
      width="100%"
      maxWidth={640}
      alignSelf="center"
    >
      {children}
    </YStack>
  );

  return (
    <YStack flex={1} backgroundColor="background">
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {scroll ? (
          <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
            {content}
          </ScrollView>
        ) : (
          content
        )}
      </KeyboardAvoidingView>
    </YStack>
  );
}
