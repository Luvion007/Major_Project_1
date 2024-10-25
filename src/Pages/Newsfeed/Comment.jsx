import React, { Children } from "react";
import { useState } from "react";
import { timestamp, firebase, projectAuth, projectFirebase} from "../../firebase/config.js";
import { useAuthContext } from "../../Hook/useAuthContext";
import useTimestampFormat from "../../Hook/useTimeStampFormat";
import { useFirestore } from "../../Hook/useFirestore";
import { Button, Form } from "react-bootstrap";
import TruncateDescription from "../../Components/TruncateDescription.jsx";

//css styling
import "./Comment.scss";

export default function Comment({ input }) {
  const { updateDocument, deleteDocument, response } = useFirestore("MediaPost");
  const { formatTimestamp } = useTimestampFormat();
  const [newComment, setNewComment] = useState("");
  const { user } = useAuthContext();


  const truncateDescription = (description, wordLimit) => {
    const words = description.split(" ");
    if (words.length > wordLimit) {
      return (
        <>
          {words.slice(0, wordLimit).join(" ")}...
          <span
            style={{ color: "#800000 ", cursor: "pointer" }}
          >
            Read more
          </span>
        </>
      );
    }
    return <>{description}</>;
  };


  const handleLike = async (e, postId, commentId) => {
    e.preventDefault();
    const userId = projectAuth.currentUser.uid;
    const docRef = projectFirebase.collection("MediaPost").doc(postId);
  
    try {
      // Get the current document
      const doc = await docRef.get();
      if (!doc.exists) {
        console.error("Document does not exist");
        return;
      }
  
      // Get the current comments array
      const data = doc.data();
      const comments = data.comment ? [...data.comment] : [];
      console.log(comments)

      
      // Find the specific comment that match the comment.id
      const commentIndex = comments.findIndex(comment => comment.id === commentId);
      if (commentIndex === -1) {
        console.error("Comment not found");
        return;
      }
  
      // Initialize likes object if it doesn't exist
      if (!comments[commentIndex].likes) {
        comments[commentIndex].likes = {};
      }
  
      // Toggle like status and update like count
      if (comments[commentIndex].likes[userId]) {
        // Unlike: Remove user from likes and decrease count
        delete comments[commentIndex].likes[userId];
        comments[commentIndex].like = (comments[commentIndex].like || 0) - 1;
      } else {
        // Like: Add user to likes and increase count
        comments[commentIndex].likes[userId] = true;
        comments[commentIndex].like = (comments[commentIndex].like || 0) + 1;
      }
  
      // Update the document with the modified comments array
      await docRef.update({
        comment: comments
      });
  
    } catch (error) {
      console.error("Error handling like:", error);
    }
  };
  const handleComment = async (e) => {
    e.preventDefault();
    const commentInput = {
      displayName: user.displayName,
      photoURL: user.photoURL,
      content: newComment,
      createdAt: timestamp.fromDate(new Date()),
      id: Math.random(),
      like: 0,
      likes: {},
      uid: user.uid
    };
    await updateDocument(input.id, {
      comment: [...input.comment, commentInput],
    });
    if (!response.error) {
      setNewComment("");
    }
  };

  return (
    <div>
          <Form onSubmit={handleComment}  className="d-block align-items-center mb-2">
            <Form.Group>
              <Form.Control
                as="textarea"
                rows={2}
                type="text"
                required
                onChange={(e) => setNewComment(e.target.value)}
                value={newComment}
                placeholder="add new comment..."
              />
            </Form.Group>
        
            <Button className="custom-button mt-2" type="submit">Submit</Button>
          </Form>

      <h4>Comment</h4>
      <ul className="comment-list">
        {input.comment.length > 0 &&
          input.comment.map((comment) => {
            return (
              <li key={comment.id}>
                <div className="d-flex align-items-center">
                  <img
                    src={comment.photoURL}
                    alt="User Avatar"
                    className="rounded-circle me-2"
                    style={{
                      width: "40px",
                      height: "40px",
                      cursor: "pointer",
                      objectFit: "cover",
                    }}
                  />
                  <p className="mb-0">{comment.displayName}</p>
                </div>
                <div>
                </div>
                <div className="mt-2 mb-2"> 
                  <TruncateDescription
                  description={comment.content}
                  wordLimit={20}/>
                  
                </div>

                   {/* Like */}
                <div className="d-flex gap-2 mb-3">
                {comment.likes && comment.likes[projectAuth.currentUser.uid] ? (
                  <div className="me-1">
                    <i
                      className="bi bi-heart-fill me-2"
                      as={Button}
                      onClick={(e) => handleLike(e, input.id, comment.id)}
                    />
                    <span>{comment.like} </span>
                  </div>
                ) : (
                  <div className="me-1">
                    <i
                      className="bi bi-heart me-2"
                      as={Button}
                      onClick={(e) => handleLike(e, input.id, comment.id)}
                    />
                    <span>{comment.like}</span>
                  </div>
                )}
                </div>
                <p className="mb-2">{formatTimestamp(comment.createdAt)}</p>
                <hr/>

              </li>
            );
          })}
      </ul>
    </div>
  );
}
