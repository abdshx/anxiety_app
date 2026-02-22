import 'react-native-url-polyfill/auto';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { AntDesign, Feather } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { signUp, loading } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Kept for UI but not used in AuthContext signUp based on requirements, or we can add it to DB later.
  const [isSigningUp, setIsSigningUp] = useState(false);

  const onSignUpPress = async () => {
    if (loading) return;

    // Validation
    if (username.length <= 4) {
      Alert.alert('Invalid Username', 'Username must be greater than 4 characters.');
      return;
    }
    // if (!email.trim().toLowerCase().endsWith('@gmail.com')) {
    //   Alert.alert('Invalid Email', 'Email must be a valid @gmail.com address.');
    //   return;
    // }
    if (password.length <= 6) {
      Alert.alert('Weak Password', 'Password must be greater than 6 characters.');
      return;
    } 

    setIsSigningUp(true);

    try {
      const result = await signUp(email,username,password);
      // Note: AuthContext currently ignores username as per user prompt requirements (email, password, stress, day).
      // If username is needed in DB, update AuthContext.

      if (result.success) {
        router.replace('/(tabs)/search');
      }
    } catch (err: any) {
      // Handled in context or here
    } finally {
      setIsSigningUp(false);
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
            <>
              {/* STEP 1: SIGN UP FORM */}
              <Text className="text-white font-[Impact] tracking-widest text-4xl text-center mb-8 uppercase">
                Create Account
              </Text>

              <View className="gap-[20px]">
                <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                  <Feather name="user" size={20} color="gray" />
                  <TextInput
                    autoCapitalize="none"
                    value={username}
                    placeholder="Username..."
                    placeholderTextColor="gray"
                    onChangeText={setUsername}
                    className="flex-1 ml-3 text-slate-800 text-lg"
                  />
                </View>

                <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                  <Feather name="mail" size={20} color="gray" />
                  <TextInput
                    autoCapitalize="none"
                    value={email}
                    placeholder="Email..."
                    placeholderTextColor="gray"
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    className="flex-1 ml-3 text-slate-800 text-lg"
                  />
                </View>

                <View className="bg-white/90 rounded-2xl px-4 py-3 flex-row items-center">
                  <Feather name="lock" size={20} color="gray" />
                  <TextInput
                    value={password}
                    placeholder="Password..."
                    placeholderTextColor="gray"
                    secureTextEntry
                    onChangeText={setPassword}
                    className="flex-1 ml-3 text-slate-800 text-lg"
                  />
                </View>
              </View>

              <TouchableOpacity
                className="bg-white mt-8 rounded-full py-4 flex-row justify-center items-center"
                onPress={onSignUpPress}
                disabled={isSigningUp}
              >
                {isSigningUp ? (
                  <ActivityIndicator color="#db2777" />
                ) : (
                  <>
                    <Text className="text-[#db2777] font-bold text-xl mr-2 uppercase tracking-widest">
                      Sign Up
                    </Text>
                    <AntDesign
                      name="arrowright"
                      size={24}
                      color="#db2777"
                    />
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace('./sign-in')}
                className="mt-6"
              >
                <Text className="text-white text-center text-base font-medium">
                  Already have an account?{' '}
                  <Text className="font-bold underline">Sign In</Text>
                </Text>
              </TouchableOpacity>
            </>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}
