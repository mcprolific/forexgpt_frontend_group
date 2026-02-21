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
