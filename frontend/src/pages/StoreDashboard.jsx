import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

function StoreDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [noteById, setNoteById] = useState({});

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/gatepasses/store/pending');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pending requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const note = noteById[id] || '';
      if (action === 'verify') {
        await api.post(`/gatepasses/store/${id}/verify`, { note });
      } else {
        await api.post(`/gatepasses/store/${id}/reject`, { note });
      }
      await loadRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update request');
    }
  };

  return (
    <div>
      <h2 className="h5 fw-semibold mb-4">Store Manager - Pending Verification</h2>
      <div className="card shadow-sm">
        <div className="card-body">
          {loading && <div className="small text-muted">Loading...</div>}
          {error && <div className="small text-danger mb-2">{error}</div>}
          {!loading && !requests.length && (
            <div className="small text-muted">No pending requests.</div>
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
                  View full details
                </Link>
              </div>
              <div className="flex-grow-1 flex-md-grow-0" style={{ maxWidth: '20rem' }}>
                <textarea
                  className="form-control form-control-sm mb-2"
                  rows={2}
                  placeholder="Verification note"
                  value={noteById[r.id] || ''}
                  onChange={(e) =>
                    setNoteById((prev) => ({
                      ...prev,
                      [r.id]: e.target.value,
                    }))
                  }
                />
                <div className="d-flex gap-2 justify-content-end">
                  <button
                    type="button"
                    onClick={() => handleAction(r.id, 'reject')}
                    className="btn btn-outline-danger btn-sm"
                  >
                    Reject
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAction(r.id, 'verify')}
                    className="btn btn-success btn-sm"
                  >
                    Verify
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StoreDashboard;

