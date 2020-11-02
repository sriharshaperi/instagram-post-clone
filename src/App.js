import React, { useEffect, useState } from 'react'
import { auth, db } from './firebaseConfig';
import Post from './Post'
import './App.css'
import { Button, Input, makeStyles, Modal } from '@material-ui/core';
import ImageUpload from './ImageUpload';

//modal positioning
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

//modal styling
const useStyles = makeStyles((theme) => ({
  paper: {
    position: 'absolute',
    width: 400,
    height: "auto",
    backgroundColor: theme.palette.background.paper,
    border: '2px solid #000',
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
  },
}));

const App = () => {

  //user state
  const [user, setUser] = useState(null);

  const classes = useStyles();
  // getModalStyle is not a pure function, we roll the style only on the first render
  const [modalStyle] = React.useState(getModalStyle);

  //initializing register modal state
  const [registerModal, setRegisterModal] = useState(false)

  //initializing login modal state
  const [loginModal, setLoginModal] = useState(false)

  //initializing email state
  const [email, setEmail] = useState("");

  //initializing username state
  const [username, setUsername] = useState("")

  //initializing password state
  const [password, setPassword] = useState("")

  //initializing state of posts collection 
  const [posts, setPosts] = useState([]);

  //fires everytime the state of user changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(authUser => {
      if (authUser)
        //user has logged in
        setUser(authUser)
      //user has logged out
      else setUser(null)
    })
    return () => {
      unsubscribe()
    }
  }, [user, email])

  //fires everytime the App component is rendered
  useEffect(() => {

    db.collection('posts').orderBy('timestamp', 'desc').onSnapshot(snapshot =>
      setPosts(snapshot.docs.map(post => ({
        id: post.id,
        post: post.data()
      })))
    )
  }, [])

  //registering user details 
  const handleRegister = (event) => {
    event.preventDefault(); //prevents the default refreshing behaviour
    if (email.trim() !== "" && password.trim() !== "") {

      //firebase authentication promise for registering a new user
      auth.createUserWithEmailAndPassword(email, password)
        .then(authUser => authUser.user.updateProfile({
          displayName: username
        }))
        .then(() => setRegisterModal(false))
        .then(() => {
          setEmail("")
          setUsername("")
          setPassword("")
        })
        .catch(error => alert(error.message))
      //closes the register modal
    }
  }

  //login user event
  const handleLogin = (event) => {
    event.preventDefault(); // prevents the default refreshing behaviour

    //firebase auth promise for maintaining state of a user
    auth.signInWithEmailAndPassword(email, password)
      .then(() => setLoginModal(false))
      .then(() => {
        setEmail("")
        setPassword("")
      })
      .catch(error => alert(error.message))
  }

  return (
    <div>
      <div className="app">

        {/* register modal - triggers when register button gets clicked on the navbar */}
        <Modal
          open={registerModal}
          onClose={() => setRegisterModal(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            <center>
              <img className="app__headerImage"
                src="https://www.freepngimg.com/thumb/logo/70011-instagram-script-typeface-myfonts-user-logo-font.png"
                alt=""
                width="150px"
                height="50px"
              />
              <form className="app__register">
                <Input
                  value={email}
                  type="email"
                  className="app__input"
                  placeholder="Email"
                  color="secondary"
                  onChange={(event) => setEmail(event.target.value)}
                />

                <Input
                  value={username}
                  type="text"
                  className="app__input"
                  placeholder="username"
                  color="secondary"
                  onChange={(event) => setUsername(event.target.value)}
                />

                <Input
                  value={password}
                  type="password"
                  className="app__input"
                  placeholder="Password"
                  color="secondary"
                  onChange={(event) => setPassword(event.target.value)}
                />

                <Button onClick={handleRegister}>REGISTER</Button>
              </form>
            </center>
          </div>
        </Modal>

        {/* login modal - triggers when login button gets clicked on the navbar */}
        <Modal
          open={loginModal}
          onClose={() => setLoginModal(false)}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
        >
          <div style={modalStyle} className={classes.paper}>
            <center>
              <img className="app__headerImage"
                src="https://www.freepngimg.com/thumb/logo/70011-instagram-script-typeface-myfonts-user-logo-font.png"
                alt=""
                width="150px"
                height="50px"
              />
              <form className="app__login">
                <Input
                  value={email}
                  type="email"
                  className="app__input"
                  placeholder="Email"
                  color="secondary"
                  onChange={(event) => setEmail(event.target.value)}
                />

                <Input
                  value={password}
                  type="password"
                  className="app__input"
                  placeholder="Password"
                  color="secondary"
                  onChange={(event) => setPassword(event.target.value)}
                />

                <Button size="large" onClick={handleLogin}>LOGIN</Button>
              </form>
            </center>
          </div>
        </Modal>

        <div className="app__header">

          {/* navbar brand logo */}
          <img className="app__headerImage"
            src="https://www.freepngimg.com/thumb/logo/70011-instagram-script-typeface-myfonts-user-logo-font.png"
            alt=""
            width="150px"
            height="50px"
          />

          {/* conditional rendering of buttons SignIn, SignUp and SignOut */}
          {user
            ?
            <Button onClick={() => auth.signOut()}>LOGOUT</Button>
            :
            <div>
              <Button onClick={() => setRegisterModal(true)}>REGISTER</Button>
              <Button onClick={() => setLoginModal(true)}>LOGIN</Button>
            </div>
          }
        </div>

        {/* conditional rendering of image upload option for the active user only */}
        {user?.displayName

          ? <ImageUpload username={user.displayName} />
          : null
        }

        {/* Header */}

        <div className="app__posts">

          {/* returning collection of posts */}
          {posts.map(({ id, post }) =>
            <Post key={id} postId={id} activeUser={user} username={post.username} imageUrl={post.imageUrl} caption={post.caption} triggerSignInDialog={() => setLoginModal(true)} postTimestamp={post.timestamp} />
          )}
        </div>
        {/* Posts */}
        {/* Posts */}
        {/* Posts */}

      </div>
    </div>
  )
}

export default App
