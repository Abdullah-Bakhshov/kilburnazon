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
    dob?: string;
    home_address?: string;
    nin?: string;
    emergency_name?: string;
    emergency_relationship?: string;
    emergency_phone?: string;
}

interface ChangeLog {
    id: number;
    action: string;
    details: string;
    timestamp: string;
}

const UpdateEmployeePage = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [isEdit, setIsEdit] = useState(false);
    const [logs, setLogs] = useState<ChangeLog[]>([]);
    const [isLogsVisible, setIsLogsVisible] = useState(false);

    const BASE_URL = 'http://localhost/workshop/connect.php';

    // Fetch Employees
    const fetchEmployees = async () => {
        try {
            const response = await fetch(`${BASE_URL}?action=getemployees`);
            const data = await response.json();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
        }
    };

    // Fetch Logs
    const fetchLogs = async () => {
        try {
            const response = await fetch(`${BASE_URL}?action=getlogs`);
            const data = await response.json();
            setLogs(data);
        } catch (error) {
            console.error('Error fetching logs:', error);
        }
    };

    // Toggle Logs Visibility
    const toggleLogsVisibility = () => {
        setIsLogsVisible(!isLogsVisible);
        if (!isLogsVisible) {
            fetchLogs();
        }
    };

    // Format Log Details
    const formatLogDetails = (details: string) => {
        return details.length > 100 ? `${details.slice(0, 100)}...` : details;
    };

    // Edit Employee
    const editEmployee = (employee: Employee) => {
        setFormData(employee);
        setIsEdit(true);
    };

    // Promote Employee 
    const promoteEmployee = async (employee: Employee) => {
        try {
            const response = await fetch(`${BASE_URL}?action=updateemployee`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: employee.id,
                    promote: true
                }),
            });
            const result = await response.json();
            
            if (result.message && result.message.includes('promoted')) {
                fetchEmployees();
                fetchLogs();
            } else {
                console.error('Failed to promote employee');
            }
        } catch (error) {
            console.error('Error promoting employee:', error);
        }
    };

    // Handle Input Change
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Submit Form
    const handleSubmit = async () => {
        try {
            const url = isEdit 
                ? `${BASE_URL}?action=updateemployee`
                : `${BASE_URL}?action=addemployee`;
            
            const method = isEdit ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(isEdit ? { ...formData, id: formData.id } : formData),
            });

            const result = await response.json();
            
            if (result.message && (result.message.includes('successfully') || result.id)) {
                fetchEmployees();
                fetchLogs();
                resetForm();
            } else {
                console.error('Failed to submit employee data');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    // Reset Form
    const resetForm = () => {
        setFormData({});
        setIsEdit(false);
    };

    // Initial Data Fetch
    useEffect(() => {
        fetchEmployees();
    }, []);
    
    return (
        <div className="container mx-auto p-6">
            <h1 className="text-3xl font-bold text-center mb-8 text-white">Employee Manager</h1>

            {/* Add/Edit Form */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8 space-y-6">
                <h2 className="text-xl font-semibold text-teal-700">{isEdit ? 'Edit Employee' : 'Add New Employee'}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <input
                        type="text"
                        name="name"
                        placeholder="Full Name"
                        value={formData.name || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="position"
                        placeholder="Position"
                        value={formData.position || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="department"
                        placeholder="Department"
                        value={formData.department || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />

                    {/* Additional Information */}
                    <input
                        type="date"
                        name="dob"
                        placeholder="Date of Birth"
                        value={formData.dob || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="home_address"
                        placeholder="Home Address"
                        value={formData.home_address || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="nin"
                        placeholder="National Insurance Number"
                        value={formData.nin || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />

                    {/* Emergency Contact */}
                    <input
                        type="text"
                        name="emergency_name"
                        placeholder="Emergency Contact Name"
                        value={formData.emergency_name || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="emergency_relationship"
                        placeholder="Emergency Contact Relationship"
                        value={formData.emergency_relationship || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="emergency_phone"
                        placeholder="Emergency Contact Phone"
                        value={formData.emergency_phone || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />

                    {/* Employment Details */}
                    <input
                        type="date"
                        name="hired_date"
                        placeholder="Hire Date"
                        value={formData.hired_date || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <select
                        name="contract"
                        value={formData.contract || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    >
                        <option value="">Select Contract Type</option>
                        <option value="Permanent">Permanent</option>
                        <option value="Freelance">Freelance</option>
                        <option value="Contract">Contract</option>
                    </select>
                    <input
                        type="number"
                        name="salary"
                        placeholder="Salary"
                        value={formData.salary || ''}
                        onChange={handleInputChange}
                        className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-gray-900"
                    />
                    <input
                        type="text"
                        name="office"
                        placeholder="Office Location"
                        value={formData.office || ''}
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
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                    {isLogsVisible ? 'Hide Change Logs' : 'View Change Logs'}
                </button>

                {isLogsVisible && logs.length > 0 && (
                    <div className="logs-section mt-6">
                        <h3 className="text-xl font-semibold text-teal-700">Change Logs</h3>
                        <ul className="logs-list space-y-4">
                        {logs.map((log) => (
                            <li key={log.id} className="bg-gray-100 p-4 rounded-lg shadow-md">
                                <p><strong>Action:</strong> {log.action}</p>
                                <p><strong>Details:</strong> {formatLogDetails(log.details)}</p>
                                <p><strong>Timestamp:</strong> {new Date(log.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                        </ul>
                    </div>
                )}

                {isLogsVisible && logs.length === 0 && (
                    <div className="text-center text-gray-500 mt-4">No change logs available.</div>
                )}
            </div>

            {/* Employees List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
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