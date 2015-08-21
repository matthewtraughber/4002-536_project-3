// GLOBAL VARIABLE INITIALIZATION
var states = { 
	'AK' : 'AK',
	'AL' : 'AL',
	'AR' : 'AR',
	'AZ' : 'AZ',
	'CA' : 'CA',
	'CO' : 'CO',
	'CT' : 'CT',
	'DC' : 'DC',
	'DE' : 'DE',
	'FL' : 'FL',
	'GA' : 'GA',
	'HI' : 'HI',
	'IA' : 'IA',
	'ID' : 'ID',
	'IL' : 'IL',
	'IN' : 'IN',
	'KS' : 'KS',
	'KY' : 'KY',
	'LA' : 'LA',
	'MA' : 'MA',
	'MD' : 'MD',
	'ME' : 'ME',
	'MI' : 'MI',
	'MN' : 'MN',
	'MO' : 'MO',
	'MS' : 'MS',
	'MT' : 'MT',
	'NC' : 'NC',
	'ND' : 'ND',
	'NE' : 'NE',
	'NH' : 'NH',
	'NJ' : 'NJ',
	'NM' : 'NM',
	'NV' : 'NV',
	'NY' : 'NY',
	'OH' : 'OH',
	'OK' : 'OK',
	'OR' : 'OR',
	'PA' : 'PA',
	'RI' : 'RI',
	'SC' : 'SC',
	'SD' : 'SD',
	'TN' : 'TN',
	'TX' : 'TX',
	'UT' : 'UT',
	'VA' : 'VA',
	'VT' : 'VT',
	'WA' : 'WA',
	'WI' : 'WI',
	'WV' : 'WV',
	'WY' : 'WY'
}; 


// *****************************************************************************
// Constructor function
// *****************************************************************************
$(function() {
	// Creates initial form
	createInitialForm();
	
	// Populates organization type select values
	getData('/OrgTypes');
	
	// Sets selected state to NY
	$('#state option[value="NY"]').attr('selected', 'selected');
	
	// Populates city select values
	getData('/Cities?state=NY');
	
	// jQuery plugin for form labels
	$("label").inFieldLabels();
});


// *****************************************************************************
// Function to create generic AJAX call to get data
// *****************************************************************************
function getData(dataPath) {
	// Catch for invalid naming convention of treatments (SIMON ISSUE)
	if (dataPath.indexOf('Treatment') >= 0) {
		dataPath += "s";
	}

	// Configures AJAX request
	var request = $.ajax({
		type: 'get',
		async: true,
		cache: false,
		url: 'proxy/proxy.php',
		dataType: 'xml',
		data: {path: dataPath},
	});
		
	// Calls function to direct data if AJAX call completed successfully
	request.done(function(data) {
		directData(dataPath, data);
	});

	// Alerts user if AJAX call failed
	request.fail(function() {
		console.log( "MESSAGE: Request failed!");
	});
}


// *****************************************************************************
// Function to direct AJAX call data to correct handler function
// *****************************************************************************
function directData(dataPath, data) {
	// DEBUGGING START ---
	// console.log("MSG - " + dataPath);
	// console.log(data);
	// console.log("");
	// DEBUGGING END ---

	// Detects specific path scenarios
	// Catch for org select
	if (dataPath.indexOf('/OrgTypes') >= 0) {
		populateOrgValues(data);
	}
	// Catch for city select
	else if (dataPath.indexOf('/Cities?state=') >= 0) {
		var state = dataPath.substr(dataPath.length - 2);
		populateCityValues(data, state);
	}
	// Catch for no cities
	else if ((dataPath.split("&").length - 1) == 4) {
		alert("There are currently no cities in the selected state!");
	}
	// Catch for form submit
	else if ((dataPath.split("&").length - 1) == 5) {
		var orgType = dataPath.substring(dataPath.indexOf('?type=') + 6, dataPath.indexOf('&name'));
		displaySearchResults(data, orgType);
	}
	// Catch for item selection
	else if (dataPath.indexOf('/Application/Tabs?orgId=') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('=') + 1);
		displaySelectedItem(data, orgID);
	}
	// Catch for selected item general information
	else if (dataPath.indexOf('General') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/General'));
		getGeneral(data, orgID);
	}
	// Catch for selected item location information
	else if (dataPath.indexOf('Locations') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/Locations'));
		getLocations(data, orgID);
	}
	// Catch for selected item training information
	else if (dataPath.indexOf('Training') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/Training'));
		getTraining(data, orgID);
	}
	// Catch for selected item treatment information
	else if (dataPath.indexOf('Treatments') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/Treatment'));
		getTreatment(data, orgID);
	}
	// Catch for selected item equipment information
	else if (dataPath.indexOf('Equipment') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/Equipment'));
		getEquipment(data, orgID);
	}
	// Catch for selected item facilities information
	else if (dataPath.indexOf('Facilities') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/Facilities'));
		getFacilities(data, orgID);
	}
	// Catch for selected item physicians information
	else if (dataPath.indexOf('Physicians') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/Physicians'));
		getPhysicians(data, orgID);
	}
	// Catch for selected item people information
	else if (dataPath.indexOf('People') >= 0) {
		var orgID = dataPath.substring(dataPath.indexOf('/') + 1, dataPath.indexOf('/People'));
		getPeople(data, orgID);
	}
	// Default selection (error message)
	else {
		console.log('MESSAGE: Error directing data!');
	}
}


