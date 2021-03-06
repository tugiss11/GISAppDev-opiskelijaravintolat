﻿
nokia.Settings.set("app_id", "pDOGtkxwxdAkuQCiL7e4"); 
nokia.Settings.set("app_code", "cyPj3vIrgjsZy9sgWqga-g");
// App-tiedot
var Location = new nokia.maps.geo.Coordinate(60.1808, 24.9375);
var userLocation = new nokia.maps.geo.Coordinate(60.1808, 24.9375);
var envelope = [24.6375, 59.8810];
var reitin_pituus;
var bubble_version = 0;

//käyttäjän antaman paikan koordinaatit
var coordinates = [];

// DOM node kartalle
var mapContainer = document.getElementById("mapContainer");
// InfoBubble
var infoBubbles = new nokia.maps.map.component.InfoBubbles(),
	marker;
   
// Kartan luonti

var standardMarkerProps = [
	null,
	{
		brush: {
			color:"FF0000"
		}
	}
]

var map = new nokia.maps.map.Display(mapContainer, {
    // Alkusijanti ja zoom level
    center: [60.1808, 24.9375],
    minZoomLevel: 12,
	maxZoomLevel: 17,
	zoomLevel: 13,
    components: [
        //infoBubble
		infoBubbles,
		// Zoom ja pan tools
		new nokia.maps.map.component.ZoomBar(),
        new nokia.maps.map.component.Behavior()
    ]
});

//Oman sijainnin marker
var SijaintiMarker = new nokia.maps.map.StandardMarker(map.center, {brush: "#FF0000"});  

// Reitinhaku
var router = new nokia.maps.routing.Manager();

document.getElementById("nappiseuraava").disabled = true;

//markkereille
var TOUCH = nokia.maps.dom.Page.browser.touch,
	CLICK = TOUCH ? "tap" : "click";

