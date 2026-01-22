import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

const audioSessions = [
  { id: 1, day: 1, title: 'What is this ****?', category: 'Introduction', duration: '10 min', img: require('@/assets/images/card1.png') },
  { id: 2, day: 2, title: 'The terminology trap', category: "Basics", duration: '10 min', img: require('@/assets/images/card2.png') },
  { id: 3, day: 3, title: 'Your breath is just HQ', category: 'Technique', duration: '10 min', img: require('@/assets/images/card3.png') },
  { id: 4, day: 4, title: 'Gym for your mind', category: 'Concept', duration: '11 min', img: require('@/assets/images/card4.png') },
  { id: 5, day: 5, title: 'Don’t lose half your life', category: 'Philosophy', duration: '11 min', img: require('@/assets/images/card5.png') },
  { id: 6, day: 6, title: 'Past, present & future', category: 'Perspective', duration: '11 min', img: require('@/assets/images/card1.png') },
  { id: 7, day: 7, title: 'Get off the tracks to angryville', category: "Emotion", duration: '10 min', img: require('@/assets/images/card2.png') },
  { id: 8, day: 8, title: 'Mind-gym benefits in real life', category: 'Application', duration: '11 min', img: require('@/assets/images/card3.png') },
  { id: 9, day: 9, title: 'Life’s secret master key', category: 'Insight', duration: '10 min', img: require('@/assets/images/card4.png') },
  { id: 10, day: 10, title: 'Inside world to new life', category: 'Transformation', duration: '11 min', img: require('@/assets/images/card5.png') },
];

