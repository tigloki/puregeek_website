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
  setTimeout( () => {
    console.log( 'first timeout' );
    window.scrollTo( 0, 30 );
    setTimeout( () => {
      console.log( 'second timeout - boomsie' );
      window.scrollTo(0, 1);
      window.document.body.classList.add( 'scrolled' );
      document.documentElement.classList.add( 'scrolled' );
    }, 1 );
  }, 250 );
});
