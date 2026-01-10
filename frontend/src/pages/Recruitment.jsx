import BackButton from "../components/BackButton";

const Recruitment = () => {
  return (
    <div className="container-fluid px-2 px-md-4">
       <div className="d-flex justify-content-between align-items-center mb-3">
              <h4 className="fw-bold mb-3">Recruitment</h4>
              <BackButton />
        </div>

      <div className="card p-3 p-md-4 mb-3">
        <h6>Create Job Posting</h6>
        <input
          className="form-control mb-2"
          placeholder="Job title"
        />
        <button className="btn btn-primary btn-sm w-100 w-md-auto">
          Post Job
        </button>
      </div>

      <div className="card p-3 p-md-4">
        <h6>Applicants</h6>
        <p className="text-muted small mb-0">
          No candidates yet
        </p>
      </div>
    </div>
  );
};

export default Recruitment
