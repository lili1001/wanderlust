import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import firebase from "firebase";
import FileUploader from "react-firebase-file-uploader";
import { withRouter } from "react-router-dom";
import "./styles/PostPlanStyle.css";

class UnconnectedPostJourney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      contact: "",
      title: "",
      from: "",
      destination: "",
      days: "",
      date: "",
      idealNumber: "",
      coverImage: "./NoIMG.jpg",
      content: ""
    };
  }
  SubmitPost = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("contact", this.state.contact);
    data.append("title", this.state.title);
    data.append("from", this.state.from);
    data.append("destination", this.state.destination);
    data.append("days", this.state.days);
    data.append("date", this.state.date);
    data.append("idealNumber", this.state.idealNumber);
    data.append("coverImage", this.state.coverImage);
    data.append("content", this.state.content);
    console.log("data appended", data);
    let response = await fetch("/postmyplan", {
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
    alert("post plan succeed");
    this.props.history.push("/");
  };
  handleContact = event => {
    this.setState({ contact: event.target.value });
  };
  handleTitle = event => {
    this.setState({ title: event.target.value });
  };
  handleFrom = event => {
    this.setState({ from: event.target.value });
  };
  handleDestination = event => {
    this.setState({ destination: event.target.value });
  };
  handleDays = event => {
    this.setState({ days: event.target.value });
  };
  handleDate = event => {
    this.setState({ date: event.target.value });
  };
  handleIdealNumber = event => {
    this.setState({ idealNumber: event.target.value });
  };
  handleContent = event => {
    this.setState({ content: event.target.value });
  };
  handleUploadSuccess = filename => {
    console.log("upload success", filename);
    firebase
      .storage()
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => this.setState({ coverImage: url }));
  };

  render() {
    console.log("current state ", this.state);
    return (
      <div className="PPcontainer">
        <div className="left">
          <img className="coverImg" src={this.state.coverImage} />
          <div>
            <FileUploader
              accept="image/*"
              storageRef={firebase.storage().ref("images")}
              onUploadSuccess={this.handleUploadSuccess}
            />
          </div>
          <div>
            Title:
            <input
              type="text"
              value={this.state.title}
              onChange={this.handleTitle}
              required
            />
          </div>
          <div>
            <h3>basic info</h3>
            contact:
            <input
              type="text"
              value={this.state.contact}
              onChange={this.handleContact}
              required
            />
            <div>
              from:
              <input
                type="text"
                value={this.state.from}
                onChange={this.handleFrom}
                required
              />
            </div>
            <div>
              destination:
              <input
                type="text"
                value={this.state.destination}
                onChange={this.handleDestination}
                required
              />
            </div>
            <div>
              how long:
              <input
                type="number"
                value={this.state.days}
                onChange={this.handleDays}
                required
              />
              days
            </div>
            <div>
              departure time:
              <input
                type="date"
                value={this.state.date}
                onChange={this.handleDate}
                required
              />
            </div>
            <div>
              ideal number:
              <input
                type="number"
                value={this.state.idealNumber}
                onChange={this.handleIdealNumber}
                required
              />
              people
            </div>
          </div>
        </div>

        <div className="right">
          <h3>content</h3>
          <textarea
            value={this.state.textInput}
            onChange={this.handleContent}
          />
          <div>
            <button onClick={this.SubmitPost}>finish</button>
          </div>
        </div>
      </div>
    );
  }
}
let mapStateToProps = st => {
  return {
    currentUser: st.userdata.username
  };
};
let PostJourney = connect()(UnconnectedPostJourney);
export default withRouter(PostJourney);
