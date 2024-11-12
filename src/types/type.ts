export type Avatar = {
  id: number;
  name: string;
  image: string;
  avatar: string;
  user_id: number;
  slider_value: string;
  prompt: string;
  submission_time: string;
}

export type User = {
  id: number;
  email: string;
  name: string;
  is_verified: boolean;
  profile_picture: string;
  google_id: string | null;
  facebook_id: string | null;
  apple_id: string | null;
  discord_id: string | null;
  created_at: string | null;
  bio: string | null;
  password: string;
  verification_code: string;
  verification_code_expires: string;
}

export type UserCredit = {
  amount: number;
  premium_status: string;
}

export type UserPlan = {
  id: number;
  plan_id: number;
  provider_id: string;
  status: string;
  complete: number;
  is_active: number;
  user_id: number;
  created_at: string;
  expires_at: string;
  exists: boolean;
}

export type StripeCustomer = {
  id: number;
  customer_id: string;
  user_id: number;
  created_at: string
}

export type Plan = {
  id: number;
  billing_period: string;
  is_active: number;
  price: number;
  product_id: string;
  type: string;
  mode: string;
  created_at: string;
}

export type PopupType =
  | "chat-setting"
  | "chatgpt-key"
  | "voice"
  | "language"
  | "upload-avatar"
  | "share"
  | "exit"
  | "save-avatar"
  | "pay-credit"
  | "buy-credit"
  | "";