import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { Redirect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (completeSignIn.status === 'complete') {
        await setActive({ session: completeSignIn.createdSessionId });
        router.replace('/(tabs)/search');
      } else {
        Alert.alert('Incomplete', 'Please verify your account to continue.');
      }
    } catch (err: any) {
      const errorMessage = err.errors?.[0]?.longMessage || err.errors?.[0]?.message || err.message || "Invalid email or password.";
      Alert.alert('Sign In Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#fcd34d', '#f472b6', '#db2777', '#c084fc']}
        className="flex-1"
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 w-full justify-center px-6">

          <View className="bg-white/20 p-8 rounded-3xl w-full backdrop-blur-md">
            <Text className="text-white font-[Impact] tracking-widest text-4xl text-center mb-8 uppercase">
              Welcome Back
            </Text>

            <View className="space-y-4 gap-[20px]">
              <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                <Feather name="mail" size={20} color="gray" />
                <TextInput
                  autoCapitalize="none"
                  value={emailAddress}
                  placeholder="Email..."
                  placeholderTextColor="gray"
                  onChangeText={(email) => setEmailAddress(email)}
                  className="flex-1 ml-3 text-slate-800 text-lg"
                  keyboardType="email-address"
                />
              </View>

              <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                <Feather name="lock" size={20} color="gray" />
                <TextInput
                  value={password}
                  placeholder="Password..."
                  placeholderTextColor="gray"
                  secureTextEntry={true}
                  onChangeText={(password) => setPassword(password)}
                  className="flex-1 ml-3 text-slate-800 text-lg"
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-white mt-8 rounded-full py-4 items-center flex-row justify-center"
              onPress={onSignInPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#db2777" />
              ) : (
                <>
                  <Text className="text-[#db2777] font-bold text-xl uppercase tracking-widest mr-2">Sign In</Text>
                  <AntDesign name="login" size={24} color="#db2777" />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.replace('./sign-up')}
              className="mt-6"
            >
              <Text className="text-white text-center text-base font-medium">
                Don't have an account? <Text className="font-bold underline">Sign Up</Text>
              </Text>
            </TouchableOpacity>
          </View>

        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
