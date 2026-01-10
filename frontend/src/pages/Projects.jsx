import BackButton from "../components/BackButton";

const Projects = () => {
  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
             <h4 className="fw-bold mb-3">Projects</h4>
             <BackButton />
      </div>
      <div className="card p-3 mb-3">
        <h6>Create Project</h6>
        <input className="form-control mb-2" placeholder="Project name" />
        <button className="btn btn-primary btn-sm">Create</button>
      </div>

      <div className="card p-3">
        <h6>All Projects</h6>
        <p className="text-muted small">No projects yet</p>
      </div>
    </div>
  );
};

export default Projects;
