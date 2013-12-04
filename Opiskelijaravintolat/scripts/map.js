
nokia.Settings.set("app_id", "pDOGtkxwxdAkuQCiL7e4"); 
nokia.Settings.set("app_code", "cyPj3vIrgjsZy9sgWqga-g");
// App-tiedot
var Location = new nokia.maps.geo.Coordinate(0, 0);

// DOM node kartalle
var mapContainer = document.getElementById("mapContainer");
// Kartan luonti
var map = new nokia.maps.map.Display(mapContainer, {
    // Alkusijanti ja zoom level
    center: [60.1808, 24.9375],
    minZoomLevel: 9,
	maxZoomLevel: 17,
	zoomLevel: 9,
    components: [
        // Zoom ja pan tools
        new nokia.maps.map.component.Behavior()
    ]
});
// Reitinhaku
var router = new nokia.maps.routing.Manager();



//Käyttäjän sijainti
if (nokia.maps.positioning.Manager) {
    var positioning = new nokia.maps.positioning.Manager();
    // Alkaa kun kartta ladattu
    map.addListener("displayready", function () {
        // Hakee sijainnin
        positioning.getCurrentPosition(
         
            function (position) {
                var coords = position.coords, // koordinaatit
                    alkusijainti = new nokia.maps.map.StandardMarker(coords); //marker
					
					map.objects.add(alkusijainti);
					Location = position.coords;
					map.setCenter(coords);
					map.setZoomLevel(14);
					

            }, 
            // virheilmoitukset
            function (error) {
                var errorMsg = "Location could not be determined: ";
                
                
                if (error.code == 1) errorMsg += "PERMISSION_DENIED";
                else if (error.code == 2) errorMsg += "POSITION_UNAVAILABLE";
                else if (error.code == 3) errorMsg += "TIMEOUT";
                else errorMsg += "UNKNOWN_ERROR";
                    
                
                    alert(errorMsg);
            }
        );
    });
}
var mapRoute = 0;

var onRouteCalculated = function (observedRouter, key, value) {
        if (value == "finished") {
            var routes = observedRouter.getRoutes();
            
            
            mapRoute = new nokia.maps.routing.component.RouteResultSet(routes[0]).container;
            map.objects.add(mapRoute);
       
            map.zoomTo(mapRoute.getBoundingBox(), false, "default");
        } else if (value == "failed") {
            alert("Reitin haku epäonnistui. Yritä uudelleen");
        }
    };

router.addObserver("state", onRouteCalculated);



var modes = [{
    type: "shortest", 
    transportModes: ["pedestrian"],
    options: "avoidTollroad",
    trafficMode: "default"
}];


//Markkereiden luonti -funktio
function markers()
{
	for (var i = 0; i < ravintolat.length; i++)
		{
		x = parseFloat(ravintolat[i]["xkoord"]);
		y = parseFloat(ravintolat[i]["ykoord"]);

		var ravintolamarker = new nokia.maps.map.StandardMarker([y,x]);
		ravintolamarker.brush.color = "#0000FF";
		map.objects.add(ravintolamarker);
		}
};
//markkerit luodaan
markers();

var indeksi = 0;

function button() //etsii lähimmän ravintolan
{
	var startpoint;
	if (document.forms["userlocation"]["inputbox"].value=="")
	{
		startpoint = Location;
		lahin = [];
	}
	else
	{
		startpoint = userLocation;
		lahin = [];
	}
	
	if (mapRoute !==0)
	{
		mapRoute.destroy();
	}
	
	
	for (var i = 0; i < ravintolat.length; i++)
		{
		lista(ravintolat[i]["id"], parseFloat(ravintolat[i]["xkoord"]), parseFloat(ravintolat[i]["ykoord"]));
		}
	
	lahin.sort(function(a,b)
	{
		return a.etaisyys - b.etaisyys;
	})
	
	indeksi = 0;
	x = parseFloat(ravintolat[lahin[indeksi].id-1]["xkoord"]);
	y = parseFloat(ravintolat[lahin[indeksi].id-1]["ykoord"]);
	var waypoints = new nokia.maps.routing.WaypointParameterList();
    waypoints.addCoordinate(startpoint);
    waypoints.addCoordinate(new nokia.maps.geo.Coordinate(y,x));
    router.calculateRoute(waypoints, modes);

};

function button2() //etsii seuraavaksi lähimmän ravintolan
{
	var startpoint;
	if (document.forms["userlocation"]["inputbox"].value=="")
	{
		startpoint = Location;
	}
	else
	{
		startpoint = userLocation;
	}
	
	
	mapRoute.destroy();
	if (indeksi < 4)
	{
	indeksi = indeksi+1;
	}
	else
	{
	indeksi = 0
	}
	x = parseFloat(ravintolat[lahin[indeksi].id-1]["xkoord"]);
	y = parseFloat(ravintolat[lahin[indeksi].id-1]["ykoord"]);
	var waypoints = new nokia.maps.routing.WaypointParameterList();
	waypoints.clear();
    waypoints.addCoordinate(startpoint);
    waypoints.addCoordinate(new nokia.maps.geo.Coordinate(y,x));
    router.calculateRoute(waypoints, modes);
};

var userLocation;

function button3()
{
	
	map.objects.clear();
	markers();
	//luodaan  ravintolat markkerit uudestaan hävitettyjen tilalle
	if (document.forms["userlocation"]["inputbox"].value!=="")
	{
		
		getCoordinates(document.forms["userlocation"]["inputbox"].value);

	}
	else
	{
		map.setCenter(Location);
		var Marker = new nokia.maps.map.StandardMarker(map.center);
		//Marker.brush.color = "#FF0000";
		map.setZoomLevel(14);
		map.objects.add(Marker);
	}
		
	
};

var lahin = [];

function lista(id, x, y) //laskee etäisyydet ravintoloihin
{
	var startpoint;
	if (document.forms["userlocation"]["inputbox"].value=="")
	{
		startpoint = Location;
	}
	else
	{
		startpoint = userLocation;
	}
	var Location2 = new nokia.maps.geo.Coordinate(y,x); 
	var z = Location2.distance(startpoint);

	lahin.push(new ravintola(id, z));
	

};

function ravintola(id, etaisyys)
	{
		this.id = id;
		this.etaisyys = etaisyys;
	}

var coordinates = [];
	
function getCoordinates(address) 
	{
		
		var searchCenter = new nokia.maps.geo.Coordinate(60.1808, 24.9375),
			searchManager = nokia.places.search.manager,
			resultSet;
		// callback funktio
		var processResults = function (data, requestStatus) {
			
			if (requestStatus == "OK") {
			coordinates = [data.location.position.latitude, data.location.position.longitude];
			userLocation = new nokia.maps.geo.Coordinate(coordinates[0], coordinates[1])
			map.setCenter(userLocation);
			var SijaintiMarker = new nokia.maps.map.Marker(map.center);
			
			map.setZoomLevel(14);
			map.objects.add(SijaintiMarker);
				
				
			} else {
				alert("The search request failed");
			}
		return coordinates;
		};
		searchManager.geoCode({
				searchTerm: address,
				onComplete: processResults
				});
		
		
		
		
	};