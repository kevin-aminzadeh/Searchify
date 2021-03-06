// =======================
// Model Class Definitions
// =======================

class Event {
  constructor(id, name, venueName, venueUrl, images, url, info, notes) {
    this.id;
    this.name;
    this.date;
    this.startTime;
    this.venueName;
    this.venueUrl;
    this.images;
    this.url;
    this.artists;
    this.info;
    this.notes;
  }
}

// =======================
// Application Service Class Definition
// =======================
class EventService {
  constructor() {
    this.queryBaseURL =
      "https://app.ticketmaster.com/discovery/v2/events.json?apikey=2wklXXwfJkLzbYFxIvoGSwhehNloF33O&classificationName=music&dmaId=701&sort=date,asc";
    this.API_KEY = "2wklXXwfJkLzbYFxIvoGSwhehNloF33O";
  }

  // Fetch Events From TicketMaster API (Returns Promise)
  fetchEvents(stateCode, startDate, endDate) {
    let queryData = {};
    if (stateCode) {
      queryData.stateCode = stateCode;
    }
    if (startDate) {
      queryData.startDateTime = startDate + "T00:00:00Z";
    }

    if (endDate) {
      queryData.endDateTime = endDate + "T00:00:00Z";
    }

    return $.ajax({
      url: this.queryBaseURL,
      method: "GET",
      data: queryData,
    });
  }

  // Fetch Saved Events From LocalStorage
  fetchSavedEvents() {
    let savedEvents = [];
    for (let i = 0; i < localStorage.length; i++) {
      let event = JSON.parse(localStorage.getItem(localStorage.key(i)));
      savedEvents.push(event);
    }
    return savedEvents;
  }

  saveEvent(event) {
    localStorage.setItem(`${event.id}`, JSON.stringify(event));
  }

  clearSavedEvents() {
    localStorage.clear();
  }
}

class SpotifySearchService {
  constructor() {
    this.authToken;
  }

  getAuthToken() {
    const queryURL = "https://accounts.spotify.com/api/token";
    const clientKey =
      "OTIwMTI1MTA1ODZjNDllY2FjYWRkNjg3MTNjYzdhMmU6MjEzNTg0MTBhMzE4NDJhY2E1Mzc2YTFhMzcyNmJmYTY=";

    return $.ajax({
      url: queryURL,
      method: "POST",
      data: {
        grant_type: "client_credentials",
      },
      headers: {
        Authorization: `Basic ${clientKey}`,
      },
    });
  }