// *****************************************************************************
// Function to create initial form
// *****************************************************************************
function createInitialForm() {
	// Creates form tag
	var form = $('<form />');
	$(form).attr('id', 'mainForm');
	$(form).attr('class', 'shadow');
	
	// Creates form fieldset
	var fieldset = $('<fieldset />');
	form.append(fieldset);
	
	// Creates form legend
	var legend = $('<legend />');
	legend.append('Search Criteria');
	fieldset.append(legend);
	
	// -------- SUB SECTION START --------
		// Creates p tag to hold mini-section
		var pTag = $('<p />');
		fieldset.append(pTag);
		
		// Creates organization type label
		var orgTypeLabel = $('<label />');
		$(orgTypeLabel).attr('for', 'orgType');
		orgTypeLabel.append('Organization Type:');
		pTag.append(orgTypeLabel);
		
		// Creates organization type select
		var orgType = $('<select />');
		$(orgType).attr('id', 'orgType');
		$(orgType).attr('name', 'type');
		$(orgType).attr('onchange', 'changeOrgLabel(this)');
		pTag.append(orgType);
	// --------- SUB SECTION END ---------
	
	// -------- SUB SECTION START --------
		// Creates p tag to hold mini-section
		var pTag = $('<p style="padding-bottom: 1em" />');
		fieldset.append(pTag);
		
		// Creates organization name label
		var orgNameLabel = $('<label />');
		$(orgNameLabel).attr('id', 'orgNameLabel');
		$(orgNameLabel).attr('class', 'textInput');
		$(orgNameLabel).attr('for', 'orgName');
		orgNameLabel.append('Organization Name');
		pTag.append(orgNameLabel);
		
		// Creates organization name input
		var orgName = $('<input />');
		$(orgName).attr('id', 'orgName');
		$(orgName).attr('name', 'name');
		$(orgName).attr('type', 'text');
		pTag.append(orgName);
	// --------- SUB SECTION END ---------
	
	// -------- SUB SECTION START --------
		// Creates p tag to hold mini-section
		var pTag = $('<p style="padding-bottom: 1em"/>');
		fieldset.append(pTag);
		
		// Creates state label
		var stateLabel = $('<label />');
		$(stateLabel).attr('for', 'state');
		stateLabel.append('State:');
		pTag.append(stateLabel);
		
		// Creates state select
		var stateSelect = $('<select />');
		$(stateSelect).attr('id', 'state');
		$(stateSelect).attr('name', 'state');
		$(stateSelect).attr('onchange', 'getData("/Cities?state=" + $("#state").val())');
		pTag.append(stateSelect);
		
		// Creates all states select option
		var allStateOption = $('<option />');
		$(allStateOption).attr('value', '');
		allStateOption.append('All States');
		stateSelect.append(allStateOption);
		
		// Creates state select options (by iterating over the states object)
		$.each(states, function(key, value) { 
			var stateOption = $('<option />');
			$(stateOption).attr('value', key);
			stateOption.append(value);
			stateSelect.append(stateOption);
		});
		
		// Creates span tag to hold the city search input (when created)
		var citySpan = $('<div />');
		$(citySpan).attr('id', 'city');
		pTag.append(citySpan);
	// --------- SUB SECTION END ---------
	
	// -------- SUB SECTION START --------
		// Creates p tag to hold mini-section
		var pTag = $('<p />');
		fieldset.append(pTag);
		
		// Creates county label
		var countyLabel = $('<label />');
		$(countyLabel).attr('class', 'textInput');
		$(countyLabel).attr('for', 'county');
		countyLabel.append('County');
		pTag.append(countyLabel);
		
		// Creates county input
		var county = $('<input />');
		$(county).attr('id', 'county');
		$(county).attr('name', 'county');
		$(county).attr('type', 'text');
		pTag.append(county);
	// --------- SUB SECTION END ---------
	
	// -------- SUB SECTION START --------
		// Creates p tag to hold mini-section
		var pTag = $('<p />');
		fieldset.append(pTag);
		
		// Creates zip label
		var zipLabel = $('<label />');
		$(zipLabel).attr('class', 'textInput');
		$(zipLabel).attr('for', 'zip');
		zipLabel.append('Zip');
		pTag.append(zipLabel);
		
		// Creates zip input
		var zip = $('<input />');
		$(zip).attr('id', 'zip');
		$(zip).attr('name', 'zip');
		$(zip).attr('type', 'text');
		pTag.append(zip);
	// --------- SUB SECTION END ---------
	
	// -------- SUB SECTION START --------
		// Creates p tag to hold mini-section
		var pTag = $('<p />');
		fieldset.append(pTag);
		
		// Creates submit button
		var submitButton = $('<input />');
		$(submitButton).attr('id', 'searchCriteria');
		$(submitButton).attr('value', 'Search');
		$(submitButton).attr('type', 'button');
		$(submitButton).attr('onclick', 'getData("/Organizations?" + $("#mainForm").serialize())');
		pTag.append(submitButton);
		
		// Creates reset button
		var resetButton = $('<input />');
		$(resetButton).attr('id', 'searchCriteria');
		$(resetButton).attr('value', 'Reset');
		$(resetButton).attr('type', 'reset');
		$(resetButton).attr('onclick', 'resetForm()');
		pTag.append(resetButton);
		
		// Sets ENTER keybind to submit form
		form.keydown(function(event) {
			if (event.which == 13) {
				getData("/Organizations?" + $("#mainForm").serialize());
			}
		});
		
	// --------- SUB SECTION END ---------
	
	// Places form on page
	$('#content').append(form);
	
	// Animates initial form display
	$(form).delay(300).animate({'opacity' : '1'}, 2000);
	
	// Creates search results placeholder
	var searchResults = $('<div />');
	$(searchResults).attr('id', 'searchResults');
	$('#content').append(searchResults);	
	
	// Creates initial banner
	var banner = $('<span />');
	$(banner).attr('id', 'banner');
	$(banner).append("Local Government Organization Directory");
	$('#searchResults').append(banner);
	
	// Creates paginator placeholder
	var paginator = $('<div />');
	$(paginator).attr('id', 'paginator');
	$(paginator).attr('class', 'paginator');
	$('#mainForm').append(paginator);
	
	// Creates search results table placeholder
	var searchResultsTable = $('<div />');
	$(searchResultsTable).attr('id', 'searchResultsTable');
	$('#searchResults').append(searchResultsTable);
	
	// Creates tab container placeholder
	var selectedItemInfo = $('<div />');
	$(selectedItemInfo).attr('id', 'selectedItemInfo');
	$("#content").append(selectedItemInfo);
}


