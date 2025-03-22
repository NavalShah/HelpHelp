import { useState, useEffect } from 'react';

const Location = () => {
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLatitude(position.coords.latitude);
            setLongitude(position.coords.longitude);
          },
          (error) => {
            setError(error.message);
          }
        );
      } else {
        setError("Geolocation is not supported by this browser.");
      }
    };

    getLocation();
    const intervalId = setInterval(getLocation, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div style={styles.container}>
      {latitude && longitude ? (
        <p style={styles.locationText}>
          {latitude}, {longitude}
        </p>
      ) : (
        <p style={styles.locationText}>{error || "Loading location..."}</p>
      )}
    </div>
  );
};

const styles = {
  container: {
    textAlign: 'center' as 'center',
    backgroundColor: '#333',
    color: '#eee',
    padding: '10px',
  },
  locationText: {
    fontSize: '18px',
  },
};

export default Location;
