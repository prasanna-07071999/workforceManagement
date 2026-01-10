import BackButton from "../components/BackButton";

const Leaves = () => {
  return (
    <div className="container-fluid px-2 px-md-4">
       <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">Leave Management</h4>
        <BackButton />
      </div>

      <div className="card p-3 p-md-4 mb-3">
        <h6>Apply Leave</h6>

        <input
          type="date"
          className="form-control mb-2"
        />

        <input
          type="date"
          className="form-control mb-2"
        />

        <textarea
          className="form-control mb-2"
          placeholder="Reason"
          rows="3"
        ></textarea>

        <button className="btn btn-primary btn-sm w-100 w-md-auto">
          Apply
        </button>
      </div>

      <div className="card p-3 p-md-4">
        <h6>My Leave Requests</h6>
        <p className="text-muted small mb-0">
          No leave requests
        </p>
      </div>
    </div>
  );
};

export default Leaves;
