import { useState, useRef } from 'react';
import QRScanner from '../../components/QRScanner';

const ScannerPage = () => {
  const [message, setMessage] = useState('');
  const [scannedToken, setScannedToken] = useState('');
  const [scanLocked, setScanLocked] = useState(false);
  const scannerRef = useRef(null);

  const handleScan = async (token) => {
    if (scanLocked) return;

    setScanLocked(true);
    setScannedToken(token);
    setMessage('⏳ Processing scan...');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 7000);

    try {
      const res = await fetch('http://localhost:5004/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId: token }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const responseData = await res.json();
      if (!res.ok) throw new Error(responseData.message || 'Server error');

      setMessage(`✅ ${responseData.message}`);

      setTimeout(() => {
        setScannedToken('');
        scannerRef.current?.restartCamera();
      }, 1500);

    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        setMessage('❌ Request timed out');
      } else {
        setMessage(`❌ ${err.message || 'Error processing scan'}`);
      }
      setTimeout(() => scannerRef.current?.restartCamera(), 1000);

    } finally {
      setScanLocked(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center min-vh-100 bg-light">
      <div className="card shadow p-4" style={{ maxWidth: '500px', width: '100%' }}>
        <h2 className="text-center mb-4">Employee Attendance Scanner</h2>

        <div className="border rounded p-2 bg-white mb-3" style={{ height: '300px' }}>
          <QRScanner
            ref={scannerRef}
            onScanSuccess={handleScan}
            scanDelay={500}
          />
        </div>

        <div
          className={`alert ${
            message.startsWith('❌')
              ? 'alert-danger'
              : message.startsWith('✅')
              ? 'alert-success'
              : 'alert-secondary'
          }`}
        >
          <strong>Scanned Token:</strong> {scannedToken || 'N/A'}
          <br />
          <strong>Status:</strong> {message || 'Ready to scan...'}
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
