'use client';

import { useState, useEffect } from 'react';

interface Employee {
    id?: number;
    name: string;
    position: string;
    department: string;
    office: string;
    hired_date: string;
    contract: string;
    email: string;
    salary: number;
}

const UpdateEmployeePage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [isEdit, setIsEdit] = useState(false);

    const BASE_URL = 'http://localhost/workshop/connect.php';

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

    useEffect(() => {
        fetchEmployees();
    }, []);

    const [logs, setLogs] = useState<any[]>([]);
    const [isLogsVisible, setIsLogsVisible] = useState(false);

    const fetchLogs = async () => {
        try {
            const response = await fetch(`${BASE_URL}?action=getlogs`);
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Handle form submission for adding or updating an employee
    const handleSubmit = async () => {
        if (isEdit && !formData.id) {
            alert('Employee ID is required for updating.');
            return;
        }

        try {
            const url = isEdit
                ? `${BASE_URL}?action=updateemployee`
                : `${BASE_URL}?action=addemployee`;
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            if (data.message) {
                alert(isEdit ? 'Employee updated successfully!' : 'Employee added successfully!');
                fetchEmployees(); // Refresh the employee list
                resetForm();
            } else {
                alert(data.error || 'Error submitting the form');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    const promoteEmployee = async (employee: Employee) => {
        try {
            const response = await fetch(`${BASE_URL}?action=updateemployee`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: employee.id,
                    promote: true,
                }),
            });
    
            const data = await response.json();
            if (data.message) {
                alert('Employee promoted successfully!');
                setEmployees((prevEmployees) =>
                    prevEmployees.map((emp) =>
                        emp.id === employee.id ? { ...emp, salary: emp.salary * 1.05 } : emp
                    )
                );
            } else {
                alert(data.error || 'Error promoting employee');
            }
        } catch (error) {
            console.error('Error promoting employee:', error);
        }
    };

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Reset form after submission or cancel
    const resetForm = () => {
        setFormData({});
        setIsEdit(false);
    };

    // Populate form with employee data for editing
    const editEmployee = (employee: Employee) => {
        setFormData(employee);
        setIsEdit(true);
    };

    // Toggle visibility of logs
    const toggleLogsVisibility = () => {
        setIsLogsVisible(!isLogsVisible);
        if (!isLogsVisible) {
            fetchLogs();
        }
    };

    // Function to format log details into a single line
    const formatLogDetails = (details: string) => {
        try {
            const parsedDetails = JSON.parse(details);
            if (typeof parsedDetails === 'object') {
                return Object.entries(parsedDetails)
                    .map(([key, value]) => `${key} changed to ${value}`)
                    .join(', '); // Join the changes with commas, for a single line
            }
        } catch (e) {
            return details;  // Return original text if JSON parsing fails
        }
    };

    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Employee Manager</h1>

            {/* Add/Edit Form */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-6">
                <h2 className="text-xl font-semibold text-teal-700">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Render input fields */}
                    {['name', 'position', 'department', 'office', 'contract', 'email'].map((field) => (
                        <input
                            key={field}
                            type={field === 'email' ? 'email' : 'text'}
                            name={field}
                            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                            value={(formData as any)[field] || ''}
                            onChange={handleInputChange}
                            className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                        />
                    ))}
                    <input
                        type="date"
                        name="hired_date"
                        value={formData.hired_date || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="number"
                        name="salary"
                        placeholder="Salary"
                        value={formData.salary || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                </div>
                <div className="flex gap-4 mt-6">
                    <button
                        onClick={handleSubmit}
                        className="bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
                    >
                        {isEdit ? 'Update Employee' : 'Add Employee'}
                    </button>
                    {isEdit && (
                        <button
                            onClick={resetForm}
                            className="bg-gray-300 text-black px-6 py-3 rounded-lg hover:bg-gray-400 transition"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {/* Logs Section */}
            <div className="logs-section">
                <button
                    onClick={toggleLogsVisibility}
                    className="toggle-logs-btn"
                >
                    {isLogsVisible ? 'Hide Change Logs' : 'View Change Logs'}
                </button>

                {isLogsVisible && logs.length > 0 && (
                    <div className="logs-section">
                        <h3 className="text-xl font-semibold text-teal-700">Change Logs</h3>
                        <ul className="logs-list">
                        {logs.map((log) => (
                            <li key={log.id} className="bg-gray-100 p-4 rounded-lg shadow-md mb-4">
                                <p><strong>Action:</strong> {log.action}</p>
                                <p><strong>Details:</strong> {formatLogDetails(log.details)}</p> {/* This will be in a single line */}
                                <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                {isLogsVisible && logs.length === 0 && (
                    <div className="text-center text-gray-500">No change logs available.</div>
                )}
            </div>

            {/* Employees List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                    <div key={employee.id} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition duration-300 ease-in-out">
                        <h3 className="text-lg font-semibold text-teal-600">{employee.name}</h3>
                        <p className="text-gray-600">{employee.position}</p>
                        <p className="text-teal-500 font-medium">Pay: £{employee.salary.toLocaleString()}</p>
                        <div className="flex gap-4 mt-4">
                            <button
                                onClick={() => editEmployee(employee)}
                                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => promoteEmployee(employee)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                            >
                                Promote
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UpdateEmployeePage;
