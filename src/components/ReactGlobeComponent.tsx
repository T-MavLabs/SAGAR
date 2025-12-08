import React from 'react';
import { DataPoint } from '../App';

import { Globe as ExternalGlobe } from '../external/transpiled/Globe.js';

interface ReactGlobeComponentProps {
  dataPoints: DataPoint[];
  onDataPointClick: (dataPoint: DataPoint) => void;
  autoRotate?: boolean;
  focusOnData?: boolean;
  onCameraDistanceChange?: (distance: number) => void;
  onResetCamera?: (resetFunction: () => void) => void;
  showStarsOnly?: boolean;
  showPath?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
  minDistance?: number;
  maxDistance?: number;
  disableAutoRotate?: boolean;
}

const ReactGlobeComponent: React.FC<ReactGlobeComponentProps> = ({ dataPoints, onDataPointClick, onCameraDistanceChange, onResetCamera, showStarsOnly, showPath, focusOnData, enableRotate, enableZoom, minDistance, maxDistance, disableAutoRotate }) => {
  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'black', position: 'relative' }}>
      <ExternalGlobe 
        onCameraDistanceChange={onCameraDistanceChange} 
        onResetCamera={onResetCamera} 
        showStarsOnly={showStarsOnly} 
        dataPoints={dataPoints} 
        onDataPointClick={onDataPointClick}
        showPath={showPath}
        focusOnData={focusOnData}
        enableRotate={enableRotate}
        enableZoom={enableZoom}
        minDistance={minDistance}
        maxDistance={maxDistance}
        disableAutoRotate={disableAutoRotate}
      />
    </div>
  );
};

export default ReactGlobeComponent;
