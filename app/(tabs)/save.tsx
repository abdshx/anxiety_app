import React, { useState, useEffect } from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions, Pressable, ActivityIndicator, Alert } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { FontAwesome5, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  cancelAnimation
} from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useRef } from 'react';

const audioMap: { [key: number]: any } = {
  1: require('@/assets/audio/Day1.mp3'),
  2: require('@/assets/audio/Day2.mp3'),
  3: require('@/assets/audio/Day3.mp3'),
  4: require('@/assets/audio/Day4.mp3'),
  5: require('@/assets/audio/Day5.mp3'),
  6: require('@/assets/audio/Day6.mp3'),
  7: require('@/assets/audio/Day7.mp3'),
  8: require('@/assets/audio/Day8.mp3'),
  9: require('@/assets/audio/Day9.mp3'),
  10: require('@/assets/audio/Day10.mp3'),
};

const { width } = Dimensions.get('window');

export default function AudioPlayerScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { day, title, category, ts, cardDay } = params;
  const audioFile = audioMap[Number(cardDay)] || audioMap[1];
  const insets = useSafeAreaInsets();

  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [progressBarWidth, setProgressBarWidth] = useState(0);
  let emailAddress = user?.email;

  const pulseScale = useSharedValue(1);

  // ✏️ ADDED: track mounted state
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  async function playSound() {
    setIsLoading(true);
    try {
      if (sound) await sound.unloadAsync();

      const { sound: newSound } = await Audio.Sound.createAsync(
        audioFile,
        { shouldPlay: true }
      );

      // // Check if component is still mounted
      // if (!isMounted.current) {
      //   await newSound.unloadAsync();
      //   return;
      // }

      setSound(newSound);
      setIsPlaying(true);
      startAnimation();

      newSound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;

        setDuration(status.durationMillis || 0);
        setPosition(status.positionMillis || 0);

        if (status.didJustFinish && isMounted.current) {
          setIsPlaying(false);
          setPosition(0);
          pulseScale.value = 1;
          newSound.stopAsync();

          // ✏️ CHANGED: safe navigation
          // ✏️ CHANGED: safe navigation with Supabase check
          requestAnimationFrame(async () => {
            if (!user) {
              router.replace('/(tabs)/profile');
              return;
            }

            try {
              const { data, error } = await supabase
                .from('User')
                .select('stress_level')
                .eq('email', emailAddress)
                .eq('day_number', Number(day))
                .single();

              if (!error && data && data.stress_level > 0) {
                Alert.alert("Great Job!", "You already recorded your stress level for today.");
                router.back();
              } else {
                router.replace('/(tabs)/profile');
              }
            } catch (e) {
              console.error(e);
              router.replace('/(tabs)/profile');
            }
          });
        }
      });

      setIsLoading(false);
      return newSound;
    } catch (error) {
      console.error('Error loading sound', error);
      setIsLoading(false);
    }
  }

  const startAnimation = () => {
    pulseScale.value = withRepeat(
      withTiming(1.1, { duration: 1000, easing: Easing.ease }),
      -1,
      true
    );
  };

  const stopAnimation = () => {
    cancelAnimation(pulseScale);
    pulseScale.value = withTiming(1, { duration: 300 });
  };

  async function togglePlayback() {
    if (isLoading) return;

    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
        stopAnimation();
      } else {
        await sound.playAsync();
        setIsPlaying(true);
        startAnimation();
      }
    } else {
      await playSound();
    }
  }

  const handleSeek = async (event: any) => {
    if (!sound || duration === 0 || progressBarWidth === 0) return;

    const touchX = event.nativeEvent.locationX;
    const progress = touchX / progressBarWidth;
    const seekPosition = progress * duration;

    await sound.setPositionAsync(seekPosition);
    setPosition(seekPosition);
  };

  useEffect(() => {
    soundRef.current = sound;
  }, [sound]);

  useFocusEffect(
    useCallback(() => {
      return () => {
        if (soundRef.current) {
          soundRef.current.pauseAsync();
          setIsPlaying(false);
          stopAnimation();
        }
      };
    }, [])
  );

  useEffect(() => {
    if (day) {
      playSound();
    }
  }, [ts]);

  useEffect(() => {
    return sound
      ? () => {
        sound.unloadAsync();
      }
      : undefined;
  }, [sound]);

  useEffect(() => {
    if (isPlaying) {
      activateKeepAwakeAsync();
    } else {
      deactivateKeepAwake();
    }
    return () => {
      deactivateKeepAwake();
    };
  }, [isPlaying]);

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const formatTime = (millis: number) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ':' + (Number(seconds) < 10 ? '0' : '') + seconds;
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="light" />

      {/* ✅ UNCHANGED UI BELOW */}
      {/* Top Image Section */}
      <View className="h-[55%] w-full relative">
        <Image
          source={require('@/assets/images/calming-nature.png')}
          className="w-full h-full"
          resizeMode="cover"
        />
        <LinearGradient
          colors={['transparent', '#fcd34d']}
          className="absolute bottom-0 left-0 right-0 h-40"
        />
        <View style={{ position: 'absolute', top: insets.top + 8, left: 24 }}>
          <TouchableOpacity
            className="bg-white/20 p-2 rounded-full"
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Controls Section */}
      <LinearGradient
        colors={['#fcd34d', '#f472b6', '#db2777', '#c084fc']}
        className="flex-1 -mt-10 rounded-t-[40px] px-8 pt-4"
      >
        <View className="items-center mb-8">
          <Text className="text-3xl font-bold text-white text-center font-dancing mb-2">
            {title || 'Mindfulness for Beginners'}
          </Text>
          <Text className="text-white/80 font-medium font-dancing text-2xl">
            {category || 'Jeff Warren'}
          </Text>
        </View>

        {/* Progress Bar */}
        <View className="mb-10">
          <Pressable
            onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
            onPress={handleSeek}
            className="h-4 bg-white/30 rounded-full w-full mb-2 overflow-hidden"
          >
            <View
              style={{ width: `${(position / (duration || 1)) * 100}%` }}
              className="h-full bg-white rounded-full"
            />
          </Pressable>

          <View className="flex-row justify-between">
            <Text className="text-md text-white/50 font-medium">
              {formatTime(position)}
            </Text>
            <Text className="text-md text-white/50 font-medium">
              {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* Controls */}
        <View className="flex-row items-center justify-center px-4">
          <Animated.View style={[animatedButtonStyle]}>
            <TouchableOpacity
              onPress={togglePlayback}
              disabled={isLoading}
              className="bg-white w-20 h-20 rounded-full items-center justify-center"
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator size="large" color="#db2777" />
                // <View>trying</View>
              ) : (
                <FontAwesome5
                  name={isPlaying ? 'pause' : 'play'}
                  size={28}
                  color="#db2777"
                  style={{ marginLeft: isPlaying ? 0 : 4 }}
                />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* <View className="flex-row justify-between items-center mt-12 px-8">
          <TouchableOpacity>
            <Feather name="heart" size={24} color="white" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="share-2" size={24} color="white" />
          </TouchableOpacity>
        </View> */}
      </LinearGradient>
    </View>
  );
}
