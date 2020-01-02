import React, { Component } from "react";
import { connect } from "react-redux";
class UnconnectedDeletePlan extends Component {
  constructor(props) {
    super(props);
  }
  clickDel = async () => {
    if (!this.props.loggedIn) {
      alert("you have to log in ");
      return;
    }
    let data = new FormData();
    let id = this.props.id;
    data.append("id", id);
    let response = await fetch("/deleteplan", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let body = await response.text();
    let parsed = JSON.parse(body);
    if (!parsed.success) {
      alert(parsed.msg);
    } else alert("plan deleted");
  };
  render = () => {
    console.log("delete plan button clicked");
    return <button onClick={this.clickDel}>X</button>;
  };
}
let mapStateToProps = st => {
  return {
    loggedIn: st.loggedIn
  };
};
let DelPlan = connect(mapStateToProps)(UnconnectedDeletePlan);
export default DelPlan;
