import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { AntDesign, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import React, { useEffect } from 'react';
import { router, Redirect } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
  RunOnJS
} from 'react-native-reanimated';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const { isSignedIn } = useAuth(); // Check auth status
  const introTranslateX = useSharedValue(width);
  const introOpacity = useSharedValue(0);
  const buttonTranslateX = useSharedValue(width);
  const buttonOpacity = useSharedValue(0);

  useEffect(() => {
    WebBrowser.warmUpAsync();

    // Animation Sequence
    // 1. Intro Text slides in from right (immediately)
    introOpacity.value = withTiming(1, { duration: 500 });
    introTranslateX.value = withSequence(
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) }), // Slide in
      withDelay(10000, withTiming(-width, { duration: 1000, easing: Easing.in(Easing.exp) })) // Wait 10s, Slide out left
    );

    // 2. Button slides in from right (after intro exits ~11s)
    buttonOpacity.value = withDelay(11000, withTiming(1, { duration: 500 }));
    buttonTranslateX.value = withDelay(
      11000,
      withTiming(0, { duration: 1000, easing: Easing.out(Easing.exp) })
    );

    return () => {
      WebBrowser.coolDownAsync();
    };
  }, []);

  const onSignInWithGoogle = React.useCallback(async () => {
    try {
      const { createdSessionId, signIn, signUp, setActive } = await startOAuthFlow();

      if (createdSessionId) {
        if (setActive) {
          await setActive({ session: createdSessionId });
        }
        router.replace('/(tabs)/search');
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  const introStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: introTranslateX.value }],
      opacity: introOpacity.value,
    };
  });

  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: buttonTranslateX.value }],
      opacity: buttonOpacity.value,
      position: 'absolute', // Position absolute to overlap/replace the intro container area if needed
      width: '100%',
      alignItems: 'center',
    };
  });

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
        <SafeAreaView className="flex-1 w-full justify-between items-center py-12">

          {/* Top Section (Static) */}
          <View className="flex-1 justify-center items-center w-full">
            <Text className="text-black font-[Impact] font-black tracking-[0.2em] text-6xl text-center pt-10 mb-8 uppercase">
              MIND  REPS
            </Text>
            <Image
              source={require('@/assets/images/index_brain_v2.png')}
              className="w-100 h-80"
              resizeMode="contain"
            />
            <Text className="text-white font-bold tracking-widest text-lg text-center mt-8 uppercase font-[Impact]">
              TRAINING YOUR MIND LIKE YOUR BODY
            </Text>
          </View>

          {/* Bottom Section (Animated) */}
          <View className="w-full items-center mb-12 h-64 justify-center relative">

            {/* Intro Text Animation */}
            <Animated.View style={[introStyle, { width: '100%', paddingHorizontal: 32, position: 'absolute' }]}>

              <View className="space-y-6 px-4">
                <View className="flex-row items-start">
                  <Feather name="check-circle" size={20} color="white" style={{ marginTop: 4, marginRight: 12 }} />
                  <Text className="text-white text-lg font-bold tracking-widest leading-7 flex-1">
                    BUILDING THE ESCAPE FROM ANXIOUS THOUGHT LOOPS
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Feather name="check-circle" size={20} color="white" style={{ marginTop: 4, marginRight: 12 }} />
                  <Text className="text-white text-lg font-bold tracking-widest leading-7 flex-1">
                    FORMING HABITS TO ALLOW CALM, CONTROL AND CONFIDENCE
                  </Text>
                </View>
                <View className="flex-row items-start">
                  <Feather name="check-circle" size={20} color="white" style={{ marginTop: 4, marginRight: 12 }} />
                  <Text className="text-white text-lg font-bold tracking-widest leading-7 flex-1">
                    LOSING THE GURU VIBES & LEARNING THE BIOLOGY
                  </Text>
                </View>
              </View>
            </Animated.View>

            {/* Button Animation */}
            <Animated.View style={buttonStyle}>
              <TouchableOpacity
                className="bg-white/90 flex-row items-center justify-center px-8 py-4 rounded-full w-4/5 max-w-sm "
                activeOpacity={0.8}
                onPress={onSignInWithGoogle}
                style={{
                  // shadowColor: "#000",
                  // shadowOffset: { width: 0, height: 4 },
                  // shadowOpacity: 0.30,
                  // shadowRadius: 4.65,
                  elevation: 8,
                }}
              >
                <AntDesign name="google" size={24} color="#333" />
                <Text className="text-slate-800 text-lg font-medium ml-3">Sign in with Google</Text>
              </TouchableOpacity>
            </Animated.View>

          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
