var MtopProxy = require( '../lib/plugins/mtop' );
var HttpProxy = require( '../lib/plugins/http' );

var cookie = "cna=KcVJCxpk1XkCAX136Nv5aaC4; lzstat_uv=16278696413116954092|2511607@2511780@2738597@3258521@878758@2735853@2735859@2735862@2735864@2341454@2868200@2898598@1296239@2225939@3152682@1813784; miid=3882702882102873773; ali_ab=42.120.74.193.1395041649126.7; x=e%3D1%26p%3D*%26s%3D0%26c%3D0%26f%3D0%26g%3D0%26t%3D0%26__ll%3D-1%26_ato%3D0; _m_h5_tk=f55ea8cfa2289e16c2ba8c5c6a623184_1399646930871; _m_h5_tk_enc=451c33b1688ea1513f590aa7aa1d34ca; ck1=; v=0; existShop=MTM5OTY1MDE3NQ%3D%3D; lgc=nodejs; tracknick=nodejs; sg=s25; t=e8bd0dbbf4bdb8f3704a1974b8a166b5; _cc_=Vq8l%2BKCLiw%3D%3D; tg=0; _l_g_=Ug%3D%3D; _nk_=nodejs; mt=cp=0&ci=0_1&cyk=0_0; l=nodejs::1399653776581::11; uc1=lltime=1399643198&cookie14=UoLVbEKcZc0mAw%3D%3D&existShop=false&cookie16=VFC%2FuZ9az08KUQ56dCrZDlbNdA%3D%3D&cookie21=URm48syIYn73&tag=2&cookie15=U%2BGCWk%2F75gdr5Q%3D%3D";

HttpProxy.init( {} );
MtopProxy.init( {} );

var opt =  {
	api: 'com.taobao.detail.getTaobaoDyn',
	v: '1.0',
	dataType: 'json',
    status: 'prod',
    engine: 'river-mock',
    isCookieNeeded: true
};

opt = MtopProxy.verify( opt );

var proxy = new MtopProxy( opt );

proxy.requestReal( 
	{"itemNumId": "37194529489"}
	, function( data ) {
		console.log( data );
	}, function( err ) {
		console.log( err );
	}, cookie );

