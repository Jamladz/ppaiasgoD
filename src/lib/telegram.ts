
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
  // Very rough heuristic for Telegram user IDs
  if (userId < 50_000_000) return 11;
  if (userId < 100_000_000) return 10;
  if (userId < 200_000_000) return 9;
  if (userId < 400_000_000) return 8;
  if (userId < 600_000_000) return 7;
  if (userId < 900_000_000) return 6;
  if (userId < 1_300_000_000) return 5;
  if (userId < 1_800_000_000) return 4;
  if (userId < 5_000_000_000) return 2;
  return 1;
};