// *****************************************************************************
// Function to reset form styles
// *****************************************************************************
function resetForm() {
	// Slides content away
	$("#searchResults").animate({"margin-left" : "-80em", "opacity" : "0"}, 500,  function() {
		// Clears previous results (in case data is already being displayed)
		$("#paginator, #searchResultsTable, #selectedItemInfo, #banner").empty();
		
		// Hides banner, and fills it with text content
		$("#banner").css({"opacity" : "0"}).append("Local Government Organization Directory");
		
		// Hides paginator
		$("#paginator").css({"opacity" : "0"});
		
		// Prepares searchResults ID for banner
		$("#searchResults").css({"background-color" : "transparent"}).removeClass("shadow");
	});

	// Slides and fades searchResults back in
	$("#searchResults").animate({"margin-left" : "0em", "opacity" : "1"}, 500, function() {
		// Fades in banner
		$("#banner").animate({"opacity" : "1"}, 500);
	});
	
	// Populates city select values
	getData('/Cities?state=NY');
}


// *****************************************************************************
// Function to populate organization values
// *****************************************************************************
function populateOrgValues(data) {
	// Adds default blank selection to search all
	var x = '<option value="">--- search all ---</option>';
	
	// Iterates over all returned values, creates select options
	$('row', data).each(function() {
		x += '<option value="' + $(this).find('type').text() +'">' + $(this).find('type').text() + '</option>';
	});

	// Appends select options to org type selector
	$('#orgType').append(x);
}


// *****************************************************************************
// Function to change organization field label
// *****************************************************************************
function changeOrgLabel(org) {
	// Gets selected org type
	var orgType =  org.options[org.selectedIndex].value;
	
	// Updates organization name label
	if (orgType == "Physician") {
		$('#orgNameLabel').empty().append('Physician Name');
	} else {
		$('#orgNameLabel').empty().append('Organization Name');
	}
}

// *****************************************************************************
// Function to populate relevant city values
// *****************************************************************************
function populateCityValues(data, state) {
	// Detects if no cities are returned
	if ($(data).find('city').length == 0) {
		$('#city').html('There are currently no cities in ' + state + '!');
	} else {
		// Adds default blank selection to search all
		var x = '<select name="town"><option value="">--- search all ---</option>';

		// Iterates over all returned values, creates select options
		$('city', data).each(function(){
			x += '<option value="' + $(this).text() + '">' + $(this).text() + '</option>';
		});

		// Appends select options to city selector
		$('#city').html(x);
	}
}


// *****************************************************************************
// Function to display search data
// *****************************************************************************
function displaySearchResults(data, orgType) {
	// Slides content away
	$("#searchResults").animate({"margin-left" : "-80em", "opacity" : "0"}, 1000,  function() {
		// Detects if records exist for the query
		if ($(data).find("row").length > 0) {
			// Hides banner
			$("#banner").css({"opacity" : "0"});
			
			// Clears previous results (in case data is already being displayed)
			$("#paginator, #searchResultsTable, #selectedItemInfo, #banner").empty();

			// Prepares searchResults ID for table
			$('#searchResults').css({"background-color" : "#8395A2"}).attr('class', 'shadow');
			
			// Animates results display
			$('#searchResults').animate({'margin-left' : '0em', 'opacity' : '1'}, 1000);
		
			// Function call to create paginator form
			createPaginator();
			
			// Function call to create table of results
			createResultsTable(data, orgType);
			
		} else {
			// Alert for no records found
			// alert("No records available");
			///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// need to change from alert
			
			// Hides banner
			$("#banner").css({"opacity" : "0"});
			
			// Clears previous results (in case data is already being displayed)
			$("#paginator, #searchResultsTable, #selectedItemInfo, #banner").empty();

			// Prepares searchResults ID for table
			$('#searchResults').css({"background-color" : "#8395A2"}).attr('class', 'shadow');
			
			// Animates results display
			$('#searchResults').animate({'margin-left' : '0em', 'opacity' : '1'}, 1000);
			
			$('#searchResults').html('<h3><em id="noResults">No results returned!</em></h3>');
			
	/*
			// Clears previous results (in case data is already being displayed)
			$("#paginator, #searchResultsTable, #selectedItemInfo, #banner").empty();
			
			// Hides banner, and fills it with text content
			$("#banner").css({"opacity" : "0"}).append("Local Government Organization Directory");
			
			// Hides paginator
			$("#paginator").css({"opacity" : "0"});
			
			// Prepares searchResults ID for banner
			$("#searchResults").css({"background-color" : "transparent"}).removeClass("shadow");
			
			// Slides and fades searchResults back in
			$("#searchResults").animate({"margin-left" : "0em", "opacity" : "1"}, 500, function() {
				// Fades in banner
				$("#banner").animate({"opacity" : "1"}, 500);
			});
		*/
		}
	});
}


// *****************************************************************************
// Function to create paginator form
// *****************************************************************************
function createPaginator() {
	var x = '<form>';
	x += '<img src="img/table/first.png" class="first paginatorImg"/><img src="img/table/prev.png" class="prev paginatorImg"/>';
	x += '<input type="text" class="pagedisplay" readonly="readonly" />';
	x += '<img src="img/table/next.png" class="next paginatorImg"/><img src="img/table/last.png" class="last paginatorImg"/>';
	x += '<select class="pagesize">';
		x += '<option selected="selected"  value="10">10</option>';
		x += '<option value="25">25</option>';
		x += '<option value="50">50</option>';
		x += '<option  value="75">75</option>';
		x += '<option  value="100">100</option>';
	x += '</select></form>';
	
	// Adds paginator to page
	$("#paginator").append(x);
	
	// Animates paginator animation
	$("#paginator").animate({"opacity" : "1"}, 2000);
}


