'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);

    constructor(coords, distance, duration) {
        this.coords = coords;  // [lat , lng]
        this.distance = distance; // in km
        this.duration = duration; // in min

    }
}
class Running extends Workout {
    type = "running";
    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
    }
    calcPace() {
        // min/km 
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}
class Cycling extends Workout {
    type = "cycling" ;
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed();
    }
    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}


/////////////////////////////////////////////
// application architecture
class App {

    #map;
    #mapEvent;
    #workouts = [];

    constructor() {
        this._getPosition();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change', this._toggleElevationField)
    }
    _getPosition() {
        if (navigator.geolocation)
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                alert("could not get your location");
            });
    }
    _loadMap(position) {
        const { latitude } = position.coords;
        const { longitude } = position.coords;
        const coords = [latitude, longitude];

        this.#map = L.map('map').setView(coords, 11);

        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on('click', this._showform.bind(this))
    }
    _showform(mapE) {
        this.#mapEvent = mapE;
        form.classList.remove('hidden');
        inputDistance.focus();
    }
    _toggleElevationField() {
        inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
        inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e) {
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        const { lat, lng } = this.#mapEvent.latlng;

        e.preventDefault();

        // Get data from the form 
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        let workout;

        // Check if data is valid

        // if workout is running create running workout
        if (type === "running") {
            const cadence = +inputCadence.value;
            // if (!Number.isFinite(distance) || !Number.isFinite(duration) || !Number.isFinite(cadence)) 
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence))
                return alert('inputs have to be positive numbers');

            workout = new Running([lat, lng], distance, duration, cadence);
        }



        //  is workout is cycling create cycling workout 
        if (type === "cycling") {
            const elevation = +inputElevation.value;
            if (!validInputs(distance, duration, elevation) || !allPositive(distance, duration))
                return alert('inputs have to be positive numbers');
            workout = new Cycling([lat, lng], distance, duration, elevation);
        }

        // add  new object to workout array
        this.#workouts.push(workout);

        // render workout on map as marker
        this.renderWorkoutMarker(workout);

        // render workout on a list

        // hide form + clear input fields
        inputDistance.value = inputDuration.value = inputCadence.value = '';

        
        
    }
    renderWorkoutMarker(workout){
        L.marker(workout.coords).addTo(this.#map)
            .bindPopup(L.popup({
                maxWidth: 250,
                minWidth: 100,
                autoClose: false,
                closeOnClick: false,
                className: `${workout.type}-popup`
            }))
            .setPopupContent("WORKOUT")
            .openPopup();
    }

}

const app = new App();


