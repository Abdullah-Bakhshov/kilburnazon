'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  birthday: string; // Birthday field
}

const BirthdayPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const BASE_URL = 'http://localhost/workshop/connect.php'; // Updated URL for your PHP API

  // Fetch employees with birthdays this month
  const fetchEmployeesWithBirthdays = async () => {
    try {
      const response = await fetch(`${BASE_URL}?action=getBirthdaysThisMonth`);
      const data = await response.json();
      setEmployees(data);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching employees with birthdays:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployeesWithBirthdays();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Employees with Birthdays This Month</h1>

      {/* Loading state */}
      {isLoading ? (
        <p className="text-center text-white">Loading...</p>
      ) : (
        <>
          {employees.length === 0 ? (
            <p className="text-center text-white">No employees have birthdays this month.</p>
          ) : (
            <ul className="space-y-4">
              {employees.map((employee) => (
                <li
                  key={employee.id}
                  className="bg-white p-6 rounded-xl shadow-md flex justify-between items-center"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-teal-700">{employee.name}</h3>
                    <p className="text-sm text-gray-600">Birthday: {new Date(employee.birthday).toLocaleDateString()}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
};

export default BirthdayPage;
