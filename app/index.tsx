import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import React, { useEffect } from 'react';
import { router, Redirect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { user } = useAuth(); 
  const isSignedIn = !!user;
  const introTranslateX = useSharedValue(width);
  const introOpacity = useSharedValue(0);
  const buttonTranslateX = useSharedValue(width);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {


    introOpacity.value = withTiming(1, { duration: 500 });
    introTranslateX.value = withSequence(
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) }),
      withDelay(15000, withTiming(-width, { duration: 1000, easing: Easing.in(Easing.exp) }))
    );

    buttonOpacity.value = withDelay(16000, withTiming(1, { duration: 500 }));
    buttonTranslateX.value = withDelay(
      16000,
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) })
    );


  }, []);



  const introStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: introTranslateX.value }],
    opacity: introOpacity.value,
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: buttonTranslateX.value }],
    opacity: buttonOpacity.value,
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
  }));



  if (isSignedIn) {
    return <Redirect href="/(tabs)/search" />;
  }

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#fcd34d', '#f472b6', '#db2777', '#c084fc']}
        className="flex-1 justify-between items-center"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 w-full justify-between items-center py-8">

          {/* Top Section */}
          <View className="flex-1 justify-center items-center w-full">
            <Text className="text-black font-[Impact] font-black text-6xl text-center pt-10 mb-8 uppercase">
              MIND  REPS
            </Text>
            <Image
              source={require('@/assets/images/index_brain_v2.png')}
              className="w-4/5 h-72"
              resizeMode="contain"
            />
            <Text className="text-black font-bold text-2xl text-center mt-8 uppercase font-[Impact] px-10">
              MENTALLY STRONGER. MADE SIMPLE. QUICKER THAN YOU THINK.
            </Text>
          </View>

          {/* Bottom Section */}
          <View className="w-full items-center mb-6 h-64 justify-center relative">
            {/* Intro Animation */}
            <Animated.View style={[introStyle, { width: '100%', paddingHorizontal: 32, position: 'absolute' }]}>
              <View className="space-y-6 px-4">
                {["Building the escape from anxious thought loops",
                  "Forming habits to allow calm, control and confidence",
                  "Losing the guru vibes & learning the biology"].map((text, i) => (
                    <View key={i} className="flex-row items-start">
                      <Feather name="check-circle" size={20} color="white" style={{ marginTop: 4, marginRight: 12 }} />
                      <Text className="text-white text-lg tracking-widest leading-7 flex-1">{text}</Text>
                    </View>
                  ))}
              </View>
            </Animated.View>

            {/* Button Animation */}
            <Animated.View style={buttonStyle}>
              <TouchableOpacity
                className="bg-white/90 flex-row items-center justify-center px-8 py-4 rounded-full w-4/5 max-w-sm"
                activeOpacity={0.8}
                onPress={() => router.push('./auth/sign-up')}
                style={{ elevation: 8 }}
              >
                <Feather name="arrow-right-circle" size={24} color="#db2777" />
                <Text className="text-slate-800 text-lg font-medium ml-3 font-bold">GET STARTED</Text>
              </TouchableOpacity>
            </Animated.View>

          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
