// import React from 'react';
// import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
// import { getCurrentUser, logout } from './api';
// import ClientDashboard from './pages/ClientDashboard';
// import StoreDashboard from './pages/StoreDashboard';
// import DirectorDashboard from './pages/DirectorDashboard';
// import SecurityDashboard from './pages/SecurityDashboard';
// import LoginPage from './pages/LoginPage';
// import RegisterPage from './pages/RegisterPage';
// import AdminDashboard from './pages/AdminDashboard';
// import GatePassDetail from './pages/GatePassDetail';

// function ProtectedRoute({ roles, children }) {
//   const user = getCurrentUser();
//   if (!user) {
//     return <Navigate to="/login" replace />;
//   }
//   if (roles && !roles.includes(user.role)) {
//     return <Navigate to="/login" replace />;
//   }
//   return children;
// }

// function Layout({ children }) {
//   const user = getCurrentUser();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate('/login');
//   };

//   return (
//     <div className="min-vh-100 d-flex flex-column">
//       <header className="bg-dark text-white px-4 py-3 d-flex align-items-center justify-content-between">
//         <h1 className="fw-semibold fs-5 mb-0">Gate Pass Management System</h1>
//         {user && (
//           <div className="d-flex align-items-center gap-3 small">
//             <span>
//               {user.fullName} ({user.role})
//             </span>
//             <button
//               type="button"
//               onClick={handleLogout}
//               className="btn btn-secondary btn-sm"
//             >
//               Logout
//             </button>
//           </div>
//         )}
//       </header>
//       <main className="flex-grow-1 bg-light">
//         <div className="container py-4">{children}</div>
//       </main>
//       <footer className="bg-light border-top text-center small text-muted py-2">
//         Steel Factory Gate Pass Workflow: Client → Store → Director → Security
//       </footer>
//     </div>
//   );
// }

// function App() {
//   return (
//     <Routes>
//       <Route
//         path="/login"
//         element={
//           <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//             <LoginPage />
//           </div>
//         }
//       />

//       <Route
//         path="/register"
//         element={
//           <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
//             <RegisterPage />
//           </div>
//         }
//       />

//       <Route
//         path="/client/*"
//         element={
//           <ProtectedRoute roles={['CLIENT']}>
//             <Layout>
//               <ClientDashboard />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/store/*"
//         element={
//           <ProtectedRoute roles={['STORE_MANAGER']}>
//             <Layout>
//               <StoreDashboard />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/director/*"
//         element={
//           <ProtectedRoute roles={['DIRECTOR']}>
//             <Layout>
//               <DirectorDashboard />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/security/*"
//         element={
//           <ProtectedRoute roles={['SECURITY']}>
//             <Layout>
//               <SecurityDashboard />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/admin/*"
//         element={
//           <ProtectedRoute roles={['ADMIN']}>
//             <Layout>
//               <AdminDashboard />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/gatepasses/:id"
//         element={
//           <ProtectedRoute roles={['CLIENT', 'STORE_MANAGER', 'DIRECTOR', 'SECURITY']}>
//             <Layout>
//               <GatePassDetail />
//             </Layout>
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/"
//         element={
//           <Layout>
//             <Landing />
//           </Layout>
//         }
//       />

//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// }

// function Landing() {
//   const user = getCurrentUser();

//   if (user) {
//     if (user.role === 'CLIENT') return <Navigate to="/client" replace />;
//     if (user.role === 'STORE_MANAGER') return <Navigate to="/store" replace />;
//     if (user.role === 'DIRECTOR') return <Navigate to="/director" replace />;
//     if (user.role === 'SECURITY') return <Navigate to="/security" replace />;
//     if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
//   }

//   return (
//     <div className="container mt-5 text-center" style={{ maxWidth: '36rem' }}>
//       <h2 className="fs-2 fw-semibold mb-4">Welcome to Gate Pass Management System</h2>
//       <p className="text-secondary mb-4">
//         Digitized, role-based gate pass workflow for your steel factory, enforcing every approval
//         step from Client to Security.
//       </p>
//       <p className="text-muted small mb-3">
//         New users must register first before logging in.
//       </p>
//       <div className="d-flex flex-column flex-sm-row gap-2 justify-content-center">
//         <Link to="/register" className="btn btn-dark">
//           Register
//         </Link>
//         <Link to="/login" className="btn btn-outline-dark">
//           Login
//         </Link>
//       </div>
//     </div>
//   );
// }

