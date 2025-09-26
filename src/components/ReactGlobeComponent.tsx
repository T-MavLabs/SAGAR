import React from 'react';
import { DataPoint } from '../App';

// Import the transpiled external Globe component (no JSX)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - JS module without types
import { Globe as ExternalGlobe } from '../external/transpiled/Globe.js';

interface ReactGlobeComponentProps {
  dataPoints: DataPoint[];
  onDataPointClick: (dataPoint: DataPoint) => void;
  autoRotate?: boolean;
  focusOnData?: boolean;
  onCameraDistanceChange?: (distance: number) => void;
  showStarsOnly?: boolean;
}

const ReactGlobeComponent: React.FC<ReactGlobeComponentProps> = ({ onCameraDistanceChange, showStarsOnly }) => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black', position: 'relative' }}>
      <ExternalGlobe onCameraDistanceChange={onCameraDistanceChange} showStarsOnly={showStarsOnly} />
    </div>
  );
};

export default ReactGlobeComponent;
