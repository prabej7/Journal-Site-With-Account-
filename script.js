let heading = document.querySelector('h1');



window.addEventListener('scroll',()=>{
    if(window.pageYOffset>325){
        heading.setAttribute('class','color');
    }else if(window.pageYOffset<325){
        heading.setAttribute('class','colr');
    }
});