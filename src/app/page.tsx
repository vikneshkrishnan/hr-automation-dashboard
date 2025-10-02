"use client";

import React, { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import Dashboard from "@/components/Dashboard";
import ResumeAnalyzer from "@/components/ResumeAnalyzer";
import Candidates from "@/components/Candidates";
import ScreenCandidates from "@/components/ScreenCandidates";
import Jobs from "@/components/Jobs";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const [activePage, setActivePage] = useState("jobs");

  const handlePageChange = (page: string) => {
    setActivePage(page);
  };

  const renderPage = () => {
    switch (activePage) {
      case "jobs":
        return <Jobs />;
      case "dashboard":
        return <Dashboard />;
      case "candidates":
        return <Candidates />;
      case "screen-candidates":
        return <ScreenCandidates />;
      case "resume-analyzer":
        return <ResumeAnalyzer />;
      default:
        return <Jobs />;
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
