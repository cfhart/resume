
//clock js 
document.addEventListener('DOMContentLoaded', function() {
    
    function updateClock() {
        const clockElement = document.getElementById('clock');
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // The hour '0' should be '12'
        const minutesStr = minutes < 10 ? '0' + minutes : minutes;
        const timeString = hours + ':' + minutesStr + ' ' + ampm;
        clockElement.textContent = timeString;
    }
    
    setInterval(updateClock, 1000); // Update the clock every second
    updateClock(); // Initial call to set the clock immediately
    const icons = document.querySelectorAll('.icon');
    const modals = document.querySelectorAll('.modal');
    const closeButtons = document.querySelectorAll('.close');
    const minimizeButtons = document.querySelectorAll('.minimize');
    const fullScreenButtons = document.querySelectorAll('.full-screen');
    const modalContent = document.querySelectorAll('.modal-content')

    const footerTabs = document.getElementById('footer-tabs');
    let activeIcon = null; // To track the currently active icon
    let activeTab = null; // To track the currently active tab
    let activeModal = null; // To track the currently active modal
    let modalPositions = {}; // To track the positions of minimized modals
    let minimizedModals = new Set(); // To track minimized modals
    let fullScreenTabs = new Set();
    let currentIcon = null; 

    const aboutMeIcon = icons[0];
    aboutMeIcon.classList.add('active');
    aboutMeIcon.querySelector('img').style.filter = 'hue-rotate(360deg) saturate(2) brightness(0.6)';
    activeIcon = aboutMeIcon;
    currentIcon = aboutMeIcon;
    activeModal = modals[0]; bringToFront(activeModal); activeModal.style.display = "block"; 
    if (!isTabOpen(0)) {
        addFooterTab(aboutMeIcon, 0);
    } 
    setActiveTab(0);
    //for each icon, open the modal 

    //what should happen:
    //clicking an icon opens it (ONE click opens)
    //should at the same time hightlight it 
    //when a new icon is presssed, turn off filter on previous icon
    //and repeat the same steps
    icons.forEach((icon, index) => {
        icon.addEventListener('click', function(event) {
            // Click on a new icon: Highlight it and open modal
            if (activeIcon && activeIcon !== this) {
                // Remove active state from the previously active icon
                activeIcon.classList.remove('active');
                activeIcon.querySelector('img').style.filter = ''; // Remove filter
            }
    
            // Highlight the clicked icon
            this.classList.add('active');
            this.querySelector('img').style.filter = 'hue-rotate(360deg) saturate(2) brightness(0.6)';
            activeIcon = this;
            currentIcon = this;
    
            // Update active modal and bring it to the front
            activeModal = modals[index];
            bringToFront(activeModal);
    
            // Open the modal and bring it to the front
            if (activeModal) {
                activeModal.style.display = "block";
                bringToFront(activeModal);
            }
    
            // Add tab to footer if it's not already open
            if (!isTabOpen(index)) {
                addFooterTab(icon, index);
            }
    
            // Update active tab
            setActiveTab(index);
    
            // Prevent the event from bubbling up to the document
            event.stopPropagation();
        });
    });
    
    

    // Minimize button functionality
    minimizeButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const modal = modals[index];
            if (modal.style.display === 'block') {
                // Save the modal position
                modalPositions[index] = {
                    left: modal.style.left || '0px',
                    top: modal.style.top || '0px'
                };
                // Hide the modal and remove the filter from the tab
                modal.style.display = 'none';
                minimizedModals.add(index);
                if (activeTab && activeTab.dataset.index == index) {
                    activeTab.style.filter = ''; // Remove filter from the active tab
                    activeTab = null;
                }
                activeModal = null;
            }
        });
    });

    // full screen button functionality
    fullScreenButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const modal = modals[index];
            const content = modal.querySelector('.modal-content')

            if(fullScreenTabs.has(index)) {
                //if currently full screened
                modal.classList.remove('fixed');
                modal.style.width = '60%';
                fullScreenTabs.delete(index);
            }
            else {
                const parentHeight = modal.parentElement.offsetHeight; 
                modal.style.height = (parentHeight - 40) + "px";
                modal.classList.add('fixed');
                modal.style.width = '100%';
                fullScreenTabs.add(index);
            }
        });
    });

    // Restore modal when tab or icon is clicked
    function restoreModal(index) {
        const modal = modals[index];
        if (modalPositions[index]) {
            modal.style.left = modalPositions[index].left || '0px';
            modal.style.top = modalPositions[index].top || '0px';
        }
        modal.style.display = 'block';
        bringToFront(modal);
        minimizedModals.delete(index); // Remove from minimized set
        if (!isTabOpen(index)) {
            addFooterTab(icons[index], index);
        }
    }

    function addFooterTab(icon, index) {
        const tab = document.createElement('div');
        tab.classList.add('footer-tab');
        tab.dataset.index = index;
        
        const img = document.createElement('img');
        img.src = icon.querySelector('img').src;

        const name = document.createElement('span');
        name.textContent = icon.dataset.name; // Assuming the icon has a data-name attribute
        
        tab.appendChild(img);
        tab.appendChild(name);
        footerTabs.appendChild(tab);

        tab.addEventListener('click', () => {
            restoreModal(index);
            if (activeTab) {
                activeTab.style.filter = ''; // Remove filter from the previously active tab
            }
            tab.style.filter = 'hue-rotate(360deg) saturate(2) brightness(0.6)';
            activeTab = tab;
        });
    }

    function removeFooterTab(index) {
        const tab = footerTabs.querySelector(`.footer-tab[data-index="${index}"]`);
        if (tab) {
            footerTabs.removeChild(tab);
            if (activeTab === tab) {
                activeTab = null; // Clear the activeTab if the removed tab was the active one
            }
        }
    }

    function isTabOpen(index) {
        return footerTabs.querySelector(`.footer-tab[data-index="${index}"]`) !== null;
    }

    function bringToFront(modal) {
        modals.forEach(m => {
            m.style.zIndex = '1';
        });
        modal.style.zIndex = '1000';
    }

    function setActiveTab(index) {
        if (activeTab) {
            activeTab.style.filter = ''; // Remove filter from the previously active tab
        }
        const tab = footerTabs.querySelector(`.footer-tab[data-index="${index}"]`);
        if (tab) {
            tab.style.filter = 'hue-rotate(360deg) saturate(2) brightness(0.6)';
            activeTab = tab;
        }
    }

    // Modal close functionality
    closeButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            const modal = modals[index];
            modal.style.display = "none";
            removeFooterTab(index);
            minimizedModals.delete(index); // Remove from minimized set
        });
    });

    // Close modal when clicking outside of it
    window.addEventListener('click', function(event) {
        modals.forEach((modal, index) => {
            if (event.target == modal) {
                modal.style.display = "none";
                removeFooterTab(index);
                minimizedModals.delete(index); // Remove from minimized set
            }
        });
    });

    // Make modals draggable
    modals.forEach(modal => {
        const header = modal.querySelector('.modal-header');
        let isDragging = false;
        let offsetX, offsetY;

        header.addEventListener('mousedown', (e) => {
            isDragging = true;
            offsetX = e.clientX - modal.getBoundingClientRect().left;
            offsetY = e.clientY - modal.getBoundingClientRect().top;

            const modalIndex = Array.from(modals).indexOf(modal); if (fullScreenTabs.has(modalIndex)) { modal.style.width = '60%'; modal.classList.remove('fixed'); ullScreenTabs.delete(modalIndex); }

            e.preventDefault(); // Prevents text selection while dragging
        });

        window.addEventListener('mousemove', (e) => {
            if (isDragging) {
                modal.style.left = (e.clientX - offsetX) + 'px';
                modal.style.top = (e.clientY - offsetY) + 'px';
            }
        });

        window.addEventListener('mouseup', () => {
            isDragging = false;
        });

        modal.addEventListener('click', (e) => {
            if (activeModal !== modal) {
                // Only set the tab as active and bring the modal to the front if it's not minimized
                if (modal.style.display === 'block') {
                    setActiveTab(Array.from(modals).indexOf(modal));
                    activeModal = modal;
                    bringToFront(activeModal);
                }
            }
            e.stopPropagation();
        });
        

        
    });
});
