import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AntDesign, Feather } from '@expo/vector-icons';
// ... imports

export default function SignInScreen() {
  const { signIn, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const onSignInPress = async () => {
    if (loading) return;

    if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Please enter a valid @gmail.com address.');
      return;
    }
    if (password.length <= 6) {
      Alert.alert('Invalid Password', 'Password must be greater than 6 characters.');
      return;
    }

    setIsSigningIn(true);
    try {
      const result = await signIn(email, password);
      if (result.success) {
        router.replace('/(tabs)/search');
      }
    } catch (err: any) {
    } 
    finally {
      setIsSigningIn(false);
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

          <View className="bg-white/20 p-8 rounded-3xl w-full">
            <Text className="text-white font-[Impact] tracking-widest text-4xl text-center mb-8 uppercase">
              Welcome Back
            </Text>

            <View className="gap-[20px]">
              <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                <Feather name="mail" size={20} color="gray" />
                <TextInput
                  autoCapitalize="none"
                  value={email}
                  placeholder="Email..."
                  placeholderTextColor="gray"
                  onChangeText={setEmail}
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
                  onChangeText={setPassword}
                  className="flex-1 ml-3 text-slate-800 text-lg"
                />
              </View>
            </View>

            <TouchableOpacity
              className="bg-white mt-8 rounded-full py-4 items-center flex-row justify-center"
              onPress={onSignInPress}
              disabled={isSigningIn}
            >
              {isSigningIn ? (
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
