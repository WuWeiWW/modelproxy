var assert = require( 'assert' );

var InterfaceManager = require( '../lib/interfacemanager' );

describe( 'InterfaceManager', function() {
    it( 'can not be initalized by error path', function() {
        assert.throws( function() {
            new InterfaceManager( 'error/path' );
        }, function( err ) {
            if ( err.toString()
                    .indexOf( 'Fail to load interface profiles.Error' ) !== -1 ) {
                return true;
            }
            return false;
        } );

        var interfaceManager = new InterfaceManager( './interface_test.json' ); 
        assert.equal( interfaceManager instanceof InterfaceManager, true );
        
    } );
} );

describe( 'Interface', function() {
    var ifmgr = new InterfaceManager();
    
    it( 'id should match ^((\\w+\\.)*\\w+)$', function() {

        assert.equal( ifmgr._addProfile( {
            urls: {
                online: 'http://url1'
            }
        } ), false );

        assert.equal( ifmgr._addProfile( {
            id: 'Abc-methodName',
            urls: {
                online: 'http://url1'
            }
        } ), false );

        assert.equal( ifmgr._addProfile( {
            id: 'Abc.methodName.',
            urls: {
                online: 'http://url1'
            }
        } ), false );

        assert.equal( ifmgr._addProfile( {
            id: 'Abc.methodName',
            urls: {
                online: 'http://url1'
            }
        } ), true );

    } );

    it( 'id can not be duplicated', function() {
        assert.equal( ifmgr._addProfile( {
            id: 'Abc.methodName',
            urls: {
                online: 'htpp://url1'
            }
        } ), false );

        assert.equal( ifmgr._addProfile( {
            id: 'Abc.method1',
            urls: {
                online: 'htpp://url1'
            }
        } ), true );
    } );

    it( 'must have at least one url in urls or its rulefile is available', function() {
        ifmgr._rulebase = '.';

        assert.equal( ifmgr._addProfile( {
            id: 'Abc.method2',
            urls: {}
        } ), false );

        assert.equal( ifmgr._addProfile( {
            id: 'Abc.method2',
            ruleFile: 'unavailable.rule.json'
        } ), false );
    } );
} );