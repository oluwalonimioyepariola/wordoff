import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

/** Everything lives on the device. No server, no account. */
export const deviceStorage = createJSONStorage(() => AsyncStorage);
