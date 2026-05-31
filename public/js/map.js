document.addEventListener("DOMContentLoaded", () => {
    // We expect listingLocation to be defined in the script block in show.ejs
    const map = L.map('map').setView([0, 0], 2); // default view

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Geocode the location
    if (typeof listingLocation !== 'undefined') {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(listingLocation)}`)
            .then(response => response.json())
            .then(data => {
                if (data && data.length > 0) {
                    const lat = data[0].lat;
                    const lon = data[0].lon;
                    
                    map.setView([lat, lon], 12);
                    
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup(`<h4>${listingLocation}</h4><p>Exact location provided after booking.</p>`, { offset: [0, -15] })
                        .openPopup();
                } else {
                    console.log("Location not found");
                }
            })
            .catch(error => {
                console.error("Error fetching geocoding data:", error);
            });
    }
});