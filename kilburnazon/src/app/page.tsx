'use client';

import EmployeePage from "@/component/employeepage";
import UpdateEmployeePage from "@/component/manageemployee";
import EmployeeLeave from "@/component/employeeleave";
import PayrollReport from "@/component/payroll";
import Birthday from "@/component/Birthday";
import Termination from "@/component/termination";

import { useState } from "react";

export default function Home() {
  const [page, setPage] = useState("update");

  return (
    <main className="min-h-screen">
      <nav className="flex justify-center items-center shadow-lg rounded-lg p-4 space-x-6">
        <button
          className="bg-green-500 text-white text-lg font-medium px-6 py-2 rounded-full transform transition duration-300 hover:bg-green-600 active:scale-95 focus:outline-none"
          onClick={() => setPage("update")}
        >
          Update Employee
        </button>
        <button
          className="bg-blue-500 text-white text-lg font-medium px-6 py-2 rounded-full transform transition duration-300 hover:bg-blue-600 active:scale-95 focus:outline-none"
          onClick={() => setPage("view")}
        >
          View Employees
        </button>
        <button
          className="bg-yellow-500 text-white text-lg font-medium px-6 py-2 rounded-full transform transition duration-300 hover:bg-yellow-600 active:scale-95 focus:outline-none"
          onClick={() => setPage("leave")}
        >
          Employee Leave
        </button>
        <button
          className="bg-purple-500 text-white text-lg font-medium px-6 py-2 rounded-full transform transition duration-300 hover:bg-purple-600 active:scale-95 focus:outline-none"
          onClick={() => setPage("payroll")}
        >
          Payroll Report
        </button>
        <button
          className="bg-red-500 text-white text-lg font-medium px-6 py-2 rounded-full transform transition duration-300 hover:bg-red-600 active:scale-95 focus:outline-none"
          onClick={() => setPage("birthday")}
        >
          Birthday
        </button>
        <button
          className="bg-red-500 text-white text-lg font-medium px-6 py-2 rounded-full transform transition duration-300 hover:bg-red-600 active:scale-95 focus:outline-none"
          onClick={() => setPage("termination")}
        >
          Termination
        </button>
      </nav>
      
      {/* Conditional rendering for the selected page */}
      {page === "termination" && <Termination />}
      {page === "birthday" && <Birthday />}
      {page === "update" && <UpdateEmployeePage />}
      {page === "view" && <EmployeePage />}
      {page === "leave" && <EmployeeLeave />}
      {page === "payroll" && <PayrollReport />}
    </main>
  );
}
