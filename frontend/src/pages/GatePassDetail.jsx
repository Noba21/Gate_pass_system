import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

function GatePassDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [detailRes, historyRes] = await Promise.all([
        api.get(`/gatepasses/${id}`),
        api.get(`/gatepasses/${id}/history`),
      ]);
      setData(detailRes.data);
      setHistory(historyRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load gate pass');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  if (loading) {
    return <div className="small text-muted">Loading...</div>;
  }

  if (error) {
    return <div className="small text-danger">{error}</div>;
  }

  if (!data) {
    return null;
  }

  const { gatePass, materialItems, hrEmployees } = data;

  return (
    <div className="d-flex flex-column gap-4">
      <div className="card shadow-sm">
        <div className="card-body">
          <h2 className="h5 fw-semibold mb-3">
            Gate Pass #{gatePass.id} - {gatePass.type}
          </h2>
          <div className="row small">
            <div className="col-md-6">
              <div className="mb-1">
                <span className="fw-medium">Status:</span>{' '}
                <span className="badge bg-secondary">{gatePass.status}</span>
              </div>
              <div className="mb-1">
                <span className="fw-medium">Gate Pass Date:</span> {gatePass.gate_pass_date}
              </div>
              <div className="mb-1">
                <span className="fw-medium">Destination:</span> {gatePass.destination}
              </div>
              <div className="mb-1">
                <span className="fw-medium">Vehicle Plate:</span>{' '}
                {gatePass.vehicle_plate_number || '-'}
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-1">
                <span className="fw-medium">Client:</span> {gatePass.client_name}
              </div>
              <div className="mb-1">
                <span className="fw-medium">Returnable:</span>{' '}
                {gatePass.is_returnable ? 'Yes' : 'No'}
              </div>
              {gatePass.is_returnable ? (
                <>
                  <div className="mb-1">
                    <span className="fw-medium">Expected Return Date:</span>{' '}
                    {gatePass.expected_return_date || '-'}
                  </div>
                  <div className="mb-1">
                    <span className="fw-medium">Return Status:</span> {gatePass.return_status}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {gatePass.type === 'MATERIAL' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="h6 fw-semibold mb-2">Material Items</h3>
            {!materialItems.length && (
              <div className="small text-muted">No material items recorded.</div>
            )}
            {materialItems.length > 0 && (
              <div className="table-responsive">
                <table className="table table-sm small">
                  <thead className="table-light">
                    <tr>
                      <th>Item ID</th>
                      <th>Name</th>
                      <th>Quantity</th>
                      <th>Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {materialItems.map((m) => (
                      <tr key={m.id}>
                        <td>{m.item_id}</td>
                        <td>{m.item_name}</td>
                        <td>{m.quantity}</td>
                        <td>{m.unit_of_measurement}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {gatePass.type === 'HUMAN_RESOURCE' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="h6 fw-semibold mb-2">Employees</h3>
            {!hrEmployees.length && (
              <div className="small text-muted">No employees recorded.</div>
            )}
            {hrEmployees.length > 0 && (
              <div className="table-responsive">
                <table className="table table-sm small">
                  <thead className="table-light">
                    <tr>
                      <th>Employee ID</th>
                      <th>Full Name</th>
                      <th>Gender</th>
                      <th>Position</th>
                      <th>Time Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {hrEmployees.map((e) => (
                      <tr key={e.id}>
                        <td>{e.employee_id}</td>
                        <td>{e.full_name}</td>
                        <td>{e.gender}</td>
                        <td>{e.position}</td>
                        <td>{e.time_duration}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card shadow-sm">
        <div className="card-body">
          <h3 className="h6 fw-semibold mb-2">Status History (Audit Trail)</h3>
          {!history.length && (
            <div className="small text-muted">No history entries recorded.</div>
          )}
          {history.length > 0 && (
            <ul className="list-unstyled border-start border-2 ps-3 small">
              {history.map((h) => (
                <li key={h.id} className="mb-3 position-relative">
                  <span className="rounded-circle bg-secondary position-absolute" style={{ width: '0.5rem', height: '0.5rem', left: '-0.29rem', top: '0.35rem' }} />
                  <span className="text-muted d-block">
                    {new Date(h.created_at).toLocaleString()}
                  </span>
                  <span className="fw-medium">
                    {h.from_status || 'NEW'} → {h.to_status}
                  </span>
                  <div className="text-secondary">
                    By: {h.actor_name || 'System'} {h.note ? `• ${h.note}` : ''}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default GatePassDetail;

