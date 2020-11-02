import {
  Avatar,
  Checkbox,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Zoom,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { db } from "./firebaseConfig";
import "./Post.css";
import firebase from "firebase";
import { FavoriteBorderSharp, FavoriteSharp } from "@material-ui/icons";
import CloseIcon from "@material-ui/icons/Close";
import CloseSharpIcon from "@material-ui/icons/CloseSharp";

const Post = ({
  activeUser,
  postId,
  username,
  caption,
  imageUrl,
  triggerSignInDialog,
  postTimestamp,
}) => {
  //initializing state of comments array
  const [comments, setComments] = useState([]);
  //initializing state of a particular comment
  const [comment, setComment] = useState("");

  //array of liked users documents {id, username, timestamp}
  const [likes, setLikes] = useState([]);

  //initializing state of a particular user document id of likes array of documents
  const [likedDocumentId, setLikedDocumentId] = useState(null);

  //initializing state of list of users who liked a post
  const [likedUsersDialog, setLikedUsersDialog] = useState(false);

  //initializing state for like icon transition effect on double tap
  const [checked, setChecked] = React.useState(false);

  //fires every time the comments list changes
  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("likes")
        .orderBy("timestamp", "desc")
        .onSnapshot((snapshot) => {
          setLikes(snapshot.docs.map((doc) => doc.data()));
        });
    }
    return () => {
      unsubscribe();
    };
  }, [postId]); //also fires for every update in posts array wrt postID

  //fires every time the comments list changes
  useEffect(() => {
    let unsubscribe;
    if (postId) {
      unsubscribe = db
        .collection("posts")
        .doc(postId)
        .collection("comments")
        .orderBy("timestamp", "asc")

        //for rendering the updated state without refreshing page
        .onSnapshot((snapshot) => {
          setComments(snapshot.docs.map((doc) => doc.data()));
        });
    }
    return () => {
      unsubscribe();
    };
  }, [postId]);

  //fires everytime as the double click event on the image raises
  const doubleTap = () => {
    //
    let isChecked = document.getElementById("likebox").checked;
    if (isChecked) document.getElementById("likebox").checked = false;
    else document.getElementById("likebox").checked = true;
    captureLike();
  };

  //captures and processes the like and unlike event
  const captureLike = () => {
    if (activeUser) {
      setChecked(true);
      setTimeout(() => {
        setChecked(false);
      }, 1000);

      //collection of usernames who liked the post
      let likedUsernames = likes.map((likedUser) => likedUser.username);

      //to ensure no duplication in a user's like event
      if (likedUsernames.includes(activeUser.displayName)) {
        //At every render docId sets to null initially...this will execute if ID ! == null
        likedDocumentId
          ? db
              .collection("posts")
              .doc(postId)
              .collection("likes")
              .doc(likedDocumentId)
              .delete()
          : //this will execute incase the docId fails to update
            db
              .collection("posts")
              .doc(postId)
              .collection("likes")
              .where("username", "==", activeUser.displayName)
              .get()
              .then((doc) => doc.forEach((doc) => doc.ref.delete()));

        //setting the docId to null after every unlike event
        setLikedDocumentId(null);
      } else {
        db.collection("posts")
          .doc(postId)
          .collection("likes")
          .add({
            username: activeUser.displayName,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          })
          .then((doc) => setLikedDocumentId(doc.id))
          .catch((error) => alert(error.message));
      }
    } else triggerSignInDialog(); //triggers login form in a modal if user is not authorized
  };

  //fires on posting a new comment
  const postComment = (event) => {
    if (activeUser) {
      //to prevent refresh behaviour of browser
      event.preventDefault();
      db.collection("posts")
        .doc(postId)
        .collection("comments")

        //adding a comment in a document with recorded timestamp
        .add({
          username: activeUser.displayName,
          text: comment,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        })
        .then(() => setComment("")) //setting active comment state to null after posting comment
        .catch((error) => alert(error.message)); // executes on rejection
    } else triggerSignInDialog(); //triggers login form in a modal if user is not authorized
  };

  //fires on user clicking on delele comment button
  const deleteComment = (value) => {
    db.collection("posts")
      .doc(postId)
      .collection("comments")
      .where("text", "==", value)
      .get()
      .then((doc) => doc.forEach((doc) => doc.ref.delete()));
  };

  //fires on user clicking on delele post
  const deletePost = () => {
    db.collection("posts").doc(postId).delete();
  };

  return (
    <div className="post">
      <div className="post__header">
        <div className="post__header__details">
          <Avatar className="post__avatar" alt="HarshPeri" src="" />
          <h3>{username}</h3>
        </div>

        {/* this event fires on clicking like button and also doubleclicking Img to give a transition effect */}
        <Zoom in={checked}>
          <FavoriteSharp
            className="likeIcon__transition"
            style={{
              position: "absolute",
              marginTop: "12%",
              marginLeft: "10%",
              fontSize: "10rem",
              color: "white",
            }}
          />
        </Zoom>

        {/* To ensure that the delete button in post header is available only to the active user's post*/}
        {activeUser?.displayName === username ? (
          <IconButton onClick={deletePost}>
            <CloseSharpIcon />
          </IconButton>
        ) : null}
      </div>

      {/* post Image */}
      <img
        className="post__image"
        src={imageUrl}
        alt=""
        onDoubleClick={doubleTap}
      />

      <div className="post__likes">
        <div className="post__likes__and__date__row">
          {/* custom checkbox for like and unlike events */}
          <FormControlLabel
            control={
              <Checkbox
                id="likebox"
                icon={<FavoriteBorderSharp style={{ fontSize: "2rem" }} />}
                checkedIcon={<FavoriteSharp style={{ fontSize: "2rem" }} />}
                checked={
                  likes
                    .map((likedUser) => likedUser.username)
                    .includes(activeUser?.displayName)
                    ? true
                    : false
                }
              />
            }
            onChange={captureLike} //like and unlike event listener
          />

          {/* getting the timestamp for the respective post */}
          {postTimestamp
            ? new Date(postTimestamp.toDate()).toUTCString().replace(" GMT", "")
            : null}
        </div>

        {/* displaying likes count */}
        <p
          onClick={() =>
            likes.length !== 0
              ? setLikedUsersDialog(true)
              : setLikedUsersDialog(false)
          }
        >
          <strong className="like__strong">{likes.length}</strong>
          <strong>{likes.length === 1 ? "like" : "likes"}</strong>
          {" (click to view users)"}
        </p>

        {/* this dialog triggers on clicking likes count - displays the users who liked the post*/}
        <Dialog
          open={likedUsersDialog}
          onClose={() => setLikedUsersDialog(false)}
          scroll="paper"
          fullWidth={true}
        >
          <DialogTitle>People who liked this post</DialogTitle>
          <DialogContent>
            {likes.map((likedUser) => (
              <p className="liked__users">
                <div className="liked__users__details">
                  <Avatar
                    className="liked__user"
                    alt={`${likedUser.username.charAt(0).toUpperCase()}`}
                  />
                  <strong>{likedUser.username}</strong>
                </div>
                {likedUser?.timestamp
                  ? new Date(likedUser.timestamp.toDate())
                      .toUTCString()
                      .replace(" GMT", "")
                  : null}
              </p>
            ))}
          </DialogContent>
        </Dialog>
      </div>

      {/* post caption */}
      <h4 className="post__text">
        <strong>{username}</strong>
        {caption}
      </h4>

      {/* post comments */}
      <div className="post__comments">
        {comments.map((comment) =>
          //to ensure only the active user who has logged in can comment on the post
          comment.username === activeUser?.displayName ? (
            <div className="activeUserComment">
              <p className="post__comment__details">
                <strong className="post__commentUser">
                  {comment.username}
                </strong>
                {comment.text}
              </p>

              {/* conditionally rendering comment delete option only to active user */}
              <IconButton
                onClick={() => deleteComment(comment.text)}
                value={comment.text}
              >
                <CloseIcon style={{ fontSize: "0.8rem" }} />
              </IconButton>
            </div>
          ) : (
            <p>
              <strong className="post__commentUser">{comment.username}</strong>
              {comment.text}
            </p>
          )
        )}
      </div>

      {/* post a comment - form */}
      <form className="post__commentbox">
        <input
          className="post__input"
          type="text"
          placeholder="Add a Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button
          className="post__button"
          disabled={!comment}
          onClick={postComment}
        >
          POST
        </button>
      </form>
    </div>
  );
};

export default Post;
