import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import CallScreen from './components/CallScreen';
import Location from './components/Location';

const App: React.FC = () => {
  const [isCallScreen, setIsCallScreen] = useState(false);

  const handleCallClick = () => {
    setIsCallScreen(true);
  };

  const handleEndCall = () => {
    setIsCallScreen(false);
  };

  return (
    <div>
      <Location />
      {isCallScreen ? (
        <CallScreen onEndCall={handleEndCall} />
      ) : (
        <StartScreen onCallClick={handleCallClick} />
      )}
    </div>
  );
};

export default App;
