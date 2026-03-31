import React from 'react';

const alertStyles = {
  CRITICAL: { color: 'red' },
  ERROR: { color: 'red' },
  WARNING: { color: 'yellow' },
  INFO: { color: 'blue' },
};

const alerts = [
  { type: 'CRITICAL', message: 'Critical issue with environment variables!' },
  { type: 'ERROR', message: 'Error detected in fallback data usage.' },
  { type: 'WARNING', message: 'Warning: Synthetic chain data integrity compromised.' },
  { type: 'INFO', message: 'Info: Stream health is operational.' },
];

const DataHealthBanner = () => {
  return (
    <div>
      {alerts.map((alert, index) => (
        <div key={index} style={alertStyles[alert.type]}>
          [{alert.type}] {alert.message}
        </div>
      ))}
    </div>
  );
};

export default DataHealthBanner;