// *****************************************************************************
// Function to create table of results
// *****************************************************************************
function createResultsTable(data, orgType) {
	// Creates table
	var x = '<table id="resultsTable" class="tablesorter">';

	// Detects if physician type was sent
	if (orgType != 'Physician') {
		// Defines headers to store search data (non-physician)
		x += '<thead><tr><th>TYPE</th><th>NAME</th><th>CITY</th><th>STATE</th><th>ZIP</th><th>COUNTY</th></tr></thead><tbody>';
	} else {
		 // Defines headers to store search data (physician)
		x += '<thead><tr><th>PHYSICIAN</th><th>PHONE</th><th>HOSPITAL</th><th>CITY</th><th>STATE</th><th>ZIP</th></tr></thead><tbody>';
	}
	
	// Iterates over all returned values, populates table
	$('row', data).each(function(){

		// Initializes variables
		var OrganizationID = $(this).find('OrganizationID').text();	
		var type = $(this).find('type').text();
		var Name = $(this).find('Name').text();
		var Email = $(this).find('Email').text();
		var city = $(this).find('city').text();
		var State = $(this).find('State').text();
		var zip = $(this).find('zip').text();
		var CountyName = $(this).find('CountyName').text();
		var fName = $(this).find('fName').text();
		var mName = $(this).find('mName').text();
		var lName = $(this).find('lName').text();
		var phone = $(this).find('phone').text();

		// Detects if null OrganizationID string entry exists
		if (OrganizationID == "null") {
			OrganizationID = "";
		}
		
		// Detects if null type string entry exists
		if (type == "null") {
			type = "";
		}
		
		// Detects if null Name string entry exists
		if (Name == "null") {
			Name = "";
		}
		
		// Detects if null Email string entry exists
		if (Email == "null") {
			Email = "";
		}

		// Detects if null city string entry exists
		if (city == "null") {
			city = "";
		}
		
		// Detects if null State string entry exists
		if (State == "null") {
			State = "";
		}
		
		// Detects if null zip string entry exists
		if (zip == "null") {
			zip = "";
		}
		
		// Detects if null CountyName string entry exists
		if (CountyName == "null") {
			CountyName = "";
		}
		
		// Detects if null fName string entry exists
		if (fName == "null") {
			fName = "";
		}
		
		// Detects if null mName string entry exists
		if (mName == "null") {
			mName = "";
		}
		
		// Detects if null lName string entry exists
		if (lName == "null") {
			lName = "";
		}
		
		// Detects if null phone string entry exists
		if (phone == "null") {
			phone = "";
		}

		// Detects if physician type was sent
		if (orgType != 'Physician') {
			// Removes certain entries wil primary null values
			if (Name == "" || OrganizationID == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + type + '</td>';
				x += '<td><span class="itemLink" onclick="getData(&#39;/Application/Tabs?orgId=' + OrganizationID + '&#39;)">'+ Name + '</span></td>';
				x += '<td>' + city + '</td>';
				x += '<td>' + State + '</td>';
				x += '<td>' + zip + '</td>';
				x += '<td>' + CountyName + '</td></tr>';
			}
		} else {
			// Removes certain entries wil primary null values
			if (fName == "" && lName == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + fName + ' ' + lName + '</td>';
				x += '<td>' + phone + '</td>';
				x += '<td><span class="itemLink" onclick="getData(&#39;/Application/Tabs?orgId=' + OrganizationID + '&#39;)">'+ Name + '</span></td>';
				x += '<td>' + city + '</td>';
				x += '<td>' + State + '</td>';
				x += '<td>' + zip + '</td></tr>';
			}
		}
	});
	
	// Places table of results on page
	$('#searchResultsTable').html(x + '</tbody></table>');
	
	// jQuery plugin for resizeable table columns (BUGGY)
	//$("#resultsTable").colResizable();
	
	// jQuery plugin for sortable table
	$("#resultsTable").tablesorter(); 
	
	// jQuery plugin for table pagination
	$("#resultsTable").tablesorterPager({container: $("#paginator")});
}


// *****************************************************************************
// Function to display selected item
// *****************************************************************************
function displaySelectedItem(data, orgID){
	// Clears tabs (in case data is already being displayed)
	$("#selectedItemInfo").empty();
	
	// Shows selected item info via lightbox
	$("#selectedItemInfo").lightbox_me();

	// Detects if an error is returned in the selected item data
	if ($(data).find('error').length != 0) {
		alert("Error detected in the selected item data!");
	} else {
		// Creates tab ul
		var tabUL = $('<ul />');
		$(tabUL).attr('class', 'tabs');
		$("#selectedItemInfo").append(tabUL);	
		
		// Creates placeholder div for currently selected tab
		var currentTab = $('<div />');
		$(currentTab).attr('id', 'currentTab');
		$('#selectedItemInfo').append(currentTab);
		
		// Iterates over all returned tabs to create list
		$('Tab', data).each(function(){
			// Creates tab li
			var tabLI = $('<li />');
			$(tabLI).attr('id', $(this).text());
			$(tabLI).attr('class', 'tab');
			$(tabLI).attr('onclick', "getData('/" + orgID + "/" + $(this).text() + "')");
			tabUL.append(tabLI);
			
			// Creates tab p (to hold text)
			var tabP = $('<p />');
			tabP.append($(this).text());
			tabLI.append(tabP);
		});
		
		// Pre-populates the current tab with the general data
		getData('/' + orgID + '/General');
	}
}

// Possible Tabs are: General, Locations, Treatment, Training, Facilities, Equipment, Physicians, People

