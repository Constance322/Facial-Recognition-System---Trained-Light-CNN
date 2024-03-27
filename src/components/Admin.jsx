import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import styles from '../style';
import faciaLogo from '../assets/facia.png';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [logMessage, setLogMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:5001/admin');  
      setUsers(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const logAccess = async () => {
    try {
      const response = await axios.post('http://localhost:5002/log_access'); 
      setLogMessage(response.data.message);
      fetchData(); 
    } catch (error) {
      console.error(error);
      setLogMessage('Error logging access');
    }
  };

  return (
    <section
      id="admin"
      className={`flex md:flex-row flex-col ${styles.paddingY}`}
      style={{ height: '100vh', backgroundColor: '#00040f', color: '#ffffff', overflow: 'hidden' }}
    >
      <div className={`absolute left-2 top-0 p-6`} style={{ zIndex: 10, borderRadius: '10px', display: 'flex', alignItems: 'center' }}>
        <img
          src={faciaLogo}
          alt="Logo"
          style={{ width: '45px', borderRadius: '5px', border: '2px solid white', marginRight: '10px' }}
        />
        <span className="text-a46730 text-2xl font-bold">FACIA</span>
      </div>

      <div
        className={`flex-1 ${styles.flexStart} flex-col xl:px-0 sm:px-16 px-6`}
        style={{ overflowY: 'hidden', marginTop: '60px', marginRight: '0' }}
      >
        <h1
          className="font-poppins font-semibold text-[52px] leading-[75px]"
          style={{
            background: 'linear-gradient(300deg, #804316, #ffffff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Admin Panel
        </h1>

        <table className={`${styles.table} mt-5`}>
          <thead>
            <tr>
              <th>Name</th>
              <th>ID</th>
              <th>Time Accessed</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.name}</td>
                <td>{user.id}</td>
                <td>{user.time_accessed}</td>
                <td>{user.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={logAccess} className={`${styles.button} mt-5`}>
          Log Access
        </button>
        <p>{logMessage}</p>

        <Link to="/" className={`${styles.link} mt-5`}>
          Go to Home
        </Link>

        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#a46730',
          }}
        >
          &copy; Constance
        </div>
      </div>
    </section>
  );
};

export default Admin;
