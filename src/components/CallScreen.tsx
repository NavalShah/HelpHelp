import React, { useState, useEffect } from 'react';

interface CallScreenProps {
  onEndCall: () => void;
}

const CallScreen: React.FC<CallScreenProps> = ({ onEndCall }) => {
  const [time, setTime] = useState<number>(0);
  const [calling, setCalling] = useState<boolean>(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCalling(false);
      let startTime = Date.now();
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        setTime(elapsedTime);
      }, 1000);
      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  const formatTime = (milliseconds: number): string => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  return (
    <div style={styles.container}>
      {/* Contact Info */}
      <div style={styles.contactInfo}>
        <h2 style={styles.name}>John Doe</h2>
        <p style={styles.status}>
          {calling ? 'Calling...' : formatTime(time)}
        </p>
      </div>

      {/* Call Controls */}
      <div style={styles.controls}>
        <button style={styles.controlButton}>
          <span style={styles.controlIcon}>🔊</span>
          <span style={styles.controlLabel}>Speaker</span>
        </button>
        <button style={styles.controlButton}>
          <span style={styles.controlIcon}>📹</span>
          <span style={styles.controlLabel}>FaceTime</span>
        </button>
        <button style={styles.controlButton}>
          <span style={styles.controlIcon}>🎤</span>
          <span style={styles.controlLabel}>Mute</span>
        </button>
        <button style={styles.controlButton}>
          <span style={styles.controlIcon}>➕</span>
          <span style={styles.controlLabel}>Add</span>
        </button>
        <button style={styles.controlButton}>
          <span style={styles.controlIcon}>📱</span>
          <span style={styles.controlLabel}>Keypad</span>
        </button>
        <button style={styles.controlButton}>
          <span style={styles.controlIcon}>👤</span>
          <span style={styles.controlLabel}>Contacts</span>
        </button>
      </div>
      <button style={styles.endCallButton} onClick={onEndCall}>
        <span style={styles.endCallIcon}>📞</span>
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#000',
    color: '#fff',
    padding: '20px',
  },
  contactInfo: {
    textAlign: 'center' as 'center',
    marginTop: '40px',
  },
  name: {
    fontSize: '24px',
    margin: '0',
  },
  status: {
    fontSize: '16px',
    margin: '10px 0 0',
    color: '#888',
  },
  controls: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '20px',
    width: '100%',
    maxWidth: '400px',
    margin: '40px 0',
  },
  controlButton: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#fff',
    cursor: 'pointer',
  },
  controlIcon: {
    fontSize: '24px',
    marginBottom: '8px',
  },
  controlLabel: {
    fontSize: '14px',
    color: '#888',
  },
  endCallButton: {
    gridColumn: '2 / 3', // Center the end call button
    width: '80px',
    height: '80px',
    fontSize: '24px',
    backgroundColor: '#ff4444', // Red background
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  endCallIcon: {
    fontSize: '32px',
  },
};

export default CallScreen;}