
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const PayrollSystem = () => {
  // Authentication States
  const [employee, setEmployee] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [loginError, setLoginError] = useState('');

  // Payroll Report States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [payrollReportData, setPayrollReportData] = useState([]);
  const [reportError, setReportError] = useState('');
  const [loading, setLoading] = useState(false);

  // Detailed Payroll States
  const [employeeId, setEmployeeId] = useState('');
  const [individualPayrollData, setIndividualPayrollData] = useState(null);

  // New Filter States
  const [filters, setFilters] = useState({
    department: '',
    salaryRange: '',
    sortBy: 'name'
  });
  
  // Filter options
  const departments = ['All', 'Technology', 'CEO', 'CTO', 'CFO', 'Finance', 'Executive', 'Marketing'];
  const salaryRanges = [
    'All',
    '0-30000',
    '30001-50000',
    '50001-80000',
    '80001-100000',
    '100001+'
  ];
  const sortOptions = [
    { value: 'name', label: 'Name' },
    { value: 'net_pay_asc', label: 'Net Pay (Low to High)' },
    { value: 'net_pay_desc', label: 'Net Pay (High to Low)' },
    { value: 'base_salary_asc', label: 'Base Salary (Low to High)' },
    { value: 'base_salary_desc', label: 'Base Salary (High to Low)' }
  ];

  // Filter handlers
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Fetch Employee Details
  const fetchEmployeeDetails = async (employeeId) => {
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

  // Fetch Payroll Report
  const fetchPayrollReport = async () => {
    if (!employee || (employee.department !== 'Executive' && employee.name !== 'Jarvis')) {
      setReportError('Unauthorized access. Only executives and Jarvis can generate reports.');
      return;
    }

    if (!startDate || !endDate) {
      setReportError('Please select start and end dates');
      return;
    }

    setLoading(true);
    setReportError('');

    try {
      const response = await fetch(
        `http://localhost/workshop/connect.php?action=getPayrollReport&requester_id=${employee.id}&start_date=${startDate}&end_date=${endDate}`
      );

      const data = await response.json();
      setPayrollReportData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching payroll report:', error);
      setReportError('Failed to fetch payroll report');
      setLoading(false);
    }
  };

  // Get Filtered Data
  const getFilteredData = () => {
    if (!payrollReportData.length) return [];

    let filtered = [...payrollReportData];

    // Apply department filter
    if (filters.department && filters.department !== 'All') {
      filtered = filtered.filter(item => item.department === filters.department);
    }

    // Apply salary range filter
    if (filters.salaryRange && filters.salaryRange !== 'All') {
      const [min, max] = filters.salaryRange.split('-').map(num => parseInt(num));
      filtered = filtered.filter(item => {
        const salary = parseFloat(item.base_salary);
        if (max) {
          return salary >= min && salary <= max;
        }
        return salary >= min; // For 100001+ range
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'net_pay_asc':
          return a.net_pay - b.net_pay;
        case 'net_pay_desc':
          return b.net_pay - a.net_pay;
        case 'base_salary_asc':
          return a.base_salary - b.base_salary;
        case 'base_salary_desc':
          return b.base_salary - a.base_salary;
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  };

  // Fetch Individual Payroll Details
  const fetchIndividualPayrollDetails = async () => {
    if (!employee || (employee.department !== 'Executive' && employee.name !== 'Jarvis')) {
      alert('Unauthorized access');
      return;
    }

    if (!employeeId || !startDate || !endDate) {
      alert('Please enter Employee ID and Date Range');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost/workshop/connect.php?action=getEmployeePayrollDetails&employee_id=${employeeId}&start_date=${startDate}&end_date=${endDate}`
      );

      const data = await response.json();

      if (data.error) {
        alert(data.error);
      } else {
        setIndividualPayrollData(data);
      }
    } catch (error) {
      console.error('Error fetching payroll data:', error);
      alert('An error occurred while fetching data.');
    }
    setLoading(false);
  };

  // Export to CSV
  const handleExportToCSV = () => {
    const filteredData = getFilteredData();
    if (!filteredData || filteredData.length === 0) {
      alert('No data available to export');
      return;
    }

    const headers = Object.keys(filteredData[0]);
    const csvRows = [];

    csvRows.push(headers.join(','));

    filteredData.forEach(item => {
      const values = headers.map(header => {
        const val = item[header];
        const escaped = ('' + val).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'payroll_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to PDF
  const handleExportToPDF = () => {
    const filteredData = getFilteredData();
    if (!filteredData || filteredData.length === 0) {
      alert('No data available to export');
      return;
    }

    const doc = new jsPDF();
    doc.text('Payroll Report', 10, 10);

    const tableColumn = Object.keys(filteredData[0]);
    const tableRows = [];

    filteredData.forEach(item => {
      const itemData = tableColumn.map(col => item[col]);
      tableRows.push(itemData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save('payroll_report.pdf');
  };

  // Login Handler
  const handleLogin = async (e) => {
    e.preventDefault();
    await fetchEmployeeDetails(loginId);
  };

  const renderPayrollReportChart = () => {
    if (!payrollReportData.length) return null;

    const filteredData = getFilteredData();
    
    const chartData = filteredData.map(item => ({
      name: item.name,
      'Net Pay': item.net_pay,
      'Base Salary': item.base_salary
    }));

    const CustomTooltip = ({ payload, label }) => {
      if (!payload || payload.length === 0) return null;

      const { name, 'Net Pay': netPay, 'Base Salary': baseSalary } = payload[0].payload;

      return (
        <div className="bg-white text-black p-2 border rounded shadow-lg">
          <p><strong>{name}</strong></p>
          <p>Net Pay: ${netPay}</p>
          <p>Base Salary: ${baseSalary}</p>
        </div>
      );
    };

    return (
      <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-2xl font-semibold text-center mb-6 text-gray-800">Payroll Overview</h3>
        
        {/* Filters Section */}
        <div className="mb-6 space-y-4">
          <h4 className="text-lg font-medium text-gray-700">Filters</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Department Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department Filter
              </label>
              <select
                value={filters.department}
                onChange={(e) => handleFilterChange('department', e.target.value)}
                className="w-full px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Salary Range Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <select
                value={filters.salaryRange}
                onChange={(e) => handleFilterChange('salaryRange', e.target.value)}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                {salaryRanges.map(range => (
                  <option key={range} value={range}>
                    {range === 'All' ? 'All Ranges' : `$${range}`}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By Filter */}
            <div className="filter-group">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border text-black border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 bg-white"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="mb-4 p-3 bg-gray-50 rounded-md">
          <p className="text-sm text-gray-600">
            Showing {filteredData.length} employees
            {filters.department !== 'All' && ` in ${filters.department}`}
            {filters.salaryRange !== 'All' && ` with salary range $${filters.salaryRange}`}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex space-x-4 mb-4">
          <button
            onClick={handleExportToCSV}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Export to CSV
          </button>
          <button
            onClick={handleExportToPDF}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
          >
            Export to PDF
          </button>
        </div>

        {/* Chart */}
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Net Pay" fill="#8884d8" />
              <Bar dataKey="Base Salary" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // Render Individual Payroll Details
  const renderIndividualPayrollDetails = () => {
    if (!individualPayrollData) return null;

    return (
      <div className="mt-6 bg-white shadow-lg rounded-lg p-6">
        <h3 className="text-2xl font-semibold text-center mb-6 text-black">Individual Payroll Details</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-black">Pro-rata Factor: {(individualPayrollData.pro_rated_salary * 100).toFixed(2)}%</p>
            <p className="text-black">Days Selected: {individualPayrollData.days_selected}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-600">Net Pay: ${individualPayrollData.net_pay.toFixed(2)}</p>
          </div>
        </div>
        <table className="w-full mt-4 border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2 text-black">Earnings</th>
              <th className="border p-2 text-black">Deductions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border p-2 text-black">
                <p>Base Salary: ${individualPayrollData.base_salary.toFixed(2)}</p>
                <p>Bonus: ${individualPayrollData.bonus.toFixed(2)}</p>
                <p>Incentives: ${individualPayrollData.incentives.toFixed(2)}</p>
              </td>
              <td className="border p-2 text-black">
                <p>Tax: ${individualPayrollData.tax.toFixed(2)}</p>
                <p>Insurance: ${individualPayrollData.insurance.toFixed(2)}</p>
                <p>Retirement: ${individualPayrollData.retirement.toFixed(2)}</p>
                <p>Other Deductions: ${individualPayrollData.deductions.toFixed(2)}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // If not logged in, show login screen
  if (!employee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-black">Payroll System Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="text"
              placeholder="Enter Employee ID"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-black"
            />
            <button 
              type="submit" 
              className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 transition duration-300"
            >
              Login
            </button>
            {loginError && <p className="text-red-500 text-center">{loginError}</p>}
          </form>
        </div>
      </div>
    );
  }

  // Logged-in view with restricted access
  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-bold text-center mb-6 text-black">Payroll Management</h1>
        
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <p className="text-xl text-black">
            Welcome, <span className="font-bold text-teal-600">{employee.name}</span>
            <span className="ml-2 px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm">
              {employee.department} Department
            </span>
          </p>
        </div>

        {/* Payroll Report Section - Restricted to Executives and Jarvis */}
        {(employee.department === 'Executive' || employee.name === 'Jarvis') && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-black">Payroll Report</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black"
              />
              <button
                onClick={fetchPayrollReport}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Generate Report'}
              </button>
            </div>
            {reportError && <p className="text-red-500 mt-2">{reportError}</p>}

            {/* Export Buttons */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={handleExportToCSV}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
              >
                Export to CSV
              </button>
              <button
                onClick={handleExportToPDF}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
              >
                Export to PDF
              </button>
            </div>

            {renderPayrollReportChart()}
          </div>
        )}

        {/* Individual Payroll Details Section - Also Restricted */}
        {(employee.department === 'Executive' || employee.name === 'Jarvis') && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-black">Individual Payroll Details</h2>
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                placeholder="Enter Employee ID"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-black"
              />
              <button
                onClick={fetchIndividualPayrollDetails}
                className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Fetch Details'}
              </button>
            </div>
            {renderIndividualPayrollDetails()}
          </div>
        )}

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              setEmployee(null);
              setLoginId('');
              setPayrollReportData([]);
              setIndividualPayrollData(null);
              setFilters({
                department: '',
                salaryRange: '',
                sortBy: 'name'
              });
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default PayrollSystem;