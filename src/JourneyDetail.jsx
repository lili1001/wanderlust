import React, { Component } from "react";
import { connect } from "react-redux";
import FavButton from "./FavButton.jsx";
import "./styles/JDetail.css";
class UnconnectedJourneyDetail extends Component {
  constructor(props) {
    super(props);
    this.state = { journey: "" };
  }
  fetchJourneyDetail = async journeyId => {
    console.log("fetch journey detail", journeyId);
    let data = new FormData();
    data.append("journeyId", journeyId);
    let response = await fetch("/journeydetail", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    console.log("body", responseBody);
    let body = JSON.parse(responseBody);
    console.log("parsed body", body);
    if (!body.success) {
      alert(body.msg);
      return;
    }
    this.setState({ journey: body.journey });
  };
  displayJourneyContent = content => {
    console.log("display content", content);
    let displayContent = content.map(part => {
      console.log("part", part);
      if (part.type === "text") {
        console.log("dispaly", part.display);
        return <div>{part.display}</div>;
      }
      return (
        <div>
          <img src={part.display} />
        </div>
      );
    });
    return displayContent;
  };

  displayJourneyDetail = () => {
    if (!this.state.journey) {
      console.log("this.state.journey", this.state.journey);
      return "uploading...";
    }
    let journey = this.state.journey;
    return (
      <div className="JDcontainer">
        <img className="cover" src={journey.coverImage} />
        <h1>{journey.title}</h1>
        <div className="fav">
          <FavButton fav={true} type="journey" journey={journey} />
        </div>
        <div className="info">
          <div>destination: {journey.destination}</div>
          <div>days: {journey.days}</div>
          <div>date: {journey.date}</div>
          <div>expense: {journey.expense}</div>
        </div>
        <div className="content">
          {this.displayJourneyContent(journey.content)}
        </div>
      </div>
    );
  };
  componentDidMount = () => {
    this.fetchJourneyDetail(this.props.journeyId);
  };
  render = () => {
    return this.displayJourneyDetail();
  };
}

let JourneyDetail = connect()(UnconnectedJourneyDetail);
export default JourneyDetail;
