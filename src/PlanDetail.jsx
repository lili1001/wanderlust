import React, { Component } from "react";
import { connect } from "react-redux";
import FavButton from "./FavButton.jsx";
import "./styles/PDetail.css";
class UnconnectedPlanDetail extends Component {
  constructor(props) {
    super(props);
    this.state = { plan: "", contactInput: "", detailInput: "" };
  }
  handleContactInput = event => {
    this.setState({ contactInput: event.target.value });
  };
  handleDetailInput = event => {
    this.setState({ detailInput: event.target.value });
  };
  clickJoin = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("planId", this.state.plan.planId);
    data.append("contact", this.state.contactInput);
    data.append("detail", this.state.detailInput);
    console.log("data appended for join plan back end");
    let response = await fetch("/joinplan", {
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
    alert("you joined the plan");
  };
  fetchPlanDetail = async planId => {
    console.log("fetch plan detail", planId);
    let data = new FormData();
    data.append("planId", planId);
    let response = await fetch("/plandetail", {
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
    this.setState({ plan: body.plan });
  };
  displayPlanDetail = () => {
    if (!this.state.plan) {
      console.log("this.state.plan", this.state.plan);
      return "uploading...";
    }
    let plan = this.state.plan;
    return (
      <div className="PDcontainer">
        <img src={plan.coverImage} className="cover" />
        <h1>{plan.title}</h1>
        <div className="fav">
          <FavButton fav={true} type="plan" plan={plan} />
        </div>
        <div className="info">
          <div>contact:{plan.contact}</div>
          <div>from: {plan.from}</div>
          <div>destination: {plan.destination}</div>
          <div>days: {plan.days}</div>
          <div>date: {plan.date}</div>
          <div>idealNumber: {plan.idealNumber}</div>
        </div>
        <div className="content">content: {plan.content}}</div>
      </div>
    );
  };
  componentDidMount = () => {
    this.fetchPlanDetail(this.props.planId);
  };
  render = () => {
    return (
      <>
        {this.displayPlanDetail()}
        <div className="PDjoin">
          <h2> join</h2>
          <div>
            contact:
            <input
              type="text"
              value={this.state.contactInput}
              onChange={this.handleContactInput}
              required
            />
          </div>
          <div>
            detail:
            <input
              type="text"
              value={this.state.detailInput}
              onChange={this.handleDetailInput}
              required
            />
          </div>
          <button onClick={this.clickJoin}>submit</button>
        </div>
      </>
    );
  };
}
let PlanDetail = connect()(UnconnectedPlanDetail);
export default PlanDetail;
