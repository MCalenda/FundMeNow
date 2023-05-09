import { Navbar, Button, Image, Container } from "react-bootstrap";

export default function Header(props) {
  return (
    <Navbar
      className="dflex flex-column flex-sm-row justify-content-evenly align-items-center py-3 px-5 text-light shadow sticky-top"
      expand="lg"
      bg="dark"
      variant="dark"
    >
      <div className="d-flex align-items-center">
        <Image
          src={`https://picsum.photos/seed/${props.currentAccount}/360/360`}
          roundedCircle
          className="shadow border border-light"
          style={{ maxWidth: "75px" }}
        />
        <div className="d-flex flex-column ms-4">
          <span>Connected as:</span>
          <div>
            <span className="fw-bold text-warning">
              {props.currentAccount.substring(1, 8) +
                "..." +
                props.currentAccount.substring(
                  props.currentAccount.length - 8,
                  props.currentAccount.length
                )}
            </span>
            <i
              role="button"
              onClick={() =>
                navigator.clipboard.writeText(props.currentAccount)
              }
              className="fa-duotone fa-copy ms-2"
              style={{ color: "var(--bs-warning)" }}
            />
          </div>
        </div>
      </div>
      <Button className="mt-sm-0 mt-4" onClick={props.showCreateProject}>
        <span className="me-2">Create Project</span>
        <i className="fa-duotone fa-plus"></i>
      </Button>
    </Navbar>
  );
}
