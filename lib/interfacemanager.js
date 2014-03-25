var fs = require( 'fs' );

/**
 * InterfaceManager 
 * @param {String} path The file path of inteface configuration
 */
function InterfaceManager( path ) {
    // {Object} Interface Mapping, The key is interface id and 
    // the value is a json profile for this interface.
    this._interfaceMap = {};

    // {String} The path of rulebase where the interface rules is stored.
    this._rulebase = null;

    // {String} The mock engine name.
    this._engine = null;

    this._loadProfiles( path );
}

InterfaceManager.loadInterface = function( path ) {
    return this( path );
}

// InterfaceManager prototype
InterfaceManager.prototype = {

    // @throws errors
    _loadProfiles: function( path ) {
        console.info( 'Loading interface profiles.\nPath = ', path );

        try {
            var profiles = fs.readFileSync( path, { encoding: 'utf8' } );
        } catch ( e ) {
            throw new Error( 'Fail to load interface profiles.' + e );
        }
        try {
            profiles = JSON.parse( profiles );
        } catch( e ) {
            throw new Error( 'Interface profiles has syntax error:' + e );
        }
        console.info( 'Title:', profiles.title, 'Version:', profiles.version );

        this._rulebase = ( profiles.rulebase || './' ).replace(/\/$/, '');

        this._engine = profiles.engine || 'mockjs';

        var interfaces = profiles.interfaces || [];
        for ( var i = interfaces.length - 1; i >= 0; i-- ) {
            this._addProfile( interfaces[i] ) 
                && console.info( 'Interface[' + interfaces[i].id + '] is loaded' );
        }
    },
    getProfile: function( interfaceId ) {
        return this._interfaceMap[ interfaceId ];
    },
    // @throws errors
    getRule: function( interfaceId ) {
        if ( !interfaceId || !this._interfaceMap[ interfaceId ] ) {
            throw new Error( 'The interface profile ' + interfaceId + " is not found." );
        }
        path = this._interfaceMap[ interfaceId ].ruleFile;
        if ( !fs.existsSync( path ) ) {
            throw new Error( 'The rule file is not existed.\npath = ' + path );
        }
        try {
            var rulefile = fs.readFileSync( path, { encoding: 'utf8' } );
        } catch ( e ) {
            throw new Error( 'Fail to read rulefile of path ' + path );
        }
        try {
            return JSON.parse( rulefile );
        } catch( e ) {
            throw new Error( 'Rule file has syntax error. ' + e + '\npath=' + path );
        }
    },
    getEngine: function() {
        return this._engine;
    },

    // @return Array
    getInterfaceIdsByPrefix: function( pattern ) {
        if ( !pattern ) return [];
        var ids = [], map = this._interfaceMap, len = pattern.length;
        for ( var id in map ) {
            if ( id.slice( 0, len ) == pattern ) {
                ids.push( id );
            }
        }
        return ids;
    },

    isProfileExisted: function( interfaceId ) {
        return !!this._interfaceMap[ interfaceId ];
    },
    _addProfile: function( prof ) {
        if ( !prof || !prof.id ) {
            console.error( "Can not add interface profile without id!" );
            return false;
        }

        if ( !/^((\w+\.)*\w+)$/.test( prof.id ) ) {
            console.error( "Invalid id: " + prof.id );
            return false;
        }

        if ( this.isProfileExisted( prof.id ) ) {
            console.error( "Can not repeat to add interface [" + prof.id
                            + "]! Please check your interface configuration file!" );
            return false;
        }

        prof.ruleFile = this._rulebase + '/'
                         + ( prof.ruleFile || ( prof.id + ".rule.json" ) );

        if ( !this._isUrlsValid( prof.urls )
                && !fs.existsSync( prof.ruleFile )  ) {
            console.error( 'Profile is deprecated:\n', 
                prof, '\nNo urls is configured and No ruleFile is available' );
            return false;
        }
        prof.status         = prof.status in prof.urls 
                            ? prof.status : ( prof.status === 'mock' ? 'mock' : null ); 
        prof.method         = { POST: 'POST', GET:'GET' }
                            [ (prof.method || 'GET').toUpperCase() ];
        prof.dataType       = { json: 'json', text: 'text', jsonp: 'jsonp' }
                            [ (prof.dataType || 'json').toLowerCase() ];
        prof.isRuleStatic   = !!prof.isRuleStatic || false;
        prof.isCookieNeeded = !!prof.isCookieNeeded || false;
        prof.signed         = !!prof.signed || false;
        prof.timeout        = prof.timeout || 10000;

        // prof.currentUrl     = prof.
        // prof.filter         = ...
        this._interfaceMap[ prof.id ] = prof;
        return true;
    },
    _isUrlsValid: function( urls ) {
        if ( !urls ) return false;
        for ( var i in urls ) {
            return true;
        }
        return false;
    }
};
module.exports = InterfaceManager;