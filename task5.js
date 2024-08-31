const apiKey = '2f6da3047fdb593f8ea05df07e5d38bd';
const forecastElement = document.getElementById('requestContainer');
const cityInput = document.querySelector('.cityInput');
let cityResults = [];

// Function to fetch weather data
function getWeatherData(city) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayWeatherData(data);
            saveCityResults(city, data);
        })
        .catch(error => console.log(error));
}

// Function to save city results
function saveCityResults(city, data) {
    const cityResult = {
        city: city,
        data: data
    };
    cityResults.push(cityResult);
    saveCityResultsToLocalStorage();
}

// Function to display weather data
function displayWeatherData(data) {
    const resultsContainer = document.createElement('div');
    const leftResultsContainer = document.createElement('div');
    leftResultsContainer.classList.add('leftResultsContainer');
    const rightResultsContainer = document.createElement('div')
    rightResultsContainer.classList.add('rightResultsContainer');
    resultsContainer.classList.add('results-container');
    leftResultsContainer.innerHTML = `<h2>${data.city.name}</h2>`;
    const cityName = data.city.name;
    const imageContainer = document.createElement('div');
    imageContainer.classList.add('image-container');

    // Utilize the Unsplash API key here
    const unsplashAPIKey = 'AiqYxksAAmVPOVVR6n9vE2drMH51LW2zqShmaa0bBOU';

    // Make a request to the Unsplash API to retrieve an image of the city
    fetch(`https://api.unsplash.com/search/photos?query=${cityName}&client_id=${unsplashAPIKey}`)
        .then(response => response.json())
        .then(data => {
            const photo = data.results[0]; // Get the first photo from the results list
            console.log(photo);
            if (photo === undefined) {
                const image = document.createElement('img');
                image.src = 'assets/default.png'
                imageContainer.appendChild(image);
            } else {
                const image = document.createElement('img');
                image.src = photo.urls.regular;
                image.alt = "Picture of " + cityName;
                imageContainer.appendChild(image);
            }
            // Add the image to the image container
            // imageContainer.appendChild(image);
        })
        .catch(error => console.log(error));

    leftResultsContainer.appendChild(imageContainer);

    const temperatureData = [];
    const dates = [];

    for (let i = 0; i < data.list.length; i++) {
        const forecast = data.list[i];
        const temperature = convertKelvinToCelsius(forecast.main.temp);
        const date = new Date(forecast.dt_txt).toLocaleDateString();

        if (i % 8 === 0) {
            temperatureData.push(temperature);
            if (!dates.includes(date)) {
                dates.push(date)
            }
        }
    }

    const chartContainer = document.createElement('canvas');
    chartContainer.id = 'temperatureChart';
    leftResultsContainer.appendChild(chartContainer);

    // Create the line chart using Chart.js
    new Chart(chartContainer, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Temperature (°C)',
                data: temperatureData,
                backgroundColor: 'rgba(255, 255, 255, 0.986)',
                borderColor: 'rgba(255, 255, 255, 0.986)',
                borderWidth: 1,
                pointRadius: 3,
                pointBackgroundColor: 'rgba(255, 255, 255, 0.986)',
                pointBorderColor: 'rgba(255, 255, 255, 0.986)',
                pointHoverRadius: 5,
                pointHoverBackgroundColor: 'rgba(255, 255, 255, 0.986)',
                pointHoverBorderColor: 'rgba(255, 255, 255, 0.986)',
            }]
        },
        options: {
            legend: {
                labels: {
                    fontColor: "white"
                }
            },
            scales: {
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'white'
                    }
                }
            }
        }
    });

    for (let i = 0; i < data.list.length; i++) {
        const forecast = data.list[i];
        const temperature = convertKelvinToCelsius(forecast.main.temp);
        const description = forecast.weather[0].description.replace(/\s/g, '');
        const iconTime = forecast.weather[0].icon;
        let currentIconTime = "https://openweathermap.org/img/w/" + iconTime + ".png";
        const date = new Date(forecast.dt_txt);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayOfWeek = daysOfWeek[date.getDay()];
        const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
        if (i % 8 === 0) {
            const forecastItem = document.createElement('li');
            forecastItem.classList.add('forecast-item');
            forecastItem.innerHTML = `
            <p>${dayOfWeek} - ${formattedDate}</p>
            <p>${temperature} °C</p>
            <p><img src="${currentIconTime}"></p>     
            `;
            rightResultsContainer.appendChild(forecastItem);
        }
    }
    const description = data.list[0].weather[0].description.replace(/\s/g, '');
    resultsContainer.classList.add(description);
    resultsContainer.appendChild(leftResultsContainer);
    resultsContainer.appendChild(rightResultsContainer);
    forecastElement.appendChild(resultsContainer);
    changeBackgroundImage();
}

