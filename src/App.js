import React, { Component } from 'react';
import swal from 'sweetalert';
import './styles/App.scss';
import axios from 'axios';
import Header from './components/Header';
import characters from './data/characters';
import Character from './components/Character';
import recommendedEpisodes from './data/episodes';
import RecommendedEpisode from './components/RecommendedEpisode';
import ListEpisode from './components/ListEpisode';
import Footer from './components/Footer';
import firebase from './firebase';

const provider = new firebase.auth.GoogleAuthProvider();
const auth = firebase.auth();

class App extends Component {
  constructor(){
    super()
    this.state = {
      // empty array to hold all episodes
      episodes: [],
      // empty string for selected character when user clicks on button
      selectedCharacter: '',
      // empty array for episodes matching selected character
      matchingEpisodes: [],
      // empty string for random episode picked from matching episodes
      randomEpisode: '',
      // toggle visibility of results
      resultsVisible: false,
      // empty string for random recommended episode
      randomRec: '',
      // empty array to store user's saved episodes
      savedEpisodes: [],
      // user
      user: null,
      // toggle visibility of list
      listVisible: false
    }
  }

  componentDidMount(){
    // ajax request
    axios({
      url: `https://api.tvmaze.com/singlesearch/shows`,
      method: 'GET',
      dataType: 'json',
      params: {
        q: 'gilmore+girls',
        embed: 'episodes'
      }
    }).then((response) => {
      // clean up response, just need episodes
      response = response.data._embedded.episodes;
      // remove API's paragraph tags in summary and only keep properties using
      response = response.map((episode) => {
        return {
          name: episode.name,
          summary: episode.summary.replace(/<(\/)?i?p?>/g, ''),
          season: episode.season,
          number: episode.number
        }
      });
      // pick random recommended episode season and number
      const random = recommendedEpisodes[Math.floor(Math.random() * recommendedEpisodes.length)];
      // find matching recommended episode in all episode array
      for ( let i = 0; i < response.length; i++) {
        if (response[i].season === random.season && response[i].number === random.episode) {
          // set state to value of response and random recommended episode, toggle visibility of recommended episodes
          this.setState({
            episodes: response,
            randomRec: {
              name: response[i].name,
              summary: response[i].summary,
              season: response[i].season,
              number: response[i].number
            }
          });
        }
      }
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.setState({
            user: user
          },
          () => {
            // create reference specific to user
            this.dbRef = firebase.database().ref(`/${this.state.user.uid}`);
            // event listener
            this.dbRef.on("value", snapshot => {
              const newState = [];
              const data = snapshot.val();
              for (let key in data) {
                newState.push({
                  key: key,
                  name: data[key].name,
                  number: data[key].number,
                  season: data[key].season,
                  summary: data[key].summary
                });
              }
              let list = false;
              if (newState.length > 0) {
                list = true
              }
              this.setState({
                savedEpisodes: newState,
                listVisible: list
              });
              });
            }
          );
        }
      });
    });
  }

  // On button click
  handleChange = event => {
    this.setState({
      // update user's selected character
      selectedCharacter: event.currentTarget.value,
      // reset random episode
      randomEpisode: {},
      // toggle visibility of results
      resultsVisible: false
    })
  }

  // On error
  error = (e) => {
    e.preventDefault();
    //  ask user to select a character
    swal("Error", "Please select a character!", "error");
  }

  // On submit
  handleSubmit = (e) => {
    e.preventDefault();
    // copy of state array
    const mEpisodes = [];
    // the string we are searching for is the character's name
    const search = this.state.selectedCharacter;
    // regex expression is character name, case insensitive
    const re = new RegExp(search, 'i');
    // for each episode in episodes array
    for ( let i = 0; i < this.state.episodes.length; i++) {
      // if character's name in summary
      if ( re.exec(this.state.episodes[i].summary) != null )
        // push episode object to matching episodes array
        mEpisodes.push(this.state.episodes[i]);
    };
    this.setState({
      // store matching episodes in state
      matchingEpisodes: mEpisodes,
      // select random episode and store in state
      randomEpisode: mEpisodes[Math.floor(Math.random() * mEpisodes.length)],
      // empty selectedCharacter string
      selectedCharacter: '',
      // toggle visibility of results
      resultsVisible: true
    })
    this.scroll();
  }

  // Scroll function
  scroll = () => {
    const destination = document.getElementById('show-results');
    window.scrollTo(0, destination.offsetTop + 50);
  }

  // Randomize character based episode
  randomizeRes = () => {
    // pick random recommended episode season and number
    const random = this.state.matchingEpisodes[Math.floor(Math.random() * this.state.matchingEpisodes.length)];
    // update random episode in set state
    this.setState({
      randomEpisode: random
    });
  }

  // Randomize best bet episode
  randomizeBest = () => {
    // pick random recommended episode season and number
    const random = recommendedEpisodes[Math.floor(Math.random() * recommendedEpisodes.length)];
    // find matching recommended episode in all episode array
    for (let i = 0; i < this.state.episodes.length; i++) {
      if (this.state.episodes[i].season === random.season && this.state.episodes[i].number === random.episode) {
        // set state to value of response and random recommended episode, toggle visibility of recommended episodes
        this.setState({
          randomRec: {
            name: this.state.episodes[i].name,
            summary: this.state.episodes[i].summary,
            season: this.state.episodes[i].season,
            number: this.state.episodes[i].number
          }
        });
      }
    }
  }

  // Check if episode is already in user's saved episodes
  checkEp = (episode) => {
    // Loop through user's saved episodes
    for (let i = 0; i < this.state.savedEpisodes.length; i++) {
      if (episode.season === this.state.savedEpisodes[i].season && episode.number === this.state.savedEpisodes[i].number ) {
        return true
      }
    }
    return false
  }

  // Save episode to user's list from results
  addRes = () => {
    // Check if episode not already in user's list
    if ( this.checkEp(this.state.randomEpisode) ) {
      // If so, serve error message
      swal("Error", "This episode is already in your list!", "error");
    }
    else {
      // If not, add to list
      const userRef = firebase.database().ref(`/${this.state.user.uid}`);
      userRef.push(this.state.randomEpisode);
      swal("Success", "The episode was added to your list!", "success");
    }
  }

  // Save episode to user's list from best bets
  addRec = () => {
    // Check if episode not already in user's list
    if (this.checkEp(this.state.randomRec)) {
      // If so, serve error message
      swal("Error", "This episode is already in your list!", "error");
    }
    else {
      // If not, add to list
      const userRef = firebase.database().ref(`/${this.state.user.uid}`);
      userRef.push(this.state.randomRec);
      swal("Success", "The episode was added to your list!", "success");
    }
  }

  // Delete episode from user's saved list
  delete = (key) => {
    const deleteEp = firebase.database().ref(`/${this.state.user.uid}/${key}`);
    deleteEp.remove();
    swal("Success", "The episode was deleted from your list!", "success");
  }

  // On user logging in
  login = () => {
    auth.signInWithPopup(provider)
      .then((result) => {
        const user = result.user;
        this.setState({
          user
        });
      });
  }

  // On user logging out
  logout = () => {
    auth.signOut()
      .then(() => {
        this.setState({
          user: null,
          savedEpisodes: [],
          listVisible: false
        });
      });
  }

  render() {
    return (
      // APP CONTAINER STARTS
      <div className="App">
        {/* HEADER*/}
        <Header
        user={this.state.user}
        login={this.login}
        logout={this.logout}
        />
        {/* MAIN STARTS */}
        <main id="main-content">
          {/* WRAPPER STARTS */}
          <div className="wrapper">
            {/* BUTTON CONTAINER STARTS */}
            <div className="button-container">
              {
                // Map through characters and add button for each one
                characters.map((character, i) => {
                  return (
                    <Character
                    key={i}
                    handleChange={this.handleChange}
                    name={character.name}
                    image={character.image}
                    selectedCharacter={this.state.selectedCharacter}
                    />
                  )
                })
              }
            {/* BUTTON CONTAINER ENDS */}
            </div>
            {/* DISPLAY RESULTS BUTTON */}
            <div className="show-results" id="show-results">
              <input type="submit" value="Display Results" onClick={(this.state.selectedCharacter !== '') ? this.handleSubmit : this.error} />
            </div>
            {/* RESULTS CONTAINER BEGINS */}
            <div className={this.state.resultsVisible ? 'results results-visible' : 'results'} id="results">
              <h3>{this.state.randomEpisode.name}</h3>
              <p className="season">Season {this.state.randomEpisode.season}</p>
              <p className="number">Episode {this.state.randomEpisode.number}</p>
              <p className="summary">{this.state.randomEpisode.summary}</p>
              <button className="randomize" onClick={this.randomizeRes} tabIndex="0" >Randomize <i className="fas fa-arrow-circle-right"></i></button>
              {this.state.user ? <button className="add" onClick={this.addRes} tabIndex="0" >Add to list <i className="fas fa-plus-circle"></i></button> : null}
            {/* RESULTS CONTAINER ENDS */}
            </div>
          {/* WRAPPER ENDS */}
          </div>
            {/* RECOMMENDED SECTION BEGINS */}
          <section className="recommended">
              <div className="wrapper heading">
                <h2>Or:</h2>
                <h2>Best Bets</h2>
              </div>
              <div className="recommended-image">
                {/* Recommended background image */}
              </div>
              <div className="wrapper">
                <RecommendedEpisode
                    name={this.state.randomRec.name}
                    season={this.state.randomRec.season}
                    number={this.state.randomRec.number}
                    summary={this.state.randomRec.summary}
                    randomize={this.randomizeBest}
                    add={this.addRec}
                    user={this.state.user}
                  />
              </div>
            </section>
            {/* LIST SECTION BEGINS */}
            <section className={this.state.listVisible ? 'list list-visible' : 'list'}>
              <div className="wrapper heading">
                <h2>&:</h2>
                <h2>My List</h2>
              </div>
              <div className="list-image">
                {/* List background image */}
              </div>
              <div className="wrapper">
                {
                  // Map through saved episodes and display each
                  this.state.savedEpisodes.map((savedEpisode, i) => {
                    return (
                      <ListEpisode
                        key={i}
                        id={savedEpisode.key}
                        name={savedEpisode.name}
                        season={savedEpisode.season}
                        number={savedEpisode.number}
                        summary={savedEpisode.summary}
                        delete={this.delete}
                      />
                    )
                  })
                }
              </div>
            </section>
        {/* MAIN ENDS */}
        </main>
        <Footer />
      {/* APP CONTAINER ENDS */}
      </div>
    );
  }
}

export default App;
