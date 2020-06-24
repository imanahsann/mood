import React from 'react';

const RecommendedEpisode = (props) => {
    return (
        <div className="recommended-episode">
                <h3>{props.name}</h3>
                <p className="season">Season {props.season}</p>
                <p className="number">Episode {props.number}</p>
                <p className="summary">{props.summary}</p>
                <button className="randomize" onClick={props.randomize} tabIndex="0" >Randomize <i className="fas fa-arrow-circle-right"></i></button>
                {props.user ? <button className="add" onClick={props.add}>Add to list <i className="fas fa-plus-circle" tabIndex="0" ></i></button> : null}
        </div>
    )
}

export default RecommendedEpisode;
