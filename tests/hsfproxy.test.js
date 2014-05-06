var java = require( 'js-to-java' );
var HsfProxy = require( '../lib/plugins/hsf' );

HsfProxy.init( { 
    status: 'daily',
    hsf: {
        "configServers": {
            "prod": "commonconfig.config-host.taobao.com",
            "daily": "10.232.16.8",          
            "prep": "172.23.226.84"
        }
    }
} );

var opt1 = {
    "version": "1.0.0.daily",
    "type": "hsf",
    "id": "UserData.append",
    "service": "com.taobao.item.service.ItemQueryService",
    "methodName": "queryItemForDetail",
    "method": "POST"
};
var opt2 = {
    "version": "1.0.0",
    "type": "hsf",
    "id": "UserData.getData",
    "service": "com.taobao.uic.common.service.userdata.UicDataService",
    "methodName": "getData",
    "method": "POST"
};

var p1 = new HsfProxy( opt1 );
var args = [];
args.push(java.long(1500006995808));
// args.push('data-info-userdata');
// args.push('gongyangyu');
// args.push('langneng');

p1.request( args, function( data ) {
    console.log( data );
}, function( err ) {
    // console.Error( 'ERROR:\n', err );
} );