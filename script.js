/* -----Table of Contents----- */
/* 
    1.Constants
    2. getNavigationDirection
    3. exitPage
    4. enterPage
    5. DOMcontentLoaded
        5a) Navigation (clicks)
        5b) Mobile burger menu
        5c) Scroll: navbar and parallax
        5d) Resize and wheel
        5e) Overflow unlock after trans
    6. initCursorTracking (aboutMe)
    7. initPopups (aboutMe)
    8. Content form
    9. ApplyingContent 
    10. lighbox system (zoomable images)

*/

// ------Constants-------

const PAGE_ORDER = [
    'main.html',
    'aboutMe.html',
    'repository.html',
    'contactMe.html'
]; 
// array in left to right order
// higher -> exit left/ enter from right 
// lower -> exit right/ enter from left

const TRANS_DUR= 500;// ms to match my css :)

/* ---------------------------
Name: getNavigationDirection
Param: 
    currentPage - the current page filename
    targetPage - the destination page filename
Returns: 'forward' if going forwards, 'backward' if going backwards
Desc: Determines the navigation direction for page transitions
----------------------------*/

function getNavigationDirection(currentPage, targetPage) {
    
        // Array defining page order for navigation transitions
    
    const currentIndex = PAGE_ORDER.indexOf(currentPage); 
        // Find index of current page in the order array (-1 if not found)
    const targetIndex = PAGE_ORDER.indexOf(targetPage); 
    
    if(currentIndex === -1 || targetIndex === -1) return 'forward'; 
    
    return targetIndex > currentIndex ? 'forward' : 'backward';
    
    
}

/* ---------------------------
Name: exitPage
Param:  
    direct - 'forward' or 'backward'
Desc: Exits the current page by sliding it out to the side
----------------------------*/
function exitPage(direct){
    const translateX= direct ===
        'forward' ? 'translateX(-100%)' : 'translateX(100%)';
    const transition = 
        `transform ${TRANS_DUR}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    const parallax = document.querySelector('.parallax-container');
    const main = document.querySelector('main') || 
        document.querySelector('.page-background') ||
        document.querySelector('.main-container');

    const optionsList = document.querySelector('.options-list');
    const els = [parallax, main, optionsList].filter(Boolean);

    els.forEach(el => {
        el.style.transition = transition;
        el.style.transform = `translateX(${translateX})`;
    });
    // this slides main out if its not a parallax scroll
}


/* ---------------------------
Name: enterPage
Param:  
    direct - 'forward' or 'backward'
Desc: Enters the next page by sliding it in from the side
----------------------------*/
function enterPage(){
    const injected= document.getElementById(
        '__page-enter-start');

    if (injected) injected.remove();
    
    const direction = sessionStorage.getItem('navDirection') || 'forward';
    const startX = direction === 'forward' ? 'translateX(100%)' : 'translateX(-100%)';
    const transition =
        `transform ${TRANS_DUR}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    const parallax = document.querySelector('.parallax-container');
    const main= document.querySelector('main') || 
        document.querySelector('.page-background') ||
        document.querySelector('.main-container');
    
    const optionsList = document.querySelector('.options-list');
    const els = [parallax, main, optionsList].filter(Boolean);

    els.forEach(el => {
        el.style.transition = 'none';
        el.style.transform = startX;
    });

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            els.forEach(el => {
                el.style.transition = transition;
                el.style.transform = 'translateX(0)';
            });
        });
    });

    const pageCube = document.querySelector('.page-cube');
    if (pageCube) pageCube.classList.add('animate-in');

    setTimeout(() =>{
        els.forEach(el => {
            el.style.transition= '';
            el.style.transform= '';
        });
        sessionStorage.removeItem('navDirection');
    }, TRANS_DUR);
        
    
}



// ----------------------------
// DOMcontentLoaded
// ----------------------------


