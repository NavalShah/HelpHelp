import React from 'react';

interface StartScreenProps {
  onCallClick: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onCallClick }) => {
  return (
    <div style={styles.container}>
      {/* Empty Space on Top */}
      <div style={styles.topSpace}></div>

      {/* Dialing Pad */}
      <div style={styles.dialingPad}>
        <div style={styles.row}>
          <button style={styles.button}>
            <span style={styles.number}>1</span>
            <span style={styles.letters}></span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>2</span>
            <span style={styles.letters}>ABC</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>3</span>
            <span style={styles.letters}>DEF</span>
          </button>
        </div>
        <div style={styles.row}>
          <button style={styles.button}>
            <span style={styles.number}>4</span>
            <span style={styles.letters}>GHI</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>5</span>
            <span style={styles.letters}>JKL</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>6</span>
            <span style={styles.letters}>MNO</span>
          </button>
        </div>
        <div style={styles.row}>
          <button style={styles.button}>
            <span style={styles.number}>7</span>
            <span style={styles.letters}>PQRS</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>8</span>
            <span style={styles.letters}>TUV</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>9</span>
            <span style={styles.letters}>WXYZ</span>
          </button>
        </div>
        <div style={styles.row}>
          <button style={styles.button}>
            <span style={styles.number}>*</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>0</span>
            <span style={styles.letters}>+</span>
          </button>
          <button style={styles.button}>
            <span style={styles.number}>#</span>
          </button>
        </div>
      </div>

      {/* Call Button */}
      <button style={styles.callButton} onClick={onCallClick}>
        <span style={styles.callIcon}>📞</span>
      </button>

      {/* Bottom Bar */}
      <div style={styles.bottomBar}>
        <button style={styles.bottomBarButton}>Favorites</button>
        <button style={styles.bottomBarButton}>Recents</button>
        <button style={styles.bottomBarButton}>Contacts</button>
        <button style={styles.bottomBarButton}>Keypad</button>
        <button style={styles.bottomBarButton}>Voicemail</button>
      </div>

            {/* App Information Section */}
            <div style={styles.infoSection}>
        <h3 style={styles.infoTitle}>About This App</h3>
        <p style={styles.infoText}>
          <strong>Safe Word:</strong> HELP!
        </p>
        <p style={styles.infoText}>
          This app is designed to help you stay secure in emergencies. It includes:
        </p>
        <ul style={styles.infoList}>
          <li>Fake call functionality to discreetly exit uncomfortable situations.</li>
          <li>Location tracking to share your real-time location with trusted contacts.</li>
          <li>Quick access to emergency services.</li>
        </ul>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#222',
    padding: '20px',
  },
  topSpace: {
    height: '40px', // Mimics the iPhone status bar area
  },
  dialingPad: {
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    gap: '20px',
    width: '100%',
    marginTop: '20px',
  },
  row: {
    display: 'flex',
    gap: '20px',
  },
  button: {
    width: '80px',
    height: '80px',
    fontSize: '24px',
    backgroundColor: '#444',
    border: '1px solid #ccc',
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column' as 'column',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
  },
  number: {
    fontSize: '32px',
    color: '#ddd',
  },
  letters: {
    fontSize: '12px',
    color: '#ddd',
    marginTop: '4px',
  },
  callButton: {
    width: '80px',
    height: '80px',
    fontSize: '18px',
    backgroundColor: '#fff', // Green background
    color: '#fff',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    margin: '20px 0',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callIcon: {
    fontSize: '32px',
    color: '#000', // White icon
  },
  bottomBar: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: '600px',
    padding: '10px',
    backgroundColor: '#333',
    borderTop: '1px solid #ccc',
  },
  bottomBarButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: '#eee',
    fontSize: '14px',
    cursor: 'pointer',
  },
  infoSection: {
    padding: '20px',
    backgroundColor: '#333',
    borderTop: '1px solid #ccc',
    width: '100%',
    maxWidth: '600px',
  },
  infoTitle: {
    fontSize: '18px',
    margin: '0 0 10px',
    color: '#fff',
  },
  infoText: {
    fontSize: '14px',
    margin: '0 0 10px',
    color: '#fff',
  },
  infoList: {
    fontSize: '14px',
    margin: '0 0 10px',
    paddingLeft: '20px',
    color: '#fff',
  },
};

export default StartScreen;
