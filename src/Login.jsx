import React, { Component } from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { withRouter } from "react-router-dom";
import styled from "styled-components";
let LogPop = styled.div`
  opacity: 0;
  visibility: hidden;
  z-index: -1;
  animation: ${props => {
    if (props.show === "login") return "appear .3s ease forwards";
    return "0";
  }}; 
  @keyframes appear {
  1% {
    z-index: 15;
  }
  100% {
    opacity: 1;
    visibility: visible;
  }
}
  position: fixed; 
  z-index: 10; 
  left: 0;
  top: 0;
  width: 100%; 
  height: 100%; 
  overflow: auto;
  background-color: rgba(0,0,0);
  background-color: rgba(0,0,0,0.4);

  a {
    text-decoration: underline;
    color: blue;
    cursor: pointer;
  }
  .modal-content {
    background-color: rgba(255, 255, 255);
    border-radius: 10px;
    margin: 5% auto; 
    padding: 20px;
    border: 1px solid #888;
    width: 300px; 
    text-align: center;
    #close {
      color: #aaa;
      float: right;
      font-size: 28px;
      font-weight: bold;
    }
    #close:hover {
      color: black;
      text-decoration: none;
      cursor: pointer;
    }
    input {
      border-radius: 8px;
    }
  }
  .button {
			background-color: rgba(0,0,0,0.4);
			color: rgba(256,256,256,1);
			border:0;
			border-radius: 15px;
			margin: 15px; 
			padding: 15px;
			width: 50%;
			font-size: 13px;
			font-weight: bold;
			cursor: pointer;
			-webkit-transition: background-color .3s ease;
      transition: background-color .3s ease;
			&:hover {
				background-color: #696969;
			}
		}
	}

  .form-holder {
    display: flex;
    justify-content: center;
    text-align: center;
    margin: 5px;
    padding: 5px;
    div {
      padding: 5px;
      margin: 5px
    }
    input {
      border: 1px solid gray;
      text-align: center;
      margin: 10px;
      padding: 3px;
      &:focus {
        outline-color: transparent;
      }
    }
  }

`;
class UnconnectedLogin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };
  }
  handleUsernameChange = event => {
    this.setState({ username: event.target.value });
  };
  handlePasswordChange = event => {
    this.setState({ password: event.target.value });
  };
  handleSubmit = async evt => {
    evt.preventDefault();
    console.log("log in");
    let data = new FormData();
    data.append("username", this.state.username);
    data.append("password", this.state.password);
    console.log("fetch login backend", data);
    let response = await fetch("/login", {
      method: "POST",
      body: data,
      credentials: "include"
    });
    let responseBody = await response.text();
    console.log("responseBody from login", responseBody);
    let body = JSON.parse(responseBody);
    if (!body.success) {
      alert(body.msg);
      return;
    }
    this.props.dispatch({
      type: "login-success",
      userdata: body.userdata
    });
    this.props.dispatch({
      type: "showModal",
      show: "none"
    });
  };
  closeHandler = ev => {
    if (ev.target.id !== "close") return;
    this.props.dispatch({
      type: "showModal",
      show: "none"
    });
  };
  toSignup = () => {
    this.props.dispatch({
      type: "showModal",
      show: "signup"
    });
  };
  render = () => {
    return (
      <LogPop className="modal" show={this.props.display}>
        <div className="modal-content">
          <span id="close" onClick={this.closeHandler}>
            &times;
          </span>
          <h3>Sign in</h3>
          <div className="form-holder">
            <form onSubmit={this.handleSubmit}>
              <input
                type="text"
                placeholder="Username"
                onChange={this.handleUsernameChange}
              />
              <input
                type="password"
                placeholder="Password"
                onChange={this.handlePasswordChange}
              />
              <input type="submit" className="button" value="submit" />
            </form>
          </div>
          <a onClick={this.toSignup}>
            Need to sign up for an account? Click Here
          </a>
        </div>
      </LogPop>
    );
  };
}
let mapStateToProps = st => {
  return {
    display: st.displayModal
  };
};
let Login = connect(mapStateToProps)(UnconnectedLogin);
export default Login;
