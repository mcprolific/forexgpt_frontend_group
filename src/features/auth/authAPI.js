import axiosInstance from "../../services/axiosInstance";

export const loginAPI = async (payload) => {
  try {
    const body = {
      ...payload,
      username: payload?.username || payload?.email || undefined,
    };
    const res = await axiosInstance.post("/login", body, publicRequestConfig);
    const d = res.data || {};
    const token = d?.tokens?.access_token || null;
    const refreshToken = d?.tokens?.refresh_token || null;
    const expiresIn = d?.tokens?.expires_in || null;
    const user = d?.user || null;
    if (!token || !user) {
      throw new Error(d?.detail || "Invalid login credentials");
    }
    return { token, refreshToken, expiresIn, user };
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "Login failed"));
  }
};

export const registerAPI = async (payload) => {
  const res = await axiosInstance.post("/register", payload);
  const d = res.data || {};
  return {
    user_id: d?.user_id || null,
    email: d?.email || null,
    requires_confirmation: !!d?.requires_confirmation,
  };
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

export const refreshTokenAPI = async (refreshToken) => {
  const response = await postToFirstAvailable(
    [
      { url: "/refresh", data: { refresh_token: refreshToken } },
      { url: "/auth/refresh", data: { refresh_token: refreshToken } },
    ],
    "Could not refresh token."
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
      { url: "/password-reset", data: { email } },
      { url: "/auth/password-reset", data: { email } },
      { url: "/forgot-password", data: { email } },
      { url: "/auth/forgot-password", data: { email } },
      { url: "/request-password-reset", data: { email } },
      { url: "/password/forgot", data: { email } },
    ],
    "Could not send password reset email."
  );
  return response.data;
};

export const updatePasswordAPI = async ({ newPassword, accessToken, refreshToken }) => {
  const response = await requestToFirstAvailable(
    [
      {
        url: "/password-update",
        data: { new_password: newPassword, refresh_token: refreshToken },
        config: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
      {
        url: "/auth/password-update",
        data: { new_password: newPassword, refresh_token: refreshToken },
        config: {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      },
    ],
    "Could not update password."
  );
  return response.data;
};
