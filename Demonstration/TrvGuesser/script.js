let guessMap;
let streetViewPanorama;
let currentStation;
let score = 0;
let guessCount = 0;
let highscoreList = [];
let guessMarker;

// Hämta knappen för att bekräfta gissningen
const confirmButton = document.getElementById("confirm-button");

const stations = [
    { lat: 61.47103478880923, lng: 16.379834602609762 },
    { lat: 57.7544220544198, lng: 12.240512226679396 },
    { lat: 60.129533240395325, lng: 16.21614783613068 },
    { lat: 57.50610013766453, lng: 14.694780120813915 },
    { lat: 57.17653675491518, lng: 13.737651001242915 },
    { lat: 59.02890400096033, lng: 12.234869512813168 },
    { lat: 58.981964374143594, lng: 12.249669567423894 },
    { lat: 68.14727058220568, lng: 19.782687848662874 },
    { lat: 57.216532806318675, lng: 16.03344296431932 },
    { lat: 59.40544641022305, lng: 17.863678328010483 },
    { lat: 60.48294313144746, lng: 15.425472110792883 },
    { lat: 55.64091823046342, lng: 13.080395582180266 },
    { lat: 56.06716458657247, lng: 14.481619522840045 },
    { lat: 61.349484740921, lng: 16.39172039510172 },
    { lat: 57.882975228630656, lng: 13.014832913134518 },
    { lat: 59.60997456849809, lng: 17.867244896849158 },
    { lat: 59.51230001127903, lng: 17.63295833296967 },
    { lat: 57.72033164396432, lng: 12.931025002212843 },
    { lat: 59.883130435147514, lng: 12.299264072296928 },
    { lat: 55.631570184309645, lng: 12.675191448602325 },
    { lat: 58.59645461354041, lng: 16.183851497467888 },
    { lat: 58.996882263681194, lng: 16.20791738276221 },
    { lat: 59.36990746753567, lng: 16.505387393492125 },
    { lat: 59.396925351897735, lng: 15.841643634735426 },
    { lat: 59.278668819806754, lng: 15.211597996661396 },
    { lat: 59.126498653723154, lng: 15.140158107633285 },
    { lat: 59.067120915604136, lng: 15.111327279439086 },
    { lat: 60.675842344938495, lng: 17.150423771687485 },
    { lat: 58.35416396935188, lng: 11.924498679337589 },
    { lat: 58.416098274012896, lng: 15.625858832250257 },
    { lat: 63.287976989270994, lng: 18.705834309151875 }

];

function loadGoogleMapsAPI() {
    return new Promise((resolve, reject) => {
        if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=YOUR_GOOGLE_MAPS_API_KEY&libraries=geometry";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            if (typeof google !== 'undefined' && typeof google.maps !== 'undefined') {
                resolve();
            } else {
                reject(new Error("Google Maps API failed to load."));
            }
        };

        script.onerror = reject;
        document.head.appendChild(script);
    });
}

loadGoogleMapsAPI()
    .then(() => {
        initMap();
    })
    .catch((error) => {
        console.error("Error loading Google Maps API:", error);
    });

function initMap() {
    // Gissningskartan
    guessMap = new google.maps.Map(document.getElementById("guess-map"), {
        center: { lat: 61.0, lng: 15.0 },
        zoom: 5,
    });

    // Lägg till click-händelselyssnare på guessMap för att markera spelarens gissning
    guessMap.addListener("click", (event) => {
        placeGuessMarker(event.latLng);
    });

    // Street View Panorama
    streetViewPanorama = new google.maps.StreetViewPanorama(
        document.getElementById("street-view"),
        {
            pov: { heading: 165, pitch: 0 },
            zoom: 1,
        }
    );

    loadNewStation();
}

function loadNewStation() {
    // Välj en slumpmässig station
    currentStation = stations[Math.floor(Math.random() * stations.length)];
    
    // Kontrollera om Street View-data finns
    const svService = new google.maps.StreetViewService();
    const location = new google.maps.LatLng(currentStation.lat, currentStation.lng);
    svService.getPanorama({ location: location, radius: 500 }, (data, status) => {
        if (status === 'OK') {
            streetViewPanorama.setPosition(location);
            streetViewPanorama.setPov({ heading: 165, pitch: 0 });
            streetViewPanorama.setZoom(1);  // Återställ zoom för att säkerställa att spelaren börjar med en enhetlig vy
        } else {
            console.warn("No Street View available for this location. Loading a new station...");
            loadNewStation(); // Ladda en ny station om Street View-data saknas
        }
    });

    updateUI(); // Uppdatera UI med ny plats och ny gissningsräknare
}

function placeGuessMarker(latLng) {
    // Om det redan finns en markör, flytta den till den nya platsen
    if (guessMarker) {
        guessMarker.setPosition(latLng);
    } else {
        // Annars skapa en ny markör
        guessMarker = new google.maps.Marker({
            position: latLng,
            map: guessMap,
            title: "Din gissning"
        });
    }

    // Visa knappen för att bekräfta gissningen
    confirmButton.style.display = "block";

    // Lagra den nuvarande latLng för bekräftelse
    confirmButton.onclick = () => handleGuess(latLng);
}

function handleGuess(latLng) {
    // Beräkna avstånd mellan gissningen och den faktiska stationen
    const stationLatLng = new google.maps.LatLng(currentStation.lat, currentStation.lng);
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
        stationLatLng,
        latLng
    );

    // Poängsystem: 5000 poäng om på exakt plats, mindre ju längre ifrån
    let roundScore = Math.max(5000 - Math.round(distance / 100), 0);
    score += roundScore;

    alert(`Din gissning gav ${roundScore} poäng.`);

    guessCount++;
    updateUI(); // Uppdatera UI efter att poäng och gissningar uppdateras

    // Dölja knappen efter att gissningen bekräftats
    confirmButton.style.display = "none";

    if (guessCount < 5) {
        loadNewStation();
    } else {
        endGame();
    }
}


function endGame() {
    alert(`Spelet är slut! Din poäng: ${score}`);
    highscoreList.push(score);
    highscoreList.sort((a, b) => b - a);
    updateHighscoreList();
    score = 0;
    guessCount = 0;

    updateUI(); // Uppdatera UI efter återställning av poäng och gissningar

    // Återställ markör
    if (guessMarker) {
        guessMarker.setMap(null);
        guessMarker = null;
    }
}

function updateHighscoreList() {
    const highscoreElement = document.getElementById("highscore-list");
    highscoreElement.innerHTML = "";
    highscoreList.forEach((score, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. Poäng: ${score}`;
        highscoreElement.appendChild(li);
    });
    document.getElementById("highscore").style.display = "block";
}

function updateUI() {
    // Uppdatera gissningsräknaren och totalpoängen
    document.getElementById('guess-counter').textContent = `${guessCount + 1}/5`;
    document.getElementById('total-score').textContent = `Poäng: ${score}`;
}
