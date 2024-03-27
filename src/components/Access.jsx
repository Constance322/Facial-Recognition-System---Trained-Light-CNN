import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { logo } from '../assets';
import security from '../assets/security.jpg';


const Access = () => {
  const [id, setId] = useState('');
  const [accessMessage, setAccessMessage] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((error) => {
          console.error('Error accessing camera:', error);
        });
    }
  }, []);

  const handleCaptureImage = async () => {
    const video = videoRef.current;

    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageDataUrl = canvas.toDataURL('image/png');

      if (!id) {
        setAccessMessage('Please enter the ID.');
        return;
      }

      setCapturedImage(imageDataUrl);
      console.log('Captured image data URL:', imageDataUrl);
    }
  };

  const handleAccess = async () => {
    try {
      const response = await fetch('http://localhost:5003/add_access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ capturedImage, id }),
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
  
      const data = await response.json();
      setAccessMessage(data.message);
    } catch (error) {
      console.error('Error accessing server:', error);
      setAccessMessage('Error accessing server. Please try again.');
    }
  };
  
  

  return (
    <section
      id="access"
      className={`flex items-center justify-center`}
      style={{
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <div className="w-1/2 flex justify-center items-center">
        {capturedImage ? (
          <img src={capturedImage} alt="Captured" style={{ width: '100%', maxHeight: '600px', borderRadius: '10px' }} />
        ) : (
          <img
            src={security}
            alt="Security"
            style={{ width: '100%', maxHeight: '600px', borderRadius: '10px' }}
          />
        )}
      </div>

      <div className="w-1/2 flex justify-center items-center">
        <div className="p-6">
          <div className={`absolute left-10 top-8`}>
            <Link to="/">
              <img src={logo} alt="Logo" style={{ width: '30px' }} />
            </Link>
          </div>

          <div className={`ml-0 absolute left-24 top-6 text-a46730 text-white text-2xl font-bold`}>
            FACIA
          </div>

          <div className={`absolute right-0 top-6`}>
            <ul className="flex">
              <li className="text-a46730 text-white text-2xl font-bold">
                <Link to="/">Home</Link>
              </li>
            </ul>
          </div>

          <div className="flex-1 flex flex-col items-center justify-end" style={{ height: '50%' }}>
            <h1 className="font-bold text-white text-4xl mb-6" style={{ color: '#804316' }}>
              Access Registration
            </h1>

            <div
              className="rounded-lg p-6 flex flex-col items-start bg-opacity-25 backdrop-blur-md"
              style={{
                backgroundColor: '#e1b78c',
                width: '50%',
                height: '40%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
              }}
            >
              <div className="flex flex-col mb-2">
                <label htmlFor="id" className="text-black text-lg font-bold mb-2">
                  ID
                </label>
                <input
                  type="text"
                  id="id"
                  className="p-2 rounded"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                />
              </div>

              <div className="flex flex-col mb-2">
                <label className="text-black text-lg font-bold mb-2">Capture Image</label>
                <video ref={videoRef} width="100%" height="auto" style={{ borderRadius: '10px' }} autoPlay />
                <button onClick={handleCaptureImage} className="bg-804316 text-black p-2 mt-2 rounded font-bold">
                  Capture
                </button>
              </div>

              <button
                onClick={handleAccess}
                className="rounded-lg bg-804316 text-black p-3 font-bold text-2xl"
                style={{ cursor: 'pointer', transition: 'background-color 0.3s' }}
              >
                Access
              </button>
              <p>{accessMessage}</p>

              <p className="mt-4">
                New user?{' '}
                <Link to="/security" className="text-blue-500">
                  Register
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          width: '100%',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#a46730',
        }}
      >
        &copy; Constance
      </div>
    </section>
  );
};

export default Access;
