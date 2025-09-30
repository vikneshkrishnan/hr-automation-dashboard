"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/components/Dashboard";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";
import Candidates from "@/components/Candidates";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const [activePage, setActivePage] = useState("dashboard");

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":
        return <Dashboard />;
      case "candidates":
        return <Candidates />;
      case "resume-analyzer":
        return <ResumeAnalyzer />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <DashboardLayout activePage={activePage} onPageChange={handlePageChange}>
        {renderPage()}
      </DashboardLayout>
    </ProtectedRoute>
  );
}
