import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import FavButton from "./FavButton.jsx";
import { withRouter } from "react-router-dom";
import "./styles/MyFav.css";

class unconnectedMyFav extends Component {
  constructor(props) {
    super(props);
    this.state = {
      myAccount: this.props.mydata,
      myFavJourneys: [],
      myFavPlans: []
    };
  }
  fetchMyFavPosts = async () => {
    //posts -----is an onject{myJourneys:[], myPlans:[]}
    console.log("fetch my favorite posts");
    let response = await fetch("/getmyfavposts", {
      method: "GET",
      credentials: "include"
    });
    let responseBody = await response.text();
    let parsed = JSON.parse(responseBody);
    console.log("response from back end", parsed);
    if (parsed.success) {
      let myFavJourneys = parsed.posts.myFavJourneys;
      let myFavPlans = parsed.posts.myFavPlans;
      this.setState({ myFavJourneys: myFavJourneys, myFavPlans: myFavPlans });
      return parsed.posts;
    } else {
      alert(parsed.msg);
    }
  };
  displayJourneyContent = content => {
    console.log("display content", content);
    let displayContent = content.map(part => {
      console.log("part", part);
      if (part.type === "text") {
        console.log("dispaly", part.display);
        return <div>{part.display}</div>;
      }
      return <img src={part.display} height="100px" />;
    });
    return displayContent;
  };
  displayAccount = () => {
    if (this.state.myAccount.length === 0) {
      return;
    } else {
      return (
        <>
          <div className="image">
            <img src={this.state.myAccount.image} />
          </div>
          <h1 className="name">{this.state.myAccount.username}</h1>
        </>
      );
    }
  };
  displayJourney = () => {
    if (this.state.myFavJourneys.length === 0) {
      return;
    } else {
      let journeys = this.state.myFavJourneys.map(journey => {
        return (
          <div className="journeyBox">
            <div>
              <FavButton fav={false} type="journey" journey={journey} />
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
  displayPlan = () => {
    if (this.state.myFavPlans.length === 0) {
      return;
    } else {
      let plans = this.state.myFavPlans.map(plan => {
        return (
          <div className="planBox">
            <div>
              <FavButton fav={false} type="plan" plan={plan} />
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
    this.fetchMyFavPosts();
    setInterval(this.fetchMyFavPosts, 5000);
  };
  render = () => {
    return (
      <div className="MFcontainer">
        <div className="info">{this.displayAccount()}</div>
        <div className="journey">
          <h3>my favorite journeys</h3>
          {this.displayJourney()}
        </div>
        <div className="journey">
          <h3>my favorite plans</h3>
          {this.displayPlan()}
        </div>
      </div>
    );
  };
}
let mapStateToProps = st => {
  return { mydata: st.userdata };
};

let MyFav = connect(mapStateToProps)(unconnectedMyFav);
export default MyFav;
