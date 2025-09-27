// Using axios to do calls
axios.defaults.headers.common['Content-Type'] = "application/json";

axios.defaults.baseURL = "https://api.jikan.moe/v4";

// Request interceptor
axios.interceptors.request.use(request => {
    request.metadata = request.metadata || {};
    request.metadata.start_time = new Date();

    console.log(`Request started at: ${request.metadata.start_time.toLocaleTimeString("en-US")}`);
    document.body.style.cursor = "progress";
    return request;
});

// Response interceptor
axios.interceptors.response.use(function onFullfilled(response) {
    document.body.style.cursor = "default";

    // Calculate how long the request took
    const timeElapsed = new Date().getTime() - response.config.metadata.start_time.getTime();
    console.log(`Request took ${timeElapsed} ms.`);
    return response;
});

export async function getAnimeList() {
    const response = await axios.get(`/anime?type=tv&min_score=8&order_by=mal_id`);
    return response.data;
}

export async function getAnimeCharacters(animeId) {
    const response = await axios.get(`/anime/${animeId}/characters`);
    return response.data;
}