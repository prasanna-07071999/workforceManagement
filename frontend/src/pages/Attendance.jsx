import BackButton from "../components/BackButton";

const Attendance = () => {
  return (
    <div className="container-fluid px-2 px-md-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-3">Attendance</h4>
        <BackButton />
      </div>
    
      <div className="card p-3 p-md-4 mb-3">
        <h6>Today’s Status</h6>
        <p className="text-muted">Not marked yet</p>

        <div className="d-flex flex-column flex-md-row gap-2">
          <button className="btn btn-primary btn-sm w-100 w-md-auto">
            Check In
          </button>

          <button className="btn btn-outline-secondary btn-sm w-100 w-md-auto">
            Check Out
          </button>
        </div>
      </div>

      <div className="card p-3 p-md-4">
        <h6>Attendance History</h6>
        <p className="text-muted small mb-0">
          Coming soon
        </p>
      </div>
    </div>
  );
};

export default Attendance;