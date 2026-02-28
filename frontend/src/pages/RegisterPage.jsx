// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { register } from '../api';

// function RegisterPage() {
//   const navigate = useNavigate();
//   const [fullName, setFullName] = useState('');
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (password.length < 6) {
//       setError('Password must be at least 6 characters');
//       return;
//     }

//     if (password !== confirmPassword) {
//       setError('Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       await register(fullName, email, password);
//       setSuccess(true);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Registration failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (success) {
//     return (
//       <div className="card shadow-sm w-100" style={{ maxWidth: '28rem' }}>
//         <div className="card-body p-4 text-center">
//           <div className="text-success mb-3 fs-3">✓</div>
//           <h3 className="h5 mb-2">Registration successful!</h3>
//           <p className="text-muted small mb-4">
//             You can now login with your email and password.
//           </p>
//           <Link to="/login" className="btn btn-dark w-100">
//             Go to Login
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="card shadow-sm w-100" style={{ maxWidth: '28rem' }}>
//       <div className="card-body p-4">
//         <h2 className="card-title h5 mb-2 text-center">Create an account</h2>
//         <p className="text-muted small mb-4 text-center">
//           Register first to access the Gate Pass Management System.
//         </p>
//         <form onSubmit={handleSubmit}>
//           <div className="mb-3">
//             <label className="form-label" htmlFor="fullName">
//               Full Name
//             </label>
//             <input
//               id="fullName"
//               type="text"
//               className="form-control form-control-sm"
//               value={fullName}
//               onChange={(e) => setFullName(e.target.value)}
//               required
//               placeholder="John Doe"
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label" htmlFor="email">
//               Email
//             </label>
//             <input
//               id="email"
//               type="email"
//               className="form-control form-control-sm"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="you@example.com"
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label" htmlFor="password">
//               Password
//             </label>
//             <input
//               id="password"
//               type="password"
//               className="form-control form-control-sm"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               minLength={6}
//               placeholder="At least 6 characters"
//             />
//           </div>
//           <div className="mb-3">
//             <label className="form-label" htmlFor="confirmPassword">
//               Confirm Password
//             </label>
//             <input
//               id="confirmPassword"
//               type="password"
//               className="form-control form-control-sm"
//               value={confirmPassword}
//               onChange={(e) => setConfirmPassword(e.target.value)}
//               required
//               placeholder="Re-enter password"
//             />
//           </div>
//           {error && <div className="text-danger small mb-2">{error}</div>}
//           <button
//             type="submit"
//             disabled={loading}
//             className="btn btn-dark w-100 btn-sm"
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </button>
//           <p className="text-muted small mt-3 mb-0 text-center">
//             Already have an account? <Link to="/login">Login</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default RegisterPage;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api';

function RegisterPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="animated-card">
        <div className="card-body text-center p-4">
          <div className="success-check mb-3">✓</div>
          <h3 className="mb-2 text-info fw-bold">Registration Successful!</h3>
          <p className="text-light small mb-4">
            Your Gate Pass System account has been activated.
          </p>
          <Link to="/login" className="btn btn-info w-100 rounded-pill shadow">
            Proceed to Login
          </Link>
        </div>
        <Style />
      </div>
    );
  }

  return (
    <div className="animated-card">
      <div className="card-body p-4">
        <h2 className="text-center fw-bold text-info mb-2">
          🚪 Create Gate Pass Account
        </h2>
        <p className="text-center text-light small mb-4">
          Secure access to the Steel Factory Gate Pass Workflow
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light">Full Name</label>
            <input
              type="text"
              className="form-control custom-input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="John Doe"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Email</label>
            <input
              type="email"
              className="form-control custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Password</label>
            <input
              type="password"
              className="form-control custom-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="mb-3">
            <label className="form-label text-light">Confirm Password</label>
            <input
              type="password"
              className="form-control custom-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              placeholder="Re-enter password"
            />
          </div>

          {error && (
            <div className="text-danger small mb-3 text-center fw-semibold">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-info w-100 rounded-pill fw-semibold shadow register-btn"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

          <p className="text-light small mt-3 text-center">
            Already have an account?{' '}
            <Link to="/login" className="text-info fw-semibold">
              Login
            </Link>
          </p>
        </form>
      </div>

      <Style />
    </div>
  );
}

/* 🎨 Animated Styles (Scoped inside component) */
function Style() {
  return (
    <style>{`
      .animated-card {
        width: 100%;
        max-width: 30rem;
        background: rgba(255,255,255,0.05);
        backdrop-filter: blur(15px);
        border-radius: 20px;
        border: 1px solid rgba(255,255,255,0.1);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        animation: fadeSlide 0.8s ease forwards;
      }

      @keyframes fadeSlide {
        from {
          opacity: 0;
          transform: translateY(40px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .custom-input {
        background: rgba(255,255,255,0.08);
        border: 1px solid rgba(255,255,255,0.15);
        color: #fff;
        transition: all 0.3s ease;
      }

      .custom-input:focus {
        background: rgba(255,255,255,0.12);
        border-color: #00c6ff;
        box-shadow: 0 0 10px rgba(0,198,255,0.6);
        color: #fff;
      }

      .register-btn {
        transition: all 0.3s ease;
      }

      .register-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 20px rgba(0,198,255,0.4);
      }

      .success-check {
        font-size: 3rem;
        color: #00ffae;
        animation: pop 0.6s ease;
      }

      @keyframes pop {
        0% { transform: scale(0); }
        70% { transform: scale(1.2); }
        100% { transform: scale(1); }
      }
    `}</style>
  );
}

export default RegisterPage;