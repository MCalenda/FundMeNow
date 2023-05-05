import Button from "react-bootstrap/Button";
import Badge from "react-bootstrap/Badge";

export default function CardProject(props) {
  return (
    <div className="card" style={{ width: "18 em", textAlign: "center" }}>
      <div className="card-body">
        <h5 className="card-title">{props.pokemonName}</h5>
        <p className="card-text">{props.pokemonHP}</p>
        <a href="#" className="btn btn-primary">
          View specs
        </a>
      </div>
      <Button variant="primary">
        Profile <Badge bg="secondary">9</Badge>
        <span className="visually-hidden">unread messages</span>
      </Button>
    </div>
  );
}
