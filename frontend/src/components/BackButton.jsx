import React from "react";
import { useHistory } from "react-router-dom";

const BackButton = () => {
  const history = useHistory();

  return (
    <div className="mb-3">
      <button
        className="btn btn-secondary w-100 w-md-auto"
        onClick={() => history.goBack()}
      >
        Back
      </button>
    </div>
  );
};

export default BackButton