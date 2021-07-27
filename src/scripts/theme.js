console.log("Something brewing here");

//Load all modules
const modules = document.querySelectorAll('[data-module]');

modules.forEach(async el=> {
  const moduleName = el.getAttribute('data-module');
  import(
    /* webpackMode:"lazy" */ /* webpackPrefetch:true */ /* webpackChunkName:"module-[request]" */ `./modules/${moduleName}`
  )
    .then((classConstructor) => {
      new classConstructor(el);
    })
    .catch((err) => {
      console.error(err);
    });
})