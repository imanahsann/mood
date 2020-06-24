import React from 'react';

const ListEpisode = (props) => {
    return (
        <div className="list-episode">
            <h3>{props.name}</h3>
            <p className="season">Season {props.season}</p>
            <p className="number">Episode {props.number}</p>
            <p className="summary">{props.summary}</p>
            <button className="add" onClick={() => props.delete(props.id)}>Delete <i className="fas fa-trash" tabIndex="0" ></i></button>
        </div>
    )
}

export default ListEpisode;