export default function SearchScreen() {
  const { user, signOut } = useAuth();
  const [day, setDay] = useState(1);
  const [stressLevel, setStressLevel] = useState(0);

  // Safe access to email
  const emailAddress = user?.email;
  const username=user?.username

  const fetchUserData = async () => {
    if (!user || !emailAddress) {
      console.log('fetchUserData: Missing user or email');
      return;
    }

    console.log("Fetching DB data for:", emailAddress)
    try {
      // Check if user exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('User')
        .select('*')
        .eq('email', emailAddress)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError);
        return;
      }

      if (existingUser) {
        setDay(existingUser.day_number); // Changed day to day_number to match schema if needed, checking consistency
        setStressLevel(existingUser.stress_level);
      } else {
        // Create new user (fallback if not created during signup)
        const { error: insertError } = await supabase
          .from('User')
          .insert([
            { email: emailAddress, day_number: 1, stress_level: 0 }
          ]);

        if (insertError) {
          console.error('Error creating user:', insertError);
        } else {
          setDay(1);
          setStressLevel(0);
        }
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserData();
    }, [user?.email])
  );

  const startNextDay = async () => {
    if (!user) return;
    const newDay = day + 1;
    setDay(newDay);
    //setStressLevel(0);

    const { error } = await supabase
      .from('User')
      .update({ day_number: newDay, stress_level: 0 })
      .eq('email', emailAddress);

    if (error) {
      console.error('Error updating day:', error);
    }
  };

  return (
    <LinearGradient
      colors={['#fcd34d', '#f472b6', '#db2777', '#c084fc']} // Vibrant Sunrise with Purple Accent
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex-1"
    >
      <SafeAreaView className="flex-1">
        <StatusBar style="dark" />

        {/* Header */}
        <View className="px-6 py-4 flex-row justify-between items-center z-10">
          <View>
            <Text className="text-white/80 text-lg font-oswald">Hello</Text>
            <Text className="text-white text-3xl font-bold">{username}</Text>
          </View>
          <TouchableOpacity
            className="bg-white/20 p-3 rounded-full border border-white/30 backdrop-blur-md"
            onPress={async () => {
              await signOut();
              router.replace('/');
            }}
          >
            <Feather name="log-out" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} className="flex-1 z-10">

          {/* Daily Essentials Section */}
          <View className="mt-4">
            <Text className="text-3xl font-bold text-white px-6 mb-4 font-dancing">Guided Meditation</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 20 }}
              className="flex-row"
            >
              {audioSessions.map((session) => (
                <TouchableOpacity
                  key={session.id}
                  activeOpacity={0.9}
                  className="mr-5"
                  onPress={() => router.push({
                    pathname: '/save',
                    params: {
                      day: day,
                      cardDay: session.day,
                      title: session.title,
                      category: session.category,
                      ts: Date.now()
                    }
                  })}
                >
                  <ImageBackground
                    source={session.img}
                    className="w-48 h-64 justify-between overflow-hidden relative"
                    imageStyle={{ borderRadius: 24 }}
                  >
                    {/* Overlay for readability */}
                    <View className="absolute inset-0 bg-black/20 rounded-3xl" />

                    <View className="p-5 flex-row justify-between items-start z-10">
                      <View className="bg-white/30 p-2 rounded-full backdrop-blur-md border border-white/20">
                        <FontAwesome5 name="play" size={10} color="white" />
                      </View>
                      <View className="bg-white/90 px-3 py-1 rounded-full border border-black border-[2px]">
                        <Text className="text-orange-900 text-xs font-bold font-dancing">Day {session.day}</Text>
                      </View>
                    </View>

                    <View className="p-2 px-4 z-10 mb-4 rounded-lg bg-white mx-auto border border-black border-[2px]">
                      <Text className="text-black text-xl font-bold leading-6 font-dancing rounded-md h-[70px] px-2">{session.title}</Text>
                      <Text className="text-black text-xs font-medium uppercase tracking-wider border border-white rounded-md font-oswald">{session.category}</Text>
                      <View className="flex-row items-center">
                        <Feather name="clock" size={12} color="#000" />
                        <Text className="text-black text-xs ml-1 font-medium font-dancing border border-white p-[2px] rounded-md">{session.duration}</Text>
                      </View>
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Journey Progress Section */}
          <View className="px-6 mt-6 mb-10">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-3xl font-bold text-white font-dancing">Your Journey</Text>
              <TouchableOpacity onPress={startNextDay} className="bg-white/20 px-4 py-2 rounded-full border border-white/30">
                <Text className="text-white font-dancing font-bold">Start Next Day</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white/20 p-6 rounded-3xl border border-white/30 backdrop-blur-md">
              <View className="flex-row items-center mb-6 bg-white/10 p-3 rounded-2xl border border-white/20">
                <View className="bg-white/90 p-3 rounded-full mr-4">
                  <Feather name="calendar" size={24} color="#db2777" />
                </View>
                <View >
                  <Text className="text-white/80 font-medium font-oswald">Current Streak</Text>
                  <Text className="text-3xl font-bold text-white font-dancing">Day {day}</Text>
                </View>
              </View>

              <View className="h-[1px] bg-white/20 mb-6" />

              <View className="flex-row items-center mb-6 bg-white/10 p-3 rounded-2xl border border-white/20">
                <View className="bg-white/90 p-3 rounded-full mr-4">
                  <FontAwesome5 name="lightbulb" size={24} color="#fcd34d" />
                </View>
                <View className="flex-1">
                  <Text className="text-white/80 font-medium mb-1 font-oswald">Today's Focus</Text>
                  <Text className="text-white text-lg font-semibold leading-6 ">
                    Mindfulness techniques for reducing anxiety triggers.
                  </Text>
                </View>
              </View>

              <View className="bg-white/10 rounded-2xl p-4 flex-row items-center justify-between border border-white/20">
                <View>
                  <Text className="text-white/80 text-sm font-medium mb-1 font-oswald">Current Stress Level</Text>
                  <Text className="text-2xl font-bold text-white font-dancing">Level {stressLevel}</Text>
                </View>
                <View className="h-10 w-[1px] bg-white/20 mx-4" />
                <View>
                  <Text className="text-white/80 text-sm font-medium mb-1 font-oswald">Goal</Text>
                  <Text className="text-2xl font-bold text-green-300 font-dancing">Level {Math.max(0, stressLevel - 1)}</Text>
                </View>
              </View>

            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
