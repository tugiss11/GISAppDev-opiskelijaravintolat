<?php
/* @var $this SiteController */

$this->pageTitle=Yii::app()->name;
?>

<div id="mapContainer">
</div>
<div id="menuDialog" title="Menu"></div>
<div id="infoDialog" title="Käyttäjätestaus">
    <p>Palvelu etsii omasta sijainnistasi tai antamastasi osoitteesta 2 km säteellä sijaitsevat opiskelijaravintolat.<br/>
    Ole hyvä ja <a href="https://docs.google.com/forms/d/1Du5x12R6Mv0JxK5y94mEWLHsh2R7wUOmgOdD8CEx1N4/viewform" target="_blank">anna testipalautetta palvelusta</a></p>
</div>
<table id="btntbl">

	<tr>
		<td>
			<input type="button" value="Etsi lähin" onclick="button()" id="nappilahin"/>
		</td>
		<td>
			<input type="button" value="Seuraava" onclick="button2()" id="nappiseuraava"/>
		</td>
	</tr>
	<tr>
		<td class="lighttd">
			<div id="customSearchBox" class="main-search">
				<div module="SearchBox">
					<input id="searchbox-input" rel="searchbox-input" class="main-search" type="text" placeholder="Oma sijainti" value=""/>
					<div rel="searchbox-list" class="search-list"></div>
				</div>
			</div>
		</td>
		<td>
			<input type="button" value="Näytä sijainti" onclick="button3()" id="nappinayta"/> 
		</td>
	</tr>

</table>
<script type="text/javascript" charset="UTF-8" src="http://js.cit.api.here.com/se/2.5.3/jsl.js?with=all"></script>
<script type="text/javascript">

    var ravintolat = [];
    <?php $js_array = json_encode($restaurants);
    echo "ravintolat = ". $js_array . ";\n";
    ?>
</script>