// export default App;


import React from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { getCurrentUser, logout } from './api';
import ClientDashboard from './pages/ClientDashboard';
import StoreDashboard from './pages/StoreDashboard';
import DirectorDashboard from './pages/DirectorDashboard';
import SecurityDashboard from './pages/SecurityDashboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AdminDashboard from './pages/AdminDashboard';
import GatePassDetail from './pages/GatePassDetail';

function ProtectedRoute({ roles, children }) {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function Layout({ children }) {
  const user = getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-vh-100 d-flex flex-column bg-dark text-light">

      {/* 🔥 HEADER */}
      <header
        className="px-4 py-3 d-flex align-items-center justify-content-between shadow-lg"
        style={{
          background: 'linear-gradient(90deg, #0f2027, #203a43, #2c5364)',
          borderBottom: '2px solid #00c6ff'
        }}
      >
        <h1 className="fw-bold fs-4 mb-0 text-info text-uppercase tracking-wide">
          🚪 Gate Pass Management System
        </h1>

        {user && (
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div className="fw-semibold">{user.fullName}</div>
              <div className="small text-info">{user.role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="btn btn-outline-info btn-sm rounded-pill px-3"
            >
              Logout
            </button>
          </div>
        )}
      </header>

      {/* 🔥 MAIN CONTENT */}
      <main
        className="flex-grow-1 d-flex align-items-center"
        style={{
          background: 'linear-gradient(135deg, #141e30, #243b55)',
          paddingTop: '40px',
          paddingBottom: '40px'
        }}
      >
        <div
          className="container p-4 rounded-4 shadow-lg"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
        >
          {children}
        </div>
      </main>

      {/* 🔥 FOOTER */}
      <footer
        className="text-center py-3 small"
        style={{
          background: '#0f2027',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          color: '#aaa'
        }}
      >
        ⚙ Steel Factory Gate Pass Workflow:
        <span className="text-info fw-semibold">
          {' '}Client → Store → Director → Security
        </span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
              background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
            }}
          >
            <LoginPage />
          </div>
        }
      />

      <Route
        path="/register"
        element={
          <div
            className="min-vh-100 d-flex align-items-center justify-content-center"
            style={{
              background: 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
            }}
          >
            <RegisterPage />
          </div>
        }
      />

      <Route
        path="/client/*"
        element={
          <ProtectedRoute roles={['CLIENT']}>
            <Layout>
              <ClientDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/store/*"
        element={
          <ProtectedRoute roles={['STORE_MANAGER']}>
            <Layout>
              <StoreDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/director/*"
        element={
          <ProtectedRoute roles={['DIRECTOR']}>
            <Layout>
              <DirectorDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/security/*"
        element={
          <ProtectedRoute roles={['SECURITY']}>
            <Layout>
              <SecurityDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute roles={['ADMIN']}>
            <Layout>
              <AdminDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/gatepasses/:id"
        element={
          <ProtectedRoute roles={['CLIENT', 'STORE_MANAGER', 'DIRECTOR', 'SECURITY']}>
            <Layout>
              <GatePassDetail />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          <Layout>
            <Landing />
          </Layout>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function Landing() {
  const user = getCurrentUser();

  if (user) {
    if (user.role === 'CLIENT') return <Navigate to="/client" replace />;
    if (user.role === 'STORE_MANAGER') return <Navigate to="/store" replace />;
    if (user.role === 'DIRECTOR') return <Navigate to="/director" replace />;
    if (user.role === 'SECURITY') return <Navigate to="/security" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin" replace />;
  }

  return (
    <div className="text-center text-light" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2 className="display-5 fw-bold mb-4 text-info">
        🚀 Smart Gate Pass Control System
      </h2>

      <p className="lead mb-4 text-light">
        A secure, role-based digital workflow designed for industrial
        environments. Manage approvals seamlessly from
        <span className="text-info fw-semibold"> Client → Store → Director → Security</span>.
      </p>

      <p className="small text-secondary mb-4">
        New users must register first before logging in.
      </p>

      <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
        <Link to="/register" className="btn btn-info btn-lg px-4 rounded-pill shadow">
          Register
        </Link>
        <Link to="/login" className="btn btn-outline-light btn-lg px-4 rounded-pill">
          Login
        </Link>
      </div>
    </div>
  );
}

export default App;