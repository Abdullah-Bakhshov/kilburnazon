'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  email: string;
}

interface AuditLog {
  id: number;
  employee_id: number;
  name: string;
  position: string;
  department: string;
  email: string;
  termination_date: string;
  terminated_by: number;
  termination_reason?: string;
}

interface TerminationRequest {
  employee_id: number;
  terminated_by: number;
  reason?: string;
}

interface TerminationResponse {
  message?: string;
  error?: string;
  employee?: {
    id: number;
    name: string;
    termination_date: string;
  };
}

const TerminateEmployeePage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(null);
  const [terminationReason, setTerminationReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const BASE_URL = 'http://localhost/workshop/connect.php';

  const fetchEmployees = async () => {
    try {
      const response = await fetch(`${BASE_URL}?action=getemployees`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setEmployees(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchAuditLogs = async () => {
    try {
      const response = await fetch(`${BASE_URL}?action=getAuditLogs`);
      if (!response.ok) throw new Error('Failed to fetch audit logs');
      const data = await response.json();
      setAuditLogs(data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    }
  };

  const terminateEmployee = async () => {
    if (!selectedEmployeeId) {
      return;
    }

    const currentUserId = 1;
    setIsLoading(true);

    try {
      const terminationData: TerminationRequest = {
        employee_id: selectedEmployeeId,
        terminated_by: currentUserId,
        reason: terminationReason.trim() || undefined,
      };

      const response = await fetch(`${BASE_URL}?action=terminateEmployee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(terminationData),
      });

      if (!response.ok) throw new Error('Termination request failed');

      const data: TerminationResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Reset form
      setSelectedEmployeeId(null);
      setTerminationReason('');

      // Refresh data
      await Promise.all([fetchEmployees(), fetchAuditLogs()]);

      // Show success message
      alert(data.message || 'Employee terminated successfully');
    } catch (error) {
      console.error('Error during termination:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchAuditLogs();
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Terminate Employee</h1>

      <div className="bg-white p-6 rounded-xl shadow-md mb-8">
        <h2 className="text-xl font-semibold text-teal-700 mb-4">Select an Employee to Terminate</h2>

        <div className="space-y-4">
          <select
            value={selectedEmployeeId || ''}
            onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.position} ({employee.department})
              </option>
            ))}
          </select>

          <textarea
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            placeholder="Termination Reason (Optional)"
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
            rows={3}
          />

          <button
            onClick={terminateEmployee}
            className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
            disabled={isLoading || !selectedEmployeeId}
          >
            {isLoading ? 'Processing...' : 'Terminate Employee'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-teal-700 mb-4 text-black">Active Employees</h2>
          <div className="space-y-2">
            {employees.map((employee) => (
              <div key={employee.id} className="p-3 border rounded-lg hover:bg-gray-50">
                <p className="font-medium text-black">{employee.name}</p>
                <p className="text-sm text-gray-600">
                  {employee.position} - {employee.department}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold text-teal-700 mb-4 text-black">Termination History</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-teal-100">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Name</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Position</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Department</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Termination Date</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Terminated By</th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {auditLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-4 py-2 text-sm text-black">{log.name}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.position}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{new Date(log.termination_date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">ID {log.terminated_by}</td>
                    <td className="px-4 py-2 text-sm text-gray-700">{log.termination_reason || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminateEmployeePage;
