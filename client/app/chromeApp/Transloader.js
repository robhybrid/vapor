define(function(require){

  require('/bower_components/apps-resource-loader/lib/ral.min.js');
  console.log('RAL', RAL);
  function Transloader() {
    console.log('RAL', RAL);
   // RAL.RemoteResource();
  };

  return Object.freeze(Transloader);
});