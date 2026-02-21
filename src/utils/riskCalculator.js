/**
 * Risk calculation utilities
 */

// Calculate position size based on account capital, risk %, stop loss pips, and pip value
export const calculatePositionSize = ({ capital, riskPerTrade, stopLossPips, pipValue }) => {
  // Risk amount per trade
  const riskAmount = capital * riskPerTrade;
  // Position size = riskAmount / (stopLossPips * pipValue)
  const positionSize = riskAmount / (stopLossPips * pipValue);
  return positionSize;
};

// Calculate risk-reward ratio
export const calculateRiskReward = ({ entry, stopLoss, takeProfit }) => {
  const risk = Math.abs(entry - stopLoss);
  const reward = Math.abs(takeProfit - entry);
  return reward / risk;
};
