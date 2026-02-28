import React, { useEffect, useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';

const EMPTY_MATERIAL_ITEM = {
  itemId: '',
  itemName: '',
  quantity: '',
  unitOfMeasurement: '',
};

const EMPTY_EMPLOYEE = {
  employeeId: '',
  fullName: '',
  gender: 'MALE',
  position: '',
  timeDuration: '',
};

function ClientDashboard() {
  const [tab, setTab] = useState('list');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [type, setType] = useState('MATERIAL');
  const [requestType, setRequestType] = useState('NON_RETURNABLE');
  const [gatePassDate, setGatePassDate] = useState('');
  const [destination, setDestination] = useState('');
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState('');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [materialItems, setMaterialItems] = useState([EMPTY_MATERIAL_ITEM]);
  const [employees, setEmployees] = useState([EMPTY_EMPLOYEE]);
  const [submitting, setSubmitting] = useState(false);

  const loadRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/gatepasses/mine');
      setRequests(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleMaterialItemChange = (index, field, value) => {
    setMaterialItems((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleEmployeeChange = (index, field, value) => {
    setEmployees((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addMaterialRow = () => {
    setMaterialItems((prev) => [...prev, EMPTY_MATERIAL_ITEM]);
  };

  const addEmployeeRow = () => {
    setEmployees((prev) => [...prev, EMPTY_EMPLOYEE]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        type,
        requestType,
        gatePassDate,
        destination,
        vehiclePlateNumber,
      };

      if (type === 'MATERIAL') {
        payload.expectedReturnDate = requestType === 'RETURNABLE' ? expectedReturnDate : null;
        payload.materialItems = materialItems.filter(
          (m) => m.itemId && m.itemName && m.quantity && m.unitOfMeasurement
        );
      } else {
        payload.numberOfEmployees = employees.length;
        payload.hrEmployees = employees.filter(
          (eRow) =>
            eRow.employeeId && eRow.fullName && eRow.gender && eRow.position && eRow.timeDuration
        );
        payload.timeDuration = employees[0]?.timeDuration || '';
      }

      await api.post('/gatepasses', payload);

      setType('MATERIAL');
      setRequestType('NON_RETURNABLE');
      setGatePassDate('');
      setDestination('');
      setVehiclePlateNumber('');
      setExpectedReturnDate('');
      setMaterialItems([EMPTY_MATERIAL_ITEM]);
      setEmployees([EMPTY_EMPLOYEE]);

      await loadRequests();
      setTab('list');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="h5 fw-semibold mb-0">Client Gate Pass Requests</h2>
        <div className="btn-group" role="group">
          <button
            type="button"
            className={`btn btn-sm ${tab === 'list' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setTab('list')}
          >
            My Requests
          </button>
          <button
            type="button"
            className={`btn btn-sm ${tab === 'new' ? 'btn-dark' : 'btn-outline-secondary'}`}
            onClick={() => setTab('new')}
          >
            New Request
          </button>
        </div>
      </div>

      {tab === 'list' && (
        <div className="card shadow-sm">
          <div className="card-body">
            {loading && <div className="small text-muted">Loading...</div>}
            {error && <div className="small text-danger mb-2">{error}</div>}
            {!loading && !requests.length && (
              <div className="small text-muted">No requests yet. Create your first one.</div>
            )}
            {requests.length > 0 && (
              <div className="table-responsive">
                <table className="table table-sm table-hover small">
                  <thead className="table-light">
                    <tr>
                      <th>ID</th>
                      <th>Type</th>
                      <th>Date</th>
                      <th>Destination</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.type}</td>
                        <td>{r.gate_pass_date}</td>
                        <td>{r.destination}</td>
                        <td>
                          <span className="badge bg-secondary">{r.status}</span>
                        </td>
                        <td>
                          <Link to={`/gatepasses/${r.id}`} className="text-decoration-underline">
                            View
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'new' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <h3 className="h6 fw-medium mb-3">New Gate Pass Request</h3>
            {error && <div className="small text-danger mb-2">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-medium">Request Category</label>
                  <select
                    className="form-select form-select-sm"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                  >
                    <option value="MATERIAL">Material Request</option>
                    <option value="HUMAN_RESOURCE">Human Resource Request</option>
                  </select>
                </div>

                {type === 'MATERIAL' && (
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Request Type</label>
                    <select
                      className="form-select form-select-sm"
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                    >
                      <option value="NON_RETURNABLE">Non-Returnable</option>
                      <option value="RETURNABLE">Returnable</option>
                    </select>
                  </div>
                )}

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Gate Pass Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={gatePassDate}
                    onChange={(e) => setGatePassDate(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Destination</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-medium">Vehicle Plate Number</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={vehiclePlateNumber}
                    onChange={(e) => setVehiclePlateNumber(e.target.value)}
                  />
                </div>

                {type === 'MATERIAL' && requestType === 'RETURNABLE' && (
                  <div className="col-md-6">
                    <label className="form-label small fw-medium">Expected Return Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={expectedReturnDate}
                      onChange={(e) => setExpectedReturnDate(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>

              {type === 'MATERIAL' && (
                <div className="mb-3">
                  <h4 className="small fw-semibold mb-2">Material Items</h4>
                  <div className="d-flex flex-column gap-2">
                    {materialItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="row g-2 align-items-end border rounded p-2"
                      >
                        <div className="col-md-3">
                          <input
                            type="text"
                            placeholder="Item ID"
                            className="form-control form-control-sm"
                            value={item.itemId}
                            onChange={(e) =>
                              handleMaterialItemChange(idx, 'itemId', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-3">
                          <input
                            type="text"
                            placeholder="Item Name"
                            className="form-control form-control-sm"
                            value={item.itemName}
                            onChange={(e) =>
                              handleMaterialItemChange(idx, 'itemName', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="number"
                            placeholder="Quantity"
                            className="form-control form-control-sm"
                            value={item.quantity}
                            onChange={(e) =>
                              handleMaterialItemChange(idx, 'quantity', e.target.value)
                            }
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            placeholder="Unit"
                            className="form-control form-control-sm"
                            value={item.unitOfMeasurement}
                            onChange={(e) =>
                              handleMaterialItemChange(idx, 'unitOfMeasurement', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addMaterialRow}
                    className="btn btn-link btn-sm p-0 mt-2 text-decoration-underline"
                  >
                    + Add another item
                  </button>
                </div>
              )}

              {type === 'HUMAN_RESOURCE' && (
                <div className="mb-3">
                  <h4 className="small fw-semibold mb-2">Employees</h4>
                  <div className="d-flex flex-column gap-2">
                    {employees.map((emp, idx) => (
                      <div
                        key={idx}
                        className="row g-2 align-items-end border rounded p-2"
                      >
                        <div className="col-md-2">
                          <input
                            type="text"
                            placeholder="Employee ID"
                            className="form-control form-control-sm"
                            value={emp.employeeId}
                            onChange={(e) => handleEmployeeChange(idx, 'employeeId', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            className="form-control form-control-sm"
                            value={emp.fullName}
                            onChange={(e) => handleEmployeeChange(idx, 'fullName', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <select
                            className="form-select form-select-sm"
                            value={emp.gender}
                            onChange={(e) => handleEmployeeChange(idx, 'gender', e.target.value)}
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            placeholder="Position"
                            className="form-control form-control-sm"
                            value={emp.position}
                            onChange={(e) => handleEmployeeChange(idx, 'position', e.target.value)}
                          />
                        </div>
                        <div className="col-md-2">
                          <input
                            type="text"
                            placeholder="Time Duration"
                            className="form-control form-control-sm"
                            value={emp.timeDuration}
                            onChange={(e) =>
                              handleEmployeeChange(idx, 'timeDuration', e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addEmployeeRow}
                    className="btn btn-link btn-sm p-0 mt-2 text-decoration-underline"
                  >
                    + Add another employee
                  </button>
                </div>
              )}

              <div className="d-flex justify-content-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-dark btn-sm"
                >
                  {submitting ? 'Submitting...' : 'Submit for Store Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ClientDashboard;

