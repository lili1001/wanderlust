import React, { Component } from "react";
import { connect } from "react-redux";
class UnconnectedFavButton extends Component {
  constructor(props) {
    super(props);
  }
  clickFav = async () => {
    if (!this.props.loggedIn) {
      alert("you have to log in ");
      return;
    }
    let data = new FormData();
    if (this.props.type === "journey") {
      let journey = this.props.journey;
      data.append("type", "journey");
      data.append("ID", journey.journeyId);
    }
    if (this.props.type === "plan") {
      let plan = this.props.plan;
      data.append("type", "plan");
      data.append("ID", plan.planId);
    }
    if (this.props.fav) {
      let response = await fetch("/favoritepost", {
        method: "POST",
        body: data,
        credentials: "include"
      });
      let body = await response.text();
      let parsed = JSON.parse(body);
      if (!parsed.success) {
        alert(parsed.msg);
      } else alert("you liked the post");
    } else {
      let response = await fetch("/unfavoritepost", {
        method: "POST",
        body: data,
        credentials: "include"
      });
      let body = await response.text();
      let parsed = JSON.parse(body);
      if (!parsed.success) {
        alert(parsed.msg);
      } else alert("you unliked the post");
    }
  };
  render = () => {
    if (this.props.fav) {
      console.log("fav button clicked");
      return <button onClick={this.clickFav}>favorite</button>;
    }
    console.log("unfav button clicked");
    return <button onClick={this.clickFav}>X</button>;
  };
}
let mapStateToProps = st => {
  return {
    loggedIn: st.loggedIn
  };
};
let FavButton = connect(mapStateToProps)(UnconnectedFavButton);
export default FavButton;
