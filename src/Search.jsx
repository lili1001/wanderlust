import { connect } from "react-redux";
import React, { Component } from "react";
class UnconnectedSearch extends Component {
  constructor(props) {
    super(props);
    this.state = { queryPlan: "", queryJourney: "" };
  }
  handleQuery = evt => {
    if (this.props.type === "journey") {
      this.setState({ queryJourney: evt.target.value }, () => {
        this.props.dispatch({
          type: "search Journey Query",
          search: this.state.queryJourney
        });
      });
    }
    if (this.props.type === "plan") {
      this.setState({ queryPlan: evt.target.value }, () => {
        this.props.dispatch({
          type: "search Plan Query",
          search: this.state.queryPlan
        });
      });
    }
  };
  render = () => {
    if (this.props.type === "journey") {
      return (
        <input
          type="text"
          placeholder="Search"
          onChange={this.handleQuery}
          value={this.state.queryJourney}
        />
      );
    }
    if (this.props.type === "plan") {
      return (
        <input
          type="text"
          placeholder="Search"
          onChange={this.handleQuery}
          value={this.state.queryPlan}
        />
      );
    }
  };
}

let Search = connect()(UnconnectedSearch);
export default Search;