// *****************************************************************************
// Function to display general information of selected item
// *****************************************************************************
function getGeneral(data, orgID){
	// Marks General tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#General').css('background-color', '#ABDADF');
	
	// Initializes variables
	var name = $(data).find('name').text();	
	var description = $(data).find('description').text();
	var email = $(data).find('email').text();
	var website = $(data).find('website').text();
	var nummembers = $(data).find('nummembers').text();
	var numcalls = $(data).find('numcalls').text();
	var servicearea = $(data).find('servicearea').text();
	
	// Detects if null name string entry exists
	if (name == "null") {
		name = "";
	}
	
	// Detects if null description string entry exists
	if (description == "null") {
		description = "";
	}
	
	// Detects if null email string entry exists
	if (email == "null") {
		email = "";
	}
	
	// Detects if null website string entry exists
	if (website == "null") {
		website = "";
	}
	
	// Detects if null nummembers string entry exists
	if (nummembers == "null") {
		nummembers = "";
	}
	
	// Detects if null numcalls string entry exists
	if (numcalls == "null") {
		numcalls = "";
	}
	
	// Detects if null servicearea string entry exists
	if (servicearea == "null") {
		servicearea = "";
	}

	// Tab title
	var x = '<h3 id="title">General Information</h3>';
	
	// General Information table
	x += '<table id="generalTable" class="tablesorter">';
	
	// Detects if null values are present - if so, doesn't show them
	if (name != "") {
		x += '<tr><td>Name:</td><td>' + name + '</td></tr>';
	}
	
	if (description != "") {
		x += '<tr><td>Description:</td><td>' + description + '</td></tr>';
	}
	
	if (email != "") {
		x += '<tr><td>Email:</td><td>' + email + '</td></tr>';
	}
	
	if (website != "") {
		x += '<tr><td>Website:</td><td>' + website + '</td></tr>';
	}
	
	if (nummembers != "") {
		x += '<tr><td>Members</td><td>' + nummembers + '</td></tr>';
	}
	
	if (numcalls != "") {
		x += '<tr><td>Calls</td><td>' + numcalls + '</td></tr>';
	}
	
	if (servicearea != "") {
		x += '<tr><td>Service Area</td><td>' + servicearea + '</td></tr></table>';
	}

	// Displays General Information table
	$('#currentTab').html(x);
}


