import React from 'react';

interface StartScreenProps {
  onHelpClick: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onHelpClick }) => {
  return (
    <div style={styles.container}>
      <button style={styles.button} onClick={onHelpClick}>
        Help!
      </button>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f0f0f0',
  },
  button: {
    padding: '15px 30px',
    fontSize: '18px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default StartScreen;