import React, { useState } from 'react';
import { View, Text, Image, Pressable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useUser } from '@clerk/clerk-expo';
import { supabase } from '@/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

export default function ProfileScreen() {
  const { user } = useUser();
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  let emailAddress=user?.emailAddresses[0].emailAddress

  const handleSubmit = async () => {
    if (selectedLevel && user) {
      try {
        const { error } = await supabase
          .from('User')
          .update({ stress_level: selectedLevel })
          .eq('username', emailAddress);

        if (error) {
          console.error('Error updating stress level:', error);
          // Optionally show error to user
        } else {
          console.log('Submitted anxiety level:', selectedLevel);
          router.replace('/(tabs)/search');
        }
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    }
  };

  return (
    <View className="flex-1">
      <StatusBar style="dark" />
      <LinearGradient
        colors={['#fcd34d', '#f472b6', '#db2777', '#c084fc']}
        className="flex-1 justify-center items-center px-6"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView className="w-full items-center">

          <View className="bg-white/90 p-8 rounded-[40px] w-full backdrop-blur-xl border border-white/40">
            <View className="items-center mb-8">
              <View className="bg-pink-100 p-4 rounded-full mb-4">
                <Feather name="activity" size={32} color="#db2777" />
                {/* <Text>hi</Text> */}
              </View>
              <Text className="text-3xl font-bold text-slate-800 text-center font-dancing mb-2">
                Check In
              </Text>
              <Text className="text-pink-900/60 font-medium text-center text-lg leading-6">
                What is your anxiety level after the session?
              </Text>
            </View>

            <View className="flex-row flex-wrap justify-between gap-y-4 mb-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <TouchableOpacity
                  key={level}
                  onPress={() => setSelectedLevel(level)}
                  className={`w-[18%] aspect-square justify-center items-center rounded-2xl ${selectedLevel === level
                    ? 'bg-[#db2777]'
                    : 'bg-pink-50 border border-pink-100'
                    }`}
                >
                  <Text
                    className={`font-bold text-lg ${selectedLevel === level ? 'text-white' : 'text-pink-800'
                      }`}
                  >
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}

            </View>

            <View className="flex-row justify-between mb-8 px-2">
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Calm</Text>
              <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest">Anxious</Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedLevel}
              className={`w-full py-4 rounded-2xl ${selectedLevel ? 'bg-slate-800' : 'bg-slate-300'
                }`}
            >
              <Text className="text-white text-center font-bold font-dancing text-xl">
                Submit
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
