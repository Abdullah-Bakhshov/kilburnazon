'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
}

interface Log {
  id: number;
  employee_id: number;
  action: string;
  details: string;
  timestamp: string;
}

const TerminateEmployeePage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const BASE_URL = 'http://localhost/workshop/connect.php'; // Your backend URL

  // Fetch all employees
  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${BASE_URL}?action=getemployees`);
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  // Fetch termination logs
  const fetchTerminationLogs = async () => {
    try {
      const response = await fetch(`${BASE_URL}?action=getTerminationLogs`);
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching termination logs:', error);
    }
  };

  const terminateEmployee = async (employeeId: number) => {
    if (selectedEmployeeId === null) {
      alert("Please select an employee to terminate.");
      return;
    }

    const currentUserId = 1;  // The ID of the user who is terminating the employee (should be dynamically set)

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}?action=terminateEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employee_id: employeeId,
          terminated_by: currentUserId,
        }),
      });
      const data = await response.json();
      if (data.message) {
        alert(data.message);
        fetchEmployees(); // Refresh the employee list after termination
        fetchTerminationLogs(); // Refresh the logs after termination
      } else {
        alert(data.error || 'Error terminating employee');
      }
    } catch (error) {
      console.error('Error terminating employee:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchEmployees();
    fetchTerminationLogs(); // Fetch logs on component mount
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Terminate Employee</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Select an Employee to Terminate</h2>

        <select
          onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900 mb-4"
        >
          <option value="">Select Employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.id}>
              {employee.name} - {employee.position}
            </option>
          ))}
        </select>

        <button
          onClick={() => terminateEmployee(selectedEmployeeId as number)}
          className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
          disabled={isLoading}
        >
          {isLoading ? 'Terminating...' : 'Terminate Employee'}
        </button>
      </div>

      <div className="bg-white text-black p-6 rounded-xl shadow-md mt-8">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Employee List</h2>
        <ul>
          {employees.map((employee) => (
            <li key={employee.id} className="mb-4">
              <p>{employee.name} - {employee.position}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md mt-8">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Termination Logs</h2>
        <ul>
          {logs.map((log) => (
            <li key={log.id} className="mb-4">
              <p><strong>Employee ID:</strong> {log.employee_id} | <strong>Action:</strong> {log.action} | <strong>Details:</strong> {log.details} | <strong>Timestamp:</strong> {log.timestamp}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TerminateEmployeePage;