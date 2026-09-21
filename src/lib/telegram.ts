
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export const getTelegramUser = (): TelegramUser | null => {
  // @ts-ignore
  const webApp = window.Telegram?.WebApp;
  console.log("Telegram WebApp User:", webApp?.initDataUnsafe?.user);
  if (webApp?.initDataUnsafe?.user) {
    return webApp.initDataUnsafe.user;
  }
  return null;
};

export const getStartParam = (): string | null => {
  // @ts-ignore
  const webApp = window.Telegram?.WebApp;
  return webApp?.initDataUnsafe?.start_param || null;
};

export const estimateAccountAge = (userId: number): number => {
  // More accurate heuristic based on Telegram historical ID ranges
  if (userId < 100_000_000) return 11;    // 2013-2014
  if (userId < 250_000_000) return 10;    // 2015
  if (userId < 450_000_000) return 9;     // 2016
  if (userId < 750_000_000) return 8;     // 2017
  if (userId < 1_000_000_000) return 7;   // 2018
  if (userId < 1_400_000_000) return 6;   // 2019
  if (userId < 2_000_000_000) return 5;   // 2020
  if (userId < 4_000_000_000) return 4;   // 2021
  if (userId < 6_000_000_000) return 3;   // 2022
  if (userId < 7_500_000_000) return 2;   // 2023
  return 1; // 2024-2025
};