/* ---------------------------
Name: DOMcontentLoaded
Param: none
Returns: none
Desc: Executes code when the DOM is fully loaded,
      ensuring all HTML elements are available
      before attempting to access them
----------------------------*/
document.addEventListener('DOMContentLoaded', () => {

    applyContent();


    document.body.style.overflow = 'hidden';
        // prevents scrolling during enter trans 

    enterPage();
        // run the enter animation
    
    setTimeout(() => {
        document.body.style.overflow = '';
    }, TRANS_DUR +50);
    // unlocks scroll after transition






// ------------------Navigation click handler


    document.querySelectorAll(
        '.nav-links a, .option-link').forEach(link => {
        
            link.addEventListener('click', function(e) {

                const href = this.getAttribute('href');
                if (!href || href.startsWith('#')) return; 
                    // Skip processing if the link is an anchor link (starts with #)
                
                e.preventDefault(); 

                if (document.body.dataset.navigating) return;
                document.body.dataset.navigating = 'true';
                
                

                const rawPath = window.location.pathname.split('/').pop();
                const currentPage= (rawPath && rawPath.includes('.html')) ? rawPath : 'main.html';

                const targetUrl = href.split('/').pop();
                const direction = getNavigationDirection(currentPage, targetUrl);

                sessionStorage.setItem('navDirection', direction);
                    // Store the navigation direction for the transition
                
                const translateX= direction === 'forward' ?
                    'translateX(-100%)' : 'translateX(100%)';
                const transition = 
                    `transform ${TRANS_DUR}ms cubic-bezier(0.4, 0, 0.2, 1)`;
                const parallax = document.querySelector('.parallax-container');
                const main = document.querySelector('main') || 
                    document.querySelector('.page-background') ||
                    document.querySelector('.main-container');

                const optionsList = document.querySelector('.options-list');
                const els = [parallax, main, optionsList].filter(Boolean);

                els.forEach(el => {
                    el.style.transition = transition;
                    el.style.transform = translateX;
                });

                setTimeout(()=> {
                    window.location.href = href;

                }, TRANS_DUR +50);
            });
        });
    


// ---------------- Mobile burger menu

    const burger = document.getElementById('burger');
    const mobileNav = document.getElementById('mobile-nav');


    if (burger && mobileNav){
        burger.addEventListener('click', () => {
            const isOpen= mobileNav.classList.toggle('open')
            
            burger.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

            mobileNav.querySelectorAll('a').forEach(link => {
                // this is so taht when you click a link in the mobile menu
                // it closes menue but also does teh transition like normal menu links 
                link.addEventListener('click', (e) => {

                    const href = link.getAttribute('href');
                    if (!href || href.startsWith('#')) return; 
                        // dont do it if # is start
                    e.preventDefault();

                    mobileNav.classList.remove('open');
                    burger.classList.remove('open');
                    document.body.style.overflow = '';

                    const currentPage = window.location.pathname.split('/').pop() || 'main.html';
                    const targetUrl = href.split('/').pop();
                    const direction = getNavigationDirection(currentPage, targetUrl);

                    sessionStorage.setItem('navDirection', direction);
                    
                    setTimeout(() => {
                        window.location.href = href;
                    }, TRANS_DUR +50);
            });
        });
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && mobileNav.classList.contains('open')) {
                    mobileNav.classList.remove('open');
                    burger.classList.remove('open');
                    document.body.style.overflow = '';
                }
            });
    }


// --------------- Scroll: navbar visibility + parallax


const navbar = document.querySelector('.navbar');
const backgroundOverlay = document.querySelector('.background-overlay');
const scrollIndicator = document.querySelector('.scroll-indicator');
const welcomeSection = document.querySelector('.welcome-section');
const optionsList = document.querySelector('.options-list');
const parallaxBg = document.querySelector('.parallax-bg');
const treeLeft = document.querySelector('.tree-left');
const treeRight = document.querySelector('.tree-right');
const frog = document.querySelector('.frog');
const mushroom = document.querySelector('.mushroom');
const leftStar = document.querySelector('.left-star');
const rightStar = document.querySelector('.right-star');
const centerStar = document.querySelector('.center-star');

const isMainPage = !!document.querySelector(
    'body:not(.about-page):not(.contact-page):not(.repos-page)');
const isReposPage = !!document.querySelector('body.repos-page');

const SCROLL_THRESHOLD = 0.25;


/* ---------------------------
    Name: checkScroll
    Desc: Checks scroll position and updates element visibility
----------------------------*/
    
    function checkScroll() {
        const currentScroll = window.pageYOffset; 
            // gets the current scroll position
        
        const maxScroll = 
            document.documentElement.scrollHeight - window.innerHeight;
            // gets the maximum possible scroll distance

        const scrollPercent = maxScroll >0 ? Math.min(currentScroll / maxScroll, 1) : 0;
            // calculates scroll percentage
        
        if (navbar) {
               navbar.classList.toggle('visible', scrollPercent > SCROLL_THRESHOLD);
        }

        
        if (backgroundOverlay) {
            backgroundOverlay.classList.toggle('visible', currentScroll > 50);
        }

    }



/* ---------------------------
    Name: handleParallax
    Desc: Handles parallax effect on scroll for different pages
----------------------------*/
    function handleParallax(){
        const scrolled = window.pageYOffset;
        const maxScroll = 
            document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = maxScroll >0 ? Math.min(scrolled / maxScroll, 1) : 0;


        if (scrollIndicator){
            scrollIndicator.classList.toggle('hidden', scrollPercent >0.2);
        } 
        // for scroll indicator


        if (welcomeSection){
            welcomeSection.style.opacity= Math.max(0,1-scrollPercent *2);
            welcomeSection.style.display= scrollPercent >0.5 ? 'none' : '';
        }
        // for welcome section

        if (optionsList && isMainPage){
            optionsList.classList.toggle('visible', scrollPercent > 0.85);
        }
        if (!parallaxBg || !treeRight || !treeLeft) return;
        // for options list

        
        const tentBaseScale= 3;
        const tentMaxScale = Math.max(tentBaseScale, (
            window.innerWidth *2.0)/ (
                parallaxBg.offsetWidth || 1));
        const tentScale = tentBaseScale + (
            tentMaxScale - tentBaseScale) * scrollPercent;
        const tentZ = -100 + (1800) * scrollPercent;

        parallaxBg.style.transformOrigin = '50% 65%';
        parallaxBg.style.transform= 
            `translate(-50%,-40%) translateZ(${tentZ}px) scale(${tentScale})`;
        // for tent section

        const treeBaseScale= 1.5;
        const treeMaxScale = (window.innerWidth *1.2)/ (treeLeft.offsetWidth || 1);
        const treeScale = treeBaseScale + (treeMaxScale - treeBaseScale) * scrollPercent;
        const treeZ = -200 +200 *scrollPercent;

        if (isMainPage){
            const treeLeftX = -(scrollPercent * 100);
            const treeRightX = (scrollPercent * 100);
            const treeY = -10 + scrollPercent * 50;

            treeLeft.style.transform= 
                `translateX(${treeLeftX}%) translateY(${treeY}%) translateZ(${treeZ}px) scale(${treeScale})`;
            treeRight.style.transform= 
                `translateX(${treeRightX}%) translateY(${treeY}%) translateZ(${treeZ}px) scale(${treeScale}) scaleX(-1)`;
        }
        // for trees



        if(frog && mushroom){
            const decorationScale = 1.5 + scrollPercent *2.5;
            const decorationY= 70+ scrollPercent *500;
            const frogX= -30 - scrollPercent * 1500;
            const mushroomX= 30 + scrollPercent * 1500;

            frog.style.transform= 
                `translateX(${frogX}%) translateY(${decorationY}%) scale(${decorationScale})`;
            mushroom.style.transform= 
                `translateX(${mushroomX}%) translateY(${decorationY}%) scale(${decorationScale})`;
        }

        if (leftStar && centerStar && rightStar){
            const starScale = 1 + scrollPercent * 5;
            const starZ = -150 + scrollPercent * 2000;

            leftStar.style.transform= 
                `translateX(${20 - scrollPercent * 1000}%) translateY(${10 + scrollPercent *200}%) translateZ(${starZ}px) scale(${starScale})`;
            centerStar.style.transform= 
                `translateX(-50%) translateY(${5-scrollPercent *1000}%) translateZ(${starZ}px) scale(${starScale})`;
            rightStar.style.transform= 
                `translateX(${-120 + scrollPercent*1000}%) translateY(${10 + scrollPercent *200}%) translateZ(${starZ}px) scale(${starScale})`;
        }

    }

    checkScroll();
    handleParallax();

    window.addEventListener('scroll', () => {
        checkScroll();
        handleParallax();
    });
    window.addEventListener('resize', () => {
        checkScroll();
        handleParallax();
    })
    window.addEventListener('wheel', () => {
        checkScroll();
        handleParallax();
    });

    // this is so that once on load then every scroll/resize the parallax is reset

    setTimeout(() => {
        window.scrollTo(0, 0);
        checkScroll();
        handleParallax();
    }, 100);

    // it ensures that its at the top after short delay




// ---------------------------Back Button



    window.addEventListener('popstate', () => {
        const prevDirection = sessionStorage.getItem('navDirection')=== 'forward' ? 'backward' : 'forward';

        sessionStorage.setItem('navDirection', prevDirection);
        
        window.location.reload();
    });


// ---------------------------Cleaning up transstate before page unload

    window.addEventListener('beforeunload', () => {
        const parallax = document.querySelector('.parallax-container');
        const main = document.querySelector('main') ||
            document.querySelector('.page-background');
        
        [parallax, main].forEach (el => {
            if(el){
                el.style.transition = '';
                el.style.transform = '';
            }
        });
    });

// ---------------------------Initializ page spec feats

    initCursorTracking();
    initPopups();
});



/* ---------------------------
Name: initCursorTracking  
Desc: This is for drawing a animated line 
      from frogs mouth to the cursor when clicked
----------------------------*/
function initCursorTracking() {
    const aboutPage = document.querySelector('body.about-page');
    if (!aboutPage) return;

    const pageCube= aboutPage.querySelector('.page-cube');
    if (!pageCube) return;

    pageCube.addEventListener('click', (e)=> {
        const rect = pageCube.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = rect.width - x -60;
        const dy = rect.height - y -40;

        let angle= -Math.atan2(dy, dx) * (180 / Math.PI);

        angle = -(90+angle);
        const length = Math.sqrt(dx *dx +dy *dy);

        const track = document.createElement('div');
        track.classList.add('cursor-track');
        track.style.setProperty('--track-length', `${length}px`);

        track.style.setProperty('--angle', `${angle}deg`);
        track.style.transform= `rotate(${angle}deg)`;
        track.style.height = `${length}px`;

        pageCube.appendChild(track);
        setTimeout(() => {
            track.remove();
        }, 500);
    });


}


/* ---------------------------
Name: initPopups  
Desc: clicking a pages h2 opens the floating popup with the full content
----------------------------*/
function initPopups() {

    const aboutPage = document.querySelector('body.about-page');
    if (!aboutPage) return;

    const popupOverlay = Object.assign(document.createElement('div'), {
        className: 'popup-overlay'
    });

    const popupBox = Object.assign(document.createElement('div'), {
        className: 'popup-box'
    });
    
    const popupContent = Object.assign(document.createElement('div'), {
        className: 'popup-content'
    });
    const closeButton = Object.assign(document.createElement('button'), {
        className: 'popup-close',innerHTML: 'x'
    });

    popupBox.appendChild(closeButton);
    popupBox.appendChild(popupContent);
    document.body.appendChild(popupOverlay);
    document.body.appendChild(popupBox);

    document.querySelectorAll('.page-section h2').forEach(title => {
        title.addEventListener('click', () => {
            const section = title.closest('.page-section');
            popupContent.innerHTML = section.innerHTML;
            // const rect = title.getBoundingClientRect();
            // const scrollTop= window.pageYOffset || document.documentElement.scrollTop;

            // popupBox.style.top = `${rect.top + scrollTop}px`;
            // popupBox.style.left = `${rect.left - 50}px`;

            popupBox.style.position= 'fixed';
            popupBox.style.top= '50%';
            popupBox.style.left= '50%';
            popupBox.style.transform= 'translate(-50%, -50%)';
            popupBox.style.maxHeight= '80vh';
            popupBox.style.overflowY= 'auto';
            
            popupOverlay.classList.add('active');
            popupBox.classList.add('active');

            
        });
    });



// ---------------------------closing the popup


    /* ---------------------------
    Name: closePopup  
    Desc: closes the popup
    ----------------------------*/
    function closePopup() {
        popupOverlay.classList.remove('active');
        popupBox.classList.remove('active');
    }

    closeButton.addEventListener('click', closePopup);
    popupOverlay.addEventListener('click', closePopup);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closePopup();
    });
}

// -------------------------Contact Form section

document.addEventListener('DOMContentLoaded', ()=> {
    const form = document.getElementById('contactForm');
    const overlay = document.getElementById('thankYouOverlay');
    const thankYouBtn= document.getElementById('thankYouBtn');

    if (!form || !overlay || !thankYouBtn) return;

    form.addEventListener('submit', async (e)=> {
        e.preventDefault();
        try{

        const response = await fetch("https://formsubmit.co/ajax/mark-vandenbosch@hotmail.com", {
            method: form.method,
            body: new FormData(form),
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Form submission response:', data);
        console.log('Form submission status:', response.status);

        if (response.ok) {
            form.reset();
            overlay.classList.add('active');
        }
        else{
            alert('There was an error submitting the form. Please try again later.');
        }
    } catch (error) {
        alert('Network error. Please check your connection and try again.');
    }
    

    });

    thankYouBtn.addEventListener('click', () => {
        overlay.classList.remove('active');
        form.reset();
    });
});
// --------------------------- Applying content into all pages
/* ---------------------------
Name: applyContent
Desc: reads data-i18n attributes and fills in text from CONTENT object
      you have to put the content in the CONTENT object then its Content.__.__
----------------------------*/
function applyContent() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        const value = key.split('.').reduce((obj,k)=>obj?.[k],CONTENT);
        
        if (Array.isArray(value)){
            const ul = document.createElement('ul');
            ul.style.paddingLeft= '1.2rem';
            ul.style.margin= '0.5rem 0';
            value.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                ul.appendChild(li);
            });
            element.appendChild(ul);
        }else if(value){
            element.textContent = value;
        }
    });
}



// --------------------------- Image lightbox system (zoomable images)
const lightbox= document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightbox-image');
const lightboxClose = document.getElementById('lightbox-close');

document.querySelectorAll('img.zoomable').forEach(img => {
    img.style.cursor= 'zoom-in';
    img.addEventListener('click', () => {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.classList.add('active');
    });
});

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) lightbox.classList.remove('active');
});
lightboxClose.addEventListener('click', () => {
    lightbox.classList.remove('active');
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.classList.remove('active');
});

