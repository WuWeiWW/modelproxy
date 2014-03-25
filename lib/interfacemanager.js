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
    /* {
        "name": "获取购物车信息",   // 接口描述，选填。生成文档时有用
        "id": "cart.getCart",   // 接口ID，必须为英文单词+点号祖冲， 必填 全局唯一
        "urls": {             // url集合 如果ruleFile不存在, 则必须有一个地址存在
          "online": "http://url1",  // 线上地址
          "prep": "http://url2",    // 预发地址
          "daily": "http://url3",   // 日常地址
        },
        "status": "online",         // 当前状态 可以是urls中的某个键值(online, prep, daily)或者 mock
        "ruleFile": "cart.getCart.rule.json",   // 对应的数据规则文件，当Proxy Mock状态开启时回返回mock数据，
                                                // 不配置时默认为id + ".rule.json"
        "isRuleStatic": true,   // 数据规则文件是否为静态，即在开启mock状态时，程序会将ruleFile按照静态文件读取
                                // 而非解析该规则文件生成数据，默认为false
        "method": "post",       // 请求方式 默认get
        "dataType": "json",     // 返回的数据格式, json | text, 默认为json
        "isCookieNeeded": true, // 是否需要传递cookie 默认false
        "signed": false,        // 是否需要签名  默认false
        "timeout": 5000         // 延时设置  默认10000,
        ""
        // "filter": ...
    }, */
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