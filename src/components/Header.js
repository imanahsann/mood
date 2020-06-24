import React from 'react';
import { Link } from "react-scroll";

const Header = (props) => {
    return (
            <header>
            {props.user ? <button className="logout" onClick={props.logout} tabIndex="0"><i className="fas fa-sign-out-alt"></i></button> : <button className="login" onClick={props.login} tabIndex="0"><i className="fas fa-user"></i></button>}


                <div className="wrapper heading">
                    <h1>Mood:</h1>
                    <h2>Gilmore Girls</h2>
                </div>
                <div className="header-image">
                    {/* Header background image */}
                </div>
                <div className="wrapper tagline-container">
                    <p>Not sure which Gilmore Girls episodes you should stream tonight? You're in the right place! Help narrow your options by picking a character or checking out our recommendations below. Login above to save episodes to your own list!</p>
                </div>
                <div className="wrapper down">
                    <Link
                        to="main-content"
                        smooth={true}
                        offset={-20}
                        duration={500}
                    ><i className="fas fa-chevron-circle-down"></i></Link>
                </div>
            </header>
        )
}

export default Header;
