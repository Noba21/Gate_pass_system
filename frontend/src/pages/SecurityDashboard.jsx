import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function SecurityDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/gatepasses/security/pending');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load approved requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      if (action === 'exit') {
        await api.post(`/gatepasses/security/${id}/exit`, {});
      } else {
        await api.post(`/gatepasses/security/${id}/return`, {});
      }
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    }
  };

  return (
    <div>
      <h2 className="h5 fw-semibold mb-4">Security - Approved Gate Passes</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {loading && <div className="small text-muted">Loading...</div>}
          {error && <div className="small text-danger mb-2">{error}</div>}
          {!loading && !requests.length && (
            <div className="small text-muted">No approved gate passes awaiting exit/return.</div>
          )}
          {requests.map((r) => (
            <div
              key={r.id}
              className="border rounded mb-3 p-3 d-flex flex-column flex-md-row align-items-md-center justify-content-md-between gap-2"
            >
              <div className="small">
                <div className="fw-medium">
                  #{r.id} • {r.type} • {r.destination}
                </div>
                <div className="text-muted">
                  Date: {r.gate_pass_date} • Client: {r.client_name}
                </div>
                <Link
                  to={`/gatepasses/${r.id}`}
                  className="text-decoration-underline mt-1 d-inline-block"
                >
                  View full details & history
                </Link>
              </div>
              <div className="d-flex gap-2 justify-content-end">
                <button
                  type="button"
                  onClick={() => handleAction(r.id, 'exit')}
                  className="btn btn-dark btn-sm"
                >
                  Mark Exited
                </button>
                <button
                  type="button"
                  onClick={() => handleAction(r.id, 'return')}
                  className="btn btn-outline-success btn-sm"
                >
                  Mark Returned
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SecurityDashboard;

