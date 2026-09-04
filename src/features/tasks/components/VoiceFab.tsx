import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useIsFocused } from '@react-navigation/native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import { useTheme } from '../../../theme/ThemeProvider';
import { radius, spacing } from '../../../theme/tokens';

export interface VoiceFabProps {
  onCommand: (transcript: string) => void;
  onError: (message: string) => void;
}

const ERROR_MESSAGES: Record<string, string> = {
  network: "No connection for voice",
  'service-not-allowed': "Voice isn't available on this device",
  'no-speech': "Didn't catch that — try again",
  'speech-timeout': "Didn't catch that — try again",
  'audio-capture': "Couldn't access the microphone",
};

export function VoiceFab({ onCommand, onError }: VoiceFabProps) {
  const { theme } = useTheme();
  const isFocused = useIsFocused();
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const latestRef = useRef('');
  const handledRef = useRef(false);
  const pulse = useSharedValue(1);

  const stop = useCallback(() => {
    ExpoSpeechRecognitionModule.stop();
  }, []);

  useEffect(() => {
    if (!isFocused) stop();
  }, [isFocused, stop]);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    if (listening) {
      pulse.value = withRepeat(
        withSequence(withTiming(1.15, { duration: 500 }), withTiming(1, { duration: 500 })),
        -1,
      );
    } else {
      cancelAnimation(pulse);
      pulse.value = withSpring(1);
    }
  }, [listening, pulse]);

  useSpeechRecognitionEvent('start', () => {
    latestRef.current = '';
    handledRef.current = false;
    setInterim('');
    setListening(true);
  });

  useSpeechRecognitionEvent('result', event => {
    const transcript = event.results[0]?.transcript ?? '';
    latestRef.current = transcript;
    setInterim(transcript);
    if (event.isFinal && !handledRef.current) {
      handledRef.current = true;
      onCommand(transcript);
    }
  });

  useSpeechRecognitionEvent('end', () => {
    setListening(false);
    setInterim('');
    if (!handledRef.current && latestRef.current.trim()) {
      handledRef.current = true;
      onCommand(latestRef.current);
    }
  });

  useSpeechRecognitionEvent('error', event => {
    handledRef.current = true;
    onError(ERROR_MESSAGES[event.error] ?? "Voice command failed");
  });

  const handlePress = useCallback(async () => {
    if (listening) {
      stop();
      return;
    }
    const result = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!result.granted) {
      if (!result.canAskAgain) {
        onError("Microphone access is off — enable it in Settings");
        Linking.openSettings();
      } else {
        onError('Microphone permission is required for voice commands');
      }
      return;
    }
    ExpoSpeechRecognitionModule.start({
      lang: 'en-US',
      interimResults: true,
      continuous: false,
    });
  }, [listening, stop, onError]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  return (
    <>
      {listening && interim ? (
        <Text
          numberOfLines={1}
          style={[
            styles.interim,
            { color: theme.colors.text, backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
          ]}
        >
          {interim}
        </Text>
      ) : null}
      <Animated.View style={[styles.fab, theme.shadow.fab, animatedStyle]}>
        <Pressable
          onPress={handlePress}
          accessibilityRole="button"
          accessibilityLabel="Voice command"
          accessibilityState={{ busy: listening }}
          style={[
            styles.pressable,
            {
              backgroundColor: theme.colors.surface,
              borderColor: listening ? theme.colors.accent : theme.colors.border,
            },
          ]}
        >
          <Icon
            name={listening ? 'microphone' : 'microphone-outline'}
            size={24}
            color={listening ? theme.colors.accent : theme.colors.text}
          />
        </Pressable>
      </Animated.View>
    </>
  );
}

const FAB_SIZE = 56;

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + FAB_SIZE + spacing.sm,
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.pill,
  },
  pressable: {
    width: FAB_SIZE,
    height: FAB_SIZE,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  interim: {
    position: 'absolute',
    right: spacing.lg,
    bottom: spacing.lg + FAB_SIZE + FAB_SIZE + spacing.md,
    maxWidth: 220,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 13,
    fontWeight: '600' as const,
  },
});
