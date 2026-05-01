export type UserRole = "student" | "parent" | "teacher" | "admin";
export type AuthProvider = "password" | "google";
export type ExamType =
  | "unit_test"
  | "monthly_test"
  | "midterm"
  | "quarterly"
  | "half_yearly"
  | "annual";
export type PerformanceBand =
  | "Excellent"
  | "Good"
  | "Average"
  | "Needs Improvement";
export type TrendStatus =
  | "improving"
  | "declining"
  | "stable"
  | "insufficient_data";
export type ResourceType =
  | "video"
  | "worksheet"
  | "quiz"
  | "notes"
  | "course";
export type ResourceDifficulty = "easy" | "medium" | "advanced";

export interface ApiError {
  detail: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  provider: AuthProvider;
  profileCompleted: boolean;
}

export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface GoogleExchangeRequest {
  credential: string;
}

export interface AuthResponse {
  user: AuthUser;
}

export interface StudentProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  classGrade: string;
  section: string | null;
  schoolName: string;
  age: number | null;
  targetGoal: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStudentProfileRequest {
  fullName: string;
  classGrade: string;
  section?: string | null;
  schoolName: string;
  age?: number | null;
  targetGoal?: string | null;
}

export interface SubjectRecord {
  id: string;
  studentId: string;
  name: string;
  createdAt: string;
}

export interface CreateSubjectRequest {
  name: string;
}

export interface UpdateSubjectRequest {
  name: string;
}

export interface ExamMarkInput {
  subjectId: string;
  marksObtained: number;
  maxMarks: number;
}

export interface ExamWriteRequest {
  examName: string;
  examType: ExamType;
  examDate: string;
  marks: ExamMarkInput[];
}

export interface ExamMarkRecord extends ExamMarkInput {
  id: string;
  subjectName: string;
}

export interface ExamRecord {
  id: string;
  studentId: string;
  examName: string;
  examType: ExamType;
  examDate: string;
  createdAt: string;
  updatedAt: string;
  totalScore: number;
  totalMaxScore: number;
  percentage: number;
  marks: ExamMarkRecord[];
}

export interface ExamListResponse {
  exams: ExamRecord[];
}

export interface AnalyticsOverviewResponse {
  overallPercentage: number;
  totalScore: number;
  totalMaxScore: number;
  performanceBand: PerformanceBand;
  strongestSubject: string | null;
  weakestSubject: string | null;
  trendStatus: TrendStatus;
  consistencyScore: number;
  riskFlag: boolean;
  latestExamPercentage: number;
  previousExamPercentage: number | null;
  improvementDelta: number | null;
  strongSubjectsCount: number;
  weakSubjectsCount: number;
  riskReasons: string[];
}

export interface TrendPoint {
  examId: string;
  examName: string;
  examDate: string;
  overallPercentage: number;
}

export interface SubjectTrendPoint {
  examId: string;
  examDate: string;
  percentage: number;
}

export interface SubjectAnalytics {
  subjectId: string;
  subjectName: string;
  latestPercentage: number;
  averagePercentage: number;
  trendStatus: TrendStatus;
  examsTaken: number;
  previousPercentage: number | null;
  deltaPercentage: number | null;
  riskLevel: "low" | "medium" | "high";
  actionHint: string;
}

export interface AnalyticsTrendsResponse {
  points: TrendPoint[];
  subjectSeries: Record<string, SubjectTrendPoint[]>;
}

export interface AnalyticsSubjectsResponse {
  subjects: SubjectAnalytics[];
}

export interface PriorityItem {
  subjectId: string;
  subjectName: string;
  currentPercentage: number;
  priorityScore: number;
  effortShare: number;
  reason: string;
  trendStatus: TrendStatus;
  averagePercentage: number;
  deltaPercentage: number | null;
  riskLevel: "low" | "medium" | "high";
}

export interface AnalyticsPrioritiesResponse {
  priorities: PriorityItem[];
}

export interface RecommendedResource {
  id: string;
  subject: string;
  topic: string;
  title: string;
  url: string;
  type: ResourceType;
  difficulty: ResourceDifficulty;
  reason: string;
}

export interface WeeklyPlanItem {
  title: string;
  cadence: string;
  durationMinutes: number;
  focus: string;
}

export interface TargetImprovement {
  subject: string;
  currentPercentage: number;
  targetPercentage: number;
  rationale: string;
}

export interface ReportResponse {
  examId: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  priorities: PriorityItem[];
  weeklyPlan: WeeklyPlanItem[];
  targetImprovements: TargetImprovement[];
  recommendedResources: RecommendedResource[];
  cached: boolean;
  generatedAt: string;
  riskReasons: string[];
  performanceNarrative: string;
}

export interface RecommendedResourcesResponse {
  examId: string;
  resources: RecommendedResource[];
}

export interface ImportPreviewRow {
  examName: string;
  examType: ExamType;
  examDate: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
}

export interface ImportPreviewError {
  rowNumber: number;
  message: string;
}

export interface ImportPreviewResponse {
  valid: boolean;
  rows: ImportPreviewRow[];
  errors: ImportPreviewError[];
  subjectNames: string[];
}

export interface ImportCommitResponse {
  importedExamIds: string[];
  importedSubjects: string[];
}

export interface Textbook {
  id: string;
  standard: number;
  medium: string;
  subject: string;
  term: string;
  title: string;
  sourceFile: string;
  sourceUrl?: string | null;
}

export interface TextbookChunk {
  id: string;
  textbookId: string;
  chapterTitle?: string | null;
  sectionTitle?: string | null;
  pageStart?: number | null;
  pageEnd?: number | null;
  chunkIndex: number;
  content: string;
}

export interface TextbookSearchRequest {
  query: string;
  standard?: number;
  medium?: string;
  subject?: string;
  limit?: number;
}

export interface TextbookSearchResult {
  textbook: Textbook;
  chunk: TextbookChunk;
  score: number;
}

export interface TextbookSearchResponse {
  results: TextbookSearchResult[];
  total: number;
}

export type TeacherQueryType = "qa" | "lesson_plan" | "worksheet" | "remediation" | "topic_explain";

export interface Citation {
  textbookId: string;
  textbookTitle: string;
  standard: number;
  medium: string;
  subject: string;
  chapterTitle?: string | null;
  sectionTitle?: string | null;
  pageStart?: number | null;
  pageEnd?: number | null;
}

export interface TeacherAssistantRequest {
  query: string;
  queryType: TeacherQueryType;
  standard?: number;
  medium?: string;
  subject?: string;
  limit?: number;
}

export interface TeacherAssistantResponse {
  answer: string;
  queryType: TeacherQueryType;
  citations: Citation[];
  retrievedChunks: number;
}
