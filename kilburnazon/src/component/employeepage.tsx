'use client';

import { useState, useEffect } from 'react';
import './employee.css';

export default function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filters, setFilters] = useState({
    department: '',
    position: '',
    office: '',
    hired_date: '',
  });

  useEffect(() => {
    fetch('http://localhost/workshop/connect.php?action=getemployees') // Adjust URL if necessary
      .then((res) => res.json())
      .then((data) => {
        setEmployees(data);
        setFilteredEmployees(data); // Initialize filtered employees with all data
      })
      .catch((error) => console.error('Error fetching employees:', error));
  }, []);

  // Handle free-text search
  const handleSearch = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  // Handle specific filters
  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  // Apply filters and search
  useEffect(() => {
    const filtered = employees.filter((employee) => {
      // Check each filter; empty filters are ignored
      return (
        (!filters.department || employee.department === filters.department) &&
        (!filters.position || employee.position === filters.position) &&
        (!filters.office || employee.office === filters.office) &&
        (!filters.hired_date || employee.hired_date.startsWith(filters.hired_date)) &&
        (
          !searchTerm ||
          ['name', 'position', 'department', 'office', 'hired_date', 'contract', 'email']
            .some((key) => employee[key]?.toLowerCase().includes(searchTerm))
        )
      );
    });

    setFilteredEmployees(filtered);
  }, [searchTerm, filters, employees]);

  const openModal = (employee) => setSelectedEmployee(employee);
  const closeModal = () => setSelectedEmployee(null);

  // Extract unique values for dropdown filters
  const uniqueValues = (key) => [...new Set(employees.map((employee) => employee[key]).filter(Boolean))];

  return (
    <div className="container">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Employee Directory</h1>
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search employees by any attribute..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-input"
      />

{/* Filters */}
<div className="filters-bar">
  <div className="filters">
    {/* Department Filter */}
    <select
      name="department"
      value={filters.department}
      onChange={handleFilterChange}
      className="filter-input"
    >
      <option value="">All Departments</option>
      {uniqueValues('department').map((dept) => (
        <option key={dept} value={dept}>
          {dept}
        </option>
      ))}
    </select>

    {/* Job Title Filter */}
    <select
      name="position"
      value={filters.position}
      onChange={handleFilterChange}
      className="filter-input"
    >
      <option value="">All Job Titles</option>
      {uniqueValues('position').map((pos) => (
        <option key={pos} value={pos}>
          {pos}
        </option>
      ))}
    </select>

    {/* Office Filter */}
    <select
      name="office"
      value={filters.office}
      onChange={handleFilterChange}
      className="filter-input"
    >
      <option value="">All Locations</option>
      {uniqueValues('office').map((loc) => (
        <option key={loc} value={loc}>
          {loc}
        </option>
      ))}
    </select>

    {/* Start Date Filter */}
    <input
      type="text"
      name="hired_date"
      placeholder="Filter by start year (e.g., 2023)"
      value={filters.hired_date}
      onChange={handleFilterChange}
      className="filter-input"
    />
  </div>
</div>


      {/* Employee Cards */}
      <div className="employee-list">
        {filteredEmployees.map((employee) => (
          <div
            key={employee.id}
            className="employee-card"
            onClick={() => openModal(employee)}
          >
            <img
              src={employee.photo || '/default.jpg'}
              alt={employee.name}
              className="employee-image"
            />
            <h3>{employee.name}</h3>
            <p>{employee.position}</p>
            <p>{employee.department}</p>
            <p>{employee.office}</p>
          </div>
        ))}
      </div>

      {/* Employee Modal */}
      {selectedEmployee && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedEmployee.photo || '/default.jpg'}
              alt="Employee"
              className="employee-image-large"
            />
            <h2>{selectedEmployee.name}</h2>
            <p><strong>Position:</strong> {selectedEmployee.position}</p>
            <p><strong>Department:</strong> {selectedEmployee.department}</p>
            <p><strong>Email:</strong> {selectedEmployee.email}</p>
            <p><strong>Office:</strong> {selectedEmployee.office}</p>
            <p><strong>Start Date:</strong> {selectedEmployee.hired_date}</p>
            <p><strong>Contract Type:</strong> {selectedEmployee.contract}</p>
            <p><strong>Emergency Contact:</strong> {selectedEmployee.emergency_name || 'N/A'} ({selectedEmployee.emergency_relationship || 'N/A'})</p>
            <p><strong>Emergency Phone:</strong> {selectedEmployee.emergency_phone || 'N/A'}</p>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
