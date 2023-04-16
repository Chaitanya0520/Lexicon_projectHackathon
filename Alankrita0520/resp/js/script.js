'use strict';

const navOpenbtn=document.querySelector("[data-nav-open-btn]");
const navbar=document.querySelector("[data-navbar]");
const navClosebtn=document.querySelector("[data-nav-close-btn]");
const overlay=document.querySelector("[data-overlay]");

const elemArr=[navClosebtn, overlay, navOpenbtn];

for(let i=0;i< elemArr.length; i++)
{
    elemArr[i].addEventListener("click", function(){
        navbar.classList.toggle("active");
        overlay.classList.toggle("active");
    });
}

const navbarLinks= document.querySelector("[data-navbar-link]");

for(let i=0;i< navbarLinks.length; i++)
{
    navbarLinks[i].addEventListener("click", function(){
        navbar.classList.toggle("active");
        overlay.classList.toggle("active");
    });
}