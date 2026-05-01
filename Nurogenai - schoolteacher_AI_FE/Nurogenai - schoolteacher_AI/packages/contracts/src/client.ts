import type {
  AnalyticsOverviewResponse,
  AnalyticsPrioritiesResponse,
  AnalyticsSubjectsResponse,
  AnalyticsTrendsResponse,
  AuthResponse,
  CreateSubjectRequest,
  ExamListResponse,
  ExamRecord,
  ExamWriteRequest,
  GoogleExchangeRequest,
  ImportCommitResponse,
  ImportPreviewResponse,
  LoginRequest,
  RecommendedResourcesResponse,
  ReportResponse,
  SignupRequest,
  StudentProfile,
  SubjectRecord,
  TeacherAssistantRequest,
  TeacherAssistantResponse,
  TextbookSearchRequest,
  TextbookSearchResponse,
  UpdateStudentProfileRequest,
  UpdateSubjectRequest,
} from "./types";

type RequestOptions = RequestInit & {
  skipJson?: boolean;
};

export class ApiClient {
  constructor(private readonly baseUrl: string) {}

  private async request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        ...(options.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...(options.headers ?? {}),
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: response.statusText }));
      const detail =
        typeof error.detail === "string"
          ? error.detail
          : JSON.stringify(error.detail ?? error, null, 2);
      throw new Error(detail || "Request failed");
    }

    if (options.skipJson || response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  signup(payload: SignupRequest) {
    return this.request<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  login(payload: LoginRequest) {
    return this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  googleExchange(payload: GoogleExchangeRequest) {
    return this.request<AuthResponse>("/auth/google/exchange", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  logout() {
    return this.request<void>("/auth/logout", {
      method: "POST",
      skipJson: true,
    });
  }

  me() {
    return this.request<AuthResponse>("/auth/me");
  }

  getProfile() {
    return this.request<StudentProfile>("/students/me");
  }

  updateProfile(payload: UpdateStudentProfileRequest) {
    return this.request<StudentProfile>("/students/me", {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  listSubjects() {
    return this.request<SubjectRecord[]>("/subjects/me");
  }

  createSubject(payload: CreateSubjectRequest) {
    return this.request<SubjectRecord>("/subjects/me", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  updateSubject(subjectId: string, payload: UpdateSubjectRequest) {
    return this.request<SubjectRecord>(`/subjects/me/${subjectId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  deleteSubject(subjectId: string) {
    return this.request<void>(`/subjects/me/${subjectId}`, {
      method: "DELETE",
      skipJson: true,
    });
  }

  listExams() {
    return this.request<ExamListResponse>("/exams");
  }

  getExam(examId: string) {
    return this.request<ExamRecord>(`/exams/${examId}`);
  }

  createExam(payload: ExamWriteRequest) {
    return this.request<ExamRecord>("/exams", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  updateExam(examId: string, payload: ExamWriteRequest) {
    return this.request<ExamRecord>(`/exams/${examId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  }

  deleteExam(examId: string) {
    return this.request<void>(`/exams/${examId}`, {
      method: "DELETE",
      skipJson: true,
    });
  }

  previewImport(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<ImportPreviewResponse>("/imports/marks/preview", {
      method: "POST",
      body: formData,
    });
  }

  commitImport(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return this.request<ImportCommitResponse>("/imports/marks/commit", {
      method: "POST",
      body: formData,
    });
  }

  getOverview() {
    return this.request<AnalyticsOverviewResponse>("/analytics/overview");
  }

  getTrends() {
    return this.request<AnalyticsTrendsResponse>("/analytics/trends");
  }

  getSubjectsAnalytics() {
    return this.request<AnalyticsSubjectsResponse>("/analytics/subjects");
  }

  getPriorities() {
    return this.request<AnalyticsPrioritiesResponse>("/analytics/priorities");
  }

  generateReport(examId: string) {
    return this.request<ReportResponse>("/reports/generate", {
      method: "POST",
      body: JSON.stringify({ examId }),
    });
  }

  getLatestReport(examId: string) {
    return this.request<ReportResponse>(`/reports/latest?examId=${examId}`);
  }

  getRecommendedResources(examId: string) {
    return this.request<RecommendedResourcesResponse>(
      `/resources/recommended?examId=${examId}`,
    );
  }

  teacherAssistant(payload: TeacherAssistantRequest) {
    return this.request<TeacherAssistantResponse>("/teacher-tools/ask", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }

  searchTextbooks(payload: TextbookSearchRequest) {
    return this.request<TextbookSearchResponse>("/textbooks/search", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}

export const createApiClient = (baseUrl: string) => new ApiClient(baseUrl);
