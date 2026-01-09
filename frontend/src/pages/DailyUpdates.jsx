const DailyUpdates = () => {
  return (
    <div className="container-fluid px-2 px-md-4">
      <h4 className="fw-bold mb-3">Daily Updates</h4>

      {/* Employee Section */}
      <div className="card p-3 p-md-4 mb-3">
        <h6>Submit Daily Update</h6>

        <textarea
          className="form-control mb-2"
          placeholder="What did you work on today?"
          rows="4"
        />

        <button className="btn btn-primary btn-sm w-100 w-md-auto">
          Submit
        </button>
      </div>

      {/* Admin Section */}
      <div className="card p-3 p-md-4">
        <h6>Employee Updates</h6>
        <p className="text-muted small mb-0">
          No updates yet
        </p>
      </div>
    </div>
  );
};

export default DailyUpdates;