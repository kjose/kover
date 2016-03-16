/**
 * Plugin d'affichage de popups
 */

( function($) {
    
    $.extend({

    	koverclose : function( callback , index ) {
    		var index = index || 0;
        	$("#koverlay_"+index).removeClass("visible");
        	$("#koverlaybox_"+index).removeClass("visible");
        	setTimeout( function() {
        		$("#koverlay_"+index).remove();
        		$("#koverlaybox_"+index).remove();
        		if( callback ) callback();
        	},500);
    	},

	    kover : function( options , content ) {
	        
	        var basecontent = content;
	        // width : width of the box
	        // height : height of the box
	        // cancelOnBgClick : close the box while clicking outside
	        // iframe : url de l'iframe
	        // image : url de l'image
	        // imageLegend : légende de l'image
	        // gallery : sélecteur jquery des élements à activer en mode galerie, le alt de l'image sera pris pour légende
	        // classname : class name supplémentaire
	        // confirmbox : activer ou non le mode confirmbox
	        // textOK : texte confirmbox OK
	        // textCancel : texte confirmbox Cancel
	        // maxWidth : max width of the box
	        // maxHeight : max height of the box
	        var defaultOpt = {
	            "width" : false,
	            "height" : false,
	            "cancelOnBgClick" : true,
	            "iframe":false,
	            "image":false,
	            "imageLegend":false,
	            "gallery":false,
	            "classname":false,
	            "confirmbox" : false,
	            "textOK" : "Valider",
	            "textCancel" : "Annuler",
	            "maxWidth" : "90%",
	            "maxHeight" : "90%",
	            onLoad : function(ui) {},
	            onCancel: function(ui) {},
	            onValid: function(ui) {}
	        }	        
	        var settings = $.extend( defaultOpt , options );

	        // Ajout de l'overlay
	        var k_index = $(".koverlay").length;
	        var $koverlay = $("<div class='koverlay' id='koverlay_"+k_index+"'></div>");
	        var $koverlaybox = $("<div class='koverlaybox' id='koverlaybox_"+k_index+"'></div>");
	        var $koverlaybox_inner = $("<div class='koverlaybox_inner'></div>");
	        $koverlaybox.append( $koverlaybox_inner );
	        $("body").append($koverlay);
	        $("body").append($koverlaybox);
	        setTimeout( function() {
	        	$koverlay.addClass("visible");
	        } , 50 );
			// Setings : classname
    		if( settings.classname ) $koverlaybox.addClass( settings.classname );

	        var width;
	        var height;
	        var loadNewContent = function( settings ) {

		        // Wrap du content
		       	content = "<div class='koverlaycontent'>"+basecontent+"</div>";

		       	// Confirmbox
		       	if( settings.confirmbox ) {
		       		content =  "<div class='koverlaycontent'>";
		       		content += basecontent;
		       		content += "<div class='kbuttons'>";
		       		content += "<span class='kbutton kcancel'>"+settings.textCancel+"</span>";
		       		content += "<span class='kbutton kvalid'>"+settings.textOK+"</span>";
		       		content += "</div>";
		       		content += "</div>";
		       	}

		       	// Iframe
		       	if( settings.iframe ) {
		       		$koverlaybox_inner.attr("class","koverlaybox_inner iframe");
		       		content = "<iframe class='koverlayiframe' width='100%' height='100%' src='"+settings.iframe+"'></iframe>";
		       	}
		       	// Image
		       	if( settings.image ) {
		       		$koverlaybox_inner.attr("class","koverlaybox_inner image");
		       		var legend = settings.imageLegend ? "<span class='koverlayimg_legend'>"+settings.imageLegend+"</span>" : "";
		       		content = "<div class='koverlayimg'><img class='' src='"+settings.image+"' />"+legend+"</div>";
		       	}

		        // Affichage du loader
		        var loader = $("<div class='loader fa fa-spin fa-repeat'></div>");
		        $koverlay.append( loader );

		        // Chargement du contenu
		        var hiddenContent = $("<div class='hiddencontent'>"+content+"</div>");
		        $koverlay.append( hiddenContent );
		        var contentToLoad = $("img, iframe",$koverlay);
		        var contentToLoadOk = 0;
		        contentToLoad.each( function() {
		        	$(this).load( function() {
		        		contentToLoadOk++;
		        	});
		        });
		        var interval = null;
		        interval = setInterval( function() {
		        	if( contentToLoad.length <= contentToLoadOk ) {

		        		// Chargement des dimensions
		        		width = hiddenContent.outerWidth(true);
		        		height = hiddenContent.outerHeight(true);
		        		hiddenContent.remove();
		        		clearInterval( interval );

		        		// Ajout de la box
		        		$koverlaybox_inner.html( content );

		        		// Settings : width et height
		        		if( settings.width ) width = settings.width;
		        		if( settings.height ) height = settings.height;

		        		// Adaptation à l'écran
		        		adaptToScreen();

				        // Valid action
				        if( settings.confirmbox ) {
				        	$(".kvalid",$koverlaybox).click( function() {
				        		$.koverclose();
				        		settings.onValid( $koverlaybox );
				        	});
				        	$(".kcancel",$koverlaybox).click( function() {
				        		$.koverclose();
				        	});
				        }

				        // Affichage de la box après 500ms
				        setTimeout( function() {
		        			loader.remove();
	        				$koverlaybox.addClass("visible");
		        			settings.onLoad( $koverlaybox );
				        } , 200 );

		        	}
		        } , 100 );
	        }
	        loadNewContent( settings );

    		// Ajout du close
    		$koverclose = $("<span class='koverclose'></span>");
    		$koverlaybox.append( $koverclose );
    		$koverclose.click( function() {	        			
	        	$.koverclose( function() {
	        		settings.onCancel( $koverlaybox_inner );
	        	} , k_index );
    		});

	        // Out on click
	        if( settings.cancelOnBgClick ) {
		        $koverlay.click( function() {  			
		        	$.koverclose( function() {
		        		settings.onCancel( $koverlaybox );
		        	} , k_index );
		        });
	        }

	        // Fonction pour redimensionner les éléments
	        function adaptToScreen( content_width , content_height , callback ) {

        		var wwidth = $(window).width();
        		var wheight = $(window).height();
        		var dynamic_width = content_width || width;
        		var dynamic_height = content_height || height;

        		// Setting maxWidth
        		if( settings.maxWidth ) {
        			var oldwidth = dynamic_width;
        			maxWidth = (/%/.test(settings.maxWidth)) ? parseInt(settings.maxWidth)/100 * wwidth : parseInt(settings.maxWidth);
        			dynamic_width = dynamic_width <= maxWidth ? dynamic_width : maxWidth;
        			// si image, redimentsionnement de la hauteur
        			if( settings.image ) dynamic_height = dynamic_width * dynamic_height / oldwidth;
        		}
        		// Setting maxHeight
        		if( settings.maxHeight ) {
        			var oldheight = dynamic_height;
        			maxHeight = (/%/.test(settings.maxHeight)) ? parseInt(settings.maxHeight)/100 * wheight : parseInt(settings.maxHeight);
        			dynamic_height = dynamic_height <= maxHeight ? dynamic_height : maxHeight;
        			// si image, redimentsionnement de la hauteur
        			if( settings.image ) dynamic_width = dynamic_height * dynamic_width / oldheight;
        		}
        		dynamic_width = Math.round(dynamic_width);
        		dynamic_height = Math.round(dynamic_height);

        		var top = wheight/2 - dynamic_height/2;
        		if( dynamic_height > wheight ) top = 200;
        		var left = - dynamic_width/2;
        		$koverlaybox.css({
        			"top": $(window).scrollTop() + wheight/2
        		});
        		$koverlaybox.css({
        			"position" : "absolute",
        			"width":dynamic_width,
        			"height":dynamic_height,
        			"left":"50%",
        			"margin-left": left,
        			"top": $(window).scrollTop() + top
        		});
        		// FIX: pour les hauteurs trait blanc
        		if( settings.height === false ) {
        			$koverlaybox.css("height","auto");
        		}

        		if( callback ) {
        			setTimeout( callback , 400 );
        		}

	        }

	        // Resize
	        $(window).resize( function() {
	        	adaptToScreen();
	        } );

	        // Mode galerie
	        if( settings.image && settings.gallery ) {
	        	// Récupération de l'index de l'image courante de la galerie
	        	var listFrames = [];
	        	var index = 0;        	
	        	$(settings.gallery).each( function(i) {
	        		var src = $(this).attr("src");
	        		if( src ) {
	        			listFrames.push( [$(this).get(0).tagName , $(this).attr("src"), $(this).attr("alt")] );
	        			if( settings.image == src || settings.iframe == src ) index = i;
	        		}
	        	});
	        	// Préchargement des images
	        	for( var i=0; i<listFrames.length-1 ; i++ ) {
	        		if( listFrames[i][0] == "IMG" ) {
	        			var tmp = new Image();
	        			tmp.src = listFrames[i][1];
	        		}
	        	}
	        	// Création du DOM
	        	$koverlaybox.addClass( "kovergallery" );
	        	$koverlaybox.append( "<span class='gallery_next'></span>" );
	        	$koverlaybox.append( "<span class='gallery_prev'></span>" );

	        	var updateArrows = function() {
	        		$(".gallery_prev, .gallery_next",$koverlaybox).removeClass("hidden");
	        		if( index == 0 ) $(".gallery_prev",$koverlaybox).addClass("hidden");
	        		if( index == listFrames.length-1 ) $(".gallery_next",$koverlaybox).addClass("hidden");
	        	}
	        	var gallery_loading = false;
	        	var actionClick = function( new_index ) {
	        		if( gallery_loading ) return;
	        		if( new_index < 0 || new_index > listFrames.length-1 ) return;
	        		gallery_loading = true;
	        		index = new_index;
	        		// Suppression du contenu actuel
	        		$koverlaybox.removeClass("visible");
	        		setTimeout( function() {
		        		// Chargement du nouveau contenu
		        		var new_settings = settings;
		        		new_settings.gallery = false;
		        		new_settings.imageLegend = listFrames[new_index][2];
		        		if( listFrames[new_index][0] == "IMG" ) new_settings.image = listFrames[new_index][1];
		        		if( listFrames[new_index][0] == "IFRAME" ) new_settings.iframe = listFrames[new_index][1];
		        		loadNewContent( new_settings );
		        		updateArrows();
		        		gallery_loading = false;
	        		} , 500 );
	        	}

	        	// Arrows click
	        	$(".gallery_prev",$koverlaybox).click( function() {
	        		actionClick( index-1 );
	        	});
	        	$(".gallery_next",$koverlaybox).click( function() {
	        		actionClick( index+1 );
	        	});
	        	// Arrows keyboard
	        	$(document).keydown(function(e) {
				    if( e.keyCode == 37 ) actionClick( index-1 );
				    if( e.keyCode == 39 ) actionClick( index+1 );
				});

	        }
	        
	    }

	});
    
}(jQuery) );


function alertt( message ) {    
	$.kover({}, message );
}

function confirmm( message , callback, ok , nok ) {    
	$.kover({
		confirmbox:true,
		maxWidth: "600px",
		onValid: function() {
			if( callback ) callback();
		},
		textOk: ok,
		textCancel: nok
	}, message );
}