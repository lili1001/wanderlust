import React, { Component } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import "./styles/NavStyle.css";
class unconnectedNav extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    let me = this.props.currentUser;
    return (
      <div className="Navcontainer">
        <h2>Wanderlust</h2>
        <div className="navbar">
          <Link to="/">
            home <i class="fas fa-home"></i>
          </Link>
          {me && (
            <>
              <Link to="/myprofile">
                me <img className="profileImg" src={this.props.image} />
              </Link>
              <div className="dropdown">
                post <i class="fas fa-plus-circle"></i>
                <div className="dropdown-content">
                  <Link to="postjourney">postJourney</Link>
                  <Link to="/postplan">postPlan</Link>
                </div>
              </div>
              <Link to="/myfav">
                fav <i class="far fa-heart"></i>
              </Link>
              <Link to="/signout">sign out</Link>
            </>
          )}
          {!me && (
            <a
              onClick={() => {
                this.props.dispatch({ type: "showModal", show: "login" });
              }}
            >
              Join
            </a>
          )}
        </div>
      </div>
    );
  }
}
let mapStateToProps = st => {
  return {
    currentUser: st.userdata.username,
    image: st.userdata.image
  };
};
let Nav = connect(mapStateToProps)(unconnectedNav);
export default Nav;
