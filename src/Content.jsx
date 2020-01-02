import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import Search from "./Search.jsx";
import "./styles/ContentStyle.css";
let coverIMGs = ["./home1.png", "./home2.png", "./home3.png", "./home4.png"];
let selector = 0;
class unconnectedContent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      coverpath: coverIMGs[0]
    };
  }
  search = (query, string) => {
    let reg = new RegExp(query);
    return reg.test(string);
  };
  displayJourneyContent = content => {
    console.log("display content", content);
    let displayContent = content.map(part => {
      if (part.type === "text") {
        return part.display;
      }
    });
    console.log("displaycontent", displayContent);
    let render = displayContent[0].slice(0, 300) + "...";
    return render;
  };

  displayJourney = () => {
    let displayjourneys = this.props.allJourneys.filter(journey => {
      let query = this.props.queryJourney.toLowerCase();
      let title = journey.title.toLowerCase();
      let destination = journey.destination.toLowerCase();
      return this.search(query, title) || this.search(query, destination);
    });
    let journeys = displayjourneys.map(journey => {
      return (
        <div className="journeyBox">
          <img src={journey.coverImage} />
          <div
            className="contentBox"
            onClick={() => {
              this.props.dispatch({
                type: "clearSearch"
              });
            }}
          >
            <Link to={"/journey/" + journey.journeyId}>{journey.title}</Link>
            <div className="content">
              {this.displayJourneyContent(journey.content)}
            </div>
            <div className="destination">
              <i class="fas fa-location-arrow"></i> {journey.destination}
            </div>
          </div>
        </div>
      );
    });
    return <div className="journeyContainer">{journeys}</div>;
  };
  displayPlan = () => {
    let displayplans = this.props.allPlans.filter(plan => {
      let query = this.props.queryPlan.toLowerCase();
      let title = plan.title.toLowerCase();
      let destination = plan.destination.toLowerCase();
      return this.search(query, title) || this.search(query, destination);
    });
    let plans = displayplans.map(plan => {
      return (
        <div
          className="planBox"
          onClick={() => {
            this.props.dispatch({
              type: "clearSearch"
            });
          }}
        >
          <div className="imgBox">
            <img src={plan.coverImage} />
            <div>{plan.participants.length} joined</div>
          </div>
          <div className="contentBox">
            <Link to={"/plan/" + plan.planId}>{plan.title}</Link>
            <div className="content">{plan.content.slice(0, 100) + "..."}</div>
            <div className="destination">
              <i class="fas fa-location-arrow"></i> {plan.destination}
            </div>
          </div>
        </div>
      );
    });
    return <div className="planContainer">{plans}</div>;
  };
  componentDidMount = () => {
    let update = () => {
      selector = (selector + 1) % 4;
      this.setState({ coverpath: coverIMGs[selector] });
    };
    setInterval(update, 4000);
  };
  render = () => {
    console.log("this.prop.allJourneys", this.props.allJourneys);
    return (
      <div className="cContainer">
        <img src={this.state.coverpath} />
        <div className="contentContainer">
          <div className="planSection">
            <Search type="plan" />
            {this.displayPlan()}
          </div>
          <div className="journeySection">
            <Search type="journey" />
            {this.displayJourney()}
          </div>
        </div>
      </div>
    );
  };
}
let mapStateToProps = st => {
  return {
    allJourneys: st.allJourneys,
    allPlans: st.allPlans,
    queryJourney: st.queryJourney,
    queryPlan: st.queryPlan
  };
};
let Content = connect(mapStateToProps)(unconnectedContent);
export default Content;
