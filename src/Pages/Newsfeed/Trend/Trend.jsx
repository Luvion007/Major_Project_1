import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Image,
} from "react-bootstrap";
import React, { useState, useEffect } from "react";
import { PostsAPI } from "./Posts";
import useTimestampFormat from "../../../Hook/useTimeStampFormat";
import { useNavigate } from "react-router-dom";
import {
  projectAuth,
  firebase,
  projectFirebase,
} from "../../../firebase/config";
import { useFirestore } from "../../../Hook/useFirestore";

export default function Trend() {
  const navigate = useNavigate();
  const [postList, setPostList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { formatTimestamp } = useTimestampFormat();
  const { updateDocument } = useFirestore("MediaPost");

  //handle View
  // Handle view function
  const handleView = (e, id) => {
    e.preventDefault();
    const userId = projectAuth.currentUser.uid;
    const userViewedField = `views.${userId}`;
    const docRef = projectFirebase.collection("MediaPost").doc(id);

    docRef
      .get()
      .then((doc) => {
        if (doc.exists) {
          const data = doc.data();
          if (!data.views || !data.views[userId]) {
            updateDocument(id, {
              [userViewedField]: true,
              viewsBy: firebase.firestore.FieldValue.arrayUnion(userId),
              view: firebase.firestore.FieldValue.increment(1),
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error handling view:", error);
      });
  };

  useEffect(() => {
    const fetchTrendingPosts = async () => {
      try {
        const trendingPosts = await PostsAPI.getTrendingPosts(10);
        const filteredPosts = trendingPosts.filter(
          (post) =>
            post.imagePath?.[0]?.includes("image") ||
            post.imagePath?.[0]?.includes("video")
        );
        setPostList(filteredPosts);
        console.log(postList);
        setLoading(false); // Set loading to false after successful fetch
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false); // Set loading to false even if there's an error
      }
    };

    fetchTrendingPosts();

    // Set up interval for periodic updates
    const intervalId = setInterval(fetchTrendingPosts, 5 * 60 * 1000);

    // Cleanup function to clear interval when component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array for running effect only once on mount

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <Spinner animation="border" role="status" variant="primary">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">Error: {error}</Alert>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
      </Row>

      <Row xs={2} lg={2} md={2} className="g-4">
        {postList?.slice(0, 1).map((post) => (
          <>
          <Col lg={6} md={6}>
          <Image
                  variant="top"
                  style={{
                    width: "100%",
                    height: "700px",
                    objectFit: "cover",
                    backgroundColor: "#000000",
                    padding: "0px",
                  }}
                  onClick={(e) => {
                    handleView(e, post.id);
                  }}
                  src={require("../../../assets/Trending.jpg")}
                  alt={`Post ${post.id}`}
                />
          
        </Col>
          <Col lg={6} md={6} key={post.id}>
            {post.imagePath?.[0]?.includes("image") ? (
                <div
                  role="button"
                  onClick={() => navigate(`/post/${post.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <Image
                    variant="top"
                    style={{
                      width: "100%",
                      height: "700px",
                      objectFit: "cover",
                      backgroundColor: "#000000",
                      padding: "0px",
                    }}
                    onClick={(e) => {
                      handleView(e, post.id);
                    }}
                    src={post.imageURL?.slice(0, 1)}
                    alt={`Post ${post.id}`}
                  />
                </div>
            ) : (
            <Card className="pt-5">
              <video
      
                onClick={(e) => {
                  navigate(`/post/${post.id}`);
                  handleView(e, post.id);
                }}
                style={{
                  width: "100%",
                  height: "700px",
                  objectFit: "cover",
                  backgroundColor: "#000000",
                  cursor: "pointer",
                }}
              >
                <source src={post.imageURL?.[0]} type="video/mp4" />
                <source src={post.imageURL?.[0]} type="video/ogg" />
                <source src={post.imageURL?.[0]} type="video/webm" />
                Your browser doesn't support this video tag.
              </video>
              </Card>
             
            )}
          </Col>
          </>
        ))}
      </Row>

      <Row xs={3} lg={3} md={3} className="g-4">
        {postList?.slice(1, 10).map((post) => (
          <Col key={post.id}>
            {post.imagePath?.[0]?.includes("image") ? (
              <div
                role="button"
                onClick={() => navigate(`/post/${post.id}`)}
                style={{ cursor: "pointer" }}
              >
                <Image
                  variant="top"
                  style={{
                    marginTop: "10px",
                    width: "100%",
                    height: "700px",
                    objectFit: "cover",
                    backgroundColor: "#000000",
                  }}
                  src={post.imageURL?.slice(0, 1)}
                  alt={`Post ${post.id}`}
                  onClick={(e) => {
                    handleView(e, post.id);
                  }}
                />
              </div>
            ) : (
              <video
                onClick={(e) => {
                  navigate(`/post/${post.id}`);
                  handleView(e, post.id);
                }}
                style={{
                  marginTop: "10px",
                  width: "100%",
                  height: "700px",
                  objectFit: "cover",
                  backgroundColor: "#000000",
                  cursor: "pointer",
                }}
                controls
              >
                <source src={post.imageURL?.[0]} type="video/mp4" />
                <source src={post.imageURL?.[0]} type="video/ogg" />
                <source src={post.imageURL?.[0]} type="video/webm" />
                Your browser doesn't support this video tag.
              </video>
            )}
          </Col>
        ))}
      </Row>
    </Container>
  );
}