// Event listener for the submit button
const submitBtn = document.querySelector('.submitBtn');
submitBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();

    if (city !== '') {
        getWeatherData(city);
        cityInput.value = '';
        changeBackgroundImage();
    }
});

// Event listener for the Enter key
cityInput.addEventListener('keypress', event => {
    if (event.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city !== '') {
            getWeatherData(city);
            cityInput.value = '';
            changeBackgroundImage();
        }
    }
});
// Clear results
const clearBtn = document.querySelector('.clearBtn');
clearBtn.addEventListener('click', () => {
    forecastElement.innerHTML = '';
    cityResults = [];
    localStorage.removeItem('cityResults');
});

// Function to convert temperature from Kelvin to Celsius
function convertKelvinToCelsius(kelvin) {
    return Math.round(kelvin - 273.15);
}

// Function to save city results to localStorage
function saveCityResultsToLocalStorage() {
    localStorage.setItem('cityResults', JSON.stringify(cityResults));
}

function changeBackgroundImage() {
    const resultsContainers = document.querySelectorAll('.results-container');

    resultsContainers.forEach(resultsContainer => {
        const classList = resultsContainer.classList;

        classList.forEach(className => {
            switch (className) {
                case 'clearsky':
                    resultsContainer.style.backgroundImage = "url('assets/clear_sky.png')";
                    break;
                case 'fewclouds':
                    resultsContainer.style.backgroundImage = "url('assets/scattered_clouds.png')";
                    break;
                case 'scatteredclouds':
                    resultsContainer.style.backgroundImage = "url('assets/scattered_clouds.png')";
                    resultsContainer.style.color = 'rgba(53, 53, 53, 0.911)'
                    break;
                case 'brokenclouds':
                    resultsContainer.style.backgroundImage = "url('assets/scattered_clouds.png')";
                    break;
                case 'overcastclouds':
                    resultsContainer.style.backgroundImage = "url('assets/few_clouds.png')";
                    break;
                case 'showerrain':
                    resultsContainer.style.backgroundImage = "url('assets/rain.png')";
                    break;
                case 'moderaterain':
                    resultsContainer.style.backgroundImage = "url('assets/rain.png')";
                    break;
                case 'lightrain':
                    resultsContainer.style.backgroundImage = "url('assets/rain.png')";
                    break;
                case 'rain':
                    resultsContainer.style.backgroundImage = "url('assets/rain.png')";
                    break;
                case 'thunderstorm':
                    resultsContainer.style.backgroundImage = "url('assets/thunderstorm.jpg')";
                    break;
                case 'snow':
                    resultsContainer.style.backgroundImage = "url('assets/snow.jpg')";
                    break;
                case 'mist':
                    resultsContainer.style.backgroundImage = "url('assets/mist.jpg')";
                    break;
                default:
                    break;
            }
        });
    });
}


document.addEventListener('DOMContentLoaded', () => {
    const savedCityResults = localStorage.getItem('cityResults');
    if (savedCityResults) {
        cityResults = Array.from(JSON.parse(savedCityResults));
        cityResults.forEach(result => {
            displayWeatherData(result.data);
        });
    }
});