'use client';

import EmployeePage from "@/component/employeepage";
import UpdateEmployeePage from "@/component/manageemployee";
import EmployeeLeave from "@/component/employeeleave";
import PayrollReport from "@/component/payroll";
import Birthday from "@/component/Birthday";
import Termination from "@/component/termination";

import { useState } from "react";
import { 
  Home as HomeIcon, 
  Users, 
  Clock, 
  CreditCard, 
  Gift, 
  UserX 
} from "lucide-react";

export default function Home() {
  const [page, setPage] = useState("update");
  
  const navItems = [
    { 
      label: "Update Employee", 
      icon: <Users className="w-5 h-5 mr-2" />, 
      page: "update",
      color: "from-blue-400 to-blue-600" 
    },
    { 
      label: "View Employees", 
      icon: <HomeIcon className="w-5 h-5 mr-2" />, 
      page: "view",
      color: "from-green-400 to-green-600" 
    },
    { 
      label: "Employee Leave", 
      icon: <Clock className="w-5 h-5 mr-2" />, 
      page: "leave",
      color: "from-purple-400 to-purple-600" 
    },
    { 
      label: "Payroll Report", 
      icon: <CreditCard className="w-5 h-5 mr-2" />, 
      page: "payroll",
      color: "from-indigo-400 to-indigo-600" 
    },
    { 
      label: "Birthday", 
      icon: <Gift className="w-5 h-5 mr-2" />, 
      page: "birthday",
      color: "from-pink-400 to-pink-600" 
    },
    { 
      label: "Termination", 
      icon: <UserX className="w-5 h-5 mr-2" />, 
      page: "termination",
      color: "from-red-400 to-red-600" 
    }
  ];

  return (
    <div className="min-h-screen bg-gray-30 flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/20 backdrop-blur-md shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-2 py-4">
            {navItems.map((item) => (
              <button
                key={item.page}
                onClick={() => setPage(item.page)}
                className={`
                  flex items-center justify-center 
                  px-4 py-2 
                  text-sm font-medium 
                  rounded-full 
                  transition-all duration-300 
                  ${page === item.page 
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg`
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  focus:outline-none 
                  transform 
                  hover:scale-105 
                  active:scale-95
                `}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content Area */}
      <main className="flex-grow container mx-auto px-4 py-8 transition-all duration-500 ease-in-out">
        <div className="rounded-2xl shadow-2xl p-6 min-h-[calc(100vh-200px)]">
          {page === "termination" && <Termination />}
          {page === "birthday" && <Birthday />}
          {page === "update" && <UpdateEmployeePage />}
          {page === "view" && <EmployeePage />}
          {page === "leave" && <EmployeeLeave />}
          {page === "payroll" && <PayrollReport />}
        </div>
      </main>
    </div>
  );
}

