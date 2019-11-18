
/* Global Variables */
const apiKey = 'ce1851b2e2f6e29c6d67b23da3cbf352';

// Third party api url & our own server endpoints url's
const weatherURL = "api.openweathermap.org/data/2.5/weather?";
const fetchURL = "http://localhost:5000/get-latest";
const saveURL = "http://localhost:5000/save";


const _getMonthAsString = monthIndex => {
  return [
    'Jan', 'Feb','March','April','May','June',
    'July','Aug','Sept','Oct',
    'Nov','Dec'
  ][monthIndex];
};

// Create a new date instance dynamically with JS. It will be used as today's date
let date = new Date();
let currentDate = _getMonthAsString(date.getMonth()) + " " + date.getDate() + ", " + date.getFullYear();

// We set today's date in our readonly input field
const todayDateElement = document.getElementById('current-day');
todayDateElement.value = currentDate;


const _fetchWeatherData = async (token, zip = "11230") => {
  // we build our data necessary for doing the fetch operation from weather api
  const url = `http://${weatherURL}zip=${zip}&appid=${token || apiKey}&units=imperial`;
  const response = await fetch(url);
  return await response.json();
};


const _postData = async (path, data = {}) => {
  await fetch(path, {
    method: "POST",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json"
    },
    redirect: "follow",
    body: JSON.stringify(data)
  })
};

const feelingsInput = document.getElementById('feelz');
const tokenInput = document.getElementById("key");
const zipInput = document.getElementById("zip");


const contentInput = document.getElementById("content");
const dateInput = document.getElementById("date");
const tempInput = document.getElementById("temp");
// Method used to fetch latest entry and update our UI with this information.
const _fetchLatestEntryAndUpdateUI = async () => {
  const response = await fetch(fetchURL);
  const jsonData = await response.json();

  if (jsonData != null) {
    const { content, date, temp } = jsonData;
    contentInput.innerHTML = "Message: " + content;
    dateInput.innerHTML = "Date: " + date;
    tempInput.innerHTML = "Temperature: " + temp + "°F";
  }
};

// Method used to save a journal entry
const _saveEntry = async () => {
  const feelings = feelingsInput.value ? feelingsInput.value.trim() : null;
  const token = tokenInput.value ? tokenInput.value.trim() : null;
  const zip = zipInput.value ? zipInput.value.trim() : null;

  if (feelings === null) {
    window.alert("A journal entry about today's feelings is required in order to perform save operation.");
    return;
  }

  if (zip === null) {
    window.alert("Default zip code 11230 will be used as you have not provided a value.");
  }

  await _fetchWeatherData(token, zip || "11230").then((response) => {
    if (response != null) {
      // we check our response to see if we are in the city not found situation
      const errCode = response.cod;
      const errMessage = response.message;

      if (errCode === "404" || errMessage === "city not found") {
        window.alert("City was not found based on the zip value you've entered. Please enter a US zip code.");
      } else {
        const timestamp = new Date();
        const dataEntry = {
          temp: response.main ? response.main.temp : null,
          date: `${_getMonthAsString(timestamp.getMonth())} / ${timestamp.getDate()} / ${timestamp.getFullYear()}`,
          content: feelingsInput.value
        };
        _postData(saveURL, dataEntry).then(() => {
          window.alert("Entry was saved successfully!");
          _fetchLatestEntryAndUpdateUI().then(() => {
            window.alert("Latest entry was updated successfully!");
          });
        });
      }
    } else {
      window.alert("There was an error!");
    }
  }).catch(() => {
    // we are in situation of a server error so we need to let the user know about it
    window.alert("Server error! Please try again.");
    return null;
  });
};

// We set the event listener for the element with the id of "generate"
const saveButton = document.getElementById("generate");
saveButton.addEventListener("click", _saveEntry);
