import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import ArrowDownwardIcon from "@material-ui/icons/ArrowDownward";
import axios from "axios";
import CircularProgress from "@material-ui/core/CircularProgress";

const useStyles = makeStyles(theme => ({
  root: {
    height: "100vh"
  },
  image: {
    backgroundImage:
      "url(https://ph-files.imgix.net/f750b6ae-a62a-4ccd-8abd-a17483955d1c?auto=format&auto=compress&codec=mozjpeg&cs=strip)",
    backgroundRepeat: "no-repeat",
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.grey[900]
        : theme.palette.grey[50],
    backgroundSize: "cover",
    backgroundPosition: "center"
  },
  logo: {
    width: "400px",
    height: "80px"
  },
  paper: {
    margin: theme.spacing(8, 4),
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(1)
  },
  submit: {
    margin: theme.spacing(3, 0, 2)
  },
  arrow: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  }
}));

const App = () => {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [response, setResponse] = useState("");
  const [ready, setReady] = useState(true);
  const classes = useStyles();

  const baseUrl = "http://localhost:5000/route";

  const handleGo = async event => {
    setResponse("");
    event.preventDefault();
    const data = {
      start_link: start,
      dest_link: end
    };
    setReady(false);
    const response = await axios.post(baseUrl, data);
    console.log(data);
    setReady(true);
    setResponse(response.data);
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />
      <Grid item xs={false} sm={4} md={7} className={classes.image} />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <div className={classes.paper}>
          <img
            className={classes.logo}
            alt="asdsad"
            src={require("../src/images/logo.png")}
          />
          <br></br>

          <div>
            <b>You can try for example these routes:</b>

            <p>https://en.wikipedia.org/wiki/Kangaroo</p>
            <p>https://en.wikipedia.org/wiki/Northern_Europe</p>
          </div>

          <div>
            <p>https://en.wikipedia.org/wiki/Venus_Flytrap_(film)</p>
            <p>https://en.wikipedia.org/wiki/Apple_Inc.</p>
          </div>

          <div>
            <p>https://en.wikipedia.org/wiki/Slovakia</p>
            <p>https://en.wikipedia.org/wiki/Poland</p>
          </div>
          <br></br>
          <Typography component="h1" variant="h5">
            Find the shortest paths from:
          </Typography>
          <form className={classes.form} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              label="Start"
              name="start"
              autoComplete="start"
              autoFocus
              onChange={({ target }) => setStart(target.value)}
            />

            <div className={classes.arrow}>
              <ArrowDownwardIcon fontSize="large" />
            </div>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="end"
              label="End"
              autoComplete="end"
              onChange={({ target }) => setEnd(target.value)}
            />
            {ready === true ? (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleGo}
              >
                Go
              </Button>
            ) : (
              <Button
                type="submit"
                disabled
                fullWidth
                variant="contained"
                color="primary"
                className={classes.submit}
                onClick={handleGo}
              >
                Go
              </Button>
            )}
          </form>
          {ready === false ? <CircularProgress /> : <p></p>}
          {!!response && (
            <div>
              {" "}
              <Typography component="h1" variant="h5">
                Result:
              </Typography>{" "}
              {response}
            </div>
          )}
        </div>
      </Grid>
    </Grid>
  );
};

export default App;
