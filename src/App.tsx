import React, { useState } from 'react';
import StartScreen from './components/StartScreen';
import CallScreen from './components/CallScreen';

const App: React.FC = () => {
  const [isCallScreen, setIsCallScreen] = useState(false);

  const handleHelpClick = () => {
    setIsCallScreen(true);
  };

  const handleEndCall = () => {
    setIsCallScreen(false);
  };

  return (
    <div>
      {isCallScreen ? (
        <CallScreen onEndCall={handleEndCall} />
      ) : (
        <StartScreen onHelpClick={handleHelpClick} />
      )}
    </div>
  );
};

export default App;