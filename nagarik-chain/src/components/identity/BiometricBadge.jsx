import PropTypes from 'prop-types';
import { Fingerprint, ScanFace, Eye } from 'lucide-react';

const icons = {
  fingerprint: Fingerprint,
  face: ScanFace,
  iris: Eye,
};

const labels = {
  fingerprint: 'Fingerprint',
  face: 'Face',
  iris: 'Iris',
};

function BiometricBadge({ type, status }) {
  const Icon = icons[type];
  const isEnrolled = status === 'enrolled';

  return (
    <div className="flex items-center gap-2.5">
      <div
        className={`w-9 h-9 rounded-lg flex items-center justify-center ${
          isEnrolled ? 'bg-green-900/40' : 'bg-gray-800'
        }`}
      >
        <Icon
          className={`w-4.5 h-4.5 ${isEnrolled ? 'text-green-400' : 'text-gray-500'}`}
        />
      </div>
      <div>
        <p className="text-brand-white text-sm font-medium">{labels[type]}</p>
        <p className={`text-xs ${isEnrolled ? 'text-green-400' : 'text-gray-500'}`}>
          {isEnrolled ? 'Enrolled ✓' : 'Not Enrolled'}
        </p>
      </div>
    </div>
  );
}

BiometricBadge.propTypes = {
  type: PropTypes.oneOf(['fingerprint', 'face', 'iris']).isRequired,
  status: PropTypes.oneOf(['enrolled', 'not-enrolled']).isRequired,
};

export default BiometricBadge;
