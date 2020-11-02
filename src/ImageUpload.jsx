import React, { useState } from "react";
import { db, storage, auth } from "./firebaseConfig";
import firebase from "firebase";
import { Button, LinearProgress } from "@material-ui/core";
import "./ImageUpload.css";

const ImageUpload = ({ username }) => {
  const [image, setImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState("");

  //set progress bar style to determinate initially
  const [progressStyle, setProgressStyle] = useState(
    <LinearProgress
      variant="determinate"
      className="imageUpload__progressbar"
      value={progress}
      max="100"
    />
  );

  const handleChange = (e) => {
    if (e.target.files[0]) setImage(e.target.files[0]);
  };

  const handleUpload = () => {
    if (auth.currentUser !== null) {
      if (image !== null) {
        //set progress bar style to indeterminate while upload process
        setProgressStyle(
          <LinearProgress
            className="imageUpload__progressbar"
            value={progress}
            max="100"
          />
        );

        const uploadTask = storage.ref(`images/${image.name}`).put(image);
        uploadTask.on(
          "state_changed",

          (snapshot) => {
            //progress function ..name
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setProgress(progress);
          },
          (error) => {
            //error function
            console.log(error);
            alert(error.message);
          },
          () => {
            storage
              .ref("images")
              .child(image.name)
              .getDownloadURL()
              .then((url) => {
                db.collection("posts")
                  .add({
                    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                    caption: caption,
                    imageUrl: url,
                    username: username,
                  })
                  .then(() => {
                    setProgress(0);
                    setCaption("");
                    setImage(null);
                    setProgressStyle(
                      <LinearProgress
                        variant="determinate"
                        className="imageUpload__progressbar"
                        value={progress}
                        max="100"
                      />
                    );
                  });
              });
          }
        );
      }
    } else alert("Not Authorized");
  };

  return (
    <div className="imageUpload">
      {/* dynamically render progress bar style */}
      {progressStyle}

      <input
        className="imageUpload__input text"
        type="text"
        style={{ height: "2rem", fontSize: "large" }}
        placeholder="Enter a caption"
        onChange={(event) => {
          setCaption(event.target.value);
        }}
        value={caption}
        autoFocus
      />
      <input
        className="imageUpload__input"
        type="file"
        onChange={handleChange}
      />
      <Button onClick={handleUpload}>Upload</Button>
    </div>
  );
};

export default ImageUpload;