// *****************************************************************************
// Function to display location information of selected item
// *****************************************************************************
function getLocations(data, orgID) {
	// Marks Locations tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#Locations').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">Location Information</h3>';
	
	// Gets number of values returned
	var count = $(data).find('count').text();
	
	// Detects if no values are present
	if (count > 1) {
		// Creates select
		x += '<span style="margin:1em; margin-left:1.2em;">Location: </span><select id="location" name="location" onchange="getSpecificLocation(this, ' + orgID + ')" style="margin-top:2em; margin-left:.5em;">';
		
		// Adds default blank selection to search all
		x += '<option value="none">--- please select an option ---</option>';
		
		// Iterates over all returned values, creates select options
		$('location', data).each(function() {
			x += '<option value="' + $(this).find('siteId').text() +'">' + $(this).find('type').text() + ' : ' + $(this).find('address1').text() + '</option>';
		});	
		
		// End select
		x += '</select>';
		
		// Initializes Location Information table
		x += '<table id="locationTable" class="tablesorter selectedItemTable"></table>';
		x += '<div id="googleMap"></div>';
	
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
}


// *****************************************************************************
// Function to display the specific location information of selected item
// *****************************************************************************
function getSpecificLocation(which, orgID) {	
	// Gets selected site ID
	var siteID =  which.options[which.selectedIndex].value;
	
	// Empties no results msg (in case content exists)
	$('#noResults').remove();
	
	// Configures AJAX request (can't use generic call in this situation)
	var request = $.ajax({
		type: 'get',
		async: true,
		cache: false,
		url: 'proxy/proxy.php',
		dataType: 'xml',
		data: {path: '/' + orgID + '/Locations'},
	});
		
	// Calls function to direct data if AJAX call completed successfully
	request.done(function(data) {	
		// Initializes temporary variable
		var x = '';
	
		// Iterates over all locations - gets the selected location
		$('location', data).each(function() {
			// Matches siteId with the selected siteId
			if ($(this).find('siteId').text() == siteID) {
				// Initializes variables
				var type = $(this).find('type').text();	
				var address1 = $(this).find('address1').text();
				var address2 = $(this).find('address2').text();
				var city = $(this).find('city').text();
				var state = $(this).find('state').text();
				var zip = $(this).find('zip').text();
				var phone = $(this).find('phone').text();
				var ttyPhone = $(this).find('ttyPhone').text();
				var fax = $(this).find('fax').text();
				var latVar = $(this).find('latitude').text();
				var longVar = $(this).find('longitude').text();
				var countyId = $(this).find('countyId').text();
				var countyName = $(this).find('countyName').text();
				
				// Detects if null type string entry exists
				if (type == "null") {
					type = "";
				} else if (type != "") {
					x += '<tr><td>Type:</td><td>' + type + '</td></tr>';
				}
				
				// Detects if null address1 string entry exists
				if (address1 == "null") {
					address1 = "";
				} else if (address1 != "") {
					x += '<tr><td>Address 1:</td><td>' + address1 + '</td></tr>';
				}
				
				// Detects if null address2 string entry exists
				if (address2 == "null") {
					address2 = "";
				} else if (address2 != "") {
					x += '<tr><td>Address 2:</td><td>' + address2 + '</td></tr>';
				}
				
				// Detects if null city string entry exists
				if (city == "null") {
					city = "";
				} else if (city != "") {
					x += '<tr><td>City:</td><td>' + city + '</td></tr>';
				}			
				
				// Detects if null state string entry exists
				if (state == "null") {
					state = "";
				} else if (state != "") {
					x += '<tr><td>State:</td><td>' + state + '</td></tr>';
				}
				
				// Detects if null zip string entry exists
				if (zip == "null") {
					zip = "";
				} else if (zip != "") {
					x += '<tr><td>Zip:</td><td>' + zip + '</td></tr>';
				}
				
				// Detects if null phone string entry exists
				if (phone == "null") {
					phone = "";
				} else if (phone != "") {
					x += '<tr><td>Phone:</td><td>' + phone + '</td></tr>';
				}
				
				// Detects if null ttyPhone string entry exists
				if (ttyPhone == "null") {
					ttyPhone = "";
				} else if (ttyPhone != "") {
					x += '<tr><td>TTY Phone:</td><td>' + ttyPhone + '</td></tr>';
				}
				
				// Detects if null fax string entry exists
				if (fax == "null") {
					fax = "";
				} else if (fax != "") {
					x += '<tr><td>Fax:</td><td>' + fax + '</td></tr>';
				}
				
				// Detects if null latitude string entry exists
				if (latVar == "null") {
					latVar = "";
				} else if (latVar != "") {
					x += '<tr><td>Latitude:</td><td>' + latVar + '</td></tr>';
				}
				
				// Detects if null longitude string entry exists
				if (longVar == "null") {
					longVar = "";
				} else if (longVar != "") {
					x += '<tr><td>Longitude:</td><td>' + longVar + '</td></tr>';
				}
								
				// Detects if null countyName string entry exists
				if (countyName == "null") {
					countyName = "";
				} else if (countyName != "") {
					x += '<tr><td>County:</td><td>' + countyName + '</td></tr>';
				}
				
				// Places table of results on page
				$('#locationTable').html(x);
				
				// jQuery plugin for resizeable table columns (BUGGY)
				//$("#peopleTable").colResizable();
				
				// jQuery plugin for sortable table
				$("#peopleTable").tablesorter(); 
				
				// jQuery plugin for table pagination
				//$("#peopleTable").tablesorterPager({container: $("#paginator")});	
				
				// Detects if latitude / longitude coordinates are available
				if (latVar == "" || longVar == "") {
					// Creates interactive google map
					$('#googleMap').gmap3({
							// Gets lat/long from address
							getlatlng:{
								address:  address1 + " " + city + " " + state,
								callback: function(results){
								if ( !results ) return;
									$(this).gmap3({
										// Sets marker to location
										marker:{
											latLng: results[0].geometry.location
										},
										// Configures Google map settings
										map:{
											options:{
												zoom: 18,
												mapTypeId: google.maps.MapTypeId.HYBRID,
												mapTypeControl: true,
												mapTypeControlOptions: {
												  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
												},
												navigationControl: true,
												scrollwheel: true,
												streetViewControl: true,
												center: results[0].geometry.location
											}
										}
									});
								}
							}
					});
				} else {
					// Creates interactive google map
					$('#googleMap').gmap3({
						// Sets marker to location
						marker:{
							latLng: [latVar, longVar]
						},
						// Configures Google map settings
						map:{
							options:{
								zoom: 18,
								mapTypeId: google.maps.MapTypeId.HYBRID,
								mapTypeControl: true,
								mapTypeControlOptions: {
								  style: google.maps.MapTypeControlStyle.DROPDOWN_MENU
								},
								navigationControl: true,
								scrollwheel: true,
								streetViewControl: true,
								center: [latVar, longVar]
							}
						}
					});
				}		
			}
		});		
	});

	// Alerts user if AJAX call failed
	request.fail(function() {
		console.log( "MESSAGE: Request failed!");
	});
}


// *****************************************************************************
// Function to display training information of selected item
// *****************************************************************************
function getTraining(data, orgID){
	// Marks Training tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#Training').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">Training Information</h3>';
	
	// Gets number of values returned
	var count = $(data).find('count').text();
	
	// Detects if no values are present
	if (count > 0) {
		// General Information table
		x += '<table id="trainingTable" class="tablesorter selectedItemTable">';

		// Defines headers to store search data 
		x += '<thead><tr><th>TYPE</th><th>ABBREVIATION</th></tr></thead><tbody>';
		
		// Iterates over all returned values, populates table
		$('training', data).each(function(){

			// Initializes variables
			var type = $(this).find('type').text();	
			var abbreviation = $(this).find('abbreviation').text();

			// Detects if null type string entry exists
			if (type == "null") {
				type = "";
			}
			
			// Detects if null abbreviation string entry exists
			if (abbreviation == "null") {
				abbreviation = "";
			}

			// Removes certain entries wil primary null values
			if (type == "" || abbreviation == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + type + '</td>';
				x += '<td>' + abbreviation + '</td></tr>';
			}
		});
		// Closes table
		x += '</tbody></table>';
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
	
	// jQuery plugin for resizeable table columns (BUGGY)
	//$("#trainingTable").colResizable();
	
	// jQuery plugin for sortable table
	$("#trainingTable").tablesorter(); 
	
	// jQuery plugin for table pagination
	//$("#trainingTable").tablesorterPager({container: $("#paginator")});	
}


// *****************************************************************************
// Function to display treatment information of selected item
// *****************************************************************************
function getTreatment(data, orgID){
	// Marks Treatment tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#Treatment').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">Treatment Information</h3>';
	
	// Gets number of values returned
	var count = $(data).find('count').text();
	
	// Detects if no values are present
	if (count > 0) {
		// Treatment Information table
		x += '<table id="treatmentTable" class="tablesorter selectedItemTable">';

		// Defines headers to store search data 
		x += '<thead><tr><th>TYPE</th><th>ABBREVIATION</th></tr></thead><tbody>';
		
		// Iterates over all returned values, populates table
		$('treatment', data).each(function(){

			// Initializes variables
			var type = $(this).find('type').text();	
			var abbreviation = $(this).find('abbreviation').text();

			// Detects if null type string entry exists
			if (type == "null") {
				type = "";
			}
			
			// Detects if null abbreviation string entry exists
			if (abbreviation == "null") {
				abbreviation = "";
			}

			// Removes certain entries wil primary null values
			if (type == "" || abbreviation == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + type + '</td>';
				x += '<td>' + abbreviation + '</td></tr>';
			}
		});
		// Closes table
		x += '</tbody></table>';
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
	
	// jQuery plugin for resizeable table columns (BUGGY)
	//$("#treatmentTable").colResizable();
	
	// jQuery plugin for sortable table
	$("#treatmentTable").tablesorter(); 
	
	// jQuery plugin for table pagination
	//$("#treatmentTable").tablesorterPager({container: $("#paginator")});	
}


// *****************************************************************************
// Function to display equipment information of selected item
// *****************************************************************************
function getEquipment(data, orgID){
	// Marks Equipment tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#Equipment').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">Equipment Information</h3>';
	
	// Gets number of values returned
	var count = $(data).find('count').text();
	
	// Detects if no values are present
	if (count > 0) {
		// Equipment Information table
		x += '<table id="equipmentTable" class="tablesorter selectedItemTable">';

		// Defines headers to store search data 
		x += '<thead><tr><th>TYPE</th><th>QUANTITY</th><th>DESCRIPTION</th></tr></thead><tbody>';
		
		// Iterates over all returned values, populates table
		$('equipment', data).each(function(){

			// Initializes variables
			var type = $(this).find('type').text();	
			var quantity = $(this).find('quantity').text();
			var description = $(this).find('description').text();

			// Detects if null type string entry exists
			if (type == "null") {
				type = "";
			}
			
			// Detects if null quantity string entry exists
			if (quantity == "null") {
				quantity = "";
			}			
			
			// Detects if null description string entry exists
			if (description == "null") {
				description = "";
			}

			// Removes certain entries wil primary null values
			if (type == "" || quantity == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + type + '</td>';
				x += '<td>' + quantity + '</td>';
				x += '<td>' + description + '</td></tr>';
			}
		});
		// Closes table
		x += '</tbody></table>';
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
	
	// jQuery plugin for resizeable table columns (BUGGY)
	//$("#equipmentTable").colResizable();
	
	// jQuery plugin for sortable table
	$("#equipmentTable").tablesorter(); 
	
	// jQuery plugin for table pagination
	//$("#equipmentTable").tablesorterPager({container: $("#paginator")});
}


// *****************************************************************************
// Function to display facility information of selected item
// *****************************************************************************
function getFacilities(data, orgID){
	// Marks Facilities tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#Facilities').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">Facility Information</h3>';
	
	// Gets number of values returned
	var count = $(data).find('count').text();
	
	// Detects if no values are present
	if (count > 0) {
		// Facility Information table
		x += '<table id="facilityTable" class="tablesorter selectedItemTable">';

		// Defines headers to store search data 
		x += '<thead><tr><th>TYPE</th><th>QUANTITY</th><th>DESCRIPTION</th></tr></thead><tbody>';
		
		// Iterates over all returned values, populates table
		$('facility', data).each(function(){

			// Initializes variables
			var type = $(this).find('type').text();	
			var quantity = $(this).find('quantity').text();
			var description = $(this).find('description').text();

			// Detects if null type string entry exists
			if (type == "null") {
				type = "";
			}
			
			// Detects if null quantity string entry exists
			if (quantity == "null") {
				quantity = "";
			}			
			
			// Detects if null description string entry exists
			if (description == "null") {
				description = "";
			}

			// Removes certain entries wil primary null values
			if (type == "" || quantity == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + type + '</td>';
				x += '<td>' + quantity + '</td>';
				x += '<td>' + description + '</td></tr>';
			}
		});
		// Closes table
		x += '</tbody></table>';
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
	
	// jQuery plugin for resizeable table columns (BUGGY)
	//$("#facilityTable").colResizable();
	
	// jQuery plugin for sortable table
	$("#facilityTable").tablesorter(); 
	
	// jQuery plugin for table pagination
	//$("#facilityTable").tablesorterPager({container: $("#paginator")});
}


// *****************************************************************************
// Function to display physician information of selected item
// *****************************************************************************
function getPhysicians(data, orgID){
	// Marks Physicians tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#Physicians').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">Physician Information</h3>';
	
	// Gets number of values returned
	var count = $(data).find('count').text();
	
	// Detects if no values are present
	if (count > 0) {
		// Physician Information table
		x += '<table id="physicianTable" class="tablesorter selectedItemTable">';

		// Defines headers to store search data 
		x += '<thead><tr><th>NAME</th><th>PHONE</th><th>LICENSE</th></tr></thead><tbody>';
		
		// Iterates over all returned values, populates table
		$('physician', data).each(function(){

			// Initializes variables
			var fName = $(this).find('fName').text();	
			var mName = $(this).find('mName').text();
			var lName = $(this).find('lName').text();
			var suffix = $(this).find('suffix').text();
			var phone = $(this).find('phone').text();
			var license = $(this).find('license').text();

			// Detects if null fName string entry exists
			if (fName == "null") {
				fName = "";
			}
			
			// Detects if null mName string entry exists
			if (mName == "null") {
				mName = "";
			}			
			
			// Detects if null lName string entry exists
			if (lName == "null") {
				lName = "";
			}
			
			// Detects if null suffix string entry exists
			if (suffix == "null") {
				suffix = "";
			}
			
			// Detects if null phone string entry exists
			if (phone == "null") {
				phone = "";
			}
			
			// Detects if null license string entry exists
			if (license == "null") {
				license = "";
			}

			// Removes certain entries wil primary null values
			if (fName == "" || lName == "") {
				// Skips record creation
			}	else {
				// Creates table displaying results
				x += '<tr><td>' + fName + ' ' + mName + ' ' + lName + ' ' + suffix + '</td>';
				x += '<td>' + phone + '</td>';
				x += '<td>' + license + '</td></tr>';
			}
		});
		// Closes table
		x += '</tbody></table>';
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
	
	// jQuery plugin for resizeable table columns (BUGGY)
	//$("#physicianTable").colResizable();
	
	// jQuery plugin for sortable table
	$("#physicianTable").tablesorter(); 
	
	// jQuery plugin for table pagination
	//$("#physicianTable").tablesorterPager({container: $("#paginator")});
}


// *****************************************************************************
// Function to display people information of selected item
// *****************************************************************************
function getPeople(data, orgID){
	// Marks People tab as active (and resets other tabs)
	$('.tab').css('background-color', '#95B5BE');
	$('#People').css('background-color', '#ABDADF');

	// Tab title
	var x = '<h3 id="title">People Information</h3>';
	
	// Gets number of values returned
	var siteCount = $(data).find('siteCount').text();
	
	// Detects if no values are present
	if (siteCount > 1) {
		// Creates select
		x += '<span style="margin:1em; margin-left:1.2em;">Site: </span><select id="site" name="site" onchange="getSpecificPeople(this, ' + orgID + ')" style="margin-top:2em; margin-left:.5em;">';
		
		// Adds default blank selection to search all
		x += '<option value="all">--- All results ---</option>';
		
		// Iterates over all returned values, creates select options
		$('site', data).each(function() {
			x += '<option value="' + $(this).attr('siteId') +'">' + $(this).attr('address') + '</option>';
		});	
		
		// End select
		x += '</select>';
		
		// Initializes People Information table
		x += '<table id="peopleTable" class="tablesorter selectedItemTable"></table>';
	
	} else {
		x += '<h3><em id="noResults">No results returned!</em></h3>';
	}
	
	// Places table of results on page
	$('#currentTab').html(x);
	
	// Shows all people by default
	getSpecificPeople(document.getElementById('site'), orgID);
}


// *****************************************************************************
// Function to display people information of a specific site
// *****************************************************************************
function getSpecificPeople(which, orgID){
	// Gets selected site ID
	var siteID =  which.options[which.selectedIndex].value;
	
	// Empties no results msg (in case content exists)
	$('#noResults').remove();
	
	// Configures AJAX request (can't use generic call in this situation)
	var request = $.ajax({
		type: 'get',
		async: true,
		cache: false,
		url: 'proxy/proxy.php',
		dataType: 'xml',
		data: {path: '/' + orgID + '/People'},
	});
		
	// Calls function to direct data if AJAX call completed successfully
	request.done(function(data) {		
		// Defines headers to store search data 
		var header = '<thead><tr><th>NAME</th><th>ROLE</th></tr></thead><tbody>';
		var headerTrig = false;
		
		// Initializes content
		var x = '';
		
		// Detects if "all" people are selected
		if (siteID == "all") {
			// Iterates over all returned values, populates table
			$('person', data).each(function(){
				// Initializes variables
				var personId = $(this).find('personId').text();	
				var honorific = $(this).find('honorific').text();	
				var fName = $(this).find('fName').text();	
				var mName = $(this).find('mName').text();
				var lName = $(this).find('lName').text();
				var suffix = $(this).find('suffix').text();
				var role = $(this).find('role').text();
				
				// Detects if null personId string entry exists
				if (personId == "null") {
					personId = "";
				}
				// Detects if null honorific string entry exists
				if (honorific == "null") {
					honorific = "";
				}
				
				// Detects if null fName string entry exists
				if (fName == "null") {
					fName = "";
				}
				
				// Detects if null mName string entry exists
				if (mName == "null") {
					mName = "";
				}			
				
				// Detects if null lName string entry exists
				if (lName == "null") {
					lName = "";
				}
				
				// Detects if null suffix string entry exists
				if (suffix == "null") {
					suffix = "";
				}
				
				// Detects if null role string entry exists
				if (role == "null") {
					role = "";
				}
				
				// Removes certain entries wil primary null values
				if (fName == "" || lName == "") {
					// Skips record creation
				}	else {
					// Allows placement of header
					headerTrig = true;
					
					// Creates table displaying results
					x += '<tr><td>' + fName + ' ' + mName + ' ' + lName + ' ' + suffix + '</td>';
					x += '<td>' + role + '</td></tr>';
				}
			});
			
			// Closes tbody
			x += '</tbody>';
			
			// Detects if data is available (to show / hide header)
			if (headerTrig) {
				var content = header + x
			} else {
				var content = '<h3><em id="noResults">No results returned!</em></h3>';
			}
	
			// Places table of results on page
			$('#peopleTable').html(content);
			
			// jQuery plugin for resizeable table columns (BUGGY)
			//$("#peopleTable").colResizable();
			
			// jQuery plugin for sortable table
			$("#peopleTable").tablesorter(); 
			
			// jQuery plugin for table pagination
			//$("#peopleTable").tablesorterPager({container: $("#paginator")});	
		} else {		
			// Iterates over all sites - gets the selected site
			$('site', data).each(function() {
				// Matches siteId with the selected siteId
				if ($(this).attr('siteId') == siteID) {
					// Detects if no persons are present
					var personCount = $(this).find('personCount').text();
					
					// Detects if no persons are present
					if (personCount > 0) {
						// Iterates over all returned values, populates table
						$('person', $(this)).each(function(){
							// Initializes variables
							var personId = $(this).find('personId').text();	
							var honorific = $(this).find('honorific').text();	
							var fName = $(this).find('fName').text();	
							var mName = $(this).find('mName').text();
							var lName = $(this).find('lName').text();
							var suffix = $(this).find('suffix').text();
							var role = $(this).find('role').text();
							
							// Detects if null personId string entry exists
							if (personId == "null") {
								personId = "";
							}
							// Detects if null honorific string entry exists
							if (honorific == "null") {
								honorific = "";
							}
							
							// Detects if null fName string entry exists
							if (fName == "null") {
								fName = "";
							}
							
							// Detects if null mName string entry exists
							if (mName == "null") {
								mName = "";
							}			
							
							// Detects if null lName string entry exists
							if (lName == "null") {
								lName = "";
							}
							
							// Detects if null suffix string entry exists
							if (suffix == "null") {
								suffix = "";
							}
							
							// Detects if null role string entry exists
							if (role == "null") {
								role = "";
							}
							
							// Removes certain entries wil primary null values
							if (fName == "" || lName == "") {
								// Skips record creation
							}	else {
								// Creates table displaying results
								x += '<tr><td>' + fName + ' ' + mName + ' ' + lName + ' ' + suffix + '</td>';
								x += '<td>' + role + '</td></tr>';
							}
						});
						
						x += '</tbody>';
			
						// Adds header
						var content = header + x
			
						// Places table of results on page
						$('#peopleTable').html(content);
						
						// jQuery plugin for resizeable table columns (BUGGY)
						//$("#peopleTable").colResizable();
						
						// jQuery plugin for sortable table
						$("#peopleTable").tablesorter(); 
						
						// jQuery plugin for table pagination
						//$("#peopleTable").tablesorterPager({container: $("#paginator")});	
						
						
					} else {
						y = '<h3><em id="noResults">No results returned!</em></h3>';
			
						// Places table of results on page
						$('#peopleTable').empty();
						
						$('#currentTab').append(y);
					}
				}
			});
		}
	});
	
	// Alerts user if AJAX call failed
	request.fail(function() {
		console.log( "MESSAGE: Request failed!");
	});
}

