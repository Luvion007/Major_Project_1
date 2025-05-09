import React from "react";
import { Container, Navbar, Nav, Button, Dropdown} from "react-bootstrap";
import {Link} from 'react-router-dom';
import './NavBar.scss'
import {useLogout} from '../Hook/useLogout'
import { useAuthContext } from "../Hook/useAuthContext";
import { useNavigate } from "react-router-dom";


export default function NavBar() {
  const {logout, isPending} = useLogout()
  const { user } = useAuthContext()
  const navigate = useNavigate() 

  
  return (
    <div>
      <Container fluid>
        <Navbar bg="light" expand="lg" fixed="top" className="py-1 shadow-sm "> 
          <Container>
            <Navbar.Brand>
              <img 
                src={require(`../assets/Asset1.png`)} 
                alt="Logo" 
                onClick={() => navigate('/newsfeed')}
                style={{
                  cursor: "pointer"
                }}
                
              />
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse
              className="justify-content-end"
              id="basic-navbar-nav"
            >
              <Nav>
                <Nav.Link as={Link} to="/newsfeed">Newsfeed</Nav.Link>
                <Nav.Link as={Link} to="/news">News</Nav.Link>
                <Nav.Link as={Link} to="/job">Job</Nav.Link>
                <Nav.Link as={Link} to="/events">Events</Nav.Link>
                <Nav.Link as={Link} to="/pricing">Pricing</Nav.Link>
              </Nav>
              <Nav>
                {user && (
                  <div>
                    <Dropdown>
                      <Dropdown.Toggle
                        as="div"
                        id="avatar-dropdown"
                        className="d-flex align-items-center"
                      >
                        <img
                          src={user.photoURL || `https://placehold.co/40x40`}
                          alt="User Avatar"
                          className="ms-2 rounded-circle"
                          style={{
                            width: "40px",
                            height: "40px",
                            cursor: "pointer",
                            objectFit: "cover"
                          }}
                        />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        <Dropdown.Item as={Link} to={`/profile/${user.uid}`} style={{
                          fontWeight: "bold",
                          textTransform: "uppercase"
                        }}>{user.displayName}</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to={`/setting/${user.uid}`}>Setting</Dropdown.Item>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Button} onClick={logout}>
                          Sign Out
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                )}
                {!user && (
                  <div>
                    <Link to="/login">
                      <Button className="custom-button-nav">Login</Button>
                    </Link>
                    <Link to="/signup">
                      <Button className="custom-button-nav">Sign up</Button>
                    </Link>
                  </div>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </Container>
    </div>
  );
}




