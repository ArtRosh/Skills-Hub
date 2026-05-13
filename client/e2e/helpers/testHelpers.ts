import { expect, APIRequestContext, Page, request } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000";
const DEFAULT_PASSWORD = "Password123!";

export type UserRole = "student" | "tutor";

export interface TestUser {
  name: string;
  password: string;
  role: UserRole;
  id?: number;
}

export interface TopicPayload {
  id?: number;
  topic: string;
  description: string;
}

export interface TutorServicePayload {
  id?: number;
  topic_id?: number;
  rate: number;
  description: string;
}

export interface RequestPayload {
  id?: number;
  tutor_service_id?: number;
  description: string;
  status?: string;
}

interface CreateUserOverrides {
  name?: string;
  password?: string;
}

interface CreateTopicOverrides {
  topic?: string;
  description?: string;
}

interface CreateServiceOverrides {
  rate?: number;
  description?: string;
}

interface CreateRequestOverrides {
  description?: string;
}

interface CreateTutorWithServiceOverrides {
  user?: CreateUserOverrides;
  topic?: CreateTopicOverrides;
  service?: CreateServiceOverrides;
}

interface CreateStudentWithRequestOverrides {
  user?: CreateUserOverrides;
  request?: CreateRequestOverrides;
}

export function uniqueValue(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export async function createApiContext(): Promise<APIRequestContext> {
  return request.newContext({
    baseURL: BASE_URL,
    extraHTTPHeaders: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
}

export async function createUser(
  role: UserRole,
  overrides: CreateUserOverrides = {}
) {
  const api = await createApiContext();
  const user: TestUser = {
    name: overrides.name || uniqueValue(role),
    password: overrides.password || DEFAULT_PASSWORD,
    role,
  };

  const response = await api.post("/api/signup", { data: user });
  expect(response.ok(), `Failed to create ${role} user`).toBeTruthy();

  const body = (await response.json()) as { id: number };
  return {
    api,
    user: {
      ...user,
      id: body.id,
    },
  };
}

export async function createTopic(
  api: APIRequestContext,
  overrides: CreateTopicOverrides = {}
): Promise<TopicPayload> {
  const payload = {
    topic: overrides.topic || uniqueValue("topic"),
    description:
      overrides.description ||
      `${uniqueValue("topic-description")} description`,
  };

  const response = await api.post("/api/topics", { data: payload });
  expect(response.ok(), "Failed to create topic").toBeTruthy();
  return response.json() as Promise<TopicPayload>;
}

export async function createService(
  api: APIRequestContext,
  topicId: number,
  overrides: CreateServiceOverrides = {}
): Promise<TutorServicePayload> {
  const payload = {
    topic_id: topicId,
    rate: overrides.rate ?? 50,
    description: overrides.description || uniqueValue("service"),
  };

  const response = await api.post("/api/tutor_services", { data: payload });
  expect(response.ok(), "Failed to create tutor service").toBeTruthy();
  return response.json() as Promise<TutorServicePayload>;
}

export async function createRequest(
  api: APIRequestContext,
  tutorServiceId: number,
  overrides: CreateRequestOverrides = {}
): Promise<RequestPayload> {
  const payload = {
    tutor_service_id: tutorServiceId,
    description: overrides.description || uniqueValue("request"),
  };

  const response = await api.post("/api/requests", { data: payload });
  expect(response.ok(), "Failed to create service request").toBeTruthy();
  return response.json() as Promise<RequestPayload>;
}

export async function updateRequestStatus(
  api: APIRequestContext,
  requestId: number,
  status: string
): Promise<RequestPayload> {
  const response = await api.patch(`/api/requests/${requestId}`, {
    data: { status },
  });

  expect(
    response.ok(),
    `Failed to set request status to ${status}`
  ).toBeTruthy();
  return response.json() as Promise<RequestPayload>;
}

export async function createTutorWithService(
  overrides: CreateTutorWithServiceOverrides = {}
) {
  const tutor = await createUser("tutor", overrides.user);
  const topic = await createTopic(tutor.api, overrides.topic);
  const service = await createService(tutor.api, topic.id!, overrides.service);

  return {
    ...tutor,
    topic,
    service,
  };
}

export async function createStudentWithRequest(
  tutorServiceId: number,
  overrides: CreateStudentWithRequestOverrides = {}
) {
  const student = await createUser("student", overrides.user);
  const serviceRequest = await createRequest(
    student.api,
    tutorServiceId,
    overrides.request
  );

  return {
    ...student,
    request: serviceRequest,
  };
}

export async function login(page: Page, user: TestUser) {
  await page.goto("/login");
  await page.getByLabel("UserName").fill(user.name);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page.getByRole("button", { name: /logout/i })).toBeVisible();
  await expect(page.getByText(`${user.name} (${user.role})`)).toBeVisible();
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: /logout/i }).click();
  await expect(page).toHaveURL(/\/login$/);
}

export async function disposeContexts(
  ...contexts: Array<APIRequestContext | undefined>
) {
  await Promise.all(
    contexts.filter(Boolean).map((context) => context!.dispose())
  );
}

export { BASE_URL, DEFAULT_PASSWORD };
