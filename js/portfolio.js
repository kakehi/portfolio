(function($){
	
	var _isItTouchDevice;
	
	/* inherit sizes and distances*/
	var _hoverSideButtonWidth;
	var _hoverSideButtonOpenWidth;
	var _hoverSideButtonOpacity;
	
	var targetMenuWidth;
	var animatingIntervalTime;
		
	/* -- buttons --*/
	
	var _myProjectSort, _myProjectCategories, _myProjectRoles, _myProjectSofts;
	
	
	// -------------- LOADING DATABASE -----------------------
	
	
	function $_GET(param) {
	
			var query_string = {};
			  var query = window.location.search.substring(1);
			  var vars = query.split("&");
			  for (var i=0;i<vars.length;i++) {
				var pair = vars[i].split("=");
					// If first entry with this name
				if (typeof query_string[pair[0]] === "undefined") {
				  query_string[pair[0]] = decodeURIComponent(pair[1]);
					// If second entry with this name
				} else if (typeof query_string[pair[0]] === "string") {
				  var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
				  query_string[pair[0]] = arr;
					// If third or later entry with this name
				} else {
				  query_string[pair[0]].push(decodeURIComponent(pair[1]));
				}
			  } 
			 
			 return query_string[param];
	}
	
	function _loadJSON(urlkey, sheetkey){
			
			
			var apiURL = "https://spreadsheets.google.com/feeds/list/" + urlkey + "/" + sheetkey + "/public/values";
			apiURL = apiURL + "?alt=json-in-script&callback=?";
			console.log(apiURL);
			
			$.ajax({
			type: 'GET',
			url: apiURL,
			cache: false,
			dataType: 'jsonp',
			jsonp : 'myFunc',
			success: function(json, textStatus) {
				
				console.log(json.feed);
				
				_createDatabase(json);
				
			},
			error: function(xhr, textStatus, errorThrown) {
				console.log(textStatus);
			}
		
		});
	}
	_loadJSON($_GET('portfolio'), 'od6');
	// -------------- LOADING DATABASE -----------------------
	
			
	
	var _myProjects = [];
	var _myButtonNames, _myImageViewersContainerArray;
	var _numberOfPrologue = 2;
	
	/*-- sorting -- */
	
	var _currentSort = null;
	var _currentSortType = null; // 'cat' or 'proj'
	
	/*-- sorting -- */
		
		/* -- get 30% of width -- */
		var timer = false;
		$(window).resize(function() {
		    
		if (timer !== false) {
		        clearTimeout(timer);
		    }
		    timer = setTimeout(function() {
				inheritSizes();
		    }, 200);
		});
		
		function inheritSizes(){
			
			targetMenuWidth = $( window ).width() * 0.3; 
			if(targetMenuWidth < 500){
				targetMenuWidth = 500;
			}
			if(targetMenuWidth > $( window ).width()-10){
				targetMenuWidth = $( window ).width()-10;
			}	
		}
		inheritSizes();
		
	/* -- Initiate Click if device is touch -- */
	var _isSideMenuOpened = false;
	
	
	// -------------- Create Database -----------------------
	
	function _createDatabase(json){
			
			/* -- populate pages --*/
			/* -- populate pages --*/
			/* -- populate pages --*/
			
			_myProjectCategories = _convertStringToArray(json.feed.entry[1].gsx$content.$t);
			_myProjectRoles = _convertStringToArray(json.feed.entry[2].gsx$content.$t);
			_myProjectSofts = _convertStringToArray(json.feed.entry[3].gsx$content.$t);
			
			/* -- projects --*/
			
			var _projectCount = parseInt(json.feed.entry[5].gsx$content.$t);
			var _projectCounter = 0;
			for(var i=6; i<6 + 12 * _projectCount; i+=12){
				
				// -- exclude if exlucde flag is on
				if(String(json.feed.entry[i].gsx$exclude.$t) === ""){
					
					var projectArray = [];
					var project = {};
					/* -- information --*/
					project.buttonid = '_to' + _convertStringToID(String(json.feed.entry[i].gsx$content.$t)) + 'Button'; // id
					project.id = _convertStringToID(String(json.feed.entry[i].gsx$content.$t)); // id
					project.title = String(json.feed.entry[i].gsx$content.$t); // title
					project.subtitle = String(json.feed.entry[1+i].gsx$content.$t); // subtitle
					project.client = String(json.feed.entry[2+i].gsx$content.$t); // client
					project.year = String(json.feed.entry[3+i].gsx$content.$t); // Year
					project.status = String(json.feed.entry[4+i].gsx$content.$t); // Status
					project.header = String(json.feed.entry[6+i].gsx$content.$t); // HeeaderImage
					project.desc = String(json.feed.entry[7+i].gsx$content.$t); // Description
					/*projectArray[7] = "";
					projectArray[8] = "";
					/* -- information --*/
					
					
					
					/* -- category --*/
					project.cat = _convertStringToArray(json.feed.entry[8+i].gsx$content.$t);
					/* -- category --*/
					
					/* -- thumb --*/
					project.thumb = json.feed.entry[9+i].gsx$content.$t;
					/* -- thumb --*/
					
					/* -- images --*/
					project.img = _convertStringToArray(json.feed.entry[10+i].gsx$content.$t);
					/* -- images --*/
					
					/* -- special contents --*/
					project.special = json.feed.entry[11+i].gsx$content.$t;
					/* -- special contents --*/
					
					_myProjects.push(project);
					
				}
				
				_projectCounter ++;
									
			}
			
			/* -- projects --*/
			
			_myProjectSort = _myProjectCategories.slice(0);
			for(i=0; i<_myProjectRoles.length; i++){
				_myProjectSort.push(_myProjectRoles[i]);
			}
			for(i=0; i<_myProjectSofts.length; i++){
				_myProjectSort.push(_myProjectSofts[i]);
			}
		
			_myButtonNames = _myProjects.slice(0);
			_myButtonNames.push(['_toThumbButton','_projectThumbnails'],['_toContactButton','contact']);
			_numberOfPrologue = 2;
	
			_myImageViewersContainerArray = _myButtonNames.slice(0);
			_myImageViewersContainerArray.unshift(['_toClientList','clients','', '']);
			
			
			// ------------------Initialize
			_loadProjects();
			_createSortButton();
			_loadMenu();
			_loadAdditionalSlides();
			_getProjectLabelWidth();
			// Sort with appropriate URL
			_applyCurrentHash();
			
			
			$(window).scroll(function(){scrollFunction();});
	}
	
	// -------------- FILL CONTENTS -----------------------
	
	
	/////////////////// Load Projects
	/////////////////// Load Projects
	/////////////////// Load Projects
	
	function _loadProjects(){
		
		// for all projects find numbers of 
		
		for(var i=0; i<_myImageViewersContainerArray.length; i++){
			 $('#_projectSlidesContainer').append('<div class="_imageViewersContainer" id="_imageViewersContainer'+String(i)+'">');
		}
		
		var w = 1, h = 1, html = '';
		for(var i=0; i<_myProjects.length; i++){
				
				// -- Project thumbs
				$("#_imageViewersContainer0").append('<div class="brick" data-id="_projectThumbnail' + String(i) + '" data-numb="'+String(i)+'" style="width:'+String((2 + (2 * Math.random() << 0))*100)+'px;  text-align:left; border-bottom:solid thin #000; opacity:0;"><img src="img/'+String(_myProjects[i].thumb)+'" width="100%"><p style="font-family:Raleway">'+String(_myProjects[i].title)+'</p><p style="font-size:75%; font-family:open_sanslight">'+String(_myProjects[i].subtitle)+'</p></div>');
				
				
				
				$('[data-id="_projectThumbnail' + String(i) + '"]').click(function(evt){
					_currentSortType = 'proj';
					evt.preventDefault();
					location.hash = _myProjects[parseInt($(this).attr('data-numb'))].id;
					_sortProject(parseInt($(this).attr('data-numb'))+1000);
				}); 
				
				
				// -- Project slides
				
				// -- top
				$('#_imageViewersContainer'+String((i+2))).append('<div class="_imageViewers _parallax" id="_parallax'+String(i)+'" style="margin-top:120px;"></div><div class="overlay"></div><div class="_imageTextBox" id="' + _myProjects[i].buttonid + '"><div style="padding-bottom:60px;"><h1 class="_projectTitle">' + String(_myProjects[i].title) + '</h1><h2 class="_projectSubttle">' + String(_myProjects[i].subtitle) + '</div><div style="width:100%; max-width:1280px; border-bottom:solid thin #000; border-top:solid thin #000; padding:50px 0px;"><div style="width:30%; float:left;"><div class="informationList">Client : ' + String(_myProjects[i].client) + '</div><div class="informationList">Year : ' + String(_myProjects[i].year) + '</div><div class="informationList">Status : ' + String(_myProjects[i].status) + '</div></div><div class="informationDescription" style="width:65%; float:right;">' + String(_myProjects[i].desc) + '</div><div style="clear: both;"></div> </div></div></div></div>');
				/*$('#_parallax'+String(i)).css({'background':'url(img/'+_myProjects[i].header+')', 'width':'100%', 'height':'100%', 'margin':'0 auto', 'position': 'absolute', 'background-size':'cover', 'background-attachment':'fixed', 'background-repeat':'repeat-y', 'background-position':'top center'});
				$('.overlay' ).css({'background':'url(../img/pattern.png)', 'width':'100%','position':'absolute', 'overflow':'hidden'});*/
				$('._projectTitle' ).css({'font-size':'8rem', 'text-align':'center', 'margin':'.2rem 0rem',  'font-family':'Raleway'});
				$('._projectSubttle' ).css({'text-align':'center', 'margin-bottom':'20px', 'padding-bottom':'20px', 'font-size':'3.6rem', 'margin':'2rem 0rem', 'font-style':'italic','font-family':'Raleway'});
				$('._imageTextBox' ).css({'padding-top':'20px', 'text-align':'left', 'max-width':'1280px', 'color':'#000', 'padding':'20px 15px', 'background':'rgba(255,255,255,255.5)', 'margin-bottom':'120px'});
				$('.informationList' ).css({'font-size':'1.4rem', 'padding':'2px 0px', 'font-family':'Didot'});
				$('.informationDescription' ).css({'font-size':'1.2rem','font-family':'Didot'});
				
				for(var j=0; j<_myProjects[i].img.length; j++){
					$('#_imageViewersContainer'+String((i+2))).append('<div class="_imageViewers"><img src="img/'+String(_myProjects[i].img[j])+'"></div>');
					
				}
				// -- Check if additional material such as youtube or gif exists
				if(_myProjects[i].cat !== ''){
					$('#_imageViewersContainer'+String((i+2))).append(_myProjects[i].special);
				}
		}
		
			
			//$("#_imageViewersContainer0").append(html);
			
			var wall = new Freewall("#_imageViewersContainer0");
			wall.reset({
				selector: '.brick',
				animate: true,
				cellW: 300,
				cellH: 'auto',
				delay: 50,
				onResize: function() {
					wall.fitWidth();
				}
			});
			
			var images = wall.container.find('.brick');
			images.find('img').load(function() {
				wall.fitWidth();
			});
			
		
		// -- Initially, fade out everything
		for(i=0; i<_myProjects.length; i++){
			$('#_imageViewersContainer'+String( i + _numberOfPrologue )).css({'height':'0px', 'visibility':'hidden', 'display':'none'});
		}
	}
	
	
	
	/////////////////// Load Projects
	/////////////////// Load Projects
	/////////////////// Load Projects
	
	function _loadAdditionalSlides(){
		//client
		$('#_imageViewersContainer'+String(1)).append('<div class="_imageViewers"><img src="img/Takuma-Kakehi-Portfolio-2015-082-min.jpg"></div>');
		//contact
		$('#_imageViewersContainer'+String((_myImageViewersContainerArray.length-1))).append('<div style="border-top:#CCC solid thin; width:100%; max-width:1280px; padding:50px 0px; margin:30px 0px; color:#333; text-align:left; "><div id="contact"><p style="font-size:120%; margin:0px 10px;">Contact</p><p id="_contactContent" style="margin:10px 10px;" > Takuma Kakehi <br/><br/>225 himrod st., APT#3R.,<br/>Brooklyn, NY, 11237 USA<br/><br/>TEL : +81-804385-7887<br/>Email : <a href="emailto:takuma.kakehi@gmail.com">takuma.kakehi@gmail.com</a> </p></div></div>');
	}
	
	
	
	/////////////////// Load Menu
	/////////////////// Load Menu
	/////////////////// Load Menu
	
	function _loadMenu(){
		
		// for all projects find numbers of 
		
		for(var i=0; i<_myProjects.length; i++){
			$('[id="_tableOfContentsUnorderedList"]').append('<li id="'+String(_myProjects[i][0])+'"><a href="#'+String(_myProjects[i].buttonid)+'">'+String(_myProjects[i].id)+'</a><br/>'+String(_myProjects[i].title)+'</li>');
		}
	}
	
	
	
	/////////////////// Load Menu
	/////////////////// Load Menu
	/////////////////// Load Menu
	
	
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		
		_isItTouchDevice = true;
		
		animatingIntervalTime = 0;

		// Mark: touch interaction when device is touch

		//$("#_menuContainer").hover(function(){
		//});
		$("#_menuContainer").click(function(){
			if(_isSideMenuOpened == false){
				openSideMenu();
			}else{
				closeSideMenu();
			}
		});
		
	}else{
		
		_isItTouchDevice = false;
		
		animatingIntervalTime = 400;
		
		// Mark: hover interaction when device is not touch
		
		$("#_menuContainer").mouseover(function(){
			openSideMenu();
		}).mouseout(function () { 
			closeSideMenu();
		});		
		
		// Mark: assign moving button
		
		var timer = false;
		if (timer !== false) {
	        clearTimeout(timer);
	    }
	    timer = setTimeout(function() {
	        for(var i=0; i<_myButtonNames.length; i++){
				assignButton(i);
			}
	    }, 1000);


		/*for(var i=0; i<_myButtonNames.length; i++){
			assignButton(i);
		}*/
	}
	
	
	function openSideMenu(){
		if(_isSideMenuOpened == false){
				_isSideMenuOpened = true;
				// -- inherit information
				if(_hoverSideButtonWidth == null)_hoverSideButtonWidth = $("#_menuContainer").css('width');
				if(_hoverSideButtonOpenWidth == null)_hoverSideButtonOpenWidth = $("#_menuContainer").css('max-width');
				if(_hoverSideButtonOpacity == null)_hoverSideButtonOpacity = $("#_menuContainer").css('opacity');
				//
				if(_isItTouchDevice == true){
					$("#_menuContainer").css({width:_hoverSideButtonOpenWidth, height:String($(window).height())+'px', opacity:1});
				}else{
					$("#_menuContainer").animate({width:_hoverSideButtonOpenWidth, height:String($(window).height())+'px', opacity:1}, 0);
				}
				$("#_menuContainer").css({'cursor':'inherit'});
				$("#_goTopButton").add("#_sideMenuIcon").css({'display':'none'});	
				$("#_sideMenuTitle").css({'display':'inherit'});
		}
	}
	function closeSideMenu(){
		if(_isSideMenuOpened == true){
			_isSideMenuOpened = false;
				if(_isItTouchDevice == true){
					$("#_menuContainer").css({width:_hoverSideButtonWidth, height:_hoverSideButtonWidth, opacity:_hoverSideButtonOpacity});
					$("#_goTopButton").add("#_sideMenuIcon").css({'display':'inherit'});	
					$("#_sideMenuTitle").css({'display':'none'});
				}else{
	     			$("#_menuContainer").animate({width:_hoverSideButtonWidth, height:_hoverSideButtonWidth, opacity:_hoverSideButtonOpacity}, 0, function(){
						$("#_goTopButton").add("#_sideMenuIcon").css({'display':'inherit'});	
						$("#_sideMenuTitle").css({'display':'none'});
					});
				}
				$("#_menuContainer").css({'cursor':'pointer'});
				
			}
	}
	
	
	var _sideMenuVisible = false;
	
	var _oldProjectCount = 0;
	var _currentProjectCount = 0;
	var _isProjectLabelVisible = false;
	var _isProjectLabelEnlarged = true;

	var _isProjectLabelAdjustingWidthNow = false;
	
	function scrollFunction(){
		
		var scrollPos = $(document).scrollTop();
		
		if(_currentProjectCount != 0){
			if(_sideMenuVisible == false){
				_sideMenuVisible = true;
				$('#_menuContainer').animate({/*width:'40px', height:'40px', 
					right:'0.5rem', */
					top:'0.5rem'
					});
				$('#_goTopButton').animate({/*width:'40px', height:'40px',
					right:'0.5rem',  */
					bottom:'0.5rem'
					});
			}
			
		}else{
			if(_sideMenuVisible == true){
				_sideMenuVisible = false;
				$('#_menuContainer').animate({/*width:'40px', height:'40px',
					right:'0.5remx',  */
					top:'-8rem'
				});
				$('#_goTopButton').animate({/*width:'0px', height:'0px',
					right:'0.5rem',  */
					bottom:'-8rem'
				});
			}
		}
		
		// adjust labeling
		for(var i=0; i<_myImageViewersContainerArray.length; i++){
	
			/*if(scrollPos + $(window).height()/2 < $('#_imageViewersContainer' + String(i)).offset().top && scrollPos + $(window).height()/2 > $('#_imageViewersContainer' + String(i-1)).offset().top){
				_currentProjectCount = i-1;
			}*/
			
			if(i==0){
				if(scrollPos < $('#_imageViewersContainer' + String(i+2)).offset().top){
					_currentProjectCount = i;
				}
			}else if(i == _myImageViewersContainerArray.length-1){
				if(scrollPos + $(window).height()> $('#_imageViewersContainer' + String(i)).offset().top){
					_currentProjectCount = i;
				}
			}else{
				if(scrollPos + $(window).height() / 2 < $('#_imageViewersContainer' + String(i+2)).offset().top && scrollPos + $(window).height()/2 > $('#_imageViewersContainer' + String(i)).offset().top){
					_currentProjectCount = i;
				}
			}
			
			
			
		}
		if(_oldProjectCount != _currentProjectCount){
			//alert(_oldProjectCount + " + "+_currentProjectCount);
			_isProjectLabelAdjustingWidthNow = true;
			_oldProjectCount = _currentProjectCount;
			
		}
		_adjustProjectLabel();
		
		// Do not show for these
		
		
		if(_currentProjectCount == 0 || _currentProjectCount > _myImageViewersContainerArray.length){
			if(_isProjectLabelVisible == true){
				_isProjectLabelVisible = false;
				$('._hoverSideProjectLebel').animate({ bottom:'-8rem' });
				$('._hoverSideProjectLebel ._projectLabelBackground').animate({width:'40'});
			}
		}else{
			if(_isProjectLabelVisible == false){
				_isProjectLabelVisible = true;
				
				$('._hoverSideProjectLebel').animate({bottom:'0.5rem'});
				$('._hoverSideProjectLebel ._projectLabelBackground').animate({width:String(Math.round(_projectLabelWidth[_currentProjectCount]))});
			}
		}
		
		if(_isSideMenuOpened === true){
			closeSideMenu();
		}
	   
	}
	
	// Mark: assign moving button
	
	function assignButton(i){
		$("[id="+String(_myButtonNames[i].buttonid)+"]").find('a').click(function() {
			projectWasClicked(i);
		});
	}
	function projectWasClicked(i){
		$('html, body').animate({
			scrollTop: $('#_imageViewersContainer'+String((i+2))).offset().top
		}, animatingIntervalTime/2);
	}
	
	// --- go top of page
	if(_isItTouchDevice == false){
	$("#_goTopButton").mouseover(function() {
		$(this).css({'background-color':'#666'});
        return false;
	}).mouseout(function() {
		$(this).css({'background-color':'#000'});
        return false;
	});
	}
	$("#_goTopButton").click(function() {
		$('body,html').animate({
                    scrollTop: 0
               },  100);
               return false;
	});
	
	// Mark: inclemental load ---
	$("img").lazyload({
        event : "sporty"
    });
	var timeout = setTimeout(function() {$("img").trigger("sporty")}, 200);
	
	// Mark: Project Label
	
	var _projectLabelWidth = [];
	function _getProjectLabelWidth(){
		
		for(var i=0; i<_myImageViewersContainerArray.length; i++){
			if(i==0 || i > _myImageViewersContainerArray.length-2){
				_projectLabelWidth[i] = 0;
			}else{
				_fillProjectlabel(i);
				_projectLabelWidth[i] = $('._hoverSideProjectLebel ._projectNumber').width() + $('._hoverSideProjectLebel ._projectTitle').width() + $('._hoverSideProjectLebel ._projectDescription').width() + 7*16;
			}
		}
		
		_fillProjectlabel(0);
	}
	
	function _adjustProjectLabel(){
	
		_fillProjectlabel(_currentProjectCount);
		
		if(_isProjectLabelAdjustingWidthNow == true && _isProjectLabelEnlarged == true){
			_isProjectLabelAdjustingWidthNow = false;
			$('._hoverSideProjectLebel ._projectLabelBackground').stop().animate({width:String(Math.round(_projectLabelWidth[_currentProjectCount]))}, 300);
		}
		
	}
	
	// Mark: Project Label - toggle label
	
	$('._hoverSideProjectLebel ._projectClose').click(function(){_toggleProjectLabel()}); 
	$('._hoverSideProjectLebel ._projectNumber').click(function(){_toggleProjectLabel()}); 
	function _toggleProjectLabel(){
		
		if( _isProjectLabelEnlarged ){
			_isProjectLabelEnlarged = false;
			$('._hoverSideProjectLebel').css({'cursor':'pointer'});
			$('._hoverSideProjectLebel ._projectClose').css({'cursor':'default'});
			$('._hoverSideProjectLebel ._projectLabelBackground').stop().animate({width:String(Math.round(2.5*16))}, 300);
		}else{
			_isProjectLabelEnlarged = true;
			$('._hoverSideProjectLebel').css({'cursor':'arrow'});
			$('._hoverSideProjectLebel ._projectClose').css({'cursor':'pointer'});
			$('._hoverSideProjectLebel ._projectLabelBackground').stop().animate({width:String(Math.round(_projectLabelWidth[_currentProjectCount]))}, 300);
		}
	}
	$('._hoverSideProjectLebel ._projectClose').css({'cursor':'pointer'});
	
	function _fillProjectlabel(i){
		
			var projectlabelCount;
			if(i < 10){
				projectlabelCount = '0'+String(i);
			}else{
				projectlabelCount = String(i);	
			}
			// -- omit numbers for contact and clients in the array.
		
			if(i == 0 || i > _myProjects.length){
				$('._hoverSideProjectLebel ._projectNumber').html('');
			}else{
				$('._hoverSideProjectLebel ._projectNumber').html(projectlabelCount);
			}
			
			var tempInt;
			var tempInt2;
			if(_myImageViewersContainerArray[i][2] && _myImageViewersContainerArray[i][2]!=''){
				tempInt = 'A';
				$('._hoverSideProjectLebel').find('._projectTitle').css({'display':'inherit'});
				$('._hoverSideProjectLebel').find('._projectTitle').html(_myImageViewersContainerArray[i][2]);
			}else{
				tempInt = 'B';
				$('._hoverSideProjectLebel').find('._projectTitle').css({'display':'none'});
				$('._hoverSideProjectLebel').find('._projectTitle').html('');
			}
			if(_myImageViewersContainerArray[i][3] && _myImageViewersContainerArray[i][3]!=''){
				tempInt2 = 'A';
				$('._hoverSideProjectLebel').find('._projectDescription').css({'display':'inherit'});
				$('._hoverSideProjectLebel').find('._projectDescription').html(_myImageViewersContainerArray[i][3]);
			}else{
				tempInt2 = 'B';
				$('._hoverSideProjectLebel').find('._projectDescription').css({'display':'none'});
				$('._hoverSideProjectLebel').find('._projectDescription').html('');
			}
			
			$('#_dummy-text').html(i + ' ++ ' + tempInt + tempInt2 + ' ++ ' + $('._hoverSideProjectLebel ._projectDescription').width() + ' ++ ' + $('._hoverSideProjectLebel ._projectDescription').html() + ' ++ ' + _myImageViewersContainerArray[i][3]);
	}
	
	///////////////////
	///////////////////
	///////////////////
	
	function _createSortButton(){

		for(var i=0; i<_myProjectSort.length; i++){
			var tempDiv;
			if(i < _myProjectCategories.length){ 
				tempDiv = $('#_headerCategoryMenu');
			}else if(i < (_myProjectCategories.length+_myProjectRoles.length)){
				tempDiv = $('#_headerRoleMenu');
			}else{
				tempDiv = $('#_headerSoftMenu');
			}
			
			tempDiv.append('<li id="_myProjectSort'+String(i)+'" data-numb="'+String(i)+'" style="list-style: none; display:inline; cursor:pointer;">'+_myProjectSort[i]+'</li>');
			if(i < _myProjectCategories.length){ 
				$("#_myProjectSort"+String(i)).css({'font-weight':'bold', 'font-family':'Raleway', 'font-size':'2.5rem', 'padding':'1rem 3rem'});
			}else if(i < (_myProjectCategories.length+_myProjectRoles.length)){
				$("#_myProjectSort"+String(i)).css({'font-style':'italic', 'font-family':'Didot', 'font-size':'2.5rem', 'padding':'1rem 3rem'});
			}else{
				$("#_myProjectSort"+String(i)).css({'font-style':'italic', 'font-weight':'bold', 'font-family':'Raleway', 'font-size':'1.5rem', 'padding':'1rem 1rem'});
			}
			
			$('#_myProjectSort'+ String(i)).click(function(evt){
				_currentSortType = 'cat';
				evt.preventDefault();
				location.hash = _myProjectSort[parseInt($(this).attr('data-numb'))];
				_sortProject($(this).attr('data-numb'));
			});
		}
	}
	
	function _findCategNumber(tag){
		
		for(var i=0; i<_myProjects.length; i++){
			if(_myProjects[i].id ===tag){
				_currentSortType = 'proj';
				return i+1000;
			}
		}
		for(var i=0; i<_myProjectSort.length; i++){
			if(_myProjectSort[i]===tag){
				_currentSortType = 'cat';
				return i;
			}
		}
		return false;
	}
	
	function _applyCurrentHash(){
		if(window.location.hash.replace("#", "")!=="" && _findCategNumber(window.location.hash.replace("#", ""))!== false){
				var refreshIntervalId = setInterval(sortCat, 1000); 
				function sortCat(){
					_sortProject(_findCategNumber(window.location.hash.replace("#", "")));
					clearInterval(refreshIntervalId);
				}
		}
	}

	/* -- Go Back ---*/
	window.innerDocClick = false;
	console.log('AAAAAAA + ' + window.innerDocClick);

	window.onhashchange = function() {
		console.log('AAAAAAA + ' + window.innerDocClick);
		if (window.innerDocClick) {
			window.innerDocClick = false;
		} else {
			_applyCurrentHash();
		}
	}
	
	document.onmouseover = function() {
		//User's mouse is inside the page.
		window.innerDocClick = true;
	}
	
	document.onmouseleave = function() {
		//User's mouse has left the page.
		window.innerDocClick = false;
	}
	
	
	/* -- Go Back ---*/

	function _sortProject(id){

		// id = category id for category // id = project id for project
		
		if(_currentSort == id){
			_currentSort = null;
			_currentSortType = null;
			
			$('#_imageViewersContainer1').css({'height':'inherit', 'visibility':'visible'}); // return client list
			for(var j=0; j<_myProjects.length; j++){
				$('#header').find("[id="+String(_myButtonNames[j][0])+"]").stop().animate({'opacity':'1'}); // fade in table of contents
				$("#_imageViewersContainer0").find("[data-id='_projectThumbnail"+String(j)+"']").stop().animate({'opacity':'1'});  // fade in thumbnails
				$('#_imageViewersContainer'+String( j + _numberOfPrologue )).css({'height':'0px', 'visibility':'hidden', 'display':'none'}); // fade out contents
			}
		}else{
			_currentSort = parseInt(id);
			$('#_imageViewersContainer1').css({'height':'0px', 'visibility':'hidden'}); // turn off client list
			
					
			for(var j=0; j<_myProjects.length; j++){
				
				var amICategorized = false;
				
				// Mark: if category tab was clicked search through each projects' categories. if prject tab was clicked understand which project you are in.
				if(_currentSortType == 'cat'){
					for(var k=0; k<_myProjects[j].cat.length; k++){
						if(amICategorized == false){
							if(_myProjectSort[_currentSort] == _myProjects[j].cat[k]){
								amICategorized = true;
							}
						}
					}
				}else if(j+1000 == id){
					amICategorized = true;
				}
							
				if(amICategorized != true){
					if(_currentSortType != 'proj'){
						$('#header').find("[id="+String(_myButtonNames[j][0])+"]").stop().animate({'opacity':'.25'}); // fade out table of contents
						$("#_imageViewersContainer0").find("[data-id='_projectThumbnail"+String(j)+"']").stop().animate({'opacity':'.1'}); // fade out thumbnails
					}
					$('#_imageViewersContainer'+String( j + _numberOfPrologue )).css({'height':'0px', 'visibility':'hidden', 'display':'none'});
				}else{
					$('#header').find("[id="+String(_myButtonNames[j][0])+"]").stop().animate({'opacity':'1'}); // fade in table of contents
					$("#_imageViewersContainer0").find("[data-id='_projectThumbnail"+String(j)+"']").stop().animate({'opacity':'1'}); // fade in thumbnails
					$('#_imageViewersContainer'+String( j + _numberOfPrologue )).css({'height':'inherit', 'visibility':'visible', 'display':'inherit'});
				}
			}
			
		}
		
		// -- turn off other buttons
		for(var j=0; j<_myProjectSort.length; j++){
			if(_currentSort != j && _currentSort != null){
				$('#_myProjectSort'+ String(j)).stop().animate({'opacity':'.25'});
			}else{
				$('#_myProjectSort'+ String(j)).stop().animate({'opacity':'1'});
			}
		}
		
		// -- animate to project
		if(_currentSortType == 'proj'){
			projectWasClicked((id-1000));
		}
		
	}
	
	

}(jQuery));