import React from 'react';
import PropTypes from 'prop-types';

const DataHealthBadge = ({ status, size }) => {
    let badgeColor;
    switch (status) {
        case 'healthy':
            badgeColor = 'green';
            break;
        case 'warning':
            badgeColor = 'yellow';
            break;
        case 'critical':
            badgeColor = 'red';
            break;
        default:
            badgeColor = 'gray'; // default color for unknown status
    }

    const sizeClass = size === 'lg' ? 'badge-lg' : size === 'sm' ? 'badge-sm' : 'badge-md';

    return (
        <span className={`data-health-badge ${sizeClass}`} style={{ backgroundColor: badgeColor }}>
            {status}
        </span>
    );
};

DataHealthBadge.propTypes = {
    status: PropTypes.oneOf(['healthy', 'warning', 'critical']).isRequired,
    size: PropTypes.oneOf(['sm', 'md', 'lg']).isRequired,
};

export default DataHealthBadge;