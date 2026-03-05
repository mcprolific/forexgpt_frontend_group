// import React, { useState } from 'react';
// import { 
//   FiPlay, FiEdit2, FiCopy, FiCheckCircle, FiClock, FiSave
// } from 'react-icons/fi';
// import { mockStrategies as initialStrategies } from '../../data/mockData';
// import PageHeader from '../../components/layout/PageHeader';

// const Strategies = () => {
//   const [strategies, setStrategies] = useState(initialStrategies);

//   const getStrategyIcon = (type) => {
//     switch(type) {
//       case 'trend_following': return '📈';
//       case 'mean_reversion': return '🔄';
//       case 'breakout': return '🚀';
//       case 'carry_trade': return '💹';
//       case 'momentum': return '⚡';
//       default: return '📊';
//     }
//   };

//   // Function to generate a new strategy
//   const generateNewStrategy = () => {
//     const newStrategy = {
//       id: strategies.length + 1,
//       name: `Strategy ${strategies.length + 1}`,
//       strategy_type: ['trend_following','mean_reversion','breakout','carry_trade','momentum'][Math.floor(Math.random()*5)],
//       complexity: ['Simple','Intermediate','Advanced'][Math.floor(Math.random()*3)],
//       version: (Math.random()*1.5 + 1).toFixed(1),
//       description: 'This is a newly generated AI trading strategy.',
//       target_pairs: ['EUR/USD','USD/JPY','GBP/USD'],
//       timeframe: '1h',
//       parameters: { param1: 10, param2: 5, param3: 2 },
//       sandbox_passed: Math.random() > 0.5,
//       is_saved: false,
//       code: 'print("New strategy code")'
//     };

//     setStrategies([newStrategy, ...strategies]);
//   };

//   return (
//     <div className="space-y-6 bg-black text-white min-h-screen p-6">
//       <PageHeader 
//         title="Trading Strategies"
//         subtitle="AI-generated and custom trading strategies"
//         action={{
//           label: "Generate New Strategy",
//           onClick: generateNewStrategy,
//           icon: <FiPlay className="text-yellow-400"/>
//         }}
//       />

//       {/* Strategy Stats */}
//       <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//         <StatCard label="Total Strategies" value={strategies.length} />
//         <StatCard label="Validated" value={strategies.filter(s => s.sandbox_passed).length} />
//         <StatCard label="Avg Win Rate" value="58.5%" />
//         <StatCard label="Sharpe Ratio" value="1.23" />
//       </div>

//       {/* Filters */}
//       <div className="flex space-x-2">
//         <select className="px-4 py-2 bg-black border border-white rounded-lg text-white focus:ring-2 focus:ring-yellow-400">
//           <option>All Types</option>
//           <option>Trend Following</option>
//           <option>Mean Reversion</option>
//           <option>Breakout</option>
//           <option>Carry Trade</option>
//           <option>Momentum</option>
//         </select>
//         <select className="px-4 py-2 bg-black border border-white rounded-lg text-white focus:ring-2 focus:ring-yellow-400">
//           <option>All Complexities</option>
//           <option>Simple</option>
//           <option>Intermediate</option>
//           <option>Advanced</option>
//         </select>
//       </div>

//       {/* STRATEGIES LIST ONLY */}
//       <div className="space-y-4 bg-black border border-white rounded-lg">
//         {strategies.map((strategy) => (
//           <div 
//             key={strategy.id} 
//             className="p-4 border-b border-white last:border-0 hover:bg-yellow-400 hover:text-black flex justify-between items-center transition-colors"
//           >
//             <div className="flex items-center space-x-4">
//               <span className="text-2xl">{getStrategyIcon(strategy.strategy_type)}</span>
//               <div>
//                 <h4 className="font-bold text-yellow-400">{strategy.name}</h4>
//                 <p className="text-sm text-white line-clamp-2">{strategy.description}</p>
//               </div>
//             </div>
//             <div className="flex items-center space-x-4">
//               <span className="text-xs text-white border border-white px-2 py-0.5 rounded-full">{strategy.complexity}</span>
//               <span className="text-sm text-white">v{strategy.version}</span>
//               <button className="p-1 hover:bg-white hover:text-black rounded">
//                 <FiPlay className="w-4 h-4 text-yellow-400"/>
//               </button>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ label, value }) => (
//   <div className="bg-black border border-white rounded-lg p-4 hover:bg-yellow-400 hover:text-black transition-colors">
//     <p className="text-sm text-white">{label}</p>
//     <p className="text-2xl font-bold text-yellow-400">{value}</p>
//   </div>
// );

// export default Strategies;