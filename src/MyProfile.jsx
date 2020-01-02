import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import firebase from "firebase";
import FileUploader from "react-firebase-file-uploader";
import DelJourney from "./DeleteJourneyButton.jsx";
import DelPlan from "./DeletePlanButton.jsx";
import "./styles/myProfile.css";

class unconnectedMyProfile extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myAccount: this.props.mydata,
      myJourneys: [],
      myPlans: [],
      myJoinedPlans: []
    };
  }
  fetchMyPosts = async () => {
    //posts -----is an onject{myJourneys:[], myPlans:[]}
    console.log("fetch my posts");
    let response = await fetch("/getmyposts", {
      method: "GET",
      credentials: "include"
    });
    let responseBody = await response.text();
    let parsed = JSON.parse(responseBody);
    console.log("response from back end", parsed);
    if (parsed.success) {
      let myJourneys = parsed.posts.myJourneys;
      let myPlans = parsed.posts.myPlans;
      let myPlansJoined = parsed.posts.myPlansJoined;
      this.setState({
        myJourneys: myJourneys,
        myPlans: myPlans,
        myJoinedPlans: myPlansJoined
      });
      return parsed.posts;
    } else {
      alert(parsed.msg);
    }
  };
  handleUploadSuccess = async filename => {
    console.log("upload success", filename);
    firebase
      .storage()
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(async url => {
        let data = new FormData();
        data.append("myIMG", url);
        let response = await fetch("/myIMG", {
          method: "POST",
          body: data,
          credentials: "include"
        });
        let responseBody = await response.text();
        let body = JSON.parse(responseBody);
        console.log("parsed body", body);
        if (!body.success) {
          alert(body.msg);
          return;
        }
        console.log("update profile pic success");
        let newAccount = { ...this.state.myAccount, image: url };
        this.setState({ myAccount: newAccount });
      });
  };
  displayAccount = () => {
    if (this.state.myAccount.length === 0) {
      return;
    } else {
      return (
        <>
          <div className="image">
            <img src={this.state.myAccount.image} />
            <div>
              <FileUploader
                accept="image/*"
                storageRef={firebase.storage().ref("images")}
                onUploadSuccess={this.handleUploadSuccess}
              />
            </div>
          </div>
          <h1 className="name">{this.state.myAccount.username}</h1>
        </>
      );
    }
  };
  displayJourney = () => {
    if (this.state.myJourneys.length === 0) {
      return;
    } else {
      let journeys = this.state.myJourneys.map(journey => {
        return (
          <div className="journeyBox">
            <div>
              <DelJourney id={journey.journeyId} />
            </div>
            <img src={journey.coverImage} />
            <div>
              <Link to={"/journey/" + journey.journeyId}>
                {journey.title.slice(0, 25) + "..."}
              </Link>
            </div>
          </div>
        );
      });
      return <div className="journeyContainer">{journeys}</div>;
    }
  };
  displayJoinedPlan = () => {
    if (this.state.myPlans.length === 0) {
      return;
    } else {
      let plans = this.state.myJoinedPlans.map(plan => {
        return (
          <div className="joinedplanBox">
            <div className="imgBox">
              <img src={plan.coverImage} />
              <span>{plan.participants.length} joined</span>
            </div>
            <div>
              <Link to={"/plan/" + plan.planId}>
                {plan.title.slice(0, 25) + "..."}
              </Link>
            </div>
          </div>
        );
      });
      return <div className="joinedplanContainer">{plans}</div>;
    }
  };
  displayPlan = () => {
    if (this.state.myPlans.length === 0) {
      return;
    } else {
      let plans = this.state.myPlans.map(plan => {
        return (
          <div className="planBox">
            <div>
              <DelPlan id={plan.planId} />
            </div>
            <div className="imgBox">
              <img src={plan.coverImage} />
              <span>{plan.participants.length} joined</span>
            </div>
            <div>
              <Link to={"/plan/" + plan.planId}>
                {plan.title.slice(0, 25) + "..."}
              </Link>
            </div>
          </div>
        );
      });
      return <div className="planContainer">{plans}</div>;
    }
  };
  componentDidMount = () => {
    this.fetchMyPosts();
    setInterval(this.fetchMyPosts, 5000);
  };
  render = () => {
    return (
      <div className="MPcontainer">
        <div className="info">{this.displayAccount()}</div>
        <div className="journey">
          <h3>my journeys</h3>
          {this.displayJourney()}
        </div>
        <div className="plan">
          <h3>my plans</h3>
          {this.displayPlan()}
        </div>
        {/* <div className="joinPlan">
          <h3>my joined plans</h3>
          {this.displayJoinedPlan()}
        </div> */}
      </div>
    );
  };
}
let mapStateToProps = st => {
  return { mydata: st.userdata };
};

let MyProfile = connect(mapStateToProps)(unconnectedMyProfile);
export default MyProfile;
