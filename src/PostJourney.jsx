import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import firebase from "firebase";
import FileUploader from "react-firebase-file-uploader";
import { withRouter } from "react-router-dom";
import "./styles/PostJourneyStyle.css";
class UnconnectedPostJourney extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "",
      destination: "",
      days: "",
      date: "",
      expense: "",
      coverImage: "./NoIMG.jpg",
      textInput: "",
      content: []
    };
  }
  SubmitPost = async event => {
    event.preventDefault();
    let data = new FormData();
    data.append("title", this.state.title);
    data.append("destination", this.state.destination);
    data.append("days", this.state.days);
    data.append("date", this.state.date);
    data.append("expense", this.state.expense);
    data.append("coverImage", this.state.coverImage);
    data.append("content", JSON.stringify(this.state.content));
    console.log("data appended", data);
    let response = await fetch("/postmyjourney", {
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
    alert("post journey succeed");
    this.props.history.push("/");
  };
  handleTitle = event => {
    this.setState({ title: event.target.value });
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
  handleExpense = event => {
    this.setState({ expense: event.target.value });
  };
  handleText = event => {
    this.setState({ textInput: event.target.value });
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
  handleUploadContentSuccess = filename => {
    console.log("upload success", filename);
    firebase
      .storage()
      .ref("images")
      .child(filename)
      .getDownloadURL()
      .then(url => {
        let addContent = { type: "image", display: url };
        let newContent = this.state.content.concat(addContent);
        console.log("new content ", newContent);
        this.setState({ textInput: "", content: newContent });
      });
  };
  ClickText = event => {
    event.preventDefault();
    let addContent = { type: "text", display: this.state.textInput };
    console.log("add content ", addContent);
    let newContent = this.state.content.concat(addContent);
    console.log("new content ", newContent);
    this.setState({ textInput: "", content: newContent });
  };
  displayContent = content => {
    console.log("display content", content);
    let displayContent = content.map(part => {
      console.log("part", part);
      if (part.type === "text") {
        console.log("dispaly", part.display);
        return <div>{part.display}</div>;
      }
      return <img className="contentImg" src={part.display} />;
    });
    return displayContent;
  };
  render() {
    console.log("current state ", this.state);
    return (
      <div className="postJourney">
        <div className="PJcontainer">
          <div className="left">
            <img
              className="coverImg"
              src={this.state.coverImage}
              height="250px"
            />
            <div>
              uploade cover pic
              <FileUploader
                accept="image/*"
                storageRef={firebase.storage().ref("images")}
                onUploadSuccess={this.handleUploadSuccess}
              />
            </div>
            <div>
              <div className="title">
                title:
                <input
                  type="text"
                  value={this.state.title}
                  onChange={this.handleTitle}
                  required
                />
              </div>
              <h3>basic info</h3>
              <div className="basicInfo">
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
                expense per person:
                <input
                  type="number"
                  value={this.state.expense}
                  onChange={this.handleExpense}
                  required
                />
                $
              </div>
            </div>
            <div>
              <h3>edit content</h3>
              <textarea
                value={this.state.textInput}
                onChange={this.handleText}
              />
              <button onClick={this.ClickText}>update</button>
              <div>
                <FileUploader
                  accept="image/*"
                  storageRef={firebase.storage().ref("images")}
                  onUploadSuccess={this.handleUploadContentSuccess}
                />
              </div>
            </div>
          </div>
          <div className="right">
            <div className="box">
              <h3>preview</h3>
              <div className="content">
                {this.displayContent(this.state.content)}
              </div>
              <button onClick={this.SubmitPost}>finish</button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
let PostJourney = connect()(UnconnectedPostJourney);
export default withRouter(PostJourney);
