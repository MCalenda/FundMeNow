import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

import ProgressBar from "react-bootstrap/ProgressBar";


export default function CardProject(props) {
  const progress = props.project.balance / props.project.target;

  function fundProject() {
    console.log("You clicked submit.", props.project.id);
  }

  return (
    <div className="card" style={{ width: "18 em", textAlign: "center" }}>
      <div className="card-body">
        <h5 className="card-title">{props.project.name}</h5>
        <p className="card-text">{props.project.description}</p>
        <Button onClick={fundProject} className="btn btn-primary">
          FundMeNow
        </Button>
      </div>
      <ProgressBar animated now={progress} label={`${progress}%`} />
    </div>
  );
}