//Käyttäjän sijainti
if (nokia.maps.positioning.Manager) {
    var positioning = new nokia.maps.positioning.Manager();
    // Alkaa kun kartta ladattu
    map.addListener("displayready", function () {
        // Hakee sijainnin
        positioning.getCurrentPosition(
         
            function (position) {
                var coords = position.coords; // koordinaatit
                    SijaintiMarker = new nokia.maps.map.StandardMarker(coords, standardMarkerProps[1]); //marker
					
					
					Location = position.coords;
                    if ((Math.abs(Location.longitude - envelope[0]) > 0.2) || (Math.abs(Location.latitude - envelope[1]) > 0.2)) {
                        map.objects.clear();
                        fetchNearest(Location.longitude, Location.latitude);
                    }
                    map.objects.add(SijaintiMarker);
					map.setCenter(coords);
					map.setZoomLevel(15);
					

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
var mapRoute = 0; //reittimuuttuja jonka avulla muut funktiot voi tarkistaa onko olemassa olevia reittejä

var onRouteCalculated = function (observedRouter, key, value) {
        if (value == "finished") {
            var routes = observedRouter.getRoutes();
            //haetaan reitti
            
            mapRoute = new nokia.maps.routing.component.RouteResultSet(routes[0]).container;
            map.objects.add(mapRoute);
       
            map.zoomTo(mapRoute.getBoundingBox(), false, "default");
			
			//otetaan talteen reitin pituus sadan metrin tarkkuudella
			reitin_pituus = routes[0].summary.distance;
			reitin_pituus = Math.round(reitin_pituus/100)*100;
			
            var id1 = lahin[indeksi].id;
            getInfo(id1);
            
        } else if (value == "failed") {
            alert("Reitin haku epäonnistui. Yritä uudelleen");
        }
    };

router.addObserver("state", onRouteCalculated);

//reitin modet

var modes = [{
    type: "shortest", 
    transportModes: ["pedestrian"],
    options: "avoidTollroad",
    trafficMode: "default"
}];


//Markkerin kartalle lisäys -funktio
function addMarkerToMap(x, y, id) 
{
	var id = id;
	var x = x;
	var y = y;
		
		var ravintolamarker = new nokia.maps.map.Marker(
			[y,x],
			{
				$click : 'clicking_the_marker(myValue);',
				icon: "images/1393904341_97_pisara_proj_6_pien.png",
				anchor: new nokia.maps.util.Point(14, 36)
			}
			)
		;

		ravintolamarker.addListener(CLICK, function(evt) {
			if (( evt.target.$href === undefined) == false){
				window.location = evt.target.$href; 
			}  else if (( evt.target.$click === undefined) == false){
				var onClickDo = new Function(evt.target.$click);
				window.myValue = id;
				onClickDo();
			}
		});
		
			map.objects.add(ravintolamarker);
};

function clicking_the_marker(val)
{
	if (bubble_version == 0) {
		bubble_version = 1;
	}
	getInfo(val);
};	

//Markkereiden luonti -funktio
function markers()
{
	for (var i = 0; i < ravintolat.length; i++)
		{
		x_mark = parseFloat(ravintolat[i]["xkoord"]);
		y_mark = parseFloat(ravintolat[i]["ykoord"]);
		id_mark = parseFloat(ravintolat[i]["id"]);
		
		addMarkerToMap(x_mark, y_mark, id_mark);
		}
};
//markkerit luodaan
markers();
//tiedetään mihin lahin taulun ravintolaista haetaan reitti
var indeksi = 0;



function button() //etsii lähimmän ravintolan
{
	infoBubbles.closeAll();
	if (bubble_version == 1) {
		bubble_version = 0;
	}
	if(SijaintiMarker) {
		map.objects.remove(SijaintiMarker);
	}				
		
	var startpoint;
	//tarkistetaan käytetäänkö geolocation vai käyttäjän antamaa sijaintia
	if (document.getElementById("searchbox-input").value=="")
	{
		startpoint = Location;
		lahin = [];
	}
	else
	{
		startpoint = userLocation;
		lahin = [];
	}

	//poistetaan vanha reitti jos sellainen on
	if (mapRoute !==0)
	{
		mapRoute.destroy();
	}
	if (ravintolat.length > 0) {
        //luodaan taulu jossa etäisyydet ravintoloihin
        for (var i = 0; i < ravintolat.length; i++)
            {
            lista(ravintolat[i]["id"], parseFloat(ravintolat[i]["xkoord"]), parseFloat(ravintolat[i]["ykoord"]));
            }
        //järjestetään taulu että lähin on ensimmäinen
        lahin.sort(function(a,b)
        {
            return a.etaisyys - b.etaisyys;
        })
        SijaintiMarker = new nokia.maps.map.StandardMarker(startpoint, standardMarkerProps[1]);
        map.objects.add(SijaintiMarker);
        //valitaan lähin ravintola
        indeksi = 0;
        x = parseFloat(lahin[indeksi].x);
        y = parseFloat(lahin[indeksi].y);
        var waypoints = new nokia.maps.routing.WaypointParameterList();
        waypoints.clear();
        waypoints.addCoordinate(startpoint); 
       
        waypoints.addCoordinate(new nokia.maps.geo.Coordinate(y,x));
        router.calculateRoute(waypoints, modes);
        document.getElementById("nappiseuraava").disabled = false;
        
        
    } else {
        alert("Ei ravintoloita lähimailla. :(");
    }
};

function button2() //etsii seuraavaksi lähimmän ravintolan
{
	if (bubble_version == 1) {
		bubble_version = 0;
	}
	var startpoint;
	//tarkistetaan käytetäänkö geolocation vai käyttäjän antamaa sijaintia
	if (document.getElementById("searchbox-input").value=="")
	{
		startpoint = Location;
	}
	else
	{
		startpoint = userLocation;
	}
	
	//poistetaan vanha reitti
	
	mapRoute.destroy();
	//valitaan seuraavana taulussa oleva ravintola, käydään läpi  2km sisällä olevat ja palataan ensimmmäiseen
	if (lahin[indeksi].etaisyys < 2000)
	{
	indeksi = indeksi+1;
	}
	if (lahin[indeksi].etaisyys > 2000)
	{
		indeksi = 0;
	}
	x = parseFloat(lahin[indeksi].x);
	y = parseFloat(lahin[indeksi].y);
	var waypoints = new nokia.maps.routing.WaypointParameterList();
	waypoints.clear();
    waypoints.addCoordinate(startpoint);
    waypoints.addCoordinate(new nokia.maps.geo.Coordinate(y,x));
    router.calculateRoute(waypoints, modes);
    
};


function button3()
{
	infoBubbles.closeAll();				
	if (mapRoute !==0)
	{
		mapRoute.destroy();	
	}	
	if(SijaintiMarker)
	{
		map.objects.remove(SijaintiMarker);
	}
		if (document.getElementById("searchbox-input").value!=="")
		{
			customSearchBox.search();

		}
		else
		{
			map.setCenter(Location);
            
            if ((Math.abs(Location.longitude - envelope[0]) > 0.2) || (Math.abs(Location.latitude - envelope[1]) > 0.2)) {
                map.objects.clear();
                fetchNearest(Location.longitude, Location.latitude);
            }
            
			SijaintiMarker = new nokia.maps.map.StandardMarker(map.center, standardMarkerProps[1]);
			
			map.setZoomLevel(15);
			map.objects.add(SijaintiMarker);
		}
	document.getElementById("nappiseuraava").disabled = true;	
	
};
//taulu etäisyyksille ravintoloihin
var lahin = [];

function lista(id, x, y) //laskee etäisyydet ravintoloihin
{
	var startpoint;
	if (document.getElementById("searchbox-input").value=="")
	{
		startpoint = Location;
	}
	else
	{
		startpoint = userLocation;
	}
	var Location2 = new nokia.maps.geo.Coordinate(y,x); 
	var z = Location2.distance(startpoint);

	lahin.push(new ravintola(id, z, x, y));
	

};
//ravintola objekti
function ravintola(id, etaisyys,x,y)
	{
		this.id = id;
		this.etaisyys = etaisyys;
        this.x = x;
        this.y = y;
	}

	  
    
var customSearchBox = new nokia.places.widgets.SearchBox({
			targetNode: "customSearchBox",
			template: "customSearchBox",
			searchCenter: function () {
				return {
					latitude: 60.1808,
					longitude: 24.9375
				};
			},
			onResults: function (data) {
                if(SijaintiMarker) {
                    map.objects.remove(SijaintiMarker);
                }
				locations = data.results ? data.results.items : [data.location];
				coordinates = [locations[0].position.latitude, locations[0].position.longitude];
				userLocation = new nokia.maps.geo.Coordinate(coordinates[0], coordinates[1]);
				map.setCenter(userLocation);
                if (mapRoute !==0)
				{
					mapRoute.destroy();	
				}
                infoBubbles.closeAll();	
                if ((Math.abs(userLocation.longitude - envelope[0]) > 0.2) || (Math.abs(userLocation.latitude - envelope[1]) > 0.2)) {
                        map.objects.clear();
                        fetchNearest(userLocation.longitude, userLocation.latitude);
                }
				SijaintiMarker = new nokia.maps.map.StandardMarker(map.center, {brush: "#FF0000"});
				map.setZoomLevel(15);
				map.objects.add(SijaintiMarker);
							
                document.getElementById("nappiseuraava").disabled = true;
			}
});    


//infobubblen luonti -funktio
function infobubbles(id1, nim, osoit, kunt, webosoit, rss, x_bub, y_bub)
{
    var x = parseFloat(x_bub)
	var y = parseFloat(y_bub)
	var coord = new nokia.maps.geo.Coordinate (y, x);
	var linkki;
    if (rss == 1 || rss == 2) {
        var w = "'" + webosoit + "'"
        linkki = '"javascript:void(0)" onClick="getMenu('+ rss + ', ' + w + ')"';
    } else {
        linkki = '"' + webosoit + '" target="_blank"';
    }
	var bubbleUiElt = document.getElementById("bubble");
	htmlBubbleUiElt = document.getElementById("htmlBubble");
	htmlStr = '<div>' +
		'<p>' +
		'<h2>' +
		nim +
		'<br />' +
		'</h2>' +
		osoit +
		' ' +
		kunt + 
		'</p>';
        if (rss == 0) {
            htmlStr += '<p><a href=' + linkki + '>' + 'RUOKALISTA <br/>&gt; ravintolan sivuille</a></p>';
        } else if (!(rss == 3)) {
            htmlStr += '<p><a href=' + linkki + '>' + 'RUOKALISTA</a></p>';
        }
        var nim1 = "'" + nim + "'";
        var osoit1 = "'" + osoit + "'";
        var kunt1 = "'" + kunt + "'";
        var webosoit1 = "'" + webosoit + "'";
		if (bubble_version == 0) {
			htmlStr += '<p>' + "Etäisyys ravintolaan n. " + reitin_pituus  + " m." + '</p>';
		}
        htmlStr += '<div><a href="javascript:void(0)" onClick="editRestaurant(' + id1 + ',' + nim1 + ',' + osoit1 + ',' + kunt1 + ',' + webosoit1 + ')" title="Muokkaa"><span id="edit" class="ui-icon ui-icon-pencil"></span></a></div></div>';
	bubble = infoBubbles.openBubble(htmlStr, coord, "", false);  
};

    
function getInfo(id1) {
// fetches restaurants name, address and website from the database
    $.ajax({
      url: "index.php/site/getdata/" + id1,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(response, status){
           infobubbles(id1, response["nimi"], response["osoite"], response["kunta"], response["webosoite"], response["rss"], response["xkoord"], response["ykoord"]);	
      },
      error: function error(jqXHR, textStatus, errorThrown) {
            alert("Ravintolan tietojen haku epäonnistui.");
      }
    });

}

function getMenu(rss, www) {
// creates menu
    //get weekday
    var d = new Date();
    var weekday = d.getDay();
    //var www1 = encodeURIComponent(www);
    //weekday = 5;
    $.ajax({
      url: "index.php/site/getmenu?wday=" + weekday + "&rss=" + rss + "&wwwa=" + www,
      success: function(response, status){
            $("#menuDialog").dialog();
            $("#menuDialog").dialog("option", "position", { my: "center top", at: "center top", of: "#content", collision: "flipfit", within: "#content"});
            $("#menuDialog").html(response);
          },
      error: function error(jqXHR, textStatus, errorThrown) {
            alert("Ravintolan menun muodostaminen epäonnistui.");
      }
    });

}

function fetchNearest(currentX,currentY) {
// fetches restaurants within specific range from the database
    $.ajax({
      url: "index.php/site/getnearest?x=" + currentX + "&y=" + currentY,
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(response, status){
            ravintolat = [];
            lahin = [];
            ravintolat = response;
           markers();
      },
      error: function error(jqXHR, textStatus, errorThrown) {
            alert("Ravintoloiden haku epäonnistui.");
      }
    });

}

function editRestaurant(id1,nimi1,osoite1,kunta1,www1) {
    $("#editDialog").dialog();
    $("#editDialog").dialog('option', 'title', 'Ehdota korjausta');
    $("#notExists").show();
    $("#editDialog").show();
    
    //populate form fields
    $("#hiddenId").val(id1);
    $('#EditForm_muutos_nimi').val(nimi1);
    $("#EditForm_muutos_osoite").val(osoite1);
    $("#EditForm_muutos_kunta").val(kunta1);
    if (!(www1.toLowerCase() == 'null')) { 
        $("#EditForm_muutos_www").val(www1);
    }
   
}


$(function() {
  $('#edit-restaurant-form').submit(function(event) {
  
    var muutos_id = $("#hiddenId").val();
    if (muutos_id == "") {
        muutos_id = 0;
    }
    var data=$("#edit-restaurant-form").serialize();
    var form = $(this);
    
    $.ajax({
        type: "POST",
        url: "index.php/site/sugedit?eid=" + muutos_id,
        data: data,
        dataType: "html",
    }).done(function(response) {
            $("#editDialog").dialog('close');
            $("#responseDialog").dialog();
            $("#responseDialog").html(response);
    }).fail(function() {
      alert("Muutosehdotus epäonnistui.");
    });
    event.preventDefault(); // Prevent the form from submitting via the browser.
    $("#hiddenId").val("");
  });
});

function addRestaurant() {
    $("#editDialog").dialog();
    $("#editDialog").dialog('option', 'title', 'Ehdota uutta ravintolaa');
    $("#notExists").hide();
    $("#editDialog").show();
    $('#EditForm_muutos_nimi').val("");
    $("#EditForm_muutos_osoite").val("");
    $("#EditForm_muutos_kunta").val("");
    $("#EditForm_muutos_www").val("");
}

function removeRestaurant() {
    var id1 = $("#hiddenId").val();
    $.ajax({
        url: "index.php/site/sugrem?rid=" + id1,
        success: function(response, status){
            $("#editDialog").dialog('close');
            $("#responseDialog").dialog();
            $("#responseDialog").html("Poistoehdotus lähetetty.");
        },
        error: function error(jqXHR, textStatus, errorThrown) {
            alert("Poistoehdotus epäonnistui.");
        }
    });
}
