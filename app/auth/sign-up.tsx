import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);

    try {
      const result = await signUp.create({
        username,
        emailAddress,
        password,
      });
       

      if (result.emailAddress) {
        console.log(result)
        await setActive({ session: result.createdSessionId })
         router.replace('/(tabs)/search')
      } else { 
        // If the status is not complete, check why. User may need to
        // complete further steps.
        Alert.alert('Incomplete', 'Some problem occurred.');
      }

    } catch (err: any) {
      const errorMessage =
        err.errors?.[0]?.longMessage ||
        err.errors?.[0]?.message ||
        err.message ||
        'Sign up failed';
      Alert.alert('Sign Up Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1">
      <LinearGradient
        colors={['#fcd34d', '#f472b6', '#db2777', '#c084fc']}
        className="flex-1"
      >
        <StatusBar style="light" />
        <SafeAreaView className="flex-1 justify-center px-6">
          <View className="bg-white/20 p-8 rounded-3xl">

            <Text className="text-white font-[Impact] text-4xl text-center mb-8">
              Create Account
            </Text>

            <View className="gap-5">
              <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                <Feather name="user" size={20} color="gray" />
                <TextInput
                  placeholder="Username"
                  autoCapitalize="none"
                  value={username}
                  onChangeText={setUsername}
                  className="flex-1 ml-3 text-lg"
                />
              </View>

              <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                <Feather name="mail" size={20} color="gray" />
                <TextInput
                  placeholder="Email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={emailAddress}
                  onChangeText={setEmailAddress}
                  className="flex-1 ml-3 text-lg"
                />
              </View>

              <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                <Feather name="lock" size={20} color="gray" />
                <TextInput
                  placeholder="Password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-lg"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={onSignUpPress}
              disabled={isLoading}
              className="bg-white mt-8 rounded-full py-4 flex-row justify-center"
            >
              {isLoading ? (
                <ActivityIndicator color="#db2777" />
              ) : (
                <>
                  <Text className="text-[#db2777] font-bold text-xl mr-2">
                    Sign Up
                  </Text>
                  <AntDesign name="arrowright" size={24} color="#db2777" />
                </>
              )}
            </TouchableOpacity>

          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
