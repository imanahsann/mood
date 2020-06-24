import React from 'react';

const Character = (props) => {
    return (
        <div className="character">
            <button onClick={props.handleChange} value={props.name} className={(props.selectedCharacter === props.name) ? 'character-button opacity' : 'character-button'}>
                <img src={`./assets/characters/${props.image}`} alt={props.name} />
            </button>
        </div>
    )
}

export default Character;
