// import React, { useState, useEffect } from 'react';
// import { Settings, Database, Wifi, WifiOff, Eye, RefreshCw } from 'lucide-react';
// import { generateMockAppointments, testDataExamples } from '../utils/mockDataGenerator';
// import StaffAppointmentService from '../pages/staff/appointment';

// interface TestModeWrapperProps {
//   children: React.ReactNode;
//   onDataLoad: (appointments: any[]) => void;
// }

// type DataSource = 'api' | 'mock-few' | 'mock-normal' | 'mock-large' | 'mock-comprehensive' | 'mock-edge-cases' | 'mock-realistic';

// const TestModeWrapper: React.FC<TestModeWrapperProps> = ({ children, onDataLoad }) => {
//   const [isTestMode, setIsTestMode] = useState(false);
//   const [dataSource, setDataSource] = useState<DataSource>('api');
//   const [loading, setLoading] = useState(false);
//   const [lastLoadInfo, setLastLoadInfo] = useState<{
//     source: string;
//     count: number;
//     timestamp: string;
//     loadTime: number;
//   } | null>(null);

//   // Load data based on selected source
//   const loadData = async (source: DataSource) => {
//     setLoading(true);
//     const startTime = Date.now();
    
//     try {
//       let appointments: any[] = [];
//       let sourceName = '';
      
//       if (source === 'api') {
//         console.log('📡 Loading from Real API...');
//         sourceName = 'Real API';
//         appointments = await StaffAppointmentService.getAllAppointments();
//       } else {
//         console.log(`🧪 Loading Mock Data: ${source}...`);
//         sourceName = `Mock Data (${source.replace('mock-', '')})`;
        
//         switch (source) {
//           case 'mock-few':
//             appointments = testDataExamples.few();
//             break;
//           case 'mock-normal':
//             appointments = testDataExamples.normal();
//             break;
//           case 'mock-large':
//             appointments = testDataExamples.large();
//             break;
//           case 'mock-comprehensive':
//             appointments = testDataExamples.comprehensive();
//             break;
//           case 'mock-edge-cases':
//             appointments = testDataExamples.edgeCases();
//             break;
//           case 'mock-realistic':
//             appointments = testDataExamples.realistic();
//             break;
//           default:
//             appointments = testDataExamples.normal();
//         }
//       }
      
//       const loadTime = Date.now() - startTime;
      
//       // Update load info
//       setLastLoadInfo({
//         source: sourceName,
//         count: appointments.length,
//         timestamp: new Date().toLocaleTimeString(),
//         loadTime
//       });
      
//       // Pass data to parent component
//       onDataLoad(appointments);
      
//       console.log(`✅ Loaded ${appointments.length} appointments from ${sourceName} in ${loadTime}ms`);
      
//     } catch (error) {
//       console.error('❌ Error loading data:', error);
      
//       // Fallback to mock data if API fails
//       if (source === 'api') {
//         console.log('🔄 API failed, falling back to mock data...');
//         const fallbackData = testDataExamples.normal();
//         onDataLoad(fallbackData);
//         setLastLoadInfo({
//           source: 'Mock Data (API Fallback)',
//           count: fallbackData.length,
//           timestamp: new Date().toLocaleTimeString(),
//           loadTime: Date.now() - startTime
//         });
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Auto-load on source change
//   useEffect(() => {
//     loadData(dataSource);
//   }, [dataSource]);

//   const handleSourceChange = (newSource: DataSource) => {
//     setDataSource(newSource);
//   };

//   const handleRefresh = () => {
//     loadData(dataSource);
//   };

//   return (
//     <div className="relative">
//       {/* Test Mode Toggle */}
//       <div className="fixed top-4 right-4 z-50">
//         <button
//           onClick={() => setIsTestMode(!isTestMode)}
//           className={`p-3 rounded-full shadow-lg transition-all ${
//             isTestMode 
//               ? 'bg-blue-600 text-white' 
//               : 'bg-white text-gray-600 hover:bg-gray-50'
//           }`}
//           title="Toggle Test Mode"
//         >
//           <Settings className="w-5 h-5" />
//         </button>
//       </div>

//       {/* Test Mode Panel */}
//       {isTestMode && (
//         <div className="fixed top-16 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80">
//           <div className="flex items-center gap-2 mb-4">
//             <Database className="w-5 h-5 text-blue-600" />
//             <h3 className="font-semibold text-gray-900">Test Data Control</h3>
//           </div>

//           {/* Data Source Selection */}
//           <div className="space-y-3">
//             <label className="block text-sm font-medium text-gray-700">
//               Data Source:
//             </label>
            
//             <select
//               value={dataSource}
//               onChange={(e) => handleSourceChange(e.target.value as DataSource)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
//               disabled={loading}
//             >
//               <optgroup label="Real API">
//                 <option value="api">🌐 Live API Data</option>
//               </optgroup>
              
//               <optgroup label="Mock Data - Basic">
//                 <option value="mock-few">🧪 Few Items (5)</option>
//                 <option value="mock-normal">🧪 Normal (15)</option>
//                 <option value="mock-large">🧪 Large Dataset (50)</option>
//               </optgroup>
              
//               <optgroup label="Mock Data - Scenarios">
//                 <option value="mock-comprehensive">📊 All Statuses</option>
//                 <option value="mock-realistic">🎯 Realistic Mix</option>
//                 <option value="mock-edge-cases">⚠️ Edge Cases</option>
//               </optgroup>
//             </select>

//             {/* Refresh Button */}
//             <button
//               onClick={handleRefresh}
//               disabled={loading}
//               className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
//             >
//               <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
//               {loading ? 'Loading...' : 'Refresh Data'}
//             </button>
//           </div>

//           {/* Load Information */}
//           {lastLoadInfo && (
//             <div className="mt-4 p-3 bg-gray-50 rounded-md">
//               <div className="flex items-center gap-2 mb-2">
//                 <Eye className="w-4 h-4 text-gray-600" />
//                 <span className="text-sm font-medium text-gray-700">Last Load:</span>
//               </div>
              
//               <div className="text-xs text-gray-600 space-y-1">
//                 <div className="flex justify-between">
//                   <span>Source:</span>
//                   <span className="font-medium">{lastLoadInfo.source}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Count:</span>
//                   <span className="font-medium">{lastLoadInfo.count} items</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Time:</span>
//                   <span className="font-medium">{lastLoadInfo.timestamp}</span>
//                 </div>
//                 <div className="flex justify-between">
//                   <span>Load Time:</span>
//                   <span className="font-medium">{lastLoadInfo.loadTime}ms</span>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Status Indicator */}
//           <div className="mt-4 flex items-center gap-2 text-sm">
//             {dataSource === 'api' ? (
//               <Wifi className="w-4 h-4 text-green-600" />
//             ) : (
//               <WifiOff className="w-4 h-4 text-orange-600" />
//             )}
//             <span className={dataSource === 'api' ? 'text-green-600' : 'text-orange-600'}>
//               {dataSource === 'api' ? 'Using Live API' : 'Using Mock Data'}
//             </span>
//           </div>

//           {/* Quick Info */}
//           <div className="mt-4 p-2 bg-blue-50 rounded text-xs text-blue-700">
//             <strong>Tip:</strong> Use mock data to test UI with different scenarios without affecting real data.
//           </div>
//         </div>
//       )}

//       {/* Main Content */}
//       {children}
//     </div>
//   );
// };

// export default TestModeWrapper;