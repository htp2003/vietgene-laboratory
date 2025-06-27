import React from "react";
import { Clock, FileText, Users, TestTube } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  samplesCount?: number;
}

const tabs = [
  { id: "progress", label: "Tiến trình", icon: Clock },
  { id: "details", label: "Thông tin chi tiết", icon: FileText },
  { id: "participants", label: "Người tham gia", icon: Users },
  { id: "samples", label: "Mẫu xét nghiệm", icon: TestTube },
];

export const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  samplesCount = 0,
}) => {
  return (
    <div className="border-b border-gray-200">
      <div className="flex">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                isActive
                  ? "border-red-500 text-red-600 bg-red-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <TabIcon className="w-4 h-4" />
              {tab.label}
              {tab.id === "samples" && samplesCount > 0 && (
                <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                  {samplesCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
