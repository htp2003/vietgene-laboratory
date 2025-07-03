// src/components/skeleton/DashboardSkeleton.tsx

import React from "react";

// Order Card Skeleton
export const OrderCardSkeleton: React.FC = () => (
  <div className="border border-gray-200 rounded-lg p-6 animate-pulse">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
        <div>
          <div className="h-4 bg-gray-200 rounded w-40 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-24"></div>
          <div className="flex items-center gap-4 mt-2">
            <div className="h-2 bg-gray-200 rounded w-16"></div>
            <div className="h-2 bg-gray-200 rounded w-12"></div>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="h-5 bg-gray-200 rounded w-20 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
    </div>

    {/* Progress Bar Skeleton */}
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="h-2 bg-gray-200 rounded w-12"></div>
        <div className="h-2 bg-gray-200 rounded w-8"></div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2"></div>
    </div>

    {/* Footer Skeleton */}
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="h-3 bg-gray-200 rounded w-24"></div>
        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-8 bg-gray-200 rounded w-20"></div>
        <div className="h-8 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

// Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-12"></div>
      </div>
      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
    </div>
  </div>
);

// Notification Card Skeleton
export const NotificationSkeleton: React.FC = () => (
  <div className="p-3 rounded-lg border border-gray-200 bg-gray-50 animate-pulse">
    <div className="flex items-start justify-between mb-2">
      <div className="h-3 bg-gray-200 rounded w-32"></div>
      <div className="w-2 h-2 bg-gray-200 rounded-full"></div>
    </div>
    <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
    <div className="h-2 bg-gray-200 rounded w-3/4 mb-2"></div>
    <div className="h-2 bg-gray-200 rounded w-16"></div>
  </div>
);

// Loading State for Orders Section Only
export const OrdersLoadingSkeleton: React.FC = () => (
  <div className="space-y-4">
    <OrderCardSkeleton />
    <OrderCardSkeleton />
    <OrderCardSkeleton />
    <div className="text-center py-4">
      <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
    </div>
  </div>
);

// Main Dashboard Skeleton
export const DashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-8 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded w-24 animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <StatsCardSkeleton />
        <StatsCardSkeleton />
        <StatsCardSkeleton />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column - Orders Skeleton */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </div>

              {/* Search and Filters Skeleton */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                  <div className="h-10 bg-gray-200 rounded-lg w-20 animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Orders List Skeleton */}
            <div className="p-6">
              <OrdersLoadingSkeleton />
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Skeleton */}
        <div className="space-y-6">
          {/* Quick Actions Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>

          {/* Notifications Skeleton */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4 animate-pulse"></div>
            <div className="space-y-3">
              <NotificationSkeleton />
              <NotificationSkeleton />
              <NotificationSkeleton />
            </div>
          </div>

          {/* Contact Support Skeleton */}
          <div className="bg-gray-200 rounded-2xl p-6 animate-pulse">
            <div className="h-5 bg-gray-300 rounded w-20 mb-4"></div>
            <div className="h-3 bg-gray-300 rounded w-full mb-4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded w-24"></div>
              <div className="h-4 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
