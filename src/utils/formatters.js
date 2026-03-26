// Format numbers as currency
export const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(value);
};

// Format percentages
export const formatPercentage = (value) => {
  return `${(value * 100).toFixed(2)}%`;
};

// Format dates nicely
export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const isValidDate = (date) => !Number.isNaN(date.getTime());

const asDate = (dateStr) => {
  const date = new Date(dateStr);
  return isValidDate(date) ? date : null;
};

export const formatLongDate = (dateStr) => {
  const date = asDate(dateStr);
  if (!date) return "";

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (dateStr) => {
  const date = asDate(dateStr);
  if (!date) return "";

  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
};

export const formatLongDateTime = (dateStr) => {
  const longDate = formatLongDate(dateStr);
  const time = formatTime(dateStr);

  if (!longDate) return "";
  if (!time) return longDate;

  return `${longDate} at ${time}`;
};