  async fetchArtist(name) {
    const token = await this.getAuthToken();

    const queryURL = "https://api.spotify.com/v1/search";
    return $.ajax({
      url: queryURL,
      method: "GET",
      data: {
        q: name,
        type: "artist",
      },
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
  }
}

// =======================
// Application Controller Class Definition
// =======================
class App {
  constructor() {
    // Instantiate View Components
    this.homeView = new HomeView(this);
    this.resultsView = new ResultsView(this);
    this.eventDetailsView = new EventDetailsView(this);
    this.savedEventsView = new SavedEventsView(this);
    this.navbar = new NavBar(this);

    // Instantiate Service Providers
    this.eventService = new EventService();
    this.spotifySearchService = new SpotifySearchService();

    // Render Default View
    this.renderHome();
  }

  renderHome() {
    // Render Default View
    this.homeView.render();
    this.homeView.attachEventHandlers();
    this.navbar.render();
    this.navbar.attachEventHandlers();
  }

  renderEventDetails(event) {
    this.eventDetailsView.render(event);
    this.eventDetailsView.attachEventHandlers(event);
    this.navbar.render();
    this.navbar.attachEventHandlers();
  }

  async getEvents(stateCode, startDate, endDate) {
    // Fetch Events from Event Service
    const events = await this.eventService.fetchEvents(
      stateCode,
      startDate,
      endDate
    );
    // Render Results View
    this.resultsView.render(events);
    // Attach Results View Event Handlers
    this.resultsView.attachEventHandlers();
    this.navbar.render();
    this.navbar.attachEventHandlers();
  }

  getSavedEvents() {
    // Fetch Saved Events From Local Storage
    const events = this.eventService.fetchSavedEvents();
    this.savedEventsView.render(events);
    // Attach Saved Events View Event Handlers
    this.savedEventsView.attachEventHandlers();

    // Render Navbar Component
    this.navbar.render();
    this.navbar.attachEventHandlers();
  }
}

// =======================
// || View Class Definitions
// =======================

// Page Class Definitions

class HomeView {
  constructor(app) {
    this.app = app;
    this.template = `
      <!-- Search Component -->
      <section
        class="hero is-light is-fullheight search-panel"
        id="search-component"
      >
        <div class="hero-body">
          <div class="container has-text-centered">
            <div class="columns has-text-centered">
              <div class="column">
                <h1 class="title is-1 has-text-centered">
                  Find out what's happening in your state!
                </h1>
              </div>
            </div>
            <form id="search-form">
              <div class="columns is-justify-content-center">
                <!-- Search Input -->
                <div class="field column is-two-thirds">
                  <div class="control has-icons-left">
                    <input
                      class="input is-rounded is-large"
                      id="keyword"
                      type="text"
                      placeholder="Enter your state code"
                      maxlength="3"
                    />
                    <span class="icon is-small is-left">
                      <svg
                        class="svg-inline--fa fa-map-marker-alt fa-w-12"
                        aria-hidden="true"
                        focusable="false"
                        data-prefix="fas"
                        data-icon="map-marker-alt"
                        role="img"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 384 512"
                        data-fa-i2svg=""
                      >
                        <path
                          fill="currentColor"
                          d="M172.268 501.67C26.97 291.031 0 269.413 0 192 0 85.961 85.961 0 192 0s192 85.961 192 192c0 77.413-26.97 99.031-172.268 309.67-9.535 13.774-29.93 13.773-39.464 0zM192 272c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"
                        ></path>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
              <div class="columns is-justify-content-center">
                <!-- Date Pickers -->
                <div
                  class="field column is-grouped is-grouped-centered is-grouped-multiline"
                >
                  <div class="control">
                    <label for="startDate" class="label">Start Date</label>
                    <input type="date" class="input" id="startDate" />
                  </div>
                  <div class="control">
                    <label for="endDate" class="label">End Date</label>
                    <input type="date" class="input" id="endDate" />
                  </div>
                </div>
              </div>

              <div class="columns is-justify-content-center mt-5">
                <!-- Form Button -->
                <div class="field column is-one-quarter">
                  <div class="control">
                    <button
                      type="submit"
                      class="button is-rounded is-medium is-fullwidth is-primary"
                      id="searchButton"
                    >
                      <span class="icon">
                        <i class="fas fa-search"></i>
                      </span>
                      <span> Search </span>
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    `;
  }

  attachEventHandlers() {
    $("#search-form").on("submit", (e) => {
      e.preventDefault();
      this.app.getEvents(
        e.target[0].value,
        e.target[1].value,
        e.target[2].value
      );
    });
  }

  render() {
    // Clear Body Content
    $(".app-root").empty();
    // Append View Component To Body Element
    $(".app-root").append(this.template);
  }
}

class ResultsView {
  constructor(app) {
    this.app = app;
    this.template = `
      <!-- Results View Component -->
        <section class="section" id="results">
         <div class="container" id="results-container">
         <h1 class="title" id="results-heading">
         </h1>
          </div>
      </section>
    `;
  }
  attachEventHandlers() {}

  render(data) {
    const events = data._embedded.events;
    const eventsCount = data.page.totalElements;

    // Clear Body Content
    $(".app-root").empty();
    // Append View Component To Body Element
    $(".app-root").append(this.template);

    // Select #results Element from DOM
    const resultsContainerEl = $("#results-container");

    // Select Results Heading Element From DOM
    $("#results-heading").text(`Found ${eventsCount} events.`);

    const columns = '<div class="columns"></div>';
    let cardCount = 0;
    // Render Event Cards
    for (const event in events) {
      const card = new EventCard(this.app, events[event]);

      if (cardCount === 0 || cardCount % 3 === 0) {
        resultsContainerEl.append(columns);
        resultsContainerEl.children().last().append(card.render());
        card.attachEventHandlers();
        cardCount++;
      } else {
        resultsContainerEl.children().last().append(card.render());
        card.attachEventHandlers();
        cardCount++;
      }
    }
  }
}

class EventDetailsView {
  constructor(app) {
    this.app = app;
    this.template = `
      <!--|| Event Details View Component-->
      <!-- Event Details Hero Component -->
      <section class="hero is-primary is-medium has-background" id="artist-banner">
        <img class="hero-background" src="" id="event-banner-image"></img>
        <div class="overlay"></div>
                    <button class="button is-primary save-btn" style="position: absolute; top: 5%; right: 5%;">
    Save Event
            </button>;
        <div class="container mx-6">
          <div class="hero-body pl-6" id="hero-text">
            <p class="title is-1 has-text-weight-bold" id="event-title">
              
            </p>
      <!-- Event Venue Element -->
      <div class="icon-text mb-0 level">
              <div class="level-left">
                <span class="icon level-item">
                  <i class="fas fa-map-marker-alt"></i>
                </span>
                <span class="subtitle is-size-4 level-item" id="event-venue"
                  >Lions Art Factory</span
                >
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Event Details Info Component -->
      <section class="section" id="info">
        <div class="container">
          <div class="columns">
            <div class="column">
              <h1 class="title" id="about-heading">About</h1>
            </div>

          </div>
          
          <p id="about-text"></p>
          <a class="button is-primary mt-5" id="tickets-btn">Buy Tickets</a>
        </div>
      </section>

      <!-- Event Artists Component -->
      <section class="section" id="artists">
        <div class="container" id="artists-wrapper">
          <div class="columns">

          </div>
        </div>
      </section>
    `;
  }
  attachEventHandlers(event) {
    $(`.save-btn`).on("click", () => {
      this.app.eventService.saveEvent(event);
      $(".save-btn").prop("disabled", true);
      $(".save-btn").text("Event Saved");
    });
  }

  async render(event) {
    // Clear Body Content
    $(".app-root").empty();
    // Append View Component To Body Element
    $(".app-root").append(this.template);

    // Set Event Banner Image
    $("#event-banner-image").attr("src", `${event.images[0].url}`);

    // Set Event Title
    $("#event-title").text(event.name);

    // Set Event Venue
    $("#event-venue").text(event._embedded.venues[0].name);

    // Set About Text
    $("#about-text").text(event.info);

    // Set Buy Tickets Button href
    $("#tickets-btn").attr("href", `${event.url}`);

    let cardCount = 0;

    for (const artist in event._embedded.attractions) {
      const artistSearchRes = await this.app.spotifySearchService.fetchArtist(
        event._embedded.attractions[artist].name
      );

      console.log(artistSearchRes);

      const artistsWrapperEl = $("#artists-wrapper");
      const columns = '<div class="columns"></div>';

      const card = `
            <div class="column is-one-third">
              <div class="card" id="card-${artistSearchRes.artists.items[0].id}">
                <div class="card-image">
                  <figure class="image">
                    <img
                      src="${artistSearchRes.artists.items[0].images[0].url}"
                      alt="${artistSearchRes.artists.items[0].name}"
                    />
                  </figure>
                </div>
                <div class="card-content">
                  <div class="content">
                    <h3 id="artist-name">${artistSearchRes.artists.items[0].name}</h3>
                  </div>
                </div>
                <div class="card-footer">
                  <a href="${artistSearchRes.artists.items[0].external_urls.spotify}" class="card-footer-item">View on Spotify</a>
                </div>
              </div>
            </div>
      `;

      if (cardCount === 0 || cardCount % 3 === 0) {
        artistsWrapperEl.append(columns);
        artistsWrapperEl.children().last().append(card);
        cardCount++;
      } else {
        artistsWrapperEl.children().last().append(card);
        cardCount++;
      }
    }
  }
}

class SavedEventsView {
  constructor(app) {
    this.app = app;
    this.template = `
      <!-- Save Events View Component -->
        <section class="section" id="saved-events">
         <div class="container" id="saved-events-container">
          <div class="columns">
            <div class="column">
              <h1 class="title" id="saved-events-heading">
            </div>
            <div class="column has-text-right">
              <a id="clear-button">Clear Saved Events </a>
            </div>
          </div>
         
         
          </div>
      </section> 
    `;
  }

  attachEventHandlers() {
    $("#clear-button").on("click", () => {
      this.app.eventService.clearSavedEvents();
      $("#saved-events-heading").text(`Found 0 Saved Events.`);
      $("#card-list-wrapper").empty();
    });
  }

  render(events) {
    const eventsCount = events.length;
    // Clear Body Content
    $(".app-root").empty();
    // Append View Component To Body Element
    $(".app-root").append(this.template);

    // Select #saved-events-container Element from DOM
    const savedEventsContainerEl = $("#saved-events-container");

    // Select Saved Events Heading Element From DOM
    $("#saved-events-heading").text(`Found ${eventsCount} Saved Events.`);

    const columns = '<div class="columns" id="card-list-wrapper"></div>';
    let cardCount = 0;

    // Render Event Cards
    for (const event in events) {
      const card = new EventCard(this.app, events[event]);

      if (cardCount === 0 || cardCount % 3 === 0) {
        savedEventsContainerEl.append(columns);
        savedEventsContainerEl.children().last().append(card.render());
        card.attachEventHandlers();
        cardCount++;
      } else {
        savedEventsContainerEl.children().last().append(card.render());
        card.attachEventHandlers();
        cardCount++;
      }
    }
  }
}

// Component Class Definitions

class NavBar {
  constructor(app) {
    this.app = app;
    this.template = `
      <!-- Navbar Component -->
      <nav
        class="navbar is-justify-content-center is-align-content-center"
        role="navigation"
        aria-label="main navigation"
      >
        <!-- Logo -->
        <div class="navbar-brand">
          <a
            class="navbar-item title has-text-primary has-text-weight-bold"
            id="homeButton"
          >
            Searchify
          </a>
        </div>
        <!-- Menu Items -->
        <div id="app-navbar" class="navbar-menu">
          <div class="navbar-end">
            <div class="navbar-item">
              <div class="buttons">
                <a class="button is-light" id="savedButton">
                  <span class="icon">
                    <i class="fas fa-star"></i>
                  </span>
                  <span> Saved Events </span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>
    `;
  }

  attachEventHandlers() {
    // Home Button Event Listener
    $("#homeButton").on("click", () => {
      this.app.renderHome();
    });
    // Saved Events Button Event Listener
    $("#savedButton").on("click", () => {
      this.app.getSavedEvents();
    });
  }

  render() {
    // Append View Component To Body Element
    $(".app-root").prepend(this.template);
  }
}

class EventCard {
  constructor(app, event) {
    this.app = app;
    this.event = event;
    this.id = event.id;
    this.imgUrl = event.images[0].url;
    this.name = event.name;
    this.venueName = event._embedded.venues[0].name;
    this.startDate = event.dates.start.localDate;
    this.startTime = event.dates.start.localTime;
    this.date = new Date(
      this.startDate.substr(0, 4),
      this.startDate.substr(6, 1) - 1,
      this.startDate.substr(8, 2)
    );

    this.template = `
      <div class="column is-one-third">
        <!-- Card Component V2 -->
       <a id="card-${this.id}">
        <div class="card event-card tile-is-child is-flex is-flex-direction-column flex-grow-5" id="card-${
          this.id
        }">
          <!-- Card Image Element -->
          <div class="card-image">
            <figure class="image is-16by9">
              <img
                src="${this.imgUrl}"
                alt="Placeholder image"
              />
            </figure>
            <div class="overlay">
            </div>
          </div>
          <!-- Card Content Flex Wrapper -->
          <div class="is-flex is-flex-direction-row" style="height: 100%;">
            <div class="card-content py-3 is-flex-grow-5">
              <div class="content">
                <div class="text">
                  <p
                    class="is-uppercase is-family-monospace has-text-weight-bold is-size-4 mb-0"
                  >
                    ${this.name}
                  </p>
                  <!-- Event Venue Element -->
                  <div class="icon-text mb-0">
                   
                      <span class="icon">
                        <i class="fas fa-map-marker-alt"></i>
                      </span>
                      <span
                        class="is-size-6 has-text-grey"
                        id="event-venue"
                        >${this.venueName}</span
                      >
              
                  </div>
                  <!-- Event Time Element -->
                  <div class="icon-text mb-0 ">
                   
                      <span class="icon">
                        <i class="fas fa-clock"></i>
                      </span>
                      <time
                        class="is-size-6 has-text-grey"
                        id="event-time"
                        >${this.startTime}</time
                      >
                    
                  </div>
                </div>
              </div>
            </div>
            <!-- Event Date Block Element -->
            <div
              class="card-footer is-flex-direction-column has-background-danger has-text-white px-5 has-text-centered is-justify-content-center py-6"
              style="border: none"
            >
              <h3
                class="is-size-3 has-text-weight-bold mb-1"
                style="line-height: 24px"
              >
                ${this.startDate.substr(8, 9)}
              </h3>
              <h3 class="is-size-6 has-text-weight-light is-uppercase">
                ${this.date.toLocaleString("en-us", { month: "short" })}
              </h3>
            </div>
          </div>
        </div>
        </a>
        <!-- //Card Component V2 -->
        

    </div>
    `;
  }
  attachEventHandlers() {
    $(`#card-${this.id}`).on("click", (e) => {
      e.stopPropagation();
      this.app.renderEventDetails(this.event);
    });
  }
  render() {
    return this.template;
  }
}

const app = new App();
