console.log( 'js/puregeek.js loaded' );

const whenDOMready = ( func ) => {
  switch( (document.readyState + '' ) ) {
    case "complete"  :
    case "loaded"  :
    case "interactive"  :
      func();
      break;
    default :
      window.addEventListener( 'DOMContentLoaded', function( e ) { func(); } );
  }
};

whenDOMready( () => {
  console.log( 'puregeek DOM ready' );
});
