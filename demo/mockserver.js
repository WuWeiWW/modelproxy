var express = require( 'express' );
var app = express();

app.post( '/post', function( req, res ) {
	var d = '';
	req.on( 'data', function( chunk ) {
		d += chunk;
	} );
	req.on( 'end', function() {
		console.log( d );
	} );
	res.send( 'This is the msg from mockserver!' );
} );

app.get( '/getData', function( req, res ) {
	setTimeout( function() {
		res.end( 'ok' );
	}, 2000 );
} );

app.listen( 3001 );

// // mock test
// var mocker = require( 'river-mock' );
// var fs = require('fs');
// var rule = fs.readFileSync( './interfaceRules/test.rule.json' );

// var schema = JSON.parse( rule );
// // console.log( schema );
// console.log( mocker.spec2mock( schema, 'response' ) );