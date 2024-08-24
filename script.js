'use strict';

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
  id = (Date.now() + '').slice(-10);
  date = new Date();
  constructor(coord, duration, distance) {
    this.coord = coord;
    this.distance = distance;
    this.duration = duration;
  }
  _setDescirption() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const month = this.date.getMonth();
    const day = this.date.getDate();
    this.description = `${
      this.type.slice(0, 1).toUpperCase() + this.type.slice(1)
    } on ${months[month]} ${day}`;
  }
}
class Running extends Workout {
  type = 'running';
  constructor(coord, duration, distance, cadence) {
    super(coord, duration, distance);
    this.cadence = cadence;
    this.calcSpeed();
    this._setDescirption();
  }
  calcSpeed() {
    this.pace = this.distance / this.duration;
  }
}
class Cycling extends Workout {
  type = 'cycling';
  constructor(coord, duration, distance, elevationGain) {
    super(coord, duration, distance);
    this.elevationGain = elevationGain;
    this.calcPace();
    this._setDescirption();
  }
  calcPace() {
    this.speed = this.distance / (this.duration / 60);
  }
}

class App {
  #map;
  #mapEvent;
  #workoutList = [];
  #mapZoomLevel = 13;
  constructor() {
    this._getPosition();
    //1---> sumbit Event
    form.addEventListener('submit', this._newWorkout.bind(this));
    //2--> change input field event
    inputType.addEventListener('change', this._toggleEleventField.bind(this));

    containerWorkouts.addEventListener('click', this._changeViewTo.bind(this));

    this._getLocalStorage();
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('access location is ignored !!!');
        }
      );
    }
  }

  _loadMap(position) {
    this.#map = L.map('map');

    // get and instiate the pos
    const { latitude, longitude } = position.coords;
    const coords = [latitude, longitude];
    this.#map.setView(coords, this.#mapZoomLevel, {
      animate: true,
      pan: {
        duration: 1,
      },
    });

    //create the map

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.addEventListener('click', this._showForm.bind(this));

    this.#workoutList.forEach(work => this._renderWorkoutMarker(work));
  }
  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _changeViewTo(e) {
    const workout = e.target.closest('.workout');
    if (workout) {
      const w = this.#workoutList.find(work => work.id === workout.dataset.id);
      this.#map.setView(w.coord, this.#mapZoomLevel, {
        animate: true,
        pan: {
          duration: 1,
        },
      });
    }
  }

  _clearHideForm() {
    inputCadence.value =
      inputDistance.value =
      inputDuration.value =
      inputElevation.value =
        '';

    inputType.value = 'running';
    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }

  _toggleEleventField() {
    inputCadence.parentElement.classList.toggle('form__row--hidden');
    inputElevation.parentElement.classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    // helper function
    const checkPositiveNumber = (...nums) =>
      nums.every(num => Number.isFinite(num) && num > 0);
    e.preventDefault();

    //

    // read inputs
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;
    /// case runnig

    if (type === 'running') {
      const cadence = +inputCadence.value;
      if (!checkPositiveNumber(distance, duration, cadence)) {
        alert('inputs must be positive numbers only ⚠️');
      } else {
        // craeting running object
        workout = new Running([lat, lng], duration, distance, cadence);
        // add new ruuning object to list
      }
    }

    // case cycling

    if (type === 'cycling') {
      const elvGain = +inputElevation.value;
      if (!checkPositiveNumber(distance, duration)) {
        alert('inputs must be positive numbers only ⚠️');
      } else {
        workout = new Cycling([lat, lng], duration, distance, elvGain);
      }
    }

    if (workout) {
      this.#workoutList.push(workout);
      this._randerWorkout(workout);
      this._renderWorkoutMarker(workout);
    }

    //display maker to the new running object on map

    // clear the input fields - hide form
    this._clearHideForm();
  }
  _renderWorkoutMarker(workout) {
    const month = new Date(workout.date).getMonth();
    const day = new Date(workout.date).getDate();
    L.marker(workout.coord)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 200,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
          content: `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${
            workout.description
          }`,
        })
      )
      .openPopup();
  }
  _randerWorkout(workout) {
    let html = `
    <li class="workout ${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${
              workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
            }</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
  `;

    if (workout.type === 'running') {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
      `;
    } else {
      html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
        </li> 
      `;
    }

    form.insertAdjacentHTML('afterend', html);

    this._setLocalStorage();
  }
  _setLocalStorage() {
    localStorage.setItem('workouts', JSON.stringify(this.#workoutList));
  }
  _getLocalStorage() {
    const d = JSON.parse(localStorage.getItem('workouts'));
    // console.log(d);
    if (!d) return;
    this.#workoutList = d;
    this.#workoutList.forEach(work => {
      this._randerWorkout(work);
    });
  }
  resetStorage() {
    localStorage.clear();
  }
}

const app = new App();

app.resetStorage();
