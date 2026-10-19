export type ProfileType = "empresa" | "profissional" | "pessoal";
export type AccountType = "company" | "professional" | "personal";

export interface UserProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  account_type: AccountType | null;
  created_at?: string;
  updated_at?: string;
}

export type TabType = "connections" | "contacts" | "schedule" | "identity" | "knowledge";

export interface ContactException {
  id: string;
  name: string;
  phone: string;
}

export interface RecentContact {
  id: string;
  name: string;
  phone: string;
  active: boolean;
}

export interface OverflowConfig {
  human: boolean;
  unknown: boolean;
  angry: boolean;
  phone: string;
}

export interface DaySchedule {
  name: string;
  open: boolean;
  start: string;
  end: string;
  lunch: boolean;
  lunchStart: string;
  lunchEnd: string;
}

export interface Holiday {
  id: string;
  date: string;
  reason: string;
}

export interface CustomRule {
  id: string;
  text: string;
}

export interface CatalogItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  description: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface RagFile {
  id: string;
  name: string;
  size: string;
  uploadedAt?: string;
}

export interface CompanyProfile {
  name: string;
  summary: string;
  address: string;
  online: boolean;
  maps: string;
  payments: string[];
  pix: string;
  links: string;
}

export interface ProfessionalProfile {
  name: string;
  registry: string;
  specialty: string;
  address: string;
  links: string;
  payments: string[];
}

export interface PersonalProfile {
  name: string;
  summary: string;
  city: string;
  topics: string;
  links: string;
}

export interface ProfileData {
  company: CompanyProfile;
  professional: ProfessionalProfile;
  personal: PersonalProfile;
}

export interface AgentConfig {
  version: number;
  profile: ProfileType;
  active: boolean;
  whatsapp: boolean;
  whatsappInstance?: string;
  whatsappPhone?: string;
  calendar: boolean;
  calendarName: string;
  ignoreGroups: boolean;
  ignoreStories: boolean;
  contactMode: "all" | "blacklist" | "whitelist";
  exceptions: ContactException[];
  pauseOnManual: boolean;
  reactivateHours: number;
  recentContacts: RecentContact[];
  overflow: OverflowConfig;
  timezone: string;
  days: DaySchedule[];
  autoHolidays: boolean;
  holidays: Holiday[];
  lunchBehavior: string;
  afterHours: string;
  awayMessage: string;
  duration: string;
  buffer: string;
  minNotice: number;
  maxFuture: number;
  bookingFields: string[];
  reschedule: boolean;
  agentName: string;
  introduce: boolean;
  discloseAI: boolean;
  goal: string;
  tone: string;
  responseLength: number;
  emojis: string;
  debounce: number;
  splitMessages: boolean;
  typing: boolean;
  audio: boolean;
  images: boolean;
  guardrails: string[];
  customRules: CustomRule[];
  prompt: string;
  profileData: ProfileData;
  catalog: CatalogItem[];
  faq: FaqItem[];
  files: RagFile[];
}

export interface ProfileMeta {
  label: string;
  tab: string;
  title: string;
  subtitle: string;
  catalog: string;
}

