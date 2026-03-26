import axiosInstance from "../../services/axiosInstance";

const flattenErrorValues = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.flatMap(flattenErrorValues);
  }
  if (typeof value === "object") {
    return Object.values(value).flatMap(flattenErrorValues);
  }
  if (typeof value === "string") {
    return [value];
  }
  return [];
};

export const getApiErrorMessage = (error, fallback = "Request failed") => {
  const data = error?.response?.data;
  const candidates = [
    data?.detail,
    data?.message,
    data?.error,
    data?.error_description,
    data?.msg,
    ...flattenErrorValues(data?.errors),
    ...flattenErrorValues(data?.email),
    error?.message,
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);

  return candidates[0] || fallback;
};

const publicRequestConfig = {
  skipAuth: true,
  skipAuthRedirect: true,
};

const postToFirstAvailable = async (candidates, fallbackMessage) => {
  let lastError;

  for (const candidate of candidates) {
    try {
      return await axiosInstance.post(candidate.url, candidate.data, {
        ...publicRequestConfig,
        ...(candidate.config || {}),
      });
    } catch (error) {
      lastError = error;
      const status = error?.response?.status;

      if (![404, 405].includes(status)) {
        break;
      }
    }
  }

  throw new Error(getApiErrorMessage(lastError, fallbackMessage));
};

export const loginAPI = async (payload) => {
  try {
    const body = {
      ...payload,
      username: payload?.username || payload?.email || undefined,
    };
    const res = await axiosInstance.post("/login", body, publicRequestConfig);
    const d = res.data || {};
    const token = d?.tokens?.access_token || null;
    const user = d?.user || null;
    if (!token || !user) {
      throw new Error(d?.detail || "Invalid login credentials");
    }
    return { token, user };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Login failed"));
  }
};

export const registerAPI = async (payload) => {
  try {
    const res = await axiosInstance.post("/register", payload, publicRequestConfig);
    const d = res.data || {};
    return {
      user_id: d?.user_id || null,
      email: d?.email || null,
      requires_confirmation: !!d?.requires_confirmation,
    };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Registration failed"));
  }
};

export const confirmEmailAPI = async (payload) => {
  const response = await postToFirstAvailable(
    [
      { url: "/confirm", data: payload },
      { url: "/auth/confirm", data: payload },
    ],
    "Confirmation failed"
  );
  return response.data;
};

export const resendConfirmationAPI = async (email) => {
  const response = await postToFirstAvailable(
    [
      { url: "/resend-confirmation", data: { email } },
      { url: "/auth/resend-confirmation", data: { email } },
      { url: "/register/resend-confirmation", data: { email } },
    ],
    "Could not resend confirmation email."
  );
  return response.data;
};

export const forgotPasswordAPI = async (email) => {
  const response = await postToFirstAvailable(
    [
      { url: "/forgot-password", data: { email } },
      { url: "/auth/forgot-password", data: { email } },
      { url: "/request-password-reset", data: { email } },
      { url: "/password/forgot", data: { email } },
    ],
    "Could not send password reset email."
  );
  return response.data;
};
