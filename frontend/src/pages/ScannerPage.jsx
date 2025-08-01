import React, { useState } from 'react';
import QRScanner from '../components/QRScanner';
import axios from 'axios';

const AttendanceScanner = () => {
  const [employeeCode, setEmployeeCode] = useState('');
  const [message, setMessage] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [loading, setLoading] = useState(false);

  // Callback that receives the decoded QR code string
  const handleQRCodeScanned = (scannedCode) => {
    console.log('Scanned QR code:', scannedCode); // debug
    setEmployeeCode(scannedCode);
    // Optionally, trigger the scan submit automatically:
    // handleScan(scannedCode);
  };

  const handleScan = async () => {
    if (!employeeCode.trim()) {
      setMessage('Please enter your employee code.');
      return;
    }

    setLoading(true);
    setMessage('');
    setAttendance(null);

    try {
      const response = await axios.post('http://localhost:5004/api/attendance', {
      employeeCode: employeeCode, // Changed from employeeId to employeeCode
    });

      setMessage(response.data.message);
      setAttendance(response.data.attendance);
    } catch (error) {
      if (error.response) {
        setMessage(error.response.data.message || 'Failed to scan attendance.');
      } else {
        setMessage('Server error or network issue.');
      }
    } finally {
      setLoading(false);
      setEmployeeCode(''); // clear after scan
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '50px auto', padding: 20, border: '1px solid #ccc', borderRadius: 8, fontFamily: 'Arial, sans-serif' }}>
      <h2>Attendance Scanner</h2>

      <QRScanner onScanSuccess={handleQRCodeScanned} />

      <input
        type="text"
        placeholder="Enter or scan employee code"
        value={employeeCode}
        onChange={(e) => setEmployeeCode(e.target.value)}
        style={{ width: '100%', padding: 10, fontSize: 16, marginTop: 10, marginBottom: 10, boxSizing: 'border-box' }}
        onKeyDown={(e) => { if (e.key === 'Enter') handleScan(); }}
        disabled={loading}
        autoFocus
      />

      <button
        onClick={handleScan}
        disabled={loading}
        style={{
          width: '100%',
          padding: 10,
          fontSize: 16,
          backgroundColor: '#4caf50',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Processing...' : 'Scan Attendance'}
      </button>

      {message && <p style={{ marginTop: 20, color: message.toLowerCase().includes('successful') ? 'green' : 'red' }}>{message}</p>}

      {attendance && (
        <div style={{ marginTop: 20, padding: 10, border: '1px solid #ddd', borderRadius: 4, backgroundColor: '#f9f9f9', fontSize: 14 }}>
          <p><strong>Attendance Details:</strong></p>
          <p><strong>ID:</strong> {attendance.id}</p>
          <p><strong>Employee ID:</strong> {attendance.employee_id}</p>
          <p><strong>Time In:</strong> {new Date(attendance.time_in).toLocaleString()}</p>
          <p><strong>Time Out:</strong> {attendance.time_out ? new Date(attendance.time_out).toLocaleString() : 'Not clocked out yet'}</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceScanner;
