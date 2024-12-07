'use client';
import { useState, useEffect } from 'react';

interface Employee {
  id: number;
  name: string;
  department: string;
}

interface LeaveRequest {
  id: number;
  employee_id: number;
  employee_name: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  status: string;
  comments?: string;
}

interface AbsenteeismReport {
  department: string;
  employee_name: string;
  total_days_absent: number;
  leave_type: string;
}

export default function EmployeeLeave() {
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [form, setForm] = useState({
    employee_id: '',
    leave_type: '',
    start_date: '',
    end_date: '',
    comments: '',
  });
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');

  // Absenteeism Report State
  const [reportForm, setReportForm] = useState({
    start_date: '',
    end_date: '',
  });
  const [absenteeismReport, setAbsenteeismReport] = useState<AbsenteeismReport[]>([]);
  const [reportError, setReportError] = useState('');

  const fetchEmployeeDetails = async (employeeId: string) => {
    try {
      const response = await fetch(`http://localhost/workshop/connect.php?action=getemployee&id=${employeeId}`);
      if (!response.ok) {
        throw new Error('Employee not found');
      }
      const data = await response.json();
      setEmployee(data);
    } catch (error) {
      setLoginError('Invalid employee ID');
      setEmployee(null);
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const response = await fetch('http://localhost/workshop/connect.php?action=getLeaveRequests');
      const data = await response.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    }
  };

  const fetchAbsenteeismReport = async () => {
    if (!employee || employee.department !== 'Executive') return;

    try {
      const response = await fetch(
        `http://localhost/workshop/connect.php?action=getAbsenteeismReport&start_date=${reportForm.start_date}&end_date=${reportForm.end_date}&requester_id=${employee.id}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        const errorData = await response.json();
        setReportError(errorData.error || 'Failed to fetch report');
        return;
      }

      const data = await response.json();
      setAbsenteeismReport(data);
      setReportError('');
    } catch (error) {
      console.error('Error fetching absenteeism report:', error);
      setReportError('An error occurred while fetching the report');
    }
  };

  useEffect(() => {
    if (employee) {
      fetchLeaveRequests();
    }
  }, [employee]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetchEmployeeDetails(loginId);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    try {
      const response = await fetch('http://localhost/workshop/connect.php?action=requestLeave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          employee_id: employee.id,
        }),
      });

      if (response.ok) {
        fetchLeaveRequests();
        setForm({ 
          employee_id: '', 
          leave_type: '', 
          start_date: '', 
          end_date: '', 
          comments: '' 
        });
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Submission failed');
      }
    } catch (error) {
      console.error('Error submitting leave request:', error);
    }
  };

  const handleApproveLeave = async (requestId: number, status: string) => {
    if (!employee || employee.department !== 'Executive') return;

    try {
      const response = await fetch('http://localhost/workshop/connect.php?action=updateLeaveStatus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: requestId,
          status: status,
          approved_by: employee.name,
        }),
      });

      if (response.ok) {
        fetchLeaveRequests();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Update failed');
      }
    } catch (error) {
      console.error('Error updating leave status:', error);
    }
  };

  const renderAbsenteeismReport = () => {
    if (!employee || employee.department !== 'Executive') return null;
  
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-black mb-6 text-center">Absenteeism Report</h2>
  
        <div className="flex space-x-4 mb-6">
          <input
            type="date"
            value={reportForm.start_date}
            onChange={(e) => setReportForm({ ...reportForm, start_date: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black transition duration-300"
            placeholder="Start Date"
          />
          <input
            type="date"
            value={reportForm.end_date}
            onChange={(e) => setReportForm({ ...reportForm, end_date: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black transition duration-300"
            placeholder="End Date"
          />
          <button 
            onClick={fetchAbsenteeismReport}
            className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300 flex items-center justify-center"
          >
            <span>Generate Report</span>
          </button>
        </div>
  
        {reportError && (
          <p className="text-red-500 text-center mb-4 font-semibold">{reportError}</p>
        )}
  
        {absenteeismReport.length > 0 && (
          <div className="overflow-x-auto rounded-lg shadow-lg">
            <table className="w-full bg-white shadow-md rounded-lg">
              <thead className="bg-teal-100 text-teal-600">
                <tr>
                  <th className="p-4 text-left text-sm font-semibold text-black">Department</th>
                  <th className="p-4 text-left text-sm font-semibold text-black">Employee Name</th>
                  <th className="p-4 text-left text-sm font-semibold text-black">Leave Type</th>
                  <th className="p-4 text-right text-sm font-semibold text-black">Total Days Absent</th>
                </tr>
              </thead>
              <tbody>
                {absenteeismReport.map((report, index) => (
                  <tr key={index} className="border-b hover:bg-gray-100">
                    <td className="p-4 text-sm text-black">{report.department}</td>
                    <td className="p-4 text-sm text-black">{report.employee_name}</td>
                    <td className="p-4 text-sm text-black">{report.leave_type}</td>
                    <td className="p-4 text-sm text-right text-black">{report.total_days_absent}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };
  
  

  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Employee Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Employee ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition duration-300 text-black"
            />
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 text-white py-3 rounded-lg hover:from-teal-600 hover:to-indigo-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
            >
              Login
            </button>
            {loginError && <p className="text-red-500 text-center">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-2xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center text-gray-900 mb-6">Employee Leave Management</h1>
        <div className="mb-6 text-center">
          <p className="text-xl text-gray-700">
            Welcome, <span className="font-semibold text-teal-600">{employee.name}</span> 
            <span className="ml-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
              {employee.department} Department
            </span>
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <select
            value={form.leave_type}
            onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
            required
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
          >
            <option value="">Select Leave Type</option>
            <option value="sick">Sick</option>
            <option value="vacation">Vacation</option>
            <option value="personal">Personal</option>
          </select>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
            />
            <input
              type="date"
              value={form.end_date}
              onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
            />
          </div>
          <textarea
            placeholder="Comments (Optional)"
            value={form.comments}
            onChange={(e) => setForm({ ...form, comments: e.target.value })}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
            rows={3}
          />
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-teal-500 to-indigo-500 text-white py-3 rounded-lg hover:from-teal-600 hover:to-indigo-600 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            Request Leave
          </button>
        </form>

        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Leave Requests</h2>
        <div className="space-y-4">
          {leaveRequests.length === 0 ? (
            <p className="text-center text-gray-500 italic">No leave requests found.</p>
          ) : (
            leaveRequests.map((request) => (
              <div 
                key={request.id} 
                className="bg-gray-100 p-4 rounded-lg shadow-md flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">{request.employee_name}</p>
                  <p className="text-sm text-gray-600">
                    {request.leave_type} Leave | {request.start_date} to {request.end_date}
                  </p>
                  {request.comments && (
                    <p className="text-sm text-gray-500 mt-2 italic">
                      Comments: {request.comments}
                    </p>
                  )}
                  <span 
                    className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${
                      request.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : request.status === 'approved' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                {employee.department === 'Executive' && request.status === 'pending' && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleApproveLeave(request.id, 'approved')}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-300"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleApproveLeave(request.id, 'denied')}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
                    >
                      Deny
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Absenteeism Report Section */}
        {renderAbsenteeismReport()}
      </div>
    </div>
  );
}