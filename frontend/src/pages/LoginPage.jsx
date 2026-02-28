// import React, { useState } from 'react';
// import { useNavigate, Link } from 'react-router-dom';
// import { login, getCurrentUser } from '../api';

// function LoginPage() {
//   const navigate = useNavigate();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       const user = await login(email, password);
//       if (user.role === 'CLIENT') navigate('/client');
//       else if (user.role === 'STORE_MANAGER') navigate('/store');
//       else if (user.role === 'DIRECTOR') navigate('/director');
//       else if (user.role === 'SECURITY') navigate('/security');
//       else navigate('/');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Login failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   React.useEffect(() => {
//     const user = getCurrentUser();
//     if (user) {
//       if (user.role === 'CLIENT') navigate('/client');
//       else if (user.role === 'STORE_MANAGER') navigate('/store');
//       else if (user.role === 'DIRECTOR') navigate('/director');
//       else if (user.role === 'SECURITY') navigate('/security');
//     }
//   }, [navigate]);

//   return (
//     <div className="card shadow-sm w-100" style={{ maxWidth: '28rem' }}>
//       <div className="card-body p-4">
//         <h2 className="card-title h5 mb-2 text-center">Sign in</h2>
//         <p className="text-muted small mb-4 text-center">
//           Use your email and password to access your dashboard. New users must register first.
//         </p>
//         <form onSubmit={handleSubmit}>
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
//             />
//           </div>
//           {error && <div className="text-danger small mb-2">{error}</div>}
//           <button
//             type="submit"
//             disabled={loading}
//             className="btn btn-dark w-100 btn-sm"
//           >
//             {loading ? 'Signing in...' : 'Sign in'}
//           </button>
//           <p className="text-muted small mt-3 mb-0 text-center">
//             Don&apos;t have an account? <Link to="/register">Register</Link>
//           </p>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default LoginPage;


import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, getCurrentUser } from '../api';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'CLIENT') navigate('/client');
      else if (user.role === 'STORE_MANAGER') navigate('/store');
      else if (user.role === 'DIRECTOR') navigate('/director');
      else if (user.role === 'SECURITY') navigate('/security');
      else navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      if (user.role === 'CLIENT') navigate('/client');
      else if (user.role === 'STORE_MANAGER') navigate('/store');
      else if (user.role === 'DIRECTOR') navigate('/director');
      else if (user.role === 'SECURITY') navigate('/security');
    }
  }, [navigate]);

  return (
    <div className="animated-card">
      <div className="card-body p-4">
        <h2 className="text-center fw-bold text-info mb-2">
          🔐 Gate Pass System Login
        </h2>

        <p className="text-center text-light small mb-4">
          Secure authentication for Steel Factory Workflow
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label text-light">Email</label>
            <input
              type="email"
              className="form-control custom-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
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
              placeholder="Enter your password"
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
            className="btn btn-info w-100 rounded-pill fw-semibold shadow login-btn"
          >
            {loading ? (
              <span className="d-flex align-items-center justify-content-center gap-2">
                <span className="spinner-border spinner-border-sm"></span>
                Signing in...
              </span>
            ) : (
              'Sign In'
            )}
          </button>

          <p className="text-light small mt-3 text-center">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-info fw-semibold">
              Register
            </Link>
          </p>
        </form>
      </div>

      <Style />
    </div>
  );
}

/* 🎨 Premium Animated Styles */
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
        box-shadow: 0 0 12px rgba(0,198,255,0.7);
        color: #fff;
      }

      .login-btn {
        transition: all 0.3s ease;
      }

      .login-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 12px 25px rgba(0,198,255,0.5);
      }

      .spinner-border {
        color: white;
      }
    `}</style>
  );
}

export default LoginPage;