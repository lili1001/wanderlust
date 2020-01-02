import React, { Component } from "react";
import { connect } from "react-redux";
import { BrowserRouter, Route, Link } from "react-router-dom";
import Nav from "./Nav.jsx";
import Login from "./Login.jsx";
import Signup from "./Signup.jsx";
import Postjourney from "./PostJourney.jsx";
import PostPlan from "./PostPlan.jsx";
import firebase from "firebase";
import config from "./firebaseConfig";
import MyProfile from "./MyProfile.jsx";
import Content from "./Content.jsx";
import MyFav from "./MyFav.jsx";
import JourneyDetail from "./JourneyDetail.jsx";
import PlanDetail from "./PlanDetail.jsx";
import { withRouter } from "react-router-dom";
firebase.initializeApp(config);

let content = () => {
  return <Content />;
};
let myprofile = () => {
  return <MyProfile />;
};
let myfav = () => {
  return <MyFav />;
};
let postplan = () => {
  return <PostPlan />;
};
let postjourney = () => {
  return <Postjourney />;
};
class UnconnectedApp extends Component {
  journeyDetail = routerData => {
    return <JourneyDetail journeyId={routerData.match.params.journeyId} />;
  };
  planDetail = routerData => {
    return <PlanDetail planId={routerData.match.params.planId} />;
  };
  signout = async () => {
    console.log("signout pressed");
    let res = await fetch("/logout", {
      method: "GET"
    });
    let response = await res.text();
    let parsed = JSON.parse(response);
    if (parsed.success) {
      this.props.dispatch({
        type: "signout"
      });
      alert("you signed out");
    }
  };
  checkCookie = async () => {
    let response = await fetch("/autologin", {
      method: "GET",
      credentials: "include"
    });
    let responseBody = await response.text();
    let parse = JSON.parse(responseBody);
    if (parse.success) {
      console.log("found active login session");
      this.props.dispatch({
        type: "login-success",
        userdata: parse.userdata
      });
      //propably my post and my faverate go here--------
    }
  };
  fetchAllPosts = async () => {
    //posts -----is an onject{myJourneys:[], myPlans:[]}
    console.log("fetch all posts");
    let response = await fetch("/getallposts", {
      method: "GET",
      credentials: "include"
    });
    let responseBody = await response.text();
    let parsed = JSON.parse(responseBody);
    console.log("response from back end", parsed);
    if (parsed.success) {
      let allJourneys = parsed.posts.allJourneys;
      let allPlans = parsed.posts.allPlans;
      this.setState({ allJourneys: allJourneys, allPlans: allPlans });
      this.props.dispatch({
        type: "update-posts",
        allJourneys: allJourneys,
        allPlans: allPlans
      });
    } else {
      alert(parsed.msg);
    }
  };
  componentDidMount = () => {
    let update = () => {
      this.checkCookie();
      this.fetchAllPosts();
    };
    setInterval(update, 1000);
  };
  render = () => {
    return (
      <BrowserRouter>
        <Nav />
        <Login />
        <Signup />
        <Route exact={true} path="/" render={content} />
        <Route exact={true} path="/signout" render={this.signout} />
        <Route exact={true} path="/myprofile" render={myprofile} />
        <Route exact={true} path="/myfav" render={myfav} />
        <Route exact={true} path="/postplan" render={postplan} />
        <Route exact={true} path="/postjourney" render={postjourney} />
        <Route
          exact={true}
          path="/journey/:journeyId"
          render={this.journeyDetail}
        />
        <Route exact={true} path="/plan/:planId" render={this.planDetail} />
      </BrowserRouter>
    );
  };
}
let mapStateToProps = st => {
  return {
    loggedIn: st.loggedIn,
    userdata: st.userdata,
    allJourneys: st.allJourneys,
    allPlans: st.allPlans
  };
};
let App = connect(mapStateToProps)(UnconnectedApp);
export default App;
