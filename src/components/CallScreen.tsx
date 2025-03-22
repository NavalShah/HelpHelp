import React from 'react';

interface CallScreenProps {
  onEndCall: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ onEndCall }) => {
  return (
    <div style={styles.container}>
      <div style={styles.callInfo}>
        <h2 style={styles.name}>Emergency Contact</h2>
        <p style={styles.status}>Calling...</p>
      </div>
      <div style={styles.buttonContainer}>
        <button style={styles.endCallButton} onClick={onEndCall}>
          End Call
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '20px',
  },
  callInfo: {
    textAlign: 'center',
  },
  name: {
    fontSize: '24px',
    margin: '0',
  },
  status: {
    fontSize: '16px',
    margin: '10px 0 0',
  },
  buttonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  endCallButton: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#ff4444',
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    cursor: 'pointer',
  },
};

export default CallScreen;